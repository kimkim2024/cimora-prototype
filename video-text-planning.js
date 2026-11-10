window.VideoTextPlanning=(()=>{
 const questions={people:'故事里主要是谁？可以说人物特征，不必先取名字。',background:'他们生活在哪里，有怎样的身份或背景？',relation:'人物之间是什么关系，最在意彼此的什么？',events:'你希望发生什么事件？说说开头、转折和结尾。',direction:'方案还想怎样调整？也可以标注题材、观众、画风、世界观或正文。'};
 const fields={'作品名':'title','作品名称':'title','题材':'genre','目标观众':'audience','观众':'audience','画风':'style','背景':'world','世界观':'world','背景世界观':'world','角色描述':'facts','人物关系':'relationship','简介':'synopsis','故事简介':'synopsis'};
 function ensure(w,source={}){
  if(w.textPlanningVersion)return w;
  const settings=source.settings||{};
  for(const key of ['genre','audience','style','world'])w[key]??=source[key]||settings[key]||(key==='world'?settings.core:'')||'';
  w.ideaOriginal??=source.type==='idea'?source.original||source.text||'':'';
  w.dialogueStep=w.ideaOriginal?'people':'direction';
  if(w.ideaOriginal&&!w.chats.length)w.chats.push({role:'user',text:w.ideaOriginal},{role:'assistant',text:'创意原文已保留。'+questions.people});
  w.textPlanningVersion=1;return w;
 }
 function apply(w,text,id){
  text=String(text||'').trim();if(!text)throw Error('先说说你的想法。');
  const ep=w.episodes.find(e=>e.id===w.selectedEpisodeId);w.chats.push({role:'user',text});
  if(/^(交给\s*AI|让\s*AI\s*推荐|帮我推荐|推荐一下)[吧。！!]?$/i.test(text)){recommend(w);w.chats.push({role:'assistant',text:'准备了一份规则建议，请查看并明确采用，也可以继续修改。'});return;}
  const values={};let key=null;
  for(const line of text.split('\n')){const match=line.match(/^(作品名|作品名称|题材|目标观众|观众|画风|背景|世界观|背景世界观|角色描述|人物关系|人物|简介|故事简介|集纲|正文)[：:](.*)$/);if(match){key=match[1];values[key]=match[2];}else if(key)values[key]+='\n'+line;}
  const tagged=Object.keys(values).length>0;
  for(const [name,value]of Object.entries(values)){
   if(fields[name])w[fields[name]]=value;
   if(name==='集纲')ep.outline=value;
   if(name==='正文'){ep.bodyHistory??=[];ep.bodyHistory.push({text:ep.text,confirmed:ep.bodyConfirmed});ep.text=value;ep.bodyConfirmed=false;}
   if(name==='人物'||name==='角色描述'){w.facts=value;for(const row of value.split(/[；;\n]/)){const parts=row.split(/[｜|]/).map(x=>x.trim());if(parts.length>1&&parts[0]){const person=w.characters.find(person=>person.name===parts[0]);if(person){person.background=parts[1]||person.background||'';person.relation=parts[2]||person.relation||'';}else w.characters.push({id:id('vf-person'),name:parts[0],background:parts[1]||'',relation:parts[2]||''});}}if(!w.characters.length&&value.trim())w.characters.push({id:id('vf-person'),name:'主角（待命名）',background:value,pendingName:true});}
  }
  if(tagged){if(values['人物'])w.dialoguePerson=w.characters.at(-1)?.id;const person=w.characters.find(p=>p.id===w.dialoguePerson);if(person&&values['人物关系'])person.relation=values['人物关系'];w.dialogueStep=!(w.facts||w.characters.length)?'people':!w.world?'background':!(w.relationship||w.characters.some(p=>p.relation))?'relation':!ep.outline?'events':'direction';}
  if(!tagged){
   const step=w.dialogueStep||'direction';
   if(step==='name'||step==='people'){w.facts=[w.facts,text].filter(Boolean).join('\n');const named=text.match(/(?:名字是|名叫|叫做|主角叫|主角是)([\u4e00-\u9fffA-Za-z]{1,8})(?=[，,。\s]|$)/);const person={id:id('vf-person'),name:named?.[1]||'主角（待命名）',background:text,pendingName:!named};w.characters.push(person);w.dialoguePerson=person.id;w.dialogueStep='background';}
   else if(step==='background'){w.world=text;const person=w.characters.find(p=>p.id===w.dialoguePerson);if(person)person.background=[person.background,text].filter(Boolean).join('\n');w.dialogueStep='relation';}
   else if(step==='relation'){w.relationship=text;const person=w.characters.find(p=>p.id===w.dialoguePerson);if(person)person.relation=text;w.dialogueStep='events';}
   else if(step==='events'){ep.outline=text;w.dialogueStep='direction';}
   else{w.discussion??=[];w.discussion.push(text);}
  }
  w.planConfirmed=false;
  w.proposals??=[];w.proposals.push({id:id('vf-proposal'),text,fields:values,at:new Date().toISOString()});
  w.chats.push({role:'assistant',text:tagged?'已按你标注的栏目整理；正文与集纲分别保存。'+questions[w.dialogueStep||'direction']:'已记录你的描述。'+questions[w.dialogueStep||'direction']});
 }
 function recommend(w){const seed=[w.ideaOriginal,w.synopsis,w.genre].join(' '),suspense=/悬疑|录音|失踪|谜|侦探/.test(seed),fantasy=/魔法|奇幻|精灵|龙|太空|星际/.test(seed);const romance=/爱情|前女友|前男友|恋爱|重逢|情侣|暗恋/.test(seed);const genre=suspense?'悬疑探索':fantasy?'奇幻冒险':romance?'都市爱情':'人物成长',style=suspense?'克制光影插画':fantasy?'幻想绘本':romance?'细腻情感插画':'生活感插画';const step=w.dialogueStep;let text=`题材：${w.genre||genre}\n观众：${w.audience||'青年观众'}\n画风：${w.style||style}`;if(step==='people'||step==='name')text+='\n人物：主角（待命名）｜从你的创意出发行动的人物，身份待讨论｜与关键同伴的关系待确认';if(step==='background')text+='\n世界观：'+(w.world||'保留创意中已有的地点与时代，未说明部分待你确认');if(step==='relation')text+='\n角色描述：'+(w.facts||'主角待命名')+'\n人物关系：先明确一个共同目标，再讨论分歧。';if(step==='events')text+='\n集纲：围绕原始创意，先确定触发事件，再讨论转折与选择；具体情节待你补充。';w.suggestedDirection={text,basis:'依据当前文字关键词提供的规则建议，可修改或不采用；未调用模型，不是用户原文。'};return w.suggestedDirection;}
 return {ensure,apply,recommend,questions};
})();
