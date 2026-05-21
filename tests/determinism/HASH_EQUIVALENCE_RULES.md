# Hash Equivalence Rules

Equivalent simulation state must generate identical hashes.

Hash mismatches indicate one or more of the following:

- nondeterministic mutation,
- serialization ordering drift,
- hidden side effects,
- illegal state divergence,
- replay reconstruction failure.

Hash equivalence is required for:

- ranked verification,
- replay validation,
- rollback correctness,
- deterministic observability,
- MMO synchronization.
