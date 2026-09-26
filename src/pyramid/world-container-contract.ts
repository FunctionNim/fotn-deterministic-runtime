import { createHash } from "node:crypto"

export const WORLD_CONTAINER_SCHEMA = "ACCQ-001B-v0.1" as const

export type WorldContainerStatus = "FROZEN_FIXTURE"
export type EnvironmentFixtureState = "BOUNDED_STABLE_FIXTURE"
export type ThresholdInterfaceState = "NASHATA_MEDIATED_ACTIVE"

export interface PyramidWorldContainerContract {
  schema: typeof WORLD_CONTAINER_SCHEMA
  worldId: string
  worldVersion: string
  status: WorldContainerStatus
  geometryProfile: "SCENARIO_B"
  civilizationBearingRegion: string
  environment: {
    livingWorld: EnvironmentFixtureState
    hydrology: EnvironmentFixtureState
    atmosphere: EnvironmentFixtureState
  }
  boundary: {
    materiallyClosedWorld: true
    ordinaryMatterMayCrossUnderflow: false
    energyReturnRequiresNaShaTa: true
    incomingInfluenceMayDirectlyMutateLocalState: false
  }
  threshold: {
    state: ThresholdInterfaceState
    thresholdRealm: "NASHATA"
    circulationRealm: "UNDERFLOW"
  }
  heldEngineeringSubsystems: readonly string[]
  sourceBindings: {
    pyramidAtlasDriveId: string
    accq001aDriveId: string
    structuralThermalReceipt: string
  }
}

const HELD = Object.freeze([
  "FINAL_SHELL_MATERIAL_AND_STRENGTHS",
  "EXACT_LAND_ANCHOR_DIMENSIONS_AND_CAPACITY",
  "EXACT_PLATEDGOLD_PHYSICAL_COEFFICIENTS",
  "EXACT_RESIDENT_AND_ENVIRONMENTAL_HEAT_COEFFICIENTS",
  "EXACT_ATMOSPHERE_THERMAL_MODEL",
  "EXACT_NASHATA_ENERGY_TRANSFER_PHYSICS",
  "EXACT_BOTTOM_REGION_CROSSING_GEOMETRY",
] as const)
export function createAccq001bWorldContainer(): PyramidWorldContainerContract {
  return {
    schema: WORLD_CONTAINER_SCHEMA,
    worldId: "PYRAMID-WORLD-001",
    worldVersion: "SCENARIO-B-FROZEN-v0.1",
    status: "FROZEN_FIXTURE",
    geometryProfile: "SCENARIO_B",
    civilizationBearingRegion: "CITY_OF_ABEL_IN_HEPTIBARA",
    environment: {
      livingWorld: "BOUNDED_STABLE_FIXTURE",
      hydrology: "BOUNDED_STABLE_FIXTURE",
      atmosphere: "BOUNDED_STABLE_FIXTURE",
    },
    boundary: {
      materiallyClosedWorld: true,
      ordinaryMatterMayCrossUnderflow: false,
      energyReturnRequiresNaShaTa: true,
      incomingInfluenceMayDirectlyMutateLocalState: false,
    },
    threshold: {
      state: "NASHATA_MEDIATED_ACTIVE",
      thresholdRealm: "NASHATA",
      circulationRealm: "UNDERFLOW",
    },
    heldEngineeringSubsystems: [...HELD],
    sourceBindings: {
      pyramidAtlasDriveId: "15ODlKvSvg0j4hO62k6HKq0bBcdetRlOw9UI8_6JbWJg",
      accq001aDriveId: "13ixUw4Nr3zqO1L1nx4ucU2_6FRSiGEM67SHoEctQZEw",
      structuralThermalReceipt: "qualification/IMPLEMENTATION_SIMULATION_001_RECEIPT.md",
    },
  }
}

export function validateWorldContainerContract(
  contract: PyramidWorldContainerContract,
): readonly string[] {
  const errors: string[] = []
  if (contract.geometryProfile !== "SCENARIO_B") errors.push("GEOMETRY_NOT_SCENARIO_B")
  if (!contract.boundary.materiallyClosedWorld) errors.push("WORLD_NOT_MATERIALLY_CLOSED")
  if (contract.boundary.ordinaryMatterMayCrossUnderflow) errors.push("ORDINARY_MATTER_UNDERFLOW_BREACH")
  if (!contract.boundary.energyReturnRequiresNaShaTa) errors.push("NASHATA_ENERGY_BOUNDARY_MISSING")
  if (contract.boundary.incomingInfluenceMayDirectlyMutateLocalState) errors.push("DIRECT_REMOTE_MUTATION_FORBIDDEN")
  if (contract.threshold.thresholdRealm !== "NASHATA") errors.push("THRESHOLD_REALM_MISMATCH")
  if (contract.threshold.circulationRealm !== "UNDERFLOW") errors.push("CIRCULATION_REALM_MISMATCH")
  if (contract.heldEngineeringSubsystems.length === 0) errors.push("HELD_ENGINEERING_LIST_EMPTY")
  return errors
}
export function canonicalWorldContainer(contract: PyramidWorldContainerContract): string {
  return JSON.stringify(contract)
}

export function hashWorldContainer(contract: PyramidWorldContainerContract): string {
  return createHash("sha256").update(canonicalWorldContainer(contract)).digest("hex")
}
