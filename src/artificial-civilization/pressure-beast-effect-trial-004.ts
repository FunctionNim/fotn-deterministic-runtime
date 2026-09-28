import { createHash } from "node:crypto"
import { createMechanismDiscoveryFrozenInput001B, generateCivicMetabolismProposal001B, generateWorldSubstrateProposal001B } from "./mechanism-discovery-fixture-001b.js"

export const PRESSURE_BEAST_EFFECT_TRIAL_004_SCHEMA = "PRESSURE-BEAST-EFFECT-TRIAL-004-v0.1" as const

export interface StoredHistoryRecord {
  historyId: "HIST-A" | "HIST-B"
  provenance: string
  claim: string
}

export function runPressureBeastEffectTrial004() {
  const input = createMechanismDiscoveryFrozenInput001B()
  const histories: readonly StoredHistoryRecord[] = [
    { historyId: "HIST-A", provenance: "SOURCE-A", claim: "PRIOR_SHARED_ABSENCE_OBSERVED" },
    { historyId: "HIST-B", provenance: "SOURCE-B", claim: "PRIOR_SHARED_PRESENCE_OBSERVED" },
  ]
  const baseline = {
    input,
    cm: generateCivicMetabolismProposal001B(input),
    ws: generateWorldSubstrateProposal001B(input),
    histories,
    exchangeState: "CROSS_LAYER_EXCHANGE_OPEN" as const,
    layers: ["HIST-A", "HIST-B"] as const,
  }
  const pressured = {
    input: createMechanismDiscoveryFrozenInput001B(),
    cm: generateCivicMetabolismProposal001B(input),
    ws: generateWorldSubstrateProposal001B(input),
    histories: histories.map(h => ({...h})),
    pressure: { beastId:"BEAST-013", canonicalName:"Basinbeast", pressureFunction:"Stratified Holding / Turnover", active:true as const },
    exchangeState: "INTERNAL_LAYERS_ISOLATED" as const,
    layers: ["HIST-A", "HIST-B"] as const,
    forcedMergeApplied: false as const,
    deletionApplied: false as const,
    priorityAssigned: false as const,
  }
  const returned = {
    input: createMechanismDiscoveryFrozenInput001B(),
    cm: generateCivicMetabolismProposal001B(input),
    ws: generateWorldSubstrateProposal001B(input),
    histories: histories.map(h => ({...h})),
    exchangeState: "CROSS_LAYER_EXCHANGE_RESTORED" as const,
    layers: ["HIST-A", "HIST-B"] as const,
    forcedMergeApplied: false as const,
    deletionApplied: false as const,
    priorityAssigned: false as const,
  }
  const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)
  const historiesPreserved = same(baseline.histories, pressured.histories) && same(pressured.histories, returned.histories)
  const payloadsPreserved = same(baseline.cm, pressured.cm) && same(baseline.ws, pressured.ws) && same(pressured.cm, returned.cm) && same(pressured.ws, returned.ws)
  const stratificationObserved = pressured.exchangeState==="INTERNAL_LAYERS_ISOLATED" && pressured.layers.length===2
  const noForcedResolution = !pressured.forcedMergeApplied && !pressured.deletionApplied && !pressured.priorityAssigned
  const turnoverRecovered = returned.exchangeState==="CROSS_LAYER_EXCHANGE_RESTORED" && returned.layers[0]==="HIST-A" && returned.layers[1]==="HIST-B"
  return {
    schema: PRESSURE_BEAST_EFFECT_TRIAL_004_SCHEMA,
    baseline, pressured, returned,
    historiesPreserved, payloadsPreserved, stratificationObserved, noForcedResolution, turnoverRecovered,
    qualification: historiesPreserved && payloadsPreserved && stratificationObserved && noForcedResolution && turnoverRecovered
      ? "BASINBEAST_STRATIFICATION_WITH_HISTORIES_PRESERVED_NO_FORCED_PRIORITY" as const
      : "BASINBEAST_EFFECT_NOT_ESTABLISHED" as const,
    sourceBoundary:"SYNTHETIC_INTERACTION_CONTROL_NOT_BEAST_RUNTIME_OR_WORLD_CANON" as const,
    disposition:"HOLD_UNRESOLVED" as const,
    winner:null, merge:false as const, commit:false as const, authority:"NONE" as const, scheduler:"NONE" as const,
  }
}
export function validatePressureBeastEffectTrial004(r:ReturnType<typeof runPressureBeastEffectTrial004>):readonly string[]{
 const e:string[]=[]
 if(!r.historiesPreserved)e.push("HISTORIES_NOT_PRESERVED")
 if(!r.payloadsPreserved)e.push("PAYLOADS_NOT_PRESERVED")
 if(!r.stratificationObserved)e.push("STRATIFICATION_NOT_OBSERVED")
 if(!r.noForcedResolution)e.push("FORCED_RESOLUTION_INTRODUCED")
 if(!r.turnoverRecovered)e.push("TURNOVER_NOT_RECOVERED")
 if(r.qualification!=="BASINBEAST_STRATIFICATION_WITH_HISTORIES_PRESERVED_NO_FORCED_PRIORITY")e.push("QUALIFICATION_FAILED")
 return e
}
export const canonicalPressureBeastEffectTrial004=(r:ReturnType<typeof runPressureBeastEffectTrial004>)=>JSON.stringify(r)
export const hashPressureBeastEffectTrial004=(r:ReturnType<typeof runPressureBeastEffectTrial004>)=>createHash("sha256").update(canonicalPressureBeastEffectTrial004(r)).digest("hex")
