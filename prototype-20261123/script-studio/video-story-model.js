/* Video workflow state is separate from story/comic drafts and legacy video projects. */
(function(root){
'use strict';
const N=typeof module!=='undefined'?require('./narrative-content.js'):root.StoryNarrative;
function factory(M,A,P,C,example){
 const copy=x=>JSON.parse(JSON.stringify(x));
 const tabs=[['overview','故事梗概'],['chapters','故事章节'],['assets','项目资产'],['storyboard','分镜剧情'],['generation','视频生成']];
 const labels={
   style:{'电影感写实':'Cinematic realism','清新日漫':'Soft anime','3D 动画':'3D animation','水彩绘本':'Watercolor illustration'},
   framing:{'远景':'Wide shot','全景':'Full shot','中景':'Medium shot','近景':'Close shot','特写':'Close-up'},
   camera:{'固定镜头':'Static camera','缓慢推进':'Slow push-in','跟随人物':'Tracking shot','横向移动':'Lateral movement','拉远':'Pull back'},
   asset:{'人物':'Character','场景':'Scene','道具':'Prop'},
 };
 function ensure(p){C.ensure(p);p.video??={};const v=p.video;v.mode??='agent';v.input??='idea';v.ratio??='16:9';v.quality??='720p';v.style??='电影感写实';v.assets??=[];v.assetKind??='人物';v.shots??=[];v.selectedAsset??='';v.selectedShot??='';v.chapter??=p.storyChapters[0]?.id||'';return v;}
 function create(){const p=A.init(M.create());p.id='video-'+p.id;p.creationKind='video';ensure(p);return p;}
 function enter(p,text,{manual=false,imported=false}={}){
  ensure(p);if(manual)p.video.mode='manual';P.enter(p,text,manual||imported,example);
  if(imported&&!p.storyChapters.length){p.original=text;p.sourceName=p.video.fileName||'Pasted story';p.agent.planning.synopsis=manual?'':text.slice(0,600);p.agent.planning.highlights=manual?'':'Original text is organized by chapter heading. Review the synopsis, which starts as an excerpt from the source.';p.agent.planning.title=p.video.fileName?.replace(/\.[^.]+$/,'')||text.match(/《([^》]+)》/)?.[1]||'Imported story';P.sync(p);p.storyChapters=splitChapters(text);p.agent.planningOrigin='imported';}
  if(!manual&&!imported&&C.kind(p)!=='custom'){C.generate(p,'characters');C.generate(p,'chapters');}
  p.agent.guideCollapsed=true;p.agent.draft='';ensure(p);return p;
 }
 function splitChapters(text){const rows=String(text).replace(/\r\n/g,'\n').split('\n'),out=[];let title='',body=[];
  const flush=()=>{if(body.join('\n').trim()||title)out.push({id:M.id('vchapter'),title:title||'Story text',body:body.join('\n').trim()});body=[];};
  for(const row of rows){if(/^\s*(?:#{1,3}\s+.+|第[零一二三四五六七八九十百千万两\d]+[章节回卷][\s：:、.．]?.*)$/.test(row)){flush();title=row.trim().replace(/^#+\s*/,'');}else body.push(row);}flush();return out;
 }
 function prerequisite(p,tab){const v=ensure(p);if(tab==='overview')return null;if(!p.agent.planning?.synopsis?.trim())return {tab:'overview',label:'the story synopsis',message:'Add a synopsis in Overview to continue.'};if(tab==='chapters')return null;if(!p.storyChapters.some(c=>c.body.trim()))return {tab:'chapters',label:'a story chapter',message:'Write at least one chapter before organizing assets and storyboard shots.'};if(tab==='assets')return null;if(!v.assets.some(a=>a.name.trim()&&a.description.trim()))return {tab:'assets',label:'project assets',message:'Add a character, scene, or prop with a name and description before creating storyboard shots.'};if(tab==='generation'&&!v.shots.length)return {tab:'storyboard',label:'the storyboard',message:'Add or generate storyboard shots before creating a video.'};return null;}
 function asset(p,kind,name='',description=''){const a={id:M.id('vasset'),kind,name,description,versions:[],adoptedId:'',selectedVersion:''};ensure(p).assets.push(a);p.video.selectedAsset=a.id;return a;}
 function extractAssets(p){const gate=prerequisite(p,'assets');if(gate)throw Error(gate.message);const v=ensure(p);if(C.kind(p)==='custom')throw Error('Add assets manually for this project. AI asset extraction is available in the sample story.');if(!p.characters.length)C.generate(p,'characters');
  const items=p.characters.map(c=>({kind:'人物',name:c.name,description:[c.identity,c.background,c.appearance].filter(Boolean).join('\n\n')}));
  if(C.kind(p)==='romance')items.push({kind:'场景',name:'旧页书店',description:'海汀街角的独立书店。门口有一张等待修好的木质阅读桌，暖色自然光。'}, {kind:'场景',name:'宵夜摊',description:'城市街边的夜间小摊，锅铲声与人群交谈声。桌椅紧凑，路灯与摊位灯交织。'}, {kind:'道具',name:'旧书与地图',description:'许宁归还的旧书，夹着一张用铅笔重新标记过的城市地图。'});
  else items.push({kind:'场景',name:'旧钟表铺',description:'临街的旧钟表修理店，木制工作台上摆着待修的钟表。'}, {kind:'道具',name:'旧怀表',description:'林时父亲留下的怀表，秒针恢复走动，会传来不完整的未来留言。'});
  let added=0;for(const x of items){if(!v.assets.some(a=>a.kind===x.kind&&a.name===x.name)){asset(p,x.kind,x.name,x.description);added++;}}v.assetKind='人物';v.selectedAsset=v.assets.find(a=>a.kind==='人物')?.id||v.assets[0]?.id||'';return added;
 }
 function selectedChapter(p){return p.storyChapters.find(c=>c.id===ensure(p).chapter)||p.storyChapters[0];}
 function shot(p,chapterId,text=''){const v=ensure(p),s={id:M.id('vshot'),chapterId,title:'',source:text,visual:text,dialogue:'',framing:'中景',camera:'固定镜头',duration:6,assetIds:v.assets.filter(a=>a.name&&text.includes(a.name)).map(a=>a.id),versions:[],adoptedId:'',request:null};v.shots.push(s);v.selectedShot=s.id;return s;}
 function generateShots(p){const gate=prerequisite(p,'storyboard');if(gate)throw Error(gate.message);const v=ensure(p),c=selectedChapter(p);if(!c?.body.trim())throw Error('Add story text to the selected chapter first.');if(v.shots.some(s=>s.chapterId===c.id))throw Error('This chapter already has a storyboard. Add shots or ask the assistant for help editing them.');const parts=c.body.split(/\n\s*\n/).filter(x=>x.trim());parts.forEach((part,i)=>{const s=shot(p,c.id,part.trim());s.title=part.trim().split(/[。！？\n]/)[0].slice(0,24)||'Shot '+(i+1);s.sourceRevision=c.body;});v.selectedShot=v.shots.find(s=>s.chapterId===c.id)?.id||'';return v.shots.filter(s=>s.chapterId===c.id);}
 function shotContent(s){return N.merge(s.visual,s.dialogue);}
 function setShotContent(s,text){if(text===shotContent(s))return false;if(s.dialogue&&!s.contentBeforeMerge)s.contentBeforeMerge={visual:s.visual,dialogue:s.dialogue};s.visual=text;s.dialogue='';return true;}
 function exportShots(p){return [p.title,...p.storyChapters.flatMap(c=>[c.title,...ensure(p).shots.filter(s=>s.chapterId===c.id).map((s,i)=>`Shot ${i+1} · ${s.title}\n${labels.framing[s.framing]||s.framing} / ${labels.camera[s.camera]||s.camera} / ${s.duration} sec\nShot content:\n${shotContent(s)}`)])].join('\n\n');}
 function promptBasis(p,s){const v=ensure(p);return JSON.stringify([s.visual,s.dialogue,s.framing,s.camera,s.duration,s.assetIds,v.style,v.ratio,v.quality]);}
 function promptToken(p,a){const same=ensure(p).assets.filter(x=>x.name===a.name);return '@【'+(a.name||'Untitled asset')+(same.length>1?' · '+(labels.asset[a.kind]||a.kind)+' '+(same.indexOf(a)+1):'')+'】';}
 function draftPrompt(p,s){const v=ensure(p),refs=s.assetIds.map(id=>v.assets.find(a=>a.id===id)).filter(Boolean).map(a=>({assetId:a.id,token:promptToken(p,a)}));let visual=shotContent(s);for(const r of [...refs].sort((a,b)=>b.token.length-a.token.length)){const a=v.assets.find(a=>a.id===r.assetId);if(a.name)visual=visual.split(a.name).join(r.token);}const text=[`${labels.style[v.style]||v.style}, ${v.ratio}, ${v.quality}, ${s.duration} sec.`,`${labels.framing[s.framing]||s.framing}, ${labels.camera[s.camera]||s.camera}.`,refs.length?'Asset references: '+refs.map(r=>r.token).join(', ')+'. Preserve their appearance and defining details.':'',visual?'Shot content: '+visual:'', 'Keep the motion natural and continuous, with consistent characters and settings.'].filter(Boolean).join('\n\n');return {text,refs,basis:promptBasis(p,s)};}
 function prompt(p,s){if(!s.generationPrompt)s.generationPrompt=draftPrompt(p,s);return s.generationPrompt;}
 function promptReferences(p,s){const d=prompt(p,s),v=ensure(p),tokens=[...new Set(d.text.match(/@【[^】\n]+】/g)||[])];return tokens.map(token=>{const binding=d.refs.find(r=>r.token===token),a=binding&&v.assets.find(a=>a.id===binding.assetId),version=a?.versions.find(x=>x.id===a.adoptedId);return {token,assetId:binding?.assetId,asset:a,version};});}
 function setPrompt(p,s,text){prompt(p,s).text=text;}
 function insertReference(p,s,id,start,end){const a=ensure(p).assets.find(a=>a.id===id);if(!a)throw Error('This asset no longer exists. Choose another asset.');const d=prompt(p,s);let binding=d.refs.find(r=>r.assetId===id);if(!binding){let token=promptToken(p,a);if(d.refs.some(r=>r.token===token))token=token.slice(0,-1)+' · '+id.slice(-5)+'】';binding={assetId:id,token};d.refs.push(binding);}const from=Math.max(0,Math.min(start??d.text.length,d.text.length)),to=Math.max(from,Math.min(end??from,d.text.length));d.text=d.text.slice(0,from)+binding.token+' '+d.text.slice(to);return from+binding.token.length+1;}
 function refreshPrompt(p,s){const d=prompt(p,s);s.promptUndo=copy(d);s.generationPrompt=draftPrompt(p,s);}
 function undoPrompt(p,s){if(s.promptUndo){s.generationPrompt=s.promptUndo;s.promptUndo=null;}}
 function promptPayload(p,s){const d=prompt(p,s);if(!d.text.trim())throw Error('Enter a video prompt first.');const refs=promptReferences(p,s);const unknown=refs.find(r=>!r.asset);if(unknown)throw Error(unknown.token+' is no longer linked to an asset. Select it again using @ Reference assets.');if(d.text.replace(/@【[^】\n]+】/g,'').includes('@'))throw Error('Complete the @ reference with an asset, or remove it.');const missing=refs.find(r=>!r.version);if(missing)throw Error(missing.token+' needs a reference image. Choose one in Assets before continuing.');return {prompt:d.text,assets:refs.map(r=>({assetId:r.assetId,token:r.token,name:r.asset.name,kind:r.asset.kind,description:r.asset.description,versionId:r.version.id,url:r.version.url})),settings:{style:p.video.style,ratio:p.video.ratio,quality:p.video.quality,duration:s.duration}};}
 function signature(p,s){const v=ensure(p),d=prompt(p,s);return JSON.stringify([promptBasis(p,s),d.text,promptReferences(p,s).map(r=>[r.assetId,r.token,r.asset?.name,r.asset?.description,r.version?.id,r.version?.url])]);}
 function requestGeneration(p,s){if(!s)throw Error('Select a shot first.');const payload=promptPayload(p,s);s.request={id:M.id('vrequest'),at:new Date().toISOString(),signature:signature(p,s),status:'recorded',...copy(payload)};return s.request;}
 function candidate(p,s,url,name){const item={id:M.id('vcandidate'),url,name,at:new Date().toISOString(),signature:signature(p,s)};s.versions.push(item);s.selectedVersion=item.id;return item;}
 function stale(p,s){const adopted=s.versions.find(v=>v.id===s.adoptedId);return !!adopted&&adopted.signature!==signature(p,s);}
 return {tabs,labels,ensure,create,enter,splitChapters,prerequisite,asset,extractAssets,selectedChapter,shot,generateShots,shotContent,setShotContent,exportShots,promptBasis,draftPrompt,prompt,promptReferences,setPrompt,insertReference,refreshPrompt,undoPrompt,promptPayload,signature,requestGeneration,candidate,stale};
}
if(typeof module!=='undefined')module.exports=factory;else root.VideoStoryModel=factory(root.ScriptStudio,root.StoryAgent,root.StoryPlanning,root.StoryContent,root.ScriptFullExample.data);
})(globalThis);
