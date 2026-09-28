# MECHANISM DISCOVERY FIXTURE 001B — INDEPENDENT PROPOSAL GENERATOR CONSTRUCTION + BASELINE CONTROL

## Status

BOUNDED SYNTHETIC RESEARCH FIXTURE / NON-CANON / NON-PRODUCTION / BASELINE ONLY / NO RESOLVER.

## Objective

Construct the smallest synthetic, non-canon fixture that can generate CIVIC_METABOLISM and WORLD_SUBSTRATE proposals independently and together from controlled inputs so the isolation/co-presence baseline can be observed without importing unqualified domain semantics.

## Source boundary

This fixture is a response to MECHANISM DISCOVERY TRIAL 001A, which established:
- ACCQ-007 constructs both colliding proposals inside its collision fixture;
- no independent proposal-generation interface existed;
- isolation/co-presence could not be tested honestly on ACCQ-007;
- coupling therefore remained unresolved.

001B does not modify ACCQ-007, ACCQ-002 through ACCQ-006, ACCQ-008 through ACCQ-010C, GamerLaStone, or any production/runtime integration path.

## Constructed research interface

Two independently callable generators now exist in a separate fixture:

- `generateCivicMetabolismProposal001B(frozenInput)`
- `generateWorldSubstrateProposal001B(frozenInput)`

The frozen research input contains only synthetic tokens:
- `SYNTHETIC_SHARED_TOKEN`
- `SYNTHETIC_CM_TOKEN`
- `SYNTHETIC_WS_TOKEN`

These tokens are observation handles only. They do not claim real ecology, resource, carrying-capacity, biological, economic, or civic semantics.

Each generated proposal exposes:
- proposal identity;
- family identity;
- shared synthetic target key;
- symbolic proposed effect;
- fixture provenance;
- observed shared token;
- observed family token.

This makes future controlled perturbation observable without importing hidden meaning.

## Isolation baseline

### CM-only

The CIVIC_METABOLISM generator produces one stable proposal from the frozen input without invoking the WORLD_SUBSTRATE generator.

### WS-only

The WORLD_SUBSTRATE generator produces one stable proposal from the same frozen input without invoking the CIVIC_METABOLISM generator.

## Co-presence baseline

Both generators are invoked from the same frozen input.

Observed:
- exactly two distinct proposal identities;
- same target key;
- CM proposal byte-equivalent to its isolated result;
- WS proposal byte-equivalent to its isolated result;
- reversing generator evaluation order preserves the same proposal set;
- collision is detected;
- no winner is selected;
- no merge is applied;
- no state commit occurs;
- no scheduler is created;
- no family authority is created.

## Qualified relation state

`PARALLEL_ONLY_BASELINE`

Meaning:
Within this synthetic 001B fixture only, the two independently callable generators produce stable proposals that remain unchanged by co-presence.

This does NOT establish that the historical ACCQ-007 families are globally or biologically parallel.
It does NOT establish absence of coupling under future perturbation.
It does NOT resolve HOLD-06.

It establishes only the zero-perturbation baseline required before directional tests can be meaningful.

## Order control

Co-presence is evaluated in both CM→WS and WS→CM invocation order.

The proposal set remains identical.

Therefore evaluation order does not create family priority in this fixture.

## Mechanism boundary

001B does not claim a causal mechanism.

The fixture currently proves:
- independently callable proposal generation;
- controlled co-presence;
- zero-perturbation stability;
- order-independent proposal set;
- safe same-key HOLD.

It does not yet prove:
- CM perturbation changes WS;
- WS perturbation changes CM;
- reciprocal coupling;
- common-cause sensitivity;
- persistent memory/hysteresis.

## Verification

Focused fixture suite:
- 1 test file / 11 tests / 11 PASS.

Full deterministic suite:
- 40 test files / 689 tests / 689 PASS.

Additional:
- Typecheck PASS.
- Production build PASS.
- `git diff --check` PASS.

A TypeScript schema mismatch was found during the first verification attempt:
`collisionDetected` was declared as literal `true` while computed as a boolean.

The type was corrected to `boolean`; no behavioral logic changed. The entire focused and full verification set was rerun after the correction and passed.

## Runtime and canon effects

Production/runtime integration effect: NONE.
Existing ACCQ-007 behavior: UNCHANGED.
Canon effect: NONE.
GamerLaStone effect: NONE.
HOLD-06: OPEN.
ACCQ-011: NOT AUTHORIZED.

## Return

### What changed

The method gap identified by 001A is closed at the research-fixture level: independent CM and WS proposal generation and co-presence are now observable.

### What did not change

No mechanism is established beyond the zero-perturbation synthetic baseline.
No resolver exists.
No collision is resolved.
No historical fixture is rewritten.

### Current evidence state

`PARALLEL_ONLY_BASELINE` — qualified only for synthetic fixture 001B under frozen, unperturbed input.

### Reopening / supersession condition

Any controlled perturbation that causes one generator's proposal to change in response to an input not consumed by that generator would challenge the parallel-only baseline and require a new relation classification.

## Next lawful candidate edge

MECHANISM DISCOVERY TRIAL 001C — FAMILY-SPECIFIC PERTURBATION + CROSS-EFFECT QUALIFICATION.

Primary question:
When one family-specific synthetic input is changed while the shared input and the other family's input remain frozen, does the non-perturbed family's proposal remain byte-identical?

Required first pair:
1. perturb CM token only; observe CM and WS outputs;
2. perturb WS token only; observe WS and CM outputs.

If the non-perturbed proposal changes, investigate DIRECTIONAL or COMMON-CAUSE alternatives.
If only the perturbed family changes and the other remains stable in both directions, the PARALLEL_ONLY baseline gains stronger support for this bounded synthetic model.
