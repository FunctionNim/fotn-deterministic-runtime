# Rollback Verification Rules

Rollback verification confirms that previous legal state can be reconstructed safely.

Rollback requires:

- deterministic event ordering,
- canonical state encoding,
- valid replay equivalence,
- stable hash reconstruction.

Rollback failure indicates:

- illegal hidden mutation,
- nondeterministic execution,
- invalid state transition,
- replay divergence.

Rollback authority depends on deterministic truth.
