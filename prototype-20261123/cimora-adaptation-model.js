/* 第01轮：Comic与动画独立，通过固定来源快照关联。无 API 调用。 */
window.createCimoraAdaptationModel=function(M,S){
  const P=M.production,clone=M.clone,oldShots=P.shots;
  const oldEnsure=M.ensure;M.ensure=(p,ch)=>{if(ch.kind!=='episode'&&!M.db.projects[p.id]?.[ch.id]){const output=p.outputType;p.outputType='comic';try{return oldEnsure(p,ch);}finally{p.outputType=output;}}return oldEnsure(p,ch);};
  const snapshot=b=>({title:b.title,action:b.action,dialogue:b.dialogue,art:b.art,shot:b.shot,version:b.version,...(M.comic?.source(b)?{comicSource:M.comic.source(b)}:{})});
  const signature=b=>JSON.stringify(snapshot(b));
  const panel=(c,r)=>{const ch=c.p.chapters.find(x=>x.id===r.chapterId);return ch&&M.ensure(c.p,ch).boards.find(b=>b.id===r.panelId);};
  const ref=(ch,b)=>({chapterId:ch.id,panelId:b.id,version:b.version,snapshot:snapshot(b)});
  function migrate(c){
    for(const s of oldShots(c.e))if(!s.sources){
      const copied=c.e.boards.find(b=>b.id===s.sourcePanelId);
      const chapterId=copied?.sourceChapterId||(c.c.kind==='episode'?c.c.sourceChapterIds?.[0]:c.c.id);
      const panelId=copied?.sourcePanelId||s.sourcePanelId;
      const ch=c.p.chapters.find(x=>x.id===chapterId),b=ch&&M.ensure(c.p,ch).boards.find(x=>x.id===panelId);
      s.sources=chapterId&&panelId?[{...ref({id:chapterId},b||copied||{title:s.title,action:s.intent,dialogue:s.dialogue,art:s.art,version:s.sourceVersion||1}),panelId}]:[];
      // 迁移以当时镜头内容为基线，不能把已更新的来源冒充旧输入。
      if(s.sources.length){const version=s.sourceVersion||copied?.version||b?.version||1;s.sources[0]={...s.sources[0],version,snapshot:{...s.sources[0].snapshot,...(copied?snapshot(copied):{}),version}};}
    }
    if(!c.e.adaptationVersion){for(const s of c.e.productionShots){const copied=c.e.boards.find(b=>b.id===s.sourcePanelId);if(copied&&s.sources?.length===1)s.sources[0].snapshot={...snapshot(copied),version:s.sourceVersion||copied.version};}c.e.adaptationVersion=1;}
    c.e.archivedShots??=[];return c;
  }
  P.shots=e=>{const list=oldShots(e),c=M.context(e.projectId,e.chapterId);if(c)migrate(c);return list;};
  function prepare(c){if(c.c.kind!=='episode')return;const e=c.e;if(e.run&&['running','paused'].includes(e.run.status))return;
    const remove=new Set(e.graph.nodes.filter(n=>['boards','sketch','final','layout'].includes(n.kind)).map(n=>n.id));
    e.graph.nodes=e.graph.nodes.filter(n=>!remove.has(n.id));e.graph.edges=e.graph.edges.filter(x=>!remove.has(x.from)&&!remove.has(x.to));
    if(!e.graph.edges.some(x=>x.from==='story'&&x.to==='shots'))e.graph.edges.push({from:'story',to:'shots'});
    const n=e.graph.nodes.find(n=>n.id==='shots');if(n)n.title='Standalone shot plan';
  }
  function touch(c,text){c.e.reviewChecks=[false,false,false];c.e.planRevision=(c.e.planRevision||0)+1;oldShots(c.e);M.log(c.e,text,'Only the motion plan is updated; the original comic, candidates and previously adopted version are kept');}
  function add(c,values={}){const s={id:S.id('shot'),title:'Transition shot without source',intent:'Describe the story happening here.',dialogue:'',duration:5,art:0,version:1,candidates:[],adoptedId:null,sources:[],...values};P.shots(c.e).push(s);c.e.selectedShotId=s.id;touch(c,'Add standalone shot');return s;}
  function split(c,id){const s=P.find(c,id);if(!s)return;const n=add(c,{title:s.title+' · Second half',intent:s.intent,dialogue:s.dialogue,duration:s.duration,art:s.art,sources:clone(s.sources)});const list=c.e.productionShots;list.splice(list.indexOf(n),1);list.splice(list.indexOf(s)+1,0,n);M.save();return n;}
  function remove(c,id){const list=P.shots(c.e),i=list.findIndex(s=>s.id===id);if(i<0)return;list[i].archivedPosition=i;c.e.archivedShots.push(list[i]);list.splice(i,1);c.e.graph.nodes=c.e.graph.nodes.filter(n=>n.shotId!==id);const ids=new Set(c.e.graph.nodes.map(n=>n.id));c.e.graph.edges=c.e.graph.edges.filter(x=>ids.has(x.from)&&ids.has(x.to));touch(c,'Archive removed shots');}
  function restore(c,id){const i=c.e.archivedShots.findIndex(s=>s.id===id);if(i<0)return;const [s]=c.e.archivedShots.splice(i,1);c.e.productionShots.splice(Math.min(s.archivedPosition,c.e.productionShots.length),0,s);delete s.archivedPosition;touch(c,'Recover archived shots');return s;}
  function merge(c,ids){const ss=P.shots(c.e).filter(s=>ids.includes(s.id));if(ss.length<2)return;const s=ss[0],refs=ss.flatMap(s=>s.sources);s.sources=clone(refs.filter((r,i)=>refs.findIndex(x=>x.chapterId===r.chapterId&&x.panelId===r.panelId)===i));s.intent=ss.map(s=>s.intent).join('\n');s.dialogue=ss.map(s=>s.dialogue).filter(Boolean).join('\n');s.duration=Math.min(30,ss.reduce((n,s)=>n+s.duration,0));s.version++;for(const other of ss.slice(1))remove(c,other.id);touch(c,'Merge panels into one shot');return s;}
  function differences(c,s){return (s.sources||[]).flatMap(r=>{const b=panel(c,r),current=b?signature(b):'missing';return current!==JSON.stringify(r.snapshot)&&r.ignoredSignature!==current?[{ref:r,b,current}]:[];});}
  function resolve(c,id,mode){const s=P.find(c,id);if(!s)return;const changes=differences(c,s);
    if(mode==='detach')s.sources=[];
    else if(mode==='keep')for(const d of changes)d.ref.ignoredSignature=d.current;
    else if(mode==='update'){
      if(changes.some(d=>!d.b))return 'Source removed, keep the adaptation or unlink it';
      for(const r of s.sources){const b=panel(c,r);if(b)Object.assign(r,{snapshot:snapshot(b),version:b.version,ignoredSignature:null});}
      s.intent=s.sources.map(r=>r.snapshot.action).join('\n');s.dialogue=s.sources.map(r=>r.snapshot.dialogue).filter(Boolean).join('\n');s.title=s.sources.map(r=>r.snapshot.title).join(' / ');s.art=s.sources[0]?.snapshot.art??s.art;s.version++;
    }
    touch(c,mode==='update'?'Choose comic sources to sync':mode==='keep'?'Keep the current motion adaptation':'Unlink comic source');return null;
  }
  function bind(c,id,keys){const s=P.find(c,id);s.sources=keys.flatMap(key=>{const [cid,pid]=key.split('|'),ch=c.p.chapters.find(x=>x.id===cid),b=ch&&M.ensure(c.p,ch).boards.find(b=>b.id===pid);return b?[ref(ch,b)]:[];});s.version++;touch(c,'Update the source mapping, keep the shot content');}
  const sentences=text=>String(text||'').split(/[。！？\n]+/).map(x=>x.trim()).filter(Boolean);
  function range(c){const text=c.e.scriptDraft??c.e.script,lines=sentences(text);let plan=c.e.textPlan;
    if(!plan||plan.text!==text){
      // 兼容旧24镜draft：只识别连续匹配的剧本前缀；人工改写但无法证明的范围不自动重做。
      const items=c.c.kind==='episode'?[...P.shots(c.e),...(c.e.archivedShots||[])]:c.e.boards;
      let cursor=0;for(const item of items){const source=item.scriptSource;if(source?.text===text&&Number.isInteger(source.index)&&source.index===cursor){cursor++;continue;}if(!source?.index&&sentences(item.intent??item.action).join('')===lines[cursor])cursor++;else break;}
      plan={text,cursor,legacy:!c.e.textPlan&&cursor>0,changed:!!c.e.textPlan};c.e.textPlan=plan;M.save();
    }
    const remaining=Math.max(0,lines.length-plan.cursor);return {text,lines,total:lines.length,done:plan.cursor,remaining,nextStart:plan.cursor+1,nextEnd:Math.min(lines.length,plan.cursor+24),legacy:plan.legacy,changed:plan.changed};
  }
  function draft(c,expected){const r=range(c);if(!r.total)return 'Write a script first';if(!r.remaining)return 'All of the current text has been organized; nothing was appended twice';if(expected&&(expected.text!==r.text||expected.done!==r.done))return 'Original text or the organizing scope has changed; please reconfirm';
    for(let i=r.done;i<r.nextEnd;i++){const source={text:r.text,index:i,version:c.e.graph.nodes.find(n=>n.kind==='story')?.version||1};if(c.c.kind==='episode')add(c,{title:'Script shot '+(i+1),intent:r.lines[i]+'。',sources:[],scriptSource:source});else c.e.boards.push({id:S.id('panel'),title:'Story panels '+(i+1),action:r.lines[i]+'。',dialogue:'',art:i%6,shot:'Medium shot',version:1,approved:false,prototype:true,scriptSource:source});}
    c.e.textPlan.cursor=r.nextEnd;c.e.script=r.text;delete c.e.scriptDraft;M.save();return null;
  }
  function sourceItems(c){const changed=c.c.kind==='episode'?P.shots(c.e).filter(s=>differences(c,s).length):[],shotIds=new Set(changed.map(s=>s.id));return [...c.e.graph.nodes.filter(n=>n.status==='stale'&&!n.presentationOnly&&!shotIds.has(n.shotId)),...changed.map(s=>({id:'source-'+s.id,shotId:s.id,title:s.title+' · Comic source changed',sourceDifference:true}))];}
  const oldAdd=P.addEpisode;P.addEpisode=(...args)=>{const ep=oldAdd(...args),c=M.context(args[0].id,ep.id);migrate(c);prepare(c);M.save();return ep;};
  function create(v){const base=M.create({...v,output:v.source==='comic'?'comic':v.output});
    if(v.source==='comic'){base.e.script='';base.e.boards=[];base.e.importDraft={status:'pending',files:clone(v.files||[]),note:'Pending parsing: this round only registers the images and entry points; panel splitting, OCR and character recognition haven’t run yet.'};base.e.stage='boards';M.save();return base;}
    if(v.output!=='motion'){base.e.boards=[];base.e.script=v.text||'';base.e.stage='boards';if(!v.blank&&base.e.script.trim())draft(base);M.save();return base;}
    const ep=P.addEpisode(base.p,v.chapter||'Episode 01 · Standalone motion'),c=M.activate(base.p.id,ep.id);
    // 移除仅由此次创建产生的占位Comicchapter，不触碰已有 items目。
    base.p.chapters=[];delete M.db.projects[base.p.id][base.c.id];c.e.script=v.text||'';c.e.stage='boards';c.e.view=v.view||'flow';if(!v.blank&&c.e.script.trim())draft(c);M.save();return c;
  }
  function addChapter(p,title){const ch={id:S.id('chapter'),title,status:'Script draft',seconds:0};p.chapters.push(ch);const e=M.ensure(p,ch);e.script='';e.boards=[];M.save();return M.activate(p.id,ch.id);}
  for(const p of S.state.projects)for(const ep of p.episodes||[]){const c=M.context(p.id,ep.id);migrate(c);prepare(c);}
  const oldGenerate=P.generate;P.generate=(c,...args)=>{const result=oldGenerate(c,...args);if(result.candidate){result.candidate.input.sources=clone(P.find(c,args[0]).sources||[]);M.save();}return result;};
  M.adaptation={create,addChapter,migrate,prepare,add,split,merge,remove,restore,differences,resolve,bind,draft,range,sourceItems,panel,ref};M.save();return M;
};
