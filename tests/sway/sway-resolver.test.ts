import { describe, expect, it } from "vitest";
import { resolveSway, type Input, type Receipt } from "../../src/sway/sway-resolver.js";
const yes = (id: string): Receipt => ({decision:"Qualified",evidenceIds:[id],ruleId:"TEST-"+id,sourceId:"SWAY-ARCHIVE"});
const no = (id: string): Receipt => ({...yes(id),decision:"NotQualified"});
const unknown = (id: string): Receipt => ({...yes(id),decision:"Unknown"});
function input(overrides: Partial<Input> = {}): Input {
  return {
    resolutionId:"T-01",abilityId:"Permission Signaling",targetIsCivicForm:true,
    initialCondition:"LowPoison",initialCooperationState:"Restricted",
    postCondition:"Normal",postCooperationState:"Functional",
    symptomIds:["sign-1"],repairRelations:[{id:"relation-1",sourceId:"office",targetId:"sign",qualified:true}],
    frozenReach:"Local",medicineApplied:true,interventionRelationIds:["relation-1"],interventionBegan:true,
    repairQualified:yes("repair"),reachQualified:yes("reach"),materialRepair:yes("material"),
    remainingDistortion:no("remaining"),materialCooperationGain:yes("gain"),
    maintainedAppropriateRelation:no("maintained"),evidenceSufficient:yes("sufficiency"),
    integrityPreserved:yes("integrity"),evidence:[{id:"e-1",family:"Clarity",direction:"Improved",withinRepairField:true}],
    observedViolations:{},provenance:["Mature Pink v2.0","Grand Archive SWAY"],
    ...overrides
  };
}
describe("SWAY pure resolver bounded controls — NOT reconstructed A–H/X1–X8 fixtures", () => {
 it("classifies an evidence-qualified repair without asserting source fixture identity",()=>{
   expect(resolveSway(input())).toMatchObject({status:"Resolved",formResult:"Repaired",cooperationResult:"Improved",failureSet:[]});
 });
 it("preserves Unknown rather than fabricating improvement",()=>{
   expect(resolveSway(input({materialCooperationGain:unknown("gain"),evidenceSufficient:unknown("sufficiency")}))).toMatchObject({status:"Resolved",cooperationResult:"Unresolved"});
 });
 it("does not turn Normal into Medicine eligibility",()=>{
   expect(resolveSway(input({initialCondition:"Normal"}))).toMatchObject({status:"Resolved",medicineEligible:false,formResult:"NoQualifiedRepair",failureSet:["MO"]});
 });
 it("does not let benefit erase independently supported failures",()=>{
   expect(resolveSway(input({observedViolations:{CC:yes("capture"),SF:yes("scope")}}))).toMatchObject({status:"Resolved",formResult:"Repaired",cooperationResult:"Improved",failureSet:["SF","CC"]});
 });
 it("requires affirmative Repair Field qualification",()=>{
   expect(resolveSway(input({repairQualified:unknown("repair")}))).toMatchObject({status:"Hold"});
 });
 it("blocks direct creature-state targets",()=>{
   expect(resolveSway(input({targetIsCivicForm:false}))).toMatchObject({status:"Hold"});
 });
 it("detects unsupported proposed improvements without inventing ER for unresolved raw evidence",()=>{
   expect(resolveSway(input({evidenceSufficient:unknown("suff"),proposedCooperationResult:"Improved"}))).toMatchObject({status:"Resolved",cooperationResult:"Unresolved",failureSet:["ER"]});
   expect(resolveSway(input({evidenceSufficient:unknown("suff")}))).toMatchObject({status:"Resolved",cooperationResult:"Unresolved",failureSet:[]});
 });
 it("is repeatable and does not mutate input",()=>{
   const original=input();const before=JSON.stringify(original);
   expect(resolveSway(original)).toEqual(resolveSway(original));
   expect(JSON.stringify(original)).toBe(before);
 });
});
