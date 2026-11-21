'use strict';
// Local topic matching only. This does not generate replies or unlock unavailable actions.
const questionThemes=[
 ['light',/свет|отключ|электр|питан|обесточ/],
 ['battery',/аккумуля|батаре|наклей|блок/],
 ['card',/карт[ауыое]|пропуск|18[:.]42|доступ/],
 ['camera',/камер|запис|видео|18[:.]5[48]/],
 ['crate',/ящик|тележ|перев[ео]з|перен[ео]с|ун[её]с/],
 ['mechanism',/механизм|барабан|подмен|замен|детал|оригинал|паз/],
 ['factory',/заводск|контрольн.*лист/],
 ['document',/акт|заключен|документ|бумаг/],
 ['workshop',/мастерск|помещен|осмотр/],
 ['tools',/инструмент/],
 ['cat',/кот|мурмур|экспонат/],
 ['where',/где|куда/],
 ['when',/когда|во сколько|врем|18[:.]|минут/],
 ['why',/зачем|почему|мотив|для чего/],
 ['found',/наш[её]л|найден|нашли|обнаруж/],
 ['post',/пост|покид|выход|выходил|уходил|отлуч/],
 ['historian',/вер[ауыое]|историк/]
];
let lunaRequested=false;
let lunaStatusPromise;
function getLunaStatus(){
 if(typeof location==='undefined'||location.protocol==='file:')return Promise.resolve({enabled:false});
 return lunaStatusPromise??=fetch('/api/status',{cache:'no-store'}).then(r=>r.ok?r.json():{enabled:false}).catch(()=>({enabled:false}));
}
const lunaConversations={restorer:{turns:[],phase:null},director:{turns:[],phase:null},guard:{turns:[],phase:null},historian:{turns:[],phase:null}};
function lunaPolicy(person){return {restorer:restorerPolicy,director:directorPolicy,guard:guardPolicy,historian:historianPolicy}[person];}
function lunaGameState(person='restorer'){
 if(person==='guard')return {phase,catKnown:notebook.statements.has('guard:evidence:cat-found'),exitVideo:hasEvidence('E11'),exitAdmitted:notebook.statements.has('guard:evidence:exit'),shieldRead:hasEvidence('E12'),batteryRead:hasEvidence('E13'),noticeRead:hasEvidence('E14'),batteryCompared:returnChecked(),outageAdmitted:notebook.statements.has(guardConfessionKey)};
 if(person==='historian')return {phase,catKnown:notebook.statements.has('historian:evidence:cat-found'),factoryRead:hasEvidence('E05'),mechanismRead:hasEvidence('E06'),compared:substitutionChecked(),suspicionRevealed:notebook.statements.has('historian:evidence:suspicion')};
 if(person==='director')return {phase,catKnown:notebook.statements.has('director:evidence:cat-found'),earlyChecked:earlyRemovalChecked(),earlyAdmitted:notebook.statements.has('director:evidence:early-removal'),actRead:hasEvidence('E07'),warningRead:hasEvidence('E08'),documentsCompared:directorWarned(),mechanismCompared:substitutionChecked(),awarenessAdmitted:notebook.statements.has('director:evidence:awareness'),accessRead:hasEvidence('E09')};
 return {phase,catFound,factoryRead:hasEvidence('E05'),mechanismRead:hasEvidence('E06'),compared:substitutionChecked(),motiveRevealed:notebook.statements.has('restorer:evidence:comparison'),warningRead:hasEvidence('E08')};
}
function resetLunaHistory(){for(const chat of Object.values(lunaConversations)){chat.turns=[];chat.phase=null;}}
function commitLunaFacts(ids,state,person='restorer'){
 const allowed=new Map(lunaPolicy(person).factsFor(state).map(f=>[f.id,f]));
 if(!Array.isArray(ids)||!ids.every(id=>allowed.has(id)))throw new Error('invalid_response');
 for(const id of new Set(ids)){const fact=allowed.get(id);remember('statements',fact.key,{title:fact.title,source:people[person].name+' · разговор · '+phaseName(),text:fact.text});}
}
async function askLunaReply(question,state,person='restorer'){
 const chat=lunaConversations[person];if(chat.phase!==state.phase){chat.turns=[];chat.phase=state.phase;}
 const response=await fetch('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json','X-DES-Request':'1'},body:JSON.stringify({person,question,state,history:chat.turns.slice(-12)}),signal:AbortSignal.timeout(25000)});
 const result=await response.json();if(!response.ok)throw new Error(result.error??'connection');
 const allowed=lunaPolicy(person).factsFor(state).map(f=>f.id);
 if(typeof result.reply!=='string'||!result.reply.trim()||result.reply.length>1800||!Array.isArray(result.facts)||!result.facts.every(id=>allowed.includes(id)))throw new Error('invalid_response');
 return result;
}

function normalizeQuestion(text){return text.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^а-яa-z0-9:.\s]/g,' ').replace(/\s+/g,' ').trim();}
function matchQuestion(text,offers){
 const query=normalizeQuestion(text);
 if(!query||query.length>600)return [];
 const exact=offers.find(o=>normalizeQuestion(o.label)===query);
 if(exact)return [{...exact,score:100}];
 const tags=questionThemes.filter(([,regex])=>regex.test(query)).map(([tag])=>tag);
 const stop=new Set(['почему','зачем','когда','расскажите','скажите','пожалуйста','можно','показать','предъявить','меня','тебя','этот','было','были','есть','такое','который']);
 const words=query.split(' ').filter(w=>w.length>=4&&!stop.has(w)).map(w=>w.slice(0,5));
 const matches=offers.map(offer=>{
  const label=normalizeQuestion(offer.label),labelTags=questionThemes.filter(([,regex])=>regex.test(label)).map(([tag])=>tag);
  const shared=tags.filter(tag=>labelTags.includes(tag));
  const specific=shared.filter(tag=>!['why','when','where','cat'].includes(tag));
  const lexical=words.filter(w=>label.includes(w)).length;
  const score=specific.length*3+shared.length+lexical*2;
  return {...offer,score};
 }).filter(o=>o.score>=4).sort((a,b)=>b.score-a.score);
 if(!matches.length)return [];
 return matches.filter(o=>o.score>=matches[0].score-2).slice(0,3);
}
function renderQuestionInput(person,offers){
 const supported=Object.hasOwn(lunaConversations,person);const name={restorer:'Белов',director:'Ланской',guard:'Павел',historian:'Вера'}[person];const instrumental={restorer:'Беловым',director:'Ланским',guard:'Павлом',historian:'Верой'}[person];
 const box=$('question-box');box.replaceChildren();box.hidden=false;
 const label=document.createElement('label');label.htmlFor='free-question';label.textContent='Спросить своими словами';
 const form=document.createElement('form');form.className='question-form';
 const input=document.createElement('input');input.id='free-question';input.type='text';input.maxLength=600;input.autocomplete='off';input.placeholder='Например: почему погас свет?';
 const send=document.createElement('button');send.type='submit';send.textContent='Спросить';form.append(input,send);
 const hint=document.createElement('p');hint.className='notebook-hint';hint.textContent=supported?'В режиме Luna '+name+' отвечает на твой вопрос напрямую. Кнопки тем и предъявления улик тоже доступны.':'Доступные темы можно спросить своей фразой. Если вопрос неоднозначен, уточни тему ниже.';
 const feedback=document.createElement('p');feedback.id='question-feedback';feedback.className='notebook-hint';feedback.setAttribute('role','status');
 const suggestions=document.createElement('div');suggestions.className='question-suggestions';
 const mode=document.createElement('label');mode.className='source-filter';
 const useLuna=document.createElement('input');useLuna.type='checkbox';useLuna.disabled=true;
 const modeText=document.createElement('span');modeText.textContent=supported?'Luna: проверяю подключение…':'Авторские темы · Luna пока подключена к Белову и Ланскому';mode.append(useLuna,modeText);
 if(supported)getLunaStatus().then(status=>{if(!mode.isConnected)return;const available=status.enabled&&(status.characters??['restorer']).includes(person);useLuna.disabled=!available;useLuna.checked=available&&lunaRequested;modeText.textContent=available?'GPT-6 Luna · свободный разговор с '+instrumental:'Локальные темы · для Luna запусти игру через start-game.ps1';});
 useLuna.addEventListener('change',()=>{lunaRequested=useLuna.checked;});
 form.addEventListener('submit',async event=>{
  event.preventDefault();suggestions.replaceChildren();
  const text=input.value.trim();if(!text){feedback.textContent='Напиши вопрос.';input.focus();return;}
  if(text.length>600){feedback.textContent='Сократи вопрос до 600 символов.';return;}
  let matches;
  const remote=supported&&useLuna.checked&&!useLuna.disabled;
  if(remote){
   const snapshot=lunaGameState(person),fingerprint=JSON.stringify(snapshot);
   send.disabled=true;input.disabled=true;feedback.textContent=name+' обдумывает ответ…';
   try{
    const result=await askLunaReply(text,snapshot,person);
    if(!form.isConnected||JSON.stringify(lunaGameState(person))!==fingerprint)return;
    commitLunaFacts(result.facts,snapshot,person);
    const chat=lunaConversations[person];chat.turns.push({role:'user',text},{role:'assistant',text:result.reply});chat.turns=chat.turns.slice(-12);
    // Rebuild author actions after canonical facts change; display model prose only as a reply.
    talk(person);$('panel-body').textContent=result.reply;
    const currentFeedback=$('question-feedback');if(currentFeedback)currentFeedback.textContent='Ответ: '+name+' · GPT-6 Luna';
   }catch(error){
    if(form.isConnected)feedback.textContent=error.message==='api_auth'?'OpenAI не принял ключ. Проверь отдельный ключ игры в окне запуска.':error.message==='api_limit'?'OpenAI сообщил об ограничении запросов или баланса. Можно снять галочку Luna и продолжить локально.':'Не удалось получить ответ Luna. Попробуй ещё раз или используй авторские темы.';
   }finally{send.disabled=false;input.disabled=false;}
   return;
  }else matches=matchQuestion(text,offers);
  if(!matches.length){feedback.textContent='Не удалось уверенно определить тему. Уточни вопрос или выбери одну из доступных тем разговора.';return;}
  // Evidence presentation always remains an explicit choice, including for a claimed discovery.
  const direct=!remote&&matches.length===1&&!/^(предъявить|показать|сообщить)/i.test(matches[0].label);
  if(direct){feedback.textContent='Тема: '+matches[0].label;matches[0].callback();return;}
  feedback.textContent='Что именно ты хочешь обсудить?';
  for(const match of matches){const button=document.createElement('button');button.type='button';button.textContent=match.label;button.addEventListener('click',()=>{suggestions.replaceChildren();feedback.textContent='Тема: '+match.label;match.callback();});suggestions.append(button);}
 });
 box.append(label,form,hint,feedback,suggestions,mode);
 const turns=lunaConversations[person]?.turns??[];
 if(supported&&turns.length){
  const history=document.createElement('details'),title=document.createElement('summary');history.className='dialogue-history';title.textContent='История разговора · последние '+turns.length+' реплик';history.append(title);
  for(const turn of turns){const p=document.createElement('p');p.textContent=(turn.role==='user'?'Ты: ':name+': ')+turn.text;history.append(p);}box.append(history);
 }
}
