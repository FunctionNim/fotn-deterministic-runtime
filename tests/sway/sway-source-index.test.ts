import {describe,it,expect} from "vitest";
import {SWAY_INDEX_SOURCE,SWAY_SOURCE_DESCRIPTIONS,SWAY_SOURCE_EXPECTED_TEXT,indexedFieldAttested} from "../../src/sway/sway-source-evidence-index.js";
import {qualifyFixture,FROZEN_SWAY_EXPECTATIONS,REQUIRED_FIELD_NAMES,type FixtureAdmission} from "../../src/sway/sway-fixture-admission.js";
describe("independent read-only source index",()=>{
it("preserves 16 descriptions and pinned Google revision",()=>{
 expect(Object.keys(SWAY_SOURCE_DESCRIPTIONS)).toHaveLength(16);
 expect(SWAY_INDEX_SOURCE.documentId).toBe("1Dwyerp3UodE808_xTHxguJvEa3O_zQuH02WqlufbjnE");
 expect(SWAY_SOURCE_EXPECTED_TEXT.X2).toContain("{SF, MO, CC, ER}");
});
it("authenticates only exact indexed ability claims",()=>{
 const x={fixtureId:"A",sourceRevision:SWAY_INDEX_SOURCE.revisionId,fieldName:"abilityId",value:"Permission Signaling",sourceRef:SWAY_INDEX_SOURCE.documentId+"#"+SWAY_INDEX_SOURCE.tabId+"#A",status:"SourceExplicit" as const,evidenceIds:["indexed:A:abilityId"],ruleRef:null};
 expect(indexedFieldAttested(x)).toBe(true);
 expect(indexedFieldAttested({...x,value:"Other"})).toBe(false);
 expect(indexedFieldAttested({...x,fieldName:"materialRepair"})).toBe(false);
 expect(indexedFieldAttested({...x,status:"SourceDerived",ruleRef:"invented"})).toBe(false);
 expect(indexedFieldAttested({...x,sourceRevision:"wrong"})).toBe(false);
});
it("holds all 16 source cases with absent field evidence even with permissive external callback",()=>{
 const allowed={fieldAttested:()=>true,observationAttested:()=>true};
 for(const fixtureId of Object.keys(FROZEN_SWAY_EXPECTATIONS)){
  const fields=Object.fromEntries(REQUIRED_FIELD_NAMES.map(name=>[name,{value:"claimed",status:"SourceExplicit" as const,sourceRef:"fabricated",ruleRef:null,evidenceIds:["claimed"]}]));
  const fixture:FixtureAdmission={fixtureId,sourceRevision:SWAY_INDEX_SOURCE.revisionId,caseType:fixtureId.startsWith("X")?"Adversarial":"Clean",fields,initialCooperationObservation:{state:"Observed",value:"claimed",sourceRef:"fabricated"},expected:FROZEN_SWAY_EXPECTATIONS[fixtureId]};
  expect(qualifyFixture(fixture,allowed).status).not.toBe("Executable");
 }
});
});
