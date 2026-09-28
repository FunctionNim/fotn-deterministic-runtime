import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryFixture001B,
  createMechanismDiscoveryFrozenInput001B,
  generateCivicMetabolismProposal001B,
  generateWorldSubstrateProposal001B,
  hashMechanismDiscoveryFixture001B,
  runMechanismDiscoveryFixture001B,
  validateMechanismDiscoveryFixture001B,
} from "../../src/artificial-civilization/mechanism-discovery-fixture-001b.js"

describe("Mechanism Discovery Fixture 001B — independent generators + baseline control", () => {
  it("generates the CM proposal independently from frozen input", () => {
    const input = createMechanismDiscoveryFrozenInput001B()
    const proposal = generateCivicMetabolismProposal001B(input)
    expect(proposal.family).toBe("CIVIC_METABOLISM")
    expect(proposal.targetKey).toBe("FIXTURE.SHARED_LOCAL_STATE_KEY")
  })

  it("generates the WS proposal independently from frozen input", () => {
    const input = createMechanismDiscoveryFrozenInput001B()
    const proposal = generateWorldSubstrateProposal001B(input)
    expect(proposal.family).toBe("WORLD_SUBSTRATE")
    expect(proposal.targetKey).toBe("FIXTURE.SHARED_LOCAL_STATE_KEY")
  })

  it("exposes the synthetic shared and family inputs each proposal consumed", () => {
    const input = createMechanismDiscoveryFrozenInput001B()
    const cm = generateCivicMetabolismProposal001B(input)
    const ws = generateWorldSubstrateProposal001B(input)

    expect(cm.observedSharedToken).toBe("SYNTHETIC_SHARED_TOKEN")
    expect(cm.observedFamilyToken).toBe("SYNTHETIC_CM_TOKEN")
    expect(ws.observedSharedToken).toBe("SYNTHETIC_SHARED_TOKEN")
    expect(ws.observedFamilyToken).toBe("SYNTHETIC_WS_TOKEN")
  })

  it("reproduces both proposals in co-presence without changing either proposal", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(result.cmStableAcrossContexts).toBe(true)
    expect(result.wsStableAcrossContexts).toBe(true)
    expect(result.coPresence).toEqual([result.cmOnly, result.wsOnly])
  })

  it("preserves the same proposal set when evaluation order is reversed", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(result.orderIndependentSet).toBe(true)
    expect(new Set(result.coPresence.map(p => p.proposalId))).toEqual(
      new Set(result.reversedCoPresence.map(p => p.proposalId)),
    )
  })

  it("detects same-key co-targeting while preserving HOLD", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(result.collisionDetected).toBe(true)
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
  })

  it("does not select, merge, commit, schedule, or create family authority", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.scheduler).toBe("NONE")
    expect(result.familyAuthority).toBe("NONE")
  })

  it("qualifies only a synthetic PARALLEL_ONLY baseline", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(result.relationClassification).toBe("PARALLEL_ONLY_BASELINE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryFixture001B()
    expect(validateMechanismDiscoveryFixture001B(result)).toEqual([])
  })

  it("replays byte-identically", () => {
    const a = runMechanismDiscoveryFixture001B()
    const b = runMechanismDiscoveryFixture001B()
    expect(canonicalMechanismDiscoveryFixture001B(a))
      .toBe(canonicalMechanismDiscoveryFixture001B(b))
  })

  it("replays with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryFixture001B()
    const b = runMechanismDiscoveryFixture001B()
    expect(hashMechanismDiscoveryFixture001B(a))
      .toBe(hashMechanismDiscoveryFixture001B(b))
  })
})
