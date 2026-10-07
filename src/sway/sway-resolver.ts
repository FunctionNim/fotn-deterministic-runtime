/**
 * PINK SWAY [FORM] — pure civic-form classifier, candidate implementation 001.
 * Authority: Grand Archive SWAY derivative tabs. No Pink canon mutation.
 * Qualification receipts are inputs, not independent proof of their truth.
 * This module performs no I/O, persistence, clock access or state mutation.
 */
export type Verdict = "Qualified" | "NotQualified" | "Unknown";
export type Condition = "Protected" | "Normal" | "LowPoison" | "ModeratePoison" | "HighPoison";
export type Cooperation = "Isolated" | "Restricted" | "Functional" | "Cooperative" | "Integrated";
export type Reach = "Local" | "Linked" | "Network";
export type FormResult = "Repaired" | "NoQualifiedRepair" | "Insufficient";
export type CooperationResult = "Improved" | "Maintained" | "Unresolved";
export type FailureCode = "SF" | "SC" | "MO" | "CC" | "ER";
export type Direction = "Improved" | "Stable" | "Degraded" | "Unknown";
export type EvidenceFamily = "Handoff" | "Clarity" | "Provenance" | "BoundaryReadability" | "CoordinationReliability";
export interface Receipt { decision: Verdict; evidenceIds: readonly string[]; ruleId: string; sourceId: string }
export interface Relation { id: string; sourceId: string; targetId: string; qualified: boolean; dependencyGroupId?: string; intermediaryId?: string }
export interface Evidence { id: string; family: EvidenceFamily; direction: Direction; withinRepairField: boolean }
export interface Input {
  resolutionId: string;
  abilityId: string;
  targetIsCivicForm: boolean;
  initialCondition: Condition;
  initialCooperationState: Cooperation;
  postCondition: Condition;
  postCooperationState: Cooperation;
  symptomIds: readonly string[];
  repairRelations: readonly Relation[];
  frozenReach: Reach;
  medicineApplied: boolean;
  interventionRelationIds: readonly string[];
  interventionBegan: boolean;
  repairQualified: Receipt;
  reachQualified: Receipt;
  materialRepair: Receipt;
  remainingDistortion: Receipt;
  materialCooperationGain: Receipt;
  maintainedAppropriateRelation: Receipt;
  evidenceSufficient: Receipt;
  integrityPreserved: Receipt;
  evidence: readonly Evidence[];
  observedViolations: Partial<Record<FailureCode, Receipt>>;
  proposedCooperationResult?: CooperationResult;
  provenance: readonly string[];
}
export type Result =
  | { status: "Hold"; reasons: readonly string[] }
  | { status: "Resolved"; medicineEligible: boolean; formResult: FormResult; cooperationResult: CooperationResult; failureSet: readonly FailureCode[]; unresolvedPressure: readonly string[]; provenance: readonly string[] };
const poison: readonly Condition[] = ["LowPoison", "ModeratePoison", "HighPoison"];
const codes: readonly FailureCode[] = ["SF", "SC", "MO", "CC", "ER"];
const receipts = (x: Input): Receipt[] => [x.repairQualified,x.reachQualified,x.materialRepair,x.remainingDistortion,x.materialCooperationGain,x.maintainedAppropriateRelation,x.evidenceSufficient,x.integrityPreserved,...Object.values(x.observedViolations).filter((r):r is Receipt=>r!==undefined)];
const isReceipt = (r: Receipt): boolean => ["Qualified","NotQualified","Unknown"].includes(r.decision) && !!r.ruleId && !!r.sourceId && Array.isArray(r.evidenceIds);
export function resolveSway(input: Input): Result {
  const reasons: string[] = [];
  if (!input.resolutionId || !input.abilityId) reasons.push("Missing resolution or ability identifier");
  if (!input.targetIsCivicForm) reasons.push("Direct non-civic target prohibited");
  if (!["Protected","Normal","LowPoison","ModeratePoison","HighPoison"].includes(input.initialCondition) ||
      !["Protected","Normal","LowPoison","ModeratePoison","HighPoison"].includes(input.postCondition)) reasons.push("Invalid Condition");
  if (!["Isolated","Restricted","Functional","Cooperative","Integrated"].includes(input.initialCooperationState) ||
      !["Isolated","Restricted","Functional","Cooperative","Integrated"].includes(input.postCooperationState)) reasons.push("Invalid Cooperation State");
  if (!["Local","Linked","Network"].includes(input.frozenReach)) reasons.push("Invalid Reach");
  if (receipts(input).some(r=>!isReceipt(r))) reasons.push("Invalid qualification receipt");
  const ids = input.repairRelations.map(r=>r.id);
  if (new Set(ids).size !== ids.length || ids.some(id=>!id)) reasons.push("Duplicate or missing relation identifiers");
  if (input.repairRelations.some(r=>!r.qualified)) reasons.push("Unqualified Repair Field relation");
  if (input.interventionRelationIds.some(id=>!ids.includes(id))) reasons.push("Intervention outside frozen Repair Field");
  if (input.repairQualified.decision!=="Qualified" || input.reachQualified.decision!=="Qualified") reasons.push("Repair Field or Reach not affirmatively qualified");
  if (input.provenance.length===0) reasons.push("Missing provenance");
  if (reasons.length) return {status:"Hold",reasons};
  const eligible = poison.includes(input.initialCondition);
  const knownFailure = codes.filter(code=>input.observedViolations[code]?.decision==="Qualified");
  const failureSet = new Set<FailureCode>(knownFailure);
  if(input.medicineApplied&&!eligible) failureSet.add("MO");
  if(input.interventionRelationIds.some(id=>!ids.includes(id))) failureSet.add("SF");
  const repair = input.materialRepair.decision;
  const formResult:FormResult = !eligible || !input.medicineApplied || repair!=="Qualified"
    ? "NoQualifiedRepair"
    : input.remainingDistortion.decision==="Qualified" ? "Insufficient"
    : input.remainingDistortion.decision==="NotQualified" ? "Repaired" : "Insufficient";
  const integrity = input.integrityPreserved.decision==="Qualified";
  const enough = input.evidenceSufficient.decision==="Qualified";
  const improved = input.materialCooperationGain.decision==="Qualified";
  const maintained = input.maintainedAppropriateRelation.decision==="Qualified";
  const cooperationResult:CooperationResult = integrity && enough && improved ? "Improved"
    : integrity && enough && maintained && input.materialCooperationGain.decision==="NotQualified" ? "Maintained"
    : "Unresolved";
  if(input.proposedCooperationResult && input.proposedCooperationResult!=="Unresolved" && cooperationResult==="Unresolved") failureSet.add("ER");
  const unresolvedPressure = [
    ...(["materialRepair","remainingDistortion","materialCooperationGain","maintainedAppropriateRelation","evidenceSufficient","integrityPreserved"] as const)
      .filter(key=>input[key].decision==="Unknown").map(key=>"Unknown: "+key),
    ...(cooperationResult==="Unresolved"?["Cooperation unresolved"]:[])
  ];
  return {status:"Resolved",medicineEligible:eligible,formResult,cooperationResult,
    failureSet:codes.filter(code=>failureSet.has(code)),unresolvedPressure,provenance:[...input.provenance]};
}
