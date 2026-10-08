import {describe,it,expect} from "vitest";
import {jointCertification,watcherVerify,sophiaQualify,type EvidenceClaim,type TrustedEvidence,type TrustedRule} from "../../src/sway/watcher-sophia-certification.js";
const claim:EvidenceClaim={claimId:"trial-1",claimantId:"submitter",sourceId:"external:doc",revision:"rev-A",field:"abilityId",value:"Permission Signaling",evidenceId:"e-1"};
const stored:readonly TrustedEvidence[]=[{custodianId:"reviewer",sourceId:claim.sourceId,revision:claim.revision,field:claim.field,value:claim.value,evidenceId:claim.evidenceId}];
const rules:readonly TrustedRule[]=[{ruleId:"qualified-ability",revision:"rule-v1",allowedFields:["abilityId"]}];
const issue=(c=claim,e=stored,r=rules)=>jointCertification(c,e,"qualified-ability","rule-v1",r);
describe("Watcher–Sophia isolated trust-boundary prototype",()=>{
 it("passes only a complete exact-match synthetic control",()=>{const x=issue();expect(x.status).toBe("PASS");expect(x.governingAcceptance).toBe(false)});
 it("holds forged reference",()=>expect(issue({...claim,sourceId:"forged"}).status).toBe("HOLD"));
 it("holds revision drift",()=>expect(issue({...claim,revision:"rev-B"}).status).toBe("HOLD"));
 it("holds fabricated evidence identifier",()=>expect(issue({...claim,evidenceId:"invented"}).status).toBe("HOLD"));
 it("holds evidence value substitution",()=>expect(issue({...claim,value:"Other"}).status).toBe("HOLD"));
 it("holds unsupported rule",()=>expect(issue(claim,stored,[]).status).toBe("HOLD"));
 it("holds rule version drift",()=>expect(jointCertification(claim,stored,"qualified-ability","rule-v2",rules).status).toBe("HOLD"));
 it("holds missing observation/source",()=>expect(issue(claim,[]).status).toBe("HOLD"));
 it("holds self-attested claim without independent custody",()=>expect(issue(claim,[{...claim,custodianId:claim.claimantId}]).status).toBe("HOLD"));
 it("does not promote unmatched watcher evidence in Sophia",()=>{const w=watcherVerify(claim,[]);expect(sophiaQualify(claim,w,"qualified-ability","rule-v1",rules).status).toBe("HOLD")});
});
