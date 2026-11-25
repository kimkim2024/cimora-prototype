/* Story-only outline and length contract. Comic/video continue using their own workflow. */
(function(root){
'use strict';
function factory(M,C){
 const copy=x=>JSON.parse(JSON.stringify(x));
 const presets=[{name:'Short',chapters:4,words:800},{name:'Medium',chapters:12,words:2000},{name:'Long',chapters:30,words:3000}];
 // Authored outline fixtures make the demonstration readable; no model call is implied.
 const outlineFixtures={
  romance:{
   4:[
    ['离城前三天','陆川在送别宵夜收到前女友许宁的好友申请，两人以还书为由重逢。早餐时，他们发现对彼此这三年的生活都有误解，并约定中午继续见面。','许宁坦言还书只是见他的理由。','午饭之约让两人有机会正面谈起分手。'],
    ['迟到的解释','许宁交稿迟到，陆川克制了旧日的责怪。见面后，两人承认当年各自造成的伤害；许宁主动说起新的驻地工作，陆川开始认真倾听她的未来。','新的异地可能没有再被隐瞒。','他们将在书店义卖中练习合作与沟通。'],
    ['修好一张桌子','两人一起修好义卖用的阅读桌。陆川照计划搬家，不以留下交换复合。雨中，他们明确道歉并牵手，但同意给关系修复留出时间。','许宁表达仍有爱意，同时拒绝用一夜重逢跳过三年。','两人各自回去，等待离城当天继续谈清关系。'],
    ['下一次见面','陆川退租后学着直接表达失落。河边长谈中，两人决定重新相爱，约定及时沟通；他仍按时离城，她也保留工作选择，未来见面地点尚待商量。','复合不再以任何一方放弃生活为代价。','许宁发来圈出的日历和一个新想法，留下共同选择的悬念。']
   ],
   10:[
    ['未读的好友申请','陆川在送别宵夜上宣布即将赴南州工作。手机突然收到三年未联系的前女友许宁的好友申请，平静的离城安排被打破。','早已断联的人主动问能否重新加回好友。','陆川需要决定是否回应。'],
    ['以还书为名','陆川删掉生硬的询问，与许宁约在旧页书店还书。第二天的早餐让他发现，她已经不是记忆里的那个样子。','许宁连过去的饮食习惯也发生了变化。','重逢促使他们重新了解彼此。'],
    ['你原来一直在这里','陆川得知许宁早已回到海汀。两人意识到彼此的猜测有误；许宁坦白想见他，他邀请她午饭时再聊，也接受她可能赶不上。','还书的借口变成直接表达想念。','午饭之约将他们带向未解的分手往事。'],
    ['迟到的解释','陆川接到许宁迟到的消息，没有再用责怪回应。见面后，两人坦承父亲病情、交流机会和争吵中的伤害，不把分手简单归为误会。','许宁在谈清旧事后，主动提出新的北岸驻地邀约。','一次新的异地选择等待他们回应。'],
    ['听见你的未来','许宁说明自己尚未决定是否去北岸。陆川没有要求她留下，而是询问工作内容，认真听她讲述自己想做的事。','倾听对方的未来，不再被他理解为被抛下。','两人带着新的沟通方式参加书店义卖。'],
    ['一起修好一张桌子','义卖开始前，陆川修理摇晃的阅读桌。他从习惯性的独自承担转为请许宁帮忙，两人在一次小小的合作中重新建立信任。','陆川第一次主动让对方参与解决问题。','合作的默契还要面对他即将离开的事实。'],
    ['雨中的边界','陆川照常搬走行李，没有用改签要求许宁表态。晚餐后的雨中，两人说清道歉并牵手，许宁承认爱意，也明确修复关系需要时间。','牵手没有被当成默认复合。','陆川需要尊重她尚未准备好的边界。'],
    ['学着说舍不得','陆川接受许宁的边界，两人在雨后各自离开。周日退租时，他主动表达自己的失落；许宁回应他的感受，但没有替他承担所有情绪。','表达脆弱不再意味着要求对方立刻赶来。','河边的约会将正式谈到是否重新开始。'],
    ['重新开始','陆川在河边明确提出重新相爱，许宁答应。两人约定及时说清需求，不再靠猜测和牺牲维系关系，同时保留各自的工作安排。','关系得到确认，但共同生活的答案仍然开放。','下一次见面需要两人共同安排。'],
    ['那我有一个想法','陆川按原计划乘车离城，许宁没有挽留。列车开动后，她发来圈出周末的日历，并提出一个新想法。','离开城市不再等于结束关系。','下一次在哪里见面，留给两人共同决定。']
   ]
  },
  clock:{4:[
   ['停在雨夜的表','林时修好陈伯的旧表，听到不要过桥的未来留言。他让陈伯绕路，随后得知桥梁发生事故，第一次发现旧表可能预告明天。','一次干预似乎阻止了危险。','林时开始尝试解读更多留言。'],
   ['被改写的明天','林时凭留言阻止小意外，却越来越焦虑。听见许禾离开的暗示后，他找理由留住她；许禾亮出入学通知，要求自己作决定。','留言再次响起时发生变化，让他看到干预的代价。','控制明天的执念指向他未解的旧伤。'],
   ['父亲没有说完的话','陈伯归还林时父亲的怀表。林时想起没有接听的最后两通电话，修表后反复追寻父亲未说完的话，终于向许禾讲出所有秘密。','许禾让他分清想念父亲与掌控一切的区别。','他必须选择如何对待下一条未来留言。'],
   ['把选择还给你','许禾出发前，林时将新的留言和不确定性完整告诉她，不再阻拦。车站里，许禾踏上求学旅程，陈伯也去完成与妻子的约定。','林时选择陪伴，而不替别人决定未来。','怀表再次传出声音，他决定等明天听当事人亲口说。']
  ]}
 };
 function ensure(p){C.ensure(p);if(!p.storyWriting){p.storyWriting={length:{chapters:p.storyChapters.length||p.outline?.length||4,words:800},confirmedLength:null,items:[],confirmedOutline:'',undo:[]};if(p.outline?.length)p.storyWriting.items=p.outline.map(e=>({id:M.id('story-plan'),chapterId:e.id,title:e.title||'',summary:e.events||'',turn:e.turn||'',ending:e.ending||''}));}p.storyWriting.mode??=(p.agent?.entry?.mode==='manual'||p.agent?.planningOrigin==='manual')?'free':'planned';return p.storyWriting;}
 function freeWriting(p){return ensure(p).mode==='free';}
 function valid(length){const n=Number(length.chapters),words=Number(length.words);if(!Number.isInteger(n)||n<1||n>100)throw Error('Enter a whole number from 1 to 100 for the chapter count.');if(!Number.isInteger(words)||words<100||words>10000)throw Error('Enter a whole number from 100 to 10,000 for words per chapter.');return {chapters:n,words};}
 function lengthConfirmed(p){const w=ensure(p);return !!w.confirmedLength&&JSON.stringify(w.confirmedLength)===JSON.stringify(w.length);}
 function confirmLength(p){const w=ensure(p);w.length=valid(w.length);w.confirmedLength=copy(w.length);return w.length;}
 function suggestLength(p,text){const w=ensure(p);if(w.confirmedLength)return;const n=String(text).match(/(?:共|分为|写|做)?\s*(\d+)\s*[章集]/);if(n&&+n[1]>=1&&+n[1]<=100)w.length.chapters=+n[1];const words=String(text).match(/每[章节集](?:约|大约)?\s*(\d+)\s*字/);if(words&&+words[1]>=100&&+words[1]<=10000)w.length.words=+words[1];}
 function sig(p){const w=ensure(p);return JSON.stringify([w.confirmedLength,w.items.map(x=>[x.id,x.chapterId,x.title,x.summary,x.turn,x.ending])]);}
 function checkpoint(p){const w=ensure(p);w.undo.push(copy(w.items));w.undo=w.undo.slice(-20);}
 function undo(p){const w=ensure(p);if(w.undo.length){w.items=w.undo.pop();w.confirmedOutline='';}}
 function add(p){checkpoint(p);const w=ensure(p),item={id:M.id('story-plan'),chapterId:M.id('chapter'),title:'',summary:'',turn:'',ending:''};w.items.push(item);w.confirmedOutline='';return item;}
 function set(p,id,key,value,record=true){const w=ensure(p),item=w.items.find(i=>i.id===id);if(!item||!['title','summary','turn','ending'].includes(key))throw Error('This outline could not be found.');if(item[key]===value)return;if(record)checkpoint(p);item[key]=value;w.confirmedOutline='';}
 function remove(p,id){const w=ensure(p),item=w.items.find(i=>i.id===id);if(!item)return;if(p.storyChapters.some(c=>c.id===item.chapterId))throw Error('This chapter has text. Keep the outline and edit it instead.');checkpoint(p);w.items=w.items.filter(x=>x.id!==id);w.confirmedOutline='';}
 function draftOutline(p){const w=ensure(p);if(!lengthConfirmed(p))throw Error('Confirm the story length first.');if(w.items.length)throw Error('Your outline was kept. Edit it or add new chapter outlines.');if(!(p.agent.planning?.synopsis||p.story||'').trim()&&!p.storyChapters.some(c=>c.body.trim()))throw Error('Add a synopsis or chapter text before outlining.');
  let source=p.storyChapters.filter(c=>c.body.trim()),existing=!!source.length;
  if(!existing){if(C.kind(p)==='custom')throw Error('Outline this story manually, or try automatic outlining with a sample story.');const sample=copy(p);sample.storyChapters=[];C.generate(sample,'chapters');source=sample.storyChapters;}
  let chunks;
  if(existing)chunks=source.map(c=>({title:c.title,body:c.body,chapterId:c.id}));
  else if(w.length.chapters===source.length)chunks=source.map(c=>({title:c.title,body:c.body,chapterId:M.id('chapter')}));
  else {let units=source.flatMap(c=>c.body.split(/\n\s*\n/).filter(Boolean).map(body=>({title:c.title,body})));if(units.length<w.length.chapters)units=source.flatMap(c=>(c.body.match(/[^。！？]+[。！？]?/g)||[]).map(body=>({title:c.title,body:body.trim()})));if(units.length<w.length.chapters)throw Error('The sample is too short for this chapter count. Reduce the count or add outlines manually.');chunks=Array.from({length:w.length.chapters},(_,i)=>{const rows=units.slice(Math.floor(i*units.length/w.length.chapters),Math.floor((i+1)*units.length/w.length.chapters));return {title:rows[0].title+' · '+(i+1),body:rows.map(x=>x.body).join('\n\n'),chapterId:M.id('chapter')};});}
  const fixture=!existing&&outlineFixtures[C.kind(p)]?.[w.length.chapters];
  checkpoint(p);w.items=chunks.map((c,i)=>{const [title,summary,turn,ending]=fixture?.[i]||[c.title,c.body.split(/\n\s*\n/)[0],'',''];return {id:M.id('story-plan'),chapterId:c.chapterId,title,summary,turn,ending,...(!existing?{fixtureBody:c.body,fixtureBasis:JSON.stringify([summary,turn,ending])}:{}),origin:existing?'existing':fixture?'preset':'excerpt'};});w.confirmedOutline='';return w.items;
 }
 function manualOutline(p){const w=ensure(p),free=freeWriting(p);if(!free&&!lengthConfirmed(p))throw Error('Confirm the story length first.');if(w.items.length)return;checkpoint(p);const rows=free?(p.storyChapters.length?p.storyChapters:[null]):Array.from({length:w.length.chapters},()=>null);for(const c of rows)w.items.push({id:M.id('story-plan'),chapterId:c?.id||M.id('chapter'),title:c?.title||'',summary:'',turn:'',ending:''});}
 function addManualChapter(p){if(!freeWriting(p))throw Error('Confirm the outline before adding chapter text.');const item=ensure(p).items.find(x=>!p.storyChapters.some(c=>c.id===x.chapterId));if(!item)return C.add(p,'chapters');C.checkpoint(p,'chapters');const c={id:item.chapterId,title:item.title,body:''};p.storyChapters.push(c);p.agent.selectedChapter=c.id;C.ensure(p);return c;}
 function fillOutline(p,onlyId){
  const w=ensure(p),keys=['title','summary','turn','ending'];
  const localFree=freeWriting(p)&&!!onlyId;
  if(!localFree&&!lengthConfirmed(p))throw Error('Confirm the story length first.');
  const targets=w.items.filter(x=>!onlyId||x.id===onlyId);
  if(!targets.length)throw Error('Add a chapter outline first.');
  if(targets.every(x=>keys.every(k=>String(x[k]||'').trim())))return {fields:0,chapters:0,remaining:0};
  const sample=copy(p);sample.storyWriting.items=[];sample.storyWriting.undo=[];sample.storyWriting.confirmedOutline='';
  let proposals=[];if(localFree){proposals=p.storyChapters.filter(c=>c.body.trim()).map(c=>({chapterId:c.id,title:c.title,summary:c.body.split(/\n\s*\n/)[0],turn:'',ending:''}));}else try{proposals=draftOutline(sample);}catch(error){throw Error(error.message);}
  const existing=p.storyChapters.some(c=>c.body.trim()),patches=[];
  for(const item of targets){
   const source=existing?proposals.find(x=>x.chapterId===item.chapterId):(proposals.length===w.items.length?proposals[w.items.indexOf(item)]:null);
   if(!source)continue;
   // Preset narrative may fill blanks, but may not be mixed into a rewritten plot.
   if(!existing&&['summary','turn','ending'].some(k=>String(item[k]||'').trim()&&item[k]!==source[k]))continue;
   const values=Object.fromEntries(keys.filter(k=>!String(item[k]||'').trim()&&String(source[k]||'').trim()).map(k=>[k,source[k]]));
   if(Object.keys(values).length)patches.push({item,source,values});
  }
  if(patches.length){checkpoint(p);for(const {item,source,values} of patches){Object.assign(item,values);if(source.fixtureBody&&['summary','turn','ending'].every(k=>item[k]===source[k])){item.fixtureBody=source.fixtureBody;item.fixtureBasis=source.fixtureBasis;item.origin=source.origin;}else if(existing&&values.summary)item.origin='excerpt';}w.confirmedOutline='';}
  return {fields:patches.reduce((n,x)=>n+Object.keys(x.values).length,0),chapters:patches.length,remaining:targets.filter(x=>keys.some(k=>!String(x[k]||'').trim())).length};
 }
 function ready(p){const w=ensure(p),free=freeWriting(p);if(!free&&!lengthConfirmed(p))return 'Confirm the story length first.';if(!w.items.length)return 'Outline the story before writing.';if(!free&&w.items.length!==w.length.chapters)return `The outline has ${w.items.length} chapters and the target is ${w.length.chapters}. Adjust the target or the number of outlines before confirming.`;if(w.items.some(x=>!x.title.trim()||!x.summary.trim()))return 'Fill in the title and plot of each chapter before confirming the outline.';return '';}
 function confirmOutline(p){const message=ready(p);if(message)throw Error(message);ensure(p).confirmedOutline=sig(p);}
 function canWrite(p){return !ready(p)&&ensure(p).confirmedOutline===sig(p);}
 function prepareChapters(p){if(!canWrite(p))throw Error('Confirm the length and outline before writing.');const w=ensure(p),missing=w.items.filter(i=>!p.storyChapters.some(c=>c.id===i.chapterId));if(!missing.length)return;C.checkpoint(p,'chapters');for(const x of missing)p.storyChapters.push({id:x.chapterId,title:x.title,body:''});C.ensure(p);}
 function generateChapters(p,onlyId){if(!onlyId&&!lengthConfirmed(p))throw Error('Confirm the target length before generating chapter text.');if(!canWrite(p))throw Error('Confirm the length and outline before generating chapter text.');const w=ensure(p),items=w.items.filter(i=>!onlyId||i.chapterId===onlyId).filter(i=>!p.storyChapters.find(c=>c.id===i.chapterId)?.body.trim());if(!items.length)return false;for(const i of items){if(!i.fixtureBody||i.fixtureBasis!==JSON.stringify([i.summary,i.turn,i.ending]))throw Error('Write the chapters manually, or try generation with an unchanged sample outline.');}C.checkpoint(p,'chapters');for(const i of items){let c=p.storyChapters.find(c=>c.id===i.chapterId);if(!c){c={id:i.chapterId,title:i.title,body:''};p.storyChapters.push(c);}c.body=i.fixtureBody;}C.ensure(p);return true;}
 return {presets,ensure,freeWriting,addManualChapter,valid,lengthConfirmed,confirmLength,suggestLength,sig,checkpoint,undo,add,set,remove,draftOutline,manualOutline,fillOutline,ready,confirmOutline,canWrite,prepareChapters,generateChapters};
}
if(typeof module!=='undefined')module.exports=factory;else root.StoryWriting=factory(root.ScriptStudio,root.StoryContent);
})(globalThis);
