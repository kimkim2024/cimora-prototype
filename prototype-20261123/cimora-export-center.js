/* 明确导出后才保存实际文件。IndexedDB 中的文件不随项目修改或回收变化。 */
(()=>{
 'use strict';
 const C=Cimora,S=Site,M=ExportCenterModel,E=S.esc,DB='cimora-export-center-v1',STORY='cimora-script-studio-v1',COMIC='cimora-comic-studio-v1';
 const labels={story:'Story',comic:'Comic',video:'Video',tool:'Creative tools',bundle:'Bundle',legacy:'Legacy project snapshot'};
 let records=[],loaded=false,warning='',dbPromise,draft=null,busy=false,pendingTool='',filter={source:'all',project:'all',examples:false,query:''},picked=new Set(),manage=false;
 const clone=v=>JSON.parse(JSON.stringify(v)),q=encodeURIComponent;
 const button=(text,action,id='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-ec="${action}" data-id="${E(id)}" ${action==='batch'&&!picked.size||action==='compare'&&picked.size!==2?'disabled':''}>${text}</button>`;
 function exportIconButton(label,action,path,primary=false){
  const icon=`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
  return button(icon,action,'',primary).replace('<button ',`<button aria-label="${E(label)}" title="${E(label)}" `);
 }
 function database(){
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB,2);
   req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains('exports'))db.createObjectStore('exports',{keyPath:'id'});
   if(!db.objectStoreNames.contains('counters'))db.createObjectStore('counters');
   const cursor=req.transaction.objectStore('exports').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(!c)return;const r=c.value;if(!r.package&&r.blob){c.update({...r,source:r.kind==='project'?'legacy':r.kind,projectKey:'legacy:'+r.projectId,scope:r.chapterTitle,scopeKey:r.chapterId,version:1,format:r.filename.split('.').pop().toUpperCase(),createdAt:new Date(r.createdAt).toISOString(),package:r.blob,url:'/app/create/'+r.projectId+'/'+r.chapterId+'?stage=review'});}c.continue();};
  };
   req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
   req.onerror=()=>reject(Error('Unable to open the export library. Existing records were kept.'));
   req.onblocked=()=>reject(Error('Another window is using the export library. Close it and try again.'));
  }).catch(error=>{dbPromise=null;throw error;});return dbPromise;
 }
 async function all(){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('exports'),req=tx.objectStore('exports').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async function refresh(){try{records=(await all()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));loaded=true;warning='';}catch(error){warning=error.message;loaded=true;}if(S.context?.parts[1]==='exports')S.render();}
 const size=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(1)+' KB':n+' B';
 function blob(data,type){return data instanceof Blob?data:new Blob([typeof data==='object'&&!(data instanceof ArrayBuffer)&&!ArrayBuffer.isView(data)?JSON.stringify(data,null,2):data],{type:type||'application/octet-stream'});}
 async function zip(files){
  const chunks=[],central=[],enc=new TextEncoder();let offset=0;const used=new Set();
  for(const [i,f] of files.entries()){
   const base=f.name.split('/').filter(x=>x&&x!=='.'&&x!=='..').map(M.safeName).join('/')||'file';let filename=base,suffix=1;while(used.has(filename))filename=String(++suffix).padStart(3,'0')+'-'+base;used.add(filename);
   const name=enc.encode(filename),data=new Uint8Array(await f.blob.arrayBuffer());let crc=0xffffffff;
   for(const b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
   const l=new Uint8Array(30),lv=new DataView(l.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(12,0x21,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);chunks.push(l,name,data);
   const c=new Uint8Array(46),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,0x21,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.push(c,name);offset+=30+name.length+data.length;
  }
  const length=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...chunks,...central,end],{type:'application/zip'});
 }
 function download(record){const url=URL.createObjectURL(record.package),a=document.createElement('a');a.href=url;a.download=record.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);S.toast('Download started · '+record.filename);}
 async function deliver({files,meta,filename,downloadNow=true,forceZip=false}){
  if(!files?.length)throw Error('There are no files to export.');
  files=files.map(f=>({name:f.name,blob:blob(f.data??f.blob,f.type)}));
  if(files.some(f=>!f.blob.size))throw Error('This export contained empty files and was not saved.');
  const packaged=forceZip||files.length>1,packageBlob=packaged?await zip(files):files[0].blob;
  const ext=packaged?'zip':files[0].name.split('.').pop().toLowerCase();
  const db=await database(),id='export-'+crypto.randomUUID(),createdAt=new Date().toISOString();
  const key=[meta.source,meta.projectKey||'',meta.scopeKey||''].join('\u0000');
  const record=await new Promise((resolve,reject)=>{
   const tx=db.transaction(['exports','counters'],'readwrite'),store=tx.objectStore('exports'),counter=tx.objectStore('counters'),req=counter.get(key);let result;
   req.onsuccess=()=>{try{const previous=req.result||0;if(!Number.isSafeInteger(previous)||previous<0)throw Error('版本记录异常');const version=previous+1,baseName=filename||(files.length===1?files[0].name.replace(/\.[^.]+$/,''):meta.title+'-'+meta.scope);result={...meta,id,createdAt,version,format:ext.toUpperCase(),files,package:packageBlob,totalBytes:packageBlob.size,filename:M.safeName(baseName)+'-v'+version+'.'+ext};store.add(result);counter.put(version,key);}catch{tx.abort();}};
   tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(Error('The export could not be saved. Check available device storage. Previous exports and the project were kept.'));tx.onerror=()=>{};
  });
  records.unshift(record);loaded=true;
  if(downloadNow)download(record);
  if(S.context?.parts[1]==='exports')S.render();
  return record;
 }
 const storyEpisodes=p=>p.storyChapters?.length?p.storyChapters:p.outline||[];
 const storyBody=(p,id)=>p.storyChapters?.find(x=>x.id===id)?.body??ScriptStudio.bodyText(p,id);
 const comicEpisodes=p=>p.storyPlan?.episodes?.length?p.storyPlan.episodes:p.comicEpisodes?.length?p.comicEpisodes:p.storyChapters?.length?p.storyChapters:p.source?.outline||[];
 const rangeLabel=(episodes,ids)=>{const positions=episodes.flatMap((e,i)=>ids.includes(e.id)?[i+1]:[]);return positions.length===episodes.length?'全部 '+positions.length+' 集':positions.length>2&&positions.at(-1)-positions[0]+1===positions.length?'第'+positions[0]+'–'+positions.at(-1)+'集':positions.map(i=>'第'+i+'集').join('、');};
 async function story(p,ids,extra={}){
  const episodes=storyEpisodes(p),files=M.storyFiles(p,ids,extra,storyBody);
  return deliver({files:files.map(f=>({...f,type:'text/plain;charset=utf-8'})),meta:{source:'story',projectKey:'story:'+p.id,projectTitle:p.title,title:p.title,scope:rangeLabel(episodes,ids),scopeKey:episodes.filter(e=>ids.includes(e.id)).map(e=>e.id).join('|')+(extra.characters?':characters':'')+(extra.outline?':outline':''),episodeId:episodes.find(e=>ids.includes(e.id))?.id,url:'/app/script?project='+q(p.id)}});
 }
 async function png(source){
  const image=new Image();image.crossOrigin='anonymous';image.src=StudioLibraryModel.imageOf(source,true);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);
  return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Unable to encode the comic page.')),'image/png'));
 }
 async function comic(p,ids,pageId,completedOnly=false){
  const episodes=comicEpisodes(p),pages=M.comicPages(p,episodes,ids,pageId,completedOnly),files=[];
  if(!pages.length)throw Error('There are no adopted comic pages in the selected range.');
  for(const page of pages)files.push({name:pageId?page.name.split('/').pop():page.name,data:await png(page.image)});
  
  const scope=rangeLabel(episodes,ids)+(pageId?' · 第'+((p.bodyPagination.episodes[ids[0]].pages.findIndex(x=>x.id===pageId))+1)+'页':' · 共'+pages.length+'页');
  return deliver({files,forceZip:!pageId,filename:p.title+'-'+scope,meta:{source:'comic',projectKey:'comic:'+p.id,projectTitle:p.title,title:p.title,scope,scopeKey:episodes.filter(e=>ids.includes(e.id)).map(e=>e.id).join('|')+(pageId?':'+pageId:completedOnly?':adopted':':all'),notice:completedOnly?'仅包含所选范围中已采用的漫画页，未采用页不在此文件内。':undefined,episodeId:pages[0].episodeId,pageId:pages[0].pageId,sourceRefs:pages.map(({image,name,...ref})=>ref),url:'/app/comic?project='+q(p.id)}});
 }
 function videoEpisodes(project){if(project.store==='videoDraft')return project.raw.storyChapters||[];return (project.entries||[]).flatMap(entry=>(entry.workspace.episodes||[]).map(e=>({...e,id:entry.hostId+'|'+e.id,episodeId:e.id,hostId:entry.hostId,entry})));}
 async function video(project,ids){
  if(project.store==='videoDraft'){const files=M.videoDraftFiles(project.raw,ids,project.entries),episodes=M.selected(videoEpisodes(project),ids);return deliver({files,meta:{source:'video',projectKey:project.key,projectTitle:project.title,title:project.title+' · 项目方案',scope:episodes.map(e=>e.title).join('、'),scopeKey:ids.join('|'),episodeId:episodes[0].id,notice:'项目与镜头方案 JSON，Exports the plan as JSON。',url:StudioWorkspaceModel.url(project,{tab:'generation',chapterId:episodes[0].id})}});}
  const episodes=M.selected(videoEpisodes(project),ids),files=[],refs=[];
  for(const e of episodes){const value=e.entry.workspace.finishing?.episodes?.[e.episodeId],v=value?.versions?.[0];if(!v)throw Error(e.title+' has no saved assembly plan. Return to episode production.');
   files.push({name:String(videoEpisodes(project).findIndex(x=>x.id===e.id)+1).padStart(2,'0')+'-'+M.safeName(e.title)+'-拼接方案.json',data:{format:'cimora-video-assembly-plan',notice:'拼接方案，未输出 MP4 或混音文件。',project:project.title,episode:e.title,version:clone(v)},type:'application/json'});refs.push({hostId:e.hostId,episodeId:e.episodeId,versionId:v.id});}
  return deliver({files,meta:{source:'video',projectKey:project.key,projectTitle:project.title,title:project.title+' · 拼接方案',scope:episodes.map(e=>e.title).join('、'),scopeKey:ids.join('|'),hostId:episodes[0].hostId,episodeId:episodes[0].episodeId,sourceRefs:refs,notice:'仅拼接方案 JSON，未输出视频或混音。',url:'/app/video?project='+q(project.id)+'&episode='+q(episodes[0].hostId)+'&stage=4'}});
 }
 async function toolFiles(asset){
  const files=[],raw=asset.raw||asset;
  if(asset.image)files.push({name:M.safeName(asset.name||asset.title)+'.png',data:await png(asset.image),type:'image/png'});
  files.push({name:M.safeName(asset.name||asset.title)+'-成果说明.json',data:{format:'cimora-tool-result',title:asset.name||asset.title,version:asset.version,source:raw,notice:'旧版工具的本机示例成果；说明文件不含未生成的音视频、PSD 或角色绑定。'},type:'application/json'});
  return files;
 }
 async function tool(asset){return deliver({files:await toolFiles(asset),meta:{source:'tool',projectKey:asset.owner||'',projectTitle:asset.ownerName||'个人创作',title:asset.name||asset.title,scope:'已保存工具成果',scopeKey:asset.key,toolResultId:asset.key,notice:'本机示例成果；图片按已保存画面导出，其余能力保留方案说明。',url:'/app/assets?item='+q(asset.key)}});}
 function index(){return StudioLibrary.load();}
 function sources(source){return index().projects.filter(p=>p.kind===source&&p.state==='active').map(p=>p.legacySource&&['story','comic'].includes(p.kind)?{...p,raw:M.nativeSource(p.raw,C.M.db.projects[p.id]||{},S.state.assets,v=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(Art.svg(v.art||0)))}:{...p,raw:M.workspaceSource(p)});}
 function tools(){return index().assets.filter(a=>(a.tool||a.raw?.resultId||StudioLibraryModel.creationSource(a)==='tools')&&a.state==='active');}
 const projects=()=>['story','comic','video'].flatMap(sources);
 function choose(source='story',project){
  const entry=project?{raw:clone(project),id:project.id,title:project.title,key:source+':'+project.id,kind:source}:sources(source)[0];
  draft={source,project:entry?.key||'',current:project?entry:null,ids:[],mode:'episodes',pageId:'',characters:false,outline:false};setDefaults();drawChooser();
 }
 function chooseProject(key){
  const entry=key?projects().find(p=>p.key===key):projects()[0];
  if(key&&!entry)throw Error('This project is no longer listed. Refresh and try again.');
  draft={source:entry?.kind||'story',project:entry?.key||'',current:null,ids:[],mode:'episodes',pageId:'',characters:false,outline:false};setDefaults();drawChooser();
 }
 function projectForDraft(){return draft.current||sources(draft.source).find(p=>p.key===draft.project);}
 function episodesForDraft(){const p=projectForDraft();return !p?[]:draft.source==='story'?storyEpisodes(p.raw):draft.source==='comic'?comicEpisodes(p.raw):videoEpisodes(p);}
 function availability(){const p=projectForDraft();return p?M.availability(draft.source,p.raw,episodesForDraft(),storyBody,p):[];}
 function readyPages(id){const p=projectForDraft()?.raw;return (p?.bodyPagination?.episodes?.[id]?.pages||[]).filter(pg=>{const w=p.wholePageStudio?.works?.[pg.id];return w?.versions?.some(v=>v.id===w.adoptedId&&v.image);});}
 function setDefaults(){draft.ids=draft.source==='tool'?tools().map(a=>a.key):availability().filter(e=>e.ready).map(e=>e.id);draft.pageId=draft.source==='comic'?readyPages(draft.ids[0])[0]?.id||'':'';}
 function updateSelection(){
  const info=availability(),count=draft.source==='tool'?draft.ids.length:draft.mode==='page'?Number(Boolean(draft.pageId)):info.filter(e=>draft.ids.includes(e.id)).reduce((n,e)=>n+e.ready,0);
  const node=document.getElementById('ec-selection');if(node)node.textContent=count?count+' selected':'Select content to export';
  const action=document.querySelector('[data-ec="create"]');if(action)action.disabled=!count;
  const all=document.querySelector('[data-ec-all]');if(all){const ids=draft.source==='tool'?tools().map(a=>a.key):info.filter(e=>e.ready).map(e=>e.id);all.checked=ids.length>0&&ids.every(id=>draft.ids.includes(id));all.indeterminate=draft.ids.length>0&&!all.checked;}
 }
 function drawChooser(){
  const p=draft.source==='tool'?null:projectForDraft(),episodes=draft.source==='tool'?[]:episodesForDraft(),info=availability();
  let html='<div class="ec-form">';
  if(draft.source==='tool')html+=`<p>Choose saved results from the Asset Library.</p><div class="ec-choice-heading"><strong>Content to export</strong><label><input type="checkbox" data-ec-all>Select all</label></div><div class="ec-choices">${tools().map(a=>`<label><input type="checkbox" data-ec-episode="${E(a.key)}" ${draft.ids.includes(a.key)?'checked':''}><span>${E(a.name)}</span></label>`).join('')||'<p>No saved results yet. Save a result in Creative Tools first.</p>'}</div>`;
  else{
   const choices=draft.current?[draft.current]:projects();
   html+=`<label>Select project<select data-ec-field="project">${choices.map(item=>`<option value="${E(item.key)}" ${item.key===draft.project?'selected':''}>${E(item.title)} · ${labels[item.kind]}</option>`).join('')||'<option value="">No projects yet</option>'}</select></label>`;
   const format=draft.source==='story'?'Story text · TXT':draft.source==='comic'?'Adopted comic pages · PNG / ZIP':'Video plan · JSON';
   html+=`<div class="ec-format"><strong>${format}</strong><span>${draft.source==='video'?'Exports the plan as JSON':draft.source==='comic'?'Preserves image dimensions and quality':'Can include character profiles and episode outlines'}</span></div>`;
   if(draft.source==='comic')html+=`<fieldset class="ec-range"><legend>Export range</legend><label><input type="radio" name="ec-mode" data-ec-field="mode" value="episodes" ${draft.mode==='episodes'?'checked':''}>By episode</label><label><input type="radio" name="ec-mode" data-ec-field="mode" value="page" ${draft.mode==='page'?'checked':''}>Single page</label></fieldset>`;
   if(draft.mode==='page'){
    html+=`<div class="ec-page-select"><label>Episode<select data-ec-field="singleEpisode">${episodes.filter(e=>info.find(i=>i.id===e.id)?.ready).map(e=>`<option value="${E(e.id)}" ${draft.ids[0]===e.id?'selected':''}>${E(e.title)}</option>`).join('')||'<option value="">No episodes available to export</option>'}</select></label><label>Page<select data-ec-field="pageId">${readyPages(draft.ids[0]).map(pg=>`<option value="${E(pg.id)}" ${draft.pageId===pg.id?'selected':''}>Page ${p.raw.bodyPagination.episodes[draft.ids[0]].pages.findIndex(x=>x.id===pg.id)+1}</option>`).join('')||'<option value="">No adopted pages yet</option>'}</select></label></div>`;
   }else html+=`<div class="ec-choice-heading"><strong>Content to export</strong><label><input type="checkbox" data-ec-all>Select all available</label></div><div class="ec-choices">${episodes.map(e=>{const status=info.find(i=>i.id===e.id);return `<label class="${status.ready?'':'ec-unavailable'}"><input type="checkbox" data-ec-episode="${E(e.id)}" ${draft.ids.includes(e.id)?'checked':''} ${status.ready?'':'disabled'}><span>${E(e.title)}</span><small>${status.label}</small></label>`;}).join('')||'<p>No chapters yet. Add content to the project first.</p>'}</div>`;
   const skipped=info.reduce((n,e)=>n+e.total-e.ready,0),unpaged=info.filter(e=>!e.total).length;
   if(skipped||unpaged)html+=`<p class="ec-skip">${draft.source==='comic'?`Skipping ${skipped} unadopted pages${unpaged?' and '+unpaged+' episodes without pages':''}`:`${skipped} episodes without ${draft.source==='story'?'story text':'a video plan'} will be skipped`}</p>`;
   if(draft.source==='story')html+=`<details class="ec-extra"><summary>Include supporting material${draft.characters||draft.outline?' · Selected':''}</summary><div class="ec-options"><label><input type="checkbox" data-ec-field="characters" ${draft.characters?'checked':''} ${p?.raw.characters?.length?'':'disabled'}>Character profiles${p?.raw.characters?.length?'':' (unavailable)'}</label><label><input type="checkbox" data-ec-field="outline" ${draft.outline?'checked':''}>Selected episode outlines</label></div><p>Supporting material is delivered in a ZIP file.</p></details>`;
  }
  html+='<p id="ec-message" role="alert"></p></div>';
  const active=document.activeElement,focusField=active?.dataset.ecField;
  S.modal(draft.source==='tool'?'Export tool results':'Export project',html,`<span id="ec-selection" role="status"></span><button class="cm-button ghost" data-act="close">Cancel</button>${button('Export and download','create','',true)}`);
  updateSelection();
  if(focusField)requestAnimationFrame(()=>document.querySelector('[data-ec-field="'+focusField+'"]')?.focus());
 }
 async function create(){
  StudioLibrary.guard();const d=clone(draft),p=projectForDraft();if(!d.ids.length)throw Error('Select at least one item.');let result;
  if(d.source!=='tool'&&!p)throw Error('No exportable project found. Choose another project.');
  if(d.source==='story')result=await story(p.raw,d.ids,{characters:d.characters,outline:d.outline});
  if(d.source==='comic'){if(d.mode==='page'&&!d.pageId)throw Error('This episode has no pages yet. Return to comic layout first.');result=await comic(p.raw,d.mode==='page'?[d.ids[0]]:d.ids,d.mode==='page'?d.pageId:undefined,d.mode!=='page');}
  if(d.source==='video')result=await video(p,d.ids);
  if(d.source==='tool'){
   const assets=tools().filter(a=>d.ids.includes(a.key));if(assets.length!==d.ids.length)throw Error('The tool results have changed. Select them again.');
   if(assets.length===1)result=await tool(assets[0]);
   else{const files=[];for(const [i,a]of assets.entries()){for(const f of await toolFiles(a))files.push({...f,name:String(i+1).padStart(2,'0')+'-'+M.safeName(a.name)+'/'+f.name});}
    result=await deliver({files,meta:{source:'tool',projectKey:'',projectTitle:'个人创作',title:'工具成果合集',scope:assets.length+'项成果',scopeKey:assets.map(a=>a.key).join('|'),notice:'独立工具成果，内容保留各工具的示例说明。',url:'/app/assets'}});}
  }
  S.close();return result;
 }
 function exampleGuide(){return `<section class="ec-demo"><div class="ec-demo-heading"><div><strong>每一次导出，保留一个确定版本</strong><p>故事正文与人物资料、已采用漫画页、视频拼接方案和独立工具成果，都可以在这里统一下载。</p></div><div class="ec-demo-actions">${button('试用导出演示','demo-load')}</div></div><p>已有稿件更新后，之前导出的文件仍然保留。视频当前导出方案 JSON，不生成 MP4。</p></section>`;}
 async function loadExamples(){
  const specs=[['story-first','故事首稿','story','雨夜重逢\n\n她停在旧书店门口。门铃响了，他抬起头。\n“好久不见。”'],['story-revised','故事修改稿','story','雨夜重逢\n\n她停在旧书店门口。门铃响了，他抬起头。\n“好久不见。”\n她把攥了很久的信放在桌上，终于说出了那个答案。'],['comic','漫画成稿','comic',null],['tool','独立角色图','tool',null],['video','视频拼接方案','video',{format:'cimora-video-assembly-plan',notice:'独立导出演示，仅方案 JSON，不含 MP4',clips:[{title:'书店重逢',duration:6},{title:'递出旧信',duration:5}]}]];
  for(const [key,title,source,data] of specs){if(records.some(r=>r.exampleKey==='export-demo-v1:'+key))continue;const files=key==='comic'?[{name:'第1页.png',data:await png('assets/cimora-story-0.webp')},{name:'第2页.png',data:await png('assets/cimora-story-1.webp')}]:key==='tool'?[{name:'角色参考.png',data:await png('assets/cimora-story-2.webp')}]:[{name:title+(source==='video'?'.json':'.txt'),data,type:source==='video'?'application/json':'text/plain;charset=utf-8'}];await deliver({files,meta:{source,projectKey:'demo:exports',projectTitle:'独立导出演示',title,scope:'第1集',scopeKey:source,example:true,exampleKey:'export-demo-v1:'+key,exampleSource:{text:typeof data==='string'?data:JSON.stringify(data||{},null,2)},notice:'独立演示文件，复用原型已有示例，不修改你的项目。'},downloadNow:false});}
 }
 async function compareExamples(){
  const rows=['story-first','story-revised'].map(key=>records.find(r=>r.exampleKey==='export-demo-v1:'+key));
  if(rows.some(r=>!r)){S.toast('故事演示文件已清理，请重新载入演示。');return;}
  const texts=await Promise.all(rows.map(r=>r.files[0].blob.text()));
  S.modal('对比故事导出版本',`<p>同一集的两次导出，修改稿在结尾新增了动作。下方直接读取已保存的文件。</p><div class="ec-compare">${rows.map((r,i)=>`<section><h3>${i?'修改稿':'首稿'} · v${r.version}</h3><pre class="ec-text">${E(texts[i].slice(-700))}</pre>${button('下载这一版','download',r.id,true)}</section>`).join('')}</div>`,'',true);
 }
 function listPage(ctx){
  const item=ctx.params.get('item');if(item)return detail(records.find(r=>r.id===item));
  const rows=records.filter(r=>(!filter.query||[r.title,r.filename,r.projectTitle].join(' ').toLowerCase().includes(filter.query.toLowerCase()))&&(filter.source==='all'||r.source===filter.source));
  return `<div class="ec-page"><header class="ec-heading"><div><h1 class="cm-workspace-title">导出中心</h1><p>按项目导出创作成果，随时下载历史版本。</p></div></header>${warning?`<p class="ec-warning" role="alert">${E(warning)}${button('重试读取','reload')}</p>`:''}<section aria-label="最近导出"><div class="ec-history-heading"><h2>最近导出 <small>${records.length}</small></h2>${records.length?button(manage?'完成管理':'管理记录','manage'):''}</div><div class="ec-toolbar"><div class="ec-filters">${CimoraSearchField.render(`<input aria-label="Search exports" data-ec-search value="${E(filter.query)}" placeholder="搜索项目或文件">`, "ec-search")}<label><span class="ec-sr-only">导出类型</span><select data-ec-filter="source"><option value="all">全部类型</option>${Object.entries(labels).map(([key,label])=>`<option value="${key}" ${filter.source===key?'selected':''}>${key==='video'?'视频方案':label}</option>`).join('')}</select></label><div class="ec-export-icons" role="group" aria-label="Export actions">${exportIconButton('Export tool output','new-tool','M12 3v12m-4-4 4 4 4-4M5 10l-2 7v3h18v-3l-2-7M3 17h18')}${exportIconButton('Export project','new','M21 11V7a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6m6-8v8m-3-3 3 3 3-3',true)}</div></div>${manage?`<div class="ec-actions">${button('对比两版','compare')}${button('打包已选（'+picked.size+'）','batch')}</div>`:''}</div>${!loaded?'<div class="ec-empty">正在读取导出记录…</div>':rows.length?`<div class="ec-list">${rows.map(r=>`<article class="ec-row" data-export-id="${E(r.id)}">${manage?`<input type="checkbox" aria-label="选择 ${E(r.title)} v${r.version}" data-ec-pick="${E(r.id)}" ${picked.has(r.id)?'checked':''}>`:''}<div class="ec-file-icon">${E(r.format)}</div><div class="ec-row-copy"><h2><a href="#/app/exports?item=${q(r.id)}">${E(r.title)}</a><span>v${r.version}</span></h2><p>${r.source==='video'?'视频方案 · ':''}${E(r.scope)}</p><small>${new Date(r.createdAt).toLocaleString('zh-CN')} · ${size(r.totalBytes)}</small></div><span class="ec-status">可下载</span><div class="ec-actions">${button('下载','download',r.id,true)}<a class="cm-button ghost" href="#/app/exports?item=${q(r.id)}">详情</a>${manage?button('清理','remove',r.id):''}</div></article>`).join('')}</div>`:`<div class="ec-empty"><h2>${records.length?'没有匹配的导出记录':'还没有导出记录'}</h2><p>${records.length?'试试其他项目名称或导出类型。':'选择一个项目，即可导出已有正文、漫画成稿或视频方案。'}</p>${records.length?button('清除筛选','clear-filter'):button('导出项目','new','',true)}</div>`}</section><p class="ec-footnote">文件保存在当前浏览器；项目后续修改不影响已导出版本。</p></div>`;
 }
 function detail(r){return `<div class="ec-page"><a class="cm-button ghost" href="#/app/exports">← 返回导出中心</a>${r?`<header class="ec-heading"><div><h1>${E(r.title)} <small>v${r.version}</small></h1><p>${E(r.scope)} · ${E(r.projectTitle||'个人创作')}</p></div><div class="ec-actions">${button('下载此版本','download',r.id,true)}${r.source!=='bundle'?button('返回来源','open',r.id):''}${button('清理','remove',r.id)}</div></header><section class="ec-panel"><dl><dt>实际文件</dt><dd>${E(r.filename)}</dd><dt>格式与大小</dt><dd>${E(r.format)} · ${size(r.totalBytes)}</dd><dt>导出时间</dt><dd>${new Date(r.createdAt).toLocaleString('zh-CN')}</dd></dl>${r.notice?`<p class="ec-warning">${E(r.notice)}</p>`:''}<h2>包内文件</h2>${r.files.map((f,i)=>`<div class="ec-file"><span>${E(f.name)}</span><small>${size(f.blob.size)}</small>${/\.(txt|json|png|jpg|jpeg|webp|gif|wav|mp3|mp4)$/i.test(f.name)?button('查看文件','preview',r.id+':'+i):''}</div>`).join('')}<p>这是导出时的固定文件。工程之后的修改不会改变此版本。</p></section>`:'<div class="ec-empty"><h1>未找到此导出</h1><p>记录可能已清理，原项目和资产仍保留。</p></div>'}</div>`;}
 async function preview(id){const split=id.lastIndexOf(':'),r=records.find(x=>x.id===id.slice(0,split)),f=r?.files[Number(id.slice(split+1))];if(!f)throw Error('文件不存在。');let html,url;
  if(/\.(txt|json)$/i.test(f.name))html='<pre class="ec-text">'+E(await f.blob.text())+'</pre>';
  else{url=URL.createObjectURL(f.blob);html=/\.(wav|mp3)$/i.test(f.name)?`<audio controls src="${url}"></audio>`:/\.mp4$/i.test(f.name)?`<video class="ec-preview" controls src="${url}"></video>`:`<img class="ec-preview" src="${url}" alt="${E(f.name)}">`;setTimeout(()=>URL.revokeObjectURL(url),120000);}
  S.modal(f.name,html,button('下载完整导出包','download',r.id,true));
 }
 function open(r){
  if(r.exampleSource){const source=r.exampleSource;S.modal(r.title,`<div class="ec-example-source"><p class="ec-warning">独立演示快照，仅用于体验导出。你的故事、漫画与视频工程保持原样。</p><pre class="ec-text">${E(source.text||'')}</pre>${(source.images||[]).map(src=>`<img class="ec-preview" src="${E(src)}" alt="演示来源图片">`).join('')}</div>`,button('下载此版本','download',r.id,true),true);return;}
  if(['story','comic','video','legacy'].includes(r.source)){
   StudioLibrary.guard();const project=StudioProjects.resolve(r.projectKey)||index().projects.find(p=>'legacy:'+p.id===r.projectKey);
   if(!project)throw Error('原工程已不存在，仍可下载此版本。');
   if(!['active','archived'].includes(project.state))throw Error('原工程已回收，请先恢复项目。导出文件仍可下载。');
   const position=M.sourcePosition(project,r,StudioLibrary.meta());
   if(project.legacySource&&r.source==='video'){const entry=project.entries?.find(e=>e.hostId===position.chapterId);if(entry?.workspace.episodes?.some(e=>e.id===r.episodeId)){entry.workspace.selectedEpisodeId=r.episodeId;C.M.save();}}
   S.route(StudioWorkspaceModel.url(project,position));return;
  }
  if(r.source==='tool'&&r.toolResultId){const saved=StudioLibrary.findAsset(r.toolResultId);if(!saved||saved.state!=='active')throw Error('原工具成果已移除或回收，仍可下载此版本。');S.route('/app/assets?item='+q(r.toolResultId));return;}
  location.hash='#'+r.url;
 }
 async function batch(){const rows=records.filter(r=>picked.has(r.id));if(!rows.length)throw Error('请先选择需要打包的导出记录。');const files=[];for(const [i,r]of rows.entries())files.push({name:String(i+1).padStart(2,'0')+'-'+r.filename,data:r.package});if(files.length===1){files[0]={name:'导出合集.zip',data:await zip([{name:files[0].name,blob:files[0].data}])};}
  await deliver({files,meta:{source:'bundle',title:'导出文件合集',projectKey:'',projectTitle:'多个来源',scope:rows.length+'份导出文件',scopeKey:rows.map(r=>r.id).join('|'),sourceRefs:rows.map(r=>({id:r.id,version:r.version,filename:r.filename}))}});picked.clear();S.render();}
 async function remove(id){const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction('exports','readwrite');tx.objectStore('exports').delete(id);tx.oncomplete=resolve;tx.onabort=()=>reject(Error('清理失败，请重试。'));});records=records.filter(r=>r.id!==id);picked.delete(id);S.close();if(S.context.params.has('item'))location.hash='#/app/exports';else S.render();S.toast('导出文件已清理，工程和资产保留。');}
 document.addEventListener('change',event=>{
  const n=event.target;if(n.dataset.ecFilter){filter[n.dataset.ecFilter]=n.value;S.render();}
  if(n.dataset.ecPick){n.checked?picked.add(n.dataset.ecPick):picked.delete(n.dataset.ecPick);S.render();}
  if(busy&&draft)return;
  if(n.hasAttribute('data-ec-all')&&draft){draft.ids=n.checked?(draft.source==='tool'?tools().map(a=>a.key):availability().filter(e=>e.ready).map(e=>e.id)):[];document.querySelectorAll('[data-ec-episode]').forEach(input=>{input.checked=draft.ids.includes(input.dataset.ecEpisode);});updateSelection();}
  if(n.dataset.ecEpisode&&draft){draft.ids=n.checked?[...draft.ids,n.dataset.ecEpisode]:draft.ids.filter(x=>x!==n.dataset.ecEpisode);updateSelection();}
  if(n.dataset.ecField&&draft){const field=n.dataset.ecField;
   if(field==='source'){draft.current=null;draft.source=n.value;draft.project=sources(draft.source)[0]?.key||'';draft.mode='episodes';setDefaults();}
   else if(field==='project'){draft.project=n.value;draft.current=null;draft.source=projects().find(p=>p.key===n.value)?.kind||'story';draft.mode='episodes';draft.characters=false;draft.outline=false;setDefaults();}
   else if(field==='mode'){draft.mode=n.value;setDefaults();if(n.value==='page')draft.ids=draft.ids.slice(0,1);}
   else if(field==='singleEpisode'){draft.ids=[n.value];draft.pageId=readyPages(n.value)[0]?.id||'';}
   else draft[field]=n.type==='checkbox'?n.checked:n.value;
   if(!['characters','outline','pageId'].includes(field))drawChooser();else updateSelection();
  }
 });
 document.addEventListener('click',async event=>{const n=event.target.closest('[data-ec]');if(!n)return;event.preventDefault();if(busy)return;const action=n.dataset.ec,id=n.dataset.id,r=records.find(x=>x.id===id);
  try{
   if(action==='demo-filter'){filter.examples=!filter.examples;filter.source='all';filter.project='all';S.render();return;}
   if(action==='demo-compare'){await compareExamples();return;}
   if(action==='demo-preview'){const row=records.find(r=>r.exampleKey==='export-demo-v1:comic');if(!row)throw Error('漫画演示文件已清理，请重新载入演示。');await preview(row.id+':0');return;}
   if(action==='demo-select'){picked=new Set(records.filter(r=>['export-demo-v1:comic','export-demo-v1:tool'].includes(r.exampleKey)).map(r=>r.id));filter.examples=true;filter.source='all';filter.project='all';S.render();S.toast('已选好漫画包与角色图，点击「打包已选」下载。');return;}
   if(action==='manage'){manage=!manage;picked.clear();S.render();return;}if(action==='clear-filter'){filter.query='';filter.source='all';S.render();return;}if(action==='new-tool'){choose('tool');return;}if(action==='compare'){await compareSelected();return;}if(action==='new'){chooseProject();return;}if(action==='download'){if(r)download(r);return;}if(action==='open'){open(r);return;}if(action==='preview'){await preview(id);return;}if(action==='reload'){await refresh();return;}
   if(action==='remove'){S.modal('清理此导出文件？','<p>只删除导出中心保存的这一份文件。项目、资产与其他导出版本均保留。</p>',button('确认清理','confirm-remove',id));return;}
   busy=true;n.disabled=true;if(action==='create'){n.textContent='正在导出…';document.querySelector('.ec-form')?.setAttribute('inert','');}
   if(action==='demo-load'){n.textContent='正在准备演示…';await loadExamples();filter.examples=false;filter.source='all';filter.project='all';S.render();S.toast('导出演示已载入，可预览、下载和批量打包。');}
   if(action==='confirm-remove')await remove(id);if(action==='batch')await batch();if(action==='create')await create();if(action==='video-export'){const ctx=S.context,p=index().projects.find(p=>p.kind==='video'&&p.id===ctx.params.get('project'));if(!p)throw Error('未找到视频工程');const entry=p.entries.find(e=>e.hostId===ctx.params.get('episode'))||p.entries[0];await video(p,[entry.hostId+'|'+entry.workspace.selectedEpisodeId]);}
  }catch(error){const node=document.getElementById('ec-message');if(node)node.textContent=error.message;else S.toast(error.message);}
  finally{busy=false;document.querySelector('.ec-form')?.removeAttribute('inert');if(n.isConnected){n.disabled=false;if(action==='create'){n.textContent='导出并下载';updateSelection();}if(action==='demo-load')n.textContent='载入导出演示';}}
 });

 function storeSource(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{throw Error('本机空间不足，无法返回来源；已导出的文件仍可下载。');}}
 async function compareSelected(){
  const chosen=records.filter(r=>picked.has(r.id));if(chosen.length!==2)throw Error('请选择两份导出记录。');const [a,b]=chosen;
  if(a.source!==b.source||a.projectKey!==b.projectKey||a.scopeKey!==b.scopeKey)throw Error('请选择同一来源、同一范围的两个版本。');
  if(a.source==='bundle')throw Error('请打开合集，选择其中的原始导出版本进行比较。');
  const content=async r=>{const fs=r.files.filter(f=>/\.(txt|json|png|jpg|jpeg|webp)$/i.test(f.name));return (await Promise.all(fs.map(async f=>{if(/\.(txt|json)$/i.test(f.name))return `<h4>${E(f.name)}</h4><pre class="ec-text">${E(await f.blob.text())}</pre>`;const url=URL.createObjectURL(f.blob);setTimeout(()=>URL.revokeObjectURL(url),120000);return `<h4>${E(f.name)}</h4><img class="ec-preview" src="${url}" alt="${E(f.name)}">`;}))).join('')||'<p>此格式请下载后对比。</p>';};
  const body=await Promise.all(chosen.map(async r=>`<section><h3>${E(r.title)} · v${r.version}</h3><small>${new Date(r.createdAt).toLocaleString('zh-CN')}</small>${await content(r)}</section>`));S.modal('对比导出版本',`<div class="ec-compare">${body.join('')}</div>`,'',true);
 }
 document.addEventListener('input',event=>{if(!event.target.matches('[data-ec-search]'))return;filter.query=event.target.value;const pos=event.target.selectionStart;const page=document.querySelector('.ec-page');if(!page)return;const holder=document.createElement('template');holder.innerHTML=listPage(S.context);page.replaceWith(holder.content.firstElementChild);const input=document.querySelector('[data-ec-search]');input?.focus();input?.setSelectionRange(pos,pos);});

 const route=C.route;C.route=ctx=>ctx.parts[0]==='app'&&ctx.parts[1]==='exports'?listPage(ctx):route(ctx);
 const title=C.pageTitle;C.pageTitle=ctx=>ctx.parts[1]==='exports'?'导出中心':title(ctx);
 window.ExportCenter={deliver,story,comic,video,exportTool:tool,chooseStory:p=>choose('story',p),choose,chooseProject,all,refresh,DB};
 refresh();
})();
