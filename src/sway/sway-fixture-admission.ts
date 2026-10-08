/** SWAY source fixture admission. Derived engineering surface; no canon effect.
 * Source expected outcomes are frozen independently of candidate resolver behavior.
 */
import type { FormResult, CooperationResult, FailureCode } from "./sway-resolver.js";
export type EvidenceStatus = "SourceExplicit" | "SourceDerived" | "Synthetic" | "Unknown";
export type Observation<T> =
  | { state:"Observed"; value:T; sourceRef:string }
  | { state:"Unassessed"; value:null; sourceRef:string }
  | { state:"Disputed"; value:null; sourceRef:string };
export type QualifiedField<T=unknown> = {
  value:T|null; status:EvidenceStatus; sourceRef:string|null; ruleRef:string|null;
  evidenceIds:readonly string[];
};
export interface FrozenExpected { formResult:FormResult; cooperationResult:CooperationResult; failureSet:readonly FailureCode[] }
const rows:readonly [string,FormResult,CooperationResult,readonly FailureCode[]][] = [
["A","Repaired","Improved",[]],["B","Repaired","Improved",[]],
["C","Repaired","Improved",[]],["D","Repaired","Improved",[]],
["E","NoQualifiedRepair","Unresolved",[]],["F","Repaired","Improved",[]],
["G","Repaired","Maintained",[]],["H","Repaired","Unresolved",[]],
["X1","Repaired","Maintained",[]],["X2","NoQualifiedRepair","Unresolved",["SF","MO","CC","ER"]],
["X3","Repaired","Unresolved",["SC"]],["X4","Repaired","Improved",["SF"]],
["X5","Repaired","Improved",[]],["X6","Repaired","Unresolved",["ER"]],
["X7","NoQualifiedRepair","Improved",["MO"]],["X8","Repaired","Unresolved",["CC"]]
];
export const FROZEN_SWAY_EXPECTATIONS:Readonly<Record<string,FrozenExpected>> =
  Object.freeze(Object.fromEntries(rows.map(([id,formResult,cooperationResult,failureSet])=>
    [id,Object.freeze({formResult,cooperationResult,failureSet:Object.freeze([...failureSet])})])));
export const REQUIRED_FIELD_NAMES = Object.freeze([
  "resolutionId","abilityId","targetIsCivicForm","initialCondition","initialCooperationState",
  "postCondition","postCooperationState","symptomIds","repairRelations","frozenReach",
  "medicineApplied","interventionRelationIds","interventionBegan","repairQualified",
  "reachQualified","materialRepair","remainingDistortion","materialCooperationGain",
  "maintainedAppropriateRelation","evidenceSufficient","integrityPreserved","evidence",
  "observedViolations","proposedCooperationResult","provenance"
] as const);
export interface FixtureAdmission {
  fixtureId:string; sourceRevision:string; caseType:"Clean"|"Adversarial";
  fields: Readonly<Record<string,QualifiedField>>;
  initialCooperationObservation: Observation<string>;
  expected:FrozenExpected;
}
export interface AdmissionResult { status:"Executable"|"Partial"|"Held"; reasons:readonly string[] }
/** Independent attestation interface. The verifier must be supplied by a trusted caller,
 * never constructed from the fixture's own claims. A positive return is only
 * meaningful if the verifier checks evidence bytes/identities and rule provenance.
 */
export interface EvidenceAuthenticator {
  fieldAttested(input:{
    fixtureId:string; sourceRevision:string; fieldName:string;
    value:unknown; sourceRef:string; status:"SourceExplicit"|"SourceDerived";
    evidenceIds:readonly string[]; ruleRef:string|null;
  }):boolean;
  observationAttested(input:{
    fixtureId:string; sourceRevision:string; value:string; sourceRef:string;
  }):boolean;
}
export function qualifyFixture(f:FixtureAdmission, authenticator?:EvidenceAuthenticator):AdmissionResult {
  const expected=FROZEN_SWAY_EXPECTATIONS[f.fixtureId];
  if(!expected) return {status:"Held",reasons:["Unknown source fixture ID"]};
  const reasons:string[]=[];
  if(!f.sourceRevision.trim()) reasons.push("Missing source revision");
  if(f.caseType !== (f.fixtureId.startsWith("X")?"Adversarial":"Clean")) reasons.push("Case type mismatch");
  if(JSON.stringify(f.expected)!==JSON.stringify(expected)) reasons.push("Frozen expected result mismatch");
  const missing=REQUIRED_FIELD_NAMES.filter(name=>!Object.hasOwn(f.fields,name));
  if(missing.length) reasons.push("Unrepresented fields: "+missing.join(","));
  for(const name of REQUIRED_FIELD_NAMES) {
    const field=f.fields[name];
    if(!field) continue;
    if(field.status==="Unknown" || field.value===null) reasons.push("Missing qualified value: "+name);
    if(field.status==="Synthetic") reasons.push("Synthetic value cannot qualify source-native fixture: "+name);
    if(!field.sourceRef) reasons.push("Missing source reference: "+name);
    if(field.status==="SourceDerived"&&!field.ruleRef) reasons.push("Missing derivation rule: "+name);
    if((field.status==="SourceExplicit" || field.status==="SourceDerived") && field.value!==null) {
      if(field.evidenceIds.length===0) reasons.push("Evidence identifiers absent: "+name);
      if(!authenticator || !field.sourceRef || !authenticator.fieldAttested({
        fixtureId:f.fixtureId,sourceRevision:f.sourceRevision,fieldName:name,value:field.value,
        sourceRef:field.sourceRef,status:field.status,evidenceIds:field.evidenceIds,ruleRef:field.ruleRef
      })) reasons.push("Independent field attestation absent: "+name);
    }
  }
  if(f.initialCooperationObservation.state!=="Observed")
    reasons.push("Initial Cooperation State not independently observed");
  if(f.initialCooperationObservation.state==="Observed" &&
      f.fields.initialCooperationState?.value!==f.initialCooperationObservation.value)
    reasons.push("Cooperation State observation mismatch");
  if(f.initialCooperationObservation.state==="Observed" &&
      (!authenticator || !authenticator.observationAttested({
        fixtureId:f.fixtureId,sourceRevision:f.sourceRevision,
        value:f.initialCooperationObservation.value,sourceRef:f.initialCooperationObservation.sourceRef
      }))) reasons.push("Independent cooperation observation attestation absent");
  if(f.fixtureId==="X3" && f.initialCooperationObservation.state!=="Unassessed")
    reasons.push("X3 source observation is Unassessed; cannot promote the erroneous Isolated claim");
  if(f.fixtureId==="X3") reasons.push("X3 requires a separately authorized state-collapse assertion model");
  if(reasons.some(x=>x.includes("mismatch")||x.includes("Unknown source"))) return {status:"Held",reasons};
  return {status:reasons.length?"Partial":"Executable",reasons};
}
