# Deterministic Metadata Refactor Targets

## Purpose

Track live runtime systems still using nondeterministic metadata.

This document exists so replay-safe replacement work can occur systematically.

---

## Active Refactor Targets

### ActionIntent

Current Risk:
- Guid.NewGuid usage

Required Replacement:
- DeterministicIdProvider

Replay Importance:
ActionIntent ordering affects runtime consequence flow.

---

### DamageIntent

Current Risk:
- Guid.NewGuid usage

Required Replacement:
- DeterministicIdProvider

Replay Importance:
Damage ordering affects deterministic combat resolution.

---

### BattleContext

Current Risk:
- Guid.NewGuid usage

Required Replacement:
- DeterministicIdProvider

Replay Importance:
Battle reconstruction must remain deterministic.

---

### AuditEvent

Current Risk:
- Guid.NewGuid usage

Required Replacement:
- DeterministicIdProvider

Replay Importance:
Audit ordering must remain replay-safe.

---

### RuntimeFailureReport

Current Risks:
- Guid.NewGuid
- DateTime.UtcNow

Required Replacements:
- DeterministicIdProvider
- DeterministicClockService

Replay Importance:
Runtime failures are replay-visible continuity events.

---

### MutationAuditRecord

Current Risk:
- DateTime.UtcNow

Required Replacement:
- DeterministicClockService

Replay Importance:
Mutation sequencing must remain replay-safe.

---

## Integration Doctrine

No runtime-visible metadata may depend on:
- machine randomness
- wall-clock time
- platform timing differences

---

## Current Recommended Priority

1. ActionIntent
2. AuditEvent
3. RuntimeFailureReport
4. MutationAuditRecord
5. Replay timing systems

---

## Status

DETERMINISTIC_METADATA_REFACTOR_TARGETS_ACTIVE
