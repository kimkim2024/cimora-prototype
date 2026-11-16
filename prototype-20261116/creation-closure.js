(()=>{
 'use strict';
 const S=Site,C=Cimora,E=S.esc,copy=value=>JSON.parse(JSON.stringify(value)),q=encodeURIComponent;
 const button=(text,action,key='')=>`<button type="button" class="cm-button ghost" data-closure="${action}" data-key="${E(key)}">${text}</button>`;
 const link=(text,url)=>C.link(text,url,'cm-button ghost');
 let pendingSetting='',resultRequest=0;
 function planningDialog(key){
  const a=StudioLibrary.findAsset(key);if(!a||a.state!=='active'||!a.raw?.settingOnly)throw Error('设定已不可用。');pendingSetting=key;
  S.modal('用于内容策划',`<div class="cg-form"><p>以这份设定开始新的策划对话，原资产及已有工程保留。</p><h3>${E(a.name)}</h3><label>创作类型<select id="closure-planning-kind"><option value="story">故事</option><option value="comic">漫画</option><option value="video">视频</option></select></label><label>项目名称<input id="closure-planning-title" maxlength="60" value="${E(a.name+' · 我的创作')}"></label><label>补充创意（可选）<textarea id="closure-planning-note" rows="3" placeholder="想在这个世界发生什么故事？"></textarea></label><p>只带入前期创意和来源，不将设定冒充完整正文。</p><p role="alert" id="closure-error"></p></div>`,button('创建并带入策划','create-planning'),true);
 }
 function createPlanning(){
  StudioLibrary.guard();const a=StudioLibrary.findAsset(pendingSetting);if(!a||a.state!=='active')throw Error('来源已变化，请重新选择。');
  const kind=document.getElementById('closure-planning-kind').value,title=document.getElementById('closure-planning-title').value.trim(),note=document.getElementById('closure-planning-note').value.trim();if(!title)throw Error('请填写项目名称。');
  const original=[a.original||a.description,note&&'我的创意：'+note].filter(Boolean).join('\n\n'),reference={assetKey:a.key,versionId:a.version?.id,name:a.name,text:a.original||a.description,market:copy(a.raw.market||null),capturedAt:new Date().toISOString()};let url;
  if(kind==='story'){
   const db=JSON.parse(localStorage.getItem(StudioLibrary.STORY)||'{"version":1,"projects":[],"assets":[]}'),p=ScriptStudio.create();p.title=title;p.original=original;p.sourceName=a.name;p.planningReferences=[reference];db.projects.push(p);db.active=p.id;StudioLibrary.store(StudioLibrary.STORY,db);url='/app/script?project='+q(p.id);
  }else if(kind==='comic'){
   const raw=localStorage.getItem(StudioLibrary.COMIC),db=raw?ComicStudio.restore(raw):{version:1,projects:[],active:null},p=ComicStudio.newProject(db);p.title=title;p.original=original;p.planningReferences=[reference];EpisodePlanning.ensure(p).seed=original;StudioLibrary.store(StudioLibrary.COMIC,db);url='/app/comic?project='+q(p.id);
  }else{
   const before=copy(S.state.projects),modelBefore=copy(C.M.db.projects);
   try{const ctx=C.M.videoFlow.create(C.M.videoFlow.fromIdea(original),{title,ratio:'16:9'}),w=C.M.videoWorkspace.ensure(ctx);w.planningReferences=[reference];w.title=title;if(S.save()===false)throw Error('视频策划未保存，请检查本机空间。');url='/app/video?project='+q(ctx.p.id)+'&episode='+q(ctx.c.id)+'&stage=1';}catch(error){S.state.projects=before;C.M.db.projects=modelBefore;throw error;}
  }
  pendingSetting='';S.close();S.route(url);S.toast('设定已进入策划，来源和版本已保留');
 }
 async function projectResults(project){
  const request=++resultRequest,host=document.createElement('section');host.className='sl-panel';host.id='closure-project-results';host.innerHTML='<h2>成品与去向</h2><p role="status">正在读取导出与发布记录…</p>';
  const previous=[...document.querySelectorAll('.sl-detail-grid>div>.sl-panel')].find(n=>n.querySelector('h2')?.textContent==='成品');if(previous)previous.replaceWith(host);else return;
  const results=await Promise.allSettled([ExportCenter.all(),CommunityStudio.refresh()]);if(request!==resultRequest||!host.isConnected)return;
  const files=results[0].status==='fulfilled'?results[0].value.filter(r=>r.projectKey===project.key):null,works=results[1].status==='fulfilled'?CommunityStudio.all().filter(w=>w.sourceKey===project.key):null;
  const demos=videoDeliveries(project);
  host.innerHTML=`<h2>成品与去向</h2><div class="closure-actions">${button('发布作品','publish-project',project.key)}${button('导出作品','export-project',project.key)}</div><h3>已导出文件</h3>${files===null?'<p role="alert">导出记录读取失败，请重新打开项目重试。</p>':files.length?files.map(r=>`<div class="closure-result"><span>${E(r.scope)} · v${r.version} · ${E(r.format)}</span>${link('查看导出 · '+r.title,'/app/exports?item='+q(r.id))}</div>`).join(''):'<p>暂无导出记录。导出后会保留独立文件版本。</p>'}<h3>广场发布</h3>${works===null?'<p role="alert">发布记录读取失败，请重新打开项目重试。</p>':works.length?works.map(w=>`<div class="closure-result"><span>${w.chapters?.length||1}集 · ${w.visibility==='private'?'仅自己可见':'广场展示'}</span>${link(w.title,'/app/community/'+q(w.id))}<small>源稿修改不会自动覆盖发布版本；进入作品可更新本集。</small></div>`).join(''):'<p>尚未发布；源工程和制作资产不会随成品公开。</p>'}${project.kind==='video'?`<h3>整集演示成品</h3>${demos.length?demos.map(d=>`<div class="closure-result"><span>${E(d.title)} · 静态演示 · ${d.clips.length}镜</span>${button('预览演示成品','preview-video',project.key+'|'+d.id)}</div>`).join(''):'<p>在整集制作保存拼接方案后，可保存演示成品，体验发布流程。</p>'}`:''}`;
 }
 function videoDeliveries(project){return (project?.entries||[]).flatMap(entry=>(entry.workspace.demoDeliveries||[]).map(d=>({...d,hostId:entry.hostId})));}
 function context(){const params=S.context?.params;if(!params?.get('project'))throw Error('请先进入视频工程。');return C.M.activate(params.get('project'),params.get('episode'));}
 function saveVideoDemo(){
  StudioLibrary.guard();const ctx=context(),w=C.M.videoWorkspace.ensure(ctx),episode=w.episodes.find(e=>e.id===w.selectedEpisodeId),fin=C.M.videoFinishing,version=fin.state(ctx).versions[0];
  if(!version||version.signature!==fin.signature(ctx))throw Error('请先保存当前整集拼接方案，再保存演示成品。');
  if(w.demoDeliveries?.some(d=>d.assemblyId===version.id)){S.toast('该拼接版本已有演示成品，可在项目中预览。');return;}
  const delivery={id:S.id('video-demo'),episodeId:episode.id,title:episode.title,assemblyId:version.id,createdAt:new Date().toISOString(),placeholder:true,duration:version.duration,clips:version.clips.map(clip=>({id:clip.id,image:clip.image,intent:clip.intent||episode.outline||'',in:clip.in,out:clip.out})),notice:'静态演示成品：用于演示整集保存、项目管理与发布，不包含可播放视频或混音。'};
  C.M.videoWorkspace.save(ctx,w=>{w.demoDeliveries??=[];w.demoDeliveries.unshift(delivery);});S.toast('演示成品已保存，可到项目预览或发布');S.route('/app/projects?item='+q('video:'+ctx.p.id));
 }
 function previewVideo(key){const separator=key.lastIndexOf('|'),p=StudioLibrary.findProject(key.slice(0,separator)),d=videoDeliveries(p).find(d=>d.id===key.slice(separator+1));if(!d)throw Error('演示成品不存在。');S.modal(d.title+' · 演示成品',`<div class="cg-form"><p>${E(d.notice)}</p><p>时长 ${Number(d.duration).toFixed(1)} 秒 · ${d.clips.length}镜</p>${d.clips.map((clip,i)=>`<figure><img style="max-width:100%" src="${E(StudioLibraryModel.imageOf(clip.image))}" alt="第${i+1}镜"><figcaption>第${i+1}镜</figcaption></figure>`).join('')}</div>`,button('发布演示作品','publish-project',p.key),true);}
 function addPlanningSource(ctx){
  const kind=ctx.parts[1];let refs=[];
  if(kind==='script'){const db=JSON.parse(localStorage.getItem(StudioLibrary.STORY)||'{}');refs=db.projects?.find(p=>p.id===ctx.params.get('project'))?.planningReferences||[];}
  if(kind==='comic'){const db=JSON.parse(localStorage.getItem(StudioLibrary.COMIC)||'{}');refs=db.projects?.find(p=>p.id===ctx.params.get('project'))?.planningReferences||[];}
  if(kind==='video'&&ctx.params.get('project'))refs=C.M.videoWorkspace.ensure(context()).planningReferences||[];
  if(!refs.length)return;const main=document.querySelector('main');if(main&&!document.getElementById('closure-planning-source'))main.insertAdjacentHTML('afterbegin',`<aside id="closure-planning-source" class="closure-source"><b>本次策划使用的设定</b>${refs.map(r=>link(r.name,'/app/assets?item='+q(r.assetKey))).join('')}<small>已保留所选版本，后续编辑不改动来源。</small></aside>`);
 }
 const after=C.afterRender;C.afterRender=ctx=>{
  after(ctx);if(ctx.parts[0]!=='app')return;
  if(ctx.parts[1]==='tool-results'){
   const available=new Set(MarketStudio.sellable().map(asset=>asset.key));
   for(const node of document.querySelectorAll('[data-ts="open-result"]'))if(available.has('tool:'+node.dataset.id))node.parentElement.insertAdjacentHTML('beforeend',button('加入资产包','sell','tool:'+node.dataset.id));
  }
  if(ctx.parts[1]==='assets'&&ctx.params.get('item')){
   const a=StudioLibrary.findAsset(ctx.params.get('item')),actions=document.querySelector('.sl-heading>.sl-actions');
   if(a?.state==='active'&&actions){if(a.raw?.settingOnly)actions.insertAdjacentHTML('afterbegin',button('用于内容策划','planning',a.key));if(window.MarketStudio?.sellable().some(item=>item.key===a.key))actions.insertAdjacentHTML('beforeend',button('加入资产包','sell',a.key));if(a.raw?.market&&a.raw.toolId)actions.insertAdjacentHTML('afterbegin',button(a.type==='声音'?'试听 / 下载':'查看交付 / 下载','delivery',a.key));}
  }
  if(ctx.parts[1]==='community'&&ctx.parts[2]){const w=CommunityStudio.all().find(w=>w.id===ctx.parts[2]),ch=w?.chapters?.find(ch=>ch.id===ctx.params.get('chapter'))||w?.chapters?.[0],panel=[...document.querySelectorAll('.cm-panel')].find(n=>n.querySelector('h3')?.textContent==='作品管理');if(panel&&ch?.sourceEpisode&&['story','comic'].includes(w.kind))panel.insertAdjacentHTML('beforeend',button('更新本集成稿','revise',w.id+'|'+ch.id)+(ch.revisions?.length?button('查看修订记录','history',w.id+'|'+ch.id):''));}
  if(ctx.parts[1]==='projects'&&ctx.params.get('item')){const project=StudioLibrary.findProject(ctx.params.get('item'));if(project)void projectResults(project);}
  if(['script','comic','video'].includes(ctx.parts[1])){
   const kind={script:'story',comic:'comic',video:'video'}[ctx.parts[1]],project=StudioLibrary.findProject(kind+':'+ctx.params.get('project'));
   if(project&&!document.getElementById('closure-workbench-links'))document.querySelector('main')?.insertAdjacentHTML('afterbegin',`<div id="closure-workbench-links" class="closure-actions">${link('项目成品与发布','/app/projects?item='+q(project.key))}${link('选用资产','/app/assets?project='+q(project.key))}</div>`);
   addPlanningSource(ctx);
   if(ctx.parts[1]==='video'&&document.querySelector('.vsb-timeline')&&!document.querySelector('[data-closure="save-video-demo"]'))document.querySelector('.vsb-page,.vsb-workspace,.vsb-shell,.vsb-main')?.insertAdjacentHTML('beforeend',`<div class="closure-source"><span>完成拼接后，保存静态演示成品，体验项目和广场发布。</span>${button('保存演示成品','save-video-demo')}</div>`);
  }
 };
 document.addEventListener('click',async event=>{
  const node=event.target.closest('[data-closure]');if(!node)return;event.preventDefault();if(node.disabled)return;node.disabled=true;
  try{const {closure:action,key}=node.dataset;
   if(action==='planning')planningDialog(key);
   else if(action==='create-planning')createPlanning();
   else if(action==='sell')MarketStudio.startListing(key);
   else if(action==='delivery'){ToolStudio.openSaved(key);const footer=document.querySelector('#site-modal .modal-footer,#site-modal footer,#site-modal .cm-modal-actions,#site-modal .cm-modal-footer');const a=StudioLibrary.findAsset(key);if(footer)footer.insertAdjacentHTML('afterbegin',button('下载交付成果','download-delivery',key));else document.querySelector('#site-modal .ts-snapshot,#site-modal .ts-audio-result')?.insertAdjacentHTML('afterend',button('下载交付成果','download-delivery',key));if(a?.type==='声音'&&!document.querySelector('[data-closure="download-delivery"]'))document.querySelector('#site-modal')?.insertAdjacentHTML('beforeend',button('下载交付成果','download-delivery',key));}
   else if(action==='download-delivery'){const a=StudioLibrary.findAsset(key);if(a?.state!=='active')throw Error('交付已回收，请先恢复。');await ExportCenter.exportTool({...copy(a.raw),libraryAssetKey:a.key});}
   else if(action==='revise'){const split=key.lastIndexOf('|');await CommunityStudio.previewRevision(key.slice(0,split),key.slice(split+1));}
   else if(action==='history'){const split=key.lastIndexOf('|');CommunityStudio.revisionHistory(key.slice(0,split),key.slice(split+1));}
   else if(action==='publish-project'){S.close();S.route('/app/community');await CommunityStudio.refresh();CommunityStudio.publish(key);}
   else if(action==='export-project'){const p=StudioLibrary.findProject(key);if(!p||p.state!=='active')throw Error('请先恢复来源项目。');ExportCenter.choose(p.kind,p.kind==='video'?undefined:p.raw);if(p.kind==='video'){const select=document.querySelector('[data-ec-field="project"]');if(select){select.value=p.key;select.dispatchEvent(new Event('change',{bubbles:true}));}}}
   else if(action==='save-video-demo')saveVideoDemo();
   else if(action==='preview-video')previewVideo(key);
  }catch(error){const target=document.getElementById('closure-error');if(target)target.textContent=error.message;else S.toast(error.message);}finally{if(node.isConnected)node.disabled=false;}
 });
 window.CreationClosure={videoDeliveries,planningDialog,saveVideoDemo};
})();
