# Canonical Serialization Doctrine

Serialized state must be deterministic, ordered, stable, and replay-safe.

Rules:

1. Never depend on dictionary iteration order.
2. Never depend on locale-sensitive formatting.
3. Never serialize transient rendering state.
4. Always serialize simulation state in a canonical order.
5. Hashes must be generated from canonical serialized state only.

Purpose:

InitialState plus OrderedEvents must reconstruct the same final state on every valid machine.
