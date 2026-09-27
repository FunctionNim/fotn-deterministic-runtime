# LOCAL UPDATE CHANNEL HARDENING 002 — RUNBOOK

## Metadata
- Status: In progress
- Owner: Grimoire project owner
- Operator: ChatGPT under owner authorization
- Last verified: 2026-09-26
- Target: AaronM Windows local runtime
- Change ID: LOCAL-UPDATE-HARDENING-002
- Source repository: FunctionNim/fotn-deterministic-runtime
- Parent main: 02ee4a59bd84e88c31b6254066705c29d95d5767
- Branch: local-update-hardening-v0-2

## Objective
Harden the installed local update channel with visible version/status reporting, a canary-gated owner rollback control, an append-only update history ledger, and a Windows Authenticode signing pipeline. Actual trusted signing remains held unless a valid code-signing certificate with private key is available.

## Scope
Included: status UX, rollback UX, update/rollback ledger, signing readiness/sign/verify scripts, permanent local bootstrap qualification.
Excluded: public update service, unattended download, LAN/public exposure, Windows service, startup registration, certificate purchase/enrollment, trust-store mutation.
Must remain unchanged: localhost-only runtime, GP-TEST-001 canaries, Water/structural/thermal invariants, parent-level update bootstrap, one-version rollback preservation.
## Preconditions
- [x] Permanent runtime installed at v0.1.1 and stopped.
- [x] previous contains v0.1.0.
- [x] updater bootstrap repair is integrated.
- [x] Remote main verified at parent commit.
- [x] Isolated hardening worktree created.
- [x] Baseline typecheck/test/build PASS: 647/647 tests.
- [x] Windows SDK SignTool present.
- [x] Code-signing certificate inventory checked.
- [ ] Hardening implementation committed.
- [ ] Update ledger qualification passes.
- [ ] Rollback forward/back qualification passes.
- [ ] Status visibility qualification passes.
- [ ] Signing pipeline readiness qualification passes.
- [ ] Permanent bootstrap passes.

## Risk and stop conditions
Stop if rollback candidate identity is invalid, any canary fails without restoration of the original current version, ledger writes secrets, updater/rollback touches outside the LocalRuntimeAdapter parent, runtime binds beyond 127.0.0.1, or signing requires trust-store/private-key manipulation not explicitly authorized.
Actual trusted signing must STOP with CERTIFICATE_REQUIRED when no valid private-key code-signing certificate is available.
## Evidence plan
Record current/previous versions, source commits, baseline hash, action result, package hash when applicable, canary count/result, updater/rollback timestamp, signing readiness state, SignTool path, and signature verification result.
Store update history in parent-level history\update-history.ndjson and qualification receipts.
Never record certificate private keys, passwords, secrets, unrelated user data, or raw PFX content.

## Procedure
### Phase 1 — Append-only ledger
1. Add a parent-level ledger helper.
2. Update the updater to append UPDATE_PASS or UPDATE_ROLLBACK entries.
3. Ledger entries must be one JSON object per line and never rewrite prior lines.
4. Verify two sequential entries preserve the first byte-for-byte.

### Phase 2 — Version/status visibility
1. Add Show-LocalRuntimeStatus.ps1 and owner CMD launcher.
2. Display Installed, Previous, Runtime, Last Update, Last Canary, Baseline Hash, and Signing.
3. Status reads only stable parent/current markers, listener state, ledger tail, and Authenticode status.
4. Add desktop shortcut during permanent bootstrap.
### Phase 3 — Manual rollback UX
1. Add Rollback-LocalRuntime.ps1 at parent level.
2. Require both current and previous valid product markers.
3. Stop current runtime.
4. Swap current and previous through a rollback staging name.
5. Start restored candidate on loopback, run health + all 14 GP canaries, then stop.
6. On verification failure, restore original current automatically.
7. Append MANUAL_ROLLBACK_PASS or MANUAL_ROLLBACK_RESTORED_CURRENT to ledger.

### Phase 4 — Signing pipeline
1. Add signing readiness script that locates x64 SignTool and code-signing certificates with private keys.
2. Add Sign-FOTNRelease.ps1 requiring explicit certificate thumbprint and RFC3161 timestamp URL.
3. Sign with SHA-256 and verify with SignTool default authentication policy.
4. Never auto-select a certificate silently.
5. If no suitable certificate exists, return CERTIFICATE_REQUIRED and preserve unsigned release state.

### Phase 5 — Qualification clone
1. Mirror permanent parent/current/previous topology.
2. Seed ledger.
3. Qualify status output.
4. Roll back v0.1.1 → v0.1.0; require 14 canaries PASS.
5. Roll forward via rollback again v0.1.0 → v0.1.1; require 14 canaries PASS.
6. Verify ledger append-only behavior and stopped resting state.
### Phase 6 — Permanent bootstrap
1. Copy qualified parent-level updater, ledger helper, status, rollback, and launchers into permanent parent.
2. Create Status and Rollback desktop shortcuts.
3. Do not roll back permanent runtime during bootstrap.
4. Verify installed remains v0.1.1, previous remains v0.1.0, runtime stopped, no service/task/firewall mutation.
5. Run status surface.

## Rollback
Hardening bootstrap rollback removes only new parent-level scripts and new desktop shortcuts after hash/identity verification. Existing Update bootstrap and current/previous runtime directories remain untouched.
If a manual rollback qualification fails, script must restore the original current automatically before returning failure.

## Completion criteria
- [ ] Status shows correct current/previous/running/ledger/signing state.
- [ ] Update history ledger is append-only.
- [ ] Manual rollback v0.1.1 → v0.1.0 passes 14 canaries.
- [ ] Reverse rollback v0.1.0 → v0.1.1 passes 14 canaries.
- [ ] Failed rollback restoration path is qualified.
- [ ] Signing readiness reports actual host state.
- [ ] Sign script enforces SHA-256, timestamp URL, explicit thumbprint, and post-sign verification.
- [ ] Permanent bootstrap installed without changing runtime version.
- [ ] No service/task/firewall/public exposure created.
- [ ] Full repository regression passes.
- [ ] Qualification receipt committed.

## Communications
Report signing availability separately from functional hardening. A missing trusted certificate is a bounded HOLD, not a failed rollback/status qualification.

## Record
- Started: 2026-09-26
- Completed: pending
- Outcome: pending
- Signing state at start: SignTool present; no code-signing certificate with private key found
- Next gate after PASS: owner lock/integration; certificate enrollment/signing as separate trust gate if desired
