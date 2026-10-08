/** Authenticated Google Docs retrieval boundary.
 * Tokens must be supplied by a privileged host, never the claimant payload.
 * This reader authenticates *what Google Docs serves* at a pinned revision.
 * It does not establish truth of scenario assertions or grant Council acceptance.
 */
import type {GoogleSourceReader,GoogleSourceRecord,CouncilRuleReader,CouncilRuleRecord} from "./watcher-sophia-trusted-gateway.js";
type TokenSupplier=()=>Promise<string>;
type DocsResponse={revisionId?:string;body?:unknown;tabs?:unknown[]};
type Requester=(url:string,init:{headers:{Authorization:string}})=>Promise<{ok:boolean;json():Promise<unknown>}>;
const DOCS_ROOT="https://docs.googleapis.com/v1/documents/";
async function retrieveDocument(documentId:string,token:TokenSupplier,request:Requester):Promise<DocsResponse|null>{
 const accessToken=await token();
 if(!accessToken.trim())return null;
 const response=await request(DOCS_ROOT+encodeURIComponent(documentId)+"?includeTabsContent=true",{headers:{Authorization:"Bearer "+accessToken}});
 if(!response.ok)return null;
 const value=await response.json();
 if(!value||typeof value!=="object")return null;
 return value as DocsResponse;
}
function extractText(value:unknown):string {
 const chunks:string[]=[];
 function walk(v:unknown):void {
  if(!v||typeof v!=="object")return;
  if(Array.isArray(v)){for(const x of v)walk(x);return}
  const obj=v as Record<string,unknown>;
  if(obj.textRun&&typeof obj.textRun==="object"){
   const s=(obj.textRun as Record<string,unknown>).content;
   if(typeof s==="string")chunks.push(s);
   return;
  }
  for(const [k,x] of Object.entries(obj))if(k!=="documentStyle"&&k!=="namedStyles")walk(x);
 }
 walk(value);return chunks.join("");
}
/** Only source supported literal field candidates, never inferred claims. */
export function googleDocsAbilityReader(args:{documentId:string;revisionId:string;tabId:string;token:TokenSupplier;request:Requester}):GoogleSourceReader {
 return Object.freeze({async readDocument(documentId:string):Promise<GoogleSourceRecord|null>{
  if(documentId!==args.documentId)return null;
  const doc=await retrieveDocument(documentId,args.token,args.request);
  if(!doc||doc.revisionId!==args.revisionId)return null;
  const tab=doc.tabs?.find(t=>!!t&&typeof t==="object"&&
   (t as Record<string,unknown>).tabProperties&&
   ((t as Record<string,unknown>).tabProperties as Record<string,unknown>).tabId===args.tabId);
  if(!tab)return null;
  const body=(tab as Record<string,unknown>).documentTab;
  const text=extractText(body);
  const fields:Record<string,string>={};
  // One explicitly attested value from the frozen A-case description.
  if(text.includes("Permission Signaling; Moderate Poison; Restricted; one misleading access sign; Local; repair"))fields.abilityId="Permission Signaling";
  return Object.freeze({provider:"google-drive" as const,documentId,revisionId:doc.revisionId,fields:Object.freeze(fields),authenticated:true});
 }});
}
/** Council rule documents verify their source wording; they cannot manufacture field authorization. */
export function googleDocsCouncilRuleReader(args:{documentId:string;revisionId:string;token:TokenSupplier;request:Requester}):CouncilRuleReader {
 return Object.freeze({async readRule(ruleId:string):Promise<CouncilRuleRecord|null>{
  if(ruleId!=="Council.GoldTrace")return null;
  const doc=await retrieveDocument(args.documentId,args.token,args.request);
  if(!doc||doc.revisionId!==args.revisionId)return null;
  const text=extractText(doc.tabs??doc.body);
  if(!text.includes("Gold remembers trace and reveals; it does not control."))return null;
  // Current source establishes a trace obligation, not a SWAY abilityId allowlist.
  return Object.freeze({provider:"council-rule-registry" as const,ruleId,revisionId:doc.revisionId,
   allowedFields:Object.freeze([] as string[]),authenticated:true});
 }});
}
