# MECHANISM DISCOVERY TRIAL 001D — SHARED-UPSTREAM PERTURBATION + COMMON-CAUSE QUALIFICATION

## Status

BOUNDED SYNTHETIC SHARED-INPUT QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether changing only the shared synthetic input, while holding both family-specific inputs frozen, changes the CIVIC_METABOLISM and WORLD_SUBSTRATE proposals.

## Frozen basis

Parent fixture: MECHANISM DISCOVERY FIXTURE 001B.
Parent perturbation result: MECHANISM DISCOVERY TRIAL 001C.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Perturbation

Baseline:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Perturbed:
- shared token = SYNTHETIC_SHARED_TOKEN_PERTURBED
- CM token unchanged
- WS token unchanged

## Observation

Observed:
- CM proposal changed.
- WS proposal changed.
- Both family-specific tokens remained unchanged.
- Both proposals recorded the perturbed shared token.
- No direct CM→WS claim is permitted.
- No direct WS→CM claim is permitted.

## Relation qualification

`COMMON_UPSTREAM_RESPONSE_SUPPORTED`

Meaning:
Within synthetic fixture 001B/001C/001D, both independently callable proposal generators are sensitive to one common shared input.

This supports a shared-input/common-upstream relation in the synthetic model.

It does NOT establish:
- direct CIVIC_METABOLISM → WORLD_SUBSTRATE causation;
- direct WORLD_SUBSTRATE → CIVIC_METABOLISM causation;
- reciprocal direct coupling;
- a real biological common cause;
- a historical Artificial Civilization common cause;
- a resolver or merge law.

## Relationship to 001C

001C established:
- CM-family-specific perturbation changed CM only;
- WS-family-specific perturbation changed WS only;
- no tested direct cross-effect.

001D adds:
- shared-input perturbation changes both.

The combined synthetic structure is therefore:

CM-specific input → CM proposal
WS-specific input → WS proposal
shared input → CM proposal
shared input → WS proposal

No CM→WS or WS→CM edge is qualified.

## Causal and epistemic boundary

The shared token is deliberately consumed by both generators and exposed in both proposal objects.

Therefore 001D qualifies designed shared-input sensitivity and reproducible common-upstream response inside the synthetic fixture.

It does not independently discover an unknown hidden cause. The relation is transparent because the fixture was explicitly constructed to make shared-input participation observable.

The qualification is useful because it distinguishes:
- direct cross-family effect;
from
- common response to one upstream input.

## Verification

Focused 001B + 001C + 001D:
- 3 test files / 30 tests / 30 PASS.

Full deterministic suite:
- 42 test files / 708 tests / 708 PASS.

Additional:
- Typecheck PASS.
- Production build PASS.
- git diff --check PASS.

The relation classification is computed from observed proposal changes and can fall back to COMMON_UPSTREAM_RESPONSE_UNRESOLVED if both proposals do not respond.

## Runtime and canon effects

Production/runtime effect: NONE.
ACCQ-007 behavior: UNCHANGED.
HOLD-06: OPEN.
ACCQ-011: NOT AUTHORIZED.
Canon effect: NONE.
GamerLaStone effect: NONE.

## Return

### What changed

The synthetic model now distinguishes family-specific parallel response from shared-upstream response.

### What did not change

The collision remains unresolved.
No winner, merge, state commit, scheduler, family authority, or resolver is introduced.
No historical source is rewritten.

### Current evidence state

`COMMON_UPSTREAM_RESPONSE_SUPPORTED` for the synthetic 001B/001C/001D fixture only.

### Reopening condition

Reopen if:
- a shared-token perturbation affects only one family;
- a family-specific perturbation produces a cross-effect;
- order changes outputs;
- a richer state schema changes dependency structure;
- a persistent history carrier changes later response;
- or a concrete source-native mechanism contradicts the synthetic topology.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001E — SHARED-UPSTREAM REMOVAL / NECESSITY QUALIFICATION.

Primary question:
If the shared input is removed or replaced by an explicit neutral/absent state while both family-specific inputs remain present, do both proposals lose the shared-dependent portion of their output, continue unchanged, or fail to generate?

Purpose:
Distinguish simple shared-input sensitivity from shared-input necessity, without introducing direct CM↔WS causation.
