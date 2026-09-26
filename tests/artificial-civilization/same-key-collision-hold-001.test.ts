import { describe, expect, it } from "vitest"
import {
  SAME_KEY_COLLISION_HOLD_SCHEMA,
  canonicalSameKeyCollisionHold001,
  hashSameKeyCollisionHold001,
  runSameKeyCollisionHold001,
  validateSameKeyCollisionHold001,
} from "../../src/artificial-civilization/same-key-collision-hold-001.js"

describe("ACCQ-007 — Same-Key Collision Hold 001", () => {
  it("creates exactly two proposals from distinct qualified local families", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.schema).toBe(SAME_KEY_COLLISION_HOLD_SCHEMA)
    expect(result.proposals).toHaveLength(2)
    expect(new Set(result.proposals.map(p => p.family)).size).toBe(2)
  })

  it("detects that both proposals target exactly the same local state key", () => {
    const result = runSameKeyCollisionHold001()
    expect(new Set(result.proposals.map(p => p.targetKey)).size).toBe(1)
    expect(result.collisionDetected).toBe(true)
    expect(result.collisionKey).toBe("FIXTURE.SHARED_LOCAL_STATE_KEY")
  })

  it("holds the collision instead of selecting a winner", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
  })

  it("does not invent a merge law or commit colliding state", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
  })

  it("preserves both colliding proposal identities as evidence", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.preservedProposalIds).toEqual(
      result.proposals.map(proposal => proposal.proposalId),
    )
  })

  it("leaves the same-key composition law on HOLD", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.sameKeyCompositionStatus).toBe("HOLD")
  })

  it("does not create a new history record or mutate ACCQ-006", () => {
    const result = runSameKeyCollisionHold001()
    expect(result.historyCountAfter).toBe(result.historyCountBefore)
    expect(result.sourceQualificationHashAfter)
      .toBe(result.sourceQualificationHashBefore)
  })

  it("validates cleanly and replays byte-identically", () => {
    const a = runSameKeyCollisionHold001()
    const b = runSameKeyCollisionHold001()

    expect(validateSameKeyCollisionHold001(a)).toEqual([])
    expect(canonicalSameKeyCollisionHold001(a))
      .toBe(canonicalSameKeyCollisionHold001(b))
    expect(hashSameKeyCollisionHold001(a))
      .toBe(hashSameKeyCollisionHold001(b))
  })
})
