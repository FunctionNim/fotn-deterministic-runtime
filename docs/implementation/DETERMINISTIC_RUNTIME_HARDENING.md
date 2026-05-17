# Deterministic Runtime Hardening

**Project:** Functions of the Nothing  
**Status:** ACTIVE_HARDENING_PHASE

---

## Purpose

This document tracks replay-safety hardening work.

The runtime must remove hidden nondeterminism before:

- multiplayer
- advanced replay validation
- external playtesting
- larger combat systems

---

## Completed Hardening

### Deterministic IDs

Implemented:

- DeterministicIdProvider

Purpose:

- replay-safe identifier generation
- deterministic runtime ordering
- deterministic replay reconstruction

---

### Deterministic Timing

Implemented:

- DeterministicClockService

Purpose:

- remove DateTime.UtcNow dependency
- replay-safe timing
- deterministic runtime timestamps
- deterministic audit timing

---

## Current Remaining Risks

| Risk | Severity |
|---|---|
| existing Guid.NewGuid usage | HIGH |
| existing DateTime.UtcNow usage | HIGH |
| prototype systems bypassing deterministic services | MEDIUM |
| mutation ordering drift under future complexity | MEDIUM |

---

## Required Next Refactors

1. Replace Guid.NewGuid calls with DeterministicIdProvider.
2. Replace DateTime.UtcNow calls with DeterministicClockService.
3. Route replay frame timing through deterministic clock.
4. Route audit records through deterministic IDs.
5. Route runtime failure reports through deterministic timing.

---

## Engineering Doctrine

Replay truth is more important than convenience.

No runtime identity or timing system should depend on:

- wall clock time
- machine randomness
- platform-specific ordering

---

## Current Recommended Priority

Integrate deterministic ID and clock services into runtime orchestration paths.

---

## Canon Status

DETERMINISTIC_RUNTIME_HARDENING_ACTIVE
