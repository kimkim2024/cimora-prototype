(function(root){
  const labels={story:'故事',comic:'漫画',video:'视频'};
  const list=value=>Array.isArray(value)?value:[];
  const safeImage=value=>typeof value==='string'&&/^(data:image\/(?:png|jpeg|webp|gif);base64,|https?:\/\/|\/?[\w.-]+\/)/i.test(value)?value:'';
  const imageOf=(value,comic=false)=>{const image=safeImage(value);return comic&&image&&!/^(data:|https?:|\/|assets\/|comic-studio\/)/.test(image)?'comic-studio/'+image:image;};
  const body=script=>typeof script?.fullText==='string'?script.fullText:list(script?.scenes).map(scene=>[scene.action,scene.dialogue,scene.mind].filter(Boolean).join('\n')).join('\n\n');
  const typeOf=value=>value.voiceover||value.kind==='audio'||value.musicPlan||value.effect?'声音':['live2d-generation','pngtuber'].includes(value.toolId)?'角色模型':value.toolId==='oc-sheet'&&value.character?.profile?'角色':value.kind==='video'||value.redraw?'视频':'图像';
  const subtypeOf=value=>value.voiceover?value.voiceover.type==='profile'?'角色音色':'配音片段':value.toolId==='pngtuber'?'PNGTuber':/^live2d-/.test(value.toolId||'')?'Live2D':value.musicPlan||value.music||value.audio?.musicPlan||value.toolId==='background-music'?'背景音乐':value.sound||value.effect||value.audio?.effectPlan||value.toolId==='sound-effects'?'环境音效':value.kind==='audio'?'声音片段':value.toolId==='expressions'?'表情与姿势':value.toolId==='image-motion'?'动态方案':value.toolId==='oc-sheet'&&value.character?.profile?'角色设定':value.kind==='video'||value.redraw?'视频片段':value.stickers?'表情包':'图片';
  const kindOf=value=>['角色','人物'].includes(value)?'角色':['服装','服饰'].includes(value)?'图像':['声音','人物音色','角色音色','背景音乐','环境声','动作音效'].includes(value)?'声音':['场景','道具'].includes(value)?value:'图像';
  const categories=['全部','故事文本','角色','场景','道具','图片与漫画','视频与动态','声音','角色模型'];
  const subcategories={'故事文本':['故事设定','剧本'],'角色':['角色设定','表情与姿势'],'场景':['场景设定'],'道具':['道具设定'],'图片与漫画':['插画与图片','漫画成稿','表情包'],'视频与动态':['视频片段','GIF动图','动态方案'],'声音':['角色音色','配音片段','背景音乐','环境音效','声音片段'],'角色模型':['Live2D','PNGTuber']};
  const sourceLabels={market:'创作市场',tools:'创作工具',story:'故事创作',comic:'漫画创作',video:'视频创作',other:'个人保存 / 其他'};
  const normalizeCategory=value=>({'图像':'图片与漫画','视频':'视频与动态'})[value]||value;
  function categoryOf(asset){
    const raw=asset.raw||{};
    if(asset.type==='角色模型'||/^live2d-/.test(raw.toolId||'')||raw.toolId==='pngtuber')return '角色模型';
    if(asset.type==='声音')return '声音';
    if(raw.stickers||asset.subtype==='表情包')return '图片与漫画';
    if(asset.type==='角色'||raw.toolId==='expressions'||['表情与姿势','表情姿势'].includes(asset.subtype))return '角色';
    if(['故事文本','场景','道具'].includes(asset.type))return asset.type;
    if(asset.type==='视频'||raw.motion||asset.subtype==='动态方案'||/\.gif(?:[?#]|$)/i.test(asset.image||'')||/^data:image\/gif[;,]/i.test(asset.image||''))return '视频与动态';
    return '图片与漫画';
  }
  function subcategoryOf(asset){
    const category=categoryOf(asset),raw=asset.raw||{};
    if(category==='角色模型')return raw.toolId==='pngtuber'||asset.subtype==='PNGTuber'?'PNGTuber':'Live2D';
    if(category==='角色')return raw.toolId==='expressions'||asset.subtype==='表情与姿势'?'表情与姿势':'角色设定';
    if(category==='图片与漫画')return raw.stickers||asset.subtype==='表情包'?'表情包':asset.subtype==='漫画成稿页'?'漫画成稿':'插画与图片';
    if(category==='视频与动态')return raw.motion||asset.subtype==='动态方案'?'动态方案':asset.type==='视频'?'视频片段':'GIF动图';
    if(category==='声音'){
      if(subcategories['声音'].includes(asset.subtype))return asset.subtype;
      if(['环境声','环境音','音效','动作音效'].includes(asset.subtype))return '环境音效';
      const subtype=subtypeOf(raw);return subcategories['声音'].includes(subtype)?subtype:'声音片段';
    }
    if(category==='故事文本')return Object.values(raw.scripts||{}).some(script=>body(script).trim())?'剧本':'故事设定';
    return category==='场景'?'场景设定':'道具设定';
  }
  function creationSource(asset){
    if(asset.raw?.market||/^market:/.test(asset.key||''))return 'market';
    if(asset.raw?.resultId)return 'tools';
    if(asset.tool)return 'tools';
    const owner=(asset.owner||'').split(':')[0];
    if(['story','comic','video'].includes(owner))return owner;
    if(/^故事/.test(asset.origin||''))return 'story';
    if(/^漫画/.test(asset.origin||''))return 'comic';
    if(/^视频/.test(asset.origin||''))return 'video';
    return 'other';
  }
  const projectKeys=asset=>[...new Set([asset.owner,...list(asset.usages).map(use=>use.projectKey)].filter(key=>typeof key==='string'&&/^(story|comic|video):./.test(key)))];
  const tagName=value=>String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');
  function tagCopy(meta){const next=JSON.parse(JSON.stringify(meta));next.tags=list(next.tags);next.assets=next.assets||{};return next;}
  function checkedTagName(meta,name,except){
    const clean=tagName(name);
    if(!clean||clean.length>30)throw Error('标签名称需要 1–30 个字符');
    if(list(meta.tags).some(tag=>tag.id!==except&&tagName(tag.name).toLowerCase()===clean.toLowerCase()))throw Error('同名标签已存在');
    return clean;
  }
  function createTag(meta,id,name){const next=tagCopy(meta);if(!id||id==='untagged'||next.tags.some(tag=>tag.id===id))throw Error('标签标识已存在');next.tags.push({id,name:checkedTagName(next,name)});return next;}
  function assignTags(meta,keys,ids,mode='replace'){
    const next=tagCopy(meta),selected=[...new Set(ids)];
    if(selected.some(id=>!next.tags.some(tag=>tag.id===id)))throw Error('标签不存在，请重新选择');
    if(!['add','remove','replace'].includes(mode))throw Error('标签操作无效');
    for(const key of new Set(keys)){const entry=next.assets[key]||{},current=list(entry.tags);next.assets[key]={...entry,tags:mode==='add'?[...new Set([...current,...selected])]:mode==='remove'?current.filter(id=>!selected.includes(id)):selected};}
    return next;
  }
  function renameTag(meta,id,name){const next=tagCopy(meta),tag=next.tags.find(tag=>tag.id===id);if(!tag)throw Error('标签不存在');tag.name=checkedTagName(next,name,id);return next;}
  function mergeTag(meta,id,target){
    const next=tagCopy(meta);
    if(id===target||![id,target].every(key=>next.tags.some(tag=>tag.id===key)))throw Error('请选择另一个已有标签');
    for(const entry of Object.values(next.assets))if(list(entry.tags).includes(id))entry.tags=[...new Set([...entry.tags.filter(key=>key!==id),target])];
    next.tags=next.tags.filter(tag=>tag.id!==id);return next;
  }
  function deleteTag(meta,id){const next=tagCopy(meta);next.tags=next.tags.filter(tag=>tag.id!==id);for(const entry of Object.values(next.assets))if(entry.tags)entry.tags=entry.tags.filter(key=>key!==id);return next;}
  function matchesAsset(asset,filters={}){
    const categories=String(filters.assetType||'全部').split(',').map(normalizeCategory).filter(value=>value&&value!=='全部'),project=filters.assetProject||'all',source=filters.assetSource||'all',subtype=filters.assetSubtype||'all',search=(filters.assetSearch||'').toLowerCase();
    const keys=projectKeys(asset),sourceKey=creationSource(asset);
    const requested=String(filters.assetTags||'').split(',').filter(Boolean),tags=list(asset.tags);
    if(requested.includes('untagged')?tags.length:!requested.every(id=>tags.includes(id)))return false;
    return asset.state===(filters.assetState||'active')&&(!categories.length||categories.includes(categoryOf(asset)))&&(subtype==='all'||subcategoryOf(asset)===subtype)&&(project==='all'||project==='unlinked'&&!keys.length||keys.includes(project))&&(source==='all'||source==='personal'&&!asset.owner||sourceKey===source)&&(!search||[asset.name,asset.description,asset.ownerName,asset.subtype,subcategoryOf(asset),sourceLabels[sourceKey]].join(' ').toLowerCase().includes(search));
  }
  function build(input){
    const projects=[],assets=[],meta=input.meta||{},addProject=project=>{const entry={...project,related:[],state:project.raw?.deletedAt?'trash':project.raw?.archived?'archived':'active',...(meta.projects?.[project.key]||{})};projects.push(entry);return entry;};
    for(const project of list(input.stories?.projects)){
      const episodes=list(project.outline),done=episodes.filter(ep=>body(project.scripts?.[ep.id]).trim()).length;
      addProject({key:'story:'+project.id,id:project.id,kind:'story',title:project.title,description:project.story||project.original||'从灵感开始整理故事',episodes,stage:['准备素材','创意对话','故事概览','人物设定','分集大纲','正文写作'][project.stage]||'正文写作',progress:episodes.length+'集 · 正文 '+done+'/'+episodes.length,url:'/app/script?project='+encodeURIComponent(project.id),updated:project.updatedAt||project.createdAt||'',example:!!project.managementExample,raw:project});
    }
    for(const project of list(input.comics?.projects)){
      const episodes=project.storyPlan?.episodes?.length?project.storyPlan.episodes:list(project.comicEpisodes).length?project.comicEpisodes:list(project.source?.outline);
      const pages=Object.values(project.bodyPagination?.episodes||{}).flatMap(ep=>list(ep.pages));
      const done=pages.filter(page=>project.wholePageStudio?.works?.[page.id]?.adoptedId).length;
      addProject({key:'comic:'+project.id,id:project.id,kind:'comic',title:project.title,description:project.story||'漫画内容待策划',episodes,stage:['内容策划','视觉资产','漫画编排','生成与编辑'][project.stage]||'内容策划',progress:episodes.length+'集 · '+pages.length+'页 · 成稿 '+done+'页',url:'/app/comic?project='+encodeURIComponent(project.id),updated:project.updatedAt||project.createdAt||'',source:project.source,example:!!project.managementExample,raw:project});
    }
    for(const project of list(input.videos)){
      const entries=list(input.videoEntries).filter(entry=>entry.projectId===project.id);
      const primary=entries[0],workspace=primary?.workspace,episodes=entries.flatMap(entry=>list(entry.workspace?.episodes));
      const shots=entries.flatMap(entry=>list(entry.shots)),done=shots.filter(shot=>shot.adoptedId).length;
      const kind=['story','comic','video'].includes(project.studioKind)?project.studioKind:'video';
      const units=[...list(project.chapters),...list(project.episodes)],unit=units.find(ch=>ch.id===project.lastChapterId)||units[0];
      const engine=input.engines?.[project.id]?.[unit?.id]||primary?.engine||{},nav=engine.navigation||{},stage=nav.stage||engine.stage||'story';
      const params=new URLSearchParams({stage,view:nav.view||engine.view||'flow'});
      if(engine.importDraft)params.set('import',nav.import||'pages');
      if(nav.panelId)params.set('panel',nav.panelId);
      if(engine.selectedShotId)params.set('shot',engine.selectedShotId);
      const stageLabel=({story:'脚本与资产',assets:'脚本与资产',boards:unit?.kind==='episode'?'镜头方案':'逐格画面',comic:'排版阅读',motion:'逐镜制作',audio:'剪辑与声音',review:'审阅与交付'})[stage]||'继续创作';
      addProject({key:kind+':'+project.id,id:project.id,kind,legacySource:true,title:project.name||workspace?.title,description:project.desc||workspace?.synopsis||'项目工程',episodes:units,stage:stageLabel,progress:units.length+'章 / 集'+(shots.length?' · '+shots.length+'镜 · 已采用 '+done+'镜':''),url:unit?'/app/create/'+encodeURIComponent(project.id)+'/'+encodeURIComponent(unit.id)+'?'+params:'/app/projects/'+encodeURIComponent(project.id),updated:project.lastOpenedAt||project.updatedAt||primary?.createdAt||'',source:primary?.source,example:!!project.managementExample,entries,raw:project});
    }
    const tabNames={overview:'故事梗概',characters:'人物小传','story-outline':'故事大纲',chapters:'故事章节',arrangement:'漫画编排',production:'生成与编辑',assets:'项目资产',storyboard:'分镜剧情',generation:'视频生成'};
    for(const [kind,store,db] of [['comic','comicDraft',input.comicDrafts],['video','videoDraft',input.videoDrafts]])for(const project of list(db?.projects)){
      const episodes=list(project.storyChapters),tab=project.agent?.planningTab||'overview';
      addProject({key:kind+':'+project.id,id:project.id,kind,store,title:project.title||'未命名作品',description:project.agent?.planning?.synopsis||project.story||project.original||'从灵感开始创作',episodes,stage:project.agent?.phase==='planning'?(tabNames[tab]||'故事梗概'):'灵感策划',progress:episodes.length+'章'+(kind==='video'?' · '+list(project.video?.shots).length+'镜':''),url:'/app/'+kind+'?'+new URLSearchParams({project:project.id,...(project.agent?.phase==='planning'?{tab}:{})}),updated:project.updatedAt||project.createdAt||'',entries:[],raw:project});
    }
    for(const project of projects.filter(p=>p.kind==='story'&&p.raw.agent)){
      project.stage=project.raw.agent.phase==='planning'?(tabNames[project.raw.agent.planningTab]||'故事梗概'):'灵感策划';
      if(Array.isArray(project.raw.storyChapters)){project.episodes=project.raw.storyChapters;project.progress=project.episodes.length+'章 · 正文 '+project.episodes.filter(ep=>ep.body?.trim()).length+'/'+project.episodes.length;}
    }
    function connect(project,key){if(!key||key===project.key)return;const source=projects.find(item=>item.key===key);if(source){if(!project.related.includes(key))project.related.push(key);if(!source.related.includes(project.key))source.related.push(project.key);}}
    for(const project of projects){const source=project.source;if(!source)continue;const sourceId=source.projectId||list(input.stories?.assets).find(asset=>asset.assetId===source.assetId)?.id;
      connect(project,(project.kind==='comic'?'story':source.type==='comic'?'comic':'story')+':'+sourceId);
      const storySource=list(input.stories?.assets).find(asset=>asset.assetId===source.assetId);
      if(storySource&&source.savedAt&&storySource.savedAt!==source.savedAt)project.sourceUpdated=true;
      if(source.type==='comic'){
        const comicSource=list(input.comics?.projects).find(item=>item.id===source.projectId);
        if(comicSource){const currentAssets=list(comicSource.assets);project.sourceUpdated=list(source.assets).some(asset=>{const current=currentAssets.find(item=>item.id===asset.id);return !current||current.adoptedVisualId!==asset.adoptedVisualId;});}
      }
    }
    const pushAsset=value=>{const entry={...value,usages:value.usages||[],state:meta.assets?.[value.key]?.state||'active'};assets.push(entry);return entry;};
    for(const saved of list(input.stories?.assets)){
      const owner=projects.find(project=>project.key==='story:'+saved.id),usages=projects.filter(project=>project.source?.assetId===saved.assetId).map(project=>({projectKey:project.key,label:project.title,versionId:saved.savedAt}));
      pushAsset({key:'story-asset:'+saved.assetId,id:saved.assetId,type:'故事文本',subtype:'故事包',name:saved.title,description:saved.story||saved.original,owner:owner?.key,ownerName:owner?.title||'Saved story',version:{id:saved.savedAt,label:'Saved story'},versions:[{id:saved.savedAt,label:'Saved story'}],original:saved.original,episodes:list(saved.outline),raw:saved,savedAt:saved.savedAt,usages,origin:'故事创作',url:'/app/script?project='+encodeURIComponent(saved.id)});
    }
    function visualAsset(asset,project,host){
      const versions=list(project.kind==='comic'?asset.visualVersions:asset.candidates),adoptedId=project.kind==='comic'?asset.adoptedVisualId:asset.adoptedId;
      const adopted=versions.find(version=>version.id===adoptedId),version=adopted||null;
      const image=imageOf(version?.images?.main||version?.image||version?.url,project.kind==='comic');
      const key=project.key+':'+(host?host+':':'')+asset.id;
      const entry=pushAsset({key,id:asset.id,type:kindOf(asset.kind),subtype:asset.kind||'视觉参考',name:asset.name,description:asset.stable||asset.role||asset.storyProfile?.identity||asset.storyProfile?.intro||asset.description||'Details pending',profile:asset.storyProfile||version?.characterProfile,owner:project.key,host,ownerName:project.title,version,versions,image,adoptedId,raw:asset,origin:project.kind==='comic'?'漫画视觉资产':'视频视觉资产',url:project.url,sourceLink:asset.sourceLink,usages:[{projectKey:project.key,label:project.title,versionId:adoptedId}],savedAt:version?.createdAt||version?.at||''});
      for(const voice of list(asset.voiceProfiles))pushAsset({key:key+':voice:'+voice.id,id:voice.id,type:'声音',subtype:'角色音色',name:asset.name+' · '+voice.name,description:'Character voice profile saved separately from dialogue clips.',owner:project.key,ownerName:project.title,parentAssetKey:key,version:{id:voice.id,label:voice.name},versions:[{id:voice.id,label:voice.name}],raw:voice,origin:'角色关联音色',url:project.url,usages:[{projectKey:project.key,label:project.title,versionId:voice.id}]});
      for(const model of list(asset.pngtuberRefs))pushAsset({key:key+':model:'+model.id,id:model.id,type:'角色模型',subtype:'PNGTuber',name:model.title||asset.name+' · PNGTuber',description:model.notice||'Four states: idle, talking, blinking, and talking while blinking.',owner:project.key,ownerName:project.title,parentAssetKey:key,image:safeImage(model.images?.[0]?.src),version:{id:model.versionId,label:model.title},versions:[{id:model.versionId,label:model.title}],raw:model,origin:'角色关联模型',url:project.url,usages:[{projectKey:project.key,label:project.title,versionId:model.versionId}]});
      return entry;
    }
    for(const project of projects){
      if(project.kind==='comic')for(const asset of list(project.raw.assets))visualAsset(asset,project);
      if(project.kind==='video')for(const entry of project.entries){
        for(const asset of list(entry.workspace?.assets))visualAsset(asset,project,entry.hostId);
        for(const shot of list(entry.shots)){
          const versions=list(shot.candidates),version=versions.find(version=>version.id===shot.adoptedId);if(!version)continue;
          pushAsset({key:project.key+':shot:'+shot.id,id:shot.id,type:version.media?.url?'视频':'图像',subtype:version.media?.url?'视频片段':'镜头参考图',name:shot.title,description:shot.intent||'Approved shot asset',owner:project.key,ownerName:project.title,version,versions,image:safeImage(version.image),raw:shot,origin:'视频镜头编排',url:project.url,usages:[{projectKey:project.key,label:project.title,versionId:version.id}]});
        }
        for(const [episodeId,episode] of Object.entries(entry.workspace?.finishing?.episodes||{})){
        const episodeName=list(entry.workspace.episodes).find(item=>item.id===episodeId)?.title||'Episode';
          const music=list(episode.audioLibrary?.music).find(item=>item.id===episode.musicAdoptedId);
          const addSound=(value,id,name,subtype,description)=>pushAsset({key:project.key+':sound:'+entry.hostId+':'+episodeId+':'+id,id,type:'声音',subtype,name,description,owner:project.key,ownerName:project.title,version:value,versions:[value],raw:value,origin:'视频整集制作',url:project.url,usages:[{projectKey:project.key,label:project.title,versionId:value.id}]});
          if(music)addSound(music,music.id,episodeName+' · '+music.title,'背景音乐',music.prompt||'Background music in use for this episode');
          for(const [shotId,sound] of Object.entries(episode.sounds||{}))if(sound.task?.id)addSound(sound.task,sound.task.id,episodeName+' · Dialogue','配音片段',sound.text||sound.task.text||'Recorded dialogue voiceover');
          for(const [shotId,categories] of Object.entries(episode.effectAdopted||{}))for(const effectId of Object.values(categories)){const effect=list(episode.audioLibrary?.effects?.[shotId]).find(value=>value.id===effectId);if(effect)addSound(effect,effect.id,episodeName+' · '+effect.title,'环境音效',effect.prompt||'Ambient or action sound effect in use');}
        }
      }
      if(project.kind==='comic')for(const [pageId,work] of Object.entries(project.raw.wholePageStudio?.works||{})){
        const version=list(work.versions).find(version=>version.id===work.adoptedId);if(!version)continue;
        const pageEntry=Object.entries(project.raw.bodyPagination?.episodes||{}).map(([id,ep])=>({id,pages:list(ep.pages)})).find(ep=>ep.pages.some(page=>page.id===pageId));
        const chapter=pageEntry&&project.episodes.find(ep=>ep.id===pageEntry.id);
        const pageLabel=pageEntry?(chapter?.title||'Comic')+' · Page '+(pageEntry.pages.findIndex(page=>page.id===pageId)+1):'';
        pushAsset({key:project.key+':page:'+pageId,id:pageId,type:'图像',subtype:'漫画成稿页',pageLabel,name:project.title+' · Comic page',description:'Approved comic page. Page content and candidates are available in the comic workspace.',owner:project.key,ownerName:project.title,version,versions:list(work.versions),image:imageOf(version.image,true),url:project.url,raw:work,origin:'漫画成稿',usages:[{projectKey:project.key,label:project.title,versionId:version.id}]});
      }
    }
    for(const saved of list(input.tools)){
      const images=Object.fromEntries(list(saved.images).map((image,index)=>[image.role||'image'+index,image.src]));
      images.main=images.main||images.sheet||saved.images?.[0]?.src;
      const version={id:saved.id,label:'Saved result v'+saved.version,images,characterProfile:saved.toolId==='oc-sheet'?saved.character?.profile:undefined};
      pushAsset({key:'tool:'+saved.id,id:saved.id,type:typeOf(saved),subtype:subtypeOf(saved),name:saved.title,description:saved.prompt||saved.notice||'Saved tool output',profile:saved.character?.profile,image:safeImage(images.main),ownerName:'Personal assets',origin:'创作工具',version,versions:[version],raw:saved,savedAt:saved.savedAt,url:'/app/tools/'+saved.toolId,tool:true});
    }
    for(const saved of list(input.legacyAssets)){
      const usages=[];for(const project of projects.filter(project=>project.legacySource)){if(project.raw.assetIds?.includes(saved.id))usages.push({projectKey:project.key,label:project.title,versionId:String(saved.version)});for(const entry of list(project.entries))if(entry.bindings?.[saved.id]&&!usages.some(use=>use.projectKey===project.key))usages.push({projectKey:project.key,label:project.title,versionId:String(entry.bindings[saved.id])});}
      pushAsset({key:'legacy:'+saved.id,id:saved.id,type:kindOf(saved.type),subtype:saved.type,name:saved.name,description:saved.desc,owner:saved.projectId?projects.find(p=>p.legacySource&&p.id===saved.projectId)?.key||null:null,ownerName:saved.projectId?projects.find(p=>p.id===saved.projectId)?.title||'Archived project':'Workspace',origin:'历史资产',version:{id:String(saved.version),label:'v'+saved.version},versions:[{id:String(saved.version),label:'v'+saved.version}],raw:saved,usages,url:'/app/assets/'+encodeURIComponent(saved.id)+'?legacy=1'});
    }
    const sourceOf=version=>version?.librarySource||(version?.toolSnapshot?.id?{assetKey:'tool:'+version.toolSnapshot.id,versionId:version.toolSnapshot.id}:null);
    const toolVersion=saved=>saved.voiceover?.versionId||saved.music?.versionId||saved.sound?.versionId||saved.pngtuber?.versionId;
    const markUsage=(source,asset,versionId,candidate)=>{
      const existing=source.usages.find(use=>use.projectKey===asset.owner&&use.assetKey===asset.key&&use.versionId===versionId);
      if(existing)existing.candidate=existing.candidate&&candidate;
      else source.usages.push({projectKey:asset.owner,assetKey:asset.key,label:asset.ownerName,versionId,candidate});
    };
    for(const asset of assets){const link=sourceOf(asset.version)||asset.sourceLink||(!asset.version?asset.raw.librarySource:null);
      const source=link&&(assets.find(item=>item.key===link.assetKey)||assets.find(item=>item.owner==='comic:'+link.projectId&&item.id===link.assetId));
      if(source&&source!==asset){asset.sourceAssetKey=source.key;asset.sourceUpdated=!!link.versionId&&!!source.version&&source.version.id!==link.versionId;}
      for(const version of asset.versions){const origin=sourceOf(version),original=origin&&assets.find(item=>item.key===origin.assetKey);if(original&&original!==asset&&asset.owner)markUsage(original,asset,origin.versionId,asset.version?.id!==version.id);}
      for(const ref of [...list(asset.raw.performanceRefs),...list(asset.raw.voiceProfiles),...list(asset.raw.pngtuberRefs)]){
        const saved=list(input.tools).find(item=>item.id===ref.toolSnapshotId||ref.voiceId&&item.voiceover?.type==='profile'&&item.voiceover.voice?.id===ref.voiceId||ref.versionId&&toolVersion(item)===ref.versionId);
        const original=saved&&assets.find(item=>item.key==='tool:'+saved.id);if(original&&asset.owner)markUsage(original,asset,saved.id,false);
      }
      if(source&&source!==asset&&asset.owner&&!asset.versions.some(sourceOf))markUsage(source,asset,link.versionId,!asset.version);
      if(!asset.version&&asset.versions.length)asset.pending=true;
    }
    for(const project of projects){
      const containers=project.kind==='comic'?Object.entries(project.raw.wholePageStudio?.works||{}).map(([id,work])=>({key:project.key+':page:'+id,versions:list(work.versions),adoptedId:work.adoptedId})):project.kind==='video'?project.entries.flatMap(entry=>list(entry.shots).map(shot=>({key:project.key+':shot:'+shot.id,versions:list(shot.candidates),adoptedId:shot.adoptedId}))):[];
      for(const container of containers)for(const version of container.versions){const origin=sourceOf(version),source=origin&&assets.find(item=>item.key===origin.assetKey);if(source)markUsage(source,{key:container.key,owner:project.key,ownerName:project.title},origin.versionId,container.adoptedId!==version.id);}
    }
    for(const project of projects.filter(item=>item.kind==='video'))for(const entry of project.entries)for(const [episodeId,episode] of Object.entries(entry.workspace?.finishing?.episodes||{})){
      const library=episode.audioLibrary||{};
      for(const candidate of [...list(library.music),...Object.values(library.voices||{}).flatMap(list),...Object.values(library.effects||{}).flatMap(list)]){
        const saved=list(input.tools).find(item=>toolVersion(item)&&toolVersion(item)===candidate.toolVersionId),source=saved&&assets.find(item=>item.key==='tool:'+saved.id);if(!source)continue;
        const adopted=episode.musicAdoptedId===candidate.id||Object.values(episode.sounds||{}).some(sound=>sound.task?.id===candidate.id)||Object.values(episode.effectAdopted||{}).some(categories=>Object.values(categories).includes(candidate.id));
        markUsage(source,{owner:project.key,key:project.key+':sound:'+entry.hostId+':'+episodeId+':'+candidate.id,ownerName:project.title},saved.id,!adopted);
      }
    }
    for(const project of projects.filter(p=>p.store)){
      const records=project.kind==='comic'?Object.entries(project.raw.comic?.visuals||{}).map(([id,v])=>({id,name:project.raw.characters?.find(c=>c.id===id)?.name||'人物',kind:'角色',visualVersions:list(v.versions),adoptedVisualId:v.adoptedId})):list(project.raw.video?.assets).map(a=>({...a,candidates:list(a.versions)}));
      for(const asset of records)visualAsset(asset,project);
    }
    const linked=projects.filter(p=>p.kind==='comic'&&p.raw.storyDraftId&&projects.some(parent=>parent.store==='comicDraft'&&parent.id===p.raw.storyDraftId));
    for(const child of linked){const parent=projects.find(p=>p.store==='comicDraft'&&p.id===child.raw.storyDraftId);parent.production=child.raw;for(const asset of assets){if(asset.owner===child.key){asset.owner=parent.key;asset.ownerName=parent.title;asset.url=parent.url;}for(const use of asset.usages)if(use.projectKey===child.key){use.projectKey=parent.key;use.label=parent.title;}}}
    // A source snapshot remains readable for asset history, while every user-facing link resolves to its canonical project.
    const canonical=key=>{const seen=new Set();while(key&&!seen.has(key)){seen.add(key);const entry=meta.projects?.[key];if(entry?.workspaceSourceKey){key=entry.workspaceSourceKey;continue;}const bridge=entry?.legacyBridge;if(bridge&&!entry.workspaceRestoredAt){key=key.split(':')[0]+':'+bridge.projectId;continue;}break;}return key;};
    for(const project of projects){
      const target=projects.find(p=>p.key===canonical(project.key));
      if(target&&target!==project)project.url=target.url;
      project.related=[...new Set(project.related.map(canonical))].filter(key=>key!==project.key);
    }
    const visibleAssets=assets.filter(asset=>!asset.raw?.librarySourceKey||!assets.some(source=>source.key===asset.raw.librarySourceKey));
    for(const asset of visibleAssets){
      const targetKey=canonical(asset.owner),owner=projects.find(p=>p.key===targetKey),purged=meta.projects?.[targetKey]?.state==='purged';
      if(targetKey!==asset.owner||purged){asset.owner=purged?null:targetKey;asset.ownerName=owner?.title||asset.ownerName;if(owner)asset.url=owner.url;}
      asset.usages=asset.usages.map(use=>{const key=canonical(use.projectKey);return {...use,projectKey:key,label:projects.find(p=>p.key===key)?.title||use.label};}).filter(use=>meta.projects?.[use.projectKey]?.state!=='purged');
    }
    return {projects:projects.filter(p=>!linked.includes(p)&&p.state!=='redirected'),assets:visibleAssets};
  }
  // Only expose playback for an actual saved media URL, never for a generation plan.
  function mediaOf(asset){
    const category=categoryOf(asset),kind=category==='声音'?'audio':category==='视频与动态'?'video':'';
    if(!kind)return null;
    const v=asset.version||{},r=asset.raw||{};
    const candidates=[v.media,v[kind],r.media,r[kind],r.voiceover?.audio,r.music?.audio,r.sound?.audio,
      {url:v[kind+'Url']},{url:r[kind+'Url']}];
    for(const item of candidates){
      const media=typeof item==='string'?{url:item}:item;
      const url=media?.url||media?.src;
      if(typeof url!=='string'||!url.trim()||media.kind&&media.kind!==kind||media.type&&['audio','video','image'].includes(media.type)&&media.type!==kind)continue;
      if(!/^(https?:\/\/|blob:https?:\/\/|\/?[\w.-]+\/)/i.test(url)&&!url.startsWith('data:'+kind+'/'))continue;
      if(/\.(?:png|jpe?g|webp|gif|svg)(?:[?#]|$)/i.test(url))continue;
      const duration=Number(media.duration||v.duration||r.duration);
      return {kind,url,duration:Number.isFinite(duration)&&duration>0?duration:null};
    }
    return null;
  }
  function previewOf(asset){
    const category=categoryOf(asset),subtype=subcategoryOf(asset),raw=asset.raw||{},v=asset.version||{},media=mediaOf(asset);
    const plain=value=>typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
    const excerpt=plain(asset.description)||plain(asset.profile?.intro)||plain(asset.profile?.identity)||plain(raw.text)||plain(raw.prompt);
    const images=[asset.image,...Object.values(v.images||{}),...list(raw.images).map(i=>typeof i==='string'?i:i.src)].map(x=>imageOf(x,asset.owner?.startsWith('comic:'))).filter(Boolean);
    const count=new Set(images).size;
    if(category==='故事文本'){
      const chapters=list(asset.episodes),text=excerpt||chapters.map(ep=>plain(body(raw.scripts?.[ep.id]))||plain(ep.body)).find(Boolean)||'';
      return {kind:'text',excerpt:text||'No story content yet',label:subtype,meta:chapters.length?`${chapters.length} ${chapters.length===1?'chapter':'chapters'}`:''};
    }
    if(category==='声音')return {kind:'audio',excerpt:excerpt||'No audio description yet',label:media?subtype:subtype==='角色音色'?'音色设定':'声音方案',meta:media?'Audio available':'No audio file',media};
    if(category==='视频与动态')return {kind:'video',excerpt:excerpt||'No motion description yet',label:media?'视频片段':/\.gif(?:[?#]|$)/i.test(asset.image||'')?'GIF 动图':'动态方案',meta:media?'Video available':asset.image?'Reference image saved':'No video file',media};
    if(category==='角色模型')return {kind:'model',excerpt:excerpt||'Character model assets',label:subtype,meta:count?`${count} ${count===1?'image':'images'}`:'No previews available'};
    if(asset.image)return {kind:'image',excerpt,label:subtype,meta:asset.pageLabel||(count>1?`${count} reference images`:'')};
    return {kind:'setting',excerpt:excerpt||'No details yet',label:subtype,meta:'No image'};
  }
  function projectChoices(index,asset){return index.projects.filter(project=>project.state==='active'&&project.key!==asset.owner&&(asset.type==='故事文本'?['comic','video'].includes(project.kind):['角色','场景','道具','图像'].includes(asset.type)?['comic','video'].includes(project.kind):false));}
  const api={build,typeOf,subtypeOf,projectChoices,safeImage,imageOf,body,labels,categories,subcategories,sourceLabels,normalizeCategory,categoryOf,subcategoryOf,creationSource,projectKeys,matchesAsset,createTag,assignTags,renameTag,mergeTag,deleteTag,mediaOf,previewOf};
  if(typeof module!=='undefined')module.exports=api;else root.StudioLibraryModel=api;
})(globalThis);
