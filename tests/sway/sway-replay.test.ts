import { describe, expect, it } from "vitest";
import { resolveSway, type Input, type Receipt } from "../../src/sway/sway-resolver.js";
// Synthetic replay controls; NOT recovered A-H or X1-X8 source fixture inputs.
const r=(decision:Receipt["decision"],id:string):Receipt=>({decision,evidenceIds:[id],ruleId:"control-"+id,sourceId:"SWAY"});
function sample():Input { return {
resolutionId:"replay",abilityId:"Procedure Framing",targetIsCivicForm:true,
initialCondition:"LowPoison",initialCooperationState:"Restricted",postCondition:"Normal",postCooperationState:"Functional",
symptomIds:["sign"],repairRelations:[{id:"rel",sourceId:"office",targetId:"sign",qualified:true}],
frozenReach:"Local",medicineApplied:true,interventionRelationIds:["rel"],interventionBegan:true,
repairQualified:r("Qualified","field"),reachQualified:r("Qualified","reach"),
materialRepair:r("Qualified","material"),remainingDistortion:r("NotQualified","remaining"),
materialCooperationGain:r("Qualified","gain"),maintainedAppropriateRelation:r("NotQualified","maintain"),
evidenceSufficient:r("Qualified","evidence"),integrityPreserved:r("Qualified","integrity"),
evidence:[],observedViolations:{},provenance:["Grand Archive SWAY"]
}; }
describe("SWAY-specific deterministic replay — synthetic controls",()=>{
it("repeats exact output without mutating input",()=>{
const x=sample(),before=JSON.stringify(x),out=JSON.stringify(resolveSway(x));
for(let i=0;i<100;i++) expect(JSON.stringify(resolveSway(x))).toBe(out);
expect(JSON.stringify(x)).toBe(before);
});
it("does not promote Unknown into cooperation improvement",()=>{
const x=sample();x.evidenceSufficient=r("Unknown","evidence");
const results=Array.from({length:30},()=>resolveSway(x));
expect(results.every(y=>y.status==="Resolved"&&y.cooperationResult==="Unresolved"&&y.failureSet.length===0)).toBe(true);
expect(results.every(y=>JSON.stringify(y)===JSON.stringify(results[0]))).toBe(true);
});
it("records SF without suppressing independently classified outcomes",()=>{
const x=sample();x.interventionRelationIds=["outside"];
expect(resolveSway(x)).toMatchObject({status:"Resolved",formResult:"Repaired",cooperationResult:"Improved",failureSet:["SF"]});
});
it("keeps multiple supported failures and does not invent additional codes",()=>{
const x=sample();x.observedViolations={SF:r("Qualified","scope"),CC:r("Qualified","capture")};
expect(resolveSway(x)).toMatchObject({status:"Resolved",failureSet:["SF","CC"]});
});
});
