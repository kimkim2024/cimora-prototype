/* One editor identity per project. Former native copies remain recovery backups. */
(function(root){
  'use strict';
  const list=v=>Array.isArray(v)?v:[],clone=v=>JSON.parse(JSON.stringify(v));
  const routeFor=kind=>kind==='story'?'script':kind;
  const tabs={story:{story:'chapters',assets:'characters',boards:'chapters',comic:'chapters',review:'chapters'},comic:{story:'chapters',assets:'characters',boards:'arrangement',comic:'production',review:'production'},video:{story:'chapters',assets:'assets',boards:'storyboard',motion:'generation',audio:'generation',review:'generation'}};
  function source(docs,key){
    const split=key.indexOf(':'),kind=key.slice(0,split),id=key.slice(split+1);
    const stores=kind==='story'?['story']:kind==='comic'?['comicDraft','comic']:['videoDraft'];
    for(const store of stores){const raw=list(docs[store]?.projects).find(p=>p.id===id);if(raw)return {kind,id,key,store,raw};}
    return null;
  }
  function text(raw,id){const ch=list(raw.storyChapters).find(c=>c.id===id),script=raw.scripts?.[id];if(ch)return String(ch.body??ch.text??'');if(typeof script==='string')return script;return script?.fullText??script?.text??list(script?.scenes).map(s=>[s.title,s.time,s.place,s.action||s.beat,s.dialogue,s.mind].filter(Boolean).join('\n')).join('\n\n');}
  function writeBody(raw,id,body){const ch=list(raw.storyChapters).find(c=>c.id===id);if(ch)ch.body=body;else {raw.scripts??={};raw.scripts[id]={...(typeof raw.scripts[id]==='object'?raw.scripts[id]:{}),fullText:body};}}
  function recover(docs){
    const reports=[];
    for(const native of list(docs.site.projects)){
      if(!native.migrationSourceKey||native.workspaceSourceKey)continue;
      const original=source(docs,native.migrationSourceKey);if(!original)continue;
      const meta=docs.meta.projects,entry=meta[original.key]||{},bridge=entry.legacyBridge;if(!bridge||bridge.projectId!==native.id)continue;
      const raw=original.raw,targetKey=original.kind+':'+native.id,target=meta[targetKey]||{},changes=[],conflicts=[];
      // Only body text has a reliable migration baseline. Other differences need review.
      if(native.name!==raw.title)conflicts.push({kind:'title',title:'项目名称'});
      const reverse=Object.fromEntries(Object.entries(bridge.chapters||{}).map(([a,b])=>[b,a]));
      const engines=docs.site.cimora.projects[native.id]||{};
      for(const unit of [...list(native.chapters),...list(native.episodes)]){
        const engine=engines[unit.id];if(!engine)continue;
        const id=reverse[unit.id];
        if(!id){raw.storyChapters??=[];if(!raw.storyChapters.some(c=>c.recoveredFrom===unit.id)){raw.storyChapters.push({id:'recovered-'+unit.id,title:unit.title,summary:unit.summary||'',body:engine.script||'',recoveredFrom:unit.id});changes.push('新增章节：'+unit.title);}continue;}
        const baseline=engine.original??'',edited=engine.script??baseline,current=text(raw,id);
        if(edited!==baseline&&edited!==current){
          if(current===baseline){writeBody(raw,id,edited);changes.push('正文：'+unit.title);}
          else conflicts.push({kind:'body',chapterId:id,nativeChapterId:unit.id,title:unit.title});
        }
        const currentChapter=list(raw.storyChapters).find(c=>c.id===id)||list(raw.outline).find(c=>c.id===id);
        if(currentChapter&&(unit.title!==currentChapter.title||unit.summary&&(unit.summary!==(currentChapter.summary||currentChapter.events||''))))conflicts.push({kind:'outline',chapterId:id,nativeChapterId:unit.id,title:unit.title});
        // Existing image candidates have stable IDs. Add subsequent native candidates without replacing source versions.
        const production=original.store==='comicDraft'?list(docs.comic.projects).find(p=>p.id===raw.comic?.productionId||p.storyDraftId===raw.id):original.kind==='comic'?raw:null;
        for(const board of list(engine.boards)){
          const work=production?.wholePageStudio?.works?.[board.id];if(!work)continue;
          for(const v of list(board.comic?.images))if(!list(work.versions).some(x=>x.id===v.id)&&v.image){work.versions??=[];work.versions.push({...clone(v),recoveredFrom:native.id});changes.push('漫画候选：'+(board.title||board.id));}
          if(board.comic?.adoptedId&&board.comic.adoptedId!==work.adoptedId)conflicts.push({kind:'image',chapterId:id,nativeChapterId:unit.id,pageId:board.id,title:board.title||unit.title});
          if((board.version||1)>1||(board.comic?.revision||1)>1)conflicts.push({kind:'page',nativeChapterId:unit.id,pageId:board.id,title:board.title||unit.title});
        }
        for(const shot of list(engine.productionShots)){
          const currentShot=list(raw.video?.shots).find(s=>s.id===shot.id);if(!currentShot)continue;
          for(const v of list(shot.candidates))if(!list(currentShot.versions).some(x=>x.id===v.id)){currentShot.versions??=[];currentShot.versions.push({...clone(v),url:v.media?.url||v.url,recoveredFrom:native.id});changes.push('视频候选：'+shot.title);}
          if(shot.intent!==(currentShot.visual||currentShot.source||'')||shot.dialogue!==(currentShot.dialogue||'')||(shot.adoptedId||'')!==(currentShot.adoptedId||''))conflicts.push({kind:'shot',chapterId:id,nativeChapterId:unit.id,shotId:shot.id,title:shot.title});
        }
      }
      for(const asset of list(docs.site.assets).filter(a=>a.projectId===native.id))if((asset.version||1)>1||!asset.librarySourceKey&&!list(raw.characters).some(c=>c.name===asset.name))conflicts.push({kind:'asset',assetId:asset.id,title:asset.name});
      // Preserve deletion/archive state. Returning to the source must never resurrect a deleted project.
      const state=[target.state,entry.state].includes('purged')?'purged':[target.state,entry.state].includes('trash')||native.deletedAt||raw.deletedAt?'trash':target.state==='archived'||native.archived?'archived':'active';
      const at=new Date().toISOString();native.workspaceSourceKey=original.key;
      meta[original.key]={...entry,...target,state,legacySource:undefined,resumeUrl:undefined,legacyBridge:bridge,workspaceRestoredAt:at,recovery:{nativeProjectId:native.id,changes:[...new Set(changes)],conflicts}};
      if(state==='trash'){raw.deletedAt=native.deletedAt||target.deletedAt||at;raw.archived=true;}else if(state!=='purged'){delete raw.deletedAt;raw.archived=state==='archived';}
      meta[targetKey]={...target,state:'redirected',workspaceSourceKey:original.key};
      for(const [key,value]of Object.entries(meta))if(key!==original.key&&value.legacyBridge?.projectId===native.id&&!key.endsWith(':'+native.id))meta[key]={...value,state:'redirected',workspaceSourceKey:original.key,workspaceRestoredAt:at};
      reports.push({key:original.key,changes,conflicts});
    }
    return reports;
  }
  function url(project,options={}){
    if(!project)return '/app/projects';
    const raw=project.raw||{},kind=project.kind,params=new URLSearchParams({project:project.id});
    if(project.legacySource){
      const units=[...list(raw.episodes),...list(raw.chapters)],unit=units.find(c=>c.id===(options.chapterId||raw.lastChapterId))||units[0];
      if(kind==='video'&&(unit?.kind==='episode'||project.entries?.length)){const host=project.entries?.find(e=>e.hostId===unit?.id)||project.entries?.[0];params.set('episode',host?.hostId||unit?.id||'');params.set('stage',String(options.stage?({story:1,assets:2,boards:3,motion:3,audio:4,review:4})[options.stage]||1:host?.workspace?.stage||1));return '/app/video?'+params;}
      return project.url||'/app/projects/'+encodeURIComponent(project.id);
    }
    const tab=options.tab||(options.stage?tabs[kind]?.[options.stage]:null)||raw.agent?.planningTab;
    if(raw.agent?.phase==='planning'&&tab)params.set('tab',tab);
    if(options.chapterId)params.set('chapter',options.chapterId);
    if(options.shotId)params.set('shot',options.shotId);
    if(options.pageId)params.set('page',options.pageId);
    if(kind==='comic'&&!project.store&&!raw.agent&&options.tab)params.set('stage',String({chapters:0,characters:1,arrangement:2,production:3}[options.tab]??raw.stage??0));
    return '/app/'+routeFor(kind)+'?'+params;
  }
  function tasks(project){
    const raw=project.raw||{},kind=project.kind,chapters=list(raw.storyChapters).length?raw.storyChapters:list(project.episodes).length?project.episodes:list(raw.outline),units=chapters.length?chapters:[{id:'',title:'项目策划'}];
    const result=[],history=list(raw.workspaceTasks);
    for(const job of history)result.push({key:project.key+':job:'+job.id,projectKey:project.key,p:{id:project.id,name:project.title},ch:{id:job.chapterId||'',title:chapters.find(c=>c.id===job.chapterId)?.title||'项目策划'},n:{id:job.id,title:job.title,status:job.status,provider:job.model||'本机模拟',version:job.status==='done'?1:0,progress:job.progress||0},url:url(project,{tab:job.tab,chapterId:job.chapterId})});
    for(const ch of units){
      const production=project.production||raw,pages=list(production.bodyPagination?.episodes?.[ch.id]?.pages),shots=list(raw.video?.shots).filter(s=>!ch.id||s.chapterId===ch.id);
      const specs=kind==='story'?[['chapters','故事正文',!!text(raw,ch.id)]]:kind==='comic'?[['characters','人物设定',!!raw.characters?.length||!!raw.assets?.length],['arrangement','漫画编排',!!pages.length],['production','生成与编辑',!!pages.length&&pages.every(p=>production.wholePageStudio?.works?.[p.id]?.adoptedId)]]:[['assets','项目资产',!!raw.video?.assets?.length],['storyboard','分镜剧情',!!shots.length],['generation','视频生成',!!shots.length&&shots.every(s=>s.adoptedId)]];
      for(const [tab,title,ready]of specs){if(history.some(j=>j.tab===tab&&j.chapterId===(ch.id||'')))continue;
        result.push({key:project.key+':'+ch.id+':'+tab,projectKey:project.key,p:{id:project.id,name:project.title},ch:{id:ch.id,title:ch.title},n:{id:tab,title,status:ready?'done':'idle',provider:'本机模拟',version:ready?1:0},url:url(project,{tab,chapterId:ch.id})});
      }
    }
    return result;
  }
  const api={source,recover,url,tasks,text,tabs};if(typeof module!=='undefined')module.exports=api;else root.StudioWorkspaceModel=api;
})(typeof window==='undefined'?globalThis:window);
