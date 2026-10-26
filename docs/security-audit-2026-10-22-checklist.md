# Security Audit: 2026-10-22

## Scope

Security audit with repository remediation. Deployment follow-through was explicitly confirmed on 2026-10-23. The sign-off gates below cover the reviewed application release; provider-only infrastructure, historical incident response and unrelated device/account work remain separately documented follow-ups, not claims of completed remediation.

## Audit Queue

- [x] Q-008 [status:verified] October 26 closeout: patched Zod, bounded imports, repaired progress/completion edge cases, passed full suite/CI and independent dependency scans, committed/pushed and deployed. Final fresh-profile public learner/recovery acceptance passes. Human pilot explicitly waived because participants are unavailable.
- [x] Q-009 [status:verified] Outage emails and critical-vulnerability publication blocking persist after explicit UI publication and fresh reload. Connector publication did not save editor drafts, so exactly the two settings were applied through the UI. Private recovery bundle/source archive and isolated full-suite restore pass without deploying vulnerable code. Provider-only limits remain explicit.

- [x] Q-005 [status:verified] Tailwind 4.3.3 removes braces and 78 obsolete packages. Clean npm install/full audit zero, OSV 722 pairs zero affected; final code suite and browser recovery/responsive checks pass.
- [x] Q-006 [status:verified] Replit identity/repository confirmed; seven pre-existing branches, publication history and verified backups preserved. Clean ade9aff release deployed to the existing domain; public health, asset hashes and learner/recovery checks pass.
- [x] Q-007 [status:verified] Reviewed application fixes committed and pushed to main and the audit branch; both CI runs pass. Actual public revision/runtime and learner behavior verified; release evidence and remaining provider limits documented.

- [x] Q-000 [status:verified] Initial audit inventoried repository, dependencies, delivery configuration and accessible metadata before later deployment authorization; uncommitted performance work was preserved. Credential rotations were not performed.
- [x] Q-001 [status:verified] Static compromise precheck completed before project execution. No project Python environment, LiteLLM artifact, suspicious registry origin or matched secret in 618 historical blobs. Raw evidence and pre-audit patch are outside git in a mode-700 audit directory.
- [x] Q-002 [status:verified] Initial audit refreshed A-N sources and captured npm/GHSA/OSV checks; official CISA mirror used after cisa.gov returned 403. Initial deployment discovery was incomplete; Q-006 subsequently resolved the primary service identity.
- [x] Q-003 [status:verified] Implemented runtime, dependency, CI, HTTP, import/storage and export fixes; 101 tests pass under isolated Node 24.22.1 with loopback permission.
- [x] Q-004 [status:verified] Validated local changes and compiled artifact; report and separate deployment/device/conditional incident-response checklists are in security-audit-2026-10-22.md.

## Sign-off Gate

- [x] G-001 [status:verified] October 26 application 121d9de is committed/pushed and CI-passed; final public fb15dd publication checkpoint has exactly the same source tree, clean provenance, matching assets and passing independent acceptance. October 23 evidence remains historical.
- [x] G-002 [status:verified] All confirmed application findings are verified. Local/CI/Replit full checks pass; actual publication logs prove checksum-verified build and offline startup, patched Node/OpenSSL and clean provenance. Provider saved-field/retention limits remain tracked under R-005.
- [x] G-003 [status:verified] Final code passes typecheck/lint/153 tests/build/i18n/format. Public learner, storage, import, completion, keyboard/accessibility, reports and network-failure recovery all pass. Fresh final-public profile confirms the deployed checkpoint.
- [x] G-004 [status:verified] Report includes A-N matrix, dates, evidence, owners and exact follow-up checks.

## Rerun Matrix

- [x] G-010 [status:verified] All affected checks rerun after final application edits, including malformed imports, progress recovery and learner state preservation. Only closeout documentation follows the verified application commit.
- [x] G-011 [status:verified] Fresh npm/OSV scans are clean; CI/Replit checks pass. Final public checkpoint/tree, four asset hashes and actual serving runtime/start markers verified. Saved outage/security settings persist after publication and reload.

## Findings Log

- [x] F-017 [status:verified] [P2] [confidence:0.99] Bounded progress validation prevents malformed-storage startup crashes; safe dictionaries handle prototype-named IDs. Recovery copies preserve damaged history before replacement. Unit and public browser regressions pass. Owner: Codex.
  - Evidence: client/src/lib/progressTracking.ts getProgress returns unchecked JSON.parse, recordAttempt reads arbitrary dictionary keys.
- [x] F-018 [status:verified] [P2] [confidence:0.99] Actual session readiness permits zero-risk completion; the fifth completion counts toward its badge immediately. Unit and public zero-risk/all-scenario completion, badge and reload checks pass. Owner: Codex.
  - Evidence: home.tsx completion effect excluded scoreResult.total === 0; progressTracking.ts counted scenario records before assignment. Fifth-completion regression now passes; zero-risk browser check pending.

- [x] F-015 [status:verified] [P1] [confidence:0.99] Patched both vulnerable Zod paths to 4.6.7, removed the unused direct error adapter, and bounded imports before element validation. Fresh npm/OSV scans and public malformed-import checks pass. Owner: Codex.
  - Evidence: security-evidence/2026-10-26/npm-audit-before.json; shared/schema.ts; https://github.com/advisories/GHSA-mrhx-c7xc-m3w5 .
- [x] F-016 [status:verified] [P2] [confidence:0.99] Fresh verified provider-local backups and a private off-checkout source/history bundle replace reliance on unavailable historical runner backups. Full isolated restore/reinstall/audit/tests/build/startup passes. Historical uncommitted archive availability is still unknown, not reconstructed or falsely attested. Owner: Codex/operator.
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

- [x] P-009 [status:verified] F-015/F-017/F-018: patched Zod, bounded validation, safe legacy scenario/progress storage, localized draft recovery and completion fixes shipped in 121d9de. Full 153-test suite, CI, Replit checks and public regressions pass.
  - Addresses: F-015, F-017, F-018. Evidence: 153-test final-validation-v4.txt; public extra/all-scenario proofs; final-public-learner-proof.txt.
- [x] P-010 [status:verified] F-016: private off-checkout bundle/source archive verify and restore with full checks and clean startup. Replit preserves original branches and independently rehearses restores. Actual publication logs prove archive checksum and npm-ci/lifecycle-disabled build markers. Start-mode/retention evidence remains bounded under R-005.
  - Addresses: F-016. Evidence: recovery-SHA256SUMS, restore-validation.txt, restore-health.json, replit-preparation.txt and final-serving-evidence.txt; actual start-mode marker is now verified too.

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

- [x] V-017 [status:verified] 2026-10-26 16:53-16:55 UTC: final fresh-profile public acceptance on clean fb15dd passes the tutorial, 24 locale/view/viewport cases, state preservation, author/import/quota, keyboard focus and actual report contents, with zero console errors/warnings. Revision-scoped serving logs verify two clean fb15dd releases on Node 24.22.1/OpenSSL 3.5.9 and actual start-mode/offline markers. No explicit exception or readiness failure follows the final release event in the returned window.
  - Evidence: 2026-10-26 16:55 UTC PASS: final-public-learner-proof.txt, final-public-console.txt, final-public-report-proof.json, final-http-verified.json and final-serving-evidence.txt. Log window requested 16:48:00-16:53:19.361 UTC, returned 70 entries 16:50:01.816-16:53:05.327, revision-scoped, truncated=false, no further cursor. Nineteen readiness failures precede/between release events; none follows the final event.

- [x] V-016 [status:verified] October 26: approved outage emails and critical-vulnerability publishing blocking persist after explicit UI publication and full editor reload, with analytics/feedback/public sharing unchanged. Final clean fb15dd checkpoint has the identical reviewed 121d9de source tree; APIs/security probes and four entry asset SHA256 matches pass. Public import/progress/zero-risk/all-scenario and locale/chunk recovery cases pass.
  - Evidence: 2026-10-26 16:52 UTC PASS: protected saved-settings.txt, output/playwright/oct26-saved-safeguards.png, final-http-verified.json, live-extra-proof.txt, live-all-scenarios-proof.txt, live-recovery-proof.txt and replit-serving-verification.txt. Inbox delivery was not tested by interrupting production.

- [x] V-013 [status:verified] October 26: committed 121d9de passes typecheck/lint/153 tests/build/i18n/format, full npm audit zero and independent OSV scan of 725 package/version pairs with no affected versions. Main and audit-branch CI both pass. Replit verifies the exact clean tree, the same checks and patched runtime before publication.
  - Evidence: 2026-10-26 16:34-16:42 UTC PASS: protected final-validation-v4.txt, npm-audit-after.json, osv-result.json, ci-release.json, replit-preparation.txt; https://github.com/mithorizon7/Device_Triage_Network_Fix/actions/runs/40360730377 .
- [x] V-014 [status:verified] October 26: private off-checkout source archive/all-reference bundle checksums verify; isolated clone tree matches 4f2618988729c2fb1101545036ed252e5377a9d7, full clean reinstall/audit/153 tests and all standard checks pass, and restored compiled startup reports clean 121d9de with Node 24.22.1/OpenSSL 3.5.9. Replit independently rehearses both source/history restores and preserves all eight prior branches.
  - Evidence: 2026-10-26 16:40 UTC PASS: protected bundle-verify.txt, recovery-SHA256SUMS, restore-clone.txt, restore-validation.txt, restore-health.json and replit-preparation.txt; private operator recovery directory /Users/davedxn/Downloads/Device_Triage_Recovery_2026-10-26/ .
- [x] V-015 [status:verified] October 26: final local browser passes malformed imports, invalid draft retention, damaged-progress startup/recovery copy, persisted zero-risk success and all three built-in completions (risk 0 / 2 / 0), all-built-in badge and reload persistence. Locale/chunk aborts recover correctly. Public 121d9de core learner acceptance passes all 24 layout/language/view cases, state preservation, focus/keyboard, author/import/quota and report contents with zero baseline console errors/warnings. Four entry asset hashes, APIs, headers and exact clean public revision match.
  - Evidence: 2026-10-26 16:38-16:48 UTC PASS: protected local-extra-proof.txt, local-all-scenarios-proof.txt, local-recovery-proof.txt, live-http-verified.json, live-learner-proof.txt, live-console-baseline.txt and live-report-proof.json. Final edge checks/settings publication are recorded in V-016/V-017.

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
- [x] R-004 [status:accepted_risk] Local Node 24.22.1 was freshly verified, not installed by this audit. Chrome 155.0.8059.85/Unbound 1.24.2 are historical October 23 observations, not fresh device attestation; no unrelated device/service changes were made. Owner: device operator. Closure: separately scoped device checks/updates/relaunch/restart.
- [x] R-005 [status:accepted_risk] Actual publication logs now prove checksum-verified build, clean lifecycle-disabled install and offline start; final revision-scoped serving logs show patched runtime and no errors after the final startup in the bounded window. Saved command-override fields and managed image/rollback retention remain unexposed. Independent source recovery is verified, not a provider-retention guarantee. Owner: provider/operator. Closure: obtain provider retention/override-field evidence only before making broader infrastructure claims; investigate sustained 5xx or post-start errors. Historical missing runner archives remain unverified.

The terminal risk labels record scoped deferrals with owners, not user approval, completed remediation or blanket security acceptance. Application release sign-off does not close these external investigations.

## Outcome

Application fixes through October 26 are committed/pushed as 121d9de on main and the audit branch. Final public fb15dd checkpoint has the identical reviewed tree and clean provenance at https://devicetriage.replit.app . Patched dependencies/runtime, actual guarded build/start, matching assets, full learner/edge/recovery acceptance, saved outage/security settings and independent source restoration are verified. Human pilot is explicitly waived; external provider/device/incident-response limits above are not falsely marked fixed. Closeout commits contain documentation only.

## Change Log

- 2026-10-22: reviewed prior audits, preserved existing edits and completed static precheck before runtime execution.
- 2026-10-22: refreshed sources, implemented compatible local fixes, tested isolated patched runtime and documented deployment/device/incident-response blockers.
- 2026-10-23: preserved Replit history, fixed generated-state checks, discovered and corrected locale/focus-triggered learner resets, fixed language-menu focus accessibility, committed/pushed and verified the actual public release. Retained first-attempt failures and final passing acceptance evidence.
- 2026-10-26: patched newly flagged Zod paths, bounded validation, repaired progress/zero-risk/badge edge cases, verified 153 tests/CI/npm/OSV, restored private recovery source, deployed identical-tree publication checkpoint, explicitly published and reloaded outage/security settings, and verified fresh public acceptance plus revision-scoped guarded serving startup.
