import {describe,it,expect} from 'vitest';
import {jointCertification} from '../../src/sway/watcher-sophia-certification.js';
describe('untrusted candidate evidence',()=>{
 it('must not issue a certificate',()=>{
  const c={claimId:'c',claimantId:'a',sourceId:'s',revision:'v',field:'f',value:'x',evidenceId:'e'};
  const e=[{custodianId:'b',sourceId:'s',revision:'v',field:'f',value:'x',evidenceId:'e'}];
  const rules=[{ruleId:'r',revision:'v',allowedFields:['f']}];
  expect(jointCertification(c,e,'r','v',rules).status).toBe('HOLD');
 });
});
