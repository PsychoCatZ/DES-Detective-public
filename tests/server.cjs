const {test}=require('node:test');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {createGameServer}=require('../server.cjs');
async function start(options){const server=createGameServer(options);server.listen(0,'127.0.0.1');await once(server,'listening');return {server,url:`http://127.0.0.1:${server.address().port}`};}
test('static allowlist, missing key, origin checks',async()=>{
 const {server,url}=await start({apiKey:''});
 try{
  assert.equal((await fetch(url)).status,200);
  for(const file of ['server.cjs','start-game.ps1','.env','tests/server.cjs','docs/quality-pass.md'])assert.equal((await fetch(url+'/'+file)).status,404,file);
  assert.equal((await fetch(url+'/api/status')).status,200);
  assert.equal((await (await fetch(url+'/api/status')).json()).enabled,false);
  assert.equal((await fetch(url+'/api/dialogue',{method:'POST',body:'{}'})).status,403);
  assert.equal((await fetch(url+'/api/dialogue',{method:'POST',headers:{Origin:url,'X-DES-Request':'1'},body:'{}'})).status,503);
 }finally{await new Promise(r=>server.close(r));}
});
test('Luna generates a direct reply from stage-scoped context',async()=>{
 let calls=0;
 const {server,url}=await start({apiKey:'test-placeholder-not-a-real-key',fetchImpl:async(endpoint,request)=>{
  calls++;assert.equal(endpoint,'https://api.openai.com/v1/responses');const body=JSON.parse(request.body);assert.equal(body.model,'gpt-6-luna');assert.equal(body.store,false);assert.equal(body.text.format.strict,true);
  assert.ok(!body.input.includes('самовольно'));
  assert.ok(!body.instructions.includes('сохранить доказательство')); // No hidden motive in the before-incident context.
  assert.ok(!body.input.includes('topics'));
  assert.ok(body.instructions.includes('Различай'));
  return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'{"reply":"В ящике сейчас нет экспоната. Мурмур в витрине.","used_facts":[]}'}]}]})};
 }});
 try{
  const headers={Origin:url,'X-DES-Request':'1','Content-Type':'application/json'};
  const payload={person:'restorer',question:'Что в ящике?',state:{phase:'before',catFound:false,factoryRead:false,mechanismRead:false,compared:false,motiveRevealed:false,warningRead:false},history:[]};
  assert.equal((await fetch(url+'/api/dialogue',{method:'POST',headers:{...headers,Origin:'https://example.com'},body:JSON.stringify(payload)})).status,403);assert.equal(calls,0);
  assert.equal((await fetch(url+'/api/dialogue',{method:'POST',headers,body:JSON.stringify({...payload,person:'guard'})})).status,400);assert.equal(calls,0);
  const result=await (await fetch(url+'/api/dialogue',{method:'POST',headers,body:JSON.stringify(payload)})).json();assert.deepEqual(result,{reply:'В ящике сейчас нет экспоната. Мурмур в витрине.',facts:[],model:'gpt-6-luna'});assert.equal(calls,1);
  assert.equal((await fetch(url+'/api/dialogue',{method:'POST',headers,body:JSON.stringify(payload)})).status,429);
 }finally{await new Promise(r=>server.close(r));}
});
test('invalid upstream output rejected',async()=>{
 const {server,url}=await start({apiKey:'test',fetchImpl:async()=>({ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'{"reply":"Я спрятал кота","used_facts":["motive"]}'}]}]})})});
 try{const response=await fetch(url+'/api/dialogue',{method:'POST',headers:{Origin:url,'X-DES-Request':'1'},body:JSON.stringify({person:'restorer',question:'Привет',state:{phase:'before',catFound:false,factoryRead:false,mechanismRead:false,compared:false,motiveRevealed:false,warningRead:false},history:[]})});assert.equal(response.status,502);}finally{await new Promise(r=>server.close(r));}
});
test('restorer knowledge and canonical facts follow disclosure gates',()=>{
 const policy=require('../restorer-policy.js');
 const initial={phase:'before',catFound:false,factoryRead:false,mechanismRead:false,compared:false,motiveRevealed:false,warningRead:false};
 assert.deepEqual(policy.factsFor(initial),[]);
 const investigation={...initial,phase:'investigation'};
 assert.deepEqual(policy.factsFor(investigation),[]);
 const found={...investigation,catFound:true};
 assert.deepEqual(policy.factsFor(found).map(f=>f.id),['moved','time']);
 assert.ok(!JSON.stringify(policy.contextFor(found).allowedFacts).includes('мотив'));
 const checked={...found,factoryRead:true,mechanismRead:true,compared:true};
 assert.ok(policy.factsFor(checked).some(f=>f.id==='motive'));
 assert.equal(policy.validState({...initial,compared:true}),false);
});
test('director disclosure branches remain independent',()=>{
 const policy=require('../director-policy.js');
 const state={phase:'investigation',catKnown:false,earlyChecked:false,earlyAdmitted:false,actRead:false,warningRead:false,documentsCompared:false,mechanismCompared:false,awarenessAdmitted:false,accessRead:false};
 assert.deepEqual(policy.factsFor({...state,phase:'before'}),[]);
 assert.deepEqual(policy.factsFor(state).map(f=>f.id),['initial']);
 assert.ok(!JSON.stringify(policy.contextFor(state).allowedFacts).includes('финансирование'));
 const early={...state,earlyChecked:true};
 assert.deepEqual(policy.factsFor(early).map(f=>f.id),['early']);
 assert.ok(!policy.factsFor({...state,actRead:true,warningRead:true,documentsCompared:true}).some(f=>f.id==='awareness'));
 const checked={...state,actRead:true,warningRead:true,documentsCompared:true,mechanismCompared:true};
 assert.ok(policy.factsFor(checked).some(f=>f.id==='awareness'));
 assert.ok(!policy.factsFor(checked).some(f=>f.id==='early'));
 assert.equal(policy.validState({...state,awarenessAdmitted:true}),false);
});
test('guard exits, battery and outage are distinct disclosure stages',()=>{
 const p=require('../guard-policy.js');const state={phase:'investigation',catKnown:false,exitVideo:false,exitAdmitted:false,shieldRead:false,batteryRead:false,noticeRead:false,batteryCompared:false,outageAdmitted:false};
 assert.deepEqual(p.factsFor({...state,phase:'before'}),[]);
 assert.deepEqual(p.factsFor(state).map(f=>f.id),['post']);
 assert.deepEqual(p.factsFor({...state,exitVideo:true}).map(f=>f.id),['exit']);
 assert.ok(!JSON.stringify(p.contextFor(state).allowedFacts).includes('домой'));
 const battery={...state,batteryRead:true,noticeRead:true,batteryCompared:true};
 assert.ok(!p.factsFor(battery).some(f=>f.id==='outage'));
 assert.ok(!p.factsFor({...battery,exitVideo:true}).some(f=>f.id==='outage'));
 assert.ok(p.factsFor({...battery,exitVideo:true,shieldRead:true}).some(f=>f.id==='outage'));
 assert.equal(p.validState({...state,outageAdmitted:true}),false);
});
test('historian interprets observed technical facts without other characters secrets',()=>{
 const p=require('../historian-policy.js');const state={phase:'investigation',catKnown:false,factoryRead:false,mechanismRead:false,compared:false,suspicionRevealed:false};
 assert.deepEqual(p.factsFor({...state,phase:'before'}),[]);
 assert.deepEqual(p.factsFor(state).map(f=>f.id),['suspicion','invitation']);
 assert.ok(!p.factsFor({...state,factoryRead:true}).some(f=>f.id==='comparison'));
 assert.ok(p.factsFor({...state,factoryRead:true,mechanismRead:true,compared:true}).some(f=>f.id==='comparison'));
 assert.ok(!JSON.stringify(p.contextFor(state)).includes('самовольно забрал'));
 assert.equal(p.validState({...state,compared:true}),false);
});
