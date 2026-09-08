# server/AGENTS.md: Backend API & AI Integration

## Module Context

Backend proxy that bridges React frontend with AI providers (Anthropic Claude, Google Gemini). Transforms AI responses into `react-live`-compatible JavaScript and manages provider selection, fallback, error handling.

## Tech Stack & Constraints

- **Runtime:** Bun (built-in fetch, JSON parsing)
- **AI Providers:** Anthropic API (v1/messages), Google Generative Language API (beta)
- **HTTP:** Vanilla Bun.serve (no Express/Hono); CORS headers on all responses
- **Modules:** Pure functions only in `generator.ts` and `fallback.ts` (side-effect-free, testable)

## Implementation Patterns

**Endpoint patterns:**
- `/api/config` (GET) — Returns `{ envKeys: { anthropic: bool, google: bool } }`. Never expose key content.
- `/api/generate` (POST) — Accepts `{ prompt, apiKey?, provider }`. Returns `{ code }` or `{ error }`.
- All responses include `CORS_HEADERS` (line 51-55).

**Provider integration:**
- Each provider gets dedicated function (`callAnthropic`, `callGoogleModel`, `callGoogle`) that calls remote API.
- Response parsing differs per provider (see lines 88-95, 115-131).
- Error responses are provider-specific; normalize to user-friendly messages at line 194-206.

**Code cleanup pipeline:**
- AI response → `stripCodeFences()` → `ensureRenderCall()` (line 188).
- Both steps are mandatory; order cannot change (see `@AGENTS.md` Double Defense rule).

## Testing Strategy

**Tested (pure functions, full coverage):**
- `stripCodeFences()`: Removes markdown backticks (generator.test.ts:4-18)
- `ensureRenderCall()`: Injects/detects render() call (generator.test.ts:20-40)
- `withModelFallback()`: Fallback loop, retry logic (fallback.test.ts:4-42)

**Not tested:**
- `index.ts`: Server request/response handling (requires mocking Bun.serve or e2e testing)
- `callAnthropic()`, `callGoogleModel()`: Live API calls (avoided in unit tests due to rate limits, auth)

**Adding new tests:** Place in `server/*.test.ts`. Use Vitest (configured in root). Run `bun test`.

## Local Golden Rules

### Hard Constraint: Request/Response Contract

**Rule:** `/api/generate` payload and response format are fixed. Never add optional fields without versioning.

**Why:** Frontend and backend must agree on shape. Changing payload breaks existing clients; changing response breaks state assumptions in `useComponentGenerator`.

**Specifics (server/index.ts:159-181, 188-190):**
- **Request:** `{ prompt: string, apiKey?: string, provider?: 'anthropic' | 'google' }`
- **Response (success):** `{ code: string }`
- **Response (error):** `{ error: string }`
- **All responses:** Include `CORS_HEADERS`

**For agents:**
- If adding a field (e.g., `{ code, metadata }`), create new endpoint `/api/generate-v2` or add optional field and document fallback handling in frontend.
- Validate payload shape in `index.ts` before calling AI (lines 161-181).
- Error messages must be user-readable strings, not JSON objects or stack traces.

### Asymmetry: Per-Provider Model Strategy (Reinforced)

**Rule:** Google uses `withModelFallback()` with priority list; Anthropic does not. Divergence is intentional.

**Why:** See root `@AGENTS.md`. Gemini is less stable. Claude is production-grade with single model.

**Specifics (index.ts:5, 77, 134-136):**
- `GOOGLE_MODELS` (line 5): Ordered fallback list. First succeeds = done. All fail = throw last error.
- Anthropic: Hardcoded single model. No fallback array.
- If Gemini model is rate-limited, fallback activates automatically. No code change needed.

**For agents:**
- Do not add fallback to Anthropic (keep it single-model).
- Do not remove fallback from Google.
- When updating `GOOGLE_MODELS`, keep priority order (best first).
- If adding new model, follow same pattern: Gemini = multi-model with fallback, Anthropic = single.

### Double Defense: Error Handling Layers

**Rule:** Errors are caught and transformed at two layers: provider-level (fetch) and request-level (HTTP).

**Why:** Raw API errors are technical and unhelpful. Transforming at provider level makes debugging easier; request level provides last-resort user messaging.

**Specifics (index.ts:84-86, 101-110, 191-212):**
- **Layer 1 (fetch):** Each provider function throws if response.ok is false (lines 84-86, 111-113).
  - Anthropic: Check response.ok, throw `"Claude API error: {status}"`.
  - Google: Check response.ok, throw `"Gemini API error: {status}"` or `"생성된 코드가 너무 길어..."` (MAX_TOKENS).
- **Layer 2 (request):** `/api/generate` catch block (lines 191-212) examines error message and rewrites:
  - `"503"` in message → 503 response, user message `"API 서버가 일시적으로..."`
  - `"429"` in message → 429 response, user message `"요청이 너무 많습니다..."`
  - Else → 500 response, raw error message.

**For agents:**
- When adding new error types, handle at provider level, not just request level.
- Do not expose stack traces to client (only `.message`).
- Preserve Korean user messages for known errors (503, 429).
- Do not log API keys or full request bodies in error messages.

### Security Boundary: API Key Handling (Server Enforcement)

**Rule:** API keys are validated server-side. Client key overrides env key, but neither is exposed back to client.

**Why:** If env key is leaked in HTTP response, all traffic is compromised. See root `@AGENTS.md`.

**Specifics (index.ts:59-66, 150-153, 169-172):**
- `resolveApiKey()` (line 64-66): Merges `clientKey || ENV_KEYS[provider] || null`. Returns resolved key (string or null), never boolean.
- `/api/config` (line 150-153): Returns only presence flags (`{ envKeys: { anthropic: bool, google: bool } }`), never actual keys.
- `/api/generate` (line 169-172): If no key, error message says `"API key is required. Set ANTHROPIC_API_KEY in .env or..."` (naming env var is OK; actual value is secret).

**For agents:**
- Never log or return actual API keys.
- `/api/config` must always return booleans, not key snippets or partial values.
- Client-provided key is used only for one request, then discarded.
- If adding new secret (e.g., webhook URL), apply same pattern.

### Test Boundary: Unit Tests Only for Pure Functions

**Rule:** Test only pure functions in `server/generator.ts` and `server/fallback.ts`. Do not test `index.ts` endpoints.

**Why:** Pure functions are deterministic and isolated (no I/O, no state). Server endpoint testing requires mocking HTTP, Bun.serve, fetch, or running integration tests; unit tests are insufficient. See generator.ts:1-2.

**Specifics:**
- `generator.test.ts`: Tests `stripCodeFences`, `ensureRenderCall`. ~40 lines, full coverage.
- `fallback.test.ts`: Tests `withModelFallback` (success, fallback, all-fail, empty-list cases). ~40 lines.
- No tests: `callAnthropic`, `callGoogleModel`, route handlers.

**For agents:**
- When adding pure functions, add corresponding tests.
- Do not add endpoint tests here (defer to e2e).
- Keep tests fast and isolated (no real API calls).
- Run `bun test` before commit.
