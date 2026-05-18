# Sequencing Equivalence Rules

Deterministic runtime execution requires stable action ordering.

Sequencing equivalence requires:

- identical ordered actions,
- identical sequence assignment,
- identical tick progression,
- identical replay ordering.

Sequencing mismatch indicates:

- nondeterministic action ordering,
- hidden scheduling drift,
- invalid concurrent resolution,
- replay reconstruction divergence.

Sequencing authority is required for canonical replay truth.
