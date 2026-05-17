# Phase One Internal Playtest Checklist

**Project:** Functions of the Nothing  
**Active Scope:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD  
**Build Type:** Local deterministic prototype

---

## Purpose

This checklist defines what must be true before the first internal playtest is considered survivable.

The playtest is not for balance polish.

The playtest is for proving:

- deterministic runtime stability
- replay-safe interaction
- readable local flow
- combat consequence integrity
- Momentum progression
- audit/replay survivability

---

## Pre-Playtest Requirements

### Runtime

- [ ] GameState initializes correctly
- [ ] Two players initialize correctly
- [ ] Turn phase advances deterministically
- [ ] DeterministicTick advances predictably
- [ ] StateHash updates after meaningful mutation

### Input

- [ ] Local text actions can be created
- [ ] Attack actions are generated as ActionIntent
- [ ] ActionIntent is recorded by DeterministicInputRecorder
- [ ] Invalid actions are rejected by validation before mutation

### Combat

- [ ] Agent spawning works
- [ ] Red / Green / Blue / Stone Function application works
- [ ] Attack declaration creates battle context
- [ ] Block declaration validates correctly
- [ ] DamageIntent is generated before damage resolution
- [ ] DamageIntent resolves deterministically
- [ ] Defeated Agents are routed correctly

### Momentum

- [ ] Momentum can increase through combat consequence
- [ ] Momentum cannot fall below 0
- [ ] Win threshold check occurs deterministically
- [ ] Multiple winner support remains preserved

### Replay / Audit

- [ ] ReplayFrame is generated
- [ ] ReplaySerializer exports replay payload
- [ ] ReplayPlaybackRunner can render replay frames
- [ ] ReplayRegressionSuite passes repeated validation
- [ ] Audit events are inserted for meaningful state changes
- [ ] Validation failures can be recorded

### Reporting

- [ ] EndStepReportBuilder produces turn report
- [ ] EndStepOutcomeReporter shows defeated Agents
- [ ] RuntimeConsoleRenderer outputs readable match state
- [ ] RuntimeFailureReporter produces readable failure records

---

## Minimum Playtest Scenario

1. Start match with two local players.
2. Spawn one Red Agent for Player One.
3. Spawn one Stone Agent for Player Two.
4. Player One declares attack.
5. Player Two blocks.
6. DamageIntent is created.
7. ResolutionLock occurs.
8. Damage resolves.
9. Defeated entities route.
10. Momentum updates.
11. End Step report displays.
12. Replay frame generates.
13. Replay validation passes.

---

## Failure Conditions

The playtest is not survivable if:

- identical inputs produce different hashes
- invalid action mutates state
- combat resolves without DamageIntent
- audit misses a meaningful mutation
- replay cannot serialize / deserialize
- Momentum resolves outside canon rules
- turn phase order breaks

---

## Scope Restrictions

Do not add during this playtest:

- Functions of Sophia
- MMO systems
- Seed Functions
- Grey mechanics
- Bond mechanics
- Yin/Yang mechanics
- Black / White level 50+ systems
- advanced Gold systems
- graphical UI
- online multiplayer

---

## Success Definition

The first internal playtest succeeds when:

> A complete primitive local match interaction runs from input to consequence to report to replay, and the same interaction remains deterministic across repeated runs.

---

## Recommended Mode After Checklist

AI Coded Mode for local prototype loop refinement.

---

## Status

PHASE_ONE_INTERNAL_PLAYTEST_CHECKLIST_ACTIVE
