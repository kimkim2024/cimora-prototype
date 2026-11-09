/* 制作状态扩展：图像素材、Video镜头和混合Voice分别记录，All为Local演示。 */
window.createCimoraProductionModel=function(M,S){
  const originalEnsure=M.ensure,originalCreate=M.create,originalPlan=M.plan,originalTick=M.tick;
  const clone=M.clone,uid=p=>S.id(p);
  function ensure(p,ch){
    const e=originalEnsure(p,ch);e.productionType=ch.kind==='episode'?'episode':'chapter';
    e.soundPolicy??='auto';e.musicPolicy??='auto';e.musicAssetId??='';e.productionShots??=[];e.toolCandidates??=[];
    if(!e.productionMigrated){e.graph.edges=e.graph.edges.filter(x=>!(x.from==='voice'&&x.to==='review'));const voice=e.graph.nodes.find(n=>n.id==='voice');if(voice){voice.optional=true;voice.title='Standalone voiceover · optional';}const motion=e.graph.nodes.find(n=>n.id==='motion');if(motion){motion.title='Video with audio';motion.provider='Native audio/video API';}e.productionMigrated=1;}
    return e;
  }
  function context(pid=M.db.activeProject,cid=M.db.activeChapter){const p=S.project(pid)||S.project();if(!p)return null;const ch=[...p.chapters,...(p.episodes||[])].find(ch=>ch.id===cid)||p.chapters[0]||p.episodes?.[0];return {p,c:ch,e:ensure(p,ch)};}
  M.ensure=ensure;M.context=context;
  M.activate=(pid,cid)=>{const c=context(pid,cid);if(c){M.db.activeProject=c.p.id;M.db.activeChapter=c.c.id;M.save();}return c;};
  M.create=v=>{const c=originalCreate(v);c.e=ensure(c.p,c.c);if(v.blank){c.e.boards=[];M.save();}return c;};
  M.resume=p=>context(p.id,[...p.chapters,...(p.episodes||[])].some(ch=>ch.id===p.lastChapterId)?p.lastChapterId:p.chapters[0]?.id||p.episodes?.[0]?.id);
  M.plan=(e,target='all',force=false)=>{if(e.graph.nodes.some(n=>n.id==='motion'))shots(e);const proposal=originalPlan(e,target,force);proposal.ids=proposal.ids.filter(id=>{const n=e.graph.nodes.find(n=>n.id===id);return !n.presentationOnly&&(target===id||!n.optional);});proposal.cost=Math.round(proposal.ids.reduce((sum,id)=>sum+e.graph.nodes.find(n=>n.id===id).cost,0)*100)/100;return proposal;};
  function syncGraph(e){
    for(const [i,s]of e.productionShots.entries()){
      let n=e.graph.nodes.find(n=>n.shotId===s.id);if(!n){n={id:'clip-'+s.id,kind:'motion',shotId:s.id,presentationOnly:true,title:s.title,x:1920+(i%3)*310,y:600+Math.floor(i/3)*245,cost:0,provider:'Shot candidates & adoption',attempts:0};e.graph.nodes.push(n);if(e.graph.nodes.some(n=>n.id==='shots'))e.graph.edges.push({from:'shots',to:n.id});}
      const latest=s.candidates[0],use=s.candidates.find(v=>v.id===s.adoptedId);Object.assign(n,{title:s.title,status:latest?.status==='failed'?'failed':latest?'done':'idle',version:latest?.version||0,adopted:use?.version||0,attempts:s.candidates.length});
    }
    const motion=e.graph.nodes.find(n=>n.id==='motion');if(motion)motion.cost=Math.round(e.productionShots.length*.4*100)/100;
  }
  function shots(e){
    if(!e.shotsInitialized){e.productionShots=e.boards.map((b,i)=>({id:uid('shot'),sourcePanelId:b.id,title:b.title,art:b.art,intent:b.action,dialogue:b.dialogue,duration:Number(b.duration)||5,version:1,candidates:[],adoptedId:null,sourceVersion:b.version,position:i}));e.shotsInitialized=true;M.save();}
    syncGraph(e);return e.productionShots;
  }
  function addEpisode(p,title,sourceChapterIds=[]){
    p.episodes??=[];const source=p.chapters.filter(ch=>sourceChapterIds.includes(ch.id));const ep={id:uid('episode'),title:title||'Ch. '+(p.episodes.length+1)+' episodes',kind:'episode',sourceChapterIds:source.map(ch=>ch.id),status:'To be produced'};p.episodes.push(ep);
    const e=ensure(p,ep);e.graph.nodes=e.graph.nodes.filter(n=>!['final','layout'].includes(n.kind));const ids=new Set(e.graph.nodes.map(n=>n.id));e.graph.edges=e.graph.edges.filter(x=>ids.has(x.from)&&ids.has(x.to));
    for(const [kind,x,y]of [['shots',1300,430],['motion',1610,350]])if(!ids.has(kind)){const d=M.defs[kind];e.graph.nodes.push({id:kind,kind,title:kind==='motion'?'Video with audio':d[0],x,y,status:'idle',version:0,adopted:0,cost:d[3],provider:kind==='motion'?'Native audio/video API':d[4],attempts:0});}
    for(const [from,to]of [['sketch','shots'],['shots','motion'],['cast','motion'],['world','motion'],['prop','motion'],['motion','review']])if(e.graph.nodes.some(n=>n.id===from)&&!e.graph.edges.some(x=>x.from===from&&x.to===to))e.graph.edges.push({from,to});
    if(source.length){e.script=source.map(ch=>ensure(p,ch).script).join('\n\n');e.boards=source.flatMap(ch=>clone(ensure(p,ch).boards).map(b=>({...b,id:uid('episode-panel'),sourcePanelId:b.id,sourceChapterId:ch.id})));e.bindings=Object.assign({},...source.map(ch=>ensure(p,ch).bindings));}else{e.script='';e.boards=[];}e.view='flow';e.stage='motion';M.save();return ep;
  }
  function find(c,id){return shots(c.e).find(s=>s.id===id);}
  function generate(c,id,instruction='',options={}){
    const e=c.e,s=find(c,id);if(!s)return {error:'Shot not found'};
    if(!options.fromBatch&&e.run&&['running','paused'].includes(e.run.status))return {error:'Complete or stop the current production batch first'};
    const cost=options.fail||options.fromBatch?0:0.4;if(e.spent+cost>e.budget+1e-9)return {error:'Exceeds the remaining budget; narrow the scope or adjust the budget'};
    if(instruction&&!s.adoptedId)return {error:'Generate and adopt a version first, then edit the source clip'};
    const failed=options.fail===true,candidate={id:uid('clip'),version:s.candidates.length+1,status:failed?'failed':'ready',mode:instruction?'edit':'generate',createdAt:new Date().toISOString(),model:options.model||e.videoModel||'auto',instruction,input:clone({intent:s.intent,dialogue:s.dialogue,duration:s.duration,art:s.art,constraints:s.constraints||'',shotVersion:s.version,sources:s.sources||[],bindings:e.bindings,soundPolicy:e.soundPolicy,musicPolicy:e.musicPolicy,musicAssetId:e.musicAssetId,sourceCandidate:s.adoptedId}),cost,warning:instruction?'The source has mixed audio; generative edits may change other sounds or the image, so compare before adopting.':'',prototype:true};
    s.candidates.unshift(candidate);e.spent=Math.round((e.spent+cost)*100)/100;syncGraph(e);M.log(e,failed?'Shot generation failed':'Video candidate saved',s.title+' · '+(failed?'Keep the adopted version; retry individually':'v'+candidate.version+' · Example $'+cost.toFixed(2)+' · not auto-adopted'));return {candidate};
  }
  function adopt(c,id,candidateId){const s=find(c,id),item=s?.candidates.find(x=>x.id===candidateId);if(!item||item.status!=='ready')return 'This candidate can’t be adopted';s.adoptedId=item.id;c.e.reviewChecks=[false,false,false];syncGraph(c.e);M.log(c.e,'Adopt shot version',s.title+' · v'+item.version+' · Adjacent shots need manual review');return null;}
  M.tick=e=>{const before=e.graph.nodes.find(n=>n.id==='motion')?.version||0;originalTick(e);const n=e.graph.nodes.find(n=>n.id==='motion');if(n?.version>before){const c=context(e.projectId,e.chapterId);for(const s of shots(e)){const result=generate(c,s.id,'',{fromBatch:true});if(result.candidate){result.candidate.cost=.4;result.candidate.batchId=e.run.id;}}M.save();}};
  function toolTarget(c,kind,id){const source=kind==='shot'?find(c,id):c.e.boards.find(b=>b.id===id);return {projectId:c.p.id,unitId:c.c.id,kind,id,version:source?.version,stage:c.e.stage,view:c.e.view};}
  function applyTool(target,text){if(!S.project(target.projectId))return {error:'Source removed'};const c=context(target.projectId,target.unitId);if(!c||c.c.id!==target.unitId)return {error:'Source removed'};if(c.e.run&&['running','paused'].includes(c.e.run.status))return {error:'Stop the source production batch first'};const source=target.kind==='shot'?find(c,target.id):c.e.boards.find(b=>b.id===target.id);if(!source)return {error:'Source removed'};if(source.version!==target.version)return {error:'The source has changed; regenerate candidates or confirm the new target'};if(target.field==='dialogue')source.dialogue=text;else if(target.field==='continuity')source.continuityNote=text;else if(target.kind==='shot')source.intent=text;else source.action=text;if(target.kind!=='shot')M.change(c.e,'boards','Adopt tool candidate');source.version++;M.log(c.e,'Write the tool result back to the source',source.title+' · v'+source.version+' · Existing candidates and adopted versions kept');return {source};}
  for(const p of S.state.projects){for(const ch of [...p.chapters,...(p.episodes||[])])ensure(p,ch);if(!p.productionCatalogVersion){p.episodes??=[];if(p.id==='rain'&&M.output(p)!=='comic')addEpisode(p,'Episode 01 · Reunion in the Rain',[p.chapters[0].id]);p.productionCatalogVersion=1;}}
  for(const p of S.state.projects){if(p.id!=='rain')continue;for(const [key,name,type,desc]of [['theme','Before the rain stops · Piano theme','Background music','Project theme music reference, usable across episodes; currently a description sample with no audio file.'],['ambience','Old bookstore · rain and doorbell','Ambience','Sound reference for rain, indoor room tone and a doorbell; no audio file at present.']]){const id='production-'+p.id+'-'+key;if(!S.state.assets.some(a=>a.id===id)){S.state.assets.push({id,name,type,desc,art:key==='theme'?8:0,version:1,locked:true,projectId:p.id,chapterIds:[]});p.assetIds??=[];p.assetIds.push(id);}}}
  M.production={shots,find,generate,adopt,addEpisode,toolTarget,applyTool};M.save();return M;
};
