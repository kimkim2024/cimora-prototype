(()=>{
  async function load(){
    const H=StudioLibrary,C=Cimora,S=Site,M=ScriptStudio,copy=value=>JSON.parse(JSON.stringify(value));
    H.guard();if(H.meta().examples)return;
    const storyDb=JSON.parse(localStorage.getItem(H.STORY)||'{"version":1,"projects":[],"assets":[]}');
    const comicDb=JSON.parse(localStorage.getItem(H.COMIC)||'{"version":1,"projects":[]}');
    if(comicDb.projects.length>=30)throw Error('漫画工程达到上限，请先整理工程。');
    const response=await fetch('comic-studio/examples/romance-two/josei/project.json');if(!response.ok)throw Error('示例参考资料读取失败，请检查本地服务');
    const reference=await response.json();
    const story=ScriptFullExample.build(M);story.title='离城之前 · 管理示例故事';story.managementExample=true;story.stage=5;
    story.outline=story.outline.slice(0,2);story.scripts=Object.fromEntries(story.outline.map(ep=>[ep.id,story.scripts[ep.id]]));story.bodyOpenedIds=story.outline.map(ep=>ep.id);story.plannedEpisodes=2;
    const saved=M.asset(story);story.savedAssetId=saved.assetId;
    const comic=M.toComic(saved);comic.title='离城之前 · 管理示例漫画';comic.managementExample=true;comic.stage=2;comic.flowVersion=2;
    comic.assets=comic.assets.filter(asset=>['陆川','许宁'].includes(asset.name));
    for(const asset of comic.assets){const ref=reference.assets.find(item=>item.name===asset.name),version=ref?.visualVersions.find(version=>version.id===ref.adoptedVisualId);if(!version)throw Error('角色示例参考缺失');asset.visualVersions=[{...copy(version),label:'基础形象 · 现有参考图',origin:'已有示例参考素材',description:'复用已有角色图片，演示管理与引用关系。'}];asset.adoptedVisualId=version.id;asset.reference=version.images.main;asset.storyProfile=copy(story.characters.find(person=>person.name===asset.name)||{});}
    const scene=reference.assets.find(asset=>asset.kind==='场景');if(scene)comic.assets.push(copy(scene));
    comic.bodyPagination={episodes:{}};
    for(const ep of comic.source.outline){const text=M.bodyText(story,ep.id),paragraphs=text.split(/\n\s*\n/),first=paragraphs.slice(0,Math.max(1,Math.ceil(paragraphs.length/2))).join('\n\n'),second=text.slice(first.length);let offset=0;
      const pages=[first,second].filter(Boolean).map((content,i)=>{const start=offset;offset+=content.length;return {id:S.id('manage-page'),name:'第'+(i+1)+'页',text:content,start,end:offset,refs:comic.assets.map(asset=>({assetId:asset.id,versionId:asset.adoptedVisualId,via:'management-example'})),references:[],notes:'管理示例：分页内容可在漫画编排继续调整。'};});
      comic.bodyPagination.episodes[ep.id]={text,origin:'故事正文快照',sourceId:ep.id,pages,archives:[],selected:pages[0]?.id||'',bodyHistory:[]};
    }
    if(!ComicStudio.validProject(comic))throw Error('示例漫画未通过保存校验');
    const beforeSite=copy(S.state),beforeStory=localStorage.getItem(H.STORY),beforeComic=localStorage.getItem(H.COMIC),beforeMeta=localStorage.getItem(H.KEY);
    try{
      const context=C.M.videoFlow.create(C.M.videoFlow.fromComic(comic),{title:'离城之前 · 管理示例视频',ratio:'16:9'});
      const workspace=C.M.videoWorkspace.ensure(context);workspace.stage=2;context.p.managementExample=true;context.p.updatedAt=new Date().toISOString();workspace.planConfirmed=true;
      for(const asset of workspace.assets){asset.candidates=[];asset.adoptedId=null;asset.sourceLink={projectId:comic.id,assetId:asset.sourceId||asset.id,versionId:null};}
      if(!S.save())throw Error('本机空间不足，未能保存示例视频');
      storyDb.projects.push(story);storyDb.assets.push(saved);comicDb.projects.push(comic);
      H.store(H.STORY,storyDb);H.store(H.COMIC,comicDb);
      const comicKey='comic:'+comic.id,videoKey='video:'+context.p.id,host=context.c.id,hero=comic.assets.find(asset=>asset.name==='陆川'),heroKey=comicKey+':'+hero.id;
      const outfitId=S.id('outfit-example'),voiceId=S.id('voice-example'),takeId=S.id('take-example'),musicId=S.id('music-example'),videoId=S.id('video-example');
      const personal=[
        {key:outfitId,id:outfitId,type:'图像',subtype:'服饰参考',name:'陆川 · 服饰参考（工具成果示例）',description:'演示把工具保存的参考图带入漫画人物。本图复用已有角色设定图，未调用生图或制作新服饰。选用后作为候选，由用户确认采用。',origin:'创作工具 · 管理示例',ownerName:'个人资产',tool:true,image:'comic-studio/'+hero.reference,version:{id:'outfit-example-v1',images:{main:'comic-studio/'+hero.reference},label:'已保存服饰参考'},versions:[{id:'outfit-example-v1',images:{main:'comic-studio/'+hero.reference},label:'已保存服饰参考'}],raw:{toolId:'anime-draw'},usages:[],savedAt:new Date().toISOString(),url:'/app/tools/anime-draw',parentAssetKey:heroKey},
        {key:voiceId,id:voiceId,type:'声音',subtype:'角色音色',name:'陆川 · 克制青年音（占位）',description:'角色可复用的声音设定：青年男声，低声、自然、克制。正式接入后在此试听不同音色并用于角色；音色不等于某段台词录音。',parentAssetKey:heroKey,owner:comicKey,placeholder:true},
        {key:takeId,id:takeId,type:'声音',subtype:'配音片段',name:'第1集 · 陆川对白（占位）',description:'一段具体台词的配音：“这么晚，怎么突然想起加我？”正式接入后保存声音文件、台词、时长、情绪，并在整集制作中剪辑替换。',owner:videoKey,placeholder:true},
        {key:musicId,id:musicId,type:'声音',subtype:'背景音乐',name:'离城夜晚 · 轻钢琴（占位）',description:'用于夜宵与好友申请段落的低音量配乐。正式接入后可试听、选择版本，并在整集制作的背景音乐轨道调整。',owner:videoKey,placeholder:true},
        {key:videoId,id:videoId,type:'视频',subtype:'视频片段',name:'第1集 · 夜宵收到消息（占位）',description:'正式生成后这里保存镜头视频，记录关联人物、来源分页与采用版本，可带入整集制作。本示例没有生成视频。',owner:videoKey,placeholder:true}
      ].map(asset=>({...asset,ownerName:asset.owner===videoKey?context.p.name:asset.owner===comicKey?comic.title:asset.ownerName,origin:asset.origin||'管理示例 · 说明占位',version:asset.version||{id:asset.id,label:'占位说明'},versions:asset.versions||[{id:asset.id,label:'占位说明'}],raw:asset.raw||{},usages:asset.owner?[{projectKey:asset.owner,label:asset.owner===videoKey?context.p.name:comic.title,versionId:asset.id}]:asset.usages||[]}));
      await H.changeMeta(value=>{value.personal.push(...personal);value.examples={story:'story:'+story.id,comic:comicKey,video:videoKey,host,outfit:outfitId,hero:heroKey};});
    }catch(error){
      const savedDb=C.M.db;for(const key of Object.keys(S.state))if(key!=='cimora')delete S.state[key];Object.assign(S.state,copy(beforeSite));for(const key of Object.keys(savedDb))delete savedDb[key];Object.assign(savedDb,copy(beforeSite.cimora));S.state.cimora=savedDb;S.save();
      for(const [key,value] of [[H.STORY,beforeStory],[H.COMIC,beforeComic],[H.KEY,beforeMeta]]){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}}
      throw error;
    }
  }
  window.StudioLibraryExamples={load};
})();
