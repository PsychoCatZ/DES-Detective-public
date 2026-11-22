'use strict';
// World state is authoritative; dialogue does not determine the time of disappearance.
const rooms = {
 hall: {name:'Выставочный зал',image:'assets/scenes/hall.png',alt:'Тёплый музейный зал. Механический кот в центральной витрине, директор справа, дверь мастерской в глубине.',objects:[
  {name:'Осмотреть витрину',box:[34,17,25,68],title:'Мурмур-1',text:'За стеклом сидит механический кот. Латунные уши чуть развёрнуты, под ажурными пластинами видны шестерни. На табличке — «Мурмур-1».\n\nКрепления удерживают основание на подставке. Для обслуживания их можно открыть штатным инструментом.'},
  {name:'Поговорить с директором',box:[65,14,18,82],person:'director'},
  {name:'В мастерскую →',box:[84,9,16,55],to:'workshop'},
  {name:'Осмотреть лампу и книги',box:[0,33,11,67],title:'Уголок у окна',text:'Под тёплым светом настольной лампы лежат старые книги в потёртых переплётах. У деревянной тумбы потемнели ручки, а на столешнице заметны следы долгой службы.\n\nЭтот уголок делает музей похожим на чей-то обжитой кабинет: здесь хочется задержаться и полистать книгу.'},
  {name:'Рассмотреть модель небесной сферы',box:[8.7,28.8,10.6,43.5],title:'Модель небесной сферы',text:'Латунные кольца окружают маленький шар в центре. Они изображают устройство небесной сферы — это наглядная астрономическая модель.\n\nНа металле мягко отражается свет соседней лампы. Такой предмет хочется рассматривать со всех сторон.'},
  {name:'Осмотреть шкаф с приборами и телескоп',box:[22.2,11,11.2,52.7],title:'Приборы под стеклом',text:'На стеклянных полках стоят старые научные приборы: металлические диски, катушки и механизмы под прозрачными колпаками. Над шкафом установлен небольшой латунный телескоп.\n\nВ этой части коллекции собраны инструменты, с помощью которых люди пытались увидеть и измерить то, что недоступно невооружённому глазу.'}
 ]},
 workshop:{name:'Мастерская',image:'assets/scenes/workshop.png',alt:'Мастерская музея: закрытый ящик на тележке слева, папка на освещённом верстаке, реставратор справа.',objects:[
  {name:'← В выставочный зал',box:[0,16,10,60],to:'hall'},
  {name:'Осмотреть транспортировочный ящик',box:[10,47,32,40],title:'Транспортировочный ящик',text:'Крепкий музейный ящик на тележке. Латунные защёлки, ручки по бокам и бумажная бирка. В нём удобно перевозить хрупкий механизм между помещениями.\n\nЯщик приготовлен для работы с экспонатами. Крышка закрыта, защёлки опущены.'},
  {name:'Осмотреть папку',box:[58,59,17,11],title:'Рабочая папка',text:'На верстаке лежит перевязанная папка. Рядом — лупа и инструменты для тонкой работы.\n\nПапка перевязана бечёвкой: рабочие бумаги реставратора пока собраны вместе.'},
  {name:'Поговорить с реставратором',box:[69,11,21,50],person:'restorer'},
  {name:'Осмотреть инструменты',box:[44,22,25,26],title:'Инструменты реставратора',text:'Отвёртки, пинцеты, измерительные инструменты. Всё разложено по своим местам. Маленькие детали требуют аккуратности — одной грубой попыткой можно испортить работу старого механизма.'}
 ]},
 security:{name:'Пост охраны',image:'assets/scenes/security-office.png',alt:'Пост охраны. Слева открыта дверь в коридор, на столе журнал и монитор, Павел стоит справа.',objects:[
  {name:'← В служебный коридор',box:[0,7,16,75],to:'corridor'},
  {name:'Поговорить с Павлом',box:[74,12,17,76],person:'guard'},
  {name:'Осмотреть журнал',box:[34,57,20,10],title:'Журнал поста охраны',text:'На столе открыт журнал с разлинованными страницами. Рядом лежит ручка. Здесь дежурный записывает служебные события.\n\nПавел ведёт журнал от руки и держит его рядом с монитором.'},
  {name:'Осмотреть монитор камер',box:[52,33,13,23],title:'Монитор наблюдения',text:'Экран разделён на несколько видов с музейных камер. Сейчас на нём видны коридоры и двери.\n\nНа экране текущие изображения с камер. Коридоры пока пусты.'},
  {name:'Осмотреть ключи',box:[39,23,16,18],title:'Ключи на стенде',text:'На деревянном стенде висят ключи с небольшими бирками. Некоторые крючки свободны. По одному виду стенда нельзя определить, кто и когда пользовался ключами.'},
  {name:'Осмотреть электрощит',box:[65,12,10,25],title:'Закрытый электрощит',text:'Серый металлический шкаф с закрытой дверцей. К нему подходят кабели. Снаружи не видно положения выключателей — для технического осмотра понадобится открыть шкаф.'},
  {name:'Осмотреть резервное питание',box:[69,56,7,18],title:'Источник бесперебойного питания',text:'Рядом со столом стоит блок резервного питания. На корпусе горят индикаторы. Внутренние детали снаружи не видны.'},
  {name:'Осмотреть рацию',box:[47,44,4,13],title:'Служебная рация',text:'Небольшая рация стоит рядом с монитором. Регулятор громкости повёрнут к середине шкалы. Сейчас из динамика ничего не слышно.'}
 ]},
 corridor:{name:'Служебный коридор',image:'assets/scenes/service-corridor.png',alt:'Служебный коридор с двумя дверями и поворотом в глубине. Вера стоит справа, слева видны считыватель, чертежи и столик.',objects:[
  {name:'← В мастерскую',box:[7,3,18,91],to:'workshop'},
  {name:'На пост охраны →',box:[84,5,11,81],to:'security'},
  {name:'В выставочный зал',box:[53,43,13,16],to:'hall'},
  {name:'Поговорить с Верой',box:[68,12,15,86],person:'historian'},
  {name:'Осмотреть считыватель',box:[25.5,38,2.7,7],title:'Карточный считыватель',text:'Возле двери мастерской установлен считыватель пропусков. На корпусе светится узкий индикатор.\n\nСам считыватель не показывает, кто проходил через дверь. Для этого нужен журнал доступа.'},
  {name:'Рассмотреть технические чертежи',box:[30,14,16,27],title:'Чертежи в коридоре',text:'На стене висят схемы старых механизмов в деревянных рамках. Крупные колёса, тяги и оси напоминают, что музейная техника когда-то была рабочим оборудованием.'},
  {name:'Осмотреть столик с книгами',box:[32,40,13,36],title:'Столик в коридоре',text:'На узком столике лежат книги, рядом стоит кувшин с цветами. Проход оставлен свободным — здесь можно провезти музейную тележку.'},
  {name:'Осмотреть вешалку',box:[47,21,6,41],title:'Вешалка',text:'На деревянной вешалке оставлено пальто. Ни имени владельца, ни других заметных обозначений снаружи не видно.'}
 ]}
};
// These exits are outside the fixed camera view; existing scene hotspots stay unchanged.
rooms.hall.exits=[['В служебный коридор','corridor']];
rooms.workshop.exits=[['В служебный коридор','corridor']];
const people={
 director:{name:'Виктор Ланской',role:'Директор музея',greeting:'Мурмур-1 — гордость нашей коллекции. Перед передачей реставратор должен закончить последнюю проверку.',topics:[['Расскажите о коте.','Один из самых необычных предметов нашей коллекции. Механический кот, отвечающий на человеческую речь. Сегодня он — главный участник показа.'],['Можно осмотреть мастерскую?','Разумеется. Дверь справа. Только прошу обращаться с оборудованием осторожно: Михаил очень дорожит своими инструментами.'],['Кто занимается механизмом?','Михаил Белов, наш реставратор. Технические вопросы лучше адресовать ему. Я занимаюсь организацией передачи.']]},
 restorer:{name:'Михаил Белов',role:'Реставратор',greeting:'Осматривайтесь. Только ничего не вращайте силой: старые механизмы этого не прощают.',topics:[['Вы работаете с Мурмуром-1?','Да. Перед показом нужно проверить крепления и работу механизма. У таких вещей состояние внутри важнее блеска снаружи.'],['Для чего этот ящик?','Для перевозки музейных предметов. Тележка идёт мягко, внутри можно закрепить экспонат. Носить старый механизм в руках — плохая идея.'],['Можно посмотреть инструменты?','Смотрите. Только оставляйте всё на месте. Когда работаешь с маленькими деталями, порядок экономит не минуты — иногда он спасает сам предмет.']]}
};
const $=id=>document.getElementById(id);
people.guard={name:'Павел Серов',role:'Охранник',greeting:'Добрый вечер. Вы с Верой Орловой? Проходите. Только служебные двери за собой закрывайте.',topics:[['За чем вы следите на посту?','Камеры, двери, ключи. Перед показом работы хватает: кто-нибудь обязательно забудет пропуск или попросит открыть помещение.'],['Можно осмотреть пост?','Посмотреть можно. Только оборудование не отключайте и ключи не снимайте без меня.'],['Где найти Веру?','В служебном коридоре. Она рассматривала чертежи на стене.']]};
people.historian={name:'Вера Орлова',role:'Историк техники',greeting:'Рада, что ты пришёл. Мне хотелось, чтобы ты увидел Мурмура до передачи. У таких механизмов интересна не только внешность.',topics:[['Зачем тебя пригласили?','Оценить историческую сторону экспоната перед передачей. Для этого нужно изучить механизм и документы, а не просто посмотреть на него через стекло.'],['Ты уже осмотрела кота?','Пока только снаружи. Подробный осмотр ещё впереди. Не хочу делать уверенные заявления раньше проверки.'],['Почему тебе интересен Мурмур?','По старым механизмам можно понять, как люди пытались воспроизвести поведение живого существа. Здесь важны и замысел, и сохранившиеся детали.']]};
let currentRoom='hall';
let phase='before';
let catFound=false;
const technicalEvidence={
 E05:{title:'Заводской контрольный лист',source:'Папка на верстаке · заводской лист из основания Мурмура-1',text:'МУРМУР-1 · КОНТРОЛЬ СБОРКИ\nУзел: речевой кулачковый барабан.\nНомер оригинального барабана: М1-Р17.\nОтличительный признак: продольный контрольный паз у крепёжного кольца.\nНомер нанесён на торец рядом с кольцом.\n\nЛист описывает исходную деталь. Сам по себе он не показывает, что установлено в коте сейчас.'},
 E06:{title:'Маркировка установленного барабана',source:'Мурмур-1 · осмотр через сервисную крышку основания',text:'На торце установленного речевого барабана читается «Р17-К». Рядом с крепёжным кольцом поверхность гладкая: продольного контрольного паза нет.\n\nЭто результат осмотра установленной детали. Кто и когда её изготовил или заменил, по маркировке не установлено.'}
};
const hasEvidence=id=>notebook.observations.has('evidence:'+id);
technicalEvidence.E02={title:'Снимок подготовки · 18:55',source:'Музейный фотоаппарат · исходный снимок подготовки',text:'На снимке видна пустая бордовая подставка внутри витрины: кота уже нет. В стекле отражаются настенные часы; стрелки показывают время незадолго до семи. В исходном файле фотоаппарата время съёмки — сегодня, 18:55.\n\nСнимок относится к подготовке перед показом. Он фиксирует отсутствие кота до отключения в 19:00, но не показывает, кто его перенёс.'};
const earlyRemovalChecked=()=>notebook.observations.has('comparison:E02:blackout');
function showPreparationPhoto(){
 if(phase!=='investigation'||(currentRoom!=='hall'&&!hasEvidence('E02')))return;
 openPanel('Снимок подготовки зала','Музейный фотоаппарат','Исходный кадр, сделанный перед показом. Рассмотри витрину и сведения о времени съёмки.');
 const img=document.createElement('img');img.className='evidence-photo';img.src=typeof desImageUrl==='function'?desImageUrl('assets/evidence/preparation-photo.png'):'assets/evidence/preparation-photo.png';img.alt='Снимок витрины: пустая бордовая подставка и отражение настенных часов.';$('panel-body').append(img);
 addAction('Рассмотреть подставку и время',()=>readTechnical('E02'));
 addAction('Продолжить осмотр',()=>$('panel').close());
}
function compareRemovalTime(){
 if(phase!=='investigation'||!hasEvidence('E02'))return;
 const entry={title:'Кот отсутствовал до отключения',source:'Сопоставление · снимок 18:55 + отключение в 19:00',text:'В 18:55 на снимке подготовки витрина уже пуста. Электричество отключили в 19:00. Значит, кота сняли до семи минут темноты.\n\nОтключение не обеспечивало этот перенос. Снимок не устанавливает исполнителя, мотив или отсутствие сговора. Запись тележки в 18:54 и находка кота в мастерской дополняют картину, но закрытый ящик на записи сам по себе не показывает содержимое.'};
 remember('observations','comparison:E02:blackout',entry);openPanel(entry.title,'Проверка времени',entry.text);addAction('Продолжить расследование',()=>$('panel').close());
}
technicalEvidence.E07={title:'Акт состояния перед передачей',source:'Документ директора · подпись В. Ланского',text:'МУРМУР-1 · АКТ СОСТОЯНИЯ\nПодготовлен и подписан сегодня, 18:36.\n«Оригинальный речевой механизм сохранён. Замена исторических деталей не установлена».\nПодпись: В. Ланской.\n\nАкт фиксирует заявление директора. Сам по себе он не доказывает ни подлинность детали, ни знание о подмене.'};
technicalEvidence.E08={title:'Предварительное заключение Белова',source:'Рабочая папка · экземпляр с отметкой директора',text:'ПРЕДВАРИТЕЛЬНОЕ ТЕХНИЧЕСКОЕ ЗАКЛЮЧЕНИЕ\nСоставлено за три дня до показа.\n«Обнаружены признаки замены речевого барабана. До независимой проверки не следует подтверждать сохранность оригинального узла».\nРеставратор: М. Белов.\nОтметка: «Получено в день составления. В. Ланской», подпись.\n\nЭто подтверждает, что директор получил предупреждение. Окончательного доказательства замены в этом заключении ещё нет.'};
const directorWarned=()=>notebook.observations.has('comparison:E07:E08');
technicalEvidence.G01={title:'Журнал дежурства Павла',source:'Пост охраны · рукописный журнал',text:'ЖУРНАЛ ДЕЖУРСТВА · СЕГОДНЯ\n18:30 — подготовка закрытого показа.\n19:00 — сбой питания, изображение камер отсутствует.\n19:07 — питание восстановлено.\n19:10 — по распоряжению директора внешние двери закрыты.\nДежурный: П. Серов.\n\nЭто записи самого охранника. Формулировка «сбой» — его описание события, а не техническое заключение. Отметки о выходе с поста нет.'};
technicalEvidence.E09={title:'Распечатка журнала доступа',source:'Пост охраны · распечатка системы доступа',text:'СИСТЕМА ДОСТУПА · СЕГОДНЯ\n18:42 — мастерская, доступ разрешён.\nКарта: директор музея, В. Ланской.\n\nЗапись подтверждает использование карты директора. Она не устанавливает, кто держал карту в руках. Бумажный журнал дежурства и автоматический журнал доступа — разные источники.'};
technicalEvidence.E03={title:'Камера коридора · 18:54',source:'Пост охраны · архив коридорной камеры',text:'18:54. Михаил Белов везёт закрытый транспортировочный ящик из выставочного зала в мастерскую. Видны его лицо, тележка и ящик.\n\nСодержимое закрытого ящика не видно. Запись показывает маршрут и время перевозки, но сама по себе не доказывает, что внутри был кот.'};
technicalEvidence.E11={title:'Камера коридора · 18:58',source:'Пост охраны · архив коридорной камеры',text:'18:58. Павел Серов выходит из поста охраны с сумкой в служебный коридор. Лицо и сумка различимы. Сам электрощит и его выключатель в кадр не попадают.\n\nВ 19:00 запись обрывается и возобновляется в 19:07. Причину разрыва и положение выключателя по этому фрагменту установить нельзя.'};
technicalEvidence.E12={title:'Осмотр служебного электрощита',source:'Пост охраны · открытая наружная дверца щита',text:'За наружной дверцей видны подписанные органы управления, закрытые защитными панелями. Ручной выключатель «Служебная группа» питает пост, камеры и основное освещение зала. Сейчас он включён. Индикатор аварийного срабатывания защиты не установлен.\n\nОсмотр выполнен без переключений и снятия защитных панелей. Возможность ручного отключения установлена; кто и когда пользовался выключателем, его нынешнее положение не показывает.'};
technicalEvidence.E13={title:'Аккумулятор резервного питания',source:'Пост охраны · внешний осмотр аккумуляторного блока',text:'В доступном отсеке резервного питания установлен съёмный аккумуляторный блок с музейным инвентарным номером. На нём бытовая наклейка «П. Серов · домой». Рядом лежат транспортировочные заглушки; на направляющих заметны свежие следы установки.\n\nБлок не отсоединяли. Наклейка связывает его с Павлом, а следы указывают на недавнее перемещение. Где он находился и для чего использовался, ещё нужно выяснить.'};
technicalEvidence.E14={title:'Уведомление о проверке резервного питания',source:'Вложение в журнал дежурства · служебное уведомление',text:'ПЛАНОВАЯ ТЕХНИЧЕСКАЯ ПРОВЕРКА\nЗавтра, 09:00.\nПроверить комплектность аккумуляторных блоков и работу резервного питания поста охраны.\nОхрану уведомить заранее.\nОтметка об ознакомлении: П. Серов, вчера.\n\nПавел заранее знал о проверке. Уведомление само по себе не доказывает нарушение или причину отключения.'};
const securityEvidenceIds=['G01','E09','E03','E11','E12','E13','E14'];
const returnChecked=()=>notebook.observations.has('comparison:E13:E14');
const guardConfessionKey='guard:evidence:outage';
function compareBattery(){
 if(phase!=='investigation'||!hasEvidence('E13')||!hasEvidence('E14'))return;
 const entry={title:'Аккумулятор вернули перед проверкой — версия для проверки',source:'Сопоставление · аккумулятор + уведомление',text:'На музейном аккумуляторе есть бытовая наклейка Павла и следы недавней установки. Завтра проверят комплектность резервного питания, о чём Павел знал заранее.\n\nЭто даёт основание спросить о возвращении блока перед проверкой. Пока это объясняющая версия, а не доказанный мотив. Для разговора об отключении нужны также запись его выхода и осмотр щита.'};
 remember('observations','comparison:E13:E14',entry);openPanel(entry.title,'Основания для вопроса · E13 + E14',entry.text);
 addAction('Продолжить расследование',()=>$('panel').close());
}
function showCameraArchive(){
 if(phase!=='investigation'||currentRoom!=='security')return;
 openPanel('Архив коридорной камеры','Записи за сегодняшний вечер','Доступны два фрагмента перед отключением. В интервале 19:00–19:07 изображения нет. Выбери запись для просмотра.\n\nК каждому фрагменту доступны время и описание видимого в кадре.');
 addAction('Посмотреть 18:54 · тележка',()=>readTechnical('E03'));
 addAction('Посмотреть 18:58 · выход охранника',()=>readTechnical('E11'));
 addAction('Вернуться в комнату',()=>$('panel').close());
}
function compareDirectorDocs(){
 if(phase!=='investigation'||!hasEvidence('E07')||!hasEvidence('E08'))return;
 const entry={title:'Директор подписал акт после предупреждения',source:'Сопоставление · акт состояния + заключение Белова',text:'За три дня до показа Ланской получил предупреждение о признаках замены и просьбу не подтверждать оригинальность без проверки. Сегодня в 18:36 он подписал акт о сохранности оригинального механизма.\n\nДокументы устанавливают осведомлённость о проблеме до подписания акта. Для доказательства самого несоответствия детали нужны заводской лист и осмотр механизма. Кто выполнил замену, эти документы не устанавливают.'};
 remember('observations','comparison:E07:E08',entry);openPanel(entry.title,'Сопоставление документов',entry.text);
 addAction('Продолжить расследование',()=>$('panel').close());
}
const substitutionChecked=()=>notebook.observations.has('comparison:E05:E06');
function readTechnical(id){
 if(phase!=='investigation')return;
 if(id==='E02'&&currentRoom!=='hall'&&!hasEvidence(id))return;
 if(id==='E05'&&currentRoom!=='workshop'&&!hasEvidence(id))return;
 if(id==='E06'&&!catFound)return;
 if(id==='E07'&&currentRoom!=='hall'&&!hasEvidence(id))return;
 if(id==='E08'&&currentRoom!=='workshop'&&!hasEvidence(id))return;
 if(securityEvidenceIds.includes(id)&&currentRoom!=='security'&&!hasEvidence(id))return;
 const entry=technicalEvidence[id];if(!entry)return;
 remember('observations','evidence:'+id,entry);
 openPanel(entry.title,id==='E06'?'Осмотр · механизм':'Документ',entry.text);
 $('panel-body').classList.add('technical-sheet');
 if(id==='E02'){
  const img=document.createElement('img');img.className='evidence-photo';img.src=typeof desImageUrl==='function'?desImageUrl('assets/evidence/preparation-photo.png'):'assets/evidence/preparation-photo.png';img.alt='Пустая подставка в витрине и отражение часов на снимке подготовки.';$('panel-body').append(img);
  addAction('Сопоставить снимок и время отключения',compareRemovalTime);
 }
 if(['E05','E06'].includes(id)&&hasEvidence('E05')&&hasEvidence('E06'))addAction('Сопоставить лист и механизм',compareMechanism);
 if(['E07','E08'].includes(id)&&hasEvidence('E07')&&hasEvidence('E08'))addAction('Сопоставить акт и предупреждение',compareDirectorDocs);
 if(['E13','E14'].includes(id)&&hasEvidence('E13')&&hasEvidence('E14'))addAction('Сопоставить аккумулятор и проверку',compareBattery);
 if(id==='E03'||id==='E11')addAction('Другой фрагмент архива',showCameraArchive);
 addAction('Продолжить осмотр',()=>$('panel').close());
}
function compareMechanism(){
 if(phase!=='investigation'||!hasEvidence('E05')||!hasEvidence('E06'))return;
 const entry={title:'Барабан не соответствует заводскому листу',source:'Сопоставление · заводской лист + осмотр механизма',text:'По заводскому листу оригинальный барабан имеет номер М1-Р17 и контрольный паз. В коте установлен барабан Р17-К без этого паза.\n\nДва независимых признака не совпадают: установленная деталь не соответствует описанному оригинальному барабану. Это ещё не устанавливает, кто выполнил замену, когда и знал ли о ней директор.'};
 remember('observations','comparison:E05:E06',entry);
 openPanel(entry.title,'Сопоставление двух находок',entry.text);
 addAction('Вернуться к осмотру',()=>$('panel').close());
}
const foundRestorer={greeting:'Да. Это я перенёс Мурмура сюда. Теперь отрицать бессмысленно. Но я не собирался его продавать или выносить из музея.',topics:[['Когда вы его перенесли?','До отключения. Свет погас уже после того, как кот оказался в мастерской. Понимаю, что теперь мои слова выглядят удобно. Проверяйте.'],['Зачем вы спрятали кота?','Мне нужно было остановить передачу и кое-что проверить с Верой. В папке на столе есть запись, которую стоит изучить. Одних моих слов вам всё равно недостаточно.'],['Вы устроили отключение?','Нет. Я не знаю, почему погас свет. Я занимался котом.']]};
const afterDialogues={
 director:{greeting:'Его нет… Семь минут без света — и витрина пуста. Прошу вас разобраться. Передачу придётся приостановить.',topics:[['Вы уверены, что кот исчез во время отключения?','Перед отключением он был в витрине. А когда свет вернулся — исчез. Что ещё я должен думать?'],['Можно осмотреть помещения?','Да. Осмотрите зал и мастерскую. Я распорядился закрыть внешние двери. Только прошу ничего не повредить.'],['Кто последним работал с котом?','Михаил. Он занимался последней настройкой. Лучше спросите его самого.']]},
 restorer:{greeting:'Да, я уже слышал. Кота нет. Только не торопитесь с выводами из-за отключения.',topics:[['Где вы оставили экспонат?','Я закончил подготовку и оставил его для показа. Сейчас все на взводе. Давайте без поспешных обвинений.'],['Что вы знаете об отключении?','Я занимаюсь механизмами, а не электрикой здания. Почему погас свет, я не знаю.'],['Можно осмотреть мастерскую?','Осматривайте. Только осторожнее с инструментами и деталями.']]}
};
const phaseName=()=>phase==='investigation'?'После отключения':'До происшествия';
afterDialogues.guard={greeting:'Свет уже вернулся. Двери наружу закрыты, как просил директор. Да, неприятная история.',topics:[['Почему погас свет?','Технический сбой. Сейчас всё работает. Я бы пока не связывал с этим каждую странность в здании.'],['Вы покидали пост?','Нет. Я был на посту, следил за системой.'],['Вы видели, как уносили кота?','Нет, не видел. Сказать, кто его забрал, я не могу.'],['Можно проверить записи?','Архив доступен на мониторе. Выберите время и посмотрите, что попало в кадр.']]};
afterDialogues.historian={greeting:'Кот пропал, но пока мы знаем только, что его нет сейчас. Давай разберём события по порядку.',topics:[['Ты видела момент исчезновения?','Нет. И не стану выдавать догадку за воспоминание.'],['Ты подозревала проблему с экспонатом?','Да. У меня были основания сомневаться в оригинальности одной из деталей. Но для заключения нужны осмотр и документы.'],['Реставратор обращался к тебе перед отключением?','Да. Просил зайти в мастерскую и сверить одну заводскую запись. Поговорить об этом мы не успели.'],['Ты знаешь причину отключения?','Нет. За электрическое оборудование я не отвечаю и у щита не была.']]};
function phaseObject(obj){
 if(phase!=='investigation')return obj;
 if(currentRoom==='hall'&&obj.title==='Мурмур-1')return {...obj,title:'Пустая витрина',text:'На бордовой подставке остались крепления. Мурмура-1 в витрине нет. Стекло цело, заметных следов грубого взлома не видно.\n\nЭто показывает состояние витрины сейчас. Когда и кто снял кота, ещё предстоит выяснить.'};
 if(currentRoom==='workshop'&&obj.title==='Рабочая папка')return {...obj,text:'В рабочей папке лежат старый заводской контрольный лист и предварительное заключение Белова с отметкой директора о получении. Оба документа можно прочитать.'};
 if(currentRoom==='security'&&obj.title==='Журнал поста охраны')return {...obj,text:'На столе открыт рукописный журнал дежурства. Между страницами вложена отдельная распечатка системы доступа. Можно прочитать оба источника.'};
 if(currentRoom==='security'&&obj.title==='Монитор наблюдения')return {...obj,text:'На экране — текущие виды с камер. Через панель архива доступны фрагменты служебного коридора до отключения. Текущая картинка и архивная запись — разные источники.'};
 if(currentRoom==='workshop'&&obj.title==='Транспортировочный ящик')return catFound?{...obj,box:[10,31,32,56],title:'Мурмур-1 в ящике',text:'Крышка открыта. Внутри, в мягкой защитной обивке, сидит Мурмур-1. Латунные уши, стеклянные глаза, ажурные пластины — тот самый кот из витрины.\n\nНаходка устанавливает его местонахождение. Кто, когда и зачем его перенёс — отдельные вопросы.'}:{...obj,text:'Закрытый транспортировочный ящик стоит на тележке. На крышке — защёлки, на боку — музейная бирка.\n\nЗащёлки можно открыть. Для осмотра не нужны ключ или разрешение реставратора.'};
 return obj;
}
function beginIncident(){
 if(phase!=='before')return;
 openPanel('До начала показа','Позднее','Осмотр музея окончен. Вера просит тебя подождать у входа в зал, пока сотрудники завершают подготовку. Время проходит.\n\nВ 19:00 основное освещение внезапно гаснет.');
 addAction('Продолжить',()=>{phase='blackout';$('panel').close();enterRoom('hall');});
 addAction('Ещё осмотреться',()=>$('panel').close());
}
function restoreLight(){
 if(phase!=='blackout')return;
 phase='investigation';enterRoom('hall');
 remember('observations','event:empty-case',{title:'После отключения витрина пуста',source:'Выставочный зал · после отключения',text:'Освещение отсутствовало с 19:00 до 19:07. После возвращения света обнаружено отсутствие кота в витрине. Сам момент его перемещения ты не видел.'});
 openPanel('Витрина пуста','19:08 · Выставочный зал','Директор отодвигает ширму подготовки. Под стеклом осталась только подставка.\n\n«Его нет… — произносит Ланской. — Прошу вас разобраться». Передачу приостанавливают. Внешние двери закрыты.\n\nОсмотри витрину и расспроси сотрудников.');
 addAction('Начать осмотр',()=>$('panel').close());
}
let previousFocus=null;
const notebook={observations:new Map(),statements:new Map(),notes:''};
let reportDraft={answers:{},supports:{}};
const SAVE_KEY='des-detective.save.v1';
let savingBlocked=false;
function openCrate(){
 if(phase!=='investigation'||currentRoom!=='workshop'||catFound)return;
 catFound=true;
 enterRoom('workshop');
 remember('observations','evidence:E04',{title:'Мурмур-1 найден в мастерской',source:'Мастерская · открытый транспортировочный ящик',text:'Внутри ящика на тележке обнаружен Мурмур-1. Это подтверждает местонахождение экспоната, но само по себе не устанавливает исполнителя, время переноса или мотив.'});
 openPanel('Мурмур-1 найден','Находка','Защёлки поддаются. Подняв крышку, ты видишь знакомые латунные уши и стеклянные глаза. Кот стоит внутри защитной обивки.\n\nБелов смотрит на открытый ящик. Теперь можно спросить его о находке.');
 addAction('Спросить Белова о коте',()=>talk('restorer'));
 addAction('Продолжить осмотр',()=>$('panel').close());
}
function updateNotebookCount(){
 $('notebook').textContent='Блокнот · '+(notebook.observations.size+notebook.statements.size);
}
function saveGame(){
 if(savingBlocked)return;
 try{
  localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,phase,catFound,reportDraft,room:currentRoom,observations:[...notebook.observations],statements:[...notebook.statements],notes:notebook.notes}));
  $('save-status').textContent='Прогресс сохранён в этом браузере.';
 }catch{
  $('save-status').textContent='Браузер не разрешил сохранить прогресс. Записи останутся только до закрытия или обновления страницы.';
 }
}
function loadGame(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(!raw)return;
  const data=JSON.parse(raw);
  const validEntries=entries=>Array.isArray(entries)&&entries.length<=200&&entries.every(pair=>Array.isArray(pair)&&pair.length===2&&typeof pair[0]==='string'&&pair[0].length<=500&&pair[1]&&['title','source','text'].every(key=>typeof pair[1][key]==='string'&&pair[1][key].length<=12000));
  if(!data||data.version!==1||!Object.hasOwn(rooms,data.room)||typeof data.notes!=='string'||data.notes.length>8000||!validEntries(data.observations)||!validEntries(data.statements))throw new Error('Invalid save');
  if(data.phase!==undefined&&!['before','blackout','investigation'].includes(data.phase))throw new Error('Invalid phase');
  if(data.catFound!==undefined&&(typeof data.catFound!=='boolean'||(data.catFound&&data.phase!=='investigation')))throw new Error('Invalid discovery');
  currentRoom=data.room;
  phase=data.phase??'before';
  catFound=data.catFound??false;
  notebook.observations=new Map(data.observations);
  notebook.statements=new Map(data.statements);
  const oldTrolley=notebook.statements.get('restorer:evidence:trolley');
  if(oldTrolley?.text==='Я перевозил музейный предмет. Осмотрите ящик сами, тогда поговорим предметно.'){
   notebook.statements.set('restorer:evidence:trolley-before',oldTrolley);
   notebook.statements.delete('restorer:evidence:trolley');
  }
  notebook.notes=data.notes;
  if(data.reportDraft){
   const d=data.reportDraft;
   const validObject=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length<=20;
   if(validObject(d.answers)&&validObject(d.supports)&&Object.values(d.answers).every(v=>typeof v==='string'&&v.length<=80)&&Object.values(d.supports).every(v=>Array.isArray(v)&&v.length<=200&&v.every(k=>typeof k==='string'&&k.length<=600)))reportDraft=d;
  }
  updateNotebookCount();
 }catch{
  savingBlocked=true;
  $('save-status').textContent='Сохранение недоступно или не удалось прочитать. Можно играть без сохранения; для сброса используй «Новую игру». Старые данные не перезаписаны.';
 }
}
function confirmNewGame(){
 openPanel('Начать заново?','Новая игра','Будут удалены прогресс расследования, записи и твои версии в этом браузере. Ты вернёшься в выставочный зал до происшествия.');
 addAction('Продолжить текущую игру',()=>$('panel').close());
 addAction('Удалить прогресс и начать заново',()=>{
  try{localStorage.removeItem(SAVE_KEY);}catch{
   $('panel-body').textContent='Браузер не разрешил удалить сохранение. Текущие записи оставлены на месте.';
   return;
  }
  if(typeof resetLunaHistory==='function')resetLunaHistory();
  savingBlocked=false;phase='before';catFound=false;reportDraft={answers:{},supports:{}};notebook.observations.clear();notebook.statements.clear();notebook.notes='';updateNotebookCount();
  $('panel').close();enterRoom('hall');
 });
}
function remember(section,key,entry){
 const collection=notebook[section];
 if(collection.has(key)){
  const previous=collection.get(key);
  if(section!=='statements'||previous.text===entry.text)return;
  let index=1;while(collection.has(key+':earlier:'+index))index++;
  collection.set(key+':earlier:'+index,{...previous,title:'Ранее: '+previous.title});
 }
 collection.set(key,entry);
 updateNotebookCount();
 saveGame();
 $('status').textContent='В блокноте новая запись: '+entry.title;
}
function inspect(obj){
 if(phase==='blackout')return;
 const isCrate=currentRoom==='workshop'&&obj.title==='Транспортировочный ящик';
 const isFolder=currentRoom==='workshop'&&obj.title==='Рабочая папка';
 const isJournal=currentRoom==='security'&&obj.title==='Журнал поста охраны';
 const isMonitor=currentRoom==='security'&&obj.title==='Монитор наблюдения';
 const isShield=currentRoom==='security'&&obj.title==='Закрытый электрощит';
 const isBattery=currentRoom==='security'&&obj.title==='Источник бесперебойного питания';
 obj=phaseObject(obj);
 openPanel(obj.title,'Осмотр',obj.text);
 remember('observations',currentRoom+':'+obj.title+(phase==='investigation'?':after':''),{title:obj.title,source:rooms[currentRoom].name+' · '+phaseName(),text:obj.text.split('\n\n')[0]});
 if(isCrate&&phase==='investigation'&&!catFound)addAction('Открыть ящик',openCrate);
 if(isCrate&&phase==='investigation'&&catFound)addAction('Осмотреть механизм через сервисную крышку',()=>readTechnical('E06'));
 if(isFolder&&phase==='investigation')addAction('Прочитать заводской лист',()=>readTechnical('E05'));
 if(isFolder&&phase==='investigation')addAction('Прочитать предварительное заключение',()=>readTechnical('E08'));
 if(isJournal&&phase==='investigation'){
  addAction('Прочитать журнал дежурства',()=>readTechnical('G01'));
  addAction('Прочитать распечатку доступа',()=>readTechnical('E09'));
  addAction('Прочитать уведомление о проверке',()=>readTechnical('E14'));
 }
 if(isMonitor&&phase==='investigation')addAction('Открыть архив камер',showCameraArchive);
 if(isShield&&phase==='investigation')addAction('Открыть наружную дверцу и осмотреть',()=>readTechnical('E12'));
 if(isBattery&&phase==='investigation')addAction('Осмотреть аккумуляторный блок',()=>readTechnical('E13'));
 addAction('Продолжить осмотр',()=>$('panel').close());
}
function showNotebook(section='observations'){
 openPanel('Записная книжка',phaseName(),'');
 const tabs=document.createElement('nav');tabs.className='notebook-tabs';tabs.setAttribute('aria-label','Разделы блокнота');
 for(const [key,label] of [['observations','Наблюдения'],['statements','Показания'],['notes','Мои версии']]){
  const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',String(section===key));b.addEventListener('click',()=>showNotebook(key));tabs.append(b);
 }
 $('panel-body').append(tabs);
 const hint=document.createElement('p');hint.className='notebook-hint';hint.textContent=section==='statements'?'Слова собеседников. Они не становятся подтверждёнными фактами автоматически.':section==='notes'?'Твои предположения и вопросы. Игра не считает их доказательствами.':'То, что ты уже осмотрел в музее.';$('panel-body').append(hint);
 if(section==='notes'){
  const label=document.createElement('label');label.htmlFor='player-notes';label.textContent='Что стоит проверить?';
  const field=document.createElement('textarea');field.id='player-notes';field.rows=6;field.maxLength=8000;field.placeholder='Запиши свою мысль…';field.value=notebook.notes;field.addEventListener('input',()=>{notebook.notes=field.value;saveGame();});$('panel-body').append(label,field);
 }else{
  const entries=notebook[section];
  if(!entries.size){const empty=document.createElement('p');empty.textContent=section==='observations'?'Записей пока нет. Осмотри любой предмет.':'Записей пока нет. Поговори с кем-нибудь из участников показа.';$('panel-body').append(empty);}
  for(const entry of entries.values()){
   const card=document.createElement('article');card.className='notebook-entry';
   const title=document.createElement('h3');title.textContent=entry.title;
   const source=document.createElement('p');source.className='entry-source';source.textContent=entry.source;
   const text=document.createElement('p');text.textContent=entry.text;card.append(title,source,text);$('panel-body').append(card);
  }
 }
 if(section==='observations'&&hasEvidence('E05')&&hasEvidence('E06'))addAction('Сопоставить лист и механизм',compareMechanism);
 if(section==='observations'&&hasEvidence('E07')&&hasEvidence('E08'))addAction('Сопоставить акт и предупреждение',compareDirectorDocs);
 if(section==='observations'&&hasEvidence('E13')&&hasEvidence('E14'))addAction('Сопоставить аккумулятор и проверку',compareBattery);
 if(section==='observations'&&hasEvidence('E02')){
  addAction('Посмотреть снимок подготовки',showPreparationPhoto);
  addAction('Сопоставить снимок и время отключения',compareRemovalTime);
 }
 const session=document.createElement('p');session.className='notebook-hint';session.textContent='Состояние сохранения указано под сценой. Сохранения относятся к этому браузеру и адресу игры.';$('panel-body').append(session);
 addAction('Вернуться в комнату',()=>$('panel').close());
}
function openPanel(title,kind,text){if(!$('panel').open)previousFocus=document.activeElement;$('panel-title').textContent=title;$('panel-kind').textContent=kind;$('panel-body').textContent=text;$('panel-body').classList.remove('technical-sheet');$('question-box').hidden=true;$('question-box').replaceChildren();$('panel').scrollTop=0;$('hover').style.display='none';$('actions').replaceChildren();if(!$('panel').open)$('panel').showModal();}
function addAction(label,callback){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',callback);$('actions').append(b);}
function talk(id){
 if(phase==='blackout')return;
 const offers=[];const offer=(label,callback)=>{offers.push({label,callback});addAction(label,callback);};
 const p=phase==='investigation'?{...people[id],...(id==='restorer'&&catFound?foundRestorer:afterDialogues[id])}:people[id];
 const directorAdmitted=id==='director'&&phase==='investigation'&&notebook.statements.has('director:evidence:awareness');
 if(directorAdmitted){p.greeting='Да, я получил предупреждение до подписания акта. Я должен был остановить передачу и дождаться проверки.';p.topics=[['Почему вы подписали акт?','Я боялся потерять финансирование музея. Рассчитывал завершить передачу, а потом разобраться с деталью. Это не оправдание.'],['Вы сами заменили барабан?','Нет. Когда именно его заменили, я не знаю. Я отвечаю за то, что подписал акт, несмотря на предупреждение.'],['Что будет с передачей?','До выяснения состояния механизма передача приостановлена.']];}
 const earlyAdmitted=id==='director'&&phase==='investigation'&&notebook.statements.has('director:evidence:early-removal');
 if(earlyAdmitted&&!directorAdmitted){p.greeting='Я разрешил снять кота до отключения. Об этом надо было сказать сразу.';p.topics=p.topics.filter(([q])=>q!=='Вы уверены, что кот исчез во время отключения?');}
 const guardAdmitted=id==='guard'&&phase==='investigation'&&notebook.statements.has('guard:evidence:exit');
 if(guardAdmitted){p.greeting='Да, я выходил с поста. На записи это видно. К щиту я подходил, но не надо сразу делать меня похитителем.';p.topics=[['Зачем вы подошли к щиту?','Проверить оборудование. Подробности нужно смотреть по самому щиту, а не додумывать по камере.'],['Вы знаете, кто унёс кота?','Я не видел, что находилось в ящике. Виновника пропажи по одному выходу с поста не определишь.']];}
 const guardConfessed=id==='guard'&&phase==='investigation'&&notebook.statements.has(guardConfessionKey);
 if(guardConfessed){p.greeting='Отключение устроил я. Аккумулятор вернул. Надо было признаться сразу, но после пропажи кота я испугался.';p.topics=[['Зачем понадобилось отключать свет?','Я забрал музейный аккумулятор домой. Перед проверкой хотел вернуть незаметно. Обесточил служебную группу для подключения, знал, что на ней свет и камеры. Рассчитывал управиться быстро.'],['Почему прошло семь минут?','Возвращал блок на место, закреплял и проверял соединения. Потом включил группу. Не думал, что за это время поднимется история с котом.'],['Вы помогали спрятать кота?','Нет. Не договаривался ни с Беловым, ни с кем другим. До обнаружения пустой витрины я о пропаже не знал.']];}
 const catTold=id!=='restorer'&&phase==='investigation'&&notebook.statements.has(id+':evidence:cat-found');
 if(catTold&&!directorAdmitted&&!earlyAdmitted&&!guardAdmitted&&!guardConfessed){
  p.greeting=id==='director'?'Кот найден в мастерской. Хорошо, что он остался в музее. Теперь нужно разобраться в обстоятельствах.':id==='historian'?'Кот найден. Теперь важно проверить механизм и документы, чтобы понять причину переноса.':'Вы нашли кота в мастерской. Значит, надо разбираться, как он там оказался.';
 }
 const motiveAdmitted=id==='restorer'&&phase==='investigation'&&notebook.statements.has('restorer:evidence:comparison');
 if(motiveAdmitted)p.topics=p.topics.map(([q,answer])=>q==='Зачем вы спрятали кота?'?[q,'Я хотел остановить передачу и сохранить доказательство замены барабана для независимой проверки с Верой. Поэтому спрятал кота здесь.']: [q,answer]);
 const suffix=phase==='investigation'?(guardConfessed?':outage':catTold&&!directorAdmitted&&!earlyAdmitted&&!guardAdmitted?':informed':earlyAdmitted?':early':directorAdmitted||guardAdmitted?':admitted':id==='restorer'&&catFound?':found':':after'):'';
 openPanel(p.name,p.role,p.greeting);
 const record=(key,title,text)=>remember('statements',key,{title,source:p.name+' · '+p.role+' · '+phaseName(),text});
 record(id+':greeting'+suffix,p.name+' — начало разговора',p.greeting);
 for(const [question,answer] of p.topics)offer(question,()=>{$('panel-body').textContent=answer;record(id+':'+question+suffix,question,answer);});
 const evidenceTopic=(key,question,answer)=>offer(question,()=>{record(id+':evidence:'+key,question,answer);talk(id);$('panel-body').textContent=answer;});
 if(phase==='investigation'&&catFound&&id!=='restorer'&&!catTold)evidenceTopic('cat-found','Сообщить: Мурмур найден в ящике мастерской',id==='director'?'В мастерской? Рад, что его не вынесли из музея. Передачу пока не возобновляем: сначала разберёмся, что произошло.':id==='historian'?'Хорошо. Теперь у нас есть сам механизм для проверки. Одна находка ещё не объясняет ни мотив, ни отключение.':'В мастерской… Хорошо, что кот остался в здании. Причину отключения всё равно нужно выяснять отдельно.');
 if(phase==='investigation'&&id==='guard'&&hasEvidence('G01')&&!guardAdmitted)evidenceTopic('journal','В журнале нет отметки о выходе с поста','Я записываю основные события, а не каждую мелочь. Во время отключения было не до аккуратных записей.');
 if(phase==='investigation'&&id==='guard'&&hasEvidence('E11')&&!guardConfessed)evidenceTopic('exit','Предъявить запись 18:58: вы покидали пост','Да, выходил. К служебному щиту, с сумкой. Не хотел, чтобы из этого сразу сделали вывод, будто я помогал унести кота. Но запись не отрицаю.');
 if(phase==='investigation'&&id==='guard'&&hasEvidence('E13')&&!guardConfessed)evidenceTopic('battery','На аккумуляторе ваша наклейка. Почему?','Моя. Этот блок был у меня. Я вернул его на место, теперь он в музее.');
 if(phase==='investigation'&&id==='guard'&&hasEvidence('E11')&&hasEvidence('E12')&&returnChecked()&&!guardConfessed)offer('Предъявить запись, щит и возвращённый аккумулятор',()=>{
  const answer='Да. Аккумулятор я самовольно забрал домой и возвращал перед завтрашней проверкой. Чтобы подключить его, выключил служебную группу. Знал, что погаснет свет и остановятся камеры, но хотел скрыть нарушение. Семь минут ушло на установку и подключение. Кота я не трогал и его пропажу не планировал.';
  record(guardConfessionKey,'Павел признал отключение ради возвращения аккумулятора',answer);
  $('panel-body').textContent=answer;$('question-box').hidden=true;$('actions').replaceChildren();addAction('Продолжить разговор с Павлом',()=>talk('guard'));addAction('Вернуться к осмотру',()=>$('panel').close());
 });
 if(phase==='investigation'&&id==='director'&&hasEvidence('E09'))evidenceTopic('card','В 18:42 мастерскую открыли вашей картой','Картой — да. Но это не значит, что там был я. У Белова не работал пропуск, я дал ему свою карту. Это можно проверить.');
 if(phase==='investigation'&&id==='restorer'&&hasEvidence('E03'))evidenceTopic(catFound?'trolley':'trolley-before','Предъявить запись 18:54: что было в ящике?',catFound?'Мурмур. Вы уже нашли его. Я перевёз его в мастерскую до отключения.':'Я перевозил музейный предмет. Осмотрите ящик сами, тогда поговорим предметно.');
 if(phase==='investigation'&&id==='director')addAction('Попросить акт состояния экспоната',()=>readTechnical('E07'));
 if(phase==='investigation'&&id==='director')addAction('Посмотреть снимок подготовки зала',showPreparationPhoto);
 if(phase==='investigation'&&id==='director'&&earlyRemovalChecked())evidenceTopic('early-removal','Предъявить снимок: кота не было уже в 18:55','Да. Михаил попросил снять его для последней настройки, и я разрешил. Потом прикрыл витрину ширмой подготовки. Я знал, что кота сняли до отключения, но надеялся, что он быстро вернётся на место. Когда свет погас и началась паника, я промолчал. Где Михаил его оставил, я тогда не знал.');
 if(phase==='investigation'&&id==='director'&&hasEvidence('E07')&&!directorAdmitted)evidenceTopic('act','В акте вы подтверждаете оригинальность?','Акт подписан мной. Официальное состояние экспоната отражено в документе. До окончательной проверки не стоит делать громких заявлений.');
 if(phase==='investigation'&&id==='director'&&directorWarned()&&substitutionChecked())evidenceTopic('awareness','Предъявить акт, предупреждение и несоответствие детали','Да. Я получил заключение Белова за три дня до показа. Знал, что есть признаки замены, но всё равно подписал акт. Боялся сорвать передачу и потерять финансирование. Уговаривал себя, что разберёмся позднее.');
 if(phase==='investigation'&&hasEvidence('E05')&&id==='restorer')evidenceTopic('E05','Показать заводской лист: где вы его нашли?','В сервисной полости основания, во время последней проверки. До этого у меня были только подозрения. Этот лист позволил проверить номер и устройство барабана.');
 if(phase==='investigation'&&hasEvidence('E05')&&id==='historian')evidenceTopic('E05','Показать заводской лист Вере','Это контрольный лист сборки. Здесь указан конкретный барабан, а не просто тип механизма. Сверь номер на торце и наличие контрольного паза. Сам лист описывает исходную деталь; её сохранность проверяется осмотром.');
 if(phase==='investigation'&&substitutionChecked()&&id==='restorer'&&catFound)evidenceTopic('comparison','Предъявить несовпадение: поэтому вы спрятали кота?','Да. Я увидел, что барабан заменён. Передачу надо было остановить, а заводскую запись — показать Вере. Боялся, что кота отправят раньше независимой проверки. Поэтому перенёс его сюда и спрятал. Это было моё решение.');
 if(phase==='investigation'&&substitutionChecked()&&id==='historian')evidenceTopic('comparison','Показать лист и результаты осмотра','М1-Р17 с пазом по листу, Р17-К без паза в коте. По этим данным установленный барабан не соответствует оригинальному. Но они не говорят, кто заменил деталь и что об этом знал директор. Для этого нужны другие документы.');
 if(typeof renderQuestionInput==='function')renderQuestionInput(id,offers);
 addAction('Завершить разговор',()=>$('panel').close());
}
function enterRoom(id){currentRoom=phase==='blackout'?'hall':id;id=currentRoom;const room=rooms[id];$('room-name').textContent=room.name;const image=id==='hall'&&phase==='investigation'?'assets/scenes/hall-empty.png':id==='workshop'&&catFound?'assets/scenes/workshop-found.png':room.image;$('scene').setAttribute('data-scene-source',image);$('scene').src=typeof desImageUrl==='function'?desImageUrl(image):image;$('scene').alt=id==='hall'&&phase==='investigation'?'Выставочный зал после отключения: центральная витрина пуста, директор стоит справа.':id==='workshop'&&catFound?'Мастерская: в открытом ящике слева найден механический кот, Белов у верстака справа.':room.alt;$('hotspots').replaceChildren();$('hover').style.display='none';$('status').textContent=phase==='blackout'?'19:00 · Основное освещение отключено.':phase==='investigation'?'После отключения · Осмотри помещения и расспроси сотрудников.':id==='hall'?'Кот ещё в витрине. До показа есть время осмотреть музей.':({workshop:'На верстаке горит лампа. Реставратор ненадолго отложил работу.',security:'На посту дежурит Павел. На столе открыт журнал.',corridor:'Вера ждёт в коридоре. Рядом двери мастерской и поста охраны.'}[id]);
 $('passages').replaceChildren();
 if(phase!=='blackout')for(const [label,target] of room.exits??[]){const b=document.createElement('button');b.textContent=label+' →';b.addEventListener('click',()=>{enterRoom(target);$('help').focus();});$('passages').append(b);}
 $('passages').hidden=!$('passages').children.length;
 $('report').hidden=phase!=='investigation';$('blackout').hidden=phase!=='blackout';$('incident').hidden=phase!=='before';$('help').disabled=phase==='blackout';$('notebook').disabled=phase==='blackout';$('chapter').textContent=phase==='blackout'?'Семь минут темноты · ожидание не требует реальных семи минут':phaseName()+' · нажимай на предметы и персонажей · Tab — выбор объекта';
 if(phase==='blackout'){saveGame();return;}
 for(const original of room.objects){const obj=phaseObject(original);const b=document.createElement('button');b.className='hotspot';b.setAttribute('aria-label',obj.name);const [x,y,w,h]=obj.box;Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});b.addEventListener('pointerenter',()=>{$('hover').textContent=obj.name;Object.assign($('hover').style,{display:'block',left:Math.min(x,70)+'%',top:Math.min(y+h,87)+'%'});});b.addEventListener('pointerleave',()=>{$('hover').style.display='none';});b.addEventListener('click',()=>{if(obj.to){enterRoom(obj.to);$('help').focus();}else if(obj.person)talk(obj.person);else inspect(original);});$('hotspots').append(b);}
 saveGame();
}
$('panel').querySelector('.close').addEventListener('click',()=>$('panel').close());
$('panel').addEventListener('close',()=>{if(previousFocus?.isConnected)previousFocus.focus();});
$('help').setAttribute('aria-pressed','false');
$('notebook').addEventListener('click',()=>showNotebook());
$('new-game').addEventListener('click',confirmNewGame);
$('incident').addEventListener('click',beginIncident);
$('restore-light').addEventListener('click',restoreLight);
$('help').addEventListener('click',()=>{const enabled=$('stage').classList.toggle('show-hotspots');$('help').textContent=enabled?'Скрыть подсказки':'Показать объекты';$('help').setAttribute('aria-pressed',String(enabled));});
$('scene').addEventListener('error',()=>{$('status').textContent='Не удалось загрузить сцену. Проверь наличие файлов в assets/scenes.';});
loadGame();
enterRoom(currentRoom);
