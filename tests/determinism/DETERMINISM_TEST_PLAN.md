# Determinism Test Plan

Purpose:

The engine must prove that identical inputs produce identical consequences.

Required verification layers:

1. Replay Equivalence
2. Hash Equivalence
3. State Transition Equivalence
4. Rollback Equivalence
5. Audit Append Integrity

Minimum scenario:

- Create a fixed initial state.
- Apply a fixed ordered event list.
- Reconstruct final state twice.
- Compare canonical encoded state.
- Compare generated state hash.
- Compare audit event count.

Failure meaning:

Any mismatch means deterministic integrity is not proven.
