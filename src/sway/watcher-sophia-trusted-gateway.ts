/**
 * Council trust-boundary adapter. Providers are installed by the host,
 * not supplied in individual certification requests.
 * The Google Docs reader must authenticate with a protected connector/OAuth
 * principal; the Council rules reader must be independently controlled.
 * No provider installed -> HOLD. No AI/Council authority is delegated.
 */
import type {EvidenceClaim,JointReceipt} from "./watcher-sophia-certification.js";
export type GoogleSourceRecord=Readonly<{provider:"google-drive";documentId:string;revisionId:string;fields:Readonly<Record<string,string>>;authenticated:boolean}>;
export type CouncilRuleRecord=Readonly<{provider:"council-rule-registry";ruleId:string;revisionId:string;allowedFields:readonly string[];authenticated:boolean}>;
export type GoogleSourceReader=Readonly<{readDocument(documentId:string):Promise<GoogleSourceRecord|null>}>;
export type CouncilRuleReader=Readonly<{readRule(ruleId:string):Promise<CouncilRuleRecord|null>}>;
export type CertificationRequest=Readonly<{claim:EvidenceClaim;ruleId:string;ruleRevision:string}>;
export type GatewayReceipt=Readonly<{status:"HOLD";sourceState:"VERIFIED"|"HELD";ruleState:"VERIFIED"|"HELD";reason:string;governingAcceptance:false}>;
/** This stage is evidence admission only. It deliberately cannot issue PASS. */
export function makeCouncilCertificationGateway(source:GoogleSourceReader,rules:CouncilRuleReader){
 return async function verify(req:CertificationRequest):Promise<GatewayReceipt>{
  const hold=(sourceState:"VERIFIED"|"HELD",ruleState:"VERIFIED"|"HELD",reason:string):GatewayReceipt=>
   Object.freeze({status:"HOLD",sourceState,ruleState,reason,governingAcceptance:false});
  if(!req.claim.sourceId||!req.claim.revision||!req.claim.field||!req.claim.value||
     !req.ruleId||!req.ruleRevision)return hold("HELD","HELD","Incomplete identity or rule");
  let record:GoogleSourceRecord|null=null;
  let rule:CouncilRuleRecord|null=null;
  try{record=await source.readDocument(req.claim.sourceId)}catch{return hold("HELD","HELD","Source retrieval unavailable")}
  const sourceOK=record?.authenticated===true&&record.provider==="google-drive"&&
   record.documentId===req.claim.sourceId&&record.revisionId===req.claim.revision&&
   Object.prototype.hasOwnProperty.call(record.fields,req.claim.field)&&
   record.fields[req.claim.field]===req.claim.value;
  if(!sourceOK)return hold("HELD","HELD","Unauthenticated, changed or unsupported source field");
  try{rule=await rules.readRule(req.ruleId)}catch{return hold("VERIFIED","HELD","Rule authority unavailable")}
  const ruleOK=rule?.authenticated===true&&rule.provider==="council-rule-registry"&&
   rule.ruleId===req.ruleId&&rule.revisionId===req.ruleRevision&&
   rule.allowedFields.includes(req.claim.field);
  if(!ruleOK)return hold("VERIFIED","HELD","Unqualified Council rule or revision");
  return hold("VERIFIED","VERIFIED","Source and rule checks qualified; no separate complete scenario execution or Council hearing");
 };
}
/** Caller-controlled legacy arrays have no promotion path. */
export function cannotPromoteLegacyReceipt(_receipt:JointReceipt):false{return false}
