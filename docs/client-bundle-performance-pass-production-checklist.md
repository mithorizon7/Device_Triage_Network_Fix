# client bundle performance pass Checklist

Source of truth checklist for a large/intense task.

## Metadata

- Created: 2026-03-10T10:59:33
- Last Updated: 2026-03-10T11:11:00
- Workspace: /Users/davedxn/Downloads/Device_Triage_Network_Fix
- Checklist Doc: /Users/davedxn/Downloads/Device_Triage_Network_Fix/docs/client-bundle-performance-pass-production-checklist.md

## Scope

- [x] Q-000 [status:verified] Capture explicit scope, constraints, and success criteria.
  - Scope: reduce first-load JavaScript for the learner-facing route by code splitting route, locale, and lower-priority UI modules without regressing onboarding or i18n behavior.
  - Success criteria: smaller initial client chunk than the previous `823.74 kB` minified build output, preserved runtime behavior, and passing typecheck/lint/tests/build/i18n validation.

## Sign-off Gate

- [x] G-001 [status:verified] All queued work, findings, fixes, and validations are complete.
- [x] G-002 [status:verified] All findings are resolved or marked `accepted_risk` with rationale and owner.
- [x] G-003 [status:verified] Required validation suite has been rerun on the final code state.
- [x] G-004 [status:verified] Residual risks and follow-ups are documented.

## Rerun Matrix

- [x] G-010 [status:verified] If code changes after any checked `V-*`, reset affected validation items to unchecked.
- [x] G-011 [status:verified] Final sign-off only after a full validation pass completed after the last code edit.

## Audit Queue

- [x] Q-001 [status:verified] Create checklist and baseline scope.
- [x] Q-002 [status:verified] Complete discovery/audit of impacted systems.
- [x] Q-003 [status:verified] Implement required changes.
- [x] Q-004 [status:verified] Expand or update automated tests.
- [x] Q-005 [status:verified] Run full validation suite.
- [x] Q-006 [status:verified] Final code-quality pass and sign-off review.

## Findings Log

- [x] F-001 [status:verified] [P1] [confidence:0.92] Main client bundle eagerly included non-home route code and all locale payloads, inflating first-load cost for the learner route.
  - Evidence: baseline build output `../dist/public/assets/index-BU5L3GYR.js   823.74 kB`; eager imports in [App.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/App.tsx) and [i18n.ts](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/lib/i18n.ts)
  - Owner: Codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P2] [confidence:0.80] Home eagerly imported secondary insight/export/list-view UI that was not required for the first triage action.
  - Evidence: eager imports and immediate render path in [home.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/pages/home.tsx) and optional-heavy insights dependency in [InsightsCard.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/components/InsightsCard.tsx)
  - Owner: Codex
  - Linked Fix: P-002
- [x] F-003 [status:verified] [P3] [confidence:0.99] The i18n key generator produced output that failed Prettier after `build`, preventing a clean sign-off loop.
  - Evidence: repeated `npm run format:check` failures on [i18n-keys.ts](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/lib/i18n-keys.ts) immediately after build; generator source in [generate-i18n-types.js](/Users/davedxn/Downloads/Device_Triage_Network_Fix/scripts/generate-i18n-types.js)
  - Owner: Codex
  - Linked Fix: P-003

## Fix Log

- [x] P-001 [status:verified] Split route and locale loading so the home route no longer pays for `/author` and all translations up front.
  - Addresses: F-001
  - Evidence: lazy `/author` route in [App.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/App.tsx), async locale initialization/loading in [i18n.ts](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/lib/i18n.ts), bootstrap wait in [main.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/main.tsx); final build emitted separate `author`, `lv`, and `ru` chunks
- [x] P-002 [status:verified] Deferred lower-priority home panels and alternate list view behind lazy boundaries with non-blocking fallbacks.
  - Addresses: F-002
  - Evidence: deferred lazy boundaries and skeletons in [home.tsx](/Users/davedxn/Downloads/Device_Triage_Network_Fix/client/src/pages/home.tsx); final build emitted separate `ControlsDrawer`, `InsightsCard`, `ExportPanel`, and `DeviceListView` chunks
- [x] P-003 [status:verified] Updated the i18n key generator to emit Prettier-formatted TypeScript so build output remains format-clean.
  - Addresses: F-003
  - Evidence: Prettier integration in [generate-i18n-types.js](/Users/davedxn/Downloads/Device_Triage_Network_Fix/scripts/generate-i18n-types.js); `node scripts/generate-i18n-types.js` followed by `npm run format:check` passed

## Validation Log

- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-10 11:07 EDT `pass`
- [x] V-002 [status:verified] `npm run lint`
  - Evidence: 2026-03-10 11:07 EDT `pass`
- [x] V-003 [status:verified] `npm run test`
  - Evidence: 2026-03-10 11:07 EDT `pass` (`78/78`)
- [x] V-004 [status:verified] `npm run lint:i18n && node scripts/i18n-validate.js && npm run build`
  - Evidence: 2026-03-10 11:07 EDT `pass`; final build reduced main client chunk from `823.74 kB` minified / `252.50 kB` gzip to `557.45 kB` minified / `176.07 kB` gzip

## Residual Risks

- [x] R-001 [status:accepted_risk] Bundle warning still persists because the remaining large chunk is concentrated in the core home experience, not in obviously deferrable dead weight.
  - Rationale: route, locale, sidebar-panel, and list-view splitting removed the clear secondary payloads, but the main learning route still contains substantial core logic and UI.
  - Owner: Codex
  - Follow-up trigger/date: reassess in a future performance sprint if you want to extract more of the core home route or experiment with vendor chunking.

## Change Log

- 2026-03-10T10:59:33: Checklist initialized.
- 2026-03-10T11:04: Discovery completed. Confirmed initial-load pressure from eager route imports, eager locale imports, and secondary home panels.
- 2026-03-10T11:08: Implemented route, locale, sidebar-panel, and list-view splitting. Final validated build reduced the main client chunk from `823.74 kB` to `557.45 kB` minified.
- 2026-03-10T11:11: Fixed generator formatting drift so `build` and `format:check` can pass in the same final state.
