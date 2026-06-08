# Functions of the Nothing — Deterministic Runtime

A deterministic TypeScript + C# runtime/library for **Functions of the Nothing**.

This repository is not a frontend web app. It is the consequence engine layer: a place where pressure, functions, state transitions, audits, fixtures, snapshots, and verification gates can be tested before any playable interface depends on them.

## Core Doctrine

```text
Pressure → Function → Consequence → Audit → Meaning
```

The runtime does not simulate animation.
The runtime simulates consequence.

## Deterministic Law

```text
Identical state + identical events must always produce identical consequence.
```

Every runtime feature should preserve this law. If two runs begin with the same state and same events, they must produce the same final state, audit trail, memory output, and demo proof result.

## Runtime Execution Order

```text
Input
→ Intent
→ Validation
→ Pipeline
→ Resolution
→ Constraint Check
→ Audit
→ State Commit
→ Observability
```

## Primary Systems

- RuntimeCore
- EventBus
- Immutable StateStore
- ConstraintLayer
- AuditStream
- ReplayEngine
- PressureEngine
- ObservabilityLayer
- ModeInterpreter
- CanonicalSerializer

## Requirements

- Node.js with npm
- .NET 8 SDK

The repository currently verifies both the TypeScript runtime and the C#/.NET engine projects.

## Quick Start

Install dependencies:

```bash
npm install
```

Run the TypeScript build:

```bash
npm run build
```

Run the TypeScript test suite:

```bash
npm test
```

Run the .NET build:

```bash
dotnet build
```

Run the deterministic demo:

```bash
npm run demo
```

## Verification Gate

The clean runtime verification chain is:

```bash
npm run build
npm test
dotnet build
npm run demo
```

A clean lock means:

- TypeScript compiles with no errors.
- TypeScript tests pass.
- .NET 8 builds with no warnings or errors.
- The deterministic demo completes both acts.
- All determinism proofs report `YES`.
- Golden snapshot tests do not drift.

## Demo Runner

The demo command is:

```bash
npm run demo
```

The demo currently contains two deterministic acts.

### Act I — The Room That Would Not Fall

Act I walks the Stone pressure sequence action by action:

- enters the room
- tests anchor plates
- names protection and release conditions
- casts Anchor Pulse
- releases the room
- prints pressure meter states such as tremor, seal, and passage
- records the continuity ledger
- repeats the sequence to prove identical output

### Act II — First Continuation Loop

Act II runs a small world-state loop:

- prints the initial world state
- includes seeker, district, and encounter state
- executes a fixed event sequence
- prints the event audit
- persists world memory
- prints final state deltas
- repeats independent runs to prove identical events, memories, and state

## Regression Fixture

The human-readable demo is backed by a pure fixture layer so deterministic behavior can be tested without relying only on console formatting.

Important files:

```text
src/demo/r2-demo-fixture.ts
src/demo/r2-demo-runner.ts
tests/demo/r2-demo-regression.test.ts
```

The fixture verifies stable behavior for both demo acts, including action counts, event counts, memory counts, final state deltas, and deterministic match flags.

## Golden Snapshot and Audit Manifest

The runtime includes golden snapshot protection for the deterministic demo fixture.

Purpose:

- keep a known-good structured output for the deterministic demo
- compare current fixture output against locked expected behavior
- fail tests when runtime behavior drifts unexpectedly
- require intentional snapshot revision when behavior changes on purpose

Snapshot updates are intentional. Normal CI/test runs must not auto-update the golden snapshot.

To intentionally regenerate the snapshot after a deliberate behavior change:

```bash
npm run generate-snapshot
```

To verify the audit manifest:

```bash
npm run verify-manifest
```

If a golden snapshot mismatch appears, review the runtime behavior first. Only regenerate the snapshot when the behavior change is intended.

## GitHub Actions CI

GitHub Actions verifies the runtime on push and pull request.

The CI gate runs the same lock checks used locally:

```bash
npm run build
npm test
dotnet build
npm run demo
```

CI must not regenerate golden snapshots. Snapshot drift should fail clearly so behavior changes remain visible.

## Phase Locks

### R2 — Deterministic Demo Runner

Added a readable console demo proving the runtime can execute deterministic sample sequences, not merely compile and pass tests.

### R3 — Demo Runner Expansion Into Regression Fixture

Refactored the demo into a pure computation fixture and added automated regression assertions for both acts.

### R4 — Runtime Golden Snapshot and Audit Manifest

Added structured golden snapshot protection and manifest governance so deterministic output can be compared against a known locked state.

### R5 — CI / GitHub Workflow Verification Gate

Added GitHub Actions verification so pushes and pull requests run the same runtime checks used locally.

### R6 — Git Commit / Push / GitHub Actions Confirmation

Pushed the deterministic runtime lock chain to GitHub and confirmed GitHub Actions passed.

### R7 — Repository Hygiene and Artifact Cleanup

Cleaned repository tracking so generated build artifacts do not pollute future commits.

### R8 — Public Runtime README / Developer Onboarding

This README makes the repository understandable to future developers, testers, and collaborators.

## Development Rules

- Keep the repository as a runtime/library unless a future phase explicitly creates an app layer.
- Do not add a frontend web app to this repository by accident.
- Do not auto-update golden snapshots in tests or CI.
- Treat snapshot changes as behavior changes.
- Preserve deterministic behavior before adding features.
- Prefer structured fixture output for tests.
- Keep console output readable for humans.
- Keep runtime consequence separate from UI presentation.

## Current Repository Meaning

This repository is the locked deterministic runtime base for Functions of the Nothing.

It now has:

1. human-readable deterministic demo output
2. structured fixture output
3. automated regression tests
4. golden snapshot protection
5. audit manifest governance
6. GitHub Actions verification
7. repository hygiene cleanup
8. public developer onboarding

The runtime is ready for the next phase of engine development on top of a protected deterministic foundation.
