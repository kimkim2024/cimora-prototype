/* 导出的范围与文件约定；不修改原工程。 */
(function(root){
 'use strict';
 const safeName=value=>String(value||'未命名').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/^\.+/,'').replace(/[. ]+$/,'').slice(0,90)||'未命名';
 function selected(episodes,ids){
  if(!ids?.length)throw Error('请至少选择一集。');
  if(ids.some(id=>!episodes.some(e=>e.id===id)))throw Error('未找到选中的集，请重新选择。');
  return episodes.filter(e=>ids.includes(e.id));
 }
 const plain=value=>typeof value==='string'?value:JSON.stringify(value||'',null,2);
 function nativeSource(project,engines,assets=[],imageURL=()=>null){
  const units=[...(project.chapters||[]),...(project.episodes||[])];
  const chapters=units.map(ch=>({...ch,body:engines[ch.id]?.script||''}));
  const pages={},works={};
  for(const chapter of chapters){
   const boards=engines[chapter.id]?.boards||[];pages[chapter.id]={pages:boards.map(b=>({id:b.id,text:b.action}))};
   for(const board of boards)works[board.id]={adoptedId:board.comic?.adoptedId,versions:(board.comic?.images||[]).map(v=>({...v,image:v.image||imageURL(v)}))};
  }
  return {id:project.id,title:project.name,storyChapters:chapters,storyPlan:{episodes:chapters},characters:assets.filter(a=>a.projectId===project.id&&a.type==='角色').map(a=>({...(a.storyProfile||{}),id:a.id,name:a.name,description:a.desc})),bodyPagination:{episodes:pages},wholePageStudio:{works}};
 }
 function workspaceSource(project){
  if(project.kind!=='comic'||!project.production)return project.raw;
  const chapters=project.raw.storyChapters?.length?project.raw.storyChapters:project.production.storyPlan?.episodes||project.production.comicEpisodes||[];
  return {...project.production,id:project.id,title:project.title,storyPlan:{...project.production.storyPlan,episodes:chapters}};
 }
 function sourcePosition(project,record,metadata={}){
  let chapterId=record.hostId||record.episodeId;
  if(record.projectKey!==project.key){const bridge=metadata.projects?.[project.key]?.legacyBridge,reverse=Object.entries(bridge?.chapters||{});chapterId=bridge?.episodes?.[record.episodeId]||reverse.find(([,id])=>id===chapterId)?.[0]||chapterId;}
  return {chapterId,tab:project.kind==='story'?'chapters':project.kind==='comic'?'production':'generation',pageId:record.pageId,stage:project.kind==='video'?'review':undefined};
 }
 function videoDraftFiles(project,ids,retainedEntries=[]){
  const chapters=selected(project.storyChapters||[],ids);
  return chapters.map((chapter,index)=>({name:String(index+1).padStart(2,'0')+'-'+safeName(chapter.title)+'-项目方案.json',type:'application/json',data:{format:'cimora-video-project-plan',notice:'项目与镜头方案，不包含 MP4 成品。',project:project.title,chapter,assets:project.video?.assets||[],shots:(project.video?.shots||[]).filter(s=>s.chapterId===chapter.id),retainedFinishing:retainedEntries.find(e=>e.hostId===chapter.workspaceHostId)?.workspace?.finishing?.episodes?.[chapter.workspaceEpisodeId]}}));
 }
 function storyFiles(p,ids,extra={},body){
  const outline=Array.isArray(p.storyChapters)&&p.storyChapters.length?p.storyChapters:p.outline||[];const episodes=selected(outline,ids);
  const text=e=>typeof e.body==='string'?e.body:body?body(p,e.id):typeof p.scripts?.[e.id]?.fullText==='string'?p.scripts[e.id].fullText:(p.scripts?.[e.id]?.scenes||[]).map((s,i)=>`场景${i+1} ${s.time||''} ${s.place||''}\n${s.action||''}\n${s.dialogue||''}\n${s.mind||''}`).join('\n\n');
  const missing=episodes.filter(e=>!text(e).trim());if(missing.length)throw Error('缺少正文：'+missing.map(e=>e.title).join('、')+'。请返回正文写作完成后导出。');
  const range=episodes.map(e=>String(outline.indexOf(e)+1).padStart(2,'0')).join('、');
  const files=[{name:safeName(p.title)+'-第'+range+'集.txt',data:p.title+'\n\n'+episodes.map(e=>`第${outline.indexOf(e)+1}集 · ${e.title}\n\n${text(e)}`).join('\n\n────────────\n\n')}];
  if(extra.characters){if(!p.characters?.length)throw Error('当前没有人物设定，请取消附带选项或先补充人物。');const fields={name:'姓名',aliases:'别名',identity:'身份',relation:'人物关系',state:'当前状态',personality:'性格',description:'介绍',goal:'目标',background:'背景'};files.push({name:'人物设定.txt',data:p.characters.map(c=>Object.entries(c).filter(([key,value])=>key!=='id'&&value!==''&&value!=null).map(([key,value])=>(fields[key]||key)+'：'+plain(value)).join('\n')).join('\n\n')});}
  if(extra.outline)files.push({name:'分集大纲.txt',data:episodes.map(e=>e.title+'\n'+plain(e.events||e.summary||p.storyWriting?.items?.find(x=>x.chapterId===e.id)?.summary||'（未填写大纲）')).join('\n\n')});
  return files;
 }
 function comicPages(p,episodes,ids,pageId,completedOnly=false){
  const result=[],missing=[];for(const e of selected(episodes,ids)){
   const pages=p.bodyPagination?.episodes?.[e.id]?.pages||[];
   if(!pages.length)missing.push(e.title+'：尚未分页');
   if(pageId&&!pages.some(x=>x.id===pageId))throw Error('未找到选中的页面。');
   for(const [index,page]of pages.entries()){
    if(pageId&&page.id!==pageId)continue;
    const work=p.wholePageStudio?.works?.[page.id],version=work?.versions?.find(v=>v.id===work.adoptedId);
    if(!version?.image){missing.push(e.title+' · 第'+(index+1)+'页：未采用成稿');continue;}
    result.push({episodeId:e.id,pageId:page.id,versionId:version.id,image:version.image,name:String(episodes.indexOf(e)+1).padStart(2,'0')+'-'+safeName(e.title)+'/'+String(index+1).padStart(3,'0')+'.png'});
   }
  }
  if(missing.length&&!completedOnly)throw Error('未导出，当前范围缺少成稿：\n'+missing.join('\n')+'\n请返回生成与编辑完成；也可仅导出已有的单页。');
  return result;
 }
 // Availability uses the same content rules as the actual exporters.
 function availability(source,p,episodes,body,project={}){
  return episodes.map(e=>{
   let ready=0,total=1;
   if(source==='story'){try{storyFiles(p,[e.id],{},body);ready=1;}catch{}}
   if(source==='comic'){
    const pages=p.bodyPagination?.episodes?.[e.id]?.pages||[];total=pages.length;
    ready=pages.filter(page=>{const w=p.wholePageStudio?.works?.[page.id];return w?.versions?.some(v=>v.id===w.adoptedId&&v.image);}).length;
   }
   if(source==='video')ready=project.store==='videoDraft'
    ?Number(Boolean(String(e.body||'').trim()||(p.video?.shots||[]).some(s=>s.chapterId===e.id)))
    :Number(Boolean(e.entry?.workspace.finishing?.episodes?.[e.episodeId]?.versions?.[0]));
   return {id:e.id,ready,total,label:source==='comic'?(total?`${ready}/${total} pages adopted`:'No pages yet'):source==='story'?(ready?'Story text available':'No story text yet'):(ready?'Video plan available':'No video plan yet')};
  });
 }
 const api={availability,safeName,selected,storyFiles,comicPages,nativeSource,workspaceSource,sourcePosition,videoDraftFiles};
 if(typeof module!=='undefined')module.exports=api;else root.ExportCenterModel=api;
})(typeof window==='undefined'?globalThis:window);
