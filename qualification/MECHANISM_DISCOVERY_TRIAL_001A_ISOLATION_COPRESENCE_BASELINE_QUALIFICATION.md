# MECHANISM DISCOVERY TRIAL 001A — ISOLATION + CO-PRESENCE BASELINE QUALIFICATION

## Status

BOUNDED OPEN-HORIZON QUALIFICATION / NON-CANON / NON-RUNTIME / METHOD GAP IDENTIFIED / AWAITING COLLECTION.

## Objective

Determine whether the frozen ACCQ-007 same-key collision can be decomposed into:
1. an isolated CIVIC_METABOLISM proposal observation;
2. an isolated WORLD_SUBSTRATE proposal observation; and
3. a co-presence observation using the same proposal-generation mechanisms,
without inventing proposal semantics or modifying runtime behavior.

## Frozen basis

- ACCQ-007 fixture proposals:
  - PROP-CM-001 / CIVIC_METABOLISM
  - PROP-WS-001 / WORLD_SUBSTRATE
  - target key: FIXTURE.SHARED_LOCAL_STATE_KEY
- Required preservation:
  - disposition = HOLD_UNRESOLVED
  - winnerProposalId = null
  - mergeApplied = false
  - stateCommitApplied = false
  - both proposal identities preserved
  - no family authority or scheduler

## HOLD — exact source inspection

### Finding H01 — proposal objects are constructed inside ACCQ-007

`runSameKeyCollisionHold001()` constructs both `LocalStateProposal` objects directly inside the collision fixture.

There is no independent CIVIC_METABOLISM proposal generator and no independent WORLD_SUBSTRATE proposal generator that ACCQ-007 invokes.

The proposal fields are:
- proposalId
- family
- targetKey
- proposedEffect

The `proposedEffect` values are symbolic constants:
- CIVIC_METABOLISM_EFFECT
- WORLD_SUBSTRATE_EFFECT

Therefore the same proposal objects cannot currently be observed in isolation through a source-native generator.

### Finding H02 — upstream family records are history, not proposal interfaces

ACCQ-002 creates B-HIST-001:
- kind: LOCAL_CIVIC_METABOLISM_RESPONSE_FIXTURE
- detail: Civilization B locally opens a carrying-capacity review in response to admitted resource-strain eligibility.

ACCQ-005 creates B-HIST-004:
- kind: LOCAL_WORLD_SUBSTRATE_RESPONSE_FIXTURE
- eligibility basis: PRIOR_LOCAL_ADAPTATION_COMMITTED
- sourceHistoryId: B-HIST-003.

These records establish a sequential provenance chain:
B-HIST-001 → B-HIST-002 → B-HIST-003 → B-HIST-004.

They do not define proposal-generation functions equivalent to PROP-CM-001 or PROP-WS-001.

### Finding H03 — upstream sequence is not evidence of same-key causal coupling

The source chain proves ordered provenance among the qualified local-family history records.

It does not prove:
- CM proposal causes WS proposal;
- WS proposal causes CM proposal;
- reciprocal coupling;
- independent parallel proposal generation;
- common-cause proposal generation at FIXTURE.SHARED_LOCAL_STATE_KEY.

Using historical order as same-key edge evidence would violate the Mechanism Discovery Frame's rule that direction cannot be inferred from order or narrative plausibility.

## RELATE — baseline qualification requirements

A lawful isolation + co-presence baseline requires the same proposal-generation mechanism to be callable under at least three controlled conditions:

1. CM isolation:
   - CM generator active;
   - WS generator absent;
   - frozen shared inputs identified;
   - output observable.

2. WS isolation:
   - WS generator active;
   - CM generator absent;
   - same frozen shared inputs where applicable;
   - output observable.

3. Co-presence:
   - both generators active;
   - same frozen state;
   - outputs preserved independently;
   - collision observation separated from any cross-effect claim.

The current runtime does not expose these three conditions.

## UNDERSTAND — result

### Observation

ACCQ-007 proves a deterministic synthetic same-key collision.

### Missing observation

It does not prove that either colliding proposal can be generated independently from a family-native proposal mechanism.

### Classification

`METHOD_GAP_ISOLATION_INTERFACE_MISSING`

### Evidence state

`AWAITING_COLLECTION`

### Coupling state

`COUPLING_UNRESOLVED`

No PARALLEL_ONLY classification is lawful because independence has not been experimentally demonstrated.
No DIRECTIONAL or RECIPROCAL classification is lawful because no controlled perturbation exists.

## BECOME — smallest lawful next construction

Do not alter ACCQ-007.

Create a separate non-canon research fixture with two explicit, independently callable proposal generators.

Minimum candidate interface:

```ts
generateCivicMetabolismProposal(frozenInput): LocalStateProposal
generateWorldSubstrateProposal(frozenInput): LocalStateProposal
```

The test fixture must:
- use synthetic non-canon inputs;
- keep proposal IDs and family identities distinct;
- expose only fields required for observation;
- avoid assigning real ecology/resource semantics unless separately sourced;
- allow CM-only, WS-only, and co-presence runs;
- preserve order independence;
- perform no state commit;
- select no winner;
- apply no merge;
- create no family authority;
- keep ACCQ-007 unchanged.

This construction is not authorized by 001A itself. It is the next candidate experiment design.

## RETURN

### What changed

The project now knows why 001A cannot honestly execute the intended isolation/co-presence comparison on the current fixture.

### What did not change

ACCQ-007 remains fully qualified and unchanged.
HOLD-06 remains OPEN.
ACCQ-011 remains NOT AUTHORIZED.
No runtime behavior changed.

### What was learned

The same-key collision fixture is a collision-safety fixture, not yet a mechanism-observation fixture.

Historical family provenance and same-key proposal collision are two different evidence layers and must not be collapsed.

### Reopening condition

Reopen 001A only when a source-native or explicitly bounded non-canon proposal-generation fixture exists that can produce CM and WS proposals independently and together from controlled inputs.

## Final disposition

PASS — TRIAL 001A CORRECTLY IDENTIFIED A METHOD GAP WITHOUT INVENTING MECHANISM.

Disposition: `METHOD_GAP / AWAITING_COLLECTION`

Relation: `COUPLING_UNRESOLVED`

Runtime effect: NONE.
Canon effect: NONE.
HOLD-06: OPEN.
ACCQ-011: NOT AUTHORIZED.

## Next lawful candidate edge

MECHANISM DISCOVERY FIXTURE 001B — INDEPENDENT PROPOSAL GENERATOR CONSTRUCTION + BASELINE CONTROL.

Primary question:
Can a bounded, synthetic, non-canon fixture expose independently callable CIVIC_METABOLISM and WORLD_SUBSTRATE proposal generators so that isolation and co-presence can be observed without importing unqualified domain semantics?
