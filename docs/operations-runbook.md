# Device Triage Operations

## Ownership And Boundaries

Service: https://devicetriage.replit.app . Replit app ID: `a636909f-cbeb-406c-bc91-5c9e186a0bce`. Repository: https://github.com/mithorizon7/Device_Triage_Network_Fix . Application/operator: David Dixon (MIT Replit workspace). Managed platform: Replit.

The application serves fictional, read-only scenario APIs. There is no application database, account system or server-side learner work. Custom scenarios and progress live in each learner's browser. Hosting recovery does not recover browser storage; learners should download scenario JSON and learning reports before clearing storage or changing devices. Invalid progress is retained under `device_triage_progress_recovery` before a repair write; a second different damaged history is not overwritten. Custom scenario writes preserve legacy entries excluded by newer validation.

## Publish

1. Review the exact application commit and clean tree. Preserve current Replit branches/publication ancestry and any uncommitted work before synchronization. Never force-push or discard another release's work.
2. Use Node 24.22.1 as pinned in `.nvmrc`. Run `npm ci --ignore-scripts`, `npm audit --audit-level=low`, `npm run check`, `npm run lint`, `npm test`, `npm run lint:i18n`, `npm run format:check` and `npm run build`. GitHub CI must pass for the pushed commit.
3. Prepare the same commit on Replit. The reviewed deployment build is `bash scripts/replit-runtime.sh build`; run is `bash scripts/replit-runtime.sh start`. The wrapper downloads only during preparation/build, verifies the pinned official archive checksum before execution, installs with lifecycle scripts disabled, and fails closed if the prepared runtime is missing at startup. Provider saved command overrides are a separate observation, not proved by the workspace declarations.
4. Publish to the existing app/domain. Retain public sharing and analytics/privacy choices. Do not unpublish or change deployment type during routine release.
5. Require `/api/health` to return `status: ok`, the exact reviewed 40-character revision and `dirty: false`. The reused Replit deployment ID does not identify the code version. Compare entry asset SHA256 hashes with the local reviewed build.
6. Check actual serving `[release]` events for revision, clean flag, Node and OpenSSL. Look for `[runtime-bootstrap]` archive checksum/install/offline-start markers in publication logs; their absence is not evidence that the guarded command ran.
7. Complete tutorial/action gates, scenario changes, language changes without lost decisions, mobile/keyboard navigation, author save/import, report contents and deliberate network/storage recovery in an isolated QA browser. Synthetic checks do not establish uncoached human usability.

## Detect And Respond

Replit uptime email notifications should be enabled for the existing account recipient, and critical-vulnerability publication blocking should be enabled. Verify saved state after publication. This does not prove inbox delivery: no deliberate public outage is introduced merely to test email. Monitoring-alert settings are separate from uptime email.

On an outage alert, open the public service and `/api/health` independently. Check Replit publication status and serving logs. A startup/readiness error during rollout is not, alone, an application crash; investigate sustained public errors, exceptions after startup or the wrong revision. Record UTC timestamps, affected paths and the release, excluding request bodies, browser storage and secrets from logs/tickets. Replit owns managed ingress, platform/image retention and infrastructure failures.

## Recover Without Reintroducing Vulnerabilities

1. Preserve the failing release, bounded logs, clean/dirty state and all unpublished work before changes. Do not assume a temporary runner backup still exists. Verify each recovery file's checksum at use time.
2. Restore the source from the private operator recovery bundle or GitHub. Verify `git bundle verify`, recorded SHA256 and the expected commit/tree in an isolated checkout. A local bundle protects source history, not provider infrastructure or learner browsers.
3. Prefer a corrective commit. If reverting a behavior change, retain current patched dependencies and runtime. Never republish an older vulnerable dependency/runtime snapshot simply because its UI worked.
4. Reinstall with `npm ci --ignore-scripts` on the pinned patched runtime, run the full suite/audit/build, and exercise the compiled artifact in isolation. Then deploy the reviewed correction using the publish procedure above.
5. Confirm exact live provenance, APIs, headers, assets, learner flow and steady-state logs. Keep the prior release branch for diagnosis. Do not claim provider image rollback or retention guarantees without direct provider evidence.

## Release Evidence

The dated audit report/checklist records actual release IDs, validation results, recovery rehearsals and limits. Protected raw evidence is in gitignored `security-evidence/YYYY-MM-DD/`; it is not a public repository artifact or a guaranteed off-machine backup. Keep the private operator recovery directory independently of checkout cleanup. Review dependency alerts and repeat release acceptance after relevant changes; point-in-time zero findings do not guarantee future security.
