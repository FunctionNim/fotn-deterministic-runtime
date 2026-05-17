# Phase One Dependency Map

**Project:** Functions of the Nothing  
**Active Game:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD

---

## Purpose

This document defines the engineering dependency order for Phase One so implementation remains survivable.

---

## Core Dependency Chain

```text
GameState
→ TurnManager
→ ActionIntent
→ DeterministicInputRecorder
→ LegalActionValidator
→ RuntimeActionProcessor
→ DamageIntent
→ BattleResolutionPipeline
→ CombatMutationService
→ DefeatRoutingService
→ MomentumResolver
→ EndStepReporter
→ ReplayFrameGenerator
→ ReplayRegressionSuite
→ Local Text Prototype Loop
```

---

## Dependency Rules

### Rule 1 — No mutation before validation

All player-submitted actions must pass LegalActionValidator before mutating GameState.

### Rule 2 — No combat without DamageIntent

Damage must enter the runtime as DamageIntent before resolution.

### Rule 3 — No consequence without audit

Every meaningful state mutation must be traceable through audit or mutation record.

### Rule 4 — No playable loop without replay validation

Local playable prototype must remain compatible with replay verification.

### Rule 5 — No new mechanics before guardrails

Advanced Function systems must wait until validation and guardrails are stable.

---

## Issue Dependency Order

| Order | Issue | Purpose |
|---|---|---|
| 1 | #2 LegalActionValidator | protect runtime from invalid actions |
| 2 | #5 Runtime Error Guardrails | protect deterministic survivability |
| 3 | #7 Test Project Scaffolding | prepare validation infrastructure |
| 4 | #3 Replay Regression Suite | prove replay stability |
| 5 | #6 Build Validation Pipeline | automate deterministic checks |
| 6 | #4 Local Text Prototype Loop | first human-playable prototype |
| 7 | #8 Runtime Module Boundaries | stabilize architecture before expansion |

---

## Current Best Next Coding Step

Implement LegalActionValidator.

Why:

The runtime now accepts input. Before expanding playable interaction, it must reject illegal input deterministically.

---

## Canon Status

PHASE_ONE_DEPENDENCY_MAP_ACTIVE
