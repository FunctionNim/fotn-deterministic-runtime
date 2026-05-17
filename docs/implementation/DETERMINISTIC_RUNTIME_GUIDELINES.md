# Deterministic Runtime Integration Guidelines

## Purpose

This document defines the remaining deterministic replacement rules.

All runtime systems must migrate away from:
- Guid.NewGuid
- DateTime.UtcNow

before Phase One is considered fully authoritative.

---

## Deterministic Runtime Authority

Use:
- DeterministicRuntimeContext
- DeterministicIdProvider
- DeterministicClockService

for all runtime-visible:
- identifiers
- timestamps
- replay metadata
- audit metadata
- runtime failure metadata

---

## Required Replacements

### Replace Guid.NewGuid

Affected systems:
- ActionIntent
- DamageIntent
- BattleContext
- AuditEvent
- RuntimeFailureReport
- ValidationAuditRecord
- ReplayFrame

Future rule:

No replay-visible runtime object may generate nondeterministic identifiers.

---

### Replace DateTime.UtcNow

Affected systems:
- RuntimeFailureReport
- MutationAuditRecord
- replay playback timing
- stress execution timing

Future rule:

All runtime timing must derive from deterministic tick progression.

---

## Backend Restricted Systems

Backend-only systems may exist inside the downloadable package while remaining disabled by default.

Examples:
- Folder of Nothing utilities
- backend audit views
- replay diagnostics
- runtime debug overlays
- developer-only runtime zones

These systems are:
- non-player-facing
- disabled by default
- backend-only
- activation-restricted

---

## Canon Status

DETERMINISTIC_RUNTIME_GUIDELINES_ACTIVE
