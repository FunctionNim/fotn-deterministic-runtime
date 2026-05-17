# Phase One Milestone Plan

**Project:** Functions of the Nothing  
**Active Game:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD  
**Status:** ACTIVE_ENGINEERING_WORKFLOW

---

## Milestone Goal

Reach the first locally playable deterministic prototype.

A successful prototype must allow:

- two local users to progress through a primitive match
- deterministic turn advancement
- Function choice foundation
- Agent spawning
- battle declaration
- block declaration
- DamageIntent resolution
- Momentum progression
- End Step reporting
- replay serialization
- replay validation
- repeatable state hashes

---

## Milestone Sequence

### Milestone 1 — Runtime Foundation

Status: MOSTLY COMPLETE

Includes:

- GameState
- PlayerState
- ZoneState
- TurnManager
- MatchRuntimeLoop
- ActionIntent
- ActionQueue
- DeterministicInputRecorder
- StateHashService
- StateHashUpdater

---

### Milestone 2 — Combat Foundation

Status: STARTED

Includes:

- AgentEntity
- AgentSpawnService
- DamageIntent
- DamageIntentFactory
- BattleContext
- BattleDeclarationSystem
- BlockDeclarationSystem
- BattleResolutionPipeline
- RuntimeBattleOrchestrator
- CombatMutationService

Remaining:

- correct mutation integration inside DamageResolutionService
- defeated Agent routing after combat
- automatic audit for every combat mutation

---

### Milestone 3 — Replay / Audit Foundation

Status: STARTED

Includes:

- AuditEvent
- AuditEventFactory
- AutomaticAuditInserter
- RuntimeStateMutationAudit
- ReplayFrame
- ReplayFrameGenerator
- ReplaySerializer
- ReplayValidationTest
- RuntimeHashComparisonTest

Remaining:

- replay regression suite
- full audit ordering validation
- before/after hash mutation accuracy

---

### Milestone 4 — Local Text Prototype

Status: NEXT

Includes:

- text-based match loop
- primitive commands
- readable state output
- attack/block flow
- End Step summary
- match completion output

Tracked by Issue #4.

---

### Milestone 5 — Validation / Guardrails

Status: NEXT

Includes:

- LegalActionValidator
- RuntimeErrorGuardrails expansion
- invalid action handling
- deterministic validation failure reports
- replay-safe failure handling

Tracked by Issues #2 and #5.

---

### Milestone 6 — Deterministic Build Validation

Status: PLANNED

Includes:

- test project scaffolding
- replay regression suite
- hash comparison checks
- deterministic simulation test
- future GitHub Actions workflow

Tracked by Issues #3 and #6.

---

## Strict Phase One Exclusions

Do not implement during Phase One:

- Functions of Sophia
- MMO systems
- Seed Functions
- Grey mechanics
- Bond mechanics
- Yin/Yang mechanics
- Black / White level 50+ systems
- advanced Gold systems
- full graphical UI
- online multiplayer

---

## Engineering Doctrine

Phase One proves consequence.

The engine must show:

> same input → same resolution → same audit → same replay → same hash

---

## Recommended Current Mode

GitHub Mode until workflow and validation are fully organized, then AI Coded Mode for LegalActionValidator and playable local loop.

---

## Canon Status

PHASE_ONE_MILESTONE_PLAN_ACTIVE
