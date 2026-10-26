# Security Audit: 2026-10-22

## Scope

Security audit with repository remediation. Deployment follow-through was explicitly confirmed on 2026-10-23. The sign-off gates below cover the reviewed application release; provider-only infrastructure, historical incident response and unrelated device/account work remain separately documented follow-ups, not claims of completed remediation.

## Audit Queue

- [ ] Q-008 [status:in_progress] October 26 closeout: patch Zod and bound untrusted scenario validation; rerun complete checks, automated learner/recovery acceptance, commit/push and verify the deployed release. Human pilot explicitly waived because participants are unavailable.
- [ ] Q-009 [status:open] Verify operational outage alerts and rehearse recovery without deploying a known-vulnerable release; document remaining provider-only evidence limits.

- [x] Q-005 [status:verified] Tailwind 4.3.3 removes braces and 78 obsolete packages. Clean npm install/full audit zero, OSV 722 pairs zero affected; final code suite and browser recovery/responsive checks pass.
- [x] Q-006 [status:verified] Replit identity/repository confirmed; seven pre-existing branches, publication history and verified backups preserved. Clean ade9aff release deployed to the existing domain; public health, asset hashes and learner/recovery checks pass.
- [x] Q-007 [status:verified] Reviewed application fixes committed and pushed to main and the audit branch; both CI runs pass. Actual public revision/runtime and learner behavior verified; release evidence and remaining provider limits documented.

- [x] Q-000 [status:verified] Initial audit inventoried repository, dependencies, delivery configuration and accessible metadata before later deployment authorization; uncommitted performance work was preserved. Credential rotations were not performed.
- [x] Q-001 [status:verified] Static compromise precheck completed before project execution. No project Python environment, LiteLLM artifact, suspicious registry origin or matched secret in 618 historical blobs. Raw evidence and pre-audit patch are outside git in a mode-700 audit directory.
- [x] Q-002 [status:verified] Initial audit refreshed A-N sources and captured npm/GHSA/OSV checks; official CISA mirror used after cisa.gov returned 403. Initial deployment discovery was incomplete; Q-006 subsequently resolved the primary service identity.
- [x] Q-003 [status:verified] Implemented runtime, dependency, CI, HTTP, import/storage and export fixes; 101 tests pass under isolated Node 24.22.1 with loopback permission.
- [x] Q-004 [status:verified] Validated local changes and compiled artifact; report and separate deployment/device/conditional incident-response checklists are in security-audit-2026-10-22.md.

## Sign-off Gate

- [ ] G-001 [status:in_progress] October 26 replacement application release must be committed, pushed, CI-passed, deployed and independently verified on the public service. October 23 evidence below remains historical.
- [x] G-002 [status:verified] All confirmed application findings are verified. Linux CI and reviewed Replit workspace builds pass; actual production release logs identify patched Node/OpenSSL and clean provenance. Published-command/artifact attestation gaps remain explicitly tracked under R-005.
- [ ] G-003 [status:open] Rerun typecheck/lint/tests/build/i18n/format and public learner/recovery acceptance after the October 26 changes. October 23 results remain recorded in V-012.
- [x] G-004 [status:verified] Report includes A-N matrix, dates, evidence, owners and exact follow-up checks.

## Rerun Matrix

- [ ] G-010 [status:open] Rerun all affected checks after final October 26 application edits, including malformed imports and learner state preservation.
- [ ] G-011 [status:open] Fresh dependency scans, CI/Replit checks, exact public revision/assets and serving runtime must pass for the replacement release.

## Findings Log

- [ ] F-017 [status:in_progress] [P2] [confidence:0.99] Progress storage only catches JSON syntax errors; syntactically valid null/wrong-shape progress crashes learner startup. Prototype-named scenario IDs can also resolve inherited map values. Validate bounded progress and use safe dictionary semantics; preserve damaged progress before replacement. Owner: Codex.
  - Evidence: client/src/lib/progressTracking.ts getProgress returns unchecked JSON.parse, recordAttempt reads arbitrary dictionary keys.
- [ ] F-018 [status:in_progress] [P2] [confidence:0.99] Zero-risk completion was skipped by a loading sentinel, and the five-scenario badge counted before the current completion was inserted. Use actual scoring/session readiness and include the current completion. Owner: Codex.
  - Evidence: home.tsx completion effect excluded scoreResult.total === 0; progressTracking.ts counted scenario records before assignment. Fifth-completion regression now passes; zero-risk browser check pending.

- [ ] F-015 [status:in_progress] [P1] [confidence:0.99] Fresh October 26 audit flags GHSA-mrhx-c7xc-m3w5 in root Zod 3.24.2 and nested Zod 4.3.6. Scenario import/storage has a 1 MB cap but unbounded collection validation. Patch both dependency paths and add pre-element validation limits. Owner: Codex.
  - Evidence: security-evidence/2026-10-26/npm-audit-before.json; shared/schema.ts; https://github.com/advisories/GHSA-mrhx-c7xc-m3w5 .
- [ ] F-016 [status:in_progress] [P2] [confidence:0.99] October 26 provider inspection cannot locate the October 23 workspace archive/bundles; prior checksum verification is historical only. Preserve current clean source/history in new verified recovery material and rehearse restoration. Unknown historical uncommitted archive availability remains a provider limit. Owner: Codex/operator.
  - Evidence: read-only Replit agent inspection October 26; seven original branch commits remain reachable. No deletion was observed or attributed.

- [x] F-014 [status:verified] [P2] [confidence:0.99] Language popup is non-modal; final live pointer/keyboard opening, language selection and Escape focus restoration pass with zero ARIA warnings. The first automated Escape check raced popup initialization; focus-aware rerun passes without further application changes.
  - Evidence: final-live-learner.txt and protected console-2026-10-23T19-23-59-084Z.log warning; no application error or lost state occurred. Owner: Codex.

- [x] F-013 [status:verified] [P2] [confidence:0.99] Replit's standard formatting check scanned generated .local tooling/state and .upm/store.json. Git, formatter and lint exclusions are aligned; standard hosted lint/format and clean build pass on 517d2d0 without bypasses.
  - Evidence: Replit validation of 891ed42: 118 tests/build/lint/audit passed; standard formatting failed only on generated state. Owner: Codex.

- [x] F-012 [status:verified] [P1] [confidence:0.99] Fixed language-triggered learner-state reset and equivalent custom-scenario focus refresh resets. Eight regression tests pass. Live 517d2d0 run retains Smart TV in IoT, enabled IoT control and risk 51.7 across all locales; custom focus refresh and legitimate scenario changes pass. Reports agree with visible state.
  - Evidence: 2026-10-23 live-report.json and live-mobile-verified.png, report-content assertion failed with main !== iot. Earlier layout-only checks passed but did not assert learner state. Owner: Codex.

- [x] F-011 [status:verified] [P2] [confidence:0.99] ESLint scanned generated evidence and Replit's pre-existing .cache/.bun/install/cache dependencies. Generated cache/tooling exclusions fix both cases; standard hosted lint and clean build passed on 81ccd4e. Client/server source remains covered.
  - Evidence: 2026-10-23 release recheck failed on security-evidence helper snippets, not application source. Owner: Codex.

- [x] F-010 [status:verified] [P2] [confidence:0.99] Browser checks exposed fixed-width mobile headers and legacy variable shorthand after the CSS migration. Headers/list controls now wrap; shorthand is converted to explicit var() in shared primitives. Final browser rerun passed, including authoring widths and deliberate chunk/locale network failures.
  - Evidence: 390px overflow reproduced (979px scroll width), then 24 locale/viewport/grid-list combinations passed. Owner: Codex.

- [x] F-007 [status:verified] [P2] [confidence:0.99] Save/delete/import failures now report localized errors; an unsuccessful save retains the open draft, rejects aggregate overflow, and preserves legacy oversized storage. Four additional regression tests pass.
  - Evidence: customScenarios.ts/tests and author.tsx. Owner: Codex.
- [x] F-008 [status:verified] [P2] [confidence:0.99] Lazy locale startup now falls back to bundled English, overlapping choices preserve the last selection, and switch failures show localized recovery. Four additional tests pass, including document language synchronization for screen readers.
  - Evidence: i18n.ts, i18n-recovery.test.ts, i18n.test.ts and LanguageSwitcher.tsx. Owner: Codex.
- [x] F-009 [status:verified] [P1] [confidence:0.99] Replaced reliance on old Replit Node with a guarded patched runtime. Linux CI and Replit workspace verify checksum-pinned builds. Actual production release events for ade9aff report Node 24.22.1/OpenSSL 3.5.9 and clean source. Published command/retention attestation remains a separate provider evidence limit, not proof of an old serving runtime.
  - Evidence: Replit agent read-only inspection; scripts/replit-runtime.sh and .replit. Owner: Codex/provider.

- [x] F-001 [status:verified] [P1] [confidence:0.99] Runtime pins, engine constraints and executable guards require patched Node 24.22.1. Final local shell, CI, reviewed Replit workspace and actual production serving logs report that version; no global installation was performed by this audit.
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

- [ ] P-009 [status:in_progress] F-015: Zod 4.6.7 replaces both vulnerable versions; remove unused direct error adapter, migrate records and remove obsolete error dumping. Collection gates reject oversize arrays before elements; bound strings, require unique device/zone IDs, preserve legacy stored entries and localize validation recovery. Full local suite passes 141 tests; public verification pending.
- [ ] P-010 [status:in_progress] F-016: fresh source bundles/restore rehearsal pending. Runtime wrapper now emits archive-checksum, npm-ci/lifecycle and offline-start markers so actual publication logs can distinguish the guarded path from saved-command overrides.

- [x] P-008 [status:verified] F-014: LanguageSwitcher uses a non-modal popup. Local and final public full browser tests confirm pointer/keyboard opening, Escape focus restoration and zero blocked-aria-hidden warnings while preserving all learner state. Standard code checks and 118 tests pass.
  - Addresses: F-014. Evidence: LanguageSwitcher.tsx, focus-fix-validation.txt, local-focus-regression.txt and acceptance-learner-verified.txt.

- [x] P-007 [status:verified] F-013: align .gitignore, .prettierignore and eslint.config.js for generated .cache/.local/.upm/.runtime state. Local standard lint/format pass and explicit ignore-discovery tests leave client/server source covered. Hosted standard formatting remains a release check.
  - Addresses: F-013. Evidence: protected generated-state-checks.txt and repository ignore configuration.

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

- [x] V-012 [status:verified] 2026-10-23 15:40-15:49 EDT: final public ade9aff release passes HTTP/API/security checks and four entry asset SHA256 matches. Fresh learner acceptance passes tutorial, all languages/layouts, state preservation, custom focus refresh, scenario initialization, author/import/quota recovery, reports and menu keyboard/Escape focus with zero baseline console errors/warnings. Deliberate locale/author download aborts recover correctly. Three subsequent health samples match the exact clean release. Production logs report Node 24.22.1/OpenSSL 3.5.9.
  - Evidence: 2026-10-23 15:49 EDT PASS: protected acceptance-http-result.json, acceptance-learner-verified.txt, acceptance-console-before-faults.txt, acceptance-recovery.txt, acceptance-report-proof.json, acceptance-health-samples.json and acceptance-production-runtime.txt. CI: https://github.com/mithorizon7/Device_Triage_Network_Fix/actions/runs/40012585272 . First focus-timing harness failure retained separately; focus-aware rerun passed.

- [x] V-011 [status:verified] 2026-10-23 15:23-15:32 EDT: public 517d2d0 HTTP/API/security checks pass; all four entry asset SHA256 hashes match the reviewed local build. Fresh live learner run, state preservation, 24 responsive/locale/view cases, author/import/quota and actual report-content assertions pass; failed locale/chunk recovery passes. A focus warning led to F-014, whose final local full-suite and browser rerun now pass without that warning.
  - Evidence: 2026-10-23 15:32 EDT PASS: protected final-live-http-result.json, final-live-learner.txt, final-live-recovery.txt, final-live-report-proof.json, focus-fix-validation.txt and local-focus-regression.txt. Final focus-fix production rollout still required.

- [x] V-010 [status:verified] 2026-10-23 15:17 EDT: standard local lint and formatting pass after the generated-state exclusion fix; formatter discovery explicitly ignores provider state and retains application source. GitHub main and branch CI for functional fix 891ed42 passed all 118 tests and complete release checks. Replit also passed build/lint/118 tests/audit for that revision; hosted formatting fix still being synchronized.
  - Evidence: 2026-10-23 15:17 EDT PASS: protected generated-state-checks.txt and ci-main-session-final.json/ci-branch-session-final.json; https://github.com/mithorizon7/Device_Triage_Network_Fix/actions/runs/40009504018 .

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

- [x] R-001 [status:accepted_risk] Deferred external inventory: Railway relevance remains unestablished and its connector requires reauthentication; primary deployment is verified on Replit. Owner: operator. Closure trigger: identify any related Railway environment, then assess its consumers/credentials. No absence or rotation claim is made.
- [x] R-002 [status:accepted_risk] Primary service identity/runtime/HTTPS/headers are verified; managed ingress HTTP3, kernel, full trust-store provenance and comprehensive retention remain unverified. Owner: provider/operator. Closure: obtain provider evidence before claiming infrastructure-wide hardening.
- [x] R-003 [status:accepted_risk] Limited serving-log samples were inspected, not complete cloud audit logs, historical Python/container installs or coding-gateway logs. Owner: operator/IR. Closure: preserve and review applicable historical artifacts/IAM/gateway records; escalate on credible indicators. No historical-safety or incident-recovery claim is made.
- [x] R-004 [status:accepted_risk] Local shell now reports Node 24.22.1, observed but not installed by this audit. Chrome 155.0.8059.85 and Unbound 1.24.2 remain installed; no unrelated device/service changes were made. Owner: device operator. Closure: separately authorized updates/relaunch/restart with version and service checks.
- [x] R-005 [status:accepted_risk] Published build/run override fields and artifact retention are not exposed by the available API or observed UI. Reviewed CI/workspace bootstrap and actual serving versions are verified, but production archive-acquisition/rollback retention are not attested. Final log sample contains 18 readiness errors before/between release events and none after the second event; their source remains unattributed. Owner: provider/operator. Closure: obtain command/image/retention evidence; investigate if steady-state public 5xx or post-start errors recur.

The terminal risk labels record scoped deferrals with owners, not user approval, completed remediation or blanket security acceptance. Application release sign-off does not close these external investigations.

## Outcome

Application fixes completed on codex/security-audit-2026-10-22, committed and pushed to main and the audit branch. Existing performance work and remote history are preserved. Public ade9aff is verified live at https://devicetriage.replit.app with exact clean provenance, matching client assets, patched serving runtime and passing learner/recovery checks. Subsequent commits contain audit evidence only. Provider/device/incident-response follow-ups above remain unverified, not falsely marked fixed.

## Change Log

- 2026-10-22: reviewed prior audits, preserved existing edits and completed static precheck before runtime execution.
- 2026-10-22: refreshed sources, implemented compatible local fixes, tested isolated patched runtime and documented deployment/device/incident-response blockers.
- 2026-10-23: preserved Replit history, fixed generated-state checks, discovered and corrected locale/focus-triggered learner resets, fixed language-menu focus accessibility, committed/pushed and verified the actual public release. Retained first-attempt failures and final passing acceptance evidence.
