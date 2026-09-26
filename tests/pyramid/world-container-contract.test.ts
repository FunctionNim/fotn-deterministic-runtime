import { describe, expect, it } from "vitest"
import {
  WORLD_CONTAINER_SCHEMA,
  canonicalWorldContainer,
  createAccq001bWorldContainer,
  hashWorldContainer,
  validateWorldContainerContract,
} from "../../src/pyramid/world-container-contract.js"

describe("ACCQ-001B — Pyramid World-Container Insert", () => {
  it("freezes the seven-field world-container contract without activating full pyramid physics", () => {
    const world = createAccq001bWorldContainer()
    expect(world.schema).toBe(WORLD_CONTAINER_SCHEMA)
    expect(world.worldId).toBe("PYRAMID-WORLD-001")
    expect(world.worldVersion).toBe("SCENARIO-B-FROZEN-v0.1")
    expect(world.status).toBe("FROZEN_FIXTURE")
    expect(world.geometryProfile).toBe("SCENARIO_B")
    expect(world.civilizationBearingRegion).toBe("CITY_OF_ABEL_IN_HEPTIBARA")
    expect(world.environment).toEqual({
      livingWorld: "BOUNDED_STABLE_FIXTURE",
      hydrology: "BOUNDED_STABLE_FIXTURE",
      atmosphere: "BOUNDED_STABLE_FIXTURE",
    })
  })

  it("preserves the materially closed-world and NaShaTa boundaries", () => {
    const world = createAccq001bWorldContainer()
    expect(world.boundary.materiallyClosedWorld).toBe(true)
    expect(world.boundary.ordinaryMatterMayCrossUnderflow).toBe(false)
    expect(world.boundary.energyReturnRequiresNaShaTa).toBe(true)
    expect(world.boundary.incomingInfluenceMayDirectlyMutateLocalState).toBe(false)
    expect(world.threshold).toEqual({
      state: "NASHATA_MEDIATED_ACTIVE",
      thresholdRealm: "NASHATA",
      circulationRealm: "UNDERFLOW",
    })
  })

  it("keeps unresolved engineering details explicit instead of inventing them", () => {
    const world = createAccq001bWorldContainer()
    expect(world.heldEngineeringSubsystems).toContain("FINAL_SHELL_MATERIAL_AND_STRENGTHS")
    expect(world.heldEngineeringSubsystems).toContain("EXACT_NASHATA_ENERGY_TRANSFER_PHYSICS")
    expect(world.heldEngineeringSubsystems).toContain("EXACT_BOTTOM_REGION_CROSSING_GEOMETRY")
    expect(world.heldEngineeringSubsystems.length).toBeGreaterThan(0)
  })

  it("binds the world fixture back to the governing source surfaces", () => {
    const world = createAccq001bWorldContainer()
    expect(world.sourceBindings.pyramidAtlasDriveId).toBe("15ODlKvSvg0j4hO62k6HKq0bBcdetRlOw9UI8_6JbWJg")
    expect(world.sourceBindings.accq001aDriveId).toBe("13ixUw4Nr3zqO1L1nx4ucU2_6FRSiGEM67SHoEctQZEw")
    expect(world.sourceBindings.structuralThermalReceipt).toBe("qualification/IMPLEMENTATION_SIMULATION_001_RECEIPT.md")
  })
  it("validates the baseline contract with no errors", () => {
    expect(validateWorldContainerContract(createAccq001bWorldContainer())).toEqual([])
  })

  it("rejects a remote-mutation breach before ACCQ-002 can use the fixture", () => {
    const world = createAccq001bWorldContainer()
    const invalid = structuredClone(world)
    invalid.boundary.incomingInfluenceMayDirectlyMutateLocalState = true as false
    expect(validateWorldContainerContract(invalid)).toContain("DIRECT_REMOTE_MUTATION_FORBIDDEN")
  })

  it("recreates byte-identical canonical state and SHA-256 hash", () => {
    const a = createAccq001bWorldContainer()
    const b = createAccq001bWorldContainer()
    expect(canonicalWorldContainer(a)).toBe(canonicalWorldContainer(b))
    expect(hashWorldContainer(a)).toBe(hashWorldContainer(b))
  })
})
