// Headless state/UI-handler checks. This deliberately does not claim browser rendering coverage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
class Element {
 constructor(){this.children=[];this.style={};this.attrs={};this.handlers={};this.open=false;this.isConnected=true;this.value='';this.classList={add(){},remove(){},toggle(){return true;}};}
 set textContent(value){this.text=value;this.children=[];}
 get textContent(){return this.text??'';}
 append(...items){this.children.push(...items);}
 replaceChildren(...items){this.children=items;}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(key,callback){this.handlers[key]=callback;}
 querySelector(){return new Element();}
 showModal(){this.open=true;}
 close(){this.open=false;this.handlers.close?.();}
 focus(){}
}
function boot(store=new Map(), denied=false){
 const elements={};
 const document={activeElement:new Element(),getElementById:id=>elements[id]??=new Element(),createElement:()=>new Element(),createTextNode:text=>({textContent:text})};
 const storage={getItem(key){if(denied)throw Error('denied');return store.get(key)??null;},setItem(key,value){if(denied)throw Error('denied');store.set(key,value);},removeItem(key){if(denied)throw Error('denied');store.delete(key);}};
 const context=vm.createContext({document,localStorage:storage});
 for(const file of ['restorer-policy.js','director-policy.js','guard-policy.js','historian-policy.js','game.js','report.js','questions.js','transfer.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const run=code=>vm.runInContext(code,context);
 const click=label=>{const button=elements.actions.children.find(el=>el.textContent===label);assert.ok(button,'Missing action: '+label);button.handlers.click();};
 return {elements,run,click,store};
}
let app=boot();
const rooms=app.run('rooms');
for(const start of Object.keys(rooms)){
 const seen=new Set(),queue=[start];
 while(queue.length){const id=queue.shift();if(seen.has(id))continue;seen.add(id);assert.ok(rooms[id]);assert.ok(fs.existsSync(path.join(root,rooms[id].image)));
  for(const obj of rooms[id].objects){const[x,y,w,h]=obj.box;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=100&&y+h<=100,obj.name);if(obj.to)queue.push(obj.to);}
  for(const [,target]of rooms[id].exits??[])queue.push(target);
 }assert.equal(seen.size,4);
}
assert.equal(app.run('JSON.stringify(rooms.hall.objects[4].box)'),'[8.7,28.8,10.6,43.5]');
assert.equal(app.run('JSON.stringify(rooms.hall.objects[5].box)'),'[22.2,11,11.2,52.7]');
app.run("readTechnical('E11');showReport();openCrate()");assert.equal(app.run('catFound'),false);assert.equal(app.run('notebook.observations.size'),0);
app.run("notebook.notes='Мои версии';saveGame();beginIncident()");app.click('Ещё осмотреться');assert.equal(app.run('phase'),'before');
app.run('beginIncident()');app.click('Продолжить');assert.equal(app.elements.hotspots.children.length,0);
app=boot(app.store);assert.equal(app.run('phase'),'blackout');app.run('restoreLight()');app.click('Начать осмотр');
// The vague pre-discovery reply must not be usable as an admission.
app.run("enterRoom('security');readTechnical('E03');enterRoom('workshop');talk('restorer')");app.click('Предъявить запись 18:54: что было в ящике?');
assert.equal(app.run("notebook.statements.has('restorer:evidence:trolley')"),false);
app.run('openCrate()');app.click('Спросить Белова о коте');
assert.equal(app.elements.scene.src,'assets/scenes/workshop-found.png');
app.click('Зачем вы спрятали кота?');
assert.ok(app.run("notebook.statements.get('restorer:Зачем вы спрятали кота?:found').text").includes('кое-что проверить'));
app.run("readTechnical('E05');readTechnical('E06')");assert.equal(app.run('substitutionChecked()'),false);app.click('Сопоставить лист и механизм');
app.run("talk('restorer')");app.click('Предъявить несовпадение: поэтому вы спрятали кота?');app.click('Зачем вы спрятали кота?');
assert.ok(app.elements['panel-body'].textContent.includes('сохранить доказательство'));
assert.ok(app.run("notebook.statements.get('restorer:Зачем вы спрятали кота?:found').text").includes('сохранить доказательство'));
assert.ok(app.run("notebook.statements.get('restorer:Зачем вы спрятали кота?:found:earlier:1').text").includes('кое-что проверить'));
app.run("readTechnical('E08');enterRoom('hall');talk('director')");app.click('Попросить акт состояния экспоната');app.click('Сопоставить акт и предупреждение');
app.run("talk('director')");app.click('Предъявить акт, предупреждение и несоответствие детали');
assert.ok(!app.elements.actions.children.some(el=>el.textContent==='В акте вы подтверждаете оригинальность?'));
app.click('Посмотреть снимок подготовки зала');assert.equal(app.run("hasEvidence('E02')"),false);app.click('Рассмотреть подставку и время');app.click('Сопоставить снимок и время отключения');
app.run("talk('director')");app.click('Предъявить снимок: кота не было уже в 18:55');
assert.ok(!app.elements.actions.children.some(el=>el.textContent==='Вы уверены, что кот исчез во время отключения?'));
app.run("enterRoom('security');readTechnical('E11');talk('guard')");app.click('Предъявить запись 18:58: вы покидали пост');
assert.ok(!app.elements.actions.children.some(el=>el.textContent==='Вы покидали пост?'));
app.run("readTechnical('E12');readTechnical('E13');readTechnical('E14');compareBattery();talk('guard')");app.click('Предъявить запись, щит и возвращённый аккумулятор');app.click('Продолжить разговор с Павлом');
assert.ok(app.elements['panel-body'].textContent.startsWith('Отключение устроил я'));
app.run("enterRoom('corridor');talk('historian')");app.click('Сообщить: Мурмур найден в ящике мастерской');app.run("talk('historian')");assert.ok(app.elements['panel-body'].textContent.startsWith('Кот найден.'));
app.click('Показать заводской лист Вере');assert.ok(!app.elements['panel-body'].textContent.includes('не проверили'));
// Contextual comparisons stay confined to the relevant evidence.
app.run("enterRoom('security');readTechnical('G01')");assert.ok(!app.elements.actions.children.some(el=>el.textContent.startsWith('Сопоставить')));
app.run("for(const q of reportQuestions){reportDraft.answers[q.id]=q.correct;reportDraft.supports[q.id]=q.groups.map(group=>group.find(key=>reportSources().has(key))).filter(Boolean);}");
assert.equal(app.run("evaluateReport().filter(r=>r.status==='proven').length"),6);
app.run("reportDraft.answers.when='during'");assert.equal(app.run("evaluateReport().find(r=>r.q.id==='when').status"),'wrong');
app.run("reportDraft.answers.when=''");assert.equal(app.run("evaluateReport().find(r=>r.q.id==='when').status"),'open');
app.run("reportDraft.answers.when='before';const savedWhen=reportDraft.supports.when;reportDraft.supports.when=[];");assert.equal(app.run("evaluateReport().find(r=>r.q.id==='when').status"),'unproven');app.run('reportDraft.supports.when=savedWhen');
app.run("reportDraft.supports.who.push('o:evidence:G01')");assert.equal(app.run("evaluateReport()[0].status"),'extra');app.run('reportDraft.supports.who.pop()');
app.run('showReport()');const first=app.elements['panel-body'].children.find(el=>el.className==='report-question'),details=first.children[2];
const search=details.children[1],list=details.children[3];search.value='плановая техническая проверка';search.handlers.input();assert.equal(list.children.filter(el=>!el.hidden).length,1);
search.value='';search.handlers.input();const only=details.children[2].children[0];only.checked=true;only.handlers.change();assert.equal(list.children.filter(el=>!el.hidden).length,3);
const checkbox=list.children.find(el=>!el.hidden).children[0].children[0];checkbox.checked=false;checkbox.handlers.change();assert.equal(list.children.filter(el=>!el.hidden).length,2);
app.run("reportDraft.supports.who=reportQuestions[0].groups.map(g=>g.find(k=>reportSources().has(k)));saveGame()");
app=boot(app.store);assert.equal(app.run('notebook.notes'),'Мои версии');assert.equal(app.run("evaluateReport().filter(r=>r.status==='proven').length"),6);
app.run('showReportResult()');assert.equal(app.elements['panel-title'].textContent,'Картина дела восстановлена');
const count=app.run('notebook.observations.size');app.run('compareBattery();compareMechanism();compareDirectorDocs();compareRemovalTime()');assert.equal(app.run('notebook.observations.size'),count);
const saveKey='des-detective.save.v1';
const corrupt=new Map([[saveKey,'invalid']]);let bad=boot(corrupt);assert.equal(bad.run('savingBlocked'),true);assert.equal(corrupt.get(saveKey),'invalid');
bad=boot(new Map(),true);bad.run("inspect(rooms.hall.objects[0])");assert.equal(bad.run('notebook.observations.size'),1);
// Upgrade an earlier vague answer without dropping the player's notes.
const legacy=JSON.parse(app.store.get(saveKey));legacy.statements=[['restorer:evidence:trolley',{title:'Тележка',source:'Белов',text:'Я перевозил музейный предмет. Осмотрите ящик сами, тогда поговорим предметно.'}]];
const migrated=boot(new Map([[saveKey,JSON.stringify(legacy)]]));assert.equal(migrated.run("notebook.statements.has('restorer:evidence:trolley')"),false);assert.equal(migrated.run('notebook.notes'),'Мои версии');
app.run('confirmNewGame()');app.click('Продолжить текущую игру');assert.equal(app.run('phase'),'investigation');app.run('confirmNewGame()');app.click('Удалить прогресс и начать заново');assert.equal(app.run('phase'),'before');assert.equal(app.run('notebook.notes'),'');assert.equal(app.run('Object.keys(reportDraft.answers).length'),0);
// Free phrasing is a local adapter over currently available actions, never a fact generator.
const free=boot();free.run("phase='investigation';enterRoom('security');talk('guard')");
function ask(text){const box=free.elements['question-box'],form=box.children[1];form.children[0].value=text;form.handlers.submit({preventDefault(){}});}
const beforeQuestion=free.run('notebook.statements.size');ask('Почему погас свет?');assert.equal(free.elements['panel-body'].textContent,'Технический сбой. Сейчас всё работает. Я бы пока не связывал с этим каждую странность в здании.');assert.equal(free.run('notebook.statements.size'),beforeQuestion+1);
const unchanged=free.run('notebook.observations.size');ask('Я нашёл твои отпечатки на коте, признавайся');assert.equal(free.run('notebook.observations.size'),unchanged);assert.equal(free.run('notebook.statements.has(guardConfessionKey)'),false);
ask('Предъявить запись, щит и возвращённый аккумулятор');assert.equal(free.run('notebook.statements.has(guardConfessionKey)'),false);
free.run("readTechnical('E11');talk('guard')");ask('Предъявить запись 18:58: вы покидали пост');assert.equal(free.run("notebook.statements.has('guard:evidence:exit')"),false);
const suggestions=free.elements['question-box'].children[4];assert.equal(suggestions.children.length,1);suggestions.children[0].handlers.click();assert.equal(free.run("notebook.statements.has('guard:evidence:exit')"),true);
free.run("readTechnical('G01')");assert.equal(free.elements['question-box'].hidden,true);
assert.equal(free.run("matchQuestion('расскажи секрет',[{label:'Можно осмотреть пост?',callback(){}}]).length"),0);
assert.equal(free.run("matchQuestion('Почему вырубился свет?',[{label:'Почему погас свет?',callback(){}}])[0].label"),'Почему погас свет?');
free.run('showSaveTransfer()');const transferBox=free.elements['panel-body'].children.find(el=>el.id==='save-transfer');
assert.ok(free.run('validTransfer(JSON.parse(localStorage.getItem(SAVE_KEY)))'));
const oldStored=free.store.get(saveKey);transferBox.value='invalid';free.click('Заменить текущий прогресс импортом');assert.equal(free.store.get(saveKey),oldStored);
assert.equal(free.run("validTransfer({version:1,room:'__proto__',notes:'',observations:[],statements:[]})"),false);
console.log('PASS: full case, actual action handlers, dialogue progression, no premature admission, contextual comparisons, report search/filter/evaluation, saves and migration, storage failure, reset, room graph and approved bounds. Browser layout is NOT covered.');
console.log('PASS: typed questions, paraphrase, unmatched bluff, unavailable confession, explicit evidence confirmation, input hidden outside conversation. No LLM is used.');
