# Unity ECS Bootstrap Implementation Plan

## Goal
Boot the First Continuation District as a deterministic continuity simulation.

## Required source folders

- Assets/FOTN/Scripts/Runtime/Components
- Assets/FOTN/Scripts/Runtime/Systems
- Assets/FOTN/Scripts/UI
- Assets/FOTN/Scenes

## First ECS components

- SeekerTag
- DistrictTag
- ResonanceComponent
- EmotionalComponent
- DistrictPressureComponent
- RestorationComponent
- FunctionBoxManifestationComponent

## First ECS systems

1. ContinuityBootstrapSystem
2. DistrictHeartbeatSystem
3. SeekerHeartbeatSystem
4. FunctionBoxManifestationSystem
5. SophiaTypographySystem
6. ContinuityPersistenceStubSystem

## Scene roots

- WorldRoot
- DistrictRoot
- SeekerRoot
- EncounterRoot
- RuntimeSystems
- SophiaLayer
- UIRoot

## Visual rules

- Sophia appears only as the word Sophia.
- Function Box appears only when causation becomes active.
- Hooded Seeker and hooded citizens are the first silhouettes.
- Visual clarity comes before spectacle.

## Validation

The first Unity build succeeds when the scene boots, creates one district entity, creates one Seeker entity, updates district pressure, and allows the Function Box to move through hidden, shimmer, manifesting, active, and dissolving states.
