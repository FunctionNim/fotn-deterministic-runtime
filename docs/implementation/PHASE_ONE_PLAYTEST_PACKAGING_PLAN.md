# Phase One Playtest Packaging Plan

**Project:** Functions of the Nothing  
**Active Scope:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD  
**Status:** PLAYTEST_PACKAGING_PLANNED

---

## Purpose

This document defines what must exist before the first internal local playtest build can be packaged.

The goal is not final presentation.

The goal is:

> A repeatable local deterministic prototype that can be run, observed, replayed, and verified.

---

## Required Package Contents

### Runtime

- deterministic match creation
- local two-player loop
- phase advancement
- combat interaction
- Momentum progression
- defeat routing
- End Step reporting

### Validation

- LegalActionValidator integration
- RuntimeErrorGuardrails integration
- invalid action handling
- deterministic failure reports

### Replay / Audit

- replay serialization
- replay playback
- replay regression execution
- state hash display
- audit event visibility

### Prototype Output

- readable text output
- turn number
- phase
- player Momentum
- Agent Attack / Barrier / defeated state
- winner summary
- replay hash summary

---

## Playtest Build Must Not Include

- Functions of Sophia
- MMO systems
- Seed Functions
- Grey mechanics
- Bond mechanics
- Yin/Yang mechanics
- Black / White level 50+ systems
- advanced Gold systems
- online multiplayer
- full graphical UI

---

## Minimum Playtest Command Flow

1. Start local prototype.
2. Create two players.
3. Spawn one Agent per player.
4. Apply Phase One Functions only.
5. Execute a deterministic attack/block interaction.
6. Resolve DamageIntent.
7. Route defeated entities.
8. Award Momentum if applicable.
9. Generate End Step report.
10. Generate replay.
11. Replay validates against state hash.

---

## Completion Standard

The first internal playtest package is survivable when:

- the prototype can run repeatedly
- equivalent runs produce equivalent output
- replay validation passes
- invalid actions do not mutate state
- runtime failure reports are readable
- match summary is readable

---

## Current Recommended Next Work

1. integrate validation into LocalPlayableMatchLoop
2. add replay output to local loop
3. add failure report output to local loop
4. create deterministic stress runner
5. create executable entry point / project scaffolding

---

## Canon Status

PHASE_ONE_PLAYTEST_PACKAGING_PLAN_ACTIVE
