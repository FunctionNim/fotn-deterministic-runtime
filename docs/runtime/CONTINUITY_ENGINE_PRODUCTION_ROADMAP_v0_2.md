# Continuity Engine Production Roadmap v0.2

Status: Implementation Planning  
Repository: `FunctionNim/fotn-deterministic-runtime`

## Purpose

This roadmap converts the stabilized continuity-civilization canon into an executable production sequence.

The goal is not to build every world system at once.

The goal is to create a deterministic, auditable, replayable continuity runtime that can grow safely.

## Core Build Doctrine

`Intent → Validation → Event → State Transition → Audit → Projection → Observability`

Every player or system action must become:

1. validatable,
2. attributable,
3. replayable,
4. observable,
5. persistable.

## Phase 0 — Repository Stabilization

Objectives:
- confirm project structure,
- establish build target,
- create solution/project files if missing,
- add CI validation,
- ensure all contracts compile.

Deliverables:
- `.sln` or equivalent project entry,
- engine project,
- test project,
- CI workflow,
- baseline compile test.

Exit criteria:
- repository builds cleanly,
- all interfaces resolve,
- no placeholder type conflicts.

## Phase 1 — Core Deterministic Runtime

Objectives:
- implement `RuntimeCore`,
- implement `RuntimeSequencer`,
- enforce ordered execution,
- prevent mutation outside transition gateway.

Core systems:
- `Intent`,
- `RuntimeAction`,
- `SequencedRuntimeAction`,
- `IStateTransitionEngine`,
- `AuditEntry`.

Exit criteria:
- one deterministic action can be executed from intent to audit entry,
- replay ordering is stable,
- state hash is produced after execution.

## Phase 2 — Stone Constraint Layer

Objectives:
- implement Math Max,
- implement Turn Limit authority,
- reject invalid states before commit,
- route constraint failure into audit.

Core rules:
- no computed value below 0 or above 20 unless explicitly allowed,
- turn bonus limited by current turn number, capped at 13,
- invalid state must not be committed.

Exit criteria:
- constraint tests pass,
- invalid actions fail visibly,
- audit records failure without corrupting state.

## Phase 3 — Canonical Encoding and Hashing

Objectives:
- implement canonical state encoder,
- implement state hash generator,
- ensure deterministic ordering,
- exclude presentation state from hashes.

Deliverables:
- `CanonicalStateEncoder`,
- `StateHashGenerator`,
- golden hash tests.

Exit criteria:
- equivalent state produces identical hash,
- reordered dictionary data does not alter hash,
- presentation data never affects hash.

## Phase 4 — Replay and Projection

Objectives:
- implement event replay,
- implement replay equivalence verifier,
- implement replay projection snapshots,
- support branch-safe projections as interpretation overlays.

Deliverables:
- `ReplayEngine`,
- replay equivalence tests,
- projection snapshot feed.

Exit criteria:
- initial state plus ordered events reconstructs same final state,
- replay mismatch is detected as integrity failure.

## Phase 5 — Continuity Persistence

Objectives:
- define event store schema,
- define mutable world-state schema,
- define snapshot storage,
- define archive/read models.

Persistence doctrine:
- immutable event store = history,
- mutable state database = current reality,
- snapshots = efficient reconstruction,
- projections = readable observability.

Exit criteria:
- events can be appended,
- current state can be rebuilt,
- snapshots can be generated and loaded.

## Phase 6 — Watcher / Gold / Sophia Observability

Objectives:
- implement Watcher read models,
- implement Gold Lens interpretation hooks,
- implement Sophia Codex read-only guidance layer.

Important canon:
- Sophia is a book,
- Sophia interprets, never commands,
- Watcher remembers, never judges,
- Gold observes and predicts, never overrides.

Exit criteria:
- observability output cannot mutate state,
- visibility rules are enforced,
- hidden outcomes remain protected until authorized.

## Phase 7 — Social Continuity Runtime

Objectives:
- implement Bond guild structures,
- implement Yin Yang party structures,
- keep Black/White as Function-layer philosophies only beyond early build.

Canon:
- Bond = enduring merger / guild continuity,
- Yin Yang = continuous conversation / party systems,
- party systems are temporary and adaptive,
- guild systems are persistent and covenant-based.

Exit criteria:
- parties can form, act, and disband,
- guilds can persist and store continuity state,
- social actions produce audit-visible pressure.

## Phase 8 — World Event Runtime

Objectives:
- implement pressure buildup,
- implement dynamic world-event triggers,
- implement event response options,
- implement persistent consequences.

Event flow:
`Pressure Builds → Event Triggers → Players Respond → Outcome Emerges → World Impact → Record → Legacy`

Exit criteria:
- one world event can emerge from pressure,
- parties/guilds can respond differently,
- outcome modifies world state and is recorded.

## Phase 9 — Convergence Runtime

Objectives:
- implement alignment accumulation,
- implement convergence windows,
- implement civilization response decisions,
- implement convergence outcome recording.

Convergence phases:
1. Emergence
2. Preparation
3. Synchronization
4. Climax
5. Resolution
6. Echo

Exit criteria:
- convergence can be prepared,
- player/civilization actions contribute,
- convergence outcome becomes historical continuity.

## Phase 10 — Long-Term Continuity Life Loop

Objectives:
- implement player continuity profiles,
- implement memory records,
- implement reputation and legacy,
- implement lineage and journal hooks.

Core doctrine:
- players do not level up; they become increasingly recorded,
- reputation is historical memory,
- death is transition, not deletion.

Exit criteria:
- player actions create memories,
- memories affect future interpretation,
- player legacy can be queried through observability.

## First Vertical Slice Recommendation

Build the smallest playable continuity loop:

1. create player continuity profile,
2. accept an intent,
3. validate through Stone,
4. sequence action,
5. append event,
6. update state,
7. generate audit entry,
8. project Watcher/Sophia view,
9. replay the event stream,
10. verify identical hash.

This proves the engine before world complexity is added.

## Non-Negotiable Rules

- No state mutation outside transition authority.
- No un-attributed consequence.
- No replay-unsafe randomness.
- No hidden outcome leakage.
- No backend-only system exposed as player geography.
- Sophia remains a book.
- Diamond Complex remains backend-only.
- Three Keepers remain systems, not individuals.

## Current Next Engineering Step

Create compile-safe project structure and implement Phase 0 + Phase 1 skeletons.

## R13 — Runtime Signature System (implemented)

Formalizes deterministic signatures into a reusable runtime subsystem so that
all scenarios, fixtures, snapshots, replay verification, and CI share one
canonical signature format.

**Module:** `src/runtime-signature/runtime-signature.ts`

**Canonical `RuntimeSignature` fields:**
- `signatureVersion` — schema version (`'r13'`); stamps every signature for
  future compatibility.
- `scenarioId` — stable identifier for the scenario or fixture being signed.
- `actionCount` — number of ordered input events / actions.
- `initialStateHash` — key-order-independent hash of the structured world state
  before any action was applied.
- `inputHash` — order-sensitive hash of the ordered action / event sequence.
- `finalStateHash` — key-order-independent hash of the structured final state.
- `auditHash` — order-sensitive hash of the ordered audit trail.
- `memoryHash` — hash of persisted memory IDs, or `null` when not applicable.
- `deterministicProof` — formal boolean assertion that identical input always
  produces this exact signature.
- `combinedHash` — single hash covering all other hash fields together.

**Hashing guarantees:** object key order does not affect any hash; array element
order does affect every hash; `stableJsonHash` uses stable JSON (sorted keys)
then djb2.

**R12 refactored:** `src/replay/replay-verifier.ts` now delegates all hashing
and signature construction to the runtime-signature module. `ReplaySignature` is
an alias for `RuntimeSignature`. `assembleResult` accepts `initialState` and
optional `memoryIds`.

**Tests:** 18 new tests in `tests/runtime-signature/r13-runtime-signature.test.ts`
covering hash invariance, array-order sensitivity, all input-change → output-change
paths, and shape assertions.

---

## R12 — Replay Verification Domain (implemented)

Proves that a known initial state + a known ordered action sequence can be
replayed into the same final state, same audit trail, and same deterministic
signature on every independent run.

**Module:** `src/replay/` — `replay-verifier.ts` (core types, djb2 hash, stable
JSON serialiser, signature builder) + `scenarios.ts` (named scenario runners).

**Scenarios:**
- `act-i:stone-room:that-would-not-fall` — 17 actions, Act I Stone Room
  full sequence through RecordLedger.
- `act-ii:first-continuation-loop` — 7 logical steps, Act II continuation
  loop (Observe → FunctionActivate → EncounterEscalate → Stabilise+Resolve →
  Restore → HeartbeatTick → DistrictUpdate).
- `act-i:stone-room:forced-failure` — mutation probe; ForceBreak instead of
  the correct sequence, proving a changed action produces a different signature.

**What R12 proves (25 tests in `tests/replay/r12-replay-verification.test.ts`):**
- Two independent replays → identical final state
- Two independent replays → identical audit trail
- Two independent replays → identical deterministic signature
- Action order preserved (orderedActions[i].index === i)
- Changing an action changes the final state and signature
- stableJsonHash is key-order-independent and collision-sensitive
