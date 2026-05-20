# Replay Projection Doctrine

Replay projection turns deterministic history into readable reconstruction.

Rules:

1. Replay projection reads replay frames, audit entries, pressure state, and visibility authorization.
2. Replay projection must never mutate simulation state.
3. Projection views must preserve Information Box hidden-resolution timing.
4. Projection output must remain consistent with canonical state hashes.
5. Projection may prepare UI-ready timelines, but UI is not authority.
6. Branch projections are interpretation overlays unless committed by deterministic replay.

Purpose:

Replay projection allows the Watcher, Gold Lens, Information Box, and future UI systems to reconstruct living history without corrupting deterministic truth.
