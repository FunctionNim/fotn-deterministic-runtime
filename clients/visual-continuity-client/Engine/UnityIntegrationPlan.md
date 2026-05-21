# Unity Integration Plan

## Purpose

This document defines the first practical rendering-engine target for the visual continuity client.

## Runtime Rule

Unity renders projected state only.

Unity does not own deterministic gameplay truth.

## First Scene Targets

1. Continuity Board Scene
2. Function Box Panel
3. Replay Timeline Panel
4. Continuity Dashboard Panel
5. Battle Overlay Panel

## First Adapter Flow

`FOTN.Engine.Interface` view state
→ `VisualContinuityClient.Runtime` adapter
→ Unity scene renderer

## Required Unity Objects

- BoardRoot
- ZonePanelRoot
- FunctionBoxRoot
- ReplayTimelineRoot
- ContinuityDashboardRoot
- BattleOverlayRoot

## Future Work

- Unity project creation
- MonoBehaviour bridge scripts
- prefab hierarchy
- live runtime connection
- replay playback controls
