# Deterministic Metadata Integration Plan

## Purpose

Track replacement of all remaining nondeterministic runtime metadata.

This phase focuses on:
- deterministic identifiers
- deterministic timestamps
- replay-safe runtime metadata
- authoritative replay reconstruction

---

## Current Remaining Nondeterministic Targets

### Identifier Targets

Replace Guid.NewGuid usage in:

- ActionIntent
- DamageIntent
- BattleContext
- AuditEvent
- RuntimeFailureReport
- ValidationAuditRecord
- ReplayFrame

---

### Timing Targets

Replace DateTime.UtcNow usage in:

- RuntimeFailureReport
- MutationAuditRecord
- replay playback timing
- replay regression timing
- stress execution timing

---

## Integration Rule

All runtime-visible metadata must derive from:

- DeterministicRuntimeContext
- DeterministicIdProvider
- DeterministicClockService

---

## Runtime Doctrine

Replay truth is authoritative.

Runtime metadata must remain:
- deterministic
- replay-safe
- reconstruction-safe
- ordering-safe

---

## Backend Tooling Reminder

Backend-only systems remain:
- disabled by default
- developer-restricted
- non-player-facing

This includes:
- Folder of Nothing appendages
- developer zones
- replay diagnostics
- backend audit overlays
- runtime debug tooling

---

## Current Recommended Priority

1. integrate deterministic IDs into runtime records
2. integrate deterministic timing into runtime records
3. integrate deterministic timing into replay playback
4. integrate deterministic timing into runtime failure reporting
5. remove remaining wall-clock dependency

---

## Status

DETERMINISTIC_METADATA_INTEGRATION_ACTIVE
