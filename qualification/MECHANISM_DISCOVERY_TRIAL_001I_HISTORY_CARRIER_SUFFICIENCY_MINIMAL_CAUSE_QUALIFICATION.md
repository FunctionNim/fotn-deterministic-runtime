# MECHANISM DISCOVERY TRIAL 001I — HISTORY CARRIER SUFFICIENCY / MINIMAL-CAUSE QUALIFICATION

## Status

BOUNDED SYNTHETIC SUFFICIENCY QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether introducing only the enabled explicit history carrier with a defined prior-exposure state is sufficient to generate the residue response under matched present inputs and matched current proposal payloads.

## Frozen basis

Parent necessity result: MECHANISM DISCOVERY TRIAL 001H.

001H established:
- present inputs matched;
- prior exposure history matched;
- current proposal payloads matched;
- disabling the carrier effect removed residue;
- explicit carrier effect was causally necessary for the synthetic residue.

001I tests sufficiency separately.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Baseline condition

No-carrier baseline:
- present input = baseline 001B input
- no history carrier present
- carrier effect disabled
- current CM and WS proposal payloads generated normally
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

## Carrier-introduced condition

Present input remains byte-identical to baseline.

Current CM and WS proposal payloads remain byte-identical to baseline.

Only the history mechanism is introduced:
- explicit history carrier = MDF-001G-HISTORY-CARRIER-001
- priorSharedAbsenceObserved = true
- priorAbsenceCount = 1
- lastPriorSharedState = SYNTHETIC_SHARED_TOKEN_ABSENT
- carrier effect enabled = true

Observed:
- CM response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE
- WS response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE

## Sufficiency qualification

`EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE`

Meaning:
Within this minimal synthetic stateful mechanism, introducing the enabled explicit history carrier with its defined prior-exposure state is sufficient to generate the tested residue response while current inputs and current proposal payloads remain unchanged.

## Important boundary

This sufficiency result is bounded to the deliberately constructed mechanism.

It does NOT establish:
- biological memory;
- historical Artificial Civilization memory;
- that every possible history carrier is sufficient;
- that the carrier alone is sufficient if its response rule is absent;
- that a richer model would have no additional necessary conditions;
- direct CM→WS or WS→CM causation;
- any resolver or authority rule.

Necessity and sufficiency remain separate findings:
- 001H: carrier effect necessary under the tested matched conditions;
- 001I: carrier introduction with the defined prior-exposure state sufficient within the minimal synthetic mechanism.

## Relationship to 001F–001H

001F:
- no history carrier;
- restoration fully reversible;
- no residue observed.

001G:
- explicit carrier introduced as positive control;
- matched present inputs, different history;
- residue detected.

001H:
- prior exposure held fixed;
- carrier effect ablated;
- residue disappeared;
- necessity qualified.

001I:
- no-carrier baseline has no residue;
- introduce only the enabled carrier with defined prior exposure;
- residue appears;
- sufficiency qualified for the minimal synthetic mechanism.

Together:
- the stateless fixture has no residue;
- an explicit history carrier can create residue;
- the carrier effect is necessary for that residue in the tested stateful model;
- introducing that carrier with the defined prior-exposure state is sufficient to generate that residue in the minimal stateful model.

## Verification

Focused 001B–001I:
- 8 test files / 84 tests / 84 PASS.

Full deterministic suite:
- 47 test files / 762 tests / 762 PASS.

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

The synthetic history-carrier model now has a sufficiency qualification that complements 001H's necessity result.

### What did not change

The original stateless fixture remains reversible and residue-free.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`EXPLICIT_HISTORY_CARRIER_WITH_DEFINED_PRIOR_EXPOSURE_SUFFICIENT_FOR_SYNTHETIC_RESIDUE` for the minimal synthetic stateful fixture only.

### Reopening condition

Reopen if:
- residue appears without the carrier;
- carrier introduction fails under matched present inputs;
- current proposal payloads differ across conditions;
- the response rule is separated from the carrier and residue disappears;
- a richer model adds further necessary conditions;
- or a source-native mechanism contradicts this minimal topology.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001J — CARRIER / RESPONSE-RULE DECOUPLING QUALIFICATION.

Primary question:
If the history carrier remains present with the same prior-exposure state but the residue response rule is independently disabled, does the carrier still produce any observable present-state effect?

Purpose:
Separate the stored history record from the mechanism that reads/interprets that record, so “memory storage” and “memory expression” do not collapse into one thing.
