/* Project management uses the existing story, comic, video and asset stores. */
(()=>{
  'use strict';
  const C=Cimora,S=Site,L=StudioLibrary,E=S.esc,q=encodeURIComponent,W=window.StudioWorkspaceModel;
  const keys={site:'framein-site-v4',story:'cimora-script-studio-v1',comic:'cimora-comic-studio-v1',comicDraft:'cimora-comic-story-v1',videoDraft:'cimora-video-story-v1',meta:'cimora-studio-library-v1'};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const list=value=>Array.isArray(value)?value:[];
  const labels={story:'Story',comic:'Comic',video:'Video'};
  const stageLabels={准备素材:'Prepare materials',创意对话:'Develop an idea',故事概览:'Story overview',人物设定:'Characters',分集大纲:'Episode outline',正文写作:'Write chapters',内容策划:'Story planning',视觉资产:'Visual assets',漫画编排:'Comic layout',生成与编辑:'Generate and edit',脚本与资产:'Script and assets',镜头方案:'Shot plan',逐格画面:'Panels',排版阅读:'Layout and reading',逐镜制作:'Shot production',剪辑与声音:'Editing and sound',审阅与交付:'Review and delivery',继续创作:'Continue creating',故事梗概:'Overview',人物小传:'Characters',故事大纲:'Outline',故事章节:'Chapters',项目资产:'Assets',分镜剧情:'Storyboard',视频生成:'Video',灵感策划:'Story planning'};
  const assetLabels={故事文本:'Story text',角色:'Character',人物:'Character',场景:'Scene',道具:'Prop',图像:'Image',图片与漫画:'Images and comics',视频与动态:'Video and motion',视频:'Video',声音:'Audio',角色模型:'Character model'};
  const descriptionLabels={从灵感开始整理故事:'Start developing a story from an idea',漫画内容待策划:'Comic planning pending',项目工程:'Project workspace',从灵感开始创作:'Start creating from an idea'};
  const label=(dictionary,value)=>Object.hasOwn(dictionary,value)?dictionary[value]:value;
  function progressLabel(value=''){
    return value.replace(/(\d+)章 \/ 集/g,(_,n)=>`${n} ${n==='1'?'chapter or episode':'chapters or episodes'}`)
      .replace(/已采用 (\d+)镜/g,'$1 adopted').replace(/成稿 (\d+)页/g,'$1 finished').replace(/正文 (\d+\/\d+)/g,'$1 drafted')
      .replace(/(\d+)(章|集|页|镜)/g,(_,n,type)=>`${n} ${{章:'chapter',集:'episode',页:'page',镜:'shot'}[type]}${n==='1'?'':'s'}`);
  }
  const icons={story:'<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6"/>',comic:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 11h18M12 3v8M9 11v10"/>',video:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 6 4-6 4z"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'};
  const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.story}</svg>`;
  const button=(text,action,key='',cls='ghost',extra='')=>`<button type="button" class="cm-button ${cls}" data-pm="${action}" data-key="${E(key)}" ${extra}>${text}</button>`;
  const heading=(title,desc,actions='')=>`<header class="sl-heading"><div><h1>${title}</h1><p>${desc}</p></div><div class="sl-actions">${actions}</div></header>`;
  const empty=(title,desc)=>`<div class="sl-empty"><h2>${title}</h2><p>${desc}</p></div>`;
  let filter={type:'all',search:''},searchTimer,blockedRoute=false;
  function transaction(mutate){
    L.guard();
    const previous=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,localStorage.getItem(key)]));
    const docs={site:clone(S.state),meta:L.meta()};
    for(const name of ['story','comic','comicDraft','videoDraft'])docs[name]=JSON.parse(previous[name]||'{"version":1,"projects":[],"assets":[]}');
    mutate(docs);
    const encoded=Object.fromEntries(Object.entries(docs).map(([name,value])=>[name,name==='site'&&S.serializeState?S.serializeState(value):JSON.stringify(value)]));
    const written=[];
    try{for(const name of Object.keys(keys)){if(previous[name]===null && ['comic','story','comicDraft','videoDraft'].includes(name) && !docs[name].projects.length && !docs[name].assets?.length)continue;if(encoded[name]!==previous[name]){localStorage.setItem(keys[name],encoded[name]);written.push(name);}}}
    catch(error){for(const name of written.reverse()){if(previous[name]===null)localStorage.removeItem(keys[name]);else localStorage.setItem(keys[name],previous[name]);}throw Error('Device storage is full. Export a backup before trying again.');}
    const engine=S.state.cimora;Object.assign(S.state,docs.site);Object.keys(engine).forEach(key=>delete engine[key]);Object.assign(engine,docs.site.cimora);S.state.cimora=engine;
  }
  const find=key=>L.load().projects.find(project=>project.key===key);
  function store(docs,project){return project.legacySource?docs.site:project.store?docs[project.store]:project.kind==='video'?docs.site:docs[project.kind];}
  function rawProject(docs,project){return store(docs,project).projects.find(item=>item.id===project.id);}
  function members(docs,project){return [{raw:rawProject(docs,project),key:project.key},...(project.store==='comicDraft'?docs.comic.projects.filter(p=>p.storyDraftId===project.id).map(raw=>({raw,key:'comic:'+raw.id})):[])];}
  function selectNext(site){const next=site.projects.find(project=>!project.archived&&!project.deletedAt);site.cimora.activeProject=next?.id||'';site.cimora.activeChapter=next?.lastChapterId||next?.chapters?.[0]?.id||next?.episodes?.[0]?.id||'';}
  function setState(key,state){
    const project=find(key);if(!project)throw Error('Project not found. Return to My Projects.');
    transaction(docs=>{for(const {raw,key:memberKey} of members(docs,project)){const old=docs.meta.projects[memberKey]||{};
      if(state==='trash'){if(old.state==='trash')continue;docs.meta.projects[memberKey]={...old,state,deletedAt:new Date().toISOString(),wasArchived:!!raw.archived};raw.deletedAt=docs.meta.projects[memberKey].deletedAt;raw.archived=true;}
      else{docs.meta.projects[memberKey]={...old,state:old.wasArchived?'archived':'active',deletedAt:null};raw.archived=!!old.wasArchived;delete raw.deletedAt;}
    }if(state==='trash'&&(project.legacySource||!project.store&&project.kind==='video')&&docs.site.cimora.activeProject===project.id)selectNext(docs.site);
    });
  }
  function rename(key,name){
    const project=find(key),title=String(name||'').trim();if(!project)throw Error('Project not found');if(!title||title.length>60)throw Error('Enter a project name between 1 and 60 characters.');
    transaction(docs=>{const raw=rawProject(docs,project);if(project.legacySource||project.kind==='video'&&!project.store){raw.name=title;for(const engine of Object.values(docs.site.cimora.projects[project.id]||{}))if(engine.videoFlow?.workspace)engine.videoFlow.workspace.title=title;}else for(const member of members(docs,project)){member.raw.title=title;if(member.raw.agent?.planning)member.raw.agent.planning.title=title;}raw.updatedAt=new Date().toISOString();if(docs.meta.projects[key])delete docs.meta.projects[key].title;});
  }
  function duplicate(key){
    const project=resolve(key);if(!project||!['active','archived'].includes(project.state))throw Error('This project is no longer listed. Refresh and try again.');
    const titles=new Set(L.load().projects.map(p=>p.title)),base=project.title.slice(0,50)+' · Copy';
    let title=base,n=2;while(titles.has(title))title=base+' '+n++;
    let resultKey;
    transaction(docs=>{
      const raw=rawProject(docs,project);if(!raw)throw Error('The project content could not be found. No copy was created.');
      const at=new Date().toISOString(),ids=new Map(),keyMap=new Map();
      const allocate=(id,prefix)=>{if(!ids.has(id))ids.set(id,S.id(prefix));return ids.get(id);};
      const nextId=allocate(raw.id,'project-copy');resultKey=project.kind+':'+nextId;keyMap.set(project.key,resultKey);keyMap.set('comic-story-'+raw.id,'comic-story-'+nextId);
      const children=project.store==='comicDraft'?docs.comic.projects.filter(p=>p.storyDraftId===raw.id||p.id===raw.comic?.productionId):[];
      if(docs.comic.projects.length+children.length+(store(docs,project)===docs.comic?1:0)>30)throw Error('The 30-project comic limit has been reached.');
      for(const child of children){allocate(child.id,'comic-copy');keyMap.set('comic:'+child.id,'comic:'+ids.get(child.id));}
      const record=docs.meta.projects[project.key]||{};
      const nativeId=record.recovery?.nativeProjectId||record.legacyBridge?.projectId||raw.workspaceNativeId;
      const native=nativeId&&nativeId!==raw.id?docs.site.projects.find(p=>p.id===nativeId):null;
      if(native){allocate(native.id,'project-copy');keyMap.set(project.kind+':'+native.id,project.kind+':'+ids.get(native.id));}
      const natives=[...(project.legacySource?[raw]:[]),...(native?[native]:[])];
      const assetIds=new Set(natives.flatMap(p=>list(p.assetIds)));
      for(const p of natives){for(const a of docs.site.assets)if(a.projectId===p.id)assetIds.add(a.id);for(const e of Object.values(docs.site.cimora.projects[p.id]||{}))for(const id of Object.keys(e.bindings||{}))assetIds.add(id);}
      for(const id of assetIds)allocate(id,'asset-copy');
      // Keep chapter, shot and version identities within their independent project scope.
      // Rewrite only references, never prose that happens to match an identifier.
      const refField=/^(id|.*Id|.*Ids|.*Key|.*Keys|bindings|assetIds)$/;
      function remap(value,field=''){
        if(typeof value==='string')return refField.test(field)?keyMap.get(value)||ids.get(value)||value:value;
        if(Array.isArray(value))return value.map(v=>remap(v,field));
        if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[ids.get(k)||keyMap.get(k)||k,remap(v,k)]));
        return value;
      }
      function prepare(value){const copy=remap(value);copy.id=ids.get(value.id);if('name'in copy)copy.name=title;else copy.title=title;
        if(copy.agent?.planning)copy.agent.planning.title=title;
        copy.createdAt=at;copy.updatedAt=at;copy.lastOpenedAt=at;copy.archived=false;delete copy.deletedAt;delete copy.managementExample;
        // Jobs are history, not work to schedule again. Running work belongs to the original.
        if(copy.workspaceTasks)copy.workspaceTasks=copy.workspaceTasks.filter(j=>!['running','queued','pending'].includes(j.status));
        return copy;}
      const copied=prepare(raw);store(docs,project).projects.unshift(copied);
      for(const child of children){const next=prepare(child),model=window.ComicStoryModel;
        if(model&&child.storyDraftSignature===model.productionSignature(raw))next.storyDraftSignature=model.productionSignature(copied);
        docs.comic.projects.unshift(next);
        docs.meta.projects['comic:'+next.id]={state:'active'};
      }
      for(const p of natives){const next=p===raw?copied:prepare(p);if(p!==raw)docs.site.projects.unshift(next);
        docs.site.cimora.projects[next.id]=remap(docs.site.cimora.projects[p.id]||{});
        for(const engine of Object.values(docs.site.cimora.projects[next.id]))if(engine.videoFlow?.workspace)engine.videoFlow.workspace.title=title;
        if(p!==raw)docs.meta.projects[project.kind+':'+next.id]={state:'redirected',workspaceSourceKey:resultKey};
      }
      for(const a of [...docs.site.assets])if(assetIds.has(a.id)){const next=remap(a);next.id=ids.get(a.id);docs.site.assets.push(next);
        const meta=docs.meta.assets['legacy:'+a.id];if(meta)docs.meta.assets['legacy:'+next.id]=clone(meta);
      }
      for(const [assetKey,value] of Object.entries(docs.meta.assets)){const parts=assetKey.split(':');if(!parts.some(part=>ids.has(part)))continue;const next=parts.map(part=>ids.get(part)||part).join(':');if(next!==assetKey)docs.meta.assets[next]=clone(value);}
      const meta=remap(record);delete meta.resumeUrl;delete meta.workspaceSourceKey;delete meta.title;
      // Without a copied recovery engine there must be no route back into the original.
      if(!native){delete meta.legacyBridge;delete meta.recovery;delete copied.workspaceNativeId;delete copied.migrationSourceKey;delete copied.workspaceSourceKey;}
      docs.meta.projects[resultKey]={...meta,state:'active',deletedAt:null,duplicatedAt:at};
    });
    return resultKey;
  }
  function purgeProject(key){
    const index=L.load(),project=index.projects.find(p=>p.key===key);if(!project||project.state!=='trash')throw Error('Only projects in the Recycle Bin can be permanently deleted.');
    transaction(docs=>{
      // Save owned asset records before removing their source project.
      for(const asset of index.assets.filter(asset=>asset.owner===key&&!asset.key.startsWith('legacy:')&&!asset.key.startsWith('story-asset:'))){
        if(!docs.meta.personal.some(item=>item.key===asset.key))docs.meta.personal.push({...clone(asset),owner:null,ownerName:'Original project: '+project.title,usages:asset.usages.filter(use=>use.projectKey!==key),url:'/app/assets?item='+q(asset.key)});
      }
      if(project.legacySource||project.kind==='video'&&!project.store){
        docs.site.projects=docs.site.projects.filter(p=>p.id!==project.id);delete docs.site.cimora.projects[project.id];
        for(const asset of docs.site.assets)if(asset.projectId===project.id){asset.projectId=null;asset.chapterIds=[];}
        if(docs.site.cimora.activeProject===project.id)selectNext(docs.site);
      }else{const db=store(docs,project);db.projects=db.projects.filter(p=>p.id!==project.id);if(db.active===project.id)db.active=db.projects.find(p=>!p.deletedAt)?.id||'';
        if(project.store==='comicDraft'){for(const child of docs.comic.projects.filter(p=>p.storyDraftId===project.id))docs.meta.projects['comic:'+child.id]={state:'purged'};docs.comic.projects=docs.comic.projects.filter(p=>p.storyDraftId!==project.id);if(!docs.comic.projects.some(p=>p.id===docs.comic.active))docs.comic.active=docs.comic.projects.find(p=>!p.deletedAt)?.id||'';}
      }
      docs.meta.projects[key]={state:'purged',deletedAt:new Date().toISOString()};
      for(const asset of docs.meta.personal)asset.usages=(asset.usages||[]).filter(use=>use.projectKey!==key);
    });
  }
  function purgeAsset(key){
    const asset=L.findAsset(key);if(!asset||asset.state!=='trash')throw Error('Only assets in the Recycle Bin can be permanently deleted.');
    transaction(docs=>{
      if(key.startsWith('legacy:')){docs.site.assets=docs.site.assets.filter(a=>a.id!==asset.id);for(const project of docs.site.projects)project.assetIds=(project.assetIds||[]).filter(id=>id!==asset.id);for(const chapters of Object.values(docs.site.cimora.projects))for(const engine of Object.values(chapters))if(engine.bindings)delete engine.bindings[asset.id];}
      if(key.startsWith('story-asset:'))docs.story.assets=docs.story.assets.filter(a=>a.assetId!==asset.id);
      // Adopted content is an independent project version; removing a library item must not erase it.
      docs.meta.personal=docs.meta.personal.filter(a=>a.key!==key);
      docs.meta.assets[key]={state:'purged',deletedAt:new Date().toISOString()};
    });
  }
  function chapterText(project,chapter){
    const raw=project.raw||{},script=raw.scripts?.[chapter.id]||raw.source?.scripts?.[chapter.id],videoScript=raw.video?.script||raw.video?.story;
    // An intentionally empty chapter must stay empty, rather than inherit another chapter's story.
    const text=chapter.body??chapter.text??(typeof script==='string'?script:script?.fullText??script?.text??script?.content);
    if(typeof text==='string')return text;
    const scenes=script?.scenes||chapter.scenes||[];
    const sceneText=list(scenes).map(scene=>[scene.title,scene.time,scene.place,scene.action||scene.beat,scene.dialogue,scene.mind].filter(Boolean).join('\n')).filter(Boolean).join('\n\n');
    return sceneText||String(chapter.summary||chapter.events||chapter.outline||(!chapter.id&&(raw.story||raw.original||raw.synopsis||videoScript))||'');
  }
  function legacyStage(project){
    const raw=project.raw||{},tab=raw.agent?.planningTab,stage=Number(raw.stage||raw.video?.stage||raw.workspace?.stage||1);
    if(project.kind==='video')return tab?({assets:'assets',storyboard:'boards',generation:'motion'})[tab]||'story':stage>=4?'audio':stage>=3?'motion':stage===2?'assets':'story';
    if(project.kind==='comic'){
      if(tab)return ({overview:'story','story-outline':'story',chapters:'story',characters:'assets',assets:'assets',arrangement:'boards',production:'comic'})[tab]||'story';
      return stage>=3?'comic':stage>=2?'boards':stage>=1?'assets':'story';
    }
    return 'story';
  }
  function chapterRecords(project){
    const raw=project.raw||{},items=list(project.episodes).length?list(project.episodes):list(raw.storyChapters).length?list(raw.storyChapters):list(raw.outline);
    return (items.length?items:[{title:'项目开始'}]).map((item,index)=>({sourceId:String(item.id||'chapter-'+index),title:item.title||item.name||`第${index+1}章`,summary:item.summary||item.events||'',text:chapterText(project,item)}));
  }
  function legacyProjectUrl(project){
    const meta=L.meta(),saved=meta.projects?.[project.key],bridge=saved?.legacyBridge;
    let id=bridge?.projectId||(!project.store&&(project.legacySource||project.kind==='video')?project.id:'');
    const legacy=id&&(S.project?S.project(id):S.state.projects.find(item=>item.id===id));if(!legacy)return null;
    const chapters=[...list(legacy.chapters),...list(legacy.episodes)];
    const chapterId=chapters.find(ch=>ch.id===legacy.lastChapterId)?.id||chapters[0]?.id;
    if(!chapterId)return null;
    const engine=S.state.cimora.projects?.[id]?.[chapterId]||{},stage=engine.navigation?.stage||engine.stage||'story',view=engine.navigation?.view||engine.view||'flow';
    const params=new URLSearchParams({stage,view});
    if(engine.importDraft)params.set('import',engine.navigation?.import||'pages');
    if(engine.navigation?.panelId)params.set('panel',engine.navigation.panelId);
    if(engine.selectedShotId)params.set('shot',engine.selectedShotId);
    return `/app/create/${q(id)}/${q(chapterId)}?${params}`;
  }
  function nativeEngine(project,chapter,stage){
    const graph=C.M.makeGraph(project.outputType);
    for(const node of graph.nodes)Object.assign(node,{status:'idle',version:0,adopted:0});
    if(project.studioKind==='story'){graph.nodes=graph.nodes.filter(n=>n.id==='story');graph.edges=[];}
    return {projectId:project.id,chapterId:chapter.id,original:chapter.text,script:chapter.text,outline:[],boards:[],graph,view:'flow',stage,events:[],history:[],spent:0,budget:5,concurrency:2,failDemo:false,voiceEnabled:true,run:null,selected:'story',bindings:{},comicGap:20,productionShots:[],shotsInitialized:true,toolCandidates:[],soundPolicy:'auto',musicPolicy:'auto',musicAssetId:''};
  }
  function stageMigration(docs,project,index){
    const raw=project.raw,source=chapterRecords(project),sourceIds=Object.fromEntries(source.map(item=>[item.sourceId,S.id('legacy-chapter')])),id=S.id('legacy-project'),stage=legacyStage(project),isVideo=project.kind==='video';
    const child=project.store==='comicDraft'?docs.comic.projects.find(p=>p.id===raw.comic?.productionId||p.storyDraftId===project.id):null,production=child||raw;
    const legacy={id,studioKind:project.kind,name:project.title||'未命名项目',desc:project.description||'',text:raw.original||raw.story||source[0].text,source:'studio-migration',mode:'studio',outputType:isVideo?'motion':'comic',startView:'flow',art:6,updated:'刚刚',updatedAt:project.updated,assetIds:[],lastChapterId:sourceIds[source[0].sourceId],chapters:[],episodes:[],productionCatalogVersion:1,archived:project.state==='archived',migrationSourceKey:project.key};
    const selected=raw.video?.chapter||raw.agent?.selectedChapter||raw.lastChapterId||raw.activeChapterId||raw.activeEpisodeId||raw.selectedEpisodeId||production.activeEpisodeId;
    if(sourceIds[selected])legacy.lastChapterId=sourceIds[selected];
    const assetMap={},assets=index.assets.filter(a=>a.owner===project.key&&!['声音','故事文本','角色模型'].includes(a.type));
    for(const person of list(raw.characters))if(!assets.some(a=>a.id===person.id))assets.push({id:person.id,key:project.key+':person:'+person.id,name:person.name,type:'角色',description:[person.identity,person.background,person.appearance].filter(Boolean).join('\n'),raw:person});
    for(const asset of assets){
      if(assetMap[asset.id])continue;
      const assetId=S.id('legacy-asset');assetMap[asset.id]=assetId;
      docs.site.assets.push({id:assetId,name:asset.name,type:asset.type,desc:asset.description||'',storyProfile:clone(asset.raw?.storyProfile||{}),version:1,locked:!!asset.version,projectId:id,chapterIds:[],history:[],art:asset.image||6,image:asset.image||'',librarySourceKey:index.assets.some(a=>a.key===asset.key)?asset.key:undefined});legacy.assetIds.push(assetId);
    }
    const engines={};
    for(const item of source){
      const chapter={id:sourceIds[item.sourceId],title:item.title,summary:item.summary,status:item.text?'故事草稿':'待整理',seconds:0,...(isVideo?{kind:'episode',sourceChapterIds:[]}:{})};
      (isVideo?legacy.episodes:legacy.chapters).push(chapter);
      const engine=nativeEngine(legacy,{...chapter,text:item.text},stage);engines[chapter.id]=engine;
      engine.bindings=Object.fromEntries(legacy.assetIds.map(id=>[id,1]));engine.outline=source.map(c=>c.title);
      const done=ids=>{for(const n of engine.graph.nodes)if(ids.includes(n.id))Object.assign(n,{status:'done',version:1,adopted:1});};
      if(item.text.trim())done(['story']);
      for(const [type,node] of [['角色','cast'],['场景','world'],['道具','prop']])if(assets.some(a=>a.type===type&&a.version))done([node]);
      if(isVideo){
        engine.productionShots=list(raw.video?.shots).filter(s=>s.chapterId===item.sourceId||!s.chapterId&&source.length===1).map((s,i)=>{
          const shot={...clone(s),title:s.title||`镜头 ${i+1}`,intent:s.visual||s.source||'',dialogue:s.dialogue||'',duration:Number(s.duration)||5,version:1,sources:[],art:assets.find(a=>s.assetIds?.includes(a.id))?.image||6,assetIds:list(s.assetIds).map(id=>assetMap[id]).filter(Boolean)};
          shot.candidates=list(s.versions).map((v,i)=>({...clone(v),version:i+1,status:'ready',cost:0,input:{intent:shot.intent,dialogue:shot.dialogue,art:shot.art,shotVersion:1},media:v.url?{kind:'video',url:v.url}:undefined}));
          return shot;
        });
        engine.selectedShotId=engine.productionShots.find(s=>s.id===raw.video?.selectedShot)?.id||engine.productionShots[0]?.id;
        if(engine.productionShots.length)done(['shots']);
        if(engine.productionShots.length&&engine.productionShots.every(s=>s.adoptedId))done(['motion']);
      }else{
        const pages=list(production.bodyPagination?.episodes?.[item.sourceId]?.pages);
        engine.boards=pages.map((page,i)=>{
          const work=production.wholePageStudio?.works?.[page.id]||{},input={action:page.text||'',shot:page.direction||'整页',cast:[],scene:null,outfit:''};
          // Large source snapshots and signatures stay in the untouched source store.
          const images=list(work.versions).map((v,i)=>({id:v.id,image:StudioLibraryModel.imageOf(v.image,true),version:i+1,status:'ready',createdAt:v.createdAt,input:clone(input),migrationSource:{projectKey:'comic:'+production.id,chapterId:item.sourceId,pageId:page.id,versionId:v.id}}));
          return {id:page.id,title:page.title||`第 ${i+1} 页`,action:page.text||'',dialogue:'',shot:'整页',art:images.find(v=>v.id===work.adoptedId)?.image||6,version:1,approved:!!work.adoptedId,comic:{revision:1,cast:[],scene:null,outfit:'',text:{speakerId:'',speakerName:'未指定',dialogue:'',narration:'',sfx:''},images,adoptedId:work.adoptedId||null}};
        });
        if(engine.boards.length)done(['boards']);
        if(engine.boards.length&&engine.boards.every(b=>b.comic.adoptedId))done(['sketch','final']);
      }
      engine.navigation={stage,view:'flow',shotId:engine.selectedShotId};
    }
    docs.site.projects.push(legacy);docs.site.cimora.projects[id]=engines;
    const bridge={projectId:id,chapters:sourceIds,migratedAt:new Date().toISOString()};
    for(const key of [project.key,...(child?['comic:'+child.id]:[])])docs.meta.projects[key]={...(docs.meta.projects[key]||{}),state:'migrated',legacyBridge:bridge};
    docs.meta.projects[project.kind+':'+id]={state:project.state,legacySource:true};
    return id;
  }
  function migrateToLegacy(project){
    if(!project)throw Error('Project not found. Return to My Projects.');
    const meta=L.meta(),bridge=meta.projects[project.key]?.legacyBridge;
    if(['trash','purged'].includes(project.state)||bridge&&!S.state.projects.some(p=>p.id===bridge.projectId&&!p.deletedAt))throw Error('Restore this project from the Recycle Bin to continue.');
    const ready=legacyProjectUrl(project);if(ready)return ready;
    if(!project.store&&project.kind==='video')throw Error('The original project could not be found. Check your local data and try again.');
    const index=L.load();transaction(docs=>stageMigration(docs,project,index));
    return legacyProjectUrl(project);
  }
  function migrateAll(){
    const index=L.load(),pending=index.projects.filter(p=>['active','archived'].includes(p.state)&&!legacyProjectUrl(p)&&!(p.legacySource||p.kind==='video'&&!p.store));
    if(pending.length)transaction(docs=>{for(const project of pending)stageMigration(docs,project,index);});
    return pending.length;
  }
  function resume(project){
    return W?W.url(project):legacyProjectUrl(project)||project.url;
  }
  function restoreWorkspaces(){
    const compat=window.StudioWorkspaceCompat,meta=L.meta();
    const needsCompatibility=compat&&(meta.workspaceEditorVersion!==2||compat.pending({site:S.state,story:JSON.parse(localStorage.getItem(keys.story)||'{}'),comic:JSON.parse(localStorage.getItem(keys.comic)||'{}')}));
    if(!W||!(needsCompatibility||S.state.projects.some(p=>p.migrationSourceKey&&!p.workspaceSourceKey&&meta.projects[p.migrationSourceKey]?.legacyBridge?.projectId===p.id)))return [];
    let report=[];transaction(docs=>{report=W.recover(docs);if(compat)compat.upgrade(docs,{M:window.ScriptStudio,A:window.StoryAgent,Comic:window.ComicStoryModel,W});});return report;
  }
  function canonicalKey(key,meta=L.meta()){const seen=new Set();while(meta.projects[key]?.workspaceSourceKey&&!seen.has(key)){seen.add(key);key=meta.projects[key].workspaceSourceKey;}return key;}
  function resolve(key){
    const current=canonicalKey(key);
    return L.load().projects.find(p=>p.key===current);
  }
  function recovery(key){
    const project=resolve(key),record=project&&L.meta().projects[project.key]?.recovery;
    if(!project||!record)throw Error('There are no retained edits to view.');
    const native=S.state.projects.find(p=>p.id===record.nativeProjectId),engines=S.state.cimora.projects[record.nativeProjectId]||{};
    return {project,record,native,engines};
  }
  function showRecovery(key){
    const {project,record,native,engines}=recovery(key),labels={body:'Story text',title:'Project name',outline:'Chapter details',image:'Selected image',page:'Comic page',shot:'Video shot',asset:'Asset'};
    const entries=record.conflicts.map(item=>{const engine=engines[item.nativeChapterId]||{},current=item.kind==='body'?W.text(project.raw,item.chapterId):item.kind==='title'?project.title:'',saved=item.kind==='body'?engine.script:item.kind==='title'?native.name:JSON.stringify(item.kind==='asset'?S.state.assets.find(a=>a.id===item.assetId):item.kind==='shot'?engine.productionShots?.find(s=>s.id===item.shotId):item.kind==='outline'?[...list(native.chapters),...list(native.episodes)].find(c=>c.id===item.nativeChapterId):engine.boards?.find(b=>b.id===item.pageId),null,2);
      return `<details><summary>${E(labels[item.kind]||'Edit')} · ${E(item.title)}</summary>${current?`<h3>Current draft</h3><pre class="pm-recovery-text">${E(current)}</pre>`:''}<h3>Retained edit</h3><pre class="pm-recovery-text">${E(saved||'The recovery backup contains the full content.')}</pre></details>`;}).join('');
    S.modal((record.conflicts.length?'Retained edits · ':'Original project backup · ')+project.title,`<p>${record.conflicts.length?'These edits differ from your current draft. View or copy them below, or download the full recovery backup.':'The backup includes the original project, shot candidates, and assembled versions.'}</p>${entries}`,button('Download recovery backup','recovery-download',project.key),true);
  }
  function cover(project,index){const asset=index.assets.find(asset=>asset.owner===project.key&&asset.image&&asset.state==='active');return asset?`<img src="${E(asset.image)}" alt="" loading="lazy">`:`<span class="pm-cover-symbol">${icon(project.kind)}</span>`;}
  function card(project,index){return `<article class="pm-card"><a class="pm-card-link" href="#${E(resume(project))}" data-pm-open="${E(project.key)}" aria-label="Resume ${E(project.title)}"><div class="pm-card-topline"><span class="pm-kind">${labels[project.kind]}</span></div><div class="pm-picture ${project.kind}">${cover(project,index)}</div><div class="pm-copy"><h2>${E(project.title)}</h2><strong>${E(progressLabel(project.progress))}</strong><div class="pm-card-meta"><span>Last opened at ${E(label(stageLabels,project.stage))}</span><small>${project.state==='archived'?'Archived':project.related.length?project.related.length+' linked '+(project.related.length===1?'project':'projects'):'Standalone project'}</small></div></div></a><button type="button" class="pm-menu-trigger" data-pm="menu" data-key="${E(project.key)}" aria-label="Actions for ${E(project.title)}" aria-expanded="false" aria-haspopup="menu">${icon('more')}</button><div class="pm-menu" data-pm-menu="${E(project.key)}" role="menu" hidden>${button('Rename','rename',project.key,'','role="menuitem"')}${button('Duplicate','duplicate',project.key,'','role="menuitem"')}${button('Share project','share',project.key,'','role="menuitem"')}${button('Export project','export',project.key,'','role="menuitem"')}${button('Delete project','trash',project.key,'pm-delete','role="menuitem"')}</div>${(index.meta.projects[project.key]?.recovery?.conflicts?.length||index.meta.projects[project.key]?.recovery?.retained)?`<div class="pm-recovery">${button(index.meta.projects[project.key]?.recovery?.conflicts?.length?'View retained edits':'View original project backup','recovery',project.key)}</div>`:''}</article>`;}
  function projectList(index){const list=index.projects.filter(project=>['active','archived'].includes(project.state)&&(filter.type==='all'||project.kind===filter.type)&&[project.title,project.description].join(' ').toLowerCase().includes(filter.search.toLowerCase())).sort((a,b)=>String(index.meta.projects[b.key]?.duplicatedAt||'').localeCompare(String(index.meta.projects[a.key]?.duplicatedAt||'')));return `<p class="sl-count" role="status">${list.length} ${list.length===1?'project':'projects'}</p><div class="pm-grid">${list.map(p=>card(p,index)).join('')||empty(filter.search?'No matching projects':'No projects yet',filter.search?'Try a different name or keyword.':'Start with a story, comic, or video.')}</div>`;}
  function projects(ctx){
    const index=L.load();filter={type:ctx.params.get('projectType')||'all',search:ctx.params.get('projectSearch')||''};
    return `<div class="sl-page pm-page">${heading('My Projects','Find your projects and pick up where you left off.',button('＋ Create project','create','','primary'))}<div class="sl-toolbar"><div class="sl-tabs" role="group" aria-label="Project type">${[['all','All'],['story','Story'],['comic','Comic'],['video','Video']].map(([key,label])=>button(label,'filter',key,filter.type===key?'selected':'ghost',`aria-pressed="${filter.type===key}"`)).join('')}</div>${CimoraSearchField.render(`<input data-pm-search aria-label="Search projects" placeholder="Search project names or content" value="${E(filter.search)}">`, "sl-search")}</div><div id="pm-project-list">${projectList(index)}</div></div>`;
  }
  function date(value){return value?new Date(value).toLocaleString('en-US'):'Earlier';}
  function trash(){
    const index=L.load(),projects=index.projects.filter(p=>p.state==='trash'),assets=index.assets.filter(a=>a.state==='trash');
    const rows=(items,kind)=>items.map(item=>`<article class="pm-trash-row"><div><strong>${E(item.title||item.name)}</strong><small>${E(kind==='project'?labels[item.kind]:label(assetLabels,item.type))} · ${E(date((kind==='project'?index.meta.projects[item.key]:index.meta.assets[item.key])?.deletedAt||item.raw?.deletedAt))}</small></div><div>${button('Restore',kind==='project'?'restore':'restore-asset',item.key)}${button('Delete permanently','purge-dialog',kind+'|'+item.key,'pm-delete')}</div></article>`).join('');
    return `<div class="sl-page pm-page">${heading('Recycle Bin','Restore deleted projects and assets here, or delete them permanently.')}<section class="pm-trash-section"><h2>Projects <span>${projects.length}</span></h2>${rows(projects,'project')||empty('No deleted projects','Projects deleted from the card menu appear here.')}</section><section class="pm-trash-section"><h2>Assets <span>${assets.length}</span></h2>${rows(assets,'asset')||empty('No deleted assets','Assets moved to the Recycle Bin appear here.')}</section></div>`;
  }
  function makeShare(key){
    const index=L.load(),project=index.projects.find(p=>p.key===key);if(!project||project.state==='trash')throw Error('Restore the project before sharing it.');
    const share={id:S.id('preview'),title:project.title,description:project.description,kind:project.kind,progress:project.progress,stage:project.stage,createdAt:new Date().toISOString(),assets:index.assets.filter(asset=>asset.owner===key&&asset.state==='active').slice(0,12).map(asset=>({name:asset.name,type:asset.type,image:asset.image||'',description:asset.description||''}))};
    L.changeMeta(meta=>{meta.shares??=[];meta.shares.push(share);});return share;
  }
  function preview(ctx){const share=L.meta().shares?.find(s=>s.id===ctx.params.get('id'));if(!share)return `<div class="sl-page">${empty('Preview unavailable','This preview can only be opened in the browser that created it.')}</div>`;return `<div class="sl-page pm-page">${heading(E(share.title),'Local read-only snapshot · '+labels[share.kind]+' · '+date(share.createdAt),C.link('Back to My Projects','/app/projects','cm-button ghost'))}<p class="sl-footnote">This local snapshot stays the same as you edit the project.</p><section class="sl-panel"><h2>Project content</h2><p>${E(label(descriptionLabels,share.description))}</p><p>${E(progressLabel(share.progress))} · ${E(label(stageLabels,share.stage))}</p></section><div class="pm-preview-grid">${share.assets.map(asset=>`<figure>${asset.image?`<img src="${E(asset.image)}" alt="${E(asset.name)}">`:''}<figcaption><strong>${E(asset.name)}</strong><small>${E(label(assetLabels,asset.type))}</small><p>${E(asset.description)}</p></figcaption></figure>`).join('')}</div></div>`;}
  function filtersURL(){const p=new URLSearchParams({view:'manage'});if(filter.type!=='all')p.set('projectType',filter.type);if(filter.search)p.set('projectSearch',filter.search);return '/app/projects'+(p.size?'?'+p:'');}
  function closeMenus(focus=false){for(const menu of document.querySelectorAll('[data-pm-menu]'))menu.hidden=true;for(const trigger of document.querySelectorAll('.pm-menu-trigger')){if(focus&&trigger.getAttribute('aria-expanded')==='true')trigger.focus();trigger.setAttribute('aria-expanded','false');}}
  function remember(){
    const path=location.hash.slice(1),[pathname,query='']=path.split('?'),parts=pathname.split('/'),params=new URLSearchParams(query),kind=parts[2];
    if(!['script','comic','video','create','canvas'].includes(kind))return;
    const id=['create','canvas'].includes(kind)?parts[3]:params.get('project');if(!id)return;
    const index=L.load(),project=index.projects.find(p=>p.id===id&&(['create','canvas'].includes(kind)||(kind==='script'?p.kind==='story':kind==='comic'?['comic','story'].includes(p.kind):p.kind==='video')));if(!project||!['active','archived'].includes(project.state)||project.resumeUrl===path)return;
    L.changeMeta(meta=>{meta.projects[project.key]={...meta.projects[project.key],resumeUrl:path};});
  }
  const oldRoute=C.route;
  C.route=ctx=>{
    blockedRoute=false;
    if(ctx.parts[0]!=='app')return oldRoute(ctx);
    try{
      if(W&&!['settings','account'].includes(ctx.parts[1]))restoreWorkspaces();else if(!W&&(ctx.parts[1]==='tasks'||ctx.parts[1]==='projects'&&!ctx.parts[2]))migrateAll();
      if(ctx.parts[1]==='projects'&&!ctx.parts[2])return ctx.params.get('view')==='manage'?projects(ctx):oldRoute(ctx);
      if(ctx.parts[1]==='trash')return trash();
      if(ctx.parts[1]==='project-preview')return preview(ctx);
      if(['script','comic','video','create','canvas','runs'].includes(ctx.parts[1])){
        const id=ctx.params.get('project')||ctx.parts[2],meta=L.meta(),kind=ctx.parts[1]==='script'?'story':ctx.parts[1]==='comic'?'comic':'video';
        const sourceRecord=meta.projects[kind+':'+id]||meta.projects['comic:'+id]||meta.projects['story:'+id];
        const record=sourceRecord?.workspaceSourceKey?meta.projects[canonicalKey(sourceRecord.workspaceSourceKey,meta)]:sourceRecord?.legacyBridge&&!sourceRecord.workspaceRestoredAt?meta.projects[kind+':'+sourceRecord.legacyBridge.projectId]||meta.projects['comic:'+sourceRecord.legacyBridge.projectId]||meta.projects['story:'+sourceRecord.legacyBridge.projectId]:sourceRecord;
        if(record&&['trash','purged'].includes(record.state)){blockedRoute=true;return `<div class="sl-page">${empty(record.state==='trash'?'Project in Recycle Bin':'Project permanently deleted',record.state==='trash'?'Restore the project to continue working on it.':'Return to My Projects to choose another project.')}${C.link('Open Recycle Bin','/app/trash','cm-button ghost')}</div>`;}
        if(W&&id){
          const native=S.state.projects.find(p=>p.id===id),key=native?.workspaceSourceKey||sourceRecord?.workspaceSourceKey;
          if(key){const project=resolve(key);if(!project){blockedRoute=true;return `<div class="sl-page">${empty('Original project unavailable','This link points to an unavailable project. Return to My Projects.')}${C.link('My Projects','/app/projects','cm-button ghost')}</div>`;}if(project){const bridge=L.meta().projects[project.key]?.legacyBridge,chapter=ctx.params.get('chapter')||bridge?.episodes?.[ctx.params.get('episode')]||Object.entries(bridge?.chapters||{}).find(([,value])=>value===(ctx.parts[3]||ctx.params.get('episode')))?.[0];const [path,query='']=W.url(project,{chapterId:chapter,tab:ctx.params.get('tab'),stage:ctx.params.get('stage'),pageId:ctx.params.get('page'),shotId:ctx.params.get('shot')}).split('?');Object.assign(ctx,{path,parts:path.slice(1).split('/'),params:new URLSearchParams(query)});history.replaceState(null,'','#'+path+'?'+query);}}
        }else if(id&&['script','comic','video'].includes(ctx.parts[1])){
          const project=find(kind+':'+id)||sourceRecord?.legacyBridge&&L.load().projects.find(p=>p.id===sourceRecord.legacyBridge.projectId);
          if(project){const [path,query]=migrateToLegacy(project).split('?');Object.assign(ctx,{path,parts:path.slice(1).split('/'),params:new URLSearchParams(query)});history.replaceState(null,'','#'+path+'?'+query);}
        }
      }
      return oldRoute(ctx);
    }catch(error){return `<div class="sl-page">${heading('Unable to load',E(error.message))}${C.link('Back to My Projects','/app/projects','cm-button ghost')}</div>`;}
  };
  const oldAfter=C.afterRender;
  C.afterRender=ctx=>{oldAfter(blockedRoute?{...ctx,parts:['app','trash'],params:new URLSearchParams()}:ctx);if(blockedRoute||['projects','trash','project-preview'].includes(ctx.parts[1]))document.body.classList.add('studio-library-page');try{remember();}catch(error){S.toast(error.message);}};
  const oldTitle=C.pageTitle;C.pageTitle=ctx=>ctx.parts[1]==='project-preview'?'Read-only project preview':oldTitle(ctx);
  function handle(action,key){
    if(action==='recovery'){showRecovery(key);return;}
    if(action==='recovery-download'){const {project,record,native,engines}=recovery(key);S.download({format:'cimora-workspace-recovery',version:1,project:project.raw,production:project.production,record,native,engines,assets:S.state.assets.filter(a=>a.projectId===native.id)},project.title+'-recovery-backup.json');return;}
    if(action==='filter'){filter.type=key;S.route(filtersURL());return;}
    if(action==='create'){S.modal('Create project','<p>Choose a project type.</p>',C.link('Story','/app/script?intent=new','cm-button primary')+C.link('Comic','/app/comic?intent=new','cm-button ghost')+C.link('Video','/app/video?intent=new','cm-button ghost'));return;}
    if(action==='trash'){const project=find(key);if(!project||!['active','archived'].includes(project.state))throw Error('This project is no longer listed. Refresh the page.');S.modal('Delete project',`<p>Move “${E(project.title)}” to the Recycle Bin?</p><p>You can restore it from the Recycle Bin. Saved assets and linked projects are kept.</p>`,button('Cancel','cancel')+button('Confirm','confirm-trash',key,'primary'));return;}
    if(action==='confirm-trash'){const project=find(key);if(!project||!['active','archived'].includes(project.state))throw Error('The project status has changed. Refresh the page.');setState(key,'trash');S.close();S.render();S.toast('Project moved to the Recycle Bin. Linked assets were kept.');return;}
    if(action==='restore'){setState(key,'active');S.render();S.toast('Project restored. You can pick up where you left off.');return;}
    if(action==='restore-asset'){L.changeMeta(meta=>{if(meta.assets[key]?.state!=='trash')throw Error('This asset is no longer in the Recycle Bin.');meta.assets[key]={...meta.assets[key],state:'active',deletedAt:null};});S.render();S.toast('Asset restored.');return;}
    if(action==='export'){window.ExportCenter.chooseProject(resolve(key)?.key||key);return;}
    if(action==='duplicate'){duplicate(key);filter.search='';S.route(filtersURL());S.toast('Project duplicated.');return;}
    if(action==='rename'){const project=find(key);S.modal('Rename project',`<form data-pm-rename="${E(key)}"><label>Project name<input name="name" value="${E(project.title)}" required maxlength="60" autocomplete="off"></label><button class="cm-button primary">Save name</button></form>`);return;}
    if(action==='share'){const share=makeShare(key),url=location.origin+location.pathname+'#/app/project-preview?id='+q(share.id);S.modal('Read-only preview created',`<p>This preview is available only in this browser.</p><label>Preview URL<input id="pm-share-url" readonly value="${E(url)}"></label>`,button('Copy local link','copy-share')+C.link('Open preview','/app/project-preview?id='+q(share.id),'cm-button primary'));return;}
    if(action==='copy-share'){const field=document.getElementById('pm-share-url');field.select();navigator.clipboard?.writeText(field.value).then(()=>S.toast('Local preview link copied.')).catch(()=>S.toast('Copy the selected link.'));return;}
    if(action==='purge-dialog'){const split=key.indexOf('|'),kind=key.slice(0,split),id=key.slice(split+1),item=kind==='project'?find(id):L.findAsset(id);if(!item)throw Error('Item not found.');S.modal('Confirm permanent deletion',`<p>Permanently delete “${E(item.title||item.name)}”? This action cannot be undone.</p><p>${kind==='project'?'Saved assets and linked projects are kept.':'This asset will be removed from the library. Versions already used in projects are kept.'}</p>`,button('Cancel','cancel')+button('Delete permanently','purge',key,'pm-delete'));return;}
    if(action==='purge'){const split=key.indexOf('|');if(key.slice(0,split)==='project')purgeProject(key.slice(split+1));else purgeAsset(key.slice(split+1));S.close();S.render();S.toast('Permanently deleted.');return;}
    if(action==='cancel')S.close();
  }
  document.addEventListener('click',event=>{
    try{remember();}catch{}
    const open=event.target.closest('[data-pm-open]');if(open){event.preventDefault();closeMenus();try{const project=resolve(open.dataset.pmOpen);if(!project)throw Error('Project no longer exists. Refresh the list.');S.route(W?resume(project):migrateToLegacy(project));}catch(error){S.toast(error.message);}return;}
    const target=event.target.closest('[data-pm]');if(!target){if(!event.target.closest('.pm-menu'))closeMenus();return;}
    event.preventDefault();
    if(target.dataset.pm==='menu'){const menu=[...document.querySelectorAll('[data-pm-menu]')].find(m=>m.dataset.pmMenu===target.dataset.key),open=menu?.hidden;closeMenus();if(open){menu.hidden=false;target.setAttribute('aria-expanded','true');menu.querySelector('button')?.focus();}return;}
    closeMenus();try{handle(target.dataset.pm,target.dataset.key);}catch(error){S.toast(error.message);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenus(true);const menu=event.target.closest('.pm-menu');if(menu&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const buttons=[...menu.querySelectorAll('button')],i=buttons.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();}});
  document.addEventListener('focusin',event=>{if(!event.target.closest('.pm-card'))closeMenus();});
  document.addEventListener('submit',event=>{const form=event.target.closest('[data-pm-rename]');if(!form)return;event.preventDefault();try{rename(form.dataset.pmRename,new FormData(form).get('name'));S.close();S.render();S.toast('Project renamed.');}catch(error){S.toast(error.message);}});
  document.addEventListener('input',event=>{const input=event.target;if(!input.matches('[data-pm-search]'))return;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if(!input.isConnected)return;filter.search=input.value;history.replaceState(null,'','#'+filtersURL());document.getElementById('pm-project-list').innerHTML=projectList(L.load());},180);});
  window.addEventListener('beforeunload',()=>{try{remember();}catch{}});
  window.StudioProjects={resume,restoreWorkspaces,resolve,migrateToLegacy,migrateAll,setState,rename,duplicate,purgeProject,purgeAsset,makeShare};
})();
