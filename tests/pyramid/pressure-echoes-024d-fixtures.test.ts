import { describe, expect, it } from "vitest"
import { createBaselineWaterState, totalWater, applyWaterCommand } from "../../src/water/closed-loop-water-runtime.js"

// PASS 024D: isolated, test-only paper-contract fixtures.
// No environmental Echo runtime, novel physics, or canon promotion is implemented.
// Gravity uses a test-local reference classifier; Ground and Light are synthetic objects.
// Only Water checks call the existing production Water runtime.
type GravityState = "STABLE" | "WEAKENED" | "CRITICAL" | "OFF"
const classifyGravity = (integrity: number): GravityState => {
  if (!Number.isFinite(integrity) || integrity < 0 || integrity > 1) throw new RangeError("invalid integrity")
  if (integrity === 0) return "OFF"
  if (integrity < 0.5) return "CRITICAL"
  if (integrity < 0.85) return "WEAKENED"
  return "STABLE"
}
const baseDown = Object.freeze([0, -1, 0] as const)
const gravitySnapshot = (integrity: number) => ({
  integrity, strength: integrity, state: classifyGravity(integrity), direction: baseDown,
})
describe("PASS 024D — test-local Gravity Bed reference classifier (not runtime)", () => {
  it.each([[0.90,"STABLE"],[0.85,"STABLE"],[0.70,"WEAKENED"],[0.50,"WEAKENED"],[0.30,"CRITICAL"],[0.01,"CRITICAL"],[0,"OFF"]] as const)(
    "classifies integrity %s as %s without changing local down", (n, expected) => {
      expect(gravitySnapshot(n)).toEqual({integrity:n,strength:n,state:expected,direction:baseDown})
    })
  it.each([-0.01,1.01,Number.NaN,Number.POSITIVE_INFINITY])("rejects invalid integrity %s", n => {
    expect(() => gravitySnapshot(n)).toThrow(RangeError)
  })
  it("repeated input reproduces identical state", () => {
    expect(JSON.stringify(gravitySnapshot(0.30))).toBe(JSON.stringify(gravitySnapshot(0.30)))
  })
})
describe("PASS 024D — existing Water runtime conservation controls", () => {
  it("a normal tick conserves total Water", () => {
    const initial = createBaselineWaterState(5)
    const result = applyWaterCommand(initial,{type:"TICK_NORMAL"})
    expect(result.accepted).toBe(true)
    expect(totalWater(result.state)).toBe(totalWater(initial))
  })
  it("an invalid source transfer never removes Water", () => {
    const initial=createBaselineWaterState(3)
    const result=applyWaterCommand(initial,{type:"TRANSFER",from:"groundwater",to:"lakePond",units:1})
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("SOURCE_UNDERFLOW")
    expect(totalWater(result.state)).toBe(totalWater(initial))
  })
})
describe("PASS 024D — synthetic Ground and Light non-runtime hold controls", () => {
  it("Ground contact flag does not silently mutate Gravity Bed integrity", () => {
    const initial=Object.freeze({contact:true,gravityIntegrity:0.90,landAnchorPenetrated:false})
    const proposed={...initial,contact:false}
    expect(proposed.gravityIntegrity).toBe(initial.gravityIntegrity)
    expect(proposed.landAnchorPenetrated).toBe(false)
  })
  it("Light visibility toggle does not alter semantic content or physical states", () => {
    const initial=Object.freeze({visible:true,messageId:"wayfinding-001",gravityIntegrity:0.90,heatUnits:12})
    const proposed={...initial,visible:false}
    expect(proposed.messageId).toBe(initial.messageId)
    expect(proposed.gravityIntegrity).toBe(initial.gravityIntegrity)
    expect(proposed.heatUnits).toBe(initial.heatUnits)
  })
})

describe("PASS 024F — actual Water runtime replay and rejection", () => {
  it("replays the same real Water command into identical states", () => {
    const initial = createBaselineWaterState(5)
    const first = applyWaterCommand(initial, { type: "TICK_NORMAL" })
    const second = applyWaterCommand(initial, { type: "TICK_NORMAL" })
    expect(first.accepted).toBe(true)
    expect(second.accepted).toBe(true)
    expect(second.state).toEqual(first.state)
    expect(totalWater(first.state)).toBe(totalWater(initial))
  })
  it("preserves Water pool quantities while recording a halted rejected transfer", () => {
    const initial = createBaselineWaterState(3)
    const result = applyWaterCommand(initial, {
      type: "TRANSFER", from: "groundwater", to: "lakePond", units: 1,
    })
    expect(result.accepted).toBe(false)
    expect(result.failureCode).toBe("SOURCE_UNDERFLOW")
    expect(result.state.halted).toBe(true)
    expect(result.state.failureCode).toBe("SOURCE_UNDERFLOW")
    expect(result.state.groundwater).toBe(initial.groundwater)
    expect(result.state.lakePond).toBe(initial.lakePond)
    expect(totalWater(result.state)).toBe(totalWater(initial))
  })
})
