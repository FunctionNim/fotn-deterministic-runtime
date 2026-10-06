# SEVEN NIMS WORLD ACTOR TELEPORT ADAPTER008 — Runbook C008-r1

## Metadata
- Title: SEVEN NIMS WORLD ACTOR TELEPORT ADAPTER008
- Status: Approved
- Owner and operator: Aaron / ChatGPT using connected GitHub and Google Drive sources
- Go/no-go owner: Aaron; current grant authorizes bounded Adapter008 implementation and corrective decisions
- Last verified date: 2026-10-02
- Target environment: FunctionNim/fotn-deterministic-runtime, branch `seven-nims-world-actor-teleport-adapter-008`; no deployed runtime mutation
- Expected duration: Single bounded implementation and verification session
- Change or incident identifier: C008-APP-001
- Immutable runbook revision and exact target artifact/resource identity: C008-r1; base `main@ba06f2560d4df4b5bc593b6697e72667dc8dba4e`
- Execution record: This document, section “Execution record”

## Objective
Bind one source-qualified digital identity to a distinct world-actor identity and one engine-owned authoritative location store. Verify direct teleport before/after state, identity preservation, same-request replay safety, conflicting replay refusal, stale-state refusal, permission refusal, and backend-only destination refusal without claiming deployment or physical traversal.

## Scope
- Included systems:
  - `src/runtime/world-actor-teleport-adapter-008.ts`
  - `tests/runtime/world-actor-teleport-adapter-008.test.ts`
  - Adapter008 qualification records on this branch
- Excluded systems:
  - Windows PlayableSlice001 files
  - AppDeploy deployments
  - production/live player sessions
  - existing Unit/card/player namespaces
  - Seven Nim identities or behavior
- Invariants that must remain unchanged:
  - `ola` is source identity only; the world actor has its own stable ID.
  - Nims remain non-agentive classification lenses.
  - no direct write may bypass the authoritative location store.
  - replay must never perform a second move.
  - backend-only destinations remain refused.
  - no claim of deployed/live execution from repository tests alone.

## Preconditions
- Qualification007 report is recovered and states runtime binding HOLD pending actual actor/location/action binding.
- C006 digital teleport contract remains the movement specification.
- Repository identity is `FunctionNim/fotn-deterministic-runtime`.
- Base commit is `ba06f2560d4df4b5bc593b6697e72667dc8dba4e`.
- Working changes are isolated on branch `seven-nims-world-actor-teleport-adapter-008`.
- Entry signal: Qualification007 source checks passed and explicitly named Adapter008 as the next gate.
- Entry verification: Drive report `SEVEN NIMS DIGITAL TELEPORT RUNTIME BINDING 007 — Source Qualification and Binding Gate` confirms documentary PASS, runtime teleport binding HOLD, and next gate “actual world actor and authoritative teleport transaction.”

## Risk and stop conditions
Stop the affected step if repository target changes unexpectedly, if `ola` cannot remain distinct from player/card identity, if a test requires bypassing the store, if replay increments location revision, if a refusal changes state, if backend-only destinations become admitted, or if evidence is presented as deployed/live behavior without independent deployment evidence.

## Evidence plan
Record repository commit SHAs, exact changed paths, GitHub Actions run/job IDs, and Drive publication links. Do not store credentials, tokens, local secrets, or unrelated player data.

## Procedure

### Phase 1 — Bind identity and authority
**Step ID:** C008-S01  
**Action:** Create a distinct world-actor identity `world-actor:unit:ola`, bind source identity `ola`, and register its current location in an engine-owned revisioned store.  
**Expected result:** Identity and location namespaces are explicit and authoritative location revision starts at 1.  
**Verify:** Source review shows all location mutation goes through `commitTeleport`.  
**If verification fails:** HOLD; do not add teleport execution.  
**Approval required:** Existing owner grant U-C008 applies to bounded branch implementation.  
**Retry safety:** File creation is reconciled by path/commit before retry; do not duplicate source files.

### Phase 2 — Bind teleport transaction
**Step ID:** C008-S02  
**Action:** Implement request-bound teleport with origin/revision check, permission check, destination admission, backend refusal, atomic location revision, and receipt.  
**Expected result:** A valid request produces one MOVED receipt with original before and after state.  
**Verify:** Typecheck/build and targeted test pass.  
**If verification fails:** HOLD branch; repair only within Adapter008 files.  
**Approval required:** Existing owner grant.  
**Retry safety:** Same request ID and same fingerprint must return REPLAY; conflicting fingerprint must return REFUSED.

### Phase 3 — Refusal and replay verification
**Step ID:** C008-S03  
**Action:** Run cases for direct move, stable replay, request-ID conflict, stale origin/revision, missing permission, and backend-only destination.  
**Expected result:** State changes only for the first valid move; refusals preserve state.  
**Verify:** GitHub Actions TypeScript build/typecheck/test gate passes on the branch.  
**If verification fails:** Preserve failed logs; do not relabel as pass.  
**Approval required:** Not required beyond existing bounded implementation grant.  
**Retry safety:** CI reruns are allowed only after reconciling whether code changed or the prior run was infrastructure-only.

### Phase 4 — Publish qualification evidence
**Step ID:** C008-S04  
**Action:** Record exact branch/head, test evidence, remaining limitations, and HOLD/PASS disposition in Drive.  
**Expected result:** Qualification008 states source-bound Adapter008 status without deployment overclaim.  
**Verify:** Read back Drive report and confirm exact branch/head and limitations.  
**If verification fails:** Keep publication step incomplete; source branch remains evidence.  
**Approval required:** Existing owner grant for project documentation.  
**Retry safety:** Update the same report rather than creating contradictory duplicates when possible.

## Rollback
- Trigger: Any test demonstrates identity collapse, duplicate movement on replay, refusal-state mutation, or backend admission.
- Decision owner: Aaron.
- Recovery procedure: Close or abandon the Adapter008 branch/PR; do not merge. No production rollback is required because this runbook does not deploy.
- Verification: `main` remains at or beyond its independently verified prior state without Adapter008 changes.
- Limits: Repository rollback cannot undo any separate local/deployed runtime mutation; none is authorized or claimed here.

## Completion criteria
Adapter008 is complete only when source binding exists, the six qualification families pass on the exact branch head, identity remains stable, authoritative location revision changes exactly once for the valid move, replay does not move again, refusal cases preserve state, CI evidence is attached, and the Drive report preserves the non-deployment limitation.

## Communications
Start/failure/completion are reported in this conversation and preserved in the Drive qualification report. No external notification is authorized.

## Record
### Execution record
- C008-S01: implemented on branch; source commit `29fae0fe6122042460f6888c0f6ecc033e495cdd`.
- C008-S02/C008-S03 test source: commit `cb2e383c12458e793c923802c2860bc1267f09bd`.
- CI outcome: pending at runbook creation; must be reconciled before PASS.
- Deployment: not performed.
- Deviations: none at runbook creation.
