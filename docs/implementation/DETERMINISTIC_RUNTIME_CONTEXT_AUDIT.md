# Deterministic Runtime Context Audit

## Purpose

Track runtime systems currently creating isolated DeterministicRuntimeContext instances.

The runtime should converge toward:

> one shared authoritative deterministic runtime context.

---

## Current Shared Runtime Authority

Implemented:

- DeterministicRuntimeContextRegistry

Purpose:

- centralized deterministic ID authority
- centralized deterministic timing authority
- replay-safe sequencing consistency
- runtime-wide deterministic orchestration

---

## Current Remaining Fragmented Context Risks

### PlayerActionSelectionSystem

Current State:
- may create local DeterministicRuntimeContext

Target:
- use DeterministicRuntimeContextRegistry.Shared

---

### AuditEventFactory

Current State:
- may create local DeterministicRuntimeContext

Target:
- use DeterministicRuntimeContextRegistry.Shared

---

### RuntimeFailureReporter

Current State:
- may create local DeterministicRuntimeContext

Target:
- use DeterministicRuntimeContextRegistry.Shared

---

### RuntimeStateMutationAudit

Current State:
- may create local DeterministicRuntimeContext

Target:
- use DeterministicRuntimeContextRegistry.Shared

---

## Why This Matters

Multiple isolated deterministic contexts can:

- drift deterministic IDs
- drift deterministic timing
- drift replay sequencing
- fragment replay authority

Replay-safe architecture requires:

- one shared deterministic sequencing authority.

---

## Current Recommended Priority

Refactor all runtime systems to use:

- DeterministicRuntimeContextRegistry.Shared

instead of local deterministic runtime contexts.

---

## Backend Tooling Reminder

Backend-only systems remain:
- dormant
- disabled by default
- activation-restricted
- non-player-facing

This includes:
- Folder of Nothing appendages
- developer zones
- replay diagnostics
- runtime debug overlays

---

## Status

DETERMINISTIC_RUNTIME_CONTEXT_AUDIT_ACTIVE
