# Visual Continuity Client

This folder contains the first client-side scaffold for presenting the deterministic continuity runtime as a playable visible experience.

## Purpose

The client does not own simulation truth.

The client reads projected runtime state and renders:

- zones,
- Function Box state,
- replay timeline,
- continuity dashboard,
- future battle-step interaction panels.

## Runtime Law

The engine owns truth.
The client renders projection.

## Initial Integration Target

Use `FOTN.Engine.Interface` view-state models as the first bridge between runtime and visual client.

## Future Targets

- Unity client
- Web client
- Replay viewer
- Continuity dashboard
- Function Box interaction layer
- Zone map renderer
