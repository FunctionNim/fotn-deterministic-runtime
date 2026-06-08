# Runtime Roadmap — R11

This document records the next build direction for `FunctionNim/fotn-deterministic-runtime` after the deterministic foundation locks.

The repository currently has a protected base:

```text
R2 — deterministic demo runner
R3 — regression fixture
R4 — golden snapshot and audit manifest
R5 — GitHub Actions verification gate
R6 — pushed and confirmed remote CI success
R7 — repository hygiene cleanup
R8 — public README and developer onboarding
R10 — branch protection setup guide
```

## Current Meaning

The runtime is now ready for feature development on top of deterministic safeguards.

Future work should preserve this order:

```text
Design small → implement deterministic behavior → add fixture coverage → update snapshot only if intentional → verify CI
```

## R11 Purpose

R11 defines the first post-foundation roadmap. It does not change runtime behavior. It names the next safe development targets so future phases do not drift into frontend work or uncontrolled expansion.

## Development Rule

This repository remains a runtime/library.

Do not add a frontend web app here unless a future phase explicitly creates a separate app layer or a deliberate interface package.

## Recommended Next Phases

### R12 — First Runtime Domain Expansion

Goal: add one new deterministic runtime domain beyond the existing demo acts.

Candidate domains:

```text
- Function Box selection lifecycle
- Turn phase pipeline
- Audit stream normalization
- Replay verification
- Canonical serialization
- Pressure meter transition rules
```

Recommended first choice:

```text
Replay verification
```

Reason: replay verification strengthens the deterministic foundation before adding more gameplay surface.

Expected output:

```text
Given the same initial state and event list,
the replay engine returns the same final state,
the same audit trail,
and the same deterministic signature.
```

### R13 — Runtime Signature System

Goal: create a stable deterministic signature for fixture outputs and replay results.

The signature should summarize structured output without depending on fragile console text.

Possible signature fields:

```text
phase
scenario id
initial state hash
input event hash
final state hash
audit hash
memory hash
determinism proof flag
```

### R14 — Scenario Registry

Goal: define a small registry of named deterministic scenarios.

The registry should allow demos, tests, snapshots, and future tools to reference scenarios by stable IDs.

Example IDs:

```text
stone-room.act-i
first-continuation.act-ii
replay-verification.act-i
```

### R15 — Replay Audit Fixture

Goal: add regression tests proving replay behavior is stable.

The replay fixture should test:

```text
same input → same output
same input → same audit trail
same input → same signature
changed input → intentional changed signature
```

### R16 — Developer Contribution Checklist

Goal: document how future contributors should safely change runtime behavior.

Checklist should include:

```text
[ ] Add/adjust deterministic fixture.
[ ] Add/adjust tests.
[ ] Run npm run build.
[ ] Run npm test.
[ ] Run dotnet build.
[ ] Run npm run demo.
[ ] Regenerate golden snapshot only if behavior changed intentionally.
[ ] Explain behavior change in commit message.
```

## Recommended Immediate Next Task

```text
R12 — Replay Verification Domain
```

Build the smallest replay verification layer that can prove deterministic output from a known event list.

## R11 Lock

```text
PHASE R11 — RUNTIME ROADMAP LOCK

Purpose:
Define the first post-foundation development roadmap for the deterministic runtime.

Meaning:
The repository now has a clear next build path after documentation, hygiene, CI, snapshot, and branch-protection locks.
```
