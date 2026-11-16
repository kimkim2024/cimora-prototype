/* 制作状态扩展：图像素材、视频镜头和混合声音分别记录，全部为本机演示。 */
window.createCimoraProductionModel=function(M,S){
  const originalEnsure=M.ensure,originalCreate=M.create,originalPlan=M.plan,originalTick=M.tick;
  const clone=M.clone,uid=p=>S.id(p);
  function ensure(p,ch){
    const e=originalEnsure(p,ch);e.productionType=ch.kind==='episode'?'episode':'chapter';
    e.soundPolicy??='auto';e.musicPolicy??='auto';e.musicAssetId??='';e.productionShots??=[];e.toolCandidates??=[];
    if(!e.productionMigrated){e.graph.edges=e.graph.edges.filter(x=>!(x.from==='voice'&&x.to==='review'));const voice=e.graph.nodes.find(n=>n.id==='voice');if(voice){voice.optional=true;voice.title='独立配音 · 可选';}const motion=e.graph.nodes.find(n=>n.id==='motion');if(motion){motion.title='音画视频';motion.provider='原生音视频 API';}e.productionMigrated=1;}
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
      let n=e.graph.nodes.find(n=>n.shotId===s.id);if(!n){n={id:'clip-'+s.id,kind:'motion',shotId:s.id,presentationOnly:true,title:s.title,x:1920+(i%3)*310,y:600+Math.floor(i/3)*245,cost:0,provider:'镜头候选与采用',attempts:0};e.graph.nodes.push(n);if(e.graph.nodes.some(n=>n.id==='shots'))e.graph.edges.push({from:'shots',to:n.id});}
      const latest=s.candidates[0],use=s.candidates.find(v=>v.id===s.adoptedId);Object.assign(n,{title:s.title,status:latest?.status==='failed'?'failed':latest?'done':'idle',version:latest?.version||0,adopted:use?.version||0,attempts:s.candidates.length});
    }
    const motion=e.graph.nodes.find(n=>n.id==='motion');if(motion)motion.cost=Math.round(e.productionShots.length*.4*100)/100;
  }
  function shots(e){
    if(!e.shotsInitialized){e.productionShots=e.boards.map((b,i)=>({id:uid('shot'),sourcePanelId:b.id,title:b.title,art:b.art,intent:b.action,dialogue:b.dialogue,duration:Number(b.duration)||5,version:1,candidates:[],adoptedId:null,sourceVersion:b.version,position:i}));e.shotsInitialized=true;M.save();}
    syncGraph(e);return e.productionShots;
  }
  function addEpisode(p,title,sourceChapterIds=[]){
    p.episodes??=[];const source=p.chapters.filter(ch=>sourceChapterIds.includes(ch.id));const ep={id:uid('episode'),title:title||'第 '+(p.episodes.length+1)+' 集',kind:'episode',sourceChapterIds:source.map(ch=>ch.id),status:'待制作'};p.episodes.push(ep);
    const e=ensure(p,ep);e.graph.nodes=e.graph.nodes.filter(n=>!['final','layout'].includes(n.kind));const ids=new Set(e.graph.nodes.map(n=>n.id));e.graph.edges=e.graph.edges.filter(x=>ids.has(x.from)&&ids.has(x.to));
    for(const [kind,x,y]of [['shots',1300,430],['motion',1610,350]])if(!ids.has(kind)){const d=M.defs[kind];e.graph.nodes.push({id:kind,kind,title:kind==='motion'?'音画视频':d[0],x,y,status:'idle',version:0,adopted:0,cost:d[3],provider:kind==='motion'?'原生音视频 API':d[4],attempts:0});}
    for(const [from,to]of [['sketch','shots'],['shots','motion'],['cast','motion'],['world','motion'],['prop','motion'],['motion','review']])if(e.graph.nodes.some(n=>n.id===from)&&!e.graph.edges.some(x=>x.from===from&&x.to===to))e.graph.edges.push({from,to});
    if(source.length){e.script=source.map(ch=>ensure(p,ch).script).join('\n\n');e.boards=source.flatMap(ch=>clone(ensure(p,ch).boards).map(b=>({...b,id:uid('episode-panel'),sourcePanelId:b.id,sourceChapterId:ch.id})));e.bindings=Object.assign({},...source.map(ch=>ensure(p,ch).bindings));}else{e.script='';e.boards=[];}e.view='flow';e.stage='motion';M.save();return ep;
  }
  function find(c,id){return shots(c.e).find(s=>s.id===id);}
  function generate(c,id,instruction='',options={}){
    const e=c.e,s=find(c,id);if(!s)return {error:'镜头不存在'};
    if(!options.fromBatch&&e.run&&['running','paused'].includes(e.run.status))return {error:'请先完成或停止当前制作批次'};
    const cost=options.fail||options.fromBatch?0:0.4;if(e.spent+cost>e.budget+1e-9)return {error:'超过剩余预算，请缩小范围或调整预算'};
    if(instruction&&!s.adoptedId)return {error:'先生成并采用一个版本，再修改原片'};
    const failed=options.fail===true,candidate={id:uid('clip'),version:s.candidates.length+1,status:failed?'failed':'ready',mode:instruction?'edit':'generate',createdAt:new Date().toISOString(),model:options.model||e.videoModel||'auto',instruction,input:clone({intent:s.intent,dialogue:s.dialogue,duration:s.duration,art:s.art,constraints:s.constraints||'',shotVersion:s.version,sources:s.sources||[],bindings:e.bindings,soundPolicy:e.soundPolicy,musicPolicy:e.musicPolicy,musicAssetId:e.musicAssetId,sourceCandidate:s.adoptedId}),cost,warning:instruction?'原片为混合声音；生成式修改可能改变其他声音或画面，请对比后采用。':'',prototype:true};
    s.candidates.unshift(candidate);e.spent=Math.round((e.spent+cost)*100)/100;syncGraph(e);M.log(e,failed?'镜头生成失败':'视频候选已保存',s.title+' · '+(failed?'保留已采用版本，可单独重试':'v'+candidate.version+' · 示例 $'+cost.toFixed(2)+' · 未自动采用'));return {candidate};
  }
  function adopt(c,id,candidateId){const s=find(c,id),item=s?.candidates.find(x=>x.id===candidateId);if(!item||item.status!=='ready')return '该候选无法采用';s.adoptedId=item.id;c.e.reviewChecks=[false,false,false];syncGraph(c.e);M.log(c.e,'采用镜头版本',s.title+' · v'+item.version+' · 相邻镜头待人工检查');return null;}
  M.tick=e=>{const before=e.graph.nodes.find(n=>n.id==='motion')?.version||0;originalTick(e);const n=e.graph.nodes.find(n=>n.id==='motion');if(n?.version>before){const c=context(e.projectId,e.chapterId);for(const s of shots(e)){const result=generate(c,s.id,'',{fromBatch:true});if(result.candidate){result.candidate.cost=.4;result.candidate.batchId=e.run.id;}}M.save();}};
  function toolTarget(c,kind,id){const source=kind==='shot'?find(c,id):c.e.boards.find(b=>b.id===id);return {projectId:c.p.id,unitId:c.c.id,kind,id,version:source?.version,stage:c.e.stage,view:c.e.view};}
  function applyTool(target,text){if(!S.project(target.projectId))return {error:'来源已移除'};const c=context(target.projectId,target.unitId);if(!c||c.c.id!==target.unitId)return {error:'来源已移除'};if(c.e.run&&['running','paused'].includes(c.e.run.status))return {error:'请先停止来源的制作批次'};const source=target.kind==='shot'?find(c,target.id):c.e.boards.find(b=>b.id===target.id);if(!source)return {error:'来源已移除'};if(source.version!==target.version)return {error:'来源已有变化，请重新生成候选或确认新的目标'};if(target.field==='dialogue')source.dialogue=text;else if(target.field==='continuity')source.continuityNote=text;else if(target.kind==='shot')source.intent=text;else source.action=text;if(target.kind!=='shot')M.change(c.e,'boards','采用工具候选');source.version++;M.log(c.e,'工具结果回写来源',source.title+' · v'+source.version+' · 既有候选与采用版本保留');return {source};}
  for(const p of S.state.projects){for(const ch of [...p.chapters,...(p.episodes||[])])ensure(p,ch);if(!p.productionCatalogVersion){p.episodes??=[];if(p.id==='rain'&&M.output(p)!=='comic')addEpisode(p,'第 01 集 · 雨中的重逢',[p.chapters[0].id]);p.productionCatalogVersion=1;}}
  for(const p of S.state.projects){if(p.id!=='rain')continue;for(const [key,name,type,desc]of [['theme','雨停之前 · 钢琴主题','背景音乐','项目主题音乐参考，可跨集引用；当前为描述示例，无音频文件。'],['ambience','旧书店 · 雨与门铃','环境声','雨声、室内底噪与门铃的声音参考；当前无音频文件。']]){const id='production-'+p.id+'-'+key;if(!S.state.assets.some(a=>a.id===id)){S.state.assets.push({id,name,type,desc,art:key==='theme'?8:0,version:1,locked:true,projectId:p.id,chapterIds:[]});p.assetIds??=[];p.assetIds.push(id);}}}
  M.production={shots,find,generate,adopt,addEpisode,toolTarget,applyTool};M.save();return M;
};
