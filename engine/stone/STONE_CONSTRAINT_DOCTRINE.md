# Stone Constraint Doctrine

Stone defines what may exist as valid simulation state.

Core law:

If it is not in Stone, it does not exist.
If it contradicts Stone, it is invalid.

Runtime rules:

1. System constraints resolve before all other layers.
2. Invalid state must not be committed.
3. Math Max clamps computed values between 0 and 20 unless a higher system rule explicitly allows otherwise.
4. Turn bonus authority limits bonuses to the current turn number, capped at 13.
5. Constraint checks must occur before audit commit.
6. Constraint failure must be visible to audit and replay systems.

Purpose:

Stone prevents undefined simulation states, protects deterministic replay, and preserves canonical meaning.
