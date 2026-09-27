# PRESSUREBOUND CONSUMER INTEGRATION 001 — RUNBOOK

## Metadata
- Status: In progress
- Owner: Grimoire project owner
- Operator: ChatGPT under owner authorization
- Date: 2026-09-26
- Device: AaronM
- Repository: FunctionNim/fotn-deterministic-runtime
- Parent main: 9addfbc7b38e998ffb97ec36eac958d85417d074
- Branch: pressurebound-consumer-integration-v0-1
- Consumer: actual local PRESSUREBOUND static build dated 2026-09-23
- Consumer deployment marker: 1e7065ec-8bd9-481b-bacf-f812810efae0

## Objective
Connect the actual local PRESSUREBOUND game to the installed FOTN deterministic runtime through one localhost same-origin launch surface, without downgrading the game, replacing its current bundled engine with an older source snapshot, or inventing gameplay authority that has not been migrated.

## Scope
Included:
- exact-hash binding of the current local PRESSUREBOUND build;
- localhost static hosting by the installed runtime;
- visible runtime consumer handshake injected at serve time;
- runtime refusal when any bound game file drifts;
- v0.2.0 local update packaging;
- stable parent-level PRESSUREBOUND launcher;
- cloned-install qualification before permanent mutation.

Excluded:
- Replit access or use;
- replacement with the older AppDeploy source snapshot;
- gameplay transition-authority migration;
- public hosting;
- LAN exposure;
- alteration of the existing hosted PRESSUREBOUND launcher;
- rewriting compiled game logic.

## Preservation boundary
Must remain unchanged:
- the five qualified local PRESSUREBOUND build files on disk;
- the bundled game engine and durable-save behavior;
- deployment ID and protected-rule markers;
- existing GP-TEST-001 runtime canary;
- localhost-only runtime binding;
- local update/rollback/status hardening;
- previous runtime rollback lineage.

The runtime may inject only the consumer-status script into the HTTP response for index.html. The original on-disk index.html hash must remain unchanged.

## Preconditions
- [x] LOCAL UPDATE CHANNEL HARDENING 002 owner-locked and integrated.
- [x] Permanent runtime current v0.1.1 / previous v0.1.0 / STOPPED.
- [x] Runtime baseline 647/647 PASS before consumer work.
- [x] Actual local PRESSUREBOUND build identified.
- [x] Older AppDeploy source snapshot identified as non-matching current build.
- [x] Replit excluded by owner instruction.
- [x] Actual build hashes captured.
- [x] Live alternate-port same-origin consumer proof PASS.
- [ ] Consumer implementation committed.
- [ ] Commit-bound v0.2.0 update built.
- [ ] Clone update qualification PASS.
- [ ] Stable launcher qualification PASS.
- [ ] Full repository regression PASS.
- [ ] Qualification receipt committed.

## Risk and stop conditions
- Stop if any bound PRESSUREBOUND file hash or byte count differs.
- Stop if deployment/protected-rule/durable-save markers are absent.
- Stop if runtime binds to anything other than 127.0.0.1.
- Stop if integration requires editing minified game logic.
- Stop if the older AppDeploy source would replace the actual current build.
- Stop if the consumer host changes GP canary behavior.
- Stop if v0.2.0 update cannot preserve v0.1.1 as previous.
- Stop if rollback no longer restores the prior runtime.
- Stop if the local game is served while build verification is HOLD.
- Stop if the implementation is described as gameplay-authority migration; that claim is not qualified in this pass.

## Evidence plan
Record:
- exact five-file PRESSUREBOUND hashes and byte counts;
- deployment and protected-rule markers;
- consumer host implementation commit;
- v0.2.0 update package SHA-256;
- clone current/previous versions;
- handshake JSON;
- served index source-hash header;
- served JS source-hash header;
- GP baseline hash;
- launcher result;
- stopped resting state;
- full repository test count.

Never record secrets, private keys, or unrelated user data.

## Procedure
### Phase 1 — Consumer identity
1. Bind the five actual static files by path, byte count, and SHA-256.
2. Verify deployment ID 1e7065ec-8bd9-481b-bacf-f812810efae0.
3. Verify protected-rule and durable-save markers in the JS bundle.
4. Treat any mismatch as DENY/HOLD.

### Phase 2 — Runtime consumer host
1. Add PRESSUREBOUND-CONSUMER-001 manifest.
2. Add /pressurebound/ same-origin hosting.
3. Add /pressurebound/consumer/handshake.
4. Inject a small runtime-status script only into the served HTML response.
5. Keep original static files unmodified on disk.
6. Return 503 on build-verification failure.

### Phase 3 — Portable tests
1. Use a synthetic five-file fixture.
2. Verify complete build PASS.
3. Verify one-file drift HOLD.
4. Verify same-origin handshake injection.
5. Verify source SHA headers.
6. Re-run existing GP adapter tests unchanged.

### Phase 4 — Versioned packaging
1. Add exact verified game files under packaging/pressurebound-web.
2. Copy compiled consumer host into update payload.
3. Copy verified game files into payload/pressurebound-web.
4. Record consumer/deployment identity in install marker and update manifest.
5. Build update version 0.2.0 from exact implementation commit.

### Phase 5 — Clone update qualification
1. Clone permanent v0.1.1 current and v0.1.0 previous topology.
2. Apply exact v0.2.0 package through the qualified updater.
3. Require current=v0.2.0 and previous=v0.1.1.
4. Start updated clone.
5. Require handshake status=ok and buildVerified=true.
6. Require deployment ID match.
7. Require served index/JS SHA headers to match the bound source.
8. Require GP baseline hash unchanged.
9. Stop clone.

### Phase 6 — Launcher qualification
1. Place stable parent-level Launch PRESSUREBOUND scripts in clone parent.
2. Run launcher with -NoBrowser.
3. Require runtime starts and consumer handshake passes.
4. Stop runtime and verify port closed.
5. Do not alter the owner’s existing hosted PRESSUREBOUND shortcut.

### Phase 7 — Final regression
1. Run typecheck.
2. Run focused consumer + adapter tests.
3. Run full deterministic suite.
4. Run production build.
5. Run git diff --check.
6. Validate runbook structure.
7. Record receipt.
8. Leave branch local/unintegrated and permanent runtime unchanged until owner lock.
