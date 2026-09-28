# MECHANISM DISCOVERY TRIAL 001K — DORMANT HISTORY / REACTIVATION QUALIFICATION

## Status

BOUNDED SYNTHETIC DORMANCY / REACTIVATION QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether stored history can remain present but unexpressed across multiple matched-current-input cycles, then regain residue expression when the response rule is re-enabled without rewriting the history carrier.

## Frozen basis

Parent decoupling result: MECHANISM DISCOVERY TRIAL 001J.

001J established:
- history storage and response expression are distinct mechanisms;
- stored history can remain present while the response rule is disabled;
- disabling expression removes residue without erasing storage.

001K extends that distinction across time-like cycles.

Preserved safeguards:
- disposition = HOLD_UNRESOLVED
- winnerProposalId = null
- mergeApplied = false
- stateCommitApplied = false
- scheduler = NONE
- familyAuthority = NONE

## Sequence

### Dormant cycle 1
- present input = baseline 001B input
- stored history carrier present
- response rule disabled
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

### Dormant cycle 2
- present input byte-identical to cycle 1
- stored history carrier byte-identical to cycle 1
- response rule remains disabled
- CM response form = BASELINE_FORM
- WS response form = BASELINE_FORM

### Reactivated cycle
- present input remains byte-identical
- stored history carrier remains byte-identical
- current CM/WS proposal payloads remain byte-identical
- response rule re-enabled
- CM response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE
- WS response form = RESIDUE_FORM_AFTER_PRIOR_SHARED_ABSENCE

## Observation

Observed:
- stored history survives two expression-disabled cycles unchanged;
- no residue is expressed during dormancy;
- no history rewrite occurs before reactivation;
- re-enabling only the response rule restores residue expression.

## Reactivation qualification

`DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE`

Meaning:
Within the synthetic stateful model, stored history can persist while expression is disabled and can later be re-expressed when the response rule is re-enabled.

This distinguishes:
- persistence of storage;
from
- continuity of expression.

Stored history need not be continuously expressed to remain available for later expression.

## Important boundary

001K does NOT establish:
- biological dormancy or reactivation mechanisms;
- historical Artificial Civilization memory dormancy;
- an elapsed-time model;
- memory decay;
- storage durability beyond the explicitly modeled cycles;
- that dormant memory is behaviorally inert in every richer architecture;
- direct CM→WS or WS→CM causation;
- any resolver or authority law.

The cycles are synthetic matched-state observations, not claims about real chronological time.

## Relationship to 001J

001J:
`MEMORY STORAGE ≠ MEMORY EXPRESSION`.

001K adds:
`EXPRESSION OFF ≠ STORAGE LOST`.

And:
`STORAGE PRESERVED + EXPRESSION RE-ENABLED → RESIDUE CAN RETURN`

within this synthetic stateful mechanism.

## Verification

Focused 001B–001K:
- 10 test files / 106 tests / 106 PASS.

Full deterministic suite:
- 49 test files / 784 tests / 784 PASS.

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

The synthetic memory model now distinguishes dormant persistence from active expression and proves reactivation without history rewrite.

### What did not change

The stateless fixture remains reversible and residue-free.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE` for synthetic fixture 001G–001K only.

### Reopening condition

Reopen if:
- dormant cycles mutate or erase the stored carrier;
- residue appears while all known response rules remain disabled;
- reactivation requires history rewrite;
- matched present inputs or proposal payloads diverge;
- duration-dependent decay is introduced;
- or source-native evidence reveals a different dormancy/reactivation mechanism.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001L — DORMANT HISTORY DECAY / RETENTION-LIMIT QUALIFICATION.

Primary question:
If the history carrier remains stored through progressively longer or explicitly counted dormant intervals, does its ability to reactivate remain unchanged, decay by a declared rule, or become unknown beyond a retention boundary?

Purpose:
Introduce retention/decay only as an explicit candidate mechanism, separating durable storage from finite-lived memory without inventing a real timescale.
