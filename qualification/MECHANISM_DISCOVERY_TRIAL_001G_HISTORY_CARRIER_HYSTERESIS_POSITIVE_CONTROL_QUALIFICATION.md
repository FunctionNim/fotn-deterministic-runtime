# MECHANISM DISCOVERY TRIAL 001G — HISTORY CARRIER INTRODUCTION / HYSTERESIS POSITIVE-CONTROL QUALIFICATION

## Status

BOUNDED SYNTHETIC POSITIVE-CONTROL QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Determine whether the mechanism-discovery apparatus can detect a history-dependent present response when current inputs are byte-identical but prior exposure differs through one explicit, inspectable history carrier.

## Frozen basis

Parent fixture: MECHANISM DISCOVERY FIXTURE 001B.

Prior result:
- 001F qualified FULLY_REVERSIBLE_NO_RESIDUE_OBSERVED in the original stateless fixture.

001G does not modify that result.
Instead, it introduces a separate explicit history carrier solely as a positive control.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## History carrier

One explicit synthetic carrier is introduced:

`MDF-001G-HISTORY-CARRIER-001`

Fields:
- priorSharedAbsenceObserved
- priorAbsenceCount
- lastPriorSharedState

Two history conditions are compared:

### Fresh history
- priorSharedAbsenceObserved = false
- priorAbsenceCount = 0
- lastPriorSharedState = SYNTHETIC_SHARED_TOKEN

### Exposed history
- priorSharedAbsenceObserved = true
- priorAbsenceCount = 1
- lastPriorSharedState = SYNTHETIC_SHARED_TOKEN_ABSENT

## Present-input control

The present input is byte-identical between fresh and exposed conditions:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Current CM and WS proposal payloads remain byte-identical across both history conditions.

The only qualified difference is the explicit history carrier.

## Observation

Fresh condition:
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

Previously exposed condition:
- CM response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE
- WS response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE

Observed:
- CM history-dependent difference = true
- WS history-dependent difference = true
- current inputs remain identical
- current proposal payloads remain identical
- history carrier differs
- response form differs

## Positive-control qualification

`HYSTERESIS_POSITIVE_CONTROL_DETECTED`

Meaning:
The apparatus can detect a response difference caused by an explicit history carrier while present inputs are matched.

This is a successful positive control for history-dependent response detection.

## Critical boundary

001G does NOT establish spontaneous hysteresis in the original 001B–001F fixture.

The history carrier was deliberately introduced and directly consumed by the history-aware wrapper.

Therefore the result proves:
- an explicit stateful carrier can create history-dependent response;
- the testing apparatus can distinguish matched-current-input runs by prior history.

It does NOT prove:
- that biology uses this carrier;
- that historical Artificial Civilization contains this carrier;
- that the original stateless fixture secretly retained memory;
- that House Pressure residue maps directly onto this implementation.

Accordingly:
- biologicalHysteresisClaimPermitted = false
- historicalArtificialCivilizationHysteresisClaimPermitted = false

## Relationship to 001F

001F:
- no history carrier;
- matched restored input returned exactly to baseline;
- no residue observed.

001G:
- explicit history carrier added in a separate positive-control fixture;
- current inputs matched;
- current proposal payloads matched;
- response forms diverged solely because history differed.

Together:
- the stateless baseline has no hysteresis;
- the apparatus can detect hysteresis when a transparent stateful carrier is deliberately present.

## Verification

Focused 001B–001G:
- 6 test files / 62 tests / 62 PASS.

Full deterministic suite:
- 45 test files / 740 tests / 740 PASS.

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

The research apparatus now has a qualified positive control for history-dependent response.

### What did not change

The original stateless fixture remains fully reversible with no observed residue.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`HYSTERESIS_POSITIVE_CONTROL_DETECTED` for the explicit synthetic history-carrier fixture only.

### Reopening condition

Reopen if:
- a different history carrier fails to produce the expected matched-input distinction;
- removal of the carrier does not remove the residue response;
- current-input mismatch is discovered;
- the current proposal payloads differ between conditions;
- or a source-native mechanism provides a different persistence pathway.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001H — HISTORY CARRIER ABLATION / CAUSAL NECESSITY QUALIFICATION.

Primary question:
If two runs have the same prior exposure history but the explicit history carrier is disabled or removed before the matched-current-input test, does the residue response disappear?

Purpose:
Move from positive-control correlation to causal necessity of the explicit carrier within the synthetic stateful model.
