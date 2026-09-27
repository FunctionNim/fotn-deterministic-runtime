# LOCAL UPDATE CHANNEL QUALIFICATION 001

## Metadata
- Status: In progress
- Owner: Grimoire project owner
- Operator: ChatGPT under owner authorization
- Date: 2026-09-26
- Device: AaronM
- Parent main commit: 02edc50d0c721c5b7c780e3c78275ba6a4c7e69a
- Branch: local-update-channel-v0-1

## Objective
Qualify a local update channel that replaces the installed FOTN Local Runtime Adapter without manual uninstall/reinstall, preserves one previous version, verifies every update file by SHA-256, runs GP-TEST-001 after the swap, and automatically restores the previous version when post-update qualification fails.

## Scope
Included: local update ZIP, manifest, staging, atomic directory swap, one-version rollback, health + 14 GP canaries, permanent updater bootstrap.
Excluded: unattended Internet polling, auto-download, public update server, code signing, Windows service, startup registration, LAN/public exposure.
Must remain unchanged: localhost-only binding, GP-TEST-001 meanings, Water/structural/thermal laws, NaShaTa mediation, permanent install data boundary.
## Preconditions
- [x] Permanent local installation 001 complete.
- [x] Installed v0.1.0 remains stopped and healthy.
- [x] Remote main verified at parent commit.
- [x] Isolated update-channel worktree created.
- [x] Baseline typecheck/test/build pass.
- [ ] Updater source committed.
- [ ] Commit-bound good and fault update packages built.
- [ ] Forward update qualification passes.
- [ ] Automatic rollback qualification passes.
- [ ] Permanent updater bootstrap passes.

## Risk and stop conditions
Stop on wrong install identity, manifest/hash mismatch, non-loopback listener, canary failure without successful rollback, deletion outside current/previous/staging directories, service/task/firewall mutation, or update package/source-commit mismatch.
Updater must leave runtime stopped after successful update and after rollback verification.
## Evidence plan
Record current and target versions, updater commit, package hashes, manifest source commit, forward-update proof, rollback proof, current/previous markers, GP baseline hash, 14 canary results, permanent bootstrap files, and system-residue checks.
Never record secrets or unrelated user files.

## Procedure
### Phase 1 — Commit-bound update package
1. Commit updater/build source.
2. Build valid v0.1.1 package from exact commit.
3. Build fault-injection v0.1.2 package from same commit with a manifest-valid but bad health identity.
4. Record package SHA-256 hashes.

### Phase 2 — Clone qualification
1. Clone current permanent v0.1.0 installation into isolated qualification root.
2. Apply v0.1.1 using updater.
3. Verify current marker v0.1.1 and previous marker v0.1.0.
4. Verify health and all 14 canaries.
5. Verify runtime is stopped after update.
### Phase 3 — Automatic rollback
1. Apply fault-injection v0.1.2 to the qualified clone.
2. Require post-swap health failure.
3. Require automatic rollback to v0.1.1.
4. Verify restored health + all 14 canaries.
5. Require failed v0.1.2 not to remain current.

### Phase 4 — Permanent channel bootstrap
1. Copy only the qualified updater script and update launcher into the permanent v0.1.0 installation.
2. Verify their hashes against committed source.
3. Do not update permanent runtime version during this qualification.
4. Place owner-facing Update launcher shortcut if desired by package design.
5. Verify no service/task/firewall mutation.

## Rollback
Qualification clone may be deleted after verifying its marker.
Permanent bootstrap rollback means remove only updater files/shortcut added in this phase.
No runtime version swap occurs on the permanent installation during bootstrap.
## Completion criteria
- [ ] Valid update package verified.
- [ ] Forward update v0.1.0 → v0.1.1 PASS.
- [ ] previous retains v0.1.0.
- [ ] Fault update triggers automatic rollback.
- [ ] Restored v0.1.1 passes all 14 canaries.
- [ ] Permanent install receives updater files only.
- [ ] Permanent installed version remains v0.1.0.
- [ ] Runtime remains stopped.
- [ ] No service/task/firewall change.
- [ ] Qualification receipt committed.
- [ ] No public or unattended update mechanism created.

## Communications
Report start, first failed gate, successful forward update, successful rollback, permanent bootstrap, and final disposition in the owner-authorized project conversation.

## Record
- Started: 2026-09-26
- Completed: pending
- Outcome: pending
- Next gate after PASS: owner lock, push/integration, then first real owner-locked runtime update package.
