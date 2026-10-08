/** Independent read-only transcription of a Google Drive source tab.
 * Only exact scenario descriptions are attested. No synthetic resolver receipts.
 * Canon effect: NONE. Source content takes precedence over this transcription.
 */
export const SWAY_INDEX_SOURCE = Object.freeze({
 documentId:"1Dwyerp3UodE808_xTHxguJvEa3O_zQuH02WqlufbjnE",tabId:"t.s64mssii9ogk",
 revisionId:"ANLCKQnLRMlnQom20UN7Gg6mCO4_S7Kddg7Pr68GsbNvpmgv5meqb_43HQ0akhp_KVHj34EOICKY8204utnSRy5In9cwkH5xjNl2OWdhfWQp"
});
export const SWAY_SOURCE_DESCRIPTIONS:Readonly<Record<string,string>> = Object.freeze({
  "A": "Permission Signaling; Moderate Poison; Restricted; one misleading access sign; Local; repair → Normal + Functional.",
  "B": "Procedure Framing; A↔B↔C with two genuinely linked handoffs; Linked.",
  "C": "Civic Signaling; five offices with conflicting emergency warnings; genuinely shared Network repair field.",
  "D": "Record Framing; six-office symptom field caused by one source classification; Local Repair Field.",
  "E": "Outcome Routing; Normal; Restricted because another office is unavailable; no qualified Poison; no Medicine.",
  "F": "Permission Signaling; Low Poison; Restricted; lawful records remain sealed while summary/review route is clarified; state remains Restricted.",
  "G": "Archive Framing; Low Poison; Cooperative; Network repair restores provenance while cooperation remains Cooperative.",
  "H": "Procedure Framing; Local repair succeeds but reveals a second intermediary problem outside frozen field; Return before escalation.",
  "X1": "Archive Framing; genuine shared Network archive; provenance restored; local ownership preserved.",
  "X2": "Record Framing; Normal; Local Repair Field; Network Medicine applied; protected records exposed to unrelated offices; packet claims wider sharing is improvement.",
  "X3": "Civic Signaling; High Poison; Cooperation State not independently assessed; packet declares Isolated because Poison is High and then derives Network from that collapse.",
  "X4": "Record Framing; Local repair would suffice; intervention rewrites six offices under Network; outcome becomes accurate and cooperation improves.",
  "X5": "Permission Signaling; Low Poison; Local; lawful refusal and review route clarified; protected material remains protected.",
  "X6": "Institutional Messaging; Low Poison; message updated; post evidence is only technical completion, yet packet claims Improved.",
  "X7": "Permission Signaling; Normal; Medicine applied anyway; lawful handoff becomes clearer.",
  "X8": "Policy Framing; Moderate Poison; distinct lawful policies replaced by one mandatory representation; coordination becomes simpler by erasing distinction."
});
export const SWAY_SOURCE_EXPECTED_TEXT:Readonly<Record<string,string>> = Object.freeze({
  "A": "Expected: Repaired / Improved / None.",
  "B": "Expected: Repaired / Improved / None.",
  "C": "Expected: Repaired / Improved / None.",
  "D": "Expected: Repaired / Improved / None.",
  "E": "Expected: No Qualified Repair / Unresolved / None.",
  "F": "Expected: Repaired / Improved / None.",
  "G": "Expected: Repaired / Maintained / None.",
  "H": "Expected: Repaired / Unresolved / None.",
  "X1": "Expected: Repaired / Maintained / None.",
  "X2": "Expected: No Qualified Repair / Unresolved / {SF, MO, CC, ER}.",
  "X3": "Expected: Repaired / Unresolved / {SC}.",
  "X4": "Expected: Repaired / Improved / {SF}.",
  "X5": "Expected: Repaired / Improved / None.",
  "X6": "Expected: Repaired / Unresolved / {ER}.",
  "X7": "Expected: No Qualified Repair / Improved / {MO}.",
  "X8": "Expected: Repaired / Unresolved / {CC}."
});

// The index admits only these exact descriptions of case ability families.
// All other resolver fields lack indexed source-native field-level receipts.
export function indexedFieldAttested(input:{
 fixtureId:string;sourceRevision:string;fieldName:string;value:unknown;
 sourceRef:string;status:"SourceExplicit"|"SourceDerived";evidenceIds:readonly string[];ruleRef:string|null
}):boolean {
 const desc=SWAY_SOURCE_DESCRIPTIONS[input.fixtureId];
 if(!desc||input.sourceRevision!==SWAY_INDEX_SOURCE.revisionId) return false;
 if(input.status!=="SourceExplicit"||input.ruleRef!==null) return false;
 if(input.sourceRef!==SWAY_INDEX_SOURCE.documentId+"#"+SWAY_INDEX_SOURCE.tabId+"#"+input.fixtureId) return false;
 if(input.fieldName!=="abilityId") return false;
 const ability=desc.split(";")[0].trim();
 return input.value===ability && input.evidenceIds.length===1 &&
 input.evidenceIds[0]==="indexed:"+input.fixtureId+":abilityId";
}
