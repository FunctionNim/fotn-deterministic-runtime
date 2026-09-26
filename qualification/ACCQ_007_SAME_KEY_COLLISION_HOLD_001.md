# ACCQ-007 — SAME-KEY LOCAL PROPOSAL COLLISION HOLD 001

## Status

BOUNDED QUALIFICATION / NON-CANON / COLLISION DETECTION + HOLD ONLY / NO WINNER OR MERGE LAW.

## Source boundary

This qualification consumes the already-qualified ACCQ-006 Four-Family Local Composition result rooted at source anchor:

fbcbcae6418d504e9850fcbee29a2f155253b8c2

It does not rewrite ACCQ-002 through ACCQ-006, GamerLaStone Aperture Trial 001, NaShaTa, Underflow, Environmental Heart, or the frozen Pyramid World Container.

The governing runtime matrix keeps the same-key composition law explicitly on HOLD.

## Objective

Prove that two distinct qualified local-family proposals aimed at the same local state key can be:

1. admitted as separate proposals;
2. recognized as a same-key collision;
3. preserved as evidence;
4. placed into HOLD;
5. prevented from silently overwriting one another;
6. prevented from committing state until a lawful composition/arbitration rule exists.

This qualification does NOT define the missing same-key composition law.

## Synthetic collision fixture

Two proposals are generated from distinct qualified local families:

- PROP-CM-001 — CIVIC_METABOLISM
- PROP-WS-001 — WORLD_SUBSTRATE

Both target one synthetic, non-canon fixture key:

FIXTURE.SHARED_LOCAL_STATE_KEY

The payloads are intentionally symbolic. They do not claim a real carrying-capacity, terrain, resource, or ecology merge rule.

## Required collision disposition

When both proposals target the same key:

- collisionDetected = true;
- disposition = HOLD_UNRESOLVED;
- winnerProposalId = null;
- mergeApplied = false;
- stateCommitApplied = false;
- both proposal IDs remain preserved;
- sameKeyCompositionStatus = HOLD.

No family wins by order, name, prior qualification, or position in the four-family chain.

## Preservation requirements

PASS requires:

1. Exactly two proposals are present.
2. The two proposals come from distinct qualified local families.
3. Both proposals target exactly the same key.
4. The collision is explicitly detected.
5. Disposition is HOLD_UNRESOLVED.
6. No winner is selected.
7. No merge is applied.
8. No state commit is applied.
9. Both proposal identities are preserved as evidence.
10. Same-key composition law remains HOLD.
11. No new history record is created.
12. Qualified ACCQ-006 source qualification hash remains unchanged.
13. Repeated execution is byte-identical.
14. Repeated execution produces the same SHA-256 result.
15. ACCQ-006 through ACCQ-002 and GamerLaStone focused regression remain green.
16. Full deterministic regression remains green.

## Authority boundary

Collision detection is not authority.

HOLD is not a winner.

Proposal preservation is not a merge.

No local family becomes scheduler, arbiter, grantor, ruler, or authority over another family.

## Unresolved boundary after this qualification

Even if ACCQ-007 passes, the following remain unresolved:

- whether compatible same-key proposals can ever merge;
- whether some same-key collisions must always reject;
- how a lawful winner could be selected, if winner selection is ever allowed;
- whether higher-scope authority is required for a resolution law;
- how collision rules interact with future concrete state schemas.

Those questions require a separate qualification.

## GamerLaStone boundary

No new aperture is created.

No new human-witness claim is made.

## Canon effect

NONE.

## Qualification result — 2026-09-26

PASS — SAME-KEY LOCAL PROPOSAL COLLISION HOLD 001 QUALIFIED AS A BOUNDED COLLISION-DETECTION + EVIDENCE-PRESERVING HOLD.

Evidence:
- 8/8 focused ACCQ-007 collision tests PASS.
- Preserved ACCQ-006 through ACCQ-002 + GamerLaStone focused regression: 49/49 PASS.
- Combined focused qualification: 7 test files / 57 tests / 57 PASS.
- Full deterministic suite: 38 test files / 670 tests / 670 PASS.
- Typecheck: PASS.
- Production build: PASS.
- Qualified ACCQ-006 source qualification hash remains unchanged.
- Same-key collision is detected.
- Both proposal identities are preserved.
- No winner is selected.
- No merge is applied.
- No state commit is applied.
- No new history record is created.
- Same-key composition law remains HOLD.
- No new GamerLaStone human-witness claim is made.

This result qualifies collision detection and evidence-preserving HOLD only. It does not qualify a same-key merge, winner, or arbitration law.
