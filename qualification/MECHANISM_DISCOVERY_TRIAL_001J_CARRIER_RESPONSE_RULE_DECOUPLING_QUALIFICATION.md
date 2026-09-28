# MECHANISM DISCOVERY TRIAL 001J — CARRIER / RESPONSE-RULE DECOUPLING QUALIFICATION

## Status

BOUNDED SYNTHETIC DECOUPLING QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether stored history can remain fully present while its present-state residue expression disappears when only the response rule that reads that history is disabled.

## Frozen basis

Parent result: MECHANISM DISCOVERY TRIAL 001I.

Prior chain:
- 001F: no carrier → no residue after restoration.
- 001G: explicit carrier + prior exposure → positive-control residue.
- 001H: carrier-effect ablation → residue disappears; necessity qualified.
- 001I: introducing enabled carrier + prior exposure → residue appears; sufficiency qualified within minimal synthetic mechanism.

001J separates the stored history record from the rule that expresses that record.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Matched conditions

Both conditions use byte-identical present inputs:
- shared token = SYNTHETIC_SHARED_TOKEN
- CM token = SYNTHETIC_CM_TOKEN
- WS token = SYNTHETIC_WS_TOKEN

Both conditions contain the same byte-identical stored history carrier:
- carrierId = MDF-001G-HISTORY-CARRIER-001
- priorSharedAbsenceObserved = true
- priorAbsenceCount = 1
- lastPriorSharedState = SYNTHETIC_SHARED_TOKEN_ABSENT

Both conditions generate byte-identical current CM and WS proposal payloads.

The only qualified difference is:
- response-rule enabled = true
- response-rule enabled = false

## Observation

Response rule enabled:
- stored history remains present
- CM response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE
- WS response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE

Response rule disabled:
- the same stored history remains present
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

Observed:
- stored history survives response-rule disablement;
- present inputs remain unchanged;
- current proposal payloads remain unchanged;
- residue expression disappears when the response rule is disabled.

## Decoupling qualification

`HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED`

Meaning:
Within the synthetic stateful model, keeping a history record and expressing that history in current behavior are distinct mechanisms.

A stored history record is not identical to a current response effect.

## Important boundary

001J does NOT establish:
- that biological memory storage and expression use this architecture;
- that historical Artificial Civilization uses this architecture;
- that storage is itself necessary for every future memory model;
- that the response rule is the only possible reader of stored history;
- that dormant stored history has no other observable effects;
- direct CM→WS or WS→CM causation;
- any resolver, authority, or state-commit law.

Accordingly:
- storageNecessityClaimPermitted = false
- biologicalMemoryClaimPermitted = false
- historicalArtificialCivilizationMemoryClaimPermitted = false

## Relationship to 001H and 001I

001H established causal necessity of the explicit carrier effect for synthetic residue.

001I established sufficiency of the enabled carrier with defined prior exposure in the minimal mechanism.

001J now decomposes that mechanism:
- carrier/history record = storage
- response rule = expression

Stored history can remain present while expression is disabled.

Therefore:
`MEMORY STORAGE ≠ MEMORY EXPRESSION`

inside this synthetic model.

## Verification

Focused 001B–001J:
- 9 test files / 95 tests / 95 PASS.

Full deterministic suite:
- 48 test files / 773 tests / 773 PASS.

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

The synthetic memory mechanism is no longer treated as one indivisible thing. Stored history and present-state expression are independently observable and controllable.

### What did not change

The original stateless fixture remains reversible and residue-free.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`HISTORY_STORAGE_AND_RESPONSE_EXPRESSION_DECOUPLED` for the synthetic 001G–001J stateful fixture only.

### Reopening condition

Reopen if:
- disabling the response rule alters or erases the stored history itself;
- residue persists when all known response rules are disabled;
- stored history produces another present-state effect;
- another reader can express the same stored record;
- or source-native evidence identifies a different storage/expression architecture.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001K — DORMANT HISTORY / REACTIVATION QUALIFICATION.

Primary question:
If the history carrier remains stored while the response rule is disabled for one or more matched-current-input cycles, then the response rule is re-enabled later without changing the stored history, does the residue response return?

Purpose:
Test whether stored-but-unexpressed history can remain dormant and later be re-expressed, separating persistence of storage from continuity of expression.
