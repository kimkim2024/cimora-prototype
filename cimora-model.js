/* Cimora Local工程模型：Flow、Canvas、资产引用与任务共用这一份数据。 */
window.createCimoraModel=function(S){
  'use strict';
  const state=S.state;
  state.cimora??={version:2,projects:{},wallet:680,purchases:[],ledger:[],favorites:[],publications:[],drafts:[],activeProject:'rain',activeChapter:'ch1'};
  const db=state.cimora;
  for(const k of ['purchases','ledger','favorites','publications','drafts'])db[k]??=[];
  db.projects??={};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const save=()=>S.save();
  const id=p=>S.id(p);
  const examples=[
    ['The old bookstore in the rain','Street corner wide shot','Rain falls on the old bookstore sign, and Lin Xia stops in her tracks.','That bookstore is still where it used to be.',0],
    ['The look of reunion','Character close-up','Lin Xia looks up at the shop window, her fingers tightening around the red scarf.','Seven years on, do you still remember me?',1],
    ['A familiar figure','Medium close shot','Chen Xu turned around from behind the bookshelf, and the doorbell broke the silence.','I thought you would never come back.',2],
    ['The Unsent Letter','Prop close-up','A yellowed envelope lands on the table, its creases holding old worries.','Some words stayed unsent for a very long time.',3],
    ['Under the same umbrella','Two-person medium shot','The two walk under the same umbrella, and the rain turns gentle.','This time, let’s go together.',6],
    ['The answer after the rain','Emotion close-up','Warm light breaks through the clouds and she finally smiles.','All right. Next time, I will be the one waiting.',8]
  ];
  const defs={
    story:['Chapter script','Text','Story',0.02,'Text API'],cast:['Character sheet','◎','Asset',0.12,'Image API'],world:['Scene reference','▧','Asset',0.10,'Image API'],prop:['Props and outfits','◇','Asset',0.06,'Image API'],boards:['Chapter storyboard','▤','Storyboard',0.02,'Text API'],sketch:['Panel sketch','✎','Image',0.18,'Image API'],final:['Webtoon final art','▦','Image',0.32,'Image API'],layout:['Webtoon layout','▥','Layout',0,'Local layout'],shots:['Shot planning','▻','Shot',0.02,'Text API'],voice:['Voiceover & sound','♫','Audio',0.08,'Voice API'],motion:['Motion shot','▷','Video',0.40,'Video API'],review:['Quality review','✓','Review',0,'Rules check'],export:['Delivery version','↗','Delivery',0,'Local compositing']
  };
  function output(p){return p.outputType||'both';}
  function makeGraph(type,blank=false){
    const names=blank?['story']:type==='comic'?['story','cast','world','prop','boards','sketch','final','layout','review','export']:type==='motion'?['story','cast','world','prop','boards','sketch','shots','voice','motion','review','export']:Object.keys(defs);
    const pos={story:[60,250],cast:[370,60],world:[370,300],prop:[370,540],boards:[680,250],sketch:[990,250],final:[1300,80],layout:[1610,80],shots:[1300,430],voice:[1610,650],motion:[1610,350],review:[1940,250],export:[2250,250]};
    const deps={cast:['story'],world:['story'],prop:['story'],boards:['story','cast','world','prop'],sketch:['boards'],final:['sketch'],layout:['final'],shots:['sketch'],voice:['shots'],motion:['shots','cast','world','prop'],review:type==='comic'?['layout']:type==='motion'?['motion']:['layout','motion'],export:['review']};
    if(type!=='comic')deps.review.push('voice');
    const done=['story','cast','world','prop','boards','sketch'];
    return {nodes:names.map(k=>({id:k,kind:k,title:defs[k][0],x:pos[k][0],y:pos[k][1],status:blank?'idle':done.includes(k)?'done':'idle',version:blank?0:done.includes(k)?1:0,adopted:blank?0:done.includes(k)?1:0,cost:defs[k][3],provider:defs[k][4],attempts:0})),edges:names.flatMap(k=>(deps[k]||[]).filter(d=>names.includes(d)).map(d=>({from:d,to:k}))),viewport:{x:25,y:35,zoom:.52}};
  }
  function ensure(p,c){
    db.projects[p.id]??={};
    if(!db.projects[p.id][c.id]){
      const graph=makeGraph(output(p),p.canvasBlank===true);
      db.projects[p.id][c.id]={script:p.text||'Lin Xia returns to the old bookstore she left seven years ago and reunites with Chen Xu. She brings a letter that was never sent.',original:p.text||'',outline:['Reunion in the rain','The Unsent Letter','After the rain stops'],boards:examples.map((b,i)=>({id:'panel-'+(i+1),title:b[0],shot:b[1],action:b[2],dialogue:b[3],art:b[4],version:1,approved:false})),graph,view:p.startView||'flow',stage:'story',events:[],history:[],spent:0,budget:5,concurrency:2,failDemo:false,voiceEnabled:true,run:null,selected:'story',bindings:{},comicGap:20};
      for(const aid of p.assetIds||[]){const a=state.assets.find(a=>a.id===aid);if(a&&(a.projectId===undefined||a.chapterIds?.includes(c.id)))db.projects[p.id][c.id].bindings[aid]=a.version;}
    }
    const e=db.projects[p.id][c.id];
    e.bindings??={};e.history??=[];e.events??=[];e.projectId=p.id;e.chapterId=c.id;
    return e;
  }
  for(const p of state.projects){p.outputType??='both';for(const c of p.chapters)ensure(p,c);}
  for(const a of state.assets){if(a.projectId===undefined)a.projectId=['linxia','chenxu','shop','scarf','letter','voice'].includes(a.id)?'rain':null;if(!a.chapterIds)a.chapterIds=a.id==='letter'?['ch1']:[];}
  function context(pid=db.activeProject,cid=db.activeChapter){const p=S.project(pid)||S.project();if(!p)return null;const c=p.chapters.find(c=>c.id===cid)||p.chapters[0];return {p,c,e:ensure(p,c)};}
  function activate(pid,cid){const ctx=context(pid,cid);if(ctx){db.activeProject=ctx.p.id;db.activeChapter=ctx.c.id;save();}return ctx;}
  function remember(ctx){ctx.p.lastChapterId=ctx.c.id;ctx.p.lastOpenedAt=new Date().toISOString();save();}
  function resume(p){return context(p.id,p.chapters.some(c=>c.id===p.lastChapterId)?p.lastChapterId:p.chapters[0].id);}
  function startFromHome(v,replace=false){
    const text=String(v.text||'').trim();if(!text)return 'empty';
    const previous=db.newDraft,occupied=previous&&(previous.text?.trim()||previous.candidate?.trim()||previous.name?.trim());
    if(occupied&&!replace)return 'draft-exists';
    if(occupied){db.draftBackups??=[];db.draftBackups.unshift({time:new Date().toISOString(),draft:clone(previous)});}
    db.newDraft={name:'',text,source:'idea',output:['comic','motion','both'].includes(v.output)?v.output:'comic',view:v.view==='canvas'?'canvas':'flow',tone:'Gentle and healing',candidate:'',direction:0};save();return null;
  }
  function restoreHomeDraft(index){
    const item=Number.isInteger(index)&&index>=0?db.draftBackups?.[index]:null;if(!item?.draft)return 'missing';
    const restored=clone(item.draft),current=db.newDraft;
    if(current&&(current.text?.trim()||current.candidate?.trim()||current.name?.trim()))db.draftBackups.unshift({time:new Date().toISOString(),draft:clone(current)});
    db.newDraft=restored;save();return null;
  }
  function log(e,text,detail=''){e.events.unshift({id:id('event'),time:new Date().toISOString(),text,detail});e.events=e.events.slice(0,60);save();}
  function create(v){
    const p={id:id('project'),name:v.name?.trim()||'My new story',desc:v.genre||'Original story',text:v.text||'',source:v.source||'idea',mode:v.mode||'studio',outputType:v.output||'comic',startView:v.view||'flow',canvasBlank:v.blank===true,art:6,updated:'Just now',assetIds:[],chapters:[{id:'ch1',title:v.chapter||'The beginning of the story',status:'Story draft',seconds:0}]};
    state.projects.unshift(p);const ctx=activate(p.id,'ch1');ctx.e.original=p.text;for(const n of ctx.e.graph.nodes){if(n.kind==='story'&&!p.canvasBlank){n.status='done';n.version=1;n.adopted=1;}else{n.status='idle';n.version=0;n.adopted=0;}}
    log(ctx.e,'Create project',`${p.outputType} / ${p.startView}`);return ctx;
  }
  function generateStory(input,tone='Gentle and healing',kind='expand'){
    const seed=input.trim()||'A girl returns to the old bookstore on a rainy day and meets an old friend.';
    if(kind==='polish')return `${seed.replace(/[,，]\s*/g,'，').replace(/[。\s]+$/,'')}.\n\n[Polish suggestions]\nState the character's goal at the start of the scene and show hesitation with a single action; leave a brief silence before the key dialogue and let the ending answer the opening image.\n\nThe original plot is kept. The above is a local polish structure example; real sentence-by-sentence polishing requires a text API connection.`;
    if(/星|未来|幻想|魔法/.test(seed))return `【Story start】\n${seed}\n\n[Characters and goal]\nA young postwoman delivers letters to every corner of the starry sea. She receives a letter addressed to herself for the first time, yet the handwriting is exactly her own. She decides to find out who sent it before sunset.\n\n[Chapter one · A letter from tomorrow]\nBefore the end of the day, the white cat at the post office pushes a letter without a postmark toward her. The letter accurately describes small things that have not yet happened that day, and the last line reads: “Tonight, do not let the last mail ship leave the harbor.” She races up to the city rooftops with the letter, searching for the trail of the mail ship.\n\n[Chapter two · A promise before sunset]\nFollowing the clues on the paper, she finds an old lighthouse, but meets only a traveler who has forgotten his name. The traveler knows the white cat, and knows that the post office never receives letters from the future. She must choose between trusting the letter and doing her duty.\n\n[Chapter three · An answer written to myself]\nBefore the mail ship departs, she realizes the letter is not asking her to escape the future, but reminding her not to miss the people in front of her who need help. She writes a new reply and leaves the choice to her tomorrow self. In the distance, the eyes of the white cat reflect another starry sea.\n\n[Tone]${tone}。${tone==='悬疑反转'?'线索分散在邮戳、笔迹和航班时间里，结尾揭开一层真相，同时保留新的疑问。':tone==='奇幻冒险'?'以天台、邮船和星海灯塔展开探索，让环境和Prop参与叙事。':'以送信与回信回应自我成长，用克制的对白保留想象。'}\n\n【Sample dialogue】\n“If this was written by the future me, why doesn't she just tell me the answer?”\n“Maybe some paths can only be chosen by the person you are now.”\n\nLocal preset story direction example; the original description is kept separately and no model was called.`;
    return `【Story start】\n${seed}\n\n【Character goal】\nThe protagonist returns with a wish still unfulfilled; the other person still keeps the place tied to their past. Both want to know whether this reunion can still change anything.\n\n【Chapter 1 · Reunion in the rain】\nEvening rain washes the street grey-blue. The protagonist stops at the old shop door and finds the window display just as remembered. Inside, a greeting delayed far too long cracks the calm of everyday life.\n\n【Chapter 2 · The answer never sent】\nAn object kept for years uncovers a misunderstanding. The other person explains why nothing was said back then, but also raises a new question: are they still willing to move closer to each other now?\n\n【Chapter 3 · Where the story continues】\nAfter the rain stops, the two decide to finish the promise they once set aside. The ending keeps a new clue so the next chapter has room to explore.\n\n【Tone】${tone}. Carry emotion through action and setting instead of explaining everything with narration.\n\n【Sample dialogue】\n“I thought you would never come back.”\n“This time, I want to finish what I have to say.”\n\nThis text is a local sample organized from your input and does not represent real model writing quality.`;
  }
  function descendants(e,nodeId){const out=new Set();function walk(n){for(const x of e.graph.edges.filter(x=>x.from===n)){if(!out.has(x.to)){out.add(x.to);walk(x.to);}}}walk(nodeId);return [...out];}
  function change(e,nodeId,reason){const n=e.graph.nodes.find(n=>n.id===nodeId);if(!n)return [];e.history.unshift({id:id('revision'),node:nodeId,version:n.version,script:e.script,boards:clone(e.boards),time:new Date().toISOString()});n.version++;n.status='done';n.adopted=n.version;const affected=descendants(e,nodeId);for(const k of affected){const child=e.graph.nodes.find(n=>n.id===k);if(child)child.status=child.version?'stale':'idle';}log(e,reason,`Keep the adopted version;${affected.length} downstream steps to update`);return affected;}
  function connect(e,from,to){if(from===to)return 'Cannot connect to itself';if(!e.graph.nodes.some(n=>n.id===from)||!e.graph.nodes.some(n=>n.id===to))return 'Node does not exist';if(e.graph.edges.some(x=>x.from===from&&x.to===to))return 'This link already exists';if(descendants(e,to).includes(from))return 'This link would create a cycle and can’t run';e.graph.edges.push({from,to});log(e,'Add production dependency',`${from} → ${to}`);return null;}
  function plan(e,target='all',force=false){
    const nodes=e.graph.nodes,allowed=new Set();
    function ancestors(k){if(allowed.has(k))return;allowed.add(k);for(const edge of e.graph.edges.filter(x=>x.to===k))ancestors(edge.from);}
    if(target==='all')nodes.forEach(n=>allowed.add(n.id));else ancestors(target);
    const jobs=nodes.filter(n=>allowed.has(n.id)&&(force&&n.id===target||n.status!=='done')).filter(n=>e.voiceEnabled||n.kind!=='voice');
    return {ids:jobs.map(n=>n.id),cost:Math.round(jobs.reduce((s,n)=>s+n.cost,0)*100)/100,remaining:Math.max(0,Math.round((e.budget-e.spent)*100)/100)};
  }
  function begin(e,proposal){
    if(e.run&&['running','paused'].includes(e.run.status))return 'A batch is already in progress';
    if(!proposal.ids.length)return 'The current content is ready, no need to regenerate';
    if(proposal.cost>proposal.remaining+1e-9)return 'Exceeds the remaining budget for this chapter';
    const needsScript=proposal.ids.some(k=>['story','boards'].includes(k));if(needsScript&&e.script.trim().length<5)return 'Write one line of story first, or connect a script input';
    for(const k of proposal.ids){const n=e.graph.nodes.find(n=>n.id===k);n.status='queued';}
    e.run={id:id('run'),status:'running',ids:proposal.ids,estimated:proposal.cost,charged:0,startedAt:new Date().toISOString(),inputs:clone(e.graph.nodes.map(n=>({id:n.id,version:n.version,adopted:n.adopted}))),attempt:1};
    log(e,'Start production batch',`${proposal.ids.length} steps / estimated $${proposal.cost.toFixed(2)} / Concurrency ${e.concurrency}`);return null;
  }
  function tick(e){
    if(e.run?.status!=='running')return;
    const nodes=e.graph.nodes,run=e.run;
    for(const n of nodes.filter(n=>n.status==='running')){
      n.progress=(n.progress||0)+50;
      if(n.progress<100)continue;
      if(e.failDemo&&n.kind==='motion'&&!n.hasFailed){n.status='failed';n.hasFailed=true;log(e,'Video provider timed out',`${n.title} · Keeps the stable camera-motion draft; failed steps can be retried`);continue;}
      n.status='done';n.version++;n.progress=100;n.candidate=n.version;n.attempts++;n.lastInputVersions=clone(n.runningInputs||run.inputs);n.charged=(n.charged||0)+n.cost;e.spent=Math.round((e.spent+n.cost)*100)/100;run.charged=Math.round((run.charged+n.cost)*100)/100;
      if(['story','boards'].includes(n.kind))n.adopted=n.version;
      for(const downstreamId of descendants(e,n.id)){const downstream=nodes.find(k=>k.id===downstreamId);if(downstream&&!run.ids.includes(downstreamId))downstream.status=downstream.version?'stale':'idle';}
      if(['cast','world','prop','voice'].includes(n.kind)){
        const p=S.project(e.projectId),type={cast:'Character',world:'Scene',prop:'Prop',voice:'Voice'}[n.kind];
        if(p){let a=state.assets.find(a=>a.projectId===p.id&&a.generatedBy===n.id&&a.generatedChapter===e.chapterId);
          if(!a){a={id:id('asset'),name:{cast:'Protagonist · Character draft',world:'Chapter scene · lighting reference',prop:'Key prop · continuity reference',voice:'Protagonist · voice parameters'}[n.kind],type,art:{cast:1,world:0,prop:3,voice:8}[n.kind],desc:'From this chapter '+n.title+' a preset example generated by the node; references and constraints need review.',version:1,locked:false,projectId:p.id,chapterIds:[e.chapterId],generatedBy:n.id,generatedChapter:e.chapterId,history:[]};state.assets.push(a);}
          else{a.history??=[];a.history.push({version:a.version,desc:a.desc});a.version++;a.locked=false;}
          p.assetIds??=[];if(!p.assetIds.includes(a.id))p.assetIds.push(a.id);n.outputAssetId=a.id;if(!e.bindings[a.id])e.bindings[a.id]=a.version;
        }
      }
      log(e,'Step complete',`${n.title} v${n.version} · ${n.cost?'sample $'+n.cost.toFixed(2):'Local处理'}${n.adopted===n.version?'':' · 待采用候选'}`);
    }
    const active=nodes.filter(n=>n.status==='running').length;
    const ready=nodes.filter(n=>run.ids.includes(n.id)&&n.status==='queued'&&e.graph.edges.filter(x=>x.to===n.id).every(x=>{const parent=nodes.find(n=>n.id===x.from);return parent?.status==='done'||!e.voiceEnabled&&parent?.kind==='voice';}));
    for(const n of ready.slice(0,Math.max(0,e.concurrency-active))){n.status='running';n.progress=0;n.runningInputs=e.graph.edges.filter(x=>x.to===n.id).map(x=>{const p=nodes.find(n=>n.id===x.from);return {id:p.id,version:p.version,adopted:p.adopted};});}
    if(!nodes.some(n=>run.ids.includes(n.id)&&n.status==='running')){
      if(nodes.some(n=>run.ids.includes(n.id)&&n.status==='failed')){run.status='failed';log(e,'Batch waiting to resume','Successful steps are kept; the failed step and its downstream dependencies are unfinished');}
      else if(!nodes.some(n=>run.ids.includes(n.id)&&n.status==='queued')){run.status='done';log(e,'Batch complete','Candidate saved; adopt it and pass the final review before delivery');}
      else{run.status='blocked';log(e,'Dependencies not satisfied','Check nodes with missing input or manually cancelled');}
    }
    save();
  }
  function adopt(e,nid){const n=e.graph.nodes.find(n=>n.id===nid);if(!n||n.status!=='done')return false;n.adopted=n.version;log(e,'Adopt candidate',`${n.title} v${n.version}`);return true;}
  function addNode(e,kind){const def=defs[kind]||defs.sketch,k=id(kind);e.graph.nodes.push({id:k,kind,title:def[0]+' · Branch',x:800,y:780,status:'idle',version:0,adopted:0,cost:def[3],provider:def[4],attempts:0});save();return k;}
  function purchase(item){if(db.purchases.includes(item.id))return 'Already in your asset library';if(db.wallet<item.price)return 'Not enough available credits';db.wallet-=item.price;db.purchases.push(item.id);db.ledger.unshift({id:id('points'),title:'Buy · '+item.title,delta:-item.price,time:new Date().toISOString()});save();return null;}
  function publish(ctx,title){const pub={id:id('work'),title:title||ctx.p.name,author:'My studio',projectId:ctx.p.id,chapterId:ctx.c.id,art:ctx.p.art,type:output(ctx.p),snapshot:clone({chapter:ctx.c.title,script:ctx.e.script,boards:ctx.e.boards,versions:ctx.e.graph.nodes.map(n=>({id:n.id,version:n.adopted}))}),createdAt:new Date().toISOString(),local:true};db.publications.unshift(pub);save();return pub;}
  save();
  return {db,defs,context,activate,remember,resume,startFromHome,restoreHomeDraft,ensure,create,generateStory,descendants,change,connect,plan,begin,tick,adopt,addNode,purchase,publish,log,save,clone,output};
};
