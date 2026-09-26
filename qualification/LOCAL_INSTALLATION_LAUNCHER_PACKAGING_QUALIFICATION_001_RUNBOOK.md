# LOCAL INSTALLATION + LAUNCHER PACKAGING QUALIFICATION 001

## Metadata
- Status: In progress
- Owner: Grimoire project owner
- Operator: ChatGPT under owner authorization
- Last verified: 2026-09-26
- Target environment: AaronM Windows computer, local-only
- Change ID: LOCAL-INSTALL-LAUNCHER-PACKAGING-001
- Repository: FunctionNim/fotn-deterministic-runtime
- Qualified parent commit: 5405b6ffeb057a3f3ac9105da0e84f72b6501e3b
- Branch: local-install-launcher-packaging-v0-1
- Worktree: C:\Users\dyron\Documents\Grimoire\LOCAL-INSTALL-PACKAGING-001
- Installer version: 0.1.0

## Objective
Qualify a Windows-local, double-clickable installer for the owner-locked deterministic runtime adapter. The installer must bundle its own Node runtime, install only local application files, expose the adapter only on 127.0.0.1, provide Start/Stop/Health/Uninstall launchers, preserve GP-TEST-001 behavior, and support clean removal.

## Scope
Included:
- IExpress self-extracting EXE installer.
- Bundled node.exe from the qualified host.
- Compiled LOCAL-RUNTIME-ADAPTER-001 and GP-TEST-001 runtime files only.
- SHA-256 payload manifest verification before installation.
- Local Start, Stop, Health, and Uninstall launchers.
- Isolated qualification install/uninstall round trip.
- Final installer checksum and source-commit binding.

Excluded:
- public network exposure;
- Windows service registration;
- startup registration;
- firewall changes;
- registry-based auto-run;
- persistence of game/world sessions;
- code signing;
- auto-update;
- Replit;
- AppDeploy hosting.

Must remain unchanged:
- localhost-only host binding;
- GP-TEST-001 fixture;
- parent Water/Structural/Thermal laws;
- NaShaTa mediation semantics;
- existing deterministic test behavior;
- parent source history and owner-lock receipts.

## Preconditions
- [x] Local adapter qualification owner-locked and integrated into main at 5405b6ffeb057a3f3ac9105da0e84f72b6501e3b.
- [x] Windows IExpress present.
- [x] Host Node executable available for bundling.
- [x] Preliminary installer build succeeded.
- [x] Preliminary isolated install succeeded.
- [x] Preliminary installed runtime passed all 14 GP canaries.
- [x] Preliminary Start/Stop round trip passed.
- [x] Preliminary uninstall removed the qualification install root.
- [ ] Packaging source committed.
- [ ] Final installer rebuilt from exact packaging commit.
- [ ] Final installer round trip requalified.

## Risk and stop conditions
- Stop if installer source commit and manifest source commit disagree.
- Stop if any payload file hash fails verification.
- Stop if install writes outside the chosen install root except an optional owner-facing shortcut.
- Stop if runtime binds to anything other than 127.0.0.1.
- Stop if installer requires npm, Vitest, Vite, or development dependencies at runtime.
- Stop if any GP canary fails.
- Stop if Water, structural load, heat, replay, or reset invariants drift.
- Stop if uninstall removes files outside the marked installation root.
- Stop if installer adds a service, startup task, firewall rule, or public listener.
- Stop if final build cannot be reproduced from the committed packaging source.

## Evidence plan
Record packaging commit, installer SHA-256, installer byte size, payload ZIP SHA-256, bundled Node version/hash, install root, manifest verification, listener address, all 14 GP canary results, stop result, uninstall result, and final Git status.
Do not record secrets, credentials, or unrelated files.

## Procedure
### Phase 1 — Package construction
1. Compile the TypeScript runtime.
2. Copy only adapter and GP fixture compiled files into payload.
3. Copy bundled node.exe.
4. Add local launcher scripts.
5. Generate install marker and SHA-256 manifest.
6. Compress payload.zip.
7. Build one IExpress setup EXE.
8. Record build metadata and hashes.

### Phase 2 — Isolated installation
1. Set a qualification-only install root.
2. Disable shortcut creation for qualification.
3. Execute the installer.
4. Require installation marker and manifest.
5. Re-hash installed payload files and compare with manifest.

### Phase 3 — Installed runtime qualification
1. Start through the installed launcher.
2. Verify listener exactly 127.0.0.1:24701.
3. Verify /health identity.
4. Run GPF-001 through GPF-014 over HTTP.
5. Stop through installed launcher.
6. Verify port 24701 is closed.

### Phase 4 — Uninstall qualification
1. Run installed uninstall launcher.
2. Verify marked install directory disappears.
3. Verify localhost port remains closed.
4. Verify no startup/service/firewall changes were created.

### Phase 5 — Commit-bound rebuild
1. Commit packaging source and this runbook.
2. Rebuild installer from that exact commit.
3. Repeat Phases 2–4 on the final artifact.
4. Create qualification receipt.
5. Leave permanent installation and source integration as separate owner gates.

## Rollback
Trigger: packaging failure, hash mismatch, wrong target, canary failure, listener exposure, or uninstall boundary failure.
Actions:
1. Stop the local adapter.
2. Remove only the isolated qualification install root after verifying its installation marker.
3. Preserve installer/build evidence for diagnosis.
4. Leave parent main and existing qualified runtime untouched.
Verification:
- qualification install root absent;
- port 24701 closed;
- parent source branch unchanged;
- existing test suite still green.
Limitations:
No persistent data migration exists in this phase, so rollback requires no data restore.

## Completion criteria
- [ ] Packaging source committed.
- [ ] Final installer built from exact packaging commit.
- [ ] Installer SHA-256 recorded.
- [ ] Bundled Node version/hash recorded.
- [ ] Manifest verification passes.
- [ ] Final isolated install passes.
- [ ] Start launcher passes.
- [ ] All 14 GP canaries pass from installed copy.
- [ ] Stop launcher closes port.
- [ ] Uninstall removes only marked installation root.
- [ ] No service/startup/firewall/public exposure created.
- [ ] Qualification receipt created.
- [ ] Packaging branch clean after receipt commit.
- [ ] No permanent install performed.

## Communications
Report start, first failure, qualification completion, final installer identity, and remaining holds in the owner-authorized project conversation.
Watcher may witness evidence and drift; Watcher does not independently authorize permanent installation.

## Record
- Started: 2026-09-26
- Completed: pending
- Operator: ChatGPT
- Approvals: owner authorized proceeding with the recommended local installation/launcher packaging phase
- Outcome: pending
- Deviations: IExpress required TMP to be populated from TEMP; build script now enforces this.
- Follow-up: owner lock/integration of packaging, then permanent local installation
