/* 全站任务记录与成果查找；不会接管原工作台的候选或采用版本。 */
(()=>{
 'use strict';
 const C=Cimora,S=Site,M=GenerationTasksModel,E=S.esc,KEY='cimora-generation-tasks-v1';
 const q=encodeURIComponent,expanded=new Set(),executors={};
 let warning='',searchTimer;
 function read(){const raw=localStorage.getItem(KEY);if(!raw)return M.initial();const v=JSON.parse(raw);if(v.version!==1||!Array.isArray(v.records)||!Array.isArray(v.hidden))throw Error('任务记录无法读取，原记录已保留');return v;}
 function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
 function change(fn){const v=read();fn(v);write(v);}
 function record(row){try{change(v=>{const at=v.records.findIndex(x=>x.id===row.id);if(at<0)v.records.push(row);else v.records[at]=row;});}catch(error){S.toast('任务记录未保存：'+error.message);}}
 function link(row){return row.url||'/app';}
 function plain(value){if(typeof value==='string')return value;return value?JSON.stringify(value,null,2):'';}
 function toolName(id){return ToolCatalog.find(id)?.title||id;}
 function collect(){
  const rows=[],library=StudioLibrary.load();
  const add=(base,row)=>rows.push({...base,...row});
  for(const p of library.projects){
   const base={source:p.kind,projectKey:p.key,projectTitle:p.title,url:p.url};
   if(p.kind==='story')for(const [eid,script]of Object.entries(p.raw.scripts||{})){
    if(!script.bodyDemo&&!script.demo)continue;
    const episode=p.raw.outline.find(x=>x.id===eid);if(!episode)continue;
    add(base,{id:'story:'+p.id+':'+eid,originKey:'story:'+p.id+':'+eid,title:'正文整理 · '+episode.title,episodeId:eid,location:episode.title,state:'done',at:script.updatedAt||script.createdAt||p.raw.createdAt,input:episode.events,result:{kind:'story',episodeId:eid},resultNote:'依据集纲整理的本地文本演示，可回正文继续修改。'});
   }
   if(p.kind==='comic'){
    for(const [pageId,work]of Object.entries(p.raw.wholePageStudio?.works||{}))for(const r of work.requests||[]){
     const ep=Object.entries(p.raw.bodyPagination?.episodes||{}).find(([,v])=>v.pages?.some(x=>x.id===pageId));
     const page=ep?.[1].pages.findIndex(x=>x.id===pageId),eid=ep?.[0]||r.episodeId;
     const episode=(p.raw.storyPlan?.episodes||p.raw.source?.outline||[]).find(x=>x.id===eid);
     add(base,{id:'comic-request:'+r.id,originKey:'comic-request:'+r.id,batchId:r.batchId,batchTitle:'整集漫画请求',title:r.kind==='edit'?'整页修改请求':'整页生成请求',location:(episode?.title||'当前集')+' / 第'+(page>=0?page+1:'?')+'页',episodeId:eid,pageId,state:r.state==='已取消'?'cancelled':'recorded',at:r.createdAt,input:r.prompt,resultNote:'仅保存了生成要求，尚未调用生图模型。原有整页候选与采用版本保留。',cancelRef:r.state==='演示请求已记录'?{projectId:p.id,pageId,requestId:r.id}:null});
    }
    for(const a of p.raw.assets||[])for(const r of a.visualTasks||[])add(base,{id:'comic-visual:'+r.id,title:'视觉资产 · '+a.name,state:'recorded',at:r.createdAt,input:r.description,location:'视觉资产',assetId:a.id,resultNote:'已记录视觉资产要求，待接入模型。'});
   }
   if(p.kind==='video')for(const entry of p.entries||[]){
    const url='/app/video?project='+q(p.id)+'&episode='+q(entry.hostId),episodes=entry.workspace.episodes||[];
    for(const asset of entry.workspace.assets||[])for(const task of asset.visualTasks||[])add(base,{id:'video-visual:'+task.id,title:'视觉资产 · '+asset.name,state:'recorded',at:task.at||task.createdAt,input:plain(task.description),location:'视觉资产',hostId:entry.hostId,assetId:asset.id,url:url+'&stage=2',resultNote:'已记录视觉资产生成要求，尚未调用生图模型。'});
    for(const shot of entry.shots||[])for(const v of shot.candidates||[]){
     if(v.mode!=='layout-placeholder')continue;
     add(base,{id:'video:'+v.id,originKey:'video:'+v.id,title:shot.title+' · 分镜参考',hostId:entry.hostId,episodeId:shot.episodeId,shotId:shot.id,location:(episodes.find(x=>x.id===shot.episodeId)?.title||'当前集')+' / '+shot.title,state:'done',at:v.createdAt,input:M.describeInput(v.input),url:url+'&stage=3',result:{kind:'image',image:v.image},resultNote:v.origin||'静态参考演示，非生成视频。'});
    }
    for(const [eid,ep]of Object.entries(entry.workspace.finishing?.episodes||{})){
     const loc=episodes.find(x=>x.id===eid)?.title||'整集制作',finish={hostId:entry.hostId,episodeId:eid,url:url+'&stage=4',location:loc};
     for(const v of ep.versions||[])add({...base,...finish},{id:'video:'+v.id,originKey:'video:'+v.id,title:loc+' · 拼接方案',state:'done',at:v.createdAt,input:'将已采用镜头、对白与背景音组合为整集。',result:{kind:'plan',text:plain({时长:v.duration,镜头数:v.clips?.length,说明:v.label})},resultNote:v.label||'拼接方案演示，未输出视频或混音。'});
     const audio=ep.audioLibrary||{};
     for(const v of [...Object.values(audio.voices||{}).flat(),...(audio.music||[])]){
      if(v.toolVersionId||v.preview==='upload')continue;
      add({...base,...finish},{id:'video:'+v.id,originKey:'video:'+v.id,title:v.kind==='music'?'背景音乐候选':'对白声音候选',state:'done',at:v.createdAt,input:v.prompt||v.input?.text||'',result:{kind:'plan',text:v.input?.text||v.prompt||''},resultNote:v.preview==='browser-speech'?'系统语音试听演示，可返回整集制作试听。':'本地音乐合成示例，可返回整集制作试听。'});
     }
    }
   }
  }
  for(const a of library.assets.filter(x=>x.tool&&x.key.startsWith('tool:'))){
   const r=a.raw;
   rows.push({id:'tool-saved:'+r.id,originKey:'tool-saved:'+r.id,source:'tools',title:r.title||toolName(r.toolId),projectKey:'',projectTitle:'',location:toolName(r.toolId)+' · 已保存成果',state:'done',at:r.savedAt,input:r.prompt||r.report||'',url:'/app/tools/'+r.toolId,result:{kind:'tool',id:r.id},resultNote:r.notice||'已保存的本机工具演示成果。保存时间不等于生成耗时。'});
  }
  return rows;
 }
 function all(){warning='';try{return M.merge(collect(),read());}catch(error){warning=error.message;return [];}}
 function button(text,action,id='',cls='ghost'){return `<button type="button" class="cm-button ${cls}" data-gt="${action}" data-id="${E(id)}">${text}</button>`;}
 function badge(row){return `<span class="gt-status ${E(row.state)}">${E(M.labels[row.state]||row.state)}</span>`;}
 function stamp(at){const d=new Date(at);return Number.isNaN(d.valueOf())?'时间未记录':d.toLocaleString('zh-CN',{hour12:false});}
 function origin(row){return E(row.projectTitle||'未关联项目')+' <span>· '+E(M.sources[row.source]||'生成任务')+'</span>';}
 function url(filters,item){const p=new URLSearchParams();for(const [k,v]of Object.entries(filters))if(v&&v!=='all')p.set(k,v);if(item)p.set('item',item);return '/app/tasks'+(p.size?'?'+p:'');}
 function filters(ctx=S.context){return Object.fromEntries(['status','source','project','search'].map(k=>[k,ctx.params.get(k)||'all']));}
 function currentFilters(){const f=filters();if(f.search==='all')f.search='';return f;}
 function actions(row){return (M.canRetry(row)?button('重试本项','retry',row.id):'')+(M.canCancel(row)||row.cancelRef?button('取消未执行项','cancel',row.id):'');}
 function card(row,child=false){return `<article class="gt-row ${child?'gt-child':''}" data-task-id="${E(row.id)}"><div><div class="gt-row-head"><a href="#${E(url(currentFilters(),row.id))}"><strong>${E(row.title)}</strong></a>${badge(row)}${row.demo?'<small class="gt-demo">操作示例</small>':''}</div><p>${origin(row)}${row.location?' · '+E(row.location):''}</p><small>${E(stamp(row.at))}${row.state==='failed'?' · '+E(row.error||'请回原位置核对输入后重新提交'):''}</small></div><div class="gt-actions">${actions(row)}${button('查看详情','detail',row.id)}</div></article>`;}
 function groupCard(g){const open=expanded.has(g.id);return `<section class="gt-batch"><header><div><div class="gt-row-head"><strong>${E(g.title)}</strong>${badge(g)}${g.demo?'<small class="gt-demo">操作示例</small>':''}</div><p>${origin(g)} · 共${g.children.length}项 · 成功 ${g.children.filter(x=>x.state==='done').length} · 失败 ${g.children.filter(x=>x.state==='failed').length} · 已取消 ${g.children.filter(x=>x.state==='cancelled').length}</p><div class="gt-progress"><i style="width:${g.progress}%"></i></div><small>已结束 ${g.progress}%（包含失败与取消）</small></div>${button(open?'收起明细':'展开明细','expand',g.id)}</header>${open?g.children.map(x=>card(x,true)).join(''):''}</section>`;}
 function details(row,f){return `<div class="gt-detail">${C.link('← 返回任务列表',url(f),'cm-button ghost')}<header><div><h1>${E(row.title)}</h1><p>${origin(row)}${row.location?' · '+E(row.location):''}</p></div>${badge(row)}</header>${row.demo?'<p class="gt-notice">这是独立的任务操作示例，不调用模型，不会添加到项目或资产库。</p>':''}<section><h2>提交内容</h2><pre>${E(row.input||'旧记录未保存提交内容，请回原工作台查看。')}</pre><p>记录时间：${E(stamp(row.at))}${row.attempt?' · 第'+row.attempt+'次尝试':''}</p></section>${row.error?'<p class="gt-error" role="alert">'+E(row.error)+'</p>':''}<section><h2>结果与下一步</h2><p>${E(row.resultNote||'请回原工作台查看当前内容。')}</p>${row.result?.kind==='image'&&safeImage(row.result.image)?'<img class="gt-result-image" src="'+E(safeImage(row.result.image))+'" alt="任务结果参考图">':''}${['plan','demo'].includes(row.result?.kind)?'<pre>'+E(row.result.text)+'</pre>':''}${row.result?.kind==='story'?'<pre>'+E(storyText(row))+'</pre>':''}<div class="gt-actions">${row.result?.kind==='tool'?button('预览保存成果','preview',row.id,'primary'):''}${!row.demo?button('返回原工作台','open',row.id,'primary'):''}${actions(row)}</div>${row.state==='failed'&&!row.demo?'<p>回原工作台核对输入后重新提交，已有成功结果继续保留。</p>':''}</section>${(M.ended.has(row.state)||row.state==='recorded')?'<footer><p>清理只隐藏本条记录，作品、候选与已保存资产保留。</p>'+button('清理本条记录','hide',row.id)+'</footer>':''}</div>`;}
 function safeImage(value){return typeof value==='string'&&(/^(?:data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(value)||(!/^[a-z]+:/i.test(value)&&!value.startsWith('//')))?value:'';}
 function storyText(row){const p=StudioLibrary.findProject(row.projectKey)?.raw;return p?ScriptStudio.bodyText(p,row.episodeId):'原故事已不存在，任务记录保留。';}
 function render(ctx){
  const f=filters(ctx);if(f.search==='all')f.search='';const rows=all(),item=ctx.params.get('item');
  if(item){const row=rows.find(x=>x.id===item);return `<div class="gt-page">${row?details(row,f):'<h1>记录已清理或来源已不存在</h1>'+C.link('返回任务列表',url(f),'cm-button primary')}</div>`;}
  const filtered=M.filter(rows,f),projects=[...new Map(rows.filter(x=>x.projectKey).map(x=>[x.projectKey,x.projectTitle])).entries()];
  const tabs=[['all','全部'],['active','进行中'],['done','已完成'],['failed','失败'],['cancelled','已取消'],['recorded','未执行']];
  return `<div class="gt-page"><header class="gt-heading"><div><span class="cm-kicker">CREATION HISTORY</span><h1>生成任务</h1><p>在这里查看进度和结果，回到原工作台继续创作。</p></div><div class="gt-actions">${button('载入任务示例','examples')}${button('清理已结束记录','clear')}</div></header>${warning?'<p class="gt-error" role="alert">'+E(warning)+'。未覆盖原记录。</p>':''}<nav class="gt-tabs" aria-label="任务状态">${tabs.map(([id,label])=>`<a class="${f.status===id?'selected':''}" href="#${E(url({...f,status:id}))}">${label}<small>${M.filter(rows,{status:id}).length}</small></a>`).join('')}</nav><div class="gt-filters"><label>来源<select data-gt-filter="source"><option value="all">全部来源</option>${Object.entries(M.sources).map(([id,name])=>'<option value="'+id+'" '+(f.source===id?'selected':'')+'>'+name+'</option>').join('')}</select></label><label>项目<select data-gt-filter="project"><option value="all">全部项目与独立创作</option><option value="independent" ${f.project==='independent'?'selected':''}>未关联项目</option>${projects.map(([id,name])=>'<option value="'+E(id)+'" '+(f.project===id?'selected':'')+'>'+E(name)+'</option>').join('')}</select></label><label class="gt-search">搜索<input data-gt-search placeholder="任务、作品或工具名称" value="${E(f.search)}"></label></div><p class="gt-count">${filtered.length} 条记录 <span>· 任务记录与资产分开管理</span></p><div class="gt-list">${M.groups(filtered).map(x=>x.children?groupCard(x):card(x)).join('')||'<section class="gt-empty"><span>◷</span><h2>这里还没有'+(f.status!=='all'?'符合筛选的':'生成')+'任务</h2><p>从故事、漫画、视频或创作工具提交内容后，记录会汇总到这里。</p><div class="gt-actions">'+C.link('去创作空间','/app','cm-button primary')+button('体验任务示例','examples')+'</div></section>'}</div><p class="gt-footnote">本机演示：静态参考、文本整理和声音试听会标明产物类型；仅记录的请求不会显示为已生成。</p></div>`;
 }
 function open(row){
  StudioLibrary.guard();
  if(row.source==='story'||row.source==='comic'){
   const key=row.source==='story'?StudioLibrary.STORY:StudioLibrary.COMIC,db=JSON.parse(localStorage.getItem(key)||'{}'),p=db.projects?.find(x=>row.projectKey===row.source+':'+x.id);
   if(!p)throw Error('原项目已不存在，任务记录仍保留');db.active=p.id;
   if(row.source==='story'){p.stage=5;p.selectedEpisode=row.episodeId||p.selectedEpisode;p.bodySelectedId=row.episodeId||p.bodySelectedId;if(row.episodeId&&p.outline.some(x=>x.id===row.episodeId))ScriptStudio.openBody(p,row.episodeId);}
   else{p.stage=row.assetId?1:3;p.activeEpisodeId=row.episodeId||p.activeEpisodeId;if(row.pageId){p.wholePageStudio.selected||={};p.wholePageStudio.selected[row.episodeId]=row.pageId;}}
   StudioLibrary.store(key,db);
  }
  if(row.source==='video'){
   const p=S.state.projects.find(x=>row.projectKey==='video:'+x.id),e=p&&C.M.db.projects[p.id]?.[row.hostId];
   if(!e?.videoFlow?.workspace)throw Error('原视频工程已不存在');
   if(row.episodeId)e.videoFlow.workspace.selectedEpisodeId=row.episodeId;
   if(row.shotId)e.videoFlow.selectedShotId=row.shotId;
   C.M.save();
  }
  S.route(link(row));
 }
 function cancelRecorded(row){const db=JSON.parse(localStorage.getItem(StudioLibrary.COMIC)||'{}'),ref=row.cancelRef,p=db.projects?.find(x=>x.id===ref.projectId),r=p?.wholePageStudio?.works[ref.pageId]?.requests.find(x=>x.id===ref.requestId);if(!r||r.state!=='演示请求已记录')throw Error('请求状态已变化，请刷新');r.state='已取消';StudioLibrary.store(StudioLibrary.COMIC,db);}
 function run(meta,fn){
  const row={id:S.id('generation'),at:new Date().toISOString(),state:'running',...meta};
  record(row);
  const success=value=>{row.state=meta.recorded?'recorded':'done';row.resultNote=meta.resultNote||'本机流程演示，结果保存在原工作台。';if(value?.id)row.originKey=meta.source+':'+value.id;record(row);return value;};
  const fail=error=>{row.state='failed';row.error=error.message;delete row.originKey;record(row);throw error;};
  try{const value=fn();if(value?.then)return value.then(success,fail);return success(value);}catch(error){return fail(error);}
 }
 function wrap(object,key,meta){if(!object?.[key])return;const original=object[key];executors[key]=(...args)=>original.apply(object,args);object[key]=function(...args){return run(meta(...args),()=>original.apply(this,args));};}
 const board=C.M.videoStoryboard,finish=C.M.videoFinishing;
 function captured(ctx,id,method){if(method==='generate')return board.input(ctx,ctx.e.productionShots.find(x=>x.id===id));if(method==='generateVoice')return finish.sound(ctx,id);if(method==='generateMusic')return finish.state(ctx).musicDraft||{};return finish.signature(ctx);}
 function videoMeta(ctx,shotId,title,stage=3,method){const w=ctx.e.videoFlow.workspace;let input;try{input=captured(ctx,shotId,method);}catch{input={missing:true};}return {source:'video',title,projectKey:'video:'+ctx.p.id,projectTitle:ctx.p.name,hostId:ctx.c.id,episodeId:w.selectedEpisodeId,shotId:typeof shotId==='string'?shotId:undefined,input:M.describeInput(input),retrySpec:method?{method,signature:M.fingerprint(input)}:undefined,url:'/app/video?project='+q(ctx.p.id)+'&episode='+q(ctx.c.id)+'&stage='+stage};}
 wrap(board,'generate',(ctx,id)=>videoMeta(ctx,id,'分镜参考生成',3,'generate'));
 wrap(finish,'generateVoice',(ctx,id)=>videoMeta(ctx,id,'对白声音生成',4,'generateVoice'));
 wrap(finish,'generateMusic',ctx=>videoMeta(ctx,null,'背景音乐生成',4,'generateMusic'));
 wrap(finish,'assemble',ctx=>videoMeta(ctx,null,'整集拼接方案',4,'assemble'));
 const batchOriginal=board.runBatch;
 board.runBatch=function(ctx,plan){
  const batchId=S.id('video-batch'),at=new Date().toISOString();
  try{
   const result=batchOriginal.call(this,ctx,plan);
   for(const item of plan.rows){const shot=ctx.e.productionShots.find(x=>x.id===item.id),skipped=result.skipped.includes(item.id),candidate=skipped?null:shot?.candidates[0];
    record({...videoMeta(ctx,item.id,(shot?.title||'镜头')+' · 分镜参考',3,'generate'),id:S.id('generation'),originKey:candidate?'video:'+candidate.id:undefined,batchId,batchTitle:'批量分镜参考',at,state:skipped?'failed':'done',error:skipped?'缺少可用参考图或首帧，本镜尚未执行；其他镜头结果保留。':'',resultNote:'静态参考演示，未生成视频。'});
   }
   return result;
  }catch(error){record({...videoMeta(ctx,null,'批量分镜未开始'),id:S.id('generation'),at,state:'failed',error:error.message});throw error;}
 };
 function retryReal(row){
  const p=S.state.projects.find(x=>row.projectKey==='video:'+x.id),c=p&&[...(p.chapters||[]),...(p.episodes||[])].find(x=>x.id===row.hostId),e=p&&C.M.db.projects[p.id]?.[row.hostId];
  if(!p||!c||!e?.videoFlow?.workspace)throw Error('原工作台已不存在，无法重试');
  const ctx={p,c,e},w=e.videoFlow.workspace,previous=w.selectedEpisodeId;
  if(!w.episodes.some(x=>x.id===row.episodeId))throw Error('原集已移除，请回原工作台');
  w.selectedEpisodeId=row.episodeId;
  try{
   const spec=row.retrySpec;
   if(!executors[spec.method]||M.fingerprint(captured(ctx,row.shotId,spec.method))!==spec.signature)throw Error('输入或关联资产已经变化，请返回原工作台核对后重新提交。');
   row.state='running';row.attempt=(row.attempt||1)+1;row.error='';record(row);
   try{const value=executors[spec.method](ctx,row.shotId);row.state='done';if(value?.id)row.originKey='video:'+value.id;row.resultNote='本机演示结果已更新，请回原工作台预览。';record(row);}catch(error){row.state='failed';row.error=error.message;record(row);throw error;}
  }finally{w.selectedEpisodeId=previous;C.M.save();}
 }
 // 工具存储按原 API 写入，任务记录不复制大图，也不改变成果保存行为。
 const store=ToolStudio.store;
 if(store){const save=store.save;store.save=function(id,snapshot){const result=save.call(this,id,snapshot);record({id:'tool-saved:'+result.id,originKey:'tool-saved:'+result.id,source:'tools',title:result.title||toolName(id),state:'done',at:result.savedAt,url:'/app/tools/'+id,result:{kind:'tool',id:result.id},input:result.prompt||'',resultNote:result.notice||'已保存本机成果。'});return result;};
  const update=store.update;store.update=function(id,patch){const previous=store.draft(id),result=update.call(this,id,patch);if(patch.generatedAt&&patch.generatedAt!==previous.generatedAt)record({id:'tool-preview:'+id+':'+patch.generatedAt,source:'tools',title:toolName(id)+' · 预览更新',state:'done',at:patch.generatedAt,input:result.generatedPrompt||result.prompt||'',url:'/app/tools/'+id,resultNote:'本机工具预览已更新；具体处理范围请查看原工具。尚未保存的预览会随草稿更新，请保存需要保留的成果。'});return result;};
 }
 const route=C.route;C.route=ctx=>ctx.parts[0]==='app'&&ctx.parts[1]==='tasks'?render(ctx):route(ctx);
 document.addEventListener('change',event=>{const k=event.target.dataset.gtFilter;if(k)S.route(url({...currentFilters(),[k]:event.target.value}));});
 document.addEventListener('input',event=>{if(!event.target.matches('[data-gt-search]'))return;const value=event.target.value,position=event.target.selectionStart;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if(!document.querySelector('.gt-page'))return;S.route(url({...currentFilters(),search:value}));setTimeout(()=>{const input=document.querySelector('[data-gt-search]');input?.focus();input?.setSelectionRange(position,position);},30);},220);});
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-gt]');if(!b)return;const action=b.dataset.gt,id=b.dataset.id;
  try{
   if(action==='examples'){change(v=>{const old=new Set(v.records.filter(x=>x.demo).map(x=>x.id));v.records=v.records.filter(x=>!x.demo);v.hidden=v.hidden.filter(id=>!old.has(id));v.records.push(...M.example(S.id('example-batch'),new Date().toISOString()));});const batch=read().records.find(x=>x.demo)?.batchId;if(batch)expanded.add(batch);S.route('/app/tasks');return;}
   if(action==='expand'){if(expanded.has(id))expanded.delete(id);else expanded.add(id);S.render();return;}
   if(action==='clear'){S.modal('清理已结束记录','<p>清理已完成、失败、取消的任务记录。进行中和未执行的请求保留；作品、候选及已保存资产保留。</p>',button('确认清理记录','confirm-clear','','primary'));return;}
   if(action==='confirm-clear'){const ids=all().filter(x=>M.ended.has(x.state)).map(x=>x.originKey||x.id);change(v=>{v.hidden=[...new Set([...v.hidden,...ids])];});S.close();S.render();return;}
   const row=all().find(x=>x.id===id);if(!row)throw Error('记录已变化，请刷新');
   if(action==='detail')S.route(url(currentFilters(),id));
   if(action==='open')open(row);
   if(action==='preview')ToolStudio.openSaved(row.result.id);
   if(action==='hide'){change(v=>M.hide(v,row.originKey||row.id));S.route(url(currentFilters()));}
   if(action==='cancel'){if(row.cancelRef)cancelRecorded(row);else change(v=>M.transition(v.records.find(x=>x.id===id),'cancel'));S.render();}
   if(action==='retry'&&!row.demo){retryReal(row);S.render();return;}
   if(action==='retry'){
    change(v=>M.transition(v.records.find(x=>x.id===id),'retry'));S.render();
    setTimeout(()=>{try{change(v=>{const r=v.records.find(x=>x.id===id);if(r?.state==='queued')r.state='running';});if(S.context.parts[1]==='tasks')S.render();}catch(error){S.toast(error.message);}},450);
    setTimeout(()=>{try{change(v=>{const r=v.records.find(x=>x.id===id);if(r?.state==='running'){r.state='done';r.result={kind:'demo',text:'重试成功占位：本页内容已准备好。未调用生图模型。'};}});if(S.context.parts[1]==='tasks')S.render();}catch(error){S.toast(error.message);}},1400);
   }
  }catch(error){S.toast(error.message);}
 });
 // 示例刷新后可恢复的任务停在等待中，不会伪装在后台调用模型。
 try{change(v=>{for(const row of v.records)if(row.demo&&row.state==='running')row.state='queued';});}catch{}
 window.GenerationTasks={all,run,record,KEY};
})();
