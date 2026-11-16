/* 明确导出后才保存实际文件。IndexedDB 中的文件不随项目修改或回收变化。 */
(()=>{
 'use strict';
 const C=Cimora,S=Site,M=ExportCenterModel,E=S.esc,DB='cimora-export-center-v1';
 const labels={story:'故事',comic:'漫画',video:'视频',tool:'创作工具',bundle:'批量打包'};
 let records=[],loaded=false,warning='',dbPromise,draft=null,busy=false,pendingTool='',filter={source:'all',project:'all',examples:false},picked=new Set();
 const clone=v=>JSON.parse(JSON.stringify(v)),q=encodeURIComponent;
 const button=(text,action,id='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-ec="${action}" data-id="${E(id)}">${text}</button>`;
 function database(){
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB,1);
   req.onupgradeneeded=()=>{req.result.createObjectStore('exports',{keyPath:'id'});req.result.createObjectStore('counters');};
   req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
   req.onerror=()=>reject(Error('导出文件库无法打开，已有记录未被覆盖。'));
   req.onblocked=()=>reject(Error('导出文件库被其他窗口占用，请关闭旧窗口后重试。'));
  }).catch(error=>{dbPromise=null;throw error;});return dbPromise;
 }
 async function all(){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('exports'),req=tx.objectStore('exports').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async function refresh(){try{records=(await all()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));loaded=true;warning='';}catch(error){warning=error.message;loaded=true;}if(S.context?.parts[1]==='exports')S.render();}
 const size=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(1)+' KB':n+' B';
 function blob(data,type){return data instanceof Blob?data:new Blob([typeof data==='object'&&!(data instanceof ArrayBuffer)&&!ArrayBuffer.isView(data)?JSON.stringify(data,null,2):data],{type:type||'application/octet-stream'});}
 async function zip(files){const entries=[];for(const f of files)entries.push({name:f.name,data:new Uint8Array(await f.blob.arrayBuffer())});return ToolPNGTuberZip.zip(entries);}
 function download(record){const url=URL.createObjectURL(record.package),a=document.createElement('a');a.href=url;a.download=record.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);S.toast('下载已发起 · '+record.filename);}
 async function deliver({files,meta,filename,downloadNow=true}){
  if(!files?.length)throw Error('没有可导出的文件。');
  files=files.map(f=>({name:f.name,blob:blob(f.data??f.blob,f.type)}));
  if(files.some(f=>!f.blob.size))throw Error('有空文件，未保存本次导出。');
  const packageBlob=files.length>1?await zip(files):files[0].blob;
  const ext=files.length>1?'zip':files[0].name.split('.').pop().toLowerCase();
  const db=await database(),id='export-'+crypto.randomUUID(),createdAt=new Date().toISOString();
  const key=[meta.source,meta.projectKey||'',meta.scopeKey||''].join('\u0000');
  const record=await new Promise((resolve,reject)=>{
   const tx=db.transaction(['exports','counters'],'readwrite'),store=tx.objectStore('exports'),counter=tx.objectStore('counters'),req=counter.get(key);let result;
   req.onsuccess=()=>{try{const previous=req.result||0;if(!Number.isSafeInteger(previous)||previous<0)throw Error('版本记录异常');const version=previous+1,baseName=filename||(files.length===1?files[0].name.replace(/\.[^.]+$/,''):meta.title+'-'+meta.scope);result={...meta,id,createdAt,version,format:ext.toUpperCase(),files,package:packageBlob,totalBytes:packageBlob.size,filename:M.safeName(baseName)+'-v'+version+'.'+ext};store.add(result);counter.put(version,key);}catch{tx.abort();}};
   tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(Error('导出文件未保存，可能是本机空间不足。旧记录和原工程均保留。'));tx.onerror=()=>{};
  });
  records.unshift(record);loaded=true;
  if(downloadNow)download(record);
  if(S.context?.parts[1]==='exports')S.render();
  return record;
 }
 const storyEpisodes=p=>p.outline||[];
 const comicEpisodes=p=>p.storyPlan?.episodes?.length?p.storyPlan.episodes:p.comicEpisodes?.length?p.comicEpisodes:p.source?.outline||[];
 const rangeLabel=(episodes,ids)=>episodes.filter(e=>ids.includes(e.id)).map(e=>'第'+(episodes.indexOf(e)+1)+'集').join('、');
 async function story(p,ids,extra={}){
  const episodes=storyEpisodes(p),files=M.storyFiles(p,ids,extra,ScriptStudio.bodyText);
  return deliver({files:files.map(f=>({...f,type:'text/plain;charset=utf-8'})),meta:{source:'story',projectKey:'story:'+p.id,projectTitle:p.title,title:p.title,scope:rangeLabel(episodes,ids),scopeKey:episodes.filter(e=>ids.includes(e.id)).map(e=>e.id).join('|')+(extra.characters?':characters':'')+(extra.outline?':outline':''),episodeId:episodes.find(e=>ids.includes(e.id))?.id,url:'/app/script?project='+q(p.id)}});
 }
 async function png(source){
  const image=new Image();image.crossOrigin='anonymous';image.src=StudioLibraryModel.imageOf(source,true);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);
  return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('漫画页编码失败。')),'image/png'));
 }
 async function comic(p,ids,pageId){
  const episodes=comicEpisodes(p),pages=M.comicPages(p,episodes,ids,pageId),files=[];
  for(const page of pages)files.push({name:pageId?page.name.split('/').pop():page.name,data:await png(page.image)});
  if(!pageId&&files.length===1){const packageBlob=await zip(files.map(f=>({name:f.name,blob:f.data})));files.splice(0,files.length,{name:'整集漫画.zip',data:packageBlob});}
  const scope=rangeLabel(episodes,ids)+(pageId?' · 第'+((p.bodyPagination.episodes[ids[0]].pages.findIndex(x=>x.id===pageId))+1)+'页':' · 共'+pages.length+'页');
  return deliver({files,filename:p.title+'-'+scope,meta:{source:'comic',projectKey:'comic:'+p.id,projectTitle:p.title,title:p.title,scope,scopeKey:episodes.filter(e=>ids.includes(e.id)).map(e=>e.id).join('|')+(pageId?':'+pageId:':all'),episodeId:pages[0].episodeId,pageId:pages[0].pageId,sourceRefs:pages.map(({image,name,...ref})=>ref),url:'/app/comic?project='+q(p.id)}});
 }
 function videoEpisodes(project){return (project.entries||[]).flatMap(entry=>(entry.workspace.episodes||[]).map(e=>({...e,id:entry.hostId+'|'+e.id,episodeId:e.id,hostId:entry.hostId,entry})));}
 async function video(project,ids){
  const episodes=M.selected(videoEpisodes(project),ids),files=[],refs=[];
  for(const e of episodes){const value=e.entry.workspace.finishing?.episodes?.[e.episodeId],v=value?.versions?.[0];if(!v)throw Error(e.title+' 尚无已保存的拼接方案，请返回整集制作。');
   files.push({name:String(videoEpisodes(project).findIndex(x=>x.id===e.id)+1).padStart(2,'0')+'-'+M.safeName(e.title)+'-拼接方案.json',data:{format:'cimora-video-assembly-plan',notice:'拼接方案，未输出 MP4 或混音文件。',project:project.title,episode:e.title,version:clone(v)},type:'application/json'});refs.push({hostId:e.hostId,episodeId:e.episodeId,versionId:v.id});}
  return deliver({files,meta:{source:'video',projectKey:project.key,projectTitle:project.title,title:project.title+' · 拼接方案',scope:episodes.map(e=>e.title).join('、'),scopeKey:ids.join('|'),hostId:episodes[0].hostId,episodeId:episodes[0].episodeId,sourceRefs:refs,notice:'仅拼接方案 JSON，未输出视频或混音。',url:'/app/video?project='+q(project.id)+'&episode='+q(episodes[0].hostId)+'&stage=4'}});
 }
 function toolId(snapshot){return snapshot.toolId||(snapshot.pngtuber?'pngtuber':snapshot.stickers?'sticker-maker':snapshot.optimization?'batch-assets':'');}
 async function toolFiles(snapshot){
  snapshot=clone(snapshot);snapshot.toolId=toolId(snapshot);
  for(const image of [...(snapshot.images||[]),...(snapshot.performance||[])])if(image.src&&!image.src.startsWith('data:')){const response=await fetch(image.src);if(!response.ok)throw Error('工具图片读取失败，未保存导出。');const data=await response.blob();image.src=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(Error('图片读取失败'));r.readAsDataURL(data);});}
  return ToolStudio.exportFiles(snapshot);
 }
 async function tool(snapshot){
  snapshot=clone(snapshot);snapshot.toolId=toolId(snapshot);const files=await toolFiles(snapshot);
  return deliver({files,meta:{source:'tool',projectKey:'',projectTitle:'个人创作',title:snapshot.title||ToolCatalog.find(snapshot.toolId)?.title||'工具成果',scope:'当前成果'+(snapshot.version?' · 来源 v'+snapshot.version:''),scopeKey:snapshot.id||snapshot.toolId+':'+(snapshot.createdAt||snapshot.prompt||''),toolId:snapshot.toolId,toolResultId:snapshot.id,notice:snapshot.notice||'本机示例成果，具体内容以工具说明为准。',url:'/app/tools/'+q(snapshot.toolId)}});
 }
 function index(){return StudioLibrary.load();}
 function sources(source){return index().projects.filter(p=>p.kind===source&&p.state==='active');}
 function tools(){return index().assets.filter(a=>a.tool&&a.key.startsWith('tool:')&&a.state==='active');}
 function choose(source='story',project){
  const entry=project?{raw:clone(project),id:project.id,title:project.title,key:source+':'+project.id,kind:source}:sources(source)[0];
  draft={source,project:entry?.key||'',current:project?entry:null,ids:[],mode:'episodes',pageId:'',characters:false,outline:false};setDefaults();drawChooser();
 }
 function projectForDraft(){return draft.current||sources(draft.source).find(p=>p.key===draft.project);}
 function episodesForDraft(){const p=projectForDraft();return !p?[]:draft.source==='story'?storyEpisodes(p.raw):draft.source==='comic'?comicEpisodes(p.raw):videoEpisodes(p);}
 function setDefaults(){draft.ids=draft.source==='tool'?tools().map(a=>a.key):episodesForDraft().map(e=>e.id);if(draft.source==='comic')draft.pageId=projectForDraft()?.raw.bodyPagination?.episodes?.[draft.ids[0]]?.pages?.[0]?.id||'';}
 function drawChooser(){
  const p=draft.source==='tool'?null:projectForDraft(),episodes=draft.source==='tool'?[]:episodesForDraft();
  const options=Object.entries(labels).filter(([key])=>key!=='bundle').map(([key,label])=>`<option value="${key}" ${draft.source===key?'selected':''}>${label}</option>`).join('');
  let html=`<div class="ec-form"><label>来源<select data-ec-field="source">${options}</select></label>`;
  if(draft.source==='tool')html+=`<p>选择保存过的独立成果，无需关联项目。</p><div class="ec-choices">${tools().map(a=>`<label><input type="checkbox" data-ec-episode="${E(a.key)}" ${draft.ids.includes(a.key)?'checked':''}>${E(a.name)} <small>v${E(a.raw.version||1)}</small></label>`).join('')||'<p>还没有保存的工具成果，可在工具内下载当前结果或先保存。</p>'}</div>`;
  else{
   html+=`<label>项目<select data-ec-field="project">${(draft.current?[draft.current]:sources(draft.source)).map(item=>`<option value="${E(item.key)}" ${item.key===draft.project?'selected':''}>${E(item.title)}</option>`).join('')||'<option>暂无可导出项目</option>'}</select></label>`;
   if(draft.source==='comic')html+=`<label>范围<select data-ec-field="mode"><option value="episodes">单集 / 多集</option><option value="page" ${draft.mode==='page'?'selected':''}>单页 PNG</option></select></label>`;
   if(draft.mode==='page'){
    html+=`<label>集<select data-ec-field="singleEpisode">${episodes.map(e=>`<option value="${E(e.id)}" ${draft.ids[0]===e.id?'selected':''}>${E(e.title)}</option>`).join('')}</select></label><label>页<select data-ec-field="pageId">${(p?.raw.bodyPagination?.episodes?.[draft.ids[0]]?.pages||[]).map((pg,i)=>`<option value="${E(pg.id)}" ${draft.pageId===pg.id?'selected':''}>第${i+1}页${p.raw.wholePageStudio?.works?.[pg.id]?.adoptedId?'':' · 未采用成稿'}</option>`).join('')||'<option value="">尚未分页</option>'}</select></label>`;
   }else html+=`<div class="ec-choices">${episodes.map(e=>`<label><input type="checkbox" data-ec-episode="${E(e.id)}" ${draft.ids.includes(e.id)?'checked':''}>${E(e.title)}${draft.source==='story'?`<small>${ScriptStudio.bodyText(p.raw,e.id).trim()?'已有正文':'缺少正文'}</small>`:''}</label>`).join('')||'<p>还没有分集，请先在工作台整理内容。</p>'}</div>`;
   if(draft.source==='story')html+=`<div class="ec-options"><label><input type="checkbox" data-ec-field="characters" ${draft.characters?'checked':''}>附带人物设定</label><label><input type="checkbox" data-ec-field="outline" ${draft.outline?'checked':''}>附带所选集纲</label></div><p>默认导出所选集正文 TXT；附带资料时打包为 ZIP。</p>`;
   if(draft.source==='comic')html+='<p>只导出当前分页中已采用的成稿，按集和页码排序。整集缺页会列出缺项。</p>';
   if(draft.source==='video')html+='<p>当前仅支持已保存的拼接方案 JSON，未输出 MP4 成品。</p>';
  }
  html+='<p id="ec-message" role="alert"></p></div>';
  S.modal('新建导出',html,button('导出并保存记录','create','',true));
 }
 async function create(){
  StudioLibrary.guard();const d=clone(draft),p=projectForDraft();if(!d.ids.length)throw Error('请至少选择一项。');let result;
  if(d.source==='story')result=await story(p.raw,d.ids,{characters:d.characters,outline:d.outline});
  if(d.source==='comic'){if(d.mode==='page'&&!d.pageId)throw Error('当前集尚未分页，请先返回漫画编排。');result=await comic(p.raw,d.mode==='page'?[d.ids[0]]:d.ids,d.mode==='page'?d.pageId:undefined);}
  if(d.source==='video')result=await video(p,d.ids);
  if(d.source==='tool'){
   const assets=tools().filter(a=>d.ids.includes(a.key));if(assets.length!==d.ids.length)throw Error('工具成果已变化，请重新选择。');
   if(assets.length===1)result=await tool(assets[0].raw);
   else{const files=[];for(const [i,a]of assets.entries()){for(const f of await toolFiles(a.raw))files.push({...f,name:String(i+1).padStart(2,'0')+'-'+M.safeName(a.name)+'/'+f.name});}
    result=await deliver({files,meta:{source:'tool',projectKey:'',projectTitle:'个人创作',title:'工具成果合集',scope:assets.length+'项成果',scopeKey:assets.map(a=>a.key).join('|'),notice:'独立工具成果，内容保留各工具的示例说明。',url:'/app/tool-results'}});}
  }
  S.close();return result;
 }
 function exampleGuide(){
  const present=records.some(r=>r.example);
  return `<section class="ec-demo" aria-label="导出演示"><div class="ec-demo-heading"><div><strong>先试一次导出流程</strong><p>${present?'已准备故事的首稿与修改稿、漫画成稿包、独立角色图和视频拼接方案。':'载入后会新增独立的示例项目和5份可下载文件，体验旧版本保留、成稿下载与批量打包。'}</p></div><div class="ec-demo-actions">${present?button(filter.examples?'显示全部记录':'只看导出演示','demo-filter')+button('补齐演示文件','demo-load'):button('载入导出演示','demo-load','',true)}</div></div>${present?`<div class="ec-demo-steps"><article><b>01 · 改稿后，旧版还在</b><p>故事首稿与修改稿的结尾不同，分别保存、分别下载。</p>${button('对比故事版本','demo-compare')}</article><article><b>02 · 看得到实际成稿</b><p>漫画包内有两页已有日漫风成稿，角色图是独立工具成果。</p>${button('预览漫画成稿','demo-preview')}</article><article><b>03 · 多种成果一起带走</b><p>先选好漫画包与角色图，再点「打包已选」下载合集。</p>${button('选好这两份文件','demo-select')}</article></div>`:'<p class="ec-demo-note">复用已有示例图，不调用模型；视频仅展示方案文件，声音不生成。已有作品保持原样。</p>'}</section>`;
 }
 async function compareExamples(){
  const rows=['story-first','story-revised'].map(key=>records.find(r=>r.exampleKey==='export-demo-v1:'+key));
  if(rows.some(r=>!r)){S.toast('故事演示文件已清理，请重新载入演示。');return;}
  const texts=await Promise.all(rows.map(r=>r.files[0].blob.text()));
  S.modal('对比故事导出版本',`<p>同一集的两次导出，修改稿在结尾新增了动作。下方直接读取已保存的文件。</p><div class="ec-compare">${rows.map((r,i)=>`<section><h3>${i?'修改稿':'首稿'} · v${r.version}</h3><pre class="ec-text">${E(texts[i].slice(-700))}</pre>${button('下载这一版','download',r.id,true)}</section>`).join('')}</div>`,'',true);
 }
 function listPage(ctx){
  const item=ctx.params.get('item');if(item)return detail(records.find(r=>r.id===item));
  const projects=[...new Map(records.map(r=>[r.projectKey||'personal',r.projectTitle||'个人创作'])).entries()];
  const rows=records.filter(r=>(!filter.examples||r.example)&&(filter.source==='all'||r.source===filter.source)&&(filter.project==='all'||(r.projectKey||'personal')===filter.project));
  return `<div class="ec-page"><header class="ec-heading"><div><span class="cm-kicker">EXPORT CENTER</span><h1>导出中心</h1><p>保存每次导出的文件，随时再次下载，或将多个版本打包。</p></div>${button('＋ 新建导出','new','',true)}</header>${exampleGuide()}${warning?`<p class="ec-warning" role="alert">${E(warning)}${button('重试读取','reload')}</p>`:''}<div class="ec-toolbar"><div class="ec-filters"><label>来源<select data-ec-filter="source"><option value="all">全部来源</option>${Object.entries(labels).map(([key,label])=>`<option value="${key}" ${filter.source===key?'selected':''}>${label}</option>`).join('')}</select></label><label>项目<select data-ec-filter="project"><option value="all">全部项目</option>${projects.map(([key,label])=>`<option value="${E(key)}" ${filter.project===key?'selected':''}>${E(label)}</option>`).join('')}</select></label></div>${button('打包已选（'+picked.size+'）','batch')}</div>${!loaded?'<div class="ec-empty">正在读取已保存文件…</div>':rows.length?`<div class="ec-list">${rows.map(r=>`<article class="ec-row" data-export-id="${E(r.id)}"><input type="checkbox" aria-label="选择 ${E(r.title)} v${r.version}" data-ec-pick="${E(r.id)}" ${picked.has(r.id)?'checked':''}><div class="ec-file-icon">${E(r.format)}</div><div class="ec-row-copy"><h2><a href="#/app/exports?item=${q(r.id)}">${E(r.title)}</a><span>v${r.version}${r.example?' · 演示':''}</span></h2><p>${E(r.scope)} · ${E(r.projectTitle||'个人创作')}</p><small>${labels[r.source]} · ${new Date(r.createdAt).toLocaleString('zh-CN')} · ${size(r.totalBytes)}</small>${r.notice?`<p class="ec-notice">${E(r.notice)}</p>`:''}</div><div class="ec-actions">${button('下载','download',r.id,true)}<a class="cm-button ghost" href="#/app/exports?item=${q(r.id)}">查看</a>${r.source!=='bundle'?button('返回来源','open',r.id):''}${button('清理','remove',r.id)}</div></article>`).join('')}</div>`:`<div class="ec-empty"><span>⇩</span><h2>${records.length?'没有符合筛选条件的导出':'还没有导出文件'}</h2><p>从故事、漫画或工具下载成果，或点击「新建导出」。<br>保存到资产库的成果不会自动成为导出记录。</p></div>`}<p class="ec-footnote">记录保存在当前浏览器本机。下载使用当次保存的文件；原稿更新不覆盖旧版本。清理导出不删除工程或资产。</p></div>`;
 }
 function detail(r){return `<div class="ec-page"><a class="cm-button ghost" href="#/app/exports">← 返回导出中心</a>${r?`<header class="ec-heading"><div><h1>${E(r.title)} <small>v${r.version}</small></h1><p>${E(r.scope)} · ${E(r.projectTitle||'个人创作')}</p></div><div class="ec-actions">${button('下载此版本','download',r.id,true)}${r.source!=='bundle'?button('返回来源','open',r.id):''}${button('清理','remove',r.id)}</div></header><section class="ec-panel"><dl><dt>实际文件</dt><dd>${E(r.filename)}</dd><dt>格式与大小</dt><dd>${E(r.format)} · ${size(r.totalBytes)}</dd><dt>导出时间</dt><dd>${new Date(r.createdAt).toLocaleString('zh-CN')}</dd></dl>${r.notice?`<p class="ec-warning">${E(r.notice)}</p>`:''}<h2>包内文件</h2>${r.files.map((f,i)=>`<div class="ec-file"><span>${E(f.name)}</span><small>${size(f.blob.size)}</small>${/\.(txt|json|png|jpg|jpeg|webp|gif|wav|mp3|mp4)$/i.test(f.name)?button('查看文件','preview',r.id+':'+i):''}</div>`).join('')}<p>这是导出时的固定文件。工程之后的修改不会改变此版本。</p></section>`:'<div class="ec-empty"><h1>未找到此导出</h1><p>记录可能已清理，原项目和资产仍保留。</p></div>'}</div>`;}
 async function preview(id){const split=id.lastIndexOf(':'),r=records.find(x=>x.id===id.slice(0,split)),f=r?.files[Number(id.slice(split+1))];if(!f)throw Error('文件不存在。');let html,url;
  if(/\.(txt|json)$/i.test(f.name))html='<pre class="ec-text">'+E(await f.blob.text())+'</pre>';
  else{url=URL.createObjectURL(f.blob);html=/\.(wav|mp3)$/i.test(f.name)?`<audio controls src="${url}"></audio>`:/\.mp4$/i.test(f.name)?`<video class="ec-preview" controls src="${url}"></video>`:`<img class="ec-preview" src="${url}" alt="${E(f.name)}">`;setTimeout(()=>URL.revokeObjectURL(url),120000);}
  S.modal(f.name,html,button('下载完整导出包','download',r.id,true));
 }
 function open(r){
  if(r.exampleSource){const source=r.exampleSource;S.modal(r.title,`<div class="ec-example-source"><p class="ec-warning">演示来源预览 · 本机文本存储空间不足，未能完整保存示例项目；当前展示独立来源预览，已保存的导出文件可正常下载。</p><pre class="ec-text">${E(source.text||'')}</pre>${(source.images||[]).map(src=>`<img class="ec-preview" src="${E(src)}" alt="演示来源图片">`).join('')}</div>`,button('下载此版本','download',r.id,true),true);return;}
  if(r.source==='story'||r.source==='comic'){
   StudioLibrary.guard();const key=r.source==='story'?StudioLibrary.STORY:StudioLibrary.COMIC,db=JSON.parse(localStorage.getItem(key)||'{}'),p=db.projects?.find(p=>r.projectKey===r.source+':'+p.id);if(!p)throw Error('原工程已不存在，仍可下载此版本。');
   const state=StudioLibrary.meta().projects?.[r.projectKey]?.state;if(state&&state!=='active')throw Error('原工程已归档或回收，请先在我的项目恢复。导出文件仍可下载。');
   db.active=p.id;if(r.source==='story'){p.stage=5;p.selectedEpisode=r.episodeId;p.bodySelectedId=r.episodeId;if(p.outline.some(e=>e.id===r.episodeId))ScriptStudio.openBody(p,r.episodeId);}else{p.stage=3;p.activeEpisodeId=r.episodeId;p.wholePageStudio.selected||={};p.wholePageStudio.selected[r.episodeId]=r.pageId;}StudioLibrary.store(key,db);
  }
  if(r.source==='video'){const p=S.state.projects.find(p=>r.projectKey==='video:'+p.id),e=p&&C.M.db.projects[p.id]?.[r.hostId];if(!e?.videoFlow?.workspace)throw Error('原视频工程已不存在，仍可下载此版本。');e.videoFlow.workspace.selectedEpisodeId=r.episodeId;C.M.save();}
  if(r.source==='tool'&&r.toolResultId){const saved=ToolStudio.store.list().find(x=>x.id===r.toolResultId);if(!saved)throw Error('原工具成果已移除，仍可下载此版本。');pendingTool=saved.id;S.route('/app/tool-results');return;}
  location.hash='#'+r.url;
 }
 async function batch(){const rows=records.filter(r=>picked.has(r.id));if(!rows.length)throw Error('请先选择需要打包的导出记录。');const files=[];for(const [i,r]of rows.entries())files.push({name:String(i+1).padStart(2,'0')+'-'+r.filename,data:r.package});if(files.length===1){files[0]={name:'导出合集.zip',data:await zip([{name:files[0].name,blob:files[0].data}])};}
  await deliver({files,meta:{source:'bundle',title:'导出文件合集',projectKey:'',projectTitle:'多个来源',scope:rows.length+'份导出文件',scopeKey:rows.map(r=>r.id).join('|'),sourceRefs:rows.map(r=>({id:r.id,version:r.version,filename:r.filename}))}});picked.clear();S.render();}
 async function remove(id){const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction('exports','readwrite');tx.objectStore('exports').delete(id);tx.oncomplete=resolve;tx.onabort=()=>reject(Error('清理失败，请重试。'));});records=records.filter(r=>r.id!==id);picked.delete(id);S.close();if(S.context.params.has('item'))location.hash='#/app/exports';else S.render();S.toast('导出文件已清理，工程和资产保留。');}
 document.addEventListener('change',event=>{
  const n=event.target;if(n.dataset.ecFilter){filter[n.dataset.ecFilter]=n.value;S.render();}
  if(n.dataset.ecPick){n.checked?picked.add(n.dataset.ecPick):picked.delete(n.dataset.ecPick);S.render();}
  if(n.dataset.ecEpisode&&draft){draft.ids=n.checked?[...draft.ids,n.dataset.ecEpisode]:draft.ids.filter(x=>x!==n.dataset.ecEpisode);}
  if(n.dataset.ecField&&draft){const field=n.dataset.ecField;
   if(field==='source'){draft.current=null;draft.source=n.value;draft.project=sources(draft.source)[0]?.key||'';draft.mode='episodes';setDefaults();}
   else if(field==='project'){draft.project=n.value;setDefaults();}
   else if(field==='mode'){draft.mode=n.value;if(n.value==='page'){draft.ids=episodesForDraft().slice(0,1).map(e=>e.id);draft.pageId=projectForDraft()?.raw.bodyPagination?.episodes?.[draft.ids[0]]?.pages?.[0]?.id||'';}}
   else if(field==='singleEpisode'){draft.ids=[n.value];draft.pageId=projectForDraft()?.raw.bodyPagination?.episodes?.[n.value]?.pages?.[0]?.id||'';}
   else draft[field]=n.type==='checkbox'?n.checked:n.value;
   if(!['characters','outline','pageId'].includes(field))drawChooser();
  }
 });
 document.addEventListener('click',async event=>{const n=event.target.closest('[data-ec]');if(!n)return;event.preventDefault();if(busy)return;const action=n.dataset.ec,id=n.dataset.id,r=records.find(x=>x.id===id);
  try{
   if(action==='demo-filter'){filter.examples=!filter.examples;filter.source='all';filter.project='all';S.render();return;}
   if(action==='demo-compare'){await compareExamples();return;}
   if(action==='demo-preview'){const row=records.find(r=>r.exampleKey==='export-demo-v1:comic');if(!row)throw Error('漫画演示文件已清理，请重新载入演示。');await preview(row.id+':0');return;}
   if(action==='demo-select'){picked=new Set(records.filter(r=>['export-demo-v1:comic','export-demo-v1:tool'].includes(r.exampleKey)).map(r=>r.id));filter.examples=true;filter.source='all';filter.project='all';S.render();S.toast('已选好漫画包与角色图，点击「打包已选」下载。');return;}
   if(action==='new'){choose();return;}if(action==='download'){if(r)download(r);return;}if(action==='open'){open(r);return;}if(action==='preview'){await preview(id);return;}if(action==='reload'){await refresh();return;}
   if(action==='remove'){S.modal('清理此导出文件？','<p>只删除导出中心保存的这一份文件。项目、资产与其他导出版本均保留。</p>',button('确认清理','confirm-remove',id));return;}
   busy=true;n.disabled=true;
   if(action==='demo-load'){n.textContent='正在准备演示…';await ExportCenterExamples.load();filter.examples=true;filter.source='all';filter.project='all';S.render();S.toast('导出演示已载入，可预览、下载和批量打包。');}
   if(action==='confirm-remove')await remove(id);if(action==='batch')await batch();if(action==='create')await create();if(action==='video-export'){const ctx=S.context,p=index().projects.find(p=>p.kind==='video'&&p.id===ctx.params.get('project'));if(!p)throw Error('未找到视频工程');const entry=p.entries.find(e=>e.hostId===ctx.params.get('episode'))||p.entries[0];await video(p,[entry.hostId+'|'+entry.workspace.selectedEpisodeId]);}
  }catch(error){const node=document.getElementById('ec-message');if(node)node.textContent=error.message;else S.toast(error.message);}
  finally{busy=false;if(n.isConnected){n.disabled=false;if(action==='demo-load')n.textContent='载入导出演示';}}
 });
 const route=C.route;C.route=ctx=>{const previous=route(ctx);return ctx.parts[0]==='app'&&ctx.parts[1]==='exports'?listPage(ctx):previous;};
 const after=C.afterRender;C.afterRender=ctx=>{after?.(ctx);if(pendingTool&&ctx.parts[1]==='tool-results'){const id=pendingTool;pendingTool='';try{ToolStudio.openSaved(id);}catch(error){S.toast(error.message);}}};
 window.ExportCenter={deliver,story,comic,video,exportTool:tool,chooseStory:p=>choose('story',p),choose,all,refresh,DB};
 refresh();
})();
