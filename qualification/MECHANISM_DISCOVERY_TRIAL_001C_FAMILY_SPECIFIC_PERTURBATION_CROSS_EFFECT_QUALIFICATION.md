# MECHANISM DISCOVERY TRIAL 001C — FAMILY-SPECIFIC PERTURBATION + CROSS-EFFECT QUALIFICATION

## Status

BOUNDED SYNTHETIC PERTURBATION QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether changing one family-specific synthetic input changes only that family's proposal or also changes the other family's proposal, while the shared token and non-perturbed family token remain frozen.

## Frozen basis

Parent fixture: MECHANISM DISCOVERY FIXTURE 001B.

Baseline relation:
`PARALLEL_ONLY_BASELINE`

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Perturbation A — CM token only

Baseline:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Perturbed:
- shared token unchanged
- CM token = SYNTHETIC_CM_TOKEN_PERTURBED
- WS token unchanged

Observed:
- CM proposal changed
- WS proposal remained byte-identical
- cross-effect CM→WS = false

## Perturbation B — WS token only

Baseline:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Perturbed:
- shared token unchanged
- CM token unchanged
- WS token = SYNTHETIC_WS_TOKEN_PERTURBED

Observed:
- WS proposal changed
- CM proposal remained byte-identical
- cross-effect WS→CM = false

## Relation qualification

`PARALLEL_ONLY_PERTURBATION_SUPPORTED`

Meaning:
Within synthetic fixture 001B/001C, each proposal responds to its own family-specific token while remaining unchanged by perturbation of the other family's token.

This strengthens the zero-perturbation baseline by adding controlled family-specific perturbation evidence.

It does NOT establish:
- that historical ACCQ families are globally uncoupled;
- that no common-cause coupling exists;
- that no shared-token coupling exists;
- that no coupling would appear under a richer state schema;
- that the biological blood system behaves this way.

## Causal boundary

The current fixture supports absence of direct cross-effect for the two tested family-specific perturbations only.

It does not prove universal independence.

A future shared-input perturbation could still reveal a common upstream driver, and richer proposal semantics could reveal relationships not represented in the current symbolic interface.

## Verification

Focused 001B + 001C:
- 2 test files / 21 tests / 21 PASS.

Full deterministic suite:
- 41 test files / 699 tests / 699 PASS.

Additional:
- Typecheck PASS.
- Production build PASS.
- git diff --check PASS.

The 001C relation flags are computed from observed proposal comparisons, not hard-coded conclusions.

## Runtime and canon effects

Production/runtime effect: NONE.
ACCQ-007 behavior: UNCHANGED.
HOLD-06: OPEN.
ACCQ-011: NOT AUTHORIZED.
Canon effect: NONE.
GamerLaStone effect: NONE.

## Return

### What changed

The synthetic parallel baseline now has controlled perturbation support in both family-specific directions.

### What did not change

The collision remains unresolved.
No winner, merge, state commit, scheduler, family authority, or resolver is introduced.
No historical source is rewritten.

### Current evidence state

`PARALLEL_ONLY_PERTURBATION_SUPPORTED` for synthetic fixture 001B/001C only.

### Reopening condition

Any future test in which:
- CM-only perturbation changes WS;
- WS-only perturbation changes CM;
- a shared-input perturbation changes both;
- order changes output;
- a richer state schema creates cross-dependence;

must reopen the relation classification.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001D — SHARED-UPSTREAM PERTURBATION + COMMON-CAUSE QUALIFICATION.

Primary question:
If the shared synthetic token changes while both family-specific tokens remain frozen, do CM and WS proposals both change, one change, or neither change?

This would distinguish family-specific parallelism from a possible common-upstream/shared-input relation without introducing direct CM↔WS causality.
