# AGENTS.md: React Component Generator

## Operational Commands

All commands must be run with **bun** (not npm/yarn/pnpm):

- **Development:** `bun run dev` — Starts both API server (port 3002) and Vite frontend (port 5173)
- **Backend only:** `bun run server` — Runs API server in watch mode
- **Build:** `bun run build` — Compiles TypeScript and bundles frontend (output in dist/)
- **Testing:** `bun test` or `bun run test` — Runs Vitest suite (both server/ and src/components/)
- **Linting:** `bun run lint` — Runs ESLint (ESLint 9 + TypeScript ESLint 8)
- **Preview:** `bun run preview` — Serves built dist/ locally

Environment setup: Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` or `GOOGLE_API_KEY` (optional — can also be provided via UI).

## Golden Rules

### Hard Constraint: react-live Execution Model

**Rule:** All AI-generated code must run in `react-live` (noInline mode), which has strict requirements.

**Why:** The project generates React components at runtime without build steps. This imposes non-negotiable constraints on what code can execute.

**Specifics (from `server/index.ts:7-20` SYSTEM_PROMPT):**
- No `import`/`require` statements — React is a global
- Plain JavaScript only; no TypeScript syntax (no type annotations, interfaces, generics, `as` casts)
- Inline styles only (no CSS imports, no CSS modules)
- Must end with `render(<ComponentName />)` call
- Components must be self-contained functions

**Code enforcement:** `generator.ts:16-23` (`ensureRenderCall`) auto-injects `render()` if missing. `stripCodeFences()` removes markdown fences. If these don't run, the component will render as blank or error.

**For agents:** When generating or editing generated component code:
- Reject any proposed imports or TypeScript syntax.
- Verify `render()` call is present.
- Test inline styles only.
- Never suggest CSS modules or external dependencies for generated components.

### Security Boundary: API Key Exposure

**Rule:** Environment-variable API keys are server-only. Never expose them to the client. Client-provided keys override env keys only for one request.

**Why:** Leaking production API keys exposes all project resources and billing to attackers. See `server/index.ts:60-62, 150-153, 169`.

**Specifics:**
- `resolveApiKey()` (line 64-66): Merges env + client key with `clientKey || ENV_KEYS[provider] || null`.
- `/api/config` (line 150-153): Returns only boolean flags (`{ envKeys: { anthropic: bool, google: bool } }`), never the actual keys.
- Client receives key status, not key content. Must work without exposing secrets.

**For agents:** 
- All API key validation must happen in `server/index.ts`, never in frontend code.
- Frontend can only read presence (via `/api/config`), not content.
- If adding new providers, follow the same pattern: env + client override.

### Asymmetry: Google vs. Anthropic Model Strategy

**Rule:** Google Gemini uses model fallback; Anthropic Claude uses a single fixed model. Do not unify them.

**Why:** Gemini models historically have higher failure rates. Fallback list (`GOOGLE_MODELS` in `server/index.ts:5`) provides resilience; Claude is stable enough for a single model. This divergence is intentional. Past incident likely drove this design.

**Specifics:**
- Anthropic: `claude-haiku-4-5-20251001` (line 77), no fallback.
- Google: `['gemini-3.1-flash-lite', 'gemini-3.5-flash']` (line 5), ordered by preference. If first fails, second is tried.
- `withModelFallback()` (line 3, `fallback.ts`) loops models until success or all fail.

**For agents:**
- Do not replace Anthropic model with a fallback list.
- Do not remove the Google fallback list.
- If adding new models, maintain per-provider strategy, not one global list.

### Double Defense: Component Code Validation

**Rule:** All AI-generated code is validated twice: during generation (client hook) and after parsing (server). Both layers must pass.

**Why:** Relying on client-side validation alone allows malformed code to propagate if the LLM output is incomplete or corrupted. Redundancy catches edge cases. See `generator.ts:1-2` comment.

**Specifics:**
- `stripCodeFences()` (line 5-9): Removes markdown fences that LLM sometimes wraps code in.
- `ensureRenderCall()` (line 16-23): Detects and auto-injects `render()` if missing.
- Server applies both transformations on line 188: `ensureRenderCall(stripCodeFences(text))`.
- No step can be skipped or order changed.

**For agents:**
- When editing generated code paths, keep both transformations.
- Do not remove `stripCodeFences` or `ensureRenderCall` without understanding react-live constraints.
- Tests in `generator.test.ts` (lines 4-40) validate both; keep them passing.

### Test Boundary: Server-Only Unit Tests

**Rule:** Pure functions in `server/generator.ts` and `server/fallback.ts` are tested. Frontend components have minimal test coverage (only `PromptInput.test.tsx`).

**Why:** Server-side code transformations are pure (no side effects), so unit tests are reliable and cheap. Frontend behavior (state, API calls) is harder to test in isolation; snapshot/e2e testing is deferred. See `generator.ts:1-2`.

**Specifics:**
- `stripCodeFences`, `ensureRenderCall` (server/generator.test.ts): Full coverage via Vitest.
- `withModelFallback` (server/fallback.test.ts): Covers fallback logic (implicit, not visible here).
- `PromptInput.test.tsx`: Covers UI input and button state; no API/hook integration tests.
- Missing tests: `useComponentGenerator`, `App.tsx`, API error paths.

**For agents:**
- When modifying `server/generator.ts` or `server/fallback.ts`, update tests in lockstep.
- Frontend component refactors may not need new tests (current coverage is minimal).
- Integration/e2e testing (API → react-live render) is not yet in scope.

## Project Context

React component generator: Users submit natural-language prompts → AI generates React code → displayed live in `react-live` preview + copied to clipboard.

- **Tech Stack:** React 19, TypeScript, Vite (frontend); Bun runtime, Node.js API bindings (backend). AI via Anthropic Claude (haiku-4.5) or Google Gemini (fallback).
- **Core Flow:** UI → `/api/generate` (proxy) → Claude/Gemini → code cleanup → react-live render.
- **Live Preview:** `react-live` with `noInline=true` requires explicit `render()` call; constrains generated code.

## Standards & References

**Git & Commits:** Conventional Commits (feat, fix, refactor, test, docs) in Korean/English. Enforce via pre-commit hooks if available.

**TypeScript & Linting:**
- Target: ES2020+ (Vite default, `tsconfig.json`)
- ESLint 9 + `@typescript-eslint/eslint-plugin` 8.x
- `eslint.config.js` defines rules; run `bun run lint` before commit.

**Code Style:**
- Inline styles for generated components (no external CSS).
- React hooks for state (useState, useEffect).
- Component function, lowercase hooks, uppercase component names.

**Maintenance:** If code and AGENTS.md diverge (e.g., new constraints, changed models, refactored APIs), propose an update via PR. This file is the source of truth for agent behavior and must stay current.
