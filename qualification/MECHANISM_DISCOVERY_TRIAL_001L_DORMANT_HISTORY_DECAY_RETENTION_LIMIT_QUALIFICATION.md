# MECHANISM DISCOVERY TRIAL 001L — DORMANT HISTORY DECAY / RETENTION-LIMIT QUALIFICATION

## Status

BOUNDED SYNTHETIC RETENTION-LIMIT QUALIFICATION / NON-CANON / NON-PRODUCTION / NO RESOLVER.

## Objective

Test whether stored history remains reactivatable across progressively counted dormant intervals when retention is governed by one explicit synthetic rule, while present inputs and current proposal payloads remain unchanged.

## Frozen basis

Parent result: MECHANISM DISCOVERY TRIAL 001K.

001K established:
- stored history can remain dormant across multiple matched-current-input cycles;
- no residue is expressed while the response rule is disabled;
- reactivation returns residue without rewriting the carrier.

001L introduces a retention rule as a separate candidate mechanism. It does not infer natural decay from 001K.

## Explicit retention rule

`MDF-001L-RETENTION-RULE-001`

- fully retained through counted dormant interval 2;
- expired at counted dormant interval 3 and beyond.

These interval counts are synthetic bookkeeping states only.

There is no mapping to seconds, minutes, biological generations, simulation turns, or any other real timescale.

## Controlled observations

Intervals tested:
0, 1, 2, 3, 4.

Across all intervals:
- present inputs remain byte-identical;
- current CM proposal payload remains byte-identical;
- current WS proposal payload remains byte-identical.

### Intervals 0–2

Observed:
- retained history carrier remains present;
- retention state = FULLY_RETAINED;
- reactivation capability = RESIDUE_REACTIVATABLE.

### Intervals 3–4

Observed:
- retained history carrier = null under the explicit rule;
- retention state = EXPIRED_BY_EXPLICIT_SYNTHETIC_RULE;
- reactivation capability = RESIDUE_NOT_REACTIVATABLE_AFTER_EXPIRY.

## Retention qualification

`FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE`

Meaning:
Within this synthetic stateful fixture, reactivation capability is preserved through the declared retention boundary and removed at the declared expiry boundary.

This is a rule-defined finite-retention result.

It is NOT a discovery that memory naturally decays after three intervals.

## Important boundary

001L does NOT establish:
- a real time constant;
- a biological memory half-life;
- a historical Artificial Civilization retention period;
- spontaneous decay;
- passive degradation;
- probabilistic forgetting;
- a universal retention threshold;
- direct CM→WS or WS→CM causation;
- any resolver, authority, or commit law.

The expiry occurs because the synthetic rule explicitly declares it.

Accordingly:
- realTimeMappingPermitted = false
- biologicalMemoryClaimPermitted = false
- historicalArtificialCivilizationMemoryClaimPermitted = false

## Relationship to 001K

001K:
`DORMANT_HISTORY_PRESERVED_AND_REACTIVATABLE`.

001L asks what happens when a finite retention mechanism is explicitly added.

The resulting synthetic structure is:
- dormant interval 0 → retained;
- dormant interval 1 → retained;
- dormant interval 2 → retained;
- dormant interval 3 → expired;
- dormant interval 4 → expired.

Thus:
`DORMANT STORAGE CAN BE FINITE IF A RETENTION RULE EXPLICITLY MAKES IT FINITE`.

## Verification

Focused 001B–001L:
- 11 test files / 117 tests / 117 PASS.

Full deterministic suite:
- 50 test files / 795 tests / 795 PASS.

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

The synthetic stateful model now has an explicit finite-retention candidate mechanism and a tested retention boundary.

### What did not change

No real timescale was introduced.
No natural memory-decay claim was made.
The original stateless fixture remains reversible and residue-free.
No collision resolution occurred.
No winner, merge, state commit, scheduler, family authority, or resolver was introduced.
No historical source was rewritten.

### Current evidence state

`FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE` for synthetic fixture 001L only.

### Reopening condition

Reopen if:
- the declared rule changes;
- retained history survives beyond its declared expiry;
- expiry occurs before its declared boundary;
- a gradual-decay mechanism replaces hard expiry;
- another carrier restores reactivation after this carrier expires;
- or source-native evidence identifies a different retention pathway.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001M — RETENTION-RULE ABLATION / NATURAL-DECAY CONTROL.

Primary question:
If the explicit retention rule is removed while all counted dormant intervals and stored history are otherwise preserved, does the carrier remain fully reactivatable across intervals 0–4?

Purpose:
Distinguish decay caused by the declared retention rule from any apparent decay that might otherwise be incorrectly attributed to dormancy itself.
