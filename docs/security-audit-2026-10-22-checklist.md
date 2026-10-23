# Security Audit: 2026-10-22

## Scope

Security audit with repository remediation. Follow-through authorization on 2026-10-22: finish fixes, commit, and deploy the reviewed application; unrelated shared device/account changes remain separate.

## Audit Queue

- [x] Q-005 [status:verified] Tailwind 4.3.3 removes braces and 78 obsolete packages. Clean npm install/full audit zero, OSV 722 pairs zero affected; final code suite and browser recovery/responsive checks pass.
- [ ] Q-006 [status:in_progress] Confirm the Replit Device Triage service/repository identity, synchronize an exact reviewed commit, and deploy without overwriting remote work.
- [ ] Q-007 [status:open] Commit and push reviewed changes, verify CI, then verify the live deployment and document remaining provider evidence gaps.

- [x] Q-000 [status:verified] Audit repository, installed dependencies, delivery configuration and accessible deployment metadata; preserve the uncommitted performance work. No production changes or credential rotations authorized.
- [x] Q-001 [status:verified] Static compromise precheck completed before project execution. No project Python environment, LiteLLM artifact, suspicious registry origin or matched secret in 618 historical blobs. Raw evidence and pre-audit patch are outside git in a mode-700 audit directory.
- [x] Q-002 [status:verified] Refreshed A-N sources; official CISA mirror accessed after cisa.gov returned 403. npm/GHSA and OSV checks captured. No deployed asset could be identified through available provider access.
- [x] Q-003 [status:verified] Implemented runtime, dependency, CI, HTTP, import/storage and export fixes; 101 tests pass under isolated Node 24.22.1 with loopback permission.
- [x] Q-004 [status:verified] Validated local changes and compiled artifact; report and separate deployment/device/conditional incident-response checklists are in security-audit-2026-10-22.md.

## Sign-off Gate

- [ ] G-001 [status:in_progress] Local remediation complete; release commit and CI are tracked below. Final sign-off requires the authorized Replit synchronization and live rollout evidence.
- [ ] G-002 [status:in_progress] Production and host gaps are documented; pinned runtime requires Linux CI and actual Replit build/startup verification before closure.
- [x] G-003 [status:verified] Final session-fix suite passed: typecheck/lint/118 tests/build/i18n/format. Local production-browser regression preserves work across all locales and custom-scenario focus refresh; report contents match. Final live redeployment remains separate.
- [x] G-004 [status:verified] Report includes A-N matrix, dates, evidence, owners and exact follow-up checks.

## Rerun Matrix

- [ ] G-010 [status:in_progress] Repeat local and live learner checks after the scenario-session initialization fix, including preservation of placements/controls across locale changes and focus refresh.
- [ ] G-011 [status:in_progress] Freeze final dependency versions and separately verify remote deployment evidence.

## Findings Log

- [ ] F-012 [status:in_progress] [P1] [confidence:0.99] Live report inspection showed language switching reset placements and controls: Smart TV returned to Main, IoT control returned off. Home's initialization effect depended on translation identity; equivalent custom-scenario focus refreshes could also reset work. Separate session initialization from translated warnings and guard equivalent scenario data; add regression tests and redeploy.
  - Evidence: 2026-10-23 live-report.json and live-mobile-verified.png, report-content assertion failed with main !== iot. Earlier layout-only checks passed but did not assert learner state. Owner: Codex.

- [x] F-011 [status:verified] [P2] [confidence:0.99] ESLint scanned generated evidence and Replit's pre-existing .cache/.bun/install/cache dependencies. Generated cache/tooling exclusions fix both cases; standard hosted lint and clean build passed on 81ccd4e. Client/server source remains covered.
  - Evidence: 2026-10-23 release recheck failed on security-evidence helper snippets, not application source. Owner: Codex.

- [x] F-010 [status:verified] [P2] [confidence:0.99] Browser checks exposed fixed-width mobile headers and legacy variable shorthand after the CSS migration. Headers/list controls now wrap; shorthand is converted to explicit var() in shared primitives. Final browser rerun passed, including authoring widths and deliberate chunk/locale network failures.
  - Evidence: 390px overflow reproduced (979px scroll width), then 24 locale/viewport/grid-list combinations passed. Owner: Codex.

- [x] F-007 [status:verified] [P2] [confidence:0.99] Save/delete/import failures now report localized errors; an unsuccessful save retains the open draft, rejects aggregate overflow, and preserves legacy oversized storage. Four additional regression tests pass.
  - Evidence: customScenarios.ts/tests and author.tsx. Owner: Codex.
- [x] F-008 [status:verified] [P2] [confidence:0.99] Lazy locale startup now falls back to bundled English, overlapping choices preserve the last selection, and switch failures show localized recovery. Four additional tests pass, including document language synchronization for screen readers.
  - Evidence: i18n.ts, i18n-recovery.test.ts, i18n.test.ts and LanguageSwitcher.tsx. Owner: Codex.
- [ ] F-009 [status:in_progress] [P1] [confidence:0.99] Actual Replit Node 24 module is 24.13.0, below 24.22.1. Added SHA256-pinned official Linux runtime bootstrap; production startup never downloads code or falls back. Linux CI bootstrap verified on 442955d; Replit build/serving runtime must still be verified before deployment closure.
  - Evidence: Replit agent read-only inspection; scripts/replit-runtime.sh and .replit. Owner: Codex/provider.

- [x] F-001 [status:verified] [P1] [confidence:0.99] Runtime pins corrected to patched Node 24.22.1, engine constraints and executable guards added. Isolated validation runtime checksum checked; global and production runtimes still pending owner action.
  - confidence: 0.99. Evidence: .nvmrc, .replit, scripts/check-runtime.cjs and official archive checksum. Owner: Codex for local pins; operator for actual deployment/global runtime.
- [x] F-002 [status:verified] [P1] [confidence:0.99] Vite 5.4.21 and transitive 7.3.0 updated to 7.3.7; Host bypass removed and development binds loopback unless explicitly configured. Production plugins excluded.
  - confidence: 0.99. Evidence: package-lock.json, server/vite.ts, server/index.ts. Owner: Codex.
- [x] F-003 [status:verified] [P2] [confidence:0.99] Added production CSP/HSTS and headers before handlers, removed unnecessary body parsing, enforced GET/HEAD, JSON API 404s, sensitive/static fallback checks and final generic error handler. server/app.test.ts covers these paths.
  - confidence: 0.99. Evidence: server/app.ts, server/static.ts, server/app.test.ts and compiled-artifact HTTP smoke check. Owner: Codex.
- [x] F-004 [status:verified] [P2] [confidence:0.99] CI now uses read-only token permissions, immutable v6 action SHAs, disabled checkout credential persistence and lifecycle scripts, production dependency audit; secret-file ignores added.
  - confidence: 0.99. Evidence: .github/workflows/ci.yml, .npmrc and .gitignore. Owner: Codex.
- [x] F-005 [status:verified] [P2] [confidence:0.99] Malformed localStorage scenarios could break page rendering; schema validation and 1 MB limits added, with seven regression tests. HTML report language attribute escaped.
  - confidence: 0.99. Evidence: customScenarios.ts/tests, author.tsx and exportUtils.ts. Owner: Codex.
- [x] F-006 [status:verified] [P1] [confidence:0.99] Resolved: Tailwind 4.3.3 migration removes the vulnerable braces chain. Full npm audit zero; independent OSV recheck of 722 unique package/version pairs reports zero affected.
  - confidence: 0.99.
  - Evidence: protected npm-audit-followthrough.json and osv-followthrough.json; clean npm ci. Owner: Codex.

## Fix Log

- [x] P-006 [status:verified] F-012: separated scenario initialization from translated warnings, keyed sessions by canonical scenario content, and reused safe initial-state mapping for resets. Scoring waits for the matching initialized session; initial/reset score notifications no longer report a false increase. Eight new tests pass; real local browser/report checks pass.
  - Addresses: F-012. Evidence: scenarioSession.ts/tests, home.tsx, local-session-regression.txt and local-session-report-proof.json. Hosted redeployment still required.

- [x] P-005 [status:verified] F-011: eslint.config.js excludes generated evidence/runtime directories already ignored by Git, without excluding application source.
  - Addresses: F-011. Evidence: ESLint isPathIgnored checks and complete 2026-10-23 release validation.

- [x] P-001 [status:verified] F-001: .nvmrc, .replit, package.json and scripts/check-runtime.cjs.
  - Addresses: F-001. Evidence: guarded patched Node configuration and tested Node 24.22.1 binary.
- [x] P-002 [status:verified] F-002/F-006: package-lock.json targeted updates; obsolete unused Drizzle and Vite plugins removed; server/vite.ts Host validation restored.
  - Addresses: F-002, F-006. Evidence: final npm/OSV scans and build; braces removed by subsequent Tailwind 4 migration.
- [x] P-003 [status:verified] F-003: server/app.ts, server/static.ts, server/index.ts and server/app.test.ts.
  - Addresses: F-003. Evidence: 16 HTTP tests and compiled-artifact smoke check.
- [x] P-004 [status:verified] F-004/F-005: .github/workflows/ci.yml, .npmrc, .gitignore, customScenarios.ts/tests, author.tsx and exportUtils.ts.
  - Addresses: F-004, F-005. Evidence: CI config review, schema regression tests and successful full checks.

## Validation Log

- [x] V-009 [status:verified] 2026-10-23 15:07-15:11 EDT: final learner-session fix passes typecheck, lint, 118 tests, build, i18n and formatting. Local production browser passed tutorial, 24 locale/view/viewport combinations, custom focus refresh, scenario change, author save/import and quota recovery. Downloaded report retains Smart TV in IoT, enabled IoT control and risk 51.7 (initial 67.7).
  - Evidence: 2026-10-23 15:11 EDT PASS: protected local-session-regression.txt, local-session-report-proof.json, session-fix-format.txt and direct command output. The failed first-live report is preserved separately; final live rerun remains required.

- [x] V-007 [status:verified] 2026-10-23 14:31-14:34 EDT: Node 24.22.1/npm 11.19.1; fresh full npm audit reports zero vulnerabilities. Typecheck, lint, 110 tests, build, i18n lint and formatting pass after F-011. Client bundle sizes are unchanged.
  - Evidence: 2026-10-23 14:34 EDT PASS: protected security-evidence/2026-10-23/release-validation.txt and npm-audit-release.json. The separately installed current shell runtime was observed, not installed by this audit.

- [x] V-008 [status:verified] 2026-10-23 14:42-14:45 EDT: complete local validation passed after cache/tooling exclusions; ESLint discovery explicitly ignores generated directories while covering client/server source. Clean compiled 3d1051c startup/HTTP smoke also passed before this lint-only change.
  - Evidence: 2026-10-23 14:45 EDT PASS: protected cache-fix-validation.txt, lint-discovery.jsonl, clean-release-health.json, clean-release-start.txt and local-http-smoke.txt. Hosted checks remain separate.

- [x] V-006 [status:verified] 2026-10-22 14:57 EDT: GitHub Linux CI succeeded for release 442955dea8aa15d7610c2da2d80d28f5d14d0b94, including clean installation, checksum-pinned Node bootstrap, full dependency audit, 110 tests, lint/typecheck/i18n/format and build.
  - Evidence: 2026-10-22 14:57 EDT PASS: https://github.com/mithorizon7/Device_Triage_Network_Fix/actions/runs/39835771198 . Replit deployment is not implied.

- [x] V-005 [status:verified] 2026-10-22 14:54-14:56 EDT: 110 tests/typecheck/ESLint/build/i18n/format pass on final code; no chunk warnings. Browser passed tutorial action gates and persisted completion, 24 locale/viewport/view combinations, four authoring widths, save/import, simulated quota failure, failed preferred-locale download, failed author chunk and reload recovery. HTML/JSON report contents and compiled HTTP/API/header/asset checks passed.
  - Evidence: 2026-10-22 14:56 EDT PASS: protected browser-learner-final.txt, browser-recovery-verified.txt, browser-proof.json.txt, screenshots and http-smoke.mjs output. Test harness waited for tutorial animation before selecting; intentional abort tests produced expected network errors.

- [x] V-004 [status:verified] 2026-10-22 14:23 EDT: typecheck/lint and 109 tests passed after storage/locale recovery changes. First build hit ENOSPC; removed only audit-owned npm cache and redundant public Node archive, retained hashes and evidence. Subsequent build/i18n/format passed. A manual-chunk cycle warning was then corrected; final build and browser rerun still required.
  - Evidence: 2026-10-22 14:23 EDT PASS for tests; first build FAIL (ENOSPC), rerun PASS. npm suite output, audit evidence directory, and vite.config.ts. Later validation V-005 supersedes this snapshot.

- [x] V-001 [status:verified] 2026-10-22: npm 11.19.1 scans, 761 unique npm package/version OSV queries, GHSA/maintainer primary references, official CISA mirror 2026.10.21 checked. Only braces remains in OSV; five related npm build-only entries.
  - Evidence: 2026-10-22 13:16 EDT completed; full npm audit exited 1 with five build-only entries, production audit passed with zero, OSV/KEV checks completed. Protected raw evidence and report list sources/limits.
- [x] V-002 [status:verified] 2026-10-22: typecheck, lint, i18n, format, 101 tests and Vite 7.3.7 production build pass under checksum-verified isolated Node 24.22.1. No global runtime update.
  - Evidence: 2026-10-22 13:23 EDT pass; clean npm ci, typecheck, lint, 101 tests and production build repeated on the final lockfile. Format/i18n passed separately.
- [x] V-003 [status:verified] 2026-10-22: 16 HTTP regression tests pass; compiled production HTML/assets/API/deep-link/header/method checks pass on loopback, then test server stopped. Live deployment unverified.
  - Evidence: 2026-10-22 13:17 EDT pass; server/app.test.ts and explicit loopback compiled-artifact probes, with test server stopped after verification.

## Residual Risks

- [x] R-001 [status:accepted_risk] Railway connector requires reauthentication; cannot determine whether this project uses Railway or inspect secrets/logs. Owner: operator. Closure: connect correct workspace and assess every environment/credential consumer.
- [x] R-002 [status:accepted_risk] Replit service identity resolved through broader search; deployed runtime, October 17 onward logs, ingress/HTTP3/kernel/trust stores still require evidence. Owner: provider/operator. Closure: actual domain/service and supporting runtime/log evidence.
- [x] R-003 [status:accepted_risk] No cloud audit logs, historical Python/container installs or coding-gateway logs available. Owner: operator/IR. Closure: artifact/install history and applicable IAM/gateway logs; report does not claim historical safety.
- [x] R-004 [status:accepted_risk] Global Node 22.12.0, Unbound 1.24.2 and Chrome 155 remain unchanged. Owner: device operator. Closure: approved update/restart and actual version checks. Local visual/interaction verification is recorded separately; live rollout checks remain required.

## Outcome

Local work completed on codex/security-audit-2026-10-22. Existing performance edits preserved and committed in 442955d; branch pushed and Linux CI passed. Production synchronization, device changes and incident-response closure remain pending; documented risks above are deferrals, not user approval of risk. See the report for sources, compatibility limits and exact commands.

## Change Log

- 2026-10-22: reviewed prior audits, preserved existing edits and completed static precheck before runtime execution.
- 2026-10-22: refreshed sources, implemented compatible local fixes, tested isolated patched runtime and documented deployment/device/incident-response blockers.
