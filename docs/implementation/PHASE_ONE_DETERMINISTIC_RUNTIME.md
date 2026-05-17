# Phase One — Deterministic Foundation Runtime

**Project:** Functions of the Nothing: Hermetic Principles of the Lower Vibration  
**Status:** ACTIVE DEVELOPMENT  
**Scope:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD

---

## Phase One Objective

Build the deterministic foundation runtime required for a playable Functions of the Nothing pre-alpha.

Success means:

> Two players can complete a full deterministic match, replay it from the same input log, and receive the same final result with an audit trail explaining every consequence.

---

## Non-Negotiable Runtime Law

Input → Action → Resolution → Audit → Replay → Same Result Every Time

If replay produces a different result, the runtime is invalid.

---

## Strict Scope

Phase One includes only:

- deterministic turn loop
- Function Box foundation
- Agent foundation
- Damage Intent combat model
- Momentum tracking
- Polarity routing foundation
- audit logging
- replay determinism
- local two-player prototype path

Phase One excludes:

- Functions of Sophia
- MMO systems
- civilization simulation
- caravan systems
- citizen story systems
- Seed Functions
- Grey, Bond, Yin/Yang implementation
- advanced Gold systems
- Black / White level 50+ systems
- full mode implementation beyond standard deterministic rules

---

## Required Engine Modules

```text
/engine
  /turns
  /functions
  /agents
  /combat
  /routing
  /momentum
  /audit
  /replay
  /state
/cards
/prototype
/ui
/tools
/docs
```

---

## Runtime Systems

### 1. Turn Loop

Minimum phases:

1. Start of Turn
2. Main Step
3. Battle Step
4. Damage Phase
5. End Step

Purpose:

- maintain legal action timing
- route priority windows later
- ensure deterministic phase progression

---

### 2. Function Box Foundation

Minimum behavior:

- represent Function slots
- confirm selected Functions
- apply baseline stat contribution
- log Function choices

Initial pre-alpha Functions:

- Red
- Green
- Blue
- Stone

Reason:

These create readable pressure: conflict, reserve, venture, and endurance.

---

### 3. Agent Foundation

Minimum behavior:

- create Agent
- assign owner
- assign attack/barrier values
- declare attacker
- declare blocker
- route defeated Agents

---

### 4. Damage Intent System

Core combat law:

Damage is not applied immediately during effect activation.

Damage is created as Damage Intent, locked, then resolved only during the Damage Phase.

Minimum pipeline:

1. Collect Damage Intents
2. Lock Targets
3. Resolve Damage Phase
4. Apply Outcomes
5. Log Results
6. Reveal Results in End Step report

---

### 5. Momentum System

Minimum behavior:

- track Momentum per player
- apply Momentum changes
- check win threshold at End Step
- support multiple players crossing threshold during same check

Pre-alpha threshold remains canon: 30 Momentum.

---

### 6. Polarity Routing Foundation

Minimum behavior:

- route specified entities to Polarity
- track Polarity timer
- prevent Polarity entities from acting unless explicitly allowed

---

### 7. Audit Log

Every runtime change must create an audit event with:

- event id
- turn number
- phase / step
- actor
- action type
- source
- targets
- before state hash
- after state hash
- resulting consequence

---

### 8. Replay System

Replay must use:

- initial seed
- initial state
- ordered input log
- deterministic resolver

Replay must not use:

- wall-clock time
- unseeded randomness
- hidden external state
- nondeterministic collection order

---

## First Playable Target

### FOTN Pre-Alpha 0.1

Minimum features:

- 2 local players
- Red / Green / Blue / Stone only
- basic Function Box
- basic Agent play
- battle resolution
- Momentum tracking
- audit log
- deterministic replay

---

## Canon Guardrails

- Functions of the Nothing comes first.
- Functions of Sophia remains on hold.
- Backend cosmology must not expand implementation scope.
- The first build proves consequence, not full lore.
- System stability comes before visual polish.

---

## Recommended Implementation Order

1. State model
2. Audit event model
3. Turn loop
4. Function Box model
5. Agent model
6. Damage Intent model
7. Battle resolver
8. Momentum resolver
9. Polarity routing
10. Replay runner
11. Local prototype harness

---

## Phase One Completion Test

Phase One is complete when:

- a full match can be completed locally
- all actions are logged
- replay returns the same state hash
- Momentum resolves correctly
- combat outcomes are deterministic
- audit log explains every consequence

---

## Canon Status

PHASE_ONE_ACTIVE
