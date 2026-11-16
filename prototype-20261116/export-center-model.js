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
 function storyFiles(p,ids,extra={},body){
  const episodes=selected(p.outline||[],ids);
  const text=e=>body?body(p,e.id):typeof p.scripts?.[e.id]?.fullText==='string'?p.scripts[e.id].fullText:(p.scripts?.[e.id]?.scenes||[]).map((s,i)=>`场景${i+1} ${s.time||''} ${s.place||''}\n${s.action||''}\n${s.dialogue||''}\n${s.mind||''}`).join('\n\n');
  const missing=episodes.filter(e=>!text(e).trim());if(missing.length)throw Error('缺少正文：'+missing.map(e=>e.title).join('、')+'。请返回正文写作完成后导出。');
  const range=episodes.map(e=>String(p.outline.indexOf(e)+1).padStart(2,'0')).join('、');
  const files=[{name:safeName(p.title)+'-第'+range+'集.txt',data:p.title+'\n\n'+episodes.map(e=>`第${p.outline.indexOf(e)+1}集 · ${e.title}\n\n${text(e)}`).join('\n\n────────────\n\n')}];
  if(extra.characters){if(!p.characters?.length)throw Error('当前没有人物设定，请取消附带选项或先补充人物。');const fields={name:'姓名',aliases:'别名',identity:'身份',relation:'人物关系',state:'当前状态',personality:'性格',description:'介绍',goal:'目标',background:'背景'};files.push({name:'人物设定.txt',data:p.characters.map(c=>Object.entries(c).filter(([key,value])=>key!=='id'&&value!==''&&value!=null).map(([key,value])=>(fields[key]||key)+'：'+plain(value)).join('\n')).join('\n\n')});}
  if(extra.outline)files.push({name:'分集大纲.txt',data:episodes.map(e=>e.title+'\n'+plain(e.events||e.summary||e)).join('\n\n')});
  return files;
 }
 function comicPages(p,episodes,ids,pageId){
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
  if(missing.length)throw Error('未导出，当前范围缺少成稿：\n'+missing.join('\n')+'\n请返回生成与编辑完成；也可仅导出已有的单页。');
  return result;
 }
 const api={safeName,selected,storyFiles,comicPages};
 if(typeof module!=='undefined')module.exports=api;else root.ExportCenterModel=api;
})(typeof window==='undefined'?globalThis:window);
