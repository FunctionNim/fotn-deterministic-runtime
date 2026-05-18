# Replay Equivalence Doctrine

Deterministic replay validity requires:

- identical initial state,
- identical ordered events,
- identical canonical serialization,
- identical state hashes.

Replay equivalence failure indicates:

- nondeterministic mutation,
- invalid ordering,
- serialization drift,
- hidden side effects,
- illegal state mutation.

A replay mismatch is considered a canonical integrity failure.
