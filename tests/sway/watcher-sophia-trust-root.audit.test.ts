import {it,expect} from "vitest";
import {jointCertification} from "../../src/sway/watcher-sophia-certification.js";
it("red-team: claimant controls both evidence store and rule registry",()=>{
const claim={claimId:"attacker-case",claimantId:"submitter",sourceId:"invented:archive",revision:"invented-v1",field:"abilityId",value:"fabricated",evidenceId:"made-up"};
const claimantControlledEvidence=[{custodianId:"pretend-reviewer",sourceId:claim.sourceId,revision:claim.revision,field:claim.field,value:claim.value,evidenceId:claim.evidenceId}];
const claimantControlledRules=[{ruleId:"fake-rule",revision:"fake-v1",allowedFields:["abilityId"]}];
const result=jointCertification(claim,claimantControlledEvidence,"fake-rule","fake-v1",claimantControlledRules);
expect(result.status).toBe("HOLD"); // Historical exploit regression: repaired entrypoint must now deny promotion.
});
