# MECHANISM DISCOVERY TRIAL 001H — HISTORY CARRIER ABLATION / CAUSAL NECESSITY QUALIFICATION

## Status

BOUNDED SYNTHETIC ABLATION QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether the explicit synthetic history-carrier effect is causally necessary for the residue response when:
- current inputs are matched;
- prior exposure history is matched;
- current proposal payloads are matched;
- only carrier-effect enablement differs.

## Frozen basis

Parent positive-control fixture: MECHANISM DISCOVERY TRIAL 001G.

001G established:
- identical current inputs;
- identical current proposal payloads;
- different explicit history carrier states;
- history-dependent response-form difference;
- HYSTERESIS_POSITIVE_CONTROL_DETECTED.

001H holds prior exposure history constant and ablates only the carrier's ability to influence response.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Matched conditions

Both conditions use the same present input:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Both conditions use the same prior exposure history:
- priorSharedAbsenceObserved = true
- priorAbsenceCount = 1
- lastPriorSharedState = SYNTHETIC_SHARED_TOKEN_ABSENT

Both conditions generate byte-identical current CM and WS proposal payloads.

The only qualified difference is:
- carrier-enabled condition: carrier effect enabled = true
- carrier-ablated condition: carrier effect enabled = false

## Observation

Carrier enabled:
- CM response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE
- WS response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE

Carrier ablated:
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

Observed:
- residue present with carrier effect enabled;
- residue absent with carrier effect disabled;
- present inputs matched;
- prior exposure histories matched;
- current proposal payloads matched.

## Causal necessity qualification

`EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE`

Meaning:
Within the 001G/001H synthetic stateful model, the explicit carrier effect is necessary for the residue response under the tested matched conditions.

When the carrier effect is ablated, the residue response disappears even though prior exposure history remains recorded.

## Important boundary

Necessity does not establish sufficiency beyond this designed mechanism.

The result does NOT establish:
- biological memory;
- historical Artificial Civilization memory;
- that all history carriers behave this way;
- that the carrier alone would generate residue without the explicit response rule;
- direct CM→WS or WS→CM causation;
- any resolver or authority law.

Accordingly:
- sufficiencyClaimPermitted = false
- biologicalMemoryClaimPermitted = false
- historicalArtificialCivilizationMemoryClaimPermitted = false

## Relationship to 001F and 001G

001F:
- no history carrier;
- restoration fully reversible;
- no residue observed.

001G:
- explicit history carrier introduced;
- matched current inputs with different histories;
- positive-control residue detected.

001H:
- prior exposure history held fixed;
- carrier effect ablated;
- residue disappears.

Together:
- the stateless fixture has no residue;
- an explicit stateful carrier can produce detectable residue;
- the carrier effect is causally necessary for that synthetic residue under matched conditions.

## Verification

Focused 001B–001H:
- 7 test files / 73 tests / 73 PASS.

Full deterministic suite:
- 46 test files / 751 tests / 751 PASS.

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

The synthetic history-carrier model now has a causal-necessity qualification rather than only a positive-control correlation.

### What did not change

The original stateless fixture remains reversible with no residue.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`EXPLICIT_HISTORY_CARRIER_EFFECT_CAUSALLY_NECESSARY_FOR_SYNTHETIC_RESIDUE` for synthetic fixture 001G/001H only.

### Reopening condition

Reopen if:
- residue persists despite carrier-effect ablation;
- matched present inputs diverge;
- matched prior exposure histories diverge;
- current proposal payloads diverge;
- a different carrier can sustain residue after this carrier is disabled;
- or a source-native mechanism identifies an alternate causal pathway.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001I — HISTORY CARRIER SUFFICIENCY / MINIMAL-CAUSE QUALIFICATION.

Primary question:
With matched present inputs and no prior-exposure residue response active by default, is introducing only the enabled explicit history carrier with a defined prior-exposure state sufficient to generate the residue response?

Purpose:
Test sufficiency separately from necessity, while preserving the distinction that a mechanism may be necessary without being sufficient in a richer model.
