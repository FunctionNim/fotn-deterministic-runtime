# Functions of the Nothing — First Live Unity Playtest Build Checklist

## Purpose

Create and verify the first live Unity playtest build for the prototype district.

This checklist validates that the first playable continuity loop can run inside Unity from arrival to departure.

## Scene Target

Recommended scene:

`District_Prototype_ContinuityLoop`

## Required Scene Objects

- Player Spawn
- Ritual Anchor
- Question Stone
- Pressure Source
- Witness Positions
- Recovery Garden
- Route Nodes
- Exit Bridge

## Required Runtime Components

- `PrototypeDistrictObjectComponent`
- `SessionStageComponent`
- `ContinuityInteractionComponent`
- `MentalismComponent`
- `PressureVisualComponent`
- `PrototypeHarnessComponent`

## Required Runtime Systems

- `SessionStageSystem`
- `ContinuityInteractionSystem`
- `PressureVisualSystem`
- `MeditationVisualRecoverySystem`
- `MentalismRenderBridgeSystem`
- `MentalismDebugBridgeSystem`
- `PrototypeHarnessSystem`

## Build Setup Checklist

1. Create the prototype district scene.
2. Add the player spawn marker.
3. Add the Ritual Anchor at the center of the district.
4. Add the Question Stone as the first interaction object.
5. Add one visible pressure source.
6. Add witness positions around the plaza, outside the active encounter area.
7. Add the Recovery Garden away from the pressure center.
8. Add Route Nodes to guide movement through the loop.
9. Add the Exit Bridge as the departure point.
10. Add ECS authoring or entity conversion for all required objects.
11. Add debug UI for pressure, Mentalism, exhaustion, and session stage.
12. Run play mode and verify the full loop.

## Playtest Flow

### 1. Arrival

Player enters the scene.

Expected:

- Player can move.
- Camera is stable.
- UI is minimal.
- District is readable.

### 2. Observation

Player approaches the plaza.

Expected:

- Pressure source is visible.
- Witnesses remain background.
- Sophia alert remains short and non-commanding.

### 3. Interaction

Player engages the Question Stone.

Expected:

- Interaction prompt appears near object.
- Hold interaction begins.
- Interaction state advances.

### 4. Pressure Escalation

Pressure rises during interaction.

Expected:

- Pressure visual state changes.
- Mentalism clarity shifts.
- Witnesses react without crowding the player.

### 5. Exhaustion

Player reaches exhaustion threshold.

Expected:

- Player slows or loses clarity.
- Mentalism visibility degrades.
- Player is not hard-failed.

### 6. Recovery

Player enters Recovery Garden and meditates.

Expected:

- Exhaustion distortion reduces.
- Pressure visuals soften.
- Clarity returns.

### 7. Departure

Player exits through the bridge.

Expected:

- Memory/imprint state records.
- World continues after player leaves.
- No mission-complete framing is required.

## Acceptance Criteria

- Full loop completes from arrival to departure.
- Pressure escalation is readable.
- Mentalism distortion is readable, not chaotic.
- Recovery feels meaningful.
- Witnesses react without interfering.
- Session stage transitions are visible in debug.
- No backend cosmology is exposed.
- Build remains stable during repeated test runs.

## Failure Criteria

- Player cannot complete the loop.
- UI overwhelms the world.
- Mentalism distortion becomes unreadable.
- Recovery feels like idle waiting.
- Witnesses crowd the active participant.
- Pressure escalation is unclear.
- The world appears to stop after player departure.

## Production Doctrine

Build small. Prove deep. Expand with purpose.

One interaction. One witness. One memory at a time.
