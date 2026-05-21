# Pressure Engine Doctrine

Pressure is the runtime representation of consequence tension.

Rules:

1. Pressure changes must be deterministic.
2. Pressure propagation must be ordered.
3. Pressure collisions must resolve through explicit rules.
4. Pressure feedback must be replay-safe.
5. Pressure state must never depend on rendering or animation state.
6. Pressure output may inform observability but must not bypass state transition authority.

Purpose:

The PressureEngine tracks how Function pressure spreads, collides, feeds, stabilizes, and destabilizes across the simulation.
