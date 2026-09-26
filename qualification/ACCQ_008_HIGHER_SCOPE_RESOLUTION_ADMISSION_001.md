# ACCQ-008 — HIGHER-SCOPE COLLISION RESOLUTION ADMISSION 001

## Status

BOUNDED QUALIFICATION / NON-CANON / AUTHORITY-ADMISSION GATE ONLY / NO RESOLUTION LAW INVENTED.

## Source boundary

This qualification consumes the already-qualified ACCQ-007 Same-Key Local Proposal Collision Hold result rooted at source anchor:

319861fee3cd547e643cbbc0f13eb461264fcf7f

It does not rewrite ACCQ-002 through ACCQ-007, GamerLaStone Aperture Trial 001, NaShaTa, Underflow, Environmental Heart, or the frozen Pyramid World Container.

No executable higher-scope same-key resolver exists in the current qualified runtime.

That absence is preserved as evidence rather than silently replaced.

## Objective

Determine what a candidate resolution authority would have to prove before it could even be admitted to resolve a held same-key collision.

ACCQ-008 does not select a winner.

ACCQ-008 does not define a merge.

ACCQ-008 does not commit collided state.

It qualifies only an admission boundary for a future higher-scope resolution law.

## Admission requirements

A candidate resolution authority must satisfy all of the following:

1. It is not one of the colliding local clock families acting as self-authority.
2. It is explicitly higher-scope relative to the colliding local families.
3. Its declared scope includes the collided state key.
4. Its declared scope includes every colliding family.
5. It provides an explicit deterministic rule identifier.
6. It provides a version.
7. It provides provenance for the authority rule.

A candidate failing any required element is not admitted.

## Synthetic candidates

Candidate A:

AUTH-CAND-LOCAL-FAMILY-001

CIVIC_METABOLISM attempts to act as peer-resolution authority over a collision involving itself and WORLD_SUBSTRATE.

Expected disposition:

REJECT.

Reason includes:

LOCAL_FAMILY_CANNOT_AUTHOR_PEER_RESOLUTION_AUTHORITY.

Candidate B:

AUTH-CAND-HIGHER-SCOPE-INCOMPLETE-001

A synthetic higher-scope policy-layer candidate covers the collision key and both local families and provides version/provenance, but it has no deterministic rule identifier.

Expected disposition:

REJECT.

Reason includes:

DETERMINISTIC_RULE_ID_MISSING.

The synthetic policy-layer name is test scaffolding only. It is not promoted to canon and does not establish a real Grimoire authority entity.

## Required result

Because no candidate in this fixture satisfies the complete admission contract:

- admittedCandidateIds = empty;
- resolutionApplied = false;
- winnerProposalId = null;
- mergeApplied = false;
- stateCommitApplied = false;
- finalDisposition = HOLD_UNRESOLVED;
- authorityLawStatus = AWAITING_QUALIFIED_HIGHER_SCOPE_RULE.

## Preservation requirements

PASS requires:

1. ACCQ-007 begins in HOLD_UNRESOLVED.
2. Local-family self-authority is rejected.
3. Incomplete higher-scope authority is rejected.
4. No candidate is admitted.
5. No winner is selected.
6. No merge is applied.
7. No state commit is applied.
8. Collision remains HOLD_UNRESOLVED.
9. Authority-law status remains awaiting a qualified higher-scope rule.
10. No new history record is created.
11. Qualified ACCQ-007 source hash remains unchanged.
12. Repeated execution is byte-identical.
13. Repeated execution produces the same SHA-256 result.
14. ACCQ-007 through ACCQ-002 and GamerLaStone focused regression remain green.
15. Full deterministic regression remains green.

## Meaning of PASS

PASS does not mean a higher-scope resolution law exists.

PASS means the runtime now has a bounded test for refusing unauthorized or incomplete resolver candidates.

It converts the unresolved question from:

"What should win?"

into:

"What evidence must a lawful resolver provide before it may participate?"

## Remaining HOLD

The actual same-key composition/resolution law remains unresolved.

Future work may test a candidate law only if its lineage, grant/scope, deterministic operation, version, and provenance are explicitly supplied.

## GamerLaStone boundary

No new aperture is created.

No new human-witness claim is made.

## Canon effect

NONE.

## Qualification result — 2026-09-26

PASS — HIGHER-SCOPE COLLISION RESOLUTION ADMISSION 001 QUALIFIED AS A BOUNDED AUTHORITY-ADMISSION GATE.

Evidence:
- 8/8 focused ACCQ-008 admission tests PASS.
- Preserved ACCQ-007 through ACCQ-002 + GamerLaStone focused regression: 57/57 PASS.
- Combined focused qualification: 8 test files / 65 tests / 65 PASS.
- Full deterministic suite: 39 test files / 678 tests / 678 PASS.
- Typecheck: PASS.
- Production build: PASS.
- Qualified ACCQ-007 source hash remains unchanged.
- Local-family self-authority is rejected.
- Incomplete higher-scope authority is rejected.
- No authority candidate is admitted.
- No winner, merge, state commit, or new history record is produced.
- Collision remains HOLD_UNRESOLVED.
- Authority-law status remains AWAITING_QUALIFIED_HIGHER_SCOPE_RULE.
- No new GamerLaStone human-witness claim is made.

This result qualifies only the admission contract for future resolver authority. It does not qualify any actual same-key resolution law.
