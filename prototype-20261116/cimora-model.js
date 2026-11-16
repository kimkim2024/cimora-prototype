/* Cimora 本机工程模型：流程、画布、资产引用与任务共用这一份数据。 */
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
    ['雨中的旧书店','街角远景','雨落在旧书店的招牌上，林夏停下脚步。','那家书店，还在原来的地方。',0],
    ['重逢的目光','人物特写','林夏抬头望向橱窗，手指攥紧红围巾。','七年了，你还记得我吗？',1],
    ['熟悉的身影','中近景','陈序从书架后转身，门铃打断了安静。','我以为，你不会再来了。',2],
    ['未寄出的信','道具特写','泛黄信封落在桌上，褶痕里藏着旧日心事。','有些话，写了很久也没寄出去。',3],
    ['同一把伞下','双人中景','两人走进同一把伞下，雨声变得温柔。','这一次，一起走吧。',6],
    ['雨后的答案','情绪特写','云隙透出暖光，她终于露出一个微笑。','好。下次，换我等你。',8]
  ];
  const defs={
    story:['章节剧本','文','故事',0.02,'文本 API'],cast:['角色设定','◎','资产',0.12,'图像 API'],world:['场景参考','▧','资产',0.10,'图像 API'],prop:['道具与服装','◇','资产',0.06,'图像 API'],boards:['章节分镜','▤','分镜',0.02,'文本 API'],sketch:['分格草图','✎','图像',0.18,'图像 API'],final:['条漫成稿','▦','图像',0.32,'图像 API'],layout:['条漫排版','▥','排版',0,'本机排版'],shots:['镜头规划','▻','镜头',0.02,'文本 API'],voice:['配音与声音','♫','音频',0.08,'语音 API'],motion:['动态镜头','▷','视频',0.40,'视频 API'],review:['质量审查','✓','审查',0,'规则检查'],export:['交付版本','↗','交付',0,'本机合成']
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
      db.projects[p.id][c.id]={script:p.text||'林夏回到阔别七年的旧书店，与陈序重逢。她带来一封一直未寄出的信。',original:p.text||'',outline:['雨中的重逢','未寄出的信','雨停之后'],boards:examples.map((b,i)=>({id:'panel-'+(i+1),title:b[0],shot:b[1],action:b[2],dialogue:b[3],art:b[4],version:1,approved:false})),graph,view:p.startView||'flow',stage:'story',events:[],history:[],spent:0,budget:5,concurrency:2,failDemo:false,voiceEnabled:true,run:null,selected:'story',bindings:{},comicGap:20};
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
    db.newDraft={name:'',text,source:'idea',output:['comic','motion','both'].includes(v.output)?v.output:'comic',view:v.view==='canvas'?'canvas':'flow',tone:'细腻治愈',candidate:'',direction:0};save();return null;
  }
  function restoreHomeDraft(index){
    const item=Number.isInteger(index)&&index>=0?db.draftBackups?.[index]:null;if(!item?.draft)return 'missing';
    const restored=clone(item.draft),current=db.newDraft;
    if(current&&(current.text?.trim()||current.candidate?.trim()||current.name?.trim()))db.draftBackups.unshift({time:new Date().toISOString(),draft:clone(current)});
    db.newDraft=restored;save();return null;
  }
  function log(e,text,detail=''){e.events.unshift({id:id('event'),time:new Date().toISOString(),text,detail});e.events=e.events.slice(0,60);save();}
  function create(v){
    const p={id:id('project'),name:v.name?.trim()||'我的新故事',desc:v.genre||'原创故事',text:v.text||'',source:v.source||'idea',mode:v.mode||'studio',outputType:v.output||'comic',startView:v.view||'flow',canvasBlank:v.blank===true,art:6,updated:'刚刚',assetIds:[],chapters:[{id:'ch1',title:v.chapter||'故事的开始',status:'故事草稿',seconds:0}]};
    state.projects.unshift(p);const ctx=activate(p.id,'ch1');ctx.e.original=p.text;for(const n of ctx.e.graph.nodes){if(n.kind==='story'&&!p.canvasBlank){n.status='done';n.version=1;n.adopted=1;}else{n.status='idle';n.version=0;n.adopted=0;}}
    log(ctx.e,'创建项目',`${p.outputType} / ${p.startView}`);return ctx;
  }
  function generateStory(input,tone='细腻治愈',kind='expand'){
    const seed=input.trim()||'女孩在雨天回到旧书店，遇见曾经的朋友。';
    if(kind==='polish')return `${seed.replace(/[,，]\s*/g,'，').replace(/[。\s]+$/,'')}。\n\n【润色建议】\n把人物的目标放在场景开头，用一个动作表现犹豫；在关键对白前留出短暂的沉默，让结尾回应开场的意象。\n\n原始情节保留。以上为本机润色结构示例，真实逐句润色需要接入文本 API。`;
    if(/星|未来|幻想|魔法/.test(seed))return `【故事起点】\n${seed}\n\n【人物与目标】\n少女邮差负责将信送往星海的各个角落。她第一次收到写给自己的信，笔迹却与自己一模一样。她决定在日落前查明寄信人的身份。\n\n【第一章 · 来自明天的信】\n下班前，邮局的白猫把一封没有邮戳的信推到她面前。信中准确写出了当天尚未发生的小事，最后一句是：“今晚，不要让最后一班邮船离港。”她带着信冲上城市天台，寻找邮船的航迹。\n\n【第二章 · 日落前的约定】\n她循着纸上的线索找到旧灯塔，却只见一位忘记了姓名的旅人。旅人认识那只白猫，也知道邮局从不接收来自未来的信。她必须在相信来信与履行职责之间作出选择。\n\n【第三章 · 写给自己的答案】\n邮船起航前，她发现来信并非要求她逃避未来，而是提醒她不要错过眼前需要帮助的人。她写下新的回信，将选择留给明天的自己。远处，白猫的眼睛映出了另一片星海。\n\n【基调】${tone}。${tone==='悬疑反转'?'线索分散在邮戳、笔迹和航班时间里，结尾揭开一层真相，同时保留新的疑问。':tone==='奇幻冒险'?'以天台、邮船和星海灯塔展开探索，让环境和道具参与叙事。':'以送信与回信回应自我成长，用克制的对白保留想象。'}\n\n【示例对白】\n“如果这是未来的我写的，为什么她不直接告诉我答案？”\n“也许有些路，只有现在的你才能选。”\n\n本机预置故事方向示例；原始描述单独保留，未调用模型。`;
    return `【故事起点】\n${seed}\n\n【人物目标】\n主人公带着一个尚未完成的心愿归来；对方仍守着与过去有关的地方。两个人都想知道，这次重逢是否还能改变什么。\n\n【第一章 · 雨中的重逢】\n傍晚的雨将街道染成灰蓝。主人公在旧店门前停下，发现橱窗里的摆设仍像记忆中一样。推门后，一句迟到了很久的问候，让原本平静的日常出现裂缝。\n\n【第二章 · 没有寄出的答案】\n一件被保存多年的物品揭开误会。对方说出当年没有解释的原因，却也提出一个新的问题：现在的他们，还愿意继续走近彼此吗？\n\n【第三章 · 故事继续的地方】\n雨停后，两人决定共同完成曾经搁置的约定。结尾保留一个新线索，让下一章有继续探索的空间。\n\n【基调】${tone}。以动作和环境承载情绪，避免只靠旁白解释。\n\n【示例对白】\n“我以为，你不会再来了。”\n“这一次，我想把话说完。”\n\n此文本为依据输入组织的本机示例，不代表真实模型扩写质量。`;
  }
  function descendants(e,nodeId){const out=new Set();function walk(n){for(const x of e.graph.edges.filter(x=>x.from===n)){if(!out.has(x.to)){out.add(x.to);walk(x.to);}}}walk(nodeId);return [...out];}
  function change(e,nodeId,reason){const n=e.graph.nodes.find(n=>n.id===nodeId);if(!n)return [];e.history.unshift({id:id('revision'),node:nodeId,version:n.version,script:e.script,boards:clone(e.boards),time:new Date().toISOString()});n.version++;n.status='done';n.adopted=n.version;const affected=descendants(e,nodeId);for(const k of affected){const child=e.graph.nodes.find(n=>n.id===k);if(child)child.status=child.version?'stale':'idle';}log(e,reason,`保留采用版本；${affected.length} 个下游步骤待更新`);return affected;}
  function connect(e,from,to){if(from===to)return '不能连接自身';if(!e.graph.nodes.some(n=>n.id===from)||!e.graph.nodes.some(n=>n.id===to))return '节点不存在';if(e.graph.edges.some(x=>x.from===from&&x.to===to))return '这条关联已经存在';if(descendants(e,to).includes(from))return '该关联会形成循环，无法执行';e.graph.edges.push({from,to});log(e,'新增制作依赖',`${from} → ${to}`);return null;}
  function plan(e,target='all',force=false){
    const nodes=e.graph.nodes,allowed=new Set();
    function ancestors(k){if(allowed.has(k))return;allowed.add(k);for(const edge of e.graph.edges.filter(x=>x.to===k))ancestors(edge.from);}
    if(target==='all')nodes.forEach(n=>allowed.add(n.id));else ancestors(target);
    const jobs=nodes.filter(n=>allowed.has(n.id)&&(force&&n.id===target||n.status!=='done')).filter(n=>e.voiceEnabled||n.kind!=='voice');
    return {ids:jobs.map(n=>n.id),cost:Math.round(jobs.reduce((s,n)=>s+n.cost,0)*100)/100,remaining:Math.max(0,Math.round((e.budget-e.spent)*100)/100)};
  }
  function begin(e,proposal){
    if(e.run&&['running','paused'].includes(e.run.status))return '已有批次正在进行';
    if(!proposal.ids.length)return '当前内容已经就绪，无需重复生成';
    if(proposal.cost>proposal.remaining+1e-9)return '超过本章剩余预算';
    const needsScript=proposal.ids.some(k=>['story','boards'].includes(k));if(needsScript&&e.script.trim().length<5)return '先写一句故事，或连接剧本输入';
    for(const k of proposal.ids){const n=e.graph.nodes.find(n=>n.id===k);n.status='queued';}
    e.run={id:id('run'),status:'running',ids:proposal.ids,estimated:proposal.cost,charged:0,startedAt:new Date().toISOString(),inputs:clone(e.graph.nodes.map(n=>({id:n.id,version:n.version,adopted:n.adopted}))),attempt:1};
    log(e,'启动制作批次',`${proposal.ids.length} 步 / 预计 $${proposal.cost.toFixed(2)} / 并发 ${e.concurrency}`);return null;
  }
  function tick(e){
    if(e.run?.status!=='running')return;
    const nodes=e.graph.nodes,run=e.run;
    for(const n of nodes.filter(n=>n.status==='running')){
      n.progress=(n.progress||0)+50;
      if(n.progress<100)continue;
      if(e.failDemo&&n.kind==='motion'&&!n.hasFailed){n.status='failed';n.hasFailed=true;log(e,'视频供应商超时',`${n.title} · 保留稳定运镜底稿，可重试失败步骤`);continue;}
      n.status='done';n.version++;n.progress=100;n.candidate=n.version;n.attempts++;n.lastInputVersions=clone(n.runningInputs||run.inputs);n.charged=(n.charged||0)+n.cost;e.spent=Math.round((e.spent+n.cost)*100)/100;run.charged=Math.round((run.charged+n.cost)*100)/100;
      if(['story','boards'].includes(n.kind))n.adopted=n.version;
      for(const downstreamId of descendants(e,n.id)){const downstream=nodes.find(k=>k.id===downstreamId);if(downstream&&!run.ids.includes(downstreamId))downstream.status=downstream.version?'stale':'idle';}
      if(['cast','world','prop','voice'].includes(n.kind)){
        const p=S.project(e.projectId),type={cast:'角色',world:'场景',prop:'道具',voice:'声音'}[n.kind];
        if(p){let a=state.assets.find(a=>a.projectId===p.id&&a.generatedBy===n.id&&a.generatedChapter===e.chapterId);
          if(!a){a={id:id('asset'),name:{cast:'主人公 · 角色草案',world:'章节场景 · 光线参考',prop:'关键道具 · 连续性参考',voice:'主人公 · 音色参数'}[n.kind],type,art:{cast:1,world:0,prop:3,voice:8}[n.kind],desc:'由本章 '+n.title+' 节点产生的预置示例，参考与约束待确认。',version:1,locked:false,projectId:p.id,chapterIds:[e.chapterId],generatedBy:n.id,generatedChapter:e.chapterId,history:[]};state.assets.push(a);}
          else{a.history??=[];a.history.push({version:a.version,desc:a.desc});a.version++;a.locked=false;}
          p.assetIds??=[];if(!p.assetIds.includes(a.id))p.assetIds.push(a.id);n.outputAssetId=a.id;if(!e.bindings[a.id])e.bindings[a.id]=a.version;
        }
      }
      log(e,'步骤完成',`${n.title} v${n.version} · ${n.cost?'示例 $'+n.cost.toFixed(2):'本机处理'}${n.adopted===n.version?'':' · 待采用候选'}`);
    }
    const active=nodes.filter(n=>n.status==='running').length;
    const ready=nodes.filter(n=>run.ids.includes(n.id)&&n.status==='queued'&&e.graph.edges.filter(x=>x.to===n.id).every(x=>{const parent=nodes.find(n=>n.id===x.from);return parent?.status==='done'||!e.voiceEnabled&&parent?.kind==='voice';}));
    for(const n of ready.slice(0,Math.max(0,e.concurrency-active))){n.status='running';n.progress=0;n.runningInputs=e.graph.edges.filter(x=>x.to===n.id).map(x=>{const p=nodes.find(n=>n.id===x.from);return {id:p.id,version:p.version,adopted:p.adopted};});}
    if(!nodes.some(n=>run.ids.includes(n.id)&&n.status==='running')){
      if(nodes.some(n=>run.ids.includes(n.id)&&n.status==='failed')){run.status='failed';log(e,'批次等待恢复','成功步骤保留；失败步骤和后续依赖未完成');}
      else if(!nodes.some(n=>run.ids.includes(n.id)&&n.status==='queued')){run.status='done';log(e,'批次完成','候选已保存，需采用并通过最终审查后交付');}
      else{run.status='blocked';log(e,'依赖尚未满足','检查缺失输入或手动取消的节点');}
    }
    save();
  }
  function adopt(e,nid){const n=e.graph.nodes.find(n=>n.id===nid);if(!n||n.status!=='done')return false;n.adopted=n.version;log(e,'采用候选',`${n.title} v${n.version}`);return true;}
  function addNode(e,kind){const def=defs[kind]||defs.sketch,k=id(kind);e.graph.nodes.push({id:k,kind,title:def[0]+' · 分支',x:800,y:780,status:'idle',version:0,adopted:0,cost:def[3],provider:def[4],attempts:0});save();return k;}
  function purchase(item){if(db.purchases.includes(item.id))return '已在你的资源库中';if(db.wallet<item.price)return '可用积分不足';db.wallet-=item.price;db.purchases.push(item.id);db.ledger.unshift({id:id('points'),title:'购买 · '+item.title,delta:-item.price,time:new Date().toISOString()});save();return null;}
  function publish(ctx,title){const pub={id:id('work'),title:title||ctx.p.name,author:'我的工作室',projectId:ctx.p.id,chapterId:ctx.c.id,art:ctx.p.art,type:output(ctx.p),snapshot:clone({chapter:ctx.c.title,script:ctx.e.script,boards:ctx.e.boards,versions:ctx.e.graph.nodes.map(n=>({id:n.id,version:n.adopted}))}),createdAt:new Date().toISOString(),local:true};db.publications.unshift(pub);save();return pub;}
  save();
  return {db,defs,context,activate,remember,resume,startFromHome,restoreHomeDraft,ensure,create,generateStory,descendants,change,connect,plan,begin,tick,adopt,addNode,purchase,publish,log,save,clone,output};
};
