import {describe,expect,it} from "vitest";
import {qualifyFixture,FROZEN_SWAY_EXPECTATIONS,REQUIRED_FIELD_NAMES,type EvidenceAuthenticator,type FixtureAdmission,type QualifiedField} from "../../src/sway/sway-fixture-admission.js";
/** Adversarial controls: fabricated records; never asserted as source-native cases. */
const source="archive:qualified-source";
const revision="pinned-revision";
function fixture():FixtureAdmission {
 const fields:Record<string,QualifiedField>={};
 for(const name of REQUIRED_FIELD_NAMES)
   fields[name]={value:name==="initialCooperationState"?"Restricted":"asserted-value",status:"SourceExplicit",sourceRef:source,ruleRef:null,evidenceIds:["proof:"+name]};
 return {fixtureId:"A",sourceRevision:revision,caseType:"Clean",fields,
 initialCooperationObservation:{state:"Observed",value:"Restricted",sourceRef:source},
 expected:FROZEN_SWAY_EXPECTATIONS.A};
}
function verifier():EvidenceAuthenticator {
 return {
  fieldAttested:x=>x.sourceRevision===revision && x.sourceRef===source &&
    x.evidenceIds.length===1 && x.evidenceIds[0]==="proof:"+x.fieldName &&
    x.status==="SourceExplicit" && x.value!==null,
  observationAttested:x=>x.sourceRevision===revision && x.sourceRef===source && x.value==="Restricted"
 };
}
describe("SWAY evidence authentication — adversarial synthetic controls",()=>{
 it("fails closed when no independent verifier is supplied",()=>{
  expect(qualifyFixture(fixture()).status).not.toBe("Executable");
 });
 it("detects a forged source claim even when all required fields are populated",()=>{
  const f=fixture();f.fields={...f.fields,abilityId:{...f.fields.abilityId,sourceRef:"forged:source"}};
  expect(qualifyFixture(f,verifier()).status).not.toBe("Executable");
 });
 it("rejects unsupported derivation rules",()=>{
  const f=fixture();f.fields={...f.fields,abilityId:{...f.fields.abilityId,status:"SourceDerived",ruleRef:"invented-rule"}};
  expect(qualifyFixture(f,verifier()).status).not.toBe("Executable");
 });
 it("rejects nonexistent or empty evidence identifiers",()=>{
  const f=fixture();f.fields={...f.fields,abilityId:{...f.fields.abilityId,evidenceIds:["missing"]}};
  expect(qualifyFixture(f,verifier()).status).not.toBe("Executable");
  f.fields={...f.fields,abilityId:{...f.fields.abilityId,evidenceIds:[]}};
  expect(qualifyFixture(f,verifier()).status).not.toBe("Executable");
 });
 it("rejects unauthenticated observations",()=>{
  const f=fixture();const bad={...verifier(),observationAttested:()=>false};
  expect(qualifyFixture(f,bad).status).not.toBe("Executable");
 });
 it("recognizes attested synthetic scaffolding only as a gate test, not source evidence",()=>{
  const f=fixture();
  expect(qualifyFixture(f,verifier()).status).not.toBe("Executable");
  // This test stub illustrates the interface only; it cannot establish source authenticity.
 });
 it("preserves all sixteen original expected result triples",()=>{
  expect(Object.keys(FROZEN_SWAY_EXPECTATIONS)).toHaveLength(16);
  expect(FROZEN_SWAY_EXPECTATIONS.X2.failureSet).toEqual(["SF","MO","CC","ER"]);
  expect(FROZEN_SWAY_EXPECTATIONS.X7.failureSet).toEqual(["MO"]);
 });
});
