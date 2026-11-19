const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function setup(reply){
 const elements={},requests=[];
 class E{
  constructor(){this.children=[];this.handlers={};this.style={};this.attrs={};this.isConnected=true;this.classList={add(){},remove(){},toggle(){}};}
  set id(value){this._id=value;elements[value]=this;}get id(){return this._id;}
  set textContent(value){this.text=value;this.replaceChildren();}get textContent(){return this.text??'';}
  append(...values){for(const value of values){value.isConnected=true;this.children.push(value);}}
  replaceChildren(...values){const detach=el=>{el.isConnected=false;for(const child of el.children??[])detach(child);};this.children.forEach(detach);this.children=[];this.append(...values);}
  setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.handlers[k]=v;}
  querySelector(){return new E();}showModal(){this.open=true;}close(){this.open=false;}focus(){}
 }
 const document={activeElement:new E(),getElementById:id=>elements[id]??=new E(),createElement:()=>new E(),createTextNode:text=>({textContent:text})};
 const localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 const fetch=async(url,options)=>{
  if(url==='/api/status')return {ok:true,json:async()=>({enabled:true,characters:['restorer','director']})};
  const body=JSON.parse(options.body);requests.push(body);return {ok:true,json:async()=>typeof reply==='function'?reply(body):reply};
 };
 const ctx=vm.createContext({document,localStorage,location:{protocol:'http:'},fetch,AbortSignal});
 for(const name of ['restorer-policy.js','director-policy.js','game.js','questions.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx);
 const run=code=>vm.runInContext(code,ctx);
 async function ask(text,person='restorer'){
  run(`talk('${person}')`);await new Promise(setImmediate);
  const box=elements['question-box'],mode=box.children[5].children[0],form=box.children[1];
  assert.equal(mode.disabled,false);mode.checked=true;mode.handlers.change();form.children[0].value=text;
  await form.handlers.submit({preventDefault(){}});
 }
 return {run,ask,elements,requests};
}
test('direct answer replaces the former topic suggestion and preserves follow-up context',async()=>{
 const t=setup({reply:'Сейчас ящик пуст. Кот стоит в витрине.',facts:[]});
 await t.ask('Что в ящике?');
 assert.equal(t.elements['panel-body'].textContent,'Сейчас ящик пуст. Кот стоит в витрине.');
 assert.equal(t.elements['question-box'].children[4].children.length,0);
 assert.equal(t.requests[0].question,'Что в ящике?');assert.equal(t.requests[0].state.phase,'before');
 assert.equal(t.run('notebook.observations.size'),0);
 await t.ask('А для чего он нужен?');assert.equal(t.requests[1].history.length,2);
});
test('only allowed canonical statements are committed, never model prose as an observation',async()=>{
 const t=setup({reply:'Да, я перенёс кота.',facts:['moved']});t.run("phase='investigation';catFound=true");
 await t.ask('Это вы унесли кота?');
 assert.ok(t.run("notebook.statements.has('restorer:evidence:moved')"));
 assert.equal(t.run('notebook.observations.size'),0);
 assert.equal(t.run("notebook.statements.get('restorer:evidence:moved').text"),'Да. Это я перенёс Мурмура в ящике на тележке в мастерскую.');
});
test('forbidden facts reject the whole response without creating evidence or a confession',async()=>{
 const t=setup({reply:'Я спрятал его из-за подмены.',facts:['motive']});
 await t.ask('Я нашёл отпечатки, признавайся');
 assert.equal(t.run("notebook.statements.has('restorer:evidence:comparison')"),false);
 assert.equal(t.run('notebook.observations.size'),0);
 assert.ok(t.elements['question-feedback'].textContent.includes('Не удалось'));
});
test('director has a direct reply and a separate conversation history',async()=>{
 const t=setup(body=>({reply:body.person==='director'?'Пожалуйста, задавайте вопросы по порядку.':'Я слушаю.',facts:[]}));
 await t.ask('Вера что-то подозревает?','restorer');
 await t.ask('Почему вы торопитесь?','director');
 assert.equal(t.elements['panel-body'].textContent,'Пожалуйста, задавайте вопросы по порядку.');
 assert.equal(t.requests[1].person,'director');assert.equal(t.requests[1].history.length,0);
 assert.equal(t.requests[1].state.phase,'before');
 await t.ask('А вы сами что думаете?','restorer');assert.equal(t.requests[2].history.length,2);assert.equal(t.requests[2].history[0].text,'Вера что-то подозревает?');
});
test('director awareness can only be committed after both independent checks',async()=>{
 const t=setup({reply:'Я подписал акт, хотя получил предупреждение.',facts:['awareness']});t.run("phase='investigation'");
 await t.ask('Вы знали о подмене?','director');assert.equal(t.run("notebook.statements.has('director:evidence:awareness')"),false);
 t.run("for(const id of ['E07','E08'])notebook.observations.set('evidence:'+id,technicalEvidence[id]);compareDirectorDocs();notebook.observations.set('comparison:E05:E06',{title:'Проверка',source:'Механизм',text:'Несоответствие'})");
 await t.ask('Вот документы, вы знали?','director');assert.equal(t.run("notebook.statements.has('director:evidence:awareness')"),true);
 assert.equal(t.elements['panel-body'].textContent,'Я подписал акт, хотя получил предупреждение.');
 assert.equal(t.run("notebook.statements.has('director:evidence:early-removal')"),false);
});
