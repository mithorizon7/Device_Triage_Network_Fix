# Onboarding Tutorial Hardening Audit Checklist

Source of truth checklist for a large/intense task.

## Metadata

- Created: 2026-03-06T15:37:09
- Last Updated: 2026-03-06T15:41:00
- Workspace: /Users/davedxn/Downloads/Device_Triage_Network_Fix
- Checklist Doc: /Users/davedxn/Downloads/Device_Triage_Network_Fix/docs/onboarding-tutorial-hardening-audit-production-checklist.md

## Scope

- [x] Q-000 [status:verified] Capture explicit scope, constraints, and success criteria.
  - Scope: harden onboarding tutorial implementation for functional correctness, edge-case safety, accessibility behavior, and localization consistency across `en/lv/ru`.
  - Success criteria: no tutorial deadlocks, list/grid compatibility, aligned copy and gating logic, clean lint/test/typecheck/build, and explicit residual risks.

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

- [x] F-001 [status:verified] [P2] [confidence:0.93] Tutorial target selectors only matched grid mode and failed to target list-view elements.
  - Evidence: `client/src/lib/tutorialSteps.ts` used only `card-device-*` / `button-flag-*` selectors.
  - Owner: codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P1] [confidence:0.90] Tutorial gating could deadlock on scenarios without improvable controls or with strict risk-drop threshold.
  - Evidence: `client/src/pages/home.tsx` required control/risk conditions that can be impossible for already-hardened scenarios.
  - Owner: codex
  - Linked Fix: P-002
- [x] F-003 [status:verified] [P2] [confidence:0.88] Segmentation gate logic was stricter than tutorial copy (required exact target zones while copy said “out of Main”).
  - Evidence: `client/src/pages/home.tsx` initial gating used per-flag exact zone mapping.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-004 [status:verified] [P2] [confidence:0.87] Non-English tutorial copy diverged from updated English onboarding flow.
  - Evidence: `client/src/locales/lv.json` and `client/src/locales/ru.json` retained old walkthrough copy while `en` was rewritten.
  - Owner: codex
  - Linked Fix: P-004
- [x] F-005 [status:verified] [P3] [confidence:0.95] i18n test used brittle hardcoded key count, causing avoidable failures after valid key additions.
  - Evidence: `client/src/lib/i18n.test.ts` asserted exactly 595 keys.
  - Owner: codex
  - Linked Fix: P-005
- [x] F-006 [status:verified] [P3] [confidence:0.98] Build script lint warnings from unused catch variables.
  - Evidence: `npm run lint` warnings in `script/build.ts` for unused `error` vars.
  - Owner: codex
  - Linked Fix: P-006

## Fix Log

- [x] P-001 [status:verified] Expand tutorial selectors to support both grid and list views.
  - Addresses: F-001
  - Evidence: Updated `client/src/lib/tutorialSteps.ts` targets with combined selectors for cards and flag buttons.
- [x] P-002 [status:verified] Make control/risk gates resilient for edge scenarios and remove deadlock-prone thresholds.
  - Addresses: F-002
  - Evidence: Updated `client/src/pages/home.tsx` to auto-complete control step when nothing is improvable and use practical risk-drop completion logic.
- [x] P-003 [status:verified] Align segmentation gate with tutorial instruction semantics.
  - Addresses: F-003
  - Evidence: Updated `client/src/pages/home.tsx` to mark completion when risky devices leave `main`.
- [x] P-004 [status:verified] Localize revised onboarding copy for Latvian and Russian and add actionable continuation prompt key in all locales.
  - Addresses: F-004
  - Evidence: Updated `client/src/locales/en.json`, `client/src/locales/lv.json`, `client/src/locales/ru.json`; added `tutorial.completeActionPrompt`.
- [x] P-005 [status:verified] Replace hardcoded translation-key-count assertion with canonical-locale-alignment assertion.
  - Addresses: F-005
  - Evidence: Updated `client/src/lib/i18n.test.ts` locale-count test.
- [x] P-006 [status:verified] Remove unused catch bindings in build script.
  - Addresses: F-006
  - Evidence: Updated `script/build.ts` catches to `catch { ... }`; lint warnings cleared.

## Validation Log

- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-06 15:41 EST, pass.
- [x] V-002 [status:verified] `npm run lint`
  - Evidence: 2026-03-06 15:41 EST, pass with no warnings after `script/build.ts` fix.
- [x] V-003 [status:verified] `npm run test`
  - Evidence: 2026-03-06 15:41 EST, pass (5 files, 72 tests).
- [x] V-004 [status:verified] `node scripts/i18n-validate.js`
  - Evidence: 2026-03-06 15:40 EST, pass (596 keys aligned across `en/lv/ru`).
- [x] V-005 [status:verified] `npm run build`
  - Evidence: 2026-03-06 15:41 EST, pass (client/server build complete).

## Residual Risks

- [x] R-001 [status:accepted_risk] Vite reports large client chunk warning (>500kB gzipped threshold warning).
  - Rationale: Not introduced by this onboarding hardening pass; no functional regression, but bundle size optimization remains open.
  - Owner: frontend maintainers
  - Follow-up trigger/date: Address when running performance/code-splitting optimization sprint.

## Change Log

- 2026-03-06T15:37:09: Checklist initialized.
- 2026-03-06T15:41:00: Discovery, fixes, validations, and sign-off completed with evidence.
