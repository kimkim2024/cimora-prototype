/* Copy authored story content into a new, independent adaptation project. */
(function(root){
'use strict';
function factory(M,A,P,C,Comic,Video){
 const copy=value=>JSON.parse(JSON.stringify(value));
 const targets={comic:{key:'cimora-comic-story-v1',label:'Comic'},video:{key:'cimora-video-story-v1',label:'Video'}};
 function ready(source){return !!source.storyChapters?.some(chapter=>String(chapter.body||'').trim());}
 function create(source,target){
  if(!targets[target])throw Error('Choose comic or video.');
  if(!ready(source))throw Error('Write or generate chapter text before continuing.');
  if(!source.agent?.planning)throw Error('Add a story synopsis before continuing.');
  const p=target==='video'?Video.create():A.init(M.create());
  if(target==='comic'){p.id='comic-'+p.id;Comic.ensure(p);p.comic.presetContentReady=true;}
  p.creationKind=target;
  p.original=source.original||'';
  p.sourceName=source.sourceName||'故事创作';
  p.settings=copy(source.settings||p.settings);
  p.characters=copy(source.characters||[]);
  p.storyChapters=copy(source.storyChapters);
  p.agent.planning=copy(source.agent.planning);
  p.agent.planningOrigin='imported';
  p.agent.planningSeed=source.agent.planningSeed||source.original||'';
  p.agent.demo=!!source.agent.demo;
  p.agent.constraints=source.agent.constraints||'';
  p.agent.phase='planning';
  p.agent.planningTab='overview';
  p.agent.guideScope='overview';
  p.agent.guideCollapsed=true;
  p.agent.planningUndo=[];
  p.agent.planningRedo=[];
  p.importedStory={id:source.id,title:source.title,at:new Date().toISOString()};
  P.sync(p);C.ensure(p);
  if(target==='video'){
   const fields=[['identity','身份'],['personality','性格'],['background','人物背景'],['appearance','外貌'],['signature','标志性动作'],['belongings','随身物件与规则'],['arc','人物行动线'],['relation','人物关系']];
   for(const person of p.characters){
    const description=fields.filter(([key])=>String(person[key]||'').trim()).map(([key,label])=>label+'：'+person[key]).join('\n\n');
    const asset=Video.asset(p,'人物',person.name,description);
    asset.storyPersonId=person.id;
    asset.storyProfile=copy(person);
   }
   p.video.selectedAsset=p.video.assets[0]?.id||'';
   Video.ensure(p);
  }
  return p;
 }
 function saveProject(project,target,storage){
  if(!targets[target])throw Error('Choose comic or video.');
  const {key,label}=targets[target];let state;
  try{const raw=storage.getItem(key);state=raw?JSON.parse(raw):M.initial();}
  catch{throw Error(label+' projects could not be loaded. Download a backup before trying again.');}
  if(state.version!==1||!Array.isArray(state.projects)||!Array.isArray(state.assets))throw Error(label+' project data has an unsupported format. Existing data was kept.');
  state.projects.push(project);state.active=project.id;
  try{storage.setItem(key,JSON.stringify(state));}
  catch{throw Error('The new '+label.toLowerCase()+' project could not be saved. Download a backup, free up storage, and try again.');}
  return {project,url:'#/app/'+target+'?'+new URLSearchParams({project:project.id,tab:'overview'})};
 }
 function save(source,target,storage){return saveProject(create(source,target),target,storage);}
 return {ready,create,save,saveProject};
}
if(typeof module!=='undefined')module.exports=factory;
else root.StoryContinuation=factory(root.ScriptStudio,root.StoryAgent,root.StoryPlanning,root.StoryContent,root.ComicStoryModel,root.VideoStoryModel);
})(globalThis);
