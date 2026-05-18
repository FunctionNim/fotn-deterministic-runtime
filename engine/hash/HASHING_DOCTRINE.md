# Canonical Hashing Doctrine

State hash generation confirms deterministic reality.

Rules:

1. Hashes are generated only from canonical serialized simulation state.
2. Rendering, UI, audio, and animation state must never affect hash output.
3. Dictionary-like data must be ordered before serialization.
4. Floating point values are forbidden in canonical state unless normalized by rule.
5. Equivalent state must always produce identical hash output.
6. Different legal state must produce different hash output whenever possible.

Purpose:

State hashes support replay equivalence, rollback validation, ranked verification, audit integrity, and desync detection.
