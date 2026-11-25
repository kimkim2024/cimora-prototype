/* Adapt historical project shapes to the current creation editors; retain source records. */
(function(root){
  'use strict';
  const list=v=>Array.isArray(v)?v:[],copy=v=>JSON.parse(JSON.stringify(v));
  const oldStory=p=>!p.workspaceEditorVersion&&!p.agent?.planning&&p.agent?.phase!=='planning'&&(list(p.outline).length||p.story?.trim()||p.agent&&p.agent.phase!=='idea');
  const oldComic=p=>!p.storyDraftId&&!p.workspaceEditorVersion;
  const oldVideo=p=>!p.migrationSourceKey&&!p.workspaceSourceKey&&(!p.studioKind||p.studioKind==='video');
  const pending=docs=>list(docs.story?.projects).some(oldStory)||list(docs.comic?.projects).some(oldComic)||list(docs.site?.projects).some(oldVideo);
  function upgrade(docs,{M,A,Comic,W}){
    let changed=0;
    const planning=(p,tab)=>{
      A.init(p);p.characters??=[];p.workspacePreviousNavigation??={phase:p.agent.phase,view:p.agent.view,stage:p.stage};
      const split=v=>Array.isArray(v)?v:String(v||'').split(/[、,，]/).filter(Boolean);
      p.agent.planning??={title:p.title,audience:p.settings?.audience||'',genre:split(p.settings?.genre),core:split(p.settings?.core),style:split(p.settings?.style),world:p.facts||'',highlights:'',synopsis:p.story||p.original||''};
      Object.assign(p.agent,{phase:'planning',planningTab:tab,guideScope:tab,guideCollapsed:true});
      p.agent.planningUndo??=[];p.agent.planningRedo??=[];p.workspaceEditorVersion=2;
      return p;
    };
    const link=(oldKey,newKey,raw,extra={})=>{const old=docs.meta.projects[oldKey]||{},prior=docs.meta.projects[newKey]||{};
      const state=[old.state,prior.state].includes('purged')?'purged':[old.state,prior.state].includes('trash')||raw.deletedAt?'trash':raw.archived||old.state==='archived'?'archived':'active';
      docs.meta.projects[newKey]={...old,...prior,...extra,state,workspaceRestoredAt:new Date().toISOString()};delete docs.meta.projects[newKey].workspaceSourceKey;
      docs.meta.projects[oldKey]={...old,state:'redirected',workspaceSourceKey:newKey};};
    // Older story episodes remain untouched as a backup while the current editor uses prose chapters.
    for(const p of list(docs.story.projects))if(oldStory(p)){
      if(!list(p.outline).length&&!p.story?.trim()){A.init(p);p.workspacePreviousNavigation={phase:p.agent.phase,view:p.agent.view,stage:p.stage};p.agent.phase='idea';p.agent.draft||=p.original||'';p.workspaceEditorVersion=2;changed++;continue;}
      p.storyChapters=list(p.storyChapters).length?p.storyChapters:list(p.outline).map(c=>({...copy(c),body:W.text(p,c.id)}));
      if(!p.storyChapters.length&&p.story?.trim())p.storyChapters=[{id:p.id+'-body',title:p.title||'故事正文',body:p.story}];
      const tab=p.stage>=5||Object.keys(p.scripts||{}).length?'chapters':p.stage===3?'characters':p.stage===4?'story-outline':'overview';
      planning(p,tab);p.agent.selectedChapter=p.selectedEpisode||p.storyChapters[0]?.id||'';changed++;
    }
    // Keep the full comic production store, and attach it to the same drafting shell used by new comics.
    for(const raw of list(docs.comic.projects))if(oldComic(raw)){
      const id='comic-sc-workspace-'+raw.id,key='comic:'+id;
      let p=list(docs.comicDraft.projects).find(p=>p.id===id);
      if(p&&p.workspaceProductionId!==raw.id)throw Error('历史漫画与现有草稿标识冲突，原工程已保留。');
      if(!p){p=M.create();p.id=id;p.title=raw.title||'未命名漫画';p.original=raw.original||raw.source?.original||'';p.story=raw.storyPlan?.synopsis||raw.story||'';p.facts=raw.storyPlan?.world||raw.source?.facts||'';p.characters=copy(raw.storyPlan?.characters||raw.source?.characters||raw.characters||[]);
        p.settings={...p.settings,...raw.source?.settings,...raw.settings};
        const episodes=list(raw.storyPlan?.episodes).length?raw.storyPlan.episodes:list(raw.comicEpisodes).length?raw.comicEpisodes:list(raw.source?.outline);
        p.storyChapters=episodes.map((e,i)=>({id:e.id||'chapter-'+i,title:e.title||'第'+(i+1)+'章',summary:e.summary||e.events||'',body:e.body??e.text??(W.text({...raw.source,scripts:raw.source?.scripts||raw.scripts},e.id)||list(raw.bodyPagination?.episodes?.[e.id]?.pages).map(pg=>pg.text||'').join('\n\n'))}));
        planning(p,['overview','characters','arrangement','production'][raw.stage]||'overview');Comic.ensure(p);p.comic.productionId=raw.id;p.comic.style=raw.style||p.comic.style;p.comic.format=raw.format||p.comic.format;p.comic.presetContentReady=true;
        for(const person of p.characters){const asset=list(raw.assets).find(a=>a.storyPersonId===person.id||a.name===person.name);if(asset)p.comic.visuals[person.id]={versions:copy(asset.visualVersions||asset.versions||[]),adoptedId:asset.adoptedVisualId||asset.adoptedId||'',selectedId:asset.adoptedVisualId||'',references:[],appearance:person.appearance||'',clothing:''};}
        p.agent.selectedChapter=raw.activeEpisodeId||p.storyChapters[0]?.id||'';p.workspaceProductionId=raw.id;p.createdAt=raw.createdAt||p.createdAt;p.updatedAt=raw.updatedAt;p.workspaceVisitedAt=raw.workspaceVisitedAt;p.archived=raw.archived;p.deletedAt=raw.deletedAt;docs.comicDraft.projects.push(p);
      }
      raw.storyPlan??={version:1,confirmed:true,synopsis:p.story,characters:copy(p.characters),episodes:p.storyChapters.map(c=>({id:c.id,title:c.title,text:c.body})),messages:[],history:[]};
      raw.source??={scripts:{},outline:[]};raw.source.scripts??={};
      raw.storyDraftId=id;raw.storyDraftSignature=Comic.productionSignature(p);raw.workspaceEditorVersion=2;link('comic:'+raw.id,key,raw);changed++;
    }
    // Earlier video workspaces keep their complete engines, finishing versions and media as recovery records.
    for(const raw of list(docs.site.projects))if(oldVideo(raw)){
      const id='video-sc-workspace-'+raw.id,key='video:'+id,oldKey=(raw.studioKind||'video')+':'+raw.id;
      let p=list(docs.videoDraft.projects).find(p=>p.id===id),bridge={projectId:raw.id,chapters:{},episodes:{}};
      if(p&&p.workspaceNativeId!==raw.id)throw Error('历史视频与现有草稿标识冲突，原工程已保留。');
      if(p)bridge=docs.meta.projects[key]?.legacyBridge||bridge;
      if(!p){p=M.create();p.id=id;p.creationKind='video';p.title=raw.name||'未命名视频';p.original=raw.text||'';p.story=raw.desc||'';p.storyChapters=[];p.video={assets:[],shots:[],ratio:'16:9',quality:'720p',style:'电影感写实'};let lastTab='overview';
        const units=[...list(raw.episodes),...list(raw.chapters)],selectedUnit=raw.lastChapterId||(docs.site.cimora.activeProject===raw.id?docs.site.cimora.activeChapter:'')||units[0]?.id;
        for(const unit of units){
          const engine=docs.site.cimora.projects[raw.id]?.[unit.id]||{},workspace=engine.videoFlow?.workspace,source=engine.videoFlow?.source||{};
          const episodes=list(workspace?.episodes).length?workspace.episodes:[{id:unit.id,title:unit.title,text:engine.script||engine.original||'',outline:unit.summary||''}];
          if(!p.story)p.story=workspace?.synopsis||source.synopsis||'';
          if(!p.characters.length)p.characters=copy(workspace?.characters||source.characters||[]);
          p.video.ratio=engine.videoFlow?.settings?.ratio||p.video.ratio;
          for(const e of episodes){const chapterId=unit.id+'--'+e.id;bridge.chapters[chapterId]=unit.id;bridge.episodes[e.id]=chapterId;p.storyChapters.push({id:chapterId,workspaceHostId:unit.id,workspaceEpisodeId:e.id,title:e.title||unit.title,body:e.text||'',summary:e.outline||''});if(unit.id===selectedUnit&&e.id===(workspace?.selectedEpisodeId||episodes[0].id))p.video.chapter=chapterId;
            const shots=list(engine.productionShots).length?engine.productionShots:list(engine.boards).map(b=>({...b,intent:b.action,candidates:b.comic?.images,adoptedId:b.comic?.adoptedId}));
            for(const shot of shots.filter(s=>(s.episodeId||episodes[0].id)===e.id)){const versions=list(shot.candidates||shot.versions).filter(v=>v.media?.url||/^(data:video\/)|\.(mp4|webm)([?#]|$)/i.test(v.url||'')).map(v=>({...copy(v),url:v.media?.url||v.url,name:v.name||'保留的视频候选'}));p.video.shots.push({id:unit.id+'--'+shot.id,workspaceShotId:shot.id,chapterId,title:shot.title||'',source:shot.source||'',visual:shot.intent||shot.visual||'',dialogue:shot.dialogue||'',framing:shot.framing||shot.shot||'中景',camera:shot.camera||'固定镜头',duration:Number(shot.duration)||6,assetIds:copy(shot.assetIds||[]),versions,adoptedId:versions.some(v=>v.id===shot.adoptedId)?shot.adoptedId:''});}
          }
          for(const asset of list(workspace?.assets)){if(!p.video.assets.some(a=>a.id===asset.id))p.video.assets.push({id:asset.id,name:asset.name,kind:asset.kind==='角色'?'人物':asset.kind||'人物',description:asset.description||asset.stable||asset.role||'',versions:list(asset.candidates||asset.visualVersions||asset.versions).map(v=>({...copy(v),url:v.url||v.images?.main||v.image||'',name:v.name||v.label||'保留的参考图'})),adoptedId:asset.adoptedId||asset.adoptedVisualId||'',selectedVersion:asset.adoptedId||''});}
          if(unit.id===selectedUnit){lastTab=workspace?['overview','overview','assets','storyboard','generation'][workspace.stage||1]||'generation':({story:'chapters',assets:'assets',boards:'storyboard',motion:'generation',audio:'generation',review:'generation'})[engine.navigation?.stage||engine.stage]||'overview';p.video.selectedShot=engine.selectedShotId?unit.id+'--'+engine.selectedShotId:'';}
        }
        for(const a of list(docs.site.assets).filter(a=>a.projectId===raw.id&&['角色','人物','场景','道具'].includes(a.type)))if(!p.video.assets.some(x=>x.id===a.id))p.video.assets.push({id:a.id,name:a.name,kind:a.type==='角色'?'人物':a.type||'人物',description:a.desc||'',versions:a.image?[{id:'retained-'+a.id,url:a.image,name:'保留的参考图'}]:[],adoptedId:a.image?'retained-'+a.id:'',selectedVersion:''});
        planning(p,lastTab);p.agent.selectedChapter=p.video.chapter||p.storyChapters[0]?.id||'';p.workspaceNativeId=raw.id;p.updatedAt=raw.updatedAt;p.workspaceVisitedAt=raw.lastOpenedAt;p.archived=raw.archived;p.deletedAt=raw.deletedAt;docs.videoDraft.projects.push(p);
      }
      raw.workspaceSourceKey=key;link(oldKey,key,raw,{legacyBridge:bridge,recovery:{nativeProjectId:raw.id,changes:[],conflicts:[],retained:true}});changed++;
    }
    docs.meta.workspaceEditorVersion=2;return changed;
  }
  const api={upgrade,pending};if(typeof module!=='undefined')module.exports=api;else root.StudioWorkspaceCompat=api;
})(typeof window==='undefined'?globalThis:window);
