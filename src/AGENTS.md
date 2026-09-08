# src/AGENTS.md: Frontend UI & Component State

## Module Context

React frontend for the component generator. Handles user input, provider selection, API key management, and live preview of generated components via `react-live`. No AI code generation logic here (server handles that).

## Tech Stack & Constraints

- **Framework:** React 19 + TypeScript (5.9)
- **Build tool:** Vite (dev server, production bundle)
- **Live preview:** `react-live` (executes AI-generated code in browser sandbox; constraints defined in root `@AGENTS.md`)
- **Styling:** CSS modules (App.css, component-specific .css files); no inline styles for UI components (contrast with generated components, which must use inline styles)
- **Testing:** Vitest + React Testing Library (`@testing-library/react`, `@testing-library/user-event`)

## Implementation Patterns

**Component hierarchy:**
- `App.tsx`: Root, provider/API key management, layout, component list state
- `PromptInput.tsx`: Textarea + submit button for prompt entry
- `ComponentCard.tsx`: Individual generated component display (preview + code view)
- `LivePreview.tsx`: Renders generated code via `react-live` with `noInline=true`
- `CodeView.tsx`: Code display + copy-to-clipboard button
- `useComponentGenerator.ts`: Hook for managing generated components state and API calls

**State management:**
- App-level: `apiKey`, `provider`, `envKeys`, component list (via hook)
- Hook-level (`useComponentGenerator`): `components`, `isLoading`, `error` (via `useState`)
- No Redux, Context API, or external state manager (keep it simple)

**API contract (with server):**
- `GET /api/config` → `{ envKeys: { anthropic: bool, google: bool } }`
- `POST /api/generate` → request `{ prompt, apiKey?, provider }`, response `{ code }` or `{ error }`
- See server/AGENTS.md for details.

## Testing Strategy

**Tested:**
- `PromptInput.test.tsx`: Input state, button enable/disable, onGenerate callback (3 tests)

**Not tested:**
- `useComponentGenerator.ts`: Hook logic, API calls, state mutations (complex, requires mocking)
- `App.tsx`, `ComponentCard.tsx`, `LivePreview.tsx`, `CodeView.tsx`: Component rendering and side effects
- Integration: Provider switching, error handling, multi-generation flow

**Why minimal coverage:** Unit testing React components with hooks and async logic requires deep mocking (fetch, timers, DOM). E2E testing (Playwright, Cypress) would be more valuable but is outside current scope. UI correctness is verified manually during dev (`bun run dev`).

**Adding tests:** Place in same folder as component, suffix `.test.tsx`. Use `@testing-library/react` and `@testing-library/user-event` for user interactions. Run `bun test`.

## Local Golden Rules

### Central Control: Provider Configuration (App.tsx Only)

**Rule:** Provider selection and API key management logic must live in `App.tsx` only. Other components receive `provider` and `apiKey` as props or via context, never manage them.

**Why:** Provider is app-global state (affects all API calls). Scattering selection logic across components causes sync issues (e.g., changing provider in one place, stale provider in another). Single source of truth = easier debugging.

**Specifics (App.tsx:8-44):**
- `PROVIDER_CONFIG` (line 8-11): Master config object. Providers, labels, placeholders all defined here.
- `provider` state (line 16): App-level, never passed down as mutable.
- `handleProviderChange` (line 41-44): Clears apiKey on provider switch (prevents key mismatch).
- Pass `provider` + `apiKey` to `handleGenerate` (line 38); `handleGenerate` passes to hook.

**For agents:**
- Do not create separate provider selection in child components.
- If adding new provider, add to `PROVIDER_CONFIG` and root `AGENTS.md` first.
- Provider state changes must trigger `apiKey` reset (line 43).

### Hard Constraint: No AI Code Generation in Frontend

**Rule:** React components in `src/` must not generate or edit AI-generated code. Only server `/api/generate` produces code.

**Why:** Generated code has strict constraints (no imports, inline styles, render() call). Trying to generate or validate client-side breaks these. `react-live` runs the code unsandboxed in the browser; malformed code crashes the app.

**Specifics:**
- `src/components/` and `src/hooks/` have zero code-generation logic.
- `useComponentGenerator.ts:18-49` only fetches from `/api/generate`, receives `code` string, stores it.
- `LivePreview.tsx` passes raw `code` to react-live; does not transform it.

**For agents:**
- Do not add prompt preprocessing or code postprocessing in frontend.
- Do not attempt to validate generated code before rendering (server already did).
- If validation is needed, add to server `generator.ts` (pure function, testable).

### Asymmetry: Error Display in App vs. Hook

**Rule:** `useComponentGenerator` captures and returns errors as strings. `App.tsx` displays errors in UI. Each level handles its own responsibility.

**Why:** Hook is a reusable logic module; it should not assume UI (banner, toast, etc.). App controls presentation. Keeps concerns separate.

**Specifics (App.tsx:124-128, useComponentGenerator:43-45):**
- Hook (line 44, useComponentGenerator.ts): `setError(message)` — just stores error string.
- App (line 124-128): `{error && <div className="error-banner">...` — displays error, typically clears after user interaction.
- Hook does not clear error automatically; App is responsible for flow (e.g., clear on new generation attempt).

**For agents:**
- Do not add `alert()` or `console.error()` to hook.
- If adding new error types, return string from hook, handle display in App.
- Keep hook pure and UI-agnostic.

### Security Boundary: Client-Provided API Keys

**Rule:** API keys entered in UI are transmitted to server only; never logged, stored in localStorage, or exposed in console. Use password input type; show/hide toggle is for UX only.

**Why:** API keys are credentials. Storing them client-side or leaking to logs enables theft. See root `@AGENTS.md` Security Boundary.

**Specifics (App.tsx:14, 98-120):**
- `apiKey` state (line 14): Kept in memory only, cleared on provider switch (line 43).
- Input type (line 100): `type={showKey ? 'text' : 'password'}` — masked by default.
- No localStorage, no cookie, no default values.
- Passed to hook only when generating (line 38): `generate(prompt, apiKey || undefined, provider)`.
- Server receives, uses, discards (never stored or returned).

**For agents:**
- Do not persist apiKey to localStorage or sessionStorage.
- Do not log apiKey in console or network inspector.
- Do not add "remember key" feature.
- Do not include apiKey in error messages or telemetry.

### Double Defense: API Call Error Handling (Hook + UI)

**Rule:** `useComponentGenerator` catches fetch/parsing errors. `App.tsx` displays and clears them. Both layers are needed.

**Why:** Hook needs error resilience for retries; App needs to show user. Each layer has different concerns (logic vs. UX flow).

**Specifics (useComponentGenerator:18-48, App.tsx:124-128):**
- Hook layer (line 31-32, useComponentGenerator.ts): `if (!res.ok) throw Error(data.error || 'Failed...')` — extracts server error message or provides fallback.
- Hook layer (line 44-45): `catch (err) { setError(...) }` — stores error string.
- App layer (line 124-128): Displays error banner. Does not clear automatically (user must trigger new generation).

**For agents:**
- Do not remove try-catch from hook; it's needed for error state.
- Do not add auto-clearing timers to error display (UX should be explicit).
- If adding new error types (network timeout, invalid JSON), handle at hook layer first.

### Test Boundary: Minimal Coverage, Manual E2E

**Rule:** Only `PromptInput` is tested. Other components are tested manually during `bun run dev`.

**Why:** Unit testing React hooks and components with I/O requires deep mocking (fetch, timers, React internals). Manual verification is faster and more reliable for UI correctness.

**Specifics:**
- `PromptInput.test.tsx` (line 1-29): Tests input state, button enable/disable, callback invocation. No API mocks.
- Other tests: None (intentional). Manual testing via browser during dev is the validation method.

**For agents:**
- Do not add unit tests for `useComponentGenerator` (hook testing is error-prone without extensive mocks).
- Do not test `App.tsx` route handling or state updates (E2E testing would be more appropriate).
- If a bug is found in components, fix it and verify by running `bun run dev` and interacting with UI.
- Add unit tests only if component logic becomes complex (e.g., custom state machine).
