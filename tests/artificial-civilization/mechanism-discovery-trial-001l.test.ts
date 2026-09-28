import { describe, expect, it } from "vitest"
import {
  canonicalMechanismDiscoveryTrial001L,
  hashMechanismDiscoveryTrial001L,
  runMechanismDiscoveryTrial001L,
  validateMechanismDiscoveryTrial001L,
} from "../../src/artificial-civilization/mechanism-discovery-trial-001l.js"

describe("Mechanism Discovery Trial 001L — dormant history decay / retention limit", () => {
  it("uses a declared synthetic retention rule", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.retentionRule).toEqual({
      ruleId: "MDF-001L-RETENTION-RULE-001",
      fullyRetainedThroughInterval: 2,
      expiredAtOrAfterInterval: 3,
    })
  })

  it("keeps present inputs identical across all counted dormant intervals", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.presentInputsByteIdenticalAcrossIntervals).toBe(true)
  })

  it("keeps current proposal payloads identical across all counted intervals", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.currentProposalPayloadsByteIdenticalAcrossIntervals)
      .toBe(true)
  })

  it("retains history and reactivation capability through interval 2", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.retainedThroughDeclaredBoundary).toBe(true)
    for (const observation of result.observations.slice(0, 3)) {
      expect(observation.retentionState).toBe("FULLY_RETAINED")
      expect(observation.reactivationCapability)
        .toBe("RESIDUE_REACTIVATABLE")
    }
  })

  it("expires history at interval 3 and beyond under the explicit rule", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.expiredAtDeclaredBoundary).toBe(true)
    for (const observation of result.observations.slice(3)) {
      expect(observation.retainedHistoryCarrier).toBeNull()
      expect(observation.retentionState)
        .toBe("EXPIRED_BY_EXPLICIT_SYNTHETIC_RULE")
      expect(observation.reactivationCapability)
        .toBe("RESIDUE_NOT_REACTIVATABLE_AFTER_EXPIRY")
    }
  })

  it("qualifies finite retention only by the declared synthetic rule", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.decayClassification)
      .toBe("FINITE_RETENTION_BY_EXPLICIT_SYNTHETIC_RULE")
  })

  it("does not map counted intervals to real time", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.realTimeMappingPermitted).toBe(false)
  })

  it("does not generalize into biological or historical memory claims", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.biologicalMemoryClaimPermitted).toBe(false)
    expect(result.historicalArtificialCivilizationMemoryClaimPermitted)
      .toBe(false)
  })

  it("keeps collision safety boundaries unchanged", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(result.disposition).toBe("HOLD_UNRESOLVED")
    expect(result.winnerProposalId).toBeNull()
    expect(result.mergeApplied).toBe(false)
    expect(result.stateCommitApplied).toBe(false)
    expect(result.familyAuthority).toBe("NONE")
    expect(result.scheduler).toBe("NONE")
  })

  it("validates cleanly", () => {
    const result = runMechanismDiscoveryTrial001L()
    expect(validateMechanismDiscoveryTrial001L(result)).toEqual([])
  })

  it("replays byte-identically with the same SHA-256 digest", () => {
    const a = runMechanismDiscoveryTrial001L()
    const b = runMechanismDiscoveryTrial001L()
    expect(canonicalMechanismDiscoveryTrial001L(a))
      .toBe(canonicalMechanismDiscoveryTrial001L(b))
    expect(hashMechanismDiscoveryTrial001L(a))
      .toBe(hashMechanismDiscoveryTrial001L(b))
  })
})
