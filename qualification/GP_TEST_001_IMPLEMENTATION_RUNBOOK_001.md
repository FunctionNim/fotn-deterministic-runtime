# GP-TEST-001 IMPLEMENTATION RUNBOOK 001

## Metadata

- Status: Complete
- Owner: Grimoire project owner
- Operator: ChatGPT under explicit owner authorization
- Last verified: 2026-09-26
- Target environment: isolated local Git worktree
- Change ID: GP-TEST-001-IMPLEMENTATION-001
- Repository: FunctionNim/fotn-deterministic-runtime
- Source branch: pyramid-structural-thermal-simulation-v0-1
- Source commit: 37150b545087b7b9bb3b45d17a2a298710acff19
- Execution branch: gp-test-001-implementation-v0-1
- Worktree: C:\Users\dyron\Documents\Grimoire\GP-TEST-001-IMPLEMENTATION

## Objective

Bind the locked GP-TEST-001 fixture into a separate deterministic runtime module and execute its 14 canonical failure, replay, and reset scenarios without modifying the parent Pyramid laws or existing Water runtime behavior.

## Scope

Included: the exact GP-TEST-001 island, population, watershed, Water, pump, return-zone, anchor-field, PlatedGold, Symbol, energy, and thermal fixture values; canonical hashing; replay/reset; the 14 GPF scenarios.
Excluded: physical SI mappings, visual implementation, production deployment, merge, dependency repair, and changes to parent Pyramid constants.

Must remain unchanged: existing Water runtime, parent Structural + Thermal simulator, Gravity/NaShaTa firewalls, thermal mapping, materially closed Water law, and all existing test baselines.
## Preconditions

- [x] Source remote branch verified at 37150b545087b7b9bb3b45d17a2a298710acff19.
- [x] Source worktree clean.
- [x] Isolated branch/worktree created from the exact source commit.
- [x] npm ci completed without dependency mutation.
- [x] Baseline typecheck PASS.
- [x] Baseline build PASS.
- [x] Baseline full suite: 30 files / 606 tests / 606 PASS.

## Risk and stop conditions

Stop immediately for target mismatch, Water-total mutation, non-deterministic replay, reset-hash mismatch, parent-module regression, unregistered heat deletion, structural load deletion, NaShaTa-as-hardware behavior, or any fixture value silently replacing a parent/global constant.

Normalized GP-WU/EPU/TEU/SLU/SCU values must never be described as final SI physics.

## Evidence plan

Record source/base commit, implementation commit, focused test totals, full-regression totals, canonical replay/reset results, and unresolved holds. Do not record credentials or unrelated private data.

## Procedure

### Phase 1 — Fixture module
1. Add a self-contained GP-TEST-001 module with immutable fixture definition and stable IDs.
2. Verify 3 islands, exact 10,434 km² land sum, 3,600 resident sum, 9 watersheds, 12 anchor fields, 12 Symbol sectors, 6 trunks, 3 pumps, and 9 return zones.
3. Verify total Water is exactly 12,000,000 GP-WU.

### Phase 2 — Deterministic commands
1. Implement isolated anchor, pump, return-zone, trunk, Symbol, thermal, Water-transfer, and energy commands.
2. DENY/HALT invalid Water underflow/overflow and energy imbalance before authoritative state mutation.
3. Preserve exact structural and thermal accounting.

### Phase 3 — Canonical GPF suite
1. Implement GPF-001 through GPF-014 as reproducible tests.
2. Verify one-anchor, two-anchor, pump-out, return-zone-out, trunk-out, Symbol RED, thermal peak, Water errors, energy imbalance, combined failure, replay equality, valid reset, and halted reset.
3. Require canonical SHA-256 equality for replay/reset gates.
### Phase 4 — Regression gates
1. Run focused GP-TEST-001 suite.
2. Run typecheck.
3. Run full repository deterministic suite.
4. Run production build and git diff --check.
5. Stop on any regression.

### Phase 5 — Receipt and commit
1. Create a qualification receipt with exact results.
2. Commit only the GP module, its tests, runbook, and receipt.
3. Verify clean worktree and commit identity.
4. Do not push, merge, or deploy without a separate owner authorization.

## Rollback

Trigger: failed invariant, replay/reset mismatch, target mismatch, regression, or unexpected shared-state change.

Recovery: stop execution; preserve failure evidence; discard only uncommitted GP-TEST-001 changes in the isolated worktree if owner directs; parent source branch remains the immutable recovery base at 37150b545087b7b9bb3b45d17a2a298710acff19.

Verification: source branch and existing Water/Structural + Thermal tests remain unchanged and green.

## Completion criteria

- [x] Exact GP fixture identity and counts pass.
- [x] All 14 canonical GPF scenarios pass.
- [x] Water conservation remains exact.
- [x] Structural load is never silently deleted.
- [x] Thermal mapping and heat conservation remain intact.
- [x] Replay produces identical state/hash.
- [x] Valid and halted resets reproduce exact baseline hash.
- [x] Focused GP suite passes.
- [x] Existing full suite passes.
- [x] Typecheck/build/diff-check pass.
- [x] Qualification receipt created.
- [x] Local qualification commit created.
- [x] No remote push/merge/deployment performed.

## Communications

Start, failure, and completion are reported in the active owner-authorized ChatGPT conversation.

## Record

Started: 2026-09-26.
Outcome: qualification execution PASS; local commit pending at record-finalization time.
Approvals: owner explicitly requested execution of GP-TEST-001 IMPLEMENTATION RUNBOOK 001.
Next gate after PASS: owner review/lock, then separate push authorization.
