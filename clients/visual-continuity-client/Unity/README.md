# Unity Prototype Bootstrap

## Purpose

This folder defines the first Unity-facing bootstrap plan for the playable vertical slice.

Unity is a presentation layer.
The deterministic runtime remains the source of truth.

## First Scene

`ContinuityBoardScene`

Required roots:

- BoardRoot
- ZoneRoot
- FunctionBoxRoot
- ReplayRoot
- InteractionRoot

## First Loop

Connect
→ Project Board
→ Show Function Box
→ Trigger Interaction
→ Project Result
→ Show Replay Frame

## Runtime Rule

The engine owns truth.
Unity renders projection.
