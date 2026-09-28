import { describe,expect,it } from "vitest"
import { runPressureBeastEffectTrial004,validatePressureBeastEffectTrial004,canonicalPressureBeastEffectTrial004,hashPressureBeastEffectTrial004 } from "../../src/artificial-civilization/pressure-beast-effect-trial-004.js"
describe("Pressure Beast Effect Trial 004 — Basinbeast layered histories",()=>{
 it("preserves both histories",()=>expect(runPressureBeastEffectTrial004().historiesPreserved).toBe(true))
 it("preserves proposal payloads",()=>expect(runPressureBeastEffectTrial004().payloadsPreserved).toBe(true))
 it("uses Basinbeast source identity",()=>expect(runPressureBeastEffectTrial004().pressured.pressure).toEqual({beastId:"BEAST-013",canonicalName:"Basinbeast",pressureFunction:"Stratified Holding / Turnover",active:true}))
 it("observes stratification",()=>expect(runPressureBeastEffectTrial004().stratificationObserved).toBe(true))
 it("keeps histories in distinct layers",()=>expect(runPressureBeastEffectTrial004().pressured.layers).toEqual(["HIST-A","HIST-B"]))
 it("does not merge",()=>expect(runPressureBeastEffectTrial004().pressured.forcedMergeApplied).toBe(false))
 it("does not delete",()=>expect(runPressureBeastEffectTrial004().pressured.deletionApplied).toBe(false))
 it("does not assign priority",()=>expect(runPressureBeastEffectTrial004().pressured.priorityAssigned).toBe(false))
 it("restores turnover",()=>expect(runPressureBeastEffectTrial004().turnoverRecovered).toBe(true))
 it("qualifies bounded effect",()=>expect(runPressureBeastEffectTrial004().qualification).toBe("BASINBEAST_STRATIFICATION_WITH_HISTORIES_PRESERVED_NO_FORCED_PRIORITY"))
 it("validates and replays",()=>{const a=runPressureBeastEffectTrial004(),b=runPressureBeastEffectTrial004();expect(validatePressureBeastEffectTrial004(a)).toEqual([]);expect(canonicalPressureBeastEffectTrial004(a)).toBe(canonicalPressureBeastEffectTrial004(b));expect(hashPressureBeastEffectTrial004(a)).toBe(hashPressureBeastEffectTrial004(b))})
})
