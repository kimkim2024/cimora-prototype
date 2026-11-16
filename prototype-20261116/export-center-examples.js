/* 用户主动载入的可下载演示；只新增带标记的副本，不覆盖已有作品。 */
(()=>{
 'use strict';
 const H=StudioLibrary,S=Site,C=Cimora,copy=v=>JSON.parse(JSON.stringify(v)),group='export-demo-v1';
 const pageImage=i=>'comic-studio/examples/romance-two/josei/deliverables/page-0'+i+'.png';
 async function load(){
  H.guard();
  const db=JSON.parse(localStorage.getItem(H.STORY)||'{"version":1,"projects":[],"assets":[]}');
  let story=db.projects.find(p=>p.exportCenterExample===group);
  if(!story){
   story=ScriptFullExample.build(ScriptStudio);story.title='离城之前 · 导出演示故事';story.exportCenterExample=group;story.stage=5;
   story.outline=story.outline.slice(0,2);story.scripts=Object.fromEntries(story.outline.map(e=>[e.id,story.scripts[e.id]]));story.bodyOpenedIds=story.outline.map(e=>e.id);story.plannedEpisodes=2;
   const first=story.outline[0].id;story.exportDemoOriginalText=ScriptStudio.bodyText(story,first);
   story.scripts[first].fullText=story.exportDemoOriginalText+'\n\n陆川没有立刻放下手机。他把那句“明天见”又读了一遍，才关掉屋里的灯。';
   db.projects.push(story);H.store(H.STORY,db);
  }
  const comicDb=JSON.parse(localStorage.getItem(H.COMIC)||'{"version":1,"projects":[]}');
  let comic=comicDb.projects.find(p=>p.exportCenterExample===group);
  if(!comic){
   if(comicDb.projects.length>=30)throw Error('漫画项目已达上限，请先整理后载入。');
   comic=ScriptStudio.toComic(ScriptStudio.asset(story),story.outline[0].id);comic.title='离城之前 · 导出演示漫画';comic.exportCenterExample=group;comic.stage=3;comic.flowVersion=2;
   comic.source.outline=comic.source.outline.slice(0,1);comic.bodyPagination={episodes:{}};comic.wholePageStudio={version:1,works:{},selected:{}};
   const ep=comic.source.outline[0],text=ScriptStudio.bodyText(story,ep.id),pieces=text.split(/\n\s*\n/),split=Math.ceil(pieces.length/2);
   const pages=[pieces.slice(0,split).join('\n\n'),pieces.slice(split).join('\n\n')].map((text,i)=>({id:S.id('export-page'),name:'第'+(i+1)+'页',text,refs:[],references:[],notes:'导出演示：复用已有日漫风成稿，展示单页与整集下载。'}));
   comic.bodyPagination.episodes[ep.id]={text,origin:'故事正文快照',sourceId:ep.id,pages,archives:[],selected:pages[0].id,bodyHistory:[]};comic.activeEpisodeId=ep.id;
   pages.forEach((pg,i)=>{const id=S.id('export-art');comic.wholePageStudio.works[pg.id]={pageId:pg.id,draft:'',adoptedId:id,versions:[{id,image:pageImage(i+1),label:'已有日漫风成稿 · 演示用',origin:'复用已完成示例图片',createdAt:new Date().toISOString()}],requests:[]};});
   if(!ComicStudio.validProject(comic))throw Error('演示漫画保存校验失败。');comicDb.projects.push(comic);H.store(H.COMIC,comicDb);
  }
  let video=S.state.projects.find(p=>p.exportCenterExample===group),context;
  if(!video){
   context=C.M.videoFlow.create(C.M.videoFlow.fromComic(comic),{title:'离城之前 · 导出演示视频',ratio:'16:9'});context.p.exportCenterExample=group;
   const w=C.M.videoWorkspace.ensure(context);w.stage=4;w.finishing={episodes:{},voices:{}};
   for(const ep of w.episodes)w.finishing.episodes[ep.id]={clips:{},order:[],sounds:{},mix:{music:'不使用配乐',originalVolume:80,voiceVolume:90,musicVolume:25,duck:true},versions:[{id:S.id('export-plan'),label:'整集拼接方案 · 未输出视频或混音',prototype:true,clips:[],audio:[],notes:'演示：这里保存视频拼接方案 JSON；尚未生成镜头短片、对白或背景音乐。'}]};
   if(!S.save())throw Error('本机空间不足，视频演示尚未保存。');C.M.save();video=context.p;
  }
  let tool=ToolStudio.store.list().find(r=>r.exportCenterExample===group);
  if(!tool){
   const src='assets/pngtuber/idle.png';
   tool=ToolStudio.store.save('anime-draw',{title:'原创角色 · 独立工具导出演示',kind:'image',exportCenterExample:group,images:[{role:'main',src}],inputs:{},params:{},notice:'导出演示 · 复用已有角色图，无需关联项目，未调用生图模型。'});
  }
  let records=await ExportCenter.all();
  const put=async(key,options)=>{if(records.some(r=>r.exampleKey===group+':'+key))return;const row=await ExportCenter.deliver({...options,downloadNow:false,meta:{...options.meta,example:true,exampleKey:group+':'+key}});records.push(row);};
  const eid=story.outline[0].id,original=copy(story);original.scripts[eid].fullText=story.exportDemoOriginalText;
  const storyMeta={source:'story',projectKey:'story:'+story.id,projectTitle:story.title,title:story.title,scope:'第1集',scopeKey:eid,episodeId:eid,url:'/app/script?project='+encodeURIComponent(story.id)};
  await put('story-first',{files:ExportCenterModel.storyFiles(original,[eid],{},ScriptStudio.bodyText),meta:{...storyMeta,notice:'演示 · 首稿。与修改稿对比结尾，旧文件保持不变。'}});
  await put('story-revised',{files:ExportCenterModel.storyFiles(story,[eid],{},ScriptStudio.bodyText),meta:{...storyMeta,notice:'演示 · 修改稿。结尾新增陆川重读“明天见”的动作；返回来源可继续编辑。'}});
  const ep=comic.source.outline[0],pages=comic.bodyPagination.episodes[ep.id].pages,files=[];
  for(const [i,pg]of pages.entries()){const response=await fetch(pageImage(i+1));if(!response.ok)throw Error('漫画成稿示例读取失败');files.push({name:'第1集/'+String(i+1).padStart(3,'0')+'.png',data:await response.blob()});}
  await put('comic',{files,filename:comic.title+'-第1集-2页',meta:{source:'comic',projectKey:'comic:'+comic.id,projectTitle:comic.title,title:comic.title,scope:'第1集 · 2页成稿',scopeKey:ep.id+':all',episodeId:ep.id,pageId:pages[0].id,url:'/app/comic?project='+encodeURIComponent(comic.id),notice:'演示 · 两张已有日漫风漫画页，按页码打包；返回来源可看单页成稿。'}});
  await put('tool',{files:await ToolStudio.exportFiles(tool),filename:tool.title,meta:{source:'tool',projectKey:'',projectTitle:'个人创作',title:tool.title,scope:'单张 PNG · 无需项目',scopeKey:tool.id,toolId:tool.toolId,toolResultId:tool.id,url:'/app/tools/anime-draw',notice:tool.notice}});
  const project=H.load().projects.find(p=>p.kind==='video'&&p.id===video.id),entry=project?.entries[0],episode=entry?.workspace.episodes[0];
  if(!episode)throw Error('视频示例来源已移除，请在我的项目检查。');
  await put('video',{files:[{name:'第1集-拼接方案.json',data:{format:'cimora-video-assembly-plan',notice:'导出演示：拼接方案，未输出 MP4 或混音文件。',project:project.title,episode:episode.title,version:copy(entry.workspace.finishing.episodes[episode.id].versions[0])},type:'application/json'}],meta:{source:'video',projectKey:project.key,projectTitle:project.title,title:project.title+' · 拼接方案',scope:'第1集 · 方案示例',scopeKey:entry.hostId+'|'+episode.id,hostId:entry.hostId,episodeId:episode.id,url:'/app/video?project='+encodeURIComponent(project.id)+'&episode='+encodeURIComponent(entry.hostId)+'&stage=4',notice:'演示 · 仅拼接方案 JSON，没有生成视频或声音。'}});
  await ExportCenter.refresh();
 }
 async function filesOnly(){
  const story=ScriptFullExample.build(ScriptStudio);story.outline=story.outline.slice(0,2);const ep=story.outline[0],first=ScriptStudio.bodyText(story,ep.id),revised=first+'\n\n陆川没有立刻放下手机。他把那句“明天见”又读了一遍，才关掉屋里的灯。';
  const existing=await ExportCenter.all();
  const put=async(key,source,title,scope,files,exampleSource,scopeKey=key)=>{
   if(existing.some(r=>r.exampleKey===group+':'+key))return;
   await ExportCenter.deliver({files,filename:title+'-'+scope,downloadNow:false,meta:{source,title,scope,scopeKey,projectKey:source==='tool'?'':'export-demo:'+source,projectTitle:source==='tool'?'个人创作':title,example:true,exampleKey:group+':'+key,exampleSource,notice:'演示 · 本机文本存储空间不足，未能完整保存示例项目；文件已保存，可查看独立来源预览和下载。'+(source==='video'?'仅拼接方案 JSON，未输出视频或混音。':'')}});
  };
  const title='离城之前 · 导出演示故事';
  await put('story-first','story',title,'第1集',[{name:'第1集-首稿.txt',data:title+'\n\n'+ep.title+'\n\n'+first,type:'text/plain;charset=utf-8'}],{kind:'story',text:first},'quota-story');
  await put('story-revised','story',title,'第1集',[{name:'第1集-修改稿.txt',data:title+'\n\n'+ep.title+'\n\n'+revised,type:'text/plain;charset=utf-8'}],{kind:'story',text:revised},'quota-story');
  if(!existing.some(r=>r.exampleKey===group+':comic')){
   const files=[];for(let i=1;i<=2;i++){const response=await fetch(pageImage(i));if(!response.ok)throw Error('漫画示例图片读取失败，请检查本地服务。');files.push({name:'第1集/00'+i+'.png',data:await response.blob()});}
   await put('comic','comic','离城之前 · 导出演示漫画','第1集 · 2页成稿',files,{kind:'comic',text:'复用已有日漫风漫画成稿，演示按页码打包。',images:[pageImage(1),pageImage(2)]});
  }
  const tool={toolId:'anime-draw',title:'原创角色 · 独立工具导出演示',kind:'image',images:[{role:'main',src:'assets/pngtuber/idle.png'}],inputs:{},params:{}};
  if(!existing.some(r=>r.exampleKey===group+':tool'))await put('tool','tool',tool.title,'单张 PNG · 无需项目',await ToolStudio.exportFiles(tool),{kind:'tool',text:'独立创作工具的角色图，复用已有图片；没有调用生图模型。',images:tool.images.map(x=>x.src)});
  const plan={format:'cimora-video-assembly-plan',notice:'演示拼接方案，未生成镜头短片、对白、背景音乐或 MP4。',project:'离城之前',episode:ep.title,version:{prototype:true,clips:[],audio:[]}};
  await put('video','video','离城之前 · 导出演示视频 · 拼接方案','第1集 · 方案示例',[{name:'第1集-拼接方案.json',data:plan,type:'application/json'}],{kind:'video',text:'视频拼接方案说明：本示例仅展示方案文件，不含视频或音频。\n\n'+JSON.stringify(plan,null,2)});
  await ExportCenter.refresh();
 }
 async function resilientLoad(){
  try{await load();}catch(error){if(!/空间不足|存储不足|存储不可用|QuotaExceeded/i.test(error.message))throw error;await filesOnly();}
 }
 window.ExportCenterExamples={load:resilientLoad};
})();
