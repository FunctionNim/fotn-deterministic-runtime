import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const ROOT=process.cwd();
const mod=async p=>import(pathToFileURL(path.join(ROOT,'dist/src',p)).href);
const {createFirstContinuationState}=await mod('prototype/first-continuation-loop.js');
const {ContinuityEventOrchestrator}=await mod('runtime/continuity-event-orchestrator.js');
const {FunctionBoxRuntime}=await mod('function-box/function-box-runtime.js');
const {EncounterRuntime,stabilizeEncounter}=await mod('encounter/encounter-runtime.js');
const {DistrictRuntime}=await mod('district/district-runtime.js');
const {ContinuityHeartbeat,EncounterPhase}=await mod('runtime/index.js');
const raw=fs.readFileSync('experiments/prototype-016/journal.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const EXPECT_JOURNAL='6d3966b0f999686e9552aecf70647cee6a29a9c00c10a4650606694226c7cf9e';
const EXPECT_FINAL='206d9c3637bbf0916cf98ba10f0d8a978d2636102f952d00d27365f2f5a929f4';
if(sha(raw)!==EXPECT_JOURNAL)throw Error('Journal bytes mismatch');
const j=JSON.parse(raw.toString('utf8'));if(j.journal?.length!==10)throw Error('Expected ten transitions');
const digest=x=>sha(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let state=createFirstContinuationState(),previous='GENESIS:P013';
const results=[];
for(const e of j.journal){
 const {hash,prev,...payload}=e;
 const chain=prev===previous&&hash===digest({payload,prev})&&e.seq===results.length+1;
 const before=digest(state)===e.beforeDigest;
 let ids=true,memories=true;
 switch(e.kind){
 case 'EVENT_BATCH':{
  const r=new ContinuityEventOrchestrator().execute(state,structuredClone(e.args.events));
  ids=same(r.executedEventIds,e.args.ids);memories=same(r.persistedMemories,e.args.memories);break;
 }
 case 'FUNCTION_BOX':{
  const s=state.seekers.seeker_alpha;
  const r=new FunctionBoxRuntime().activateSlot({slots:s.functionBox,relationships:s.functionRelationships,activatedSlotIndex:e.args.slot});
  s.functionBox=r.affectedSlots;s.resonance.activeModifiers.push(...r.resonanceModifiers);break;
 }
 case 'ENCOUNTER_ESCALATE':{
  const r=new EncounterRuntime().update({encounter:state.encounters.pressure_alpha,districtId:'starter',generatedAtTick:e.args.tick});
  state.encounters.pressure_alpha=r.encounter;break;
 }
 case 'ENCOUNTER_STABILIZE':{
  const r=stabilizeEncounter(state.encounters.pressure_alpha,e.args.amount);
  state.encounters.pressure_alpha={...r,phase:EncounterPhase.Resolved,resolved:true};break;
 }
 case 'TEA_RITUAL':state.seekers.seeker_alpha.restoration.inTeaRitual=e.args.enabled;break;
 case 'HEARTBEAT':new ContinuityHeartbeat().tick(state);break;
 case 'DISTRICT_UPDATE':{
  const r=new DistrictRuntime().update({district:state.districts.starter,generatedAtTick:state.tick});
  state.districts.starter=r.district;break;
 }
 default:throw Error('Unexpected operation '+e.kind);
 }
 const after=digest(state)===e.afterDigest;
 const ok=chain&&before&&after&&ids&&memories;
 results.push({step:e.seq,kind:e.kind,pass:ok});
 console.log('P016 transition '+e.seq+' '+e.kind+' '+(ok?'PASS':'FAIL'));
 if(!ok)throw Error('Transition '+e.seq+' mismatch');
 previous=hash;
}
if(previous!==j.anchor)throw Error('Anchor mismatch');
if(digest(state)!==EXPECT_FINAL||j.instrumentedFinalDigest!==EXPECT_FINAL)throw Error('Final digest mismatch');
console.log('P016 final state SHA-256: '+digest(state));
console.log('P016 ALL TEN TRANSITIONS PASS');
