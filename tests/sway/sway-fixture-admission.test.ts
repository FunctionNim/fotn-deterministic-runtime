import { describe, it, expect } from "vitest";
import { FROZEN_SWAY_EXPECTATIONS, REQUIRED_FIELD_NAMES, qualifyFixture, type FixtureAdmission } from "../../src/sway/sway-fixture-admission.js";
const source = "Grand Archive SWAY";
function fixture(id:string):FixtureAdmission {
 const fields=Object.fromEntries(REQUIRED_FIELD_NAMES.map(key=>[key,{value:null,status:"Unknown" as const,sourceRef:source,ruleRef:null,evidenceIds:[]}]));
 return {fixtureId:id,sourceRevision:"source-v1",caseType:id.startsWith("X")?"Adversarial":"Clean",fields,
 initialCooperationObservation:{state:"Unassessed",value:null,sourceRef:source},expected:FROZEN_SWAY_EXPECTATIONS[id]};
}
describe("SWAY admission controls",()=>{
 it("retains 16 frozen expected result triples",()=>{
 expect(Object.keys(FROZEN_SWAY_EXPECTATIONS)).toHaveLength(16);
 expect(FROZEN_SWAY_EXPECTATIONS.X2.failureSet).toEqual(["SF","MO","CC","ER"]);
 expect(FROZEN_SWAY_EXPECTATIONS.X7).toEqual({formResult:"NoQualifiedRepair",cooperationResult:"Improved",failureSet:["MO"]});
 });
 it("holds every source case when observations are unknown",()=>{
 for(const id of Object.keys(FROZEN_SWAY_EXPECTATIONS)) expect(qualifyFixture(fixture(id)).status).not.toBe("Executable");
 });
 it("preserves unassessed X3 rather than fabricating a state",()=>{
 const f=fixture("X3");
 expect(qualifyFixture(f).reasons).toContain("Initial Cooperation State not independently observed");
 f.initialCooperationObservation={state:"Observed",value:"Isolated",sourceRef:source};
 expect(qualifyFixture(f).status).toBe("Held");
 });
 it("rejects changed expected outcomes",()=>{
 const f=fixture("X2");
 f.expected={formResult:"Repaired",cooperationResult:"Improved",failureSet:[]};
 expect(qualifyFixture(f).status).toBe("Held");
 });
});
