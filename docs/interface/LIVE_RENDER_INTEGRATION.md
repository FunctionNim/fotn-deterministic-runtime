# Live Render Integration

## Purpose

This document defines the first runtime-to-renderer integration layer.

## Runtime Law

The renderer never owns gameplay truth.

The renderer only consumes projected continuity state.

## Initial Integration Layers

1. Projection Adapter
2. Replay Render Frames
3. Replay Playback Controls
4. Board Synchronization
5. Multiplayer Visual Synchronization

## Future Targets

- Unity renderer
- Godot renderer
- live continuity-map renderer
- battle-step overlays
- replay theater controls
- continuity observability overlays
