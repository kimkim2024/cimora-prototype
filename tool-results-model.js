(function(root){
  'use strict';
  const KEY='cimora-tool-studio-v1',copy=value=>JSON.parse(JSON.stringify(value));
  function create({storage,id,now=()=>new Date().toISOString()}){
    const codec=typeof module!=='undefined'?require('./tool-storage-codec.js'):root.ToolStorageCodec,encoding='lzw-utf16-records-v1';
    let compressed=false,cache=new Map();
    function encode(next){
      const pending=new Map();
      const record=value=>{const key=JSON.stringify(value),packed=cache.get(key)||codec.pack(value);pending.set(key,packed);return packed;};
      const value={...next,encoding,drafts:Object.fromEntries(Object.entries(next.drafts).map(([key,value])=>[key,record(value)])),results:next.results.map(record)};
      return {raw:JSON.stringify(value),cache:pending};
    }
    let state={version:1,drafts:{},results:[],recent:[]};
    const raw=storage.getItem(KEY);
    if(raw){try{state=JSON.parse(raw);if(state.version!==1||!state.drafts||!Array.isArray(state.results))throw Error();if(state.encoding){if(state.encoding!==encoding||!codec)throw Error();const restore=record=>{const value=codec.unpack(record);cache.set(JSON.stringify(value),record);return value;};state={...state,drafts:Object.fromEntries(Object.entries(state.drafts).map(([key,record])=>[key,restore(record)])),results:state.results.map(restore)};delete state.encoding;compressed=true;}}catch{throw Error('工具存储无法读取，已保留原数据，请先备份。');}}
    function commit(next){
      try{
        if(compressed){const value=encode(next);storage.setItem(KEY,value.raw);cache=value.cache;}
        else{try{storage.setItem(KEY,JSON.stringify(next));}catch(error){if(!codec||!['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name))throw error;const value=encode(next);storage.setItem(KEY,value.raw);cache=value.cache;compressed=true;}}
      }catch{throw Error('本机存储不足，未保存更改；已有成果保留。');}
      state=next;
    }
    return {
      draft:tool=>copy(state.drafts[tool]||{}),
      update(tool,patch){const next=copy(state);next.drafts[tool]={...(next.drafts[tool]||{}),...copy(patch)};next.recent=[tool,...(next.recent||[]).filter(x=>x!==tool)].slice(0,8);commit(next);return copy(next.drafts[tool]);},
      save(tool,snapshot){const next=copy(state),result={...copy(snapshot),id:id('tool-result'),toolId:tool,version:1+next.results.filter(x=>x.toolId===tool).length,savedAt:now(),prototype:true};next.results.unshift(result);commit(next);return copy(result);},
      list:()=>copy(state.results),recent:()=>copy(state.recent||[])
    };
  }
  function imageResult(snapshot){if(snapshot.kind!=='image'||!snapshot.images?.length)throw Error('报告或资料清单不能作为图片带入。');if(snapshot.images.some(x=>!/^data:image\/(png|jpeg|webp);base64,/.test(x.src)))throw Error('请先生成可保存的示例图片。');}
  function provenance(snapshot){return copy(snapshot);}
  function assetImages(snapshot){if(snapshot.toolId!=='oc-sheet')return {main:snapshot.images[0].src};const slots=['main','portrait','clothing','accessories','front','side','back','expression'];const images=Object.fromEntries(snapshot.images.filter(image=>slots.includes(image.role)).map(image=>[image.role,image.src]));if(!images.main)throw Error('角色设定缺少主参考，请补充后带入人物资产。');return images;}
  function validateCharacterTarget(snapshot,target){if(snapshot.toolId==='oc-sheet'&&(target.type!=='asset'||target.newKind&&!['角色','人物'].includes(target.newKind)))throw Error('角色设定请带入人物资产。');}
  function characterDetails(snapshot){const profile=snapshot.toolId==='oc-sheet'&&snapshot.character?.profile;if(!profile)return {};const outfit=snapshot.character.outfit;return {characterProfile:copy(profile),...(outfit?{outfit:copy(outfit)}:{}),description:[profile.intro&&'人物简介：'+profile.intro,profile.traits&&'性格与特点：'+profile.traits,outfit?.description&&'服饰与配饰：'+outfit.description,profile.story&&'角色小故事：'+profile.story,profile.notes&&'补充设定：'+profile.notes].filter(Boolean).join('\n')};}
  function attachPerformance(assets,snapshot,target,id,scope,projectId,episodeId){
    const source=snapshot.character?.source;
    if(target.type!=='asset'||target.newKind)throw Error('表情与姿势请挂到已有角色下面。');
    const asset=assets.find(a=>a.id===target.id);if(!asset||!['角色','人物'].includes(asset.kind))throw Error('请选择已有的角色 / 人物。');
    if(['comic','video'].includes(source?.scope)&&(source.scope!==scope||source.assetId!==asset.id||source.projectId!==projectId||(scope==='video'&&source.episodeId!==episodeId)))throw Error('角色来源不一致，请带回原角色，或重新选取目标角色生成。');
    if(!snapshot.performance?.length||snapshot.performance.some(item=>!item.request||!['expression','pose'].includes(item.type)))throw Error('请先保留有效的表情或姿势参考。');
    const references={id:id('performance-ref'),title:snapshot.title,source:copy(source||{}),items:copy(snapshot.performance),notice:snapshot.notice,createdAt:snapshot.savedAt||snapshot.createdAt};
    asset.performanceRefs??=[];asset.performanceRefs.push(references);
  }
  function addComic(project,snapshot,target,id,pageStudio=root.WholePageStudio){
    if(snapshot.toolId==='video-redraw'&&snapshot.redraw)throw Error('转绘短片请选择视频镜头。');
    if(snapshot.toolId==='image-motion'&&snapshot.motion)throw Error('动态方案请带入视频镜头。');
    imageResult(snapshot);validateCharacterTarget(snapshot,target);if(snapshot.toolId==='expressions'){attachPerformance(project.assets,snapshot,target,id,'comic',project.id);return project;}const first=snapshot.images[0].src,preparedImages=target.type==='asset'?assetImages(snapshot):null;
    if(target.type==='asset'){
      let asset=project.assets.find(x=>x.id===target.id);
      if(!asset&&target.newKind){if(project.assets.length>=40)throw Error('漫画资产已达40项，请选择现有资产。');asset={id:id('asset'),kind:target.newKind,name:snapshot.character?.name||snapshot.title,stable:'',reference:'',visualVersions:[]};project.assets.push(asset);}
      if(!asset)throw Error('目标人物、场景或道具不存在。');
      if(snapshot.toolId==='oc-sheet'&&!['角色','人物'].includes(asset.kind))throw Error('角色设定请带入人物资产。');
      const images=preparedImages;asset.visualVersions??=[];asset.visualVersions.push({id:id('tool-visual'),label:snapshot.title+' · 工具候选',origin:'创作工具示例',images,description:snapshot.prompt||'',...characterDetails(snapshot),toolSnapshot:provenance(snapshot),createdAt:snapshot.savedAt});
    }else if(target.type==='whole-page'){
      const page=project.bodyPagination?.episodes?.[target.episodeId]?.pages.find(x=>x.id===target.id);if(!page)throw Error('目标分页已失效，请重新选择。');
      project.wholePageStudio??={version:1,works:{},selected:{}};
      const work=project.wholePageStudio.works[page.id]??={pageId:page.id,versions:[],requests:[],adoptedId:'',draft:''};
      const sourceSnapshot=pageStudio.snapshot(project,target.episodeId,page);
      work.versions.push({id:id('tool-page'),image:first,origin:'创作工具示例',label:snapshot.title,sourceSnapshot,signature:pageStudio.signature(sourceSnapshot),toolSnapshot:provenance(snapshot),createdAt:snapshot.savedAt});
    }else{
      const page=project.scenes.find(x=>x.id===target.id);if(!page)throw Error('目标漫画页不存在。');
      const container=target.panelId?page.panels.find(x=>x.id===target.panelId):page;if(!container)throw Error('目标漫画格不存在。');
      container.imageCandidates??=[];container.imageCandidates.push({id:id('tool-image'),image:first,origin:'创作工具示例',createdAt:snapshot.savedAt,toolSnapshot:provenance(snapshot)});
    }
    return project;
  }
  function addVideo(context,snapshot,target,id){
    if(snapshot.toolId==='video-redraw'&&snapshot.redraw){
      if(target.type!=='shot')throw Error('转绘短片请选择视频镜头。');
      const shot=context.e.productionShots?.find(item=>item.id===target.id);if(!shot)throw Error('目标镜头不存在。');
      if(shot.direction?.locked)throw Error('镜头已锁定，请先解锁。');
      imageResult(snapshot);
      if(!/^assets\/[\w/-]+\.mp4$/.test(snapshot.redraw.video))throw Error('转绘视频来源无效。');
      shot.candidates??=[];shot.candidates.unshift({id:id('tool-redraw'),version:shot.candidates.length+1,kind:'storyboard-video',mode:'tool-redraw-demo',status:'ready',prototype:true,image:snapshot.images[0].src,media:{url:snapshot.redraw.video,in:0,out:snapshot.redraw.duration,source:'视频转绘预置调色演示',silent:true},redrawClip:copy(snapshot.redraw),input:{shotId:shot.id,shotVersion:shot.version,toolId:snapshot.toolId,prompt:snapshot.prompt,assetRefs:[]},origin:'视频转绘 · 预置调色演示短片，非 AI 转绘',toolSnapshot:provenance(snapshot)});
      return context;
    }
    if(snapshot.toolId==='image-motion'&&snapshot.motion&&target.type!=='shot')throw Error('动态方案请选择视频镜头。');
    if(snapshot.toolId==='image-motion'&&snapshot.motion&&context.e.productionShots?.find(shot=>shot.id===target.id)?.direction?.locked)throw Error('镜头已锁定，请先解锁再添加方案。');
    imageResult(snapshot);validateCharacterTarget(snapshot,target);const first=snapshot.images[0].src,preparedImages=target.type==='asset'?assetImages(snapshot):null,w=context.e.videoFlow?.workspace;if(!w)throw Error('请先打开视频作品初始化视觉资产。');
    if(snapshot.toolId==='expressions'){attachPerformance(w.assets,snapshot,target,id,'video',context.p?.id,context.c?.id);return context;}
    if(target.type==='asset'){
      let asset=w.assets.find(x=>x.id===target.id);
      if(!asset&&target.newKind){asset={id:id('vf-asset'),kind:target.newKind,name:snapshot.character?.name||snapshot.title,candidates:[],adoptedId:null};w.assets.push(asset);}
      if(!asset)throw Error('目标视频参考资产不存在。');if(snapshot.toolId==='oc-sheet'&&!['角色','人物'].includes(asset.kind))throw Error('角色设定请带入人物资产。');const images=preparedImages;asset.candidates??=[];
      asset.candidates.unshift({id:id('vf-visual'),label:snapshot.title+' · 工具候选',origin:'创作工具示例',scope:'video',images,image:images.main,description:snapshot.prompt||'',...characterDetails(snapshot),toolSnapshot:provenance(snapshot),at:snapshot.savedAt});
    }else{
      const shot=context.e.productionShots.find(x=>x.id===target.id);if(!shot)throw Error('目标镜头不存在。');
      shot.candidates??=[];shot.candidates.unshift({id:id('vf-image'),version:shot.candidates.length+1,kind:'storyboard-image',mode:'layout-placeholder',status:'ready',prototype:true,image:first,origin:'创作工具示例',orderedReferences:snapshot.images.map(image=>({role:image.role,image:image.src})),input:{shotId:shot.id,shotVersion:shot.version,toolId:snapshot.toolId},toolSnapshot:provenance(snapshot)});
      if(snapshot.toolId==='image-motion'&&snapshot.motion){const candidate=shot.candidates[0];candidate.motionPlan=copy(snapshot.motion);candidate.origin='图片动起来 · 镜头参考方案（非生成视频）';Object.assign(candidate.input,{prompt:snapshot.prompt,mode:snapshot.motion.type==='keyframes'?'keyframes':'reference',firstFrame:snapshot.images[0].src,lastFrame:snapshot.images.find(image=>image.role==='last')?.src||null});}
    }
    return context;
  }
  const api={KEY,create,addComic,addVideo};if(typeof module!=='undefined')module.exports=api;else root.ToolResults=api;
})(typeof window==='undefined'?globalThis:window);
