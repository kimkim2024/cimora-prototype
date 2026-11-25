/* Carry authored comic material into a separate video project, without reinterpreting it. */
(function(root){
'use strict';
function factory(Story,Video,Script){
 const copy=x=>JSON.parse(JSON.stringify(x));
 function create(source,production,resolveImage=x=>x){
  if(!production||production.storyDraftId!==source.id)throw Error('The comic production project does not match this story. Reopen Generate & Edit.');
  const p=Story.create(source,'video'),reference={sourceProjectId:source.id,productionId:production.id,title:source.title,createdAt:new Date().toISOString(),chapters:[]};
  for(const a of p.video.assets){
   const visual=source.comic?.visuals?.[a.storyPersonId],adopted=visual?.versions?.find(v=>v.id===visual.adoptedId);
   if(adopted?.images?.main){
    const version={id:a.id+'-comic-image',url:resolveImage(adopted.images.main),name:'漫画采用形象 · '+a.name,sourceVersionId:adopted.id};
    a.versions.push(version);a.adoptedId=version.id;a.selectedVersion=version.id;
    a.comicVisual=copy({appearance:visual.appearance||'',clothing:visual.clothing||'',style:adopted.style||source.comic.style,images:Object.fromEntries(Object.entries(adopted.images).map(([k,url])=>[k,resolveImage(url)]))});
   }
  }
  for(const chapter of production.storyPlan?.episodes||[]){
   const pages=production.bodyPagination?.episodes?.[chapter.id]?.pages||[];
   reference.chapters.push({id:chapter.id,title:chapter.title,pages:pages.map((pg,index)=>{
    const work=production.wholePageStudio?.works?.[pg.id],image=work?.versions?.find(v=>v.id===work.adoptedId);
    return {id:pg.id,number:index+1,pageScript:Script.read(pg),sourceText:Script.source(pg),refs:copy(pg.refs||[]),outputRatio:production.wholePageStudio?.confirmedOutputRatio||work?.outputRatio||'9:16',image:image?{id:image.id,url:resolveImage(image.image),sourceSnapshot:copy(image.sourceSnapshot||null)}:null};
   })});
  }
  p.video.comicReference=reference;
  p.sourceName='漫画创作 · '+source.title;
  p.importedComic={id:source.id,productionId:production.id,title:source.title};
  return p;
 }
 function save(source,production,storage,resolveImage){return Story.saveProject(create(source,production,resolveImage),'video',storage);}
 return {create,save};
}
if(typeof module!=='undefined')module.exports=factory;else root.ComicContinuation=factory(root.StoryContinuation,root.VideoStoryModel,root.ComicPageScript);
})(globalThis);
