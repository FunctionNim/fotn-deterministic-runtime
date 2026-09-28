# MECHANISM DISCOVERY TRIAL 001E — SHARED-UPSTREAM REMOVAL / NECESSITY QUALIFICATION

## Status

BOUNDED SYNTHETIC NECESSITY QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether the shared synthetic input is required for proposal generation or only modulates the shared-dependent state of the two independently generated proposals.

## Frozen basis

Parent fixture: MECHANISM DISCOVERY FIXTURE 001B.
Prior findings:
- 001C: family-specific perturbations change only the perturbed family proposal.
- 001D: changing the shared token changes both proposals.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Removal condition

Baseline:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Removal trial:
- shared token = SYNTHETIC_SHARED_TOKEN_ABSENT
- CM token unchanged
- WS token unchanged

The ABSENT token is an explicit synthetic observation state. It is not a claim about real-world biological absence.

## Observation

Observed:
- CM proposal still generated.
- WS proposal still generated.
- CM family token remained unchanged.
- WS family token remained unchanged.
- Both proposal objects changed because their observed shared-state field changed from baseline to ABSENT.

## Necessity qualification

`SHARED_INPUT_NOT_REQUIRED_FOR_PROPOSAL_GENERATION`

Meaning:
Within this synthetic fixture, proposal generation does not require the baseline shared token to be present.

`SHARED_INPUT_REQUIRED_FOR_BASELINE_SHARED_STATE`

Meaning:
The baseline shared-dependent proposal state cannot remain byte-identical when the shared input is removed.

Combined relation:
`COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE`

## Important boundary

001E does not establish that the shared input is biologically optional, historically optional, or optional in any source-native Artificial Civilization model.

The observed result follows from this synthetic fixture's explicit generator contract:
- family-specific tokens are sufficient for the generators to return proposal objects;
- the shared token is recorded as part of proposal state.

Therefore 001E qualifies necessity only inside the designed research fixture.

## Relationship to 001C and 001D

001C:
- family-specific perturbations remain local.

001D:
- shared-input perturbation changes both proposals.

001E:
- removing the shared input does not prevent either proposal from generating;
- removal does alter both proposals' shared-dependent state.

Synthetic model to date:

CM-specific input → CM proposal generation/state
WS-specific input → WS proposal generation/state
shared input → CM shared-dependent state
shared input → WS shared-dependent state
shared input is NOT required for proposal object generation

No direct CM→WS or WS→CM edge is qualified.

## Verification

Focused 001B–001E:
- 4 test files / 40 tests / 40 PASS.

Full deterministic suite:
- 43 test files / 718 tests / 718 PASS.

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

The synthetic model now distinguishes shared-input sensitivity from shared-input necessity.

### What did not change

The collision remains unresolved.
No winner, merge, state commit, scheduler, family authority, or resolver is introduced.
No historical source is rewritten.

### Current evidence state

`COMMON_UPSTREAM_MODULATOR_NOT_GENERATION_PREREQUISITE` for synthetic fixture 001B–001E only.

### Reopening condition

Reopen if:
- a richer generator contract fails when shared input is absent;
- proposal generation becomes conditional on shared input;
- shared removal changes family-specific input handling;
- source-native evidence contradicts this synthetic topology;
- or a later memory/history mechanism changes the response to shared-input removal.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001F — SHARED-UPSTREAM RESTORATION / REVERSIBILITY QUALIFICATION.

Primary question:
After the shared input is removed and both proposals adopt the ABSENT shared state, does restoring the original shared input return both proposals byte-identically to the original baseline, or does prior absence leave residue?

Purpose:
Distinguish reversible modulation from history-dependent/hysteretic response without assuming memory in advance.
