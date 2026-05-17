# Deterministic Runtime Migration Plan

## Purpose

Replace remaining nondeterministic runtime behavior.

Current nondeterministic risks:
- Guid.NewGuid
- DateTime.UtcNow

---

## Replacement Targets

### IDs

Replace Guid.NewGuid usage with:

- DeterministicIdProvider

Target systems:
- ActionIntent
- AuditEvent
- BattleContext
- RuntimeFailureReport
- ValidationAuditRecord
- ReplayFrame

---

### Timing

Replace DateTime.UtcNow usage with:

- DeterministicClockService

Target systems:
- RuntimeFailureReport
- MutationAuditRecord
- replay timing
- audit timing
- stress execution timing

---

## Migration Rule

No runtime-visible identifier or timestamp should depend on:
- wall clock time
- machine randomness
- process randomness

---

## Current Priority

Begin integrating DeterministicRuntimeContext into:
- runtime orchestration
- replay generation
- audit insertion
- failure reporting

---

## Status

DETERMINISTIC_RUNTIME_MIGRATION_ACTIVE
