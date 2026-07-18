# Backlog

## Portfolio audit backlog — 2026-07-17
_Findings from a 2026-07-17 code audit, preserved for later._

### Later / deferred
- **[low/S]** getModels(_apiKey) is a hardcoded stub ignoring its key arg; returns a static MiniMax model list instead of hitting a /models endpoint
  - Fix: In src/lib/api.ts:30 either GET ${API_BASE}/models with Bearer auth and map the response (fall back to the current static list on failure), or drop the unused _apiKey param and rename to a plain constant. Callsite Settings.tsx:69 awaits it. Static list is workable for a BYO single-user app but silently drifts as MiniMax adds models.
- **[low/M]** Zero test files anywhere (no *.test.* / *.spec.*)
  - Fix: Add vitest + a handful of unit tests for the pure logic in src/lib/api.ts — notably the <think>-block filter in sendMessageStream (lines 98-138) and the hex->base64 conversion in textToSpeech (199-204), plus store reducers in src/lib/store.ts. Wire a `test` script in package.json.
- **[low/M]** MiniMax API key stored in plaintext localStorage
  - Fix: src/lib/store.ts partialize (~line 134) persists apiKey into the 'chatmax-storage' localStorage blob in cleartext. On this single-user BYO-key desktop app the key sits on the owner's own disk, so exposure is limited to local processes — hardening, not an exploit. If done: move apiKey out of the zustand persist blob into tauri-plugin-store (already a dependency) backed by the OS keychain, or add a keyring plugin. Requires async load + a one-time migration from the existing localStorage value.
