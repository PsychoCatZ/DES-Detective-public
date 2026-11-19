'use strict';
// Each conclusion is checked against the sources explicitly selected by the player.
const reportQuestions=[
 {id:'who',title:'Кто перенёс кота?',options:[['restorer','Михаил Белов'],['director','Виктор Ланской'],['guard','Павел Серов'],['historian','Вера Орлова']],correct:'restorer',groups:[['o:evidence:E03'],['o:evidence:E04'],['s:restorer:greeting:found','s:restorer:evidence:moved','s:restorer:evidence:trolley','s:restorer:evidence:comparison']],extra:['s:director:evidence:early-removal','o:workshop:Мурмур-1 в ящике:after'],hint:'Нужны след перемещения, находка кота и относящееся к переносу показание.'},
 {id:'when',title:'Когда кота сняли с витрины?',options:[['before','До отключения'],['during','Во время темноты'],['after','После возвращения света']],correct:'before',groups:[['o:evidence:E02','o:comparison:E02:blackout']],extra:['o:evidence:E03','o:event:empty-case','s:director:evidence:early-removal','s:restorer:Когда вы его перенесли?:found'],hint:'Нужен независимый источник о состоянии витрины до 19:00. Одних слов участника недостаточно.'},
 {id:'how',title:'Как переместили кота?',options:[['trolley','В транспортировочном ящике на тележке'],['hands','Пронесли в руках'],['self','Кот ушёл сам']],correct:'trolley',groups:[['o:evidence:E03'],['o:evidence:E04'],['s:restorer:evidence:trolley','s:restorer:greeting:found','s:restorer:evidence:comparison']],extra:[],hint:'Камера показывает закрытый ящик. Связь его содержимого с котом нужно подтвердить находкой и показанием.'},
 {id:'motive',title:'Зачем Белов спрятал кота?',options:[['stop','Остановить передачу и сохранить доказательство подмены'],['sell','Продать экспонат'],['cover','Помочь скрыть нарушение охранника']],correct:'stop',groups:[['o:comparison:E05:E06','o:evidence:E05'],['o:comparison:E05:E06','o:evidence:E06'],['s:restorer:evidence:comparison']],extra:['s:historian:evidence:comparison','s:historian:Реставратор обращался к тебе перед отключением?:after','o:evidence:E08','s:restorer:evidence:E05'],hint:'Объяснение мотива нужно связать с проверенным несоответствием механизма.'},
 {id:'outage',title:'Кто и зачем отключил питание?',options:[['battery','Павел: вернуть самовольно взятый аккумулятор перед проверкой'],['theft','Белов: скрыть перенос кота'],['fault','Самопроизвольная неисправность']],correct:'battery',groups:[['o:evidence:E11'],['o:evidence:E12'],['o:evidence:E13','o:comparison:E13:E14'],['o:evidence:E14','o:comparison:E13:E14'],['s:guard:evidence:outage','s:guard:Зачем понадобилось отключать свет?:outage']],extra:['s:guard:evidence:exit','s:guard:evidence:battery','o:evidence:G01','s:guard:greeting:outage','s:guard:Почему прошло семь минут?:outage'],hint:'Нужны запись выхода, осмотр оборудования, сведения о проверке и объяснение охранника. Слово «сбой» в его журнале не заменяет техническую проверку.'},
 {id:'director',title:'Что установлено о директоре?',options:[['warned','Подписал акт об оригинальности после предупреждения о замене'],['replaced','Лично заменил барабан'],['unaware','До происшествия не получал предупреждений']],correct:'warned',groups:[['o:evidence:E07','o:comparison:E07:E08'],['o:evidence:E08','o:comparison:E07:E08'],['o:evidence:E05','o:comparison:E05:E06'],['o:evidence:E06','o:comparison:E05:E06']],extra:['s:director:evidence:awareness','s:historian:evidence:comparison'],hint:'Нужны акт, предшествующее предупреждение и проверка установленной детали. Авторство замены из них не следует.'}
];
function reportSources(){
 const sources=new Map();
 for(const [prefix,collection] of [['o',notebook.observations],['s',notebook.statements]])for(const [key,entry]of collection)sources.set(prefix+':'+key,{...entry,kind:prefix==='o'?'Наблюдение / документ':'Показание'});
 return sources;
}
function evaluateReport(){
 const available=reportSources();
 return reportQuestions.map(q=>{
  const answer=reportDraft.answers[q.id]??'';
  const selected=[...new Set(reportDraft.supports[q.id]??[])].filter(key=>available.has(key));
  const allowed=new Set([...q.groups.flat(),...q.extra]);
  const missing=q.groups.some(group=>!group.some(key=>selected.includes(key)));
  const unrelated=selected.some(key=>!allowed.has(key));
  const status=!answer?'open':answer!==q.correct?'wrong':missing?'unproven':unrelated?'extra':'proven';
  return {q,status,selected,unrelated:selected.filter(key=>!allowed.has(key))};
 });
}
function showReport(){
 if(phase!=='investigation')return;
 openPanel('Заключение по делу','Твои выводы и их основания','Выбери ответ и отметь сведения, на которых он основан. Можно оставить вопрос открытым и вернуться к расследованию. Черновик сохраняется автоматически.');
 const sources=reportSources();
 for(const q of reportQuestions){
  const field=document.createElement('fieldset');field.className='report-question';
  const legend=document.createElement('legend');legend.textContent=q.title;field.append(legend);
  const select=document.createElement('select');select.setAttribute('aria-label',q.title);
  for(const [value,label]of [['','Пока не установлено'],...q.options]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
  select.value=reportDraft.answers[q.id]??'';
  select.addEventListener('change',()=>{reportDraft.answers[q.id]=select.value;saveGame();});field.append(select);
  const details=document.createElement('details'),summary=document.createElement('summary');
  const search=document.createElement('input');search.type='search';search.className='source-search';search.placeholder='Найти по предмету, имени или тексту…';search.setAttribute('aria-label','Поиск оснований: '+q.title);
  const filterLabel=document.createElement('label');filterLabel.className='source-filter';const selectedOnly=document.createElement('input');selectedOnly.type='checkbox';filterLabel.append(selectedOnly,document.createTextNode('Только выбранные'));
  const list=document.createElement('div'),rows=[];const empty=document.createElement('p');empty.className='notebook-hint';empty.textContent='Нет записей по этому фильтру.';
  const filter=()=>{const needle=search.value?.trim().toLocaleLowerCase('ru')??'';let visible=0;for(const row of rows){row.element.hidden=!(row.text.includes(needle)&&(!selectedOnly.checked||row.check.checked));if(!row.element.hidden)visible++;}empty.hidden=visible>0;};
  search.addEventListener('input',filter);selectedOnly.addEventListener('change',filter);
  const update=()=>{summary.textContent='Основания · выбрано '+(reportDraft.supports[q.id]?.filter(key=>sources.has(key)).length??0);};update();details.append(summary,search,filterLabel,list,empty);
  if(!sources.size){const p=document.createElement('p');p.textContent='Сначала осмотри предметы и поговори с участниками.';list.append(p);}
  for(const [key,entry]of sources){
   const row=document.createElement('div');row.className='report-source';
   const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=reportDraft.supports[q.id]?.includes(key)??false;
   const text=document.createElement('span');text.textContent=entry.title+' — '+entry.source+' ['+entry.kind+']';label.append(check,text);
   const preview=document.createElement('details'),heading=document.createElement('summary'),body=document.createElement('p');heading.textContent='Прочитать запись';body.textContent=entry.text;preview.append(heading,body);row.append(label,preview);
   rows.push({element:row,check,text:(entry.title+' '+entry.source+' '+entry.text).toLocaleLowerCase('ru')});
   check.addEventListener('change',()=>{const values=new Set(reportDraft.supports[q.id]??[]);if(check.checked)values.add(key);else values.delete(key);reportDraft.supports[q.id]=[...values];update();filter();saveGame();});list.append(row);
  }
  filter();field.append(details);$('panel-body').append(field);
 }
 addAction('Проверить заключение',showReportResult);
 addAction('Продолжить расследование',()=>$('panel').close());
}
function showReportResult(){
 if(phase!=='investigation')return;
 const results=evaluateReport(),proven=results.filter(r=>r.status==='proven').length;
 openPanel(proven===results.length?'Картина дела восстановлена':'Проверка заключения','Обосновано '+proven+' из '+results.length,'Результат можно пересмотреть: расследование остаётся доступным.');
 const names={open:'Вопрос открыт',wrong:'Версия ошибочна',unproven:'Верный вывод, но оснований недостаточно',extra:'Есть подтверждение, но выбраны лишние основания',proven:'Вывод подтверждён выбранными основаниями'};
 const sources=reportSources();
 for(const {q,status,selected,unrelated}of results){
  const card=document.createElement('article');card.className='notebook-entry';const h=document.createElement('h3');h.textContent=q.title;
  const answer=document.createElement('p');answer.textContent='Твой вывод: '+(q.options.find(([value])=>value===reportDraft.answers[q.id])?.[1]??'Пока не установлено');
  const p=document.createElement('p');p.textContent=names[status];card.append(h,answer,p);
  if(status!=='proven'){const hint=document.createElement('p');hint.className='notebook-hint';hint.textContent=q.hint;card.append(hint);}
  const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Выбранные основания · '+selected.length;detail.append(summary);
  for(const key of selected){const line=document.createElement('p');line.textContent=(unrelated.includes(key)?'Не подтверждает этот вывод: ':'')+sources.get(key).title;detail.append(line);}card.append(detail);$('panel-body').append(card);
 }
 if(proven===results.length){const p=document.createElement('p');p.textContent='Перенос кота, отключение питания и недостоверный акт — разные поступки. Кто и когда заменил оригинальный барабан и где он находится, этим расследованием не установлено.';$('panel-body').append(p);}
 addAction('Пересмотреть заключение',showReport);
 addAction('Вернуться в музей',()=>$('panel').close());
}
$('report').addEventListener('click',showReport);
