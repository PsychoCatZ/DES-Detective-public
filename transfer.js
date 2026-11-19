'use strict';
function validTransfer(data){
 const entries=rows=>Array.isArray(rows)&&rows.length<=200&&rows.every(row=>Array.isArray(row)&&row.length===2&&typeof row[0]==='string'&&row[0].length<=500&&row[1]&&['title','source','text'].every(k=>typeof row[1][k]==='string'&&row[1][k].length<=12000));
 return data&&data.version===1&&Object.hasOwn(rooms,data.room)&&typeof data.notes==='string'&&data.notes.length<=8000&&entries(data.observations)&&entries(data.statements)&&(data.phase===undefined||['before','blackout','investigation'].includes(data.phase))&&(data.catFound===undefined||typeof data.catFound==='boolean'&&(!data.catFound||data.phase==='investigation'));
}
function showSaveTransfer(){
 openPanel('Перенос сохранения','Только прогресс игры','Для перехода с файла на локальный сервер скопируй этот текст. В игре по новому адресу открой «Перенос сохранения», вставь текст и нажми кнопку импорта. Ключ API сюда вводить не нужно.');
 const field=document.createElement('textarea');field.id='save-transfer';field.rows=8;field.setAttribute('aria-label','Сохранение игры');field.value=JSON.stringify({version:1,phase,catFound,reportDraft,room:currentRoom,observations:[...notebook.observations],statements:[...notebook.statements],notes:notebook.notes});
 const message=document.createElement('p');message.setAttribute('role','status');message.className='notebook-hint';$('panel-body').append(field,message);
 addAction('Выделить текст для копирования',()=>{field.focus();field.select();});
 addAction('Заменить текущий прогресс импортом',()=>{
  try{if(field.value.length>1000000)throw Error();const data=JSON.parse(field.value);if(!validTransfer(data))throw Error();}catch{message.textContent='Это не поддерживаемое сохранение. Текущий прогресс не изменён.';return;}
  try{localStorage.setItem(SAVE_KEY,field.value);}catch{message.textContent='Браузер не разрешил записать сохранение. Текущий прогресс не изменён.';return;}
  location.reload();
 });
 addAction('Отмена',()=>$('panel').close());
}
$('transfer').addEventListener('click',showSaveTransfer);
