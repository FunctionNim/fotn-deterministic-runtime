# Playable Vertical Slice Execution Checklist

## Goal

Build one local playable continuity loop:

Connect → View Board → Select Function Box → Trigger Interaction → See Result → View Replay Frame

## Phase 1 — Local Runtime Demo

- Create local demo entrypoint
- Instantiate local runtime host
- Connect one player session
- Build dashboard state
- Produce one replay frame

## Phase 2 — Board Projection

- Build board view state
- Show zone count
- Show active player count
- Show current tick

## Phase 3 — Function Box Interaction

- Present Function Box panel state
- Lock a simple Function selection
- Preserve deterministic state hash

## Phase 4 — Interaction Resolution

- Trigger one board interaction intent
- Resolve through runtime-owned consequence flow
- Project result to presentation state

## Phase 5 — Replay View

- Create replay viewer state
- Display current tick
- Display total frames
- Confirm replay identity hash

## Completion Criteria

The prototype is complete when one player can move through the entire loop without requiring manual runtime inspection.

## Runtime Law

The engine owns truth.
The client renders projection.
