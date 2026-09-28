# MECHANISM DISCOVERY TRIAL 001F — SHARED-UPSTREAM RESTORATION / REVERSIBILITY QUALIFICATION

## Status

BOUNDED SYNTHETIC REVERSIBILITY QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether the synthetic proposal state returns exactly to baseline after a baseline → shared-absent → shared-restored sequence, while both family-specific inputs remain unchanged.

## Frozen basis

Parent fixture: MECHANISM DISCOVERY FIXTURE 001B.

Prior findings:
- 001C: family-specific perturbations stay local.
- 001D: shared-input perturbation changes both proposals.
- 001E: shared-input absence does not stop proposal generation, but changes the shared-dependent proposal state.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Sequence

1. Baseline:
   - shared token = SYNTHETIC_SHARED_TOKEN
   - CM token = SYNTHETIC_CM_TOKEN
   - WS token = SYNTHETIC_WS_TOKEN

2. Shared absence:
   - shared token = SYNTHETIC_SHARED_TOKEN_ABSENT
   - CM token unchanged
   - WS token unchanged

3. Shared restoration:
   - shared token restored to SYNTHETIC_SHARED_TOKEN
   - CM token unchanged
   - WS token unchanged

## Observation

Observed:
- both proposals moved away from baseline during the shared-absent phase;
- the restored CM proposal is byte-identical to baseline CM;
- the restored WS proposal is byte-identical to baseline WS;
- no residual proposal-state difference remains after restoration.

## Reversibility qualification

`FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED`

Meaning:
Within the current stateless synthetic fixture, the effect of removing and restoring the shared input is fully reversible at the proposal-object level.

This is a negative result for hysteresis in the current fixture:
- no memory carrier exists;
- no history field is consumed by either generator;
- no prior-state residue changes restored output.

## Important boundary

001F does NOT establish that real biological systems lack hysteresis.
It does NOT establish that historical Artificial Civilization mechanisms are history-free.
It does NOT invalidate the House Pressure edge-memory / hysteresis work.

The current generators are stateless functions of current input. Exact restoration is therefore expected unless a history-carrying mechanism is explicitly introduced and qualified.

Accordingly:
`historyMechanismClaimPermitted = false`.

## Relationship to 001E

001E established that shared absence changes proposal state without preventing generation.

001F adds that restoring the original shared input restores the original proposal state exactly.

Combined result:
- shared input modulates proposal state;
- shared input is not a generation prerequisite;
- modulation is currently reversible;
- no residue is observed in the present stateless model.

## Verification

Focused 001B–001F:
- 5 test files / 51 tests / 51 PASS.

Full deterministic suite:
- 44 test files / 729 tests / 729 PASS.

Additional:
- Typecheck PASS.
- Production build PASS.
- git diff --check PASS.

## Runtime and canon effects

Production/runtime effect: NONE.
ACCQ-007 behavior: UNCHANGED.
HOLD-06: OPEN.
ACCQ-011: NOT AUTHORIZED.
Canon effect: NONE.
GamerLaStone effect: NONE.

## Return

### What changed

The synthetic mechanism model now has an explicit reversibility result rather than an assumption.

### What did not change

No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED` for synthetic fixture 001B–001F only.

### Reopening condition

Reopen if:
- a qualified history variable is added;
- a prior state changes later proposal output under matched current inputs;
- repeated absence/restoration produces threshold or form changes;
- a source-native mechanism introduces persistence;
- or a later model carries state across generator calls.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001G — HISTORY CARRIER INTRODUCTION / HYSTERESIS POSITIVE-CONTROL QUALIFICATION.

Primary question:
Can a separate bounded non-canon fixture deliberately introduce one explicit, inspectable history carrier so that present inputs can be matched while prior exposure differs, allowing a true positive-control test of residue/hysteresis?

Purpose:
Distinguish “no hysteresis because the current model is stateless” from “a qualified stateful mechanism can produce history-dependent response,” without silently adding memory to the existing fixture.
