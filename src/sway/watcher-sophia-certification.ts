/** Watcher–Sophia technical certification prototype.
 * Canon effect: NONE. This code cannot grant governing approval.
 * A supplied trusted store must be independently provisioned; never use the
 * submitted candidate fixture to populate its own trust material.
 */
export type CertificationState="PASS"|"FAIL"|"HOLD";
export type EvidenceClaim=Readonly<{
 claimId:string; claimantId:string; sourceId:string; revision:string; field:string;
 value:string; evidenceId:string
}>;
export type TrustedEvidence=Readonly<{
 custodianId:string; sourceId:string; revision:string; field:string;
 value:string; evidenceId:string
}>;
export type TrustedRule=Readonly<{
 ruleId:string; revision:string; allowedFields:readonly string[]
}>;
export type WatcherReceipt=Readonly<{
 claimId:string; status:"VERIFIED"|"UNVERIFIED"; reason:string;
 sourceId:string; revision:string; evidenceId:string
}>;
export type SophiaReceipt=Readonly<{
 claimId:string; status:CertificationState; reason:string;
 ruleId:string; ruleRevision:string
}>;
export type JointReceipt=Readonly<{
 status:CertificationState; watcher:WatcherReceipt; sophia:SophiaReceipt;
 scope:"technical-prototype-only"; governingAcceptance:false
}>;
/** Trusted records are immutable snapshots from an external custody boundary. */
export function watcherVerify(claim:EvidenceClaim, evidence:readonly TrustedEvidence[]):WatcherReceipt {
 const verified=claim.claimId.trim().length>0 && claim.sourceId.trim().length>0 &&
 claim.revision.trim().length>0 && claim.evidenceId.trim().length>0 &&
 claim.claimantId.trim().length>0 && evidence.some(e=>e.custodianId.trim().length>0&&e.custodianId!==claim.claimantId&&e.sourceId===claim.sourceId&&e.revision===claim.revision&&
   e.field===claim.field&&e.value===claim.value&&e.evidenceId===claim.evidenceId);
 return Object.freeze({claimId:claim.claimId,status:verified?"VERIFIED":"UNVERIFIED",
 reason:verified?"Exact independent record match":"Missing or mismatched independent record",
 sourceId:claim.sourceId,revision:claim.revision,evidenceId:claim.evidenceId});
}
export function sophiaQualify(claim:EvidenceClaim,watcher:WatcherReceipt,
 ruleId:string,ruleRevision:string,rules:readonly TrustedRule[]):SophiaReceipt {
 const rule=rules.find(r=>r.ruleId===ruleId&&r.revision===ruleRevision);
 const valid=watcher.status==="VERIFIED"&&watcher.claimId===claim.claimId&&
 watcher.sourceId===claim.sourceId&&watcher.revision===claim.revision&&
 watcher.evidenceId===claim.evidenceId&&!!rule&&rule.allowedFields.includes(claim.field);
 return Object.freeze({claimId:claim.claimId,status:valid?"PASS":"HOLD",
 reason:valid?"Evidence and applicable rule supported":"Evidence or governing rule not independently supported",
 ruleId,ruleRevision});
}
export function jointCertification(claim:EvidenceClaim,evidence:readonly TrustedEvidence[],
 ruleId:string,ruleRevision:string,rules:readonly TrustedRule[]):JointReceipt {
 // Recompute both receipts from trusted inputs; never accept claimant-supplied verdicts.
 const watcher=watcherVerify(claim,evidence);
 const sophia=sophiaQualify(claim,watcher,ruleId,ruleRevision,rules);
 // Caller supplies both evidence and rule arrays. They are not authenticated trust roots.
 // A distinct custodianId string and a matching allowlist are never sufficient
 // for a certification PASS. This legacy entrypoint is intentionally fail-closed
 // until an independently controlled source-and-rule provider is implemented.
 const status:CertificationState="HOLD";
 return Object.freeze({status,watcher,sophia,scope:"technical-prototype-only",governingAcceptance:false});
}
