/* Reference task-list styling over the original dependency engine and actions. */
(()=>{
  'use strict';
  const C=Cimora,S=Site,M=C.M,E=S.esc,B=C.btn;
  let status='all',query='',provider='all',scope='',taskStatus='active',taskQuery='',taskLimit=60;
  const tabs=[['all','全部'],['active','进行中'],['done','已完成'],['failed','失败'],['pending','待执行'],['stale','来源更新']];
  const labels={idle:'待执行',queued:'等待依赖',running:'运行中',done:'已完成',failed:'失败',stale:'来源更新',cancelled:'已取消'};
  const matches=(node,key)=>key==='all'||(key==='active'?['queued','running'].includes(node.status):key==='pending'?['idle','cancelled'].includes(node.status):node.status===key);
  const statusBadge=(value,label)=>`<span class="ct-status ${E(value)}">${E(label||labels[value]||value)}</span>`;
  const action=(text,key)=>`<button class="cm-button ghost" type="button" data-ct="${key}">${text}</button>`;
  const taskItems=()=>{
    const index=window.StudioLibrary?.load(),W=window.StudioWorkspaceModel;
    const native=S.state.projects.filter(p=>!p.deletedAt&&!p.archived&&!p.workspaceSourceKey).flatMap(p=>[...p.chapters,...(p.episodes||[])].map(ch=>({p,ch,e:M.ensure(p,ch)}))).flatMap(c=>(c.e.graph?.nodes||[]).map(n=>({...c,n})));
    if(!W||!index)return native;
    for(const item of native){const project=index.projects.find(p=>p.id===item.p.id&&p.legacySource);if(project)item.workspaceProject=project;}
    return [...native,...index.projects.filter(p=>!p.legacySource&&p.state==='active').flatMap(W.tasks)];
  };
  function taskTarget(t){
    if(t.url)return t.url;
    const N=M.navigation,n=t.n,c={p:t.p,c:t.ch||t.c,e:t.e};if(!N)return C.path(c,c.e.stage,'flow');
    if(N.imported(c)){
      const key=['story','cast','world','prop'].includes(n.id)?'text':['review','export'].includes(n.id)?'review':'pages';
      return N.url(c,'boards','flow','&import='+key);
    }
    let stage;
    if(N.episode(c))stage=['story','cast','world','prop'].includes(n.id)?'story':['boards','sketch','shots'].includes(n.id)?'boards':n.id==='voice'?'audio':['review','export'].includes(n.id)?'review':'motion';
    else stage=n.id==='story'?'story':['cast','world','prop'].includes(n.id)?'assets':['boards','sketch'].includes(n.id)?'boards':['final','layout'].includes(n.id)?'comic':['review','export'].includes(n.id)?'review':c.e.navigation?.stage||c.e.stage;
    return t.workspaceProject?StudioWorkspaceModel.url(t.workspaceProject,{stage,chapterId:t.ch.id}):N.url(c,stage,'flow');
  }
  const actionable=t=>['idle','cancelled','failed','stale'].includes(t.n.status);
  function taskRow(t){
    const pct=t.n.status==='done'?100:t.n.status==='running'?Math.max(0,Math.min(100,t.n.progress||0)):0;
    const run=t.e?.run,runStatus=run&&run.ids?.includes(t.n.id)?run.status:'';
    return `<article class="ct-task-row">
      <div class="ct-task-main"><div class="ct-task-title"><h2>${E(t.n.title)}</h2>${statusBadge(t.n.status)}${runStatus&&runStatus!=='running'?statusBadge(runStatus,{paused:'批次已暂停',failed:'批次失败',done:'批次完成',blocked:'等待依赖',cancelled:'批次已停止'}[runStatus]):''}</div>
      <p>${E(t.p.name)} <span>· ${E(t.ch.title)} · ${E(t.n.provider)}</span></p>
      <div class="ct-progress" role="progressbar" aria-label="${E(t.n.title)} 进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
      <small>${t.n.status==='running'?`正在执行 · ${pct}%`:t.n.status==='queued'?'等待依赖就绪':t.n.status==='done'?`完成 · 候选 v${t.n.version}`:t.n.status==='failed'?'执行失败 · 可返回创作步骤后重试':labels[t.n.status]||t.n.status}</small></div>
      <div class="ct-task-actions"><button class="cm-button ghost small" type="button" data-ct-open="1" data-task-key="${E(t.key||'')}" data-project="${E(t.p.id)}" data-chapter="${E(t.ch.id)}" data-node="${E(t.n.id)}">查看详情</button>${actionable(t)?C.link('前往任务',taskTarget(t),'cm-button primary small'):''}</div></article>`;
  }
  function tasks(){
    const all=taskItems(),rows=all.filter(t=>matches(t.n,taskStatus)&&(!taskQuery||[t.n.title,t.p.name,t.ch.title,t.n.provider].join(' ').toLowerCase().includes(taskQuery.toLowerCase())));
    const order={running:0,queued:1,failed:2,idle:3,stale:4,done:5,cancelled:6};rows.sort((a,b)=>(order[a.n.status]??9)-(order[b.n.status]??9));
    const counts=Object.fromEntries(tabs.map(([key])=>[key,all.filter(t=>matches(t.n,key)).length]));
    const activeCount=all.filter(t=>matches(t.n,'active')).length,failedCount=all.filter(t=>t.n.status==='failed').length;
    return `<div class="ct-page ct-global"><header class="ct-heading"><div><h1 class="cm-workspace-title">任务中心</h1></div></header>
      <section class="ct-overview"><article><span>进行中与排队</span><strong>${activeCount}</strong><small>个任务</small></article><article><span>失败待处理</span><strong>${failedCount}</strong><small>个任务</small></article><article><span>当前筛选</span><strong>${rows.length}</strong><small>个任务</small></article></section>
      <nav class="ct-tabs cm-segment-group" aria-label="任务状态筛选">${tabs.map(([key,label])=>`<button type="button" data-ct-status="${key}" aria-pressed="${taskStatus===key}" class="${taskStatus===key?'selected':''}">${label}<small>${counts[key]||0}</small></button>`).join('')}</nav>
      <div class="ct-global-filters">${CimoraSearchField.render(`<input data-ct-task-search aria-label="Search projects, chapters or production steps" placeholder="输入名称或能力" value="${E(taskQuery)}">`, "ct-search")}</div>
      <div class="ct-task-list">${rows.slice(0,taskLimit).map(taskRow).join('')||`<section class="ct-empty"><div class="ct-empty-icon">✓</div><h2>${taskStatus==='active'?'现在没有运行中的任务':'没有符合条件的任务'}</h2><p>${taskStatus==='active'?'新的制作任务开始后，进度会自动出现在这里。':'尝试切换状态筛选或修改搜索词。'}</p>${taskStatus!=='active'?`<button class="cm-button ghost" type="button" data-ct="reset">清除搜索</button>`:''}</section>`}</div>${rows.length>taskLimit?`<button class="cm-button ghost" type="button" data-ct-more>加载更多（已显示 ${taskLimit} / ${rows.length}）</button>`:''}
      </div>`;
  }
  function taskDetail(t){
    const n=t.n;
    const footer=C.link(actionable(t)?'前往任务':'查看项目',taskTarget(t),'cm-button primary');
    S.modal('任务详情',`<div class="ct-detail-project"><strong>${E(t.p.name)}</strong><span>${E(t.ch.title)}</span></div><h3 class="ct-detail-title">${E(n.title)}</h3><dl class="ct-detail-summary"><div><dt>当前任务状态</dt><dd>${statusBadge(n.status,labels[n.status]||n.status)}</dd></div><div><dt>${n.status==='done'?'积分消耗':'预估积分消耗'}</dt><dd>0 积分 <small>本机模拟，不消耗积分</small></dd></div><div><dt>使用模型</dt><dd>${E(n.provider)}</dd></div></dl>`,footer);
  }
  function nodeRow(c,n){
    const deps=c.e.graph.edges.filter(edge=>edge.to===n.id).map(edge=>c.e.graph.nodes.find(x=>x.id===edge.from)?.title).filter(Boolean);
    return `<article class="ct-row"><div class="ct-row-copy"><div class="ct-row-head"><h2>${E(n.title)}</h2>${statusBadge(n.status)}${n.status==='done'&&n.version>n.adopted?'<span class="ct-candidate">候选待采用</span>':''}</div><p>${E(n.provider)} <span>· 示例费用 ${C.money(n.cost)} · 候选 v${n.version} / 已采用 v${n.adopted}</span></p><small>${deps.length?'依赖：'+deps.map(E).join('、'):'起始步骤，无上游依赖'}</small></div><div class="ct-actions">${n.status==='failed'?B('重试本项','run-node','cm-button ghost',`data-node="${E(n.id)}"`):''}${B('查看详情','node-detail','cm-button ghost',`data-node="${E(n.id)}" aria-label="查看 ${E(n.title)} 详情"`)}</div></article>`;
  }
  function runs(c){
    if(!c)return tasks();
    const e=c.e,r=e.run,key=c.p.id+':'+c.c.id;if(scope!==key){scope=key;status='all';query='';provider='all';}
    const nodes=e.graph.nodes,providers=[...new Set(nodes.map(n=>n.provider))];
    const rows=nodes.filter(n=>matches(n,status)&&(provider==='all'||n.provider===provider)&&(!query||[n.title,n.provider].join(' ').toLowerCase().includes(query.toLowerCase())));
    return `<div class="ct-page"><header class="ct-heading"><div><h1>工程编排</h1><p>在当前章节安排制作步骤、依赖和预算，运行后进度会汇总到任务中心。</p></div><div class="ct-actions">${C.link('返回创作',C.path(c,e.stage),'cm-button ghost')}${B('运行制作','run-plan','cm-button primary',r&&['running','paused'].includes(r.status)?'disabled':'')}</div></header>
      <nav class="ct-tabs cm-segment-group" aria-label="任务状态">${tabs.map(([key,label])=>`<button type="button" data-ct-status="${key}" aria-pressed="${status===key}" class="${status===key?'selected':''}">${label}<small>${nodes.filter(n=>matches(n,key)).length}</small></button>`).join('')}</nav>
      <div class="ct-filters">${C.scopePicker(c,'cm-runs')}<label>供应能力<select data-ct-filter="provider"><option value="all">全部能力</option>${providers.map(p=>`<option value="${E(p)}" ${provider===p?'selected':''}>${E(p)}</option>`).join('')}</select></label>${CimoraSearchField.render(`<input data-ct-search aria-label="Search production steps" placeholder="搜索制作步骤或供应能力" value="${E(query)}">`, "ct-search")}</div>
      <div class="ct-summary"><p>${rows.length} 个步骤 <span>· 当前章节 ${nodes.length} 步 · 已完成 ${nodes.filter(n=>n.status==='done').length} 步</span></p><div class="ct-actions">${r?statusBadge(r.status,{running:'批次进行中',paused:'批次已暂停',failed:'等待失败恢复',done:'批次完成',blocked:'等待输入',cancelled:'批次已取消'}[r.status]):'<span class="ct-muted">尚未开始批次</span>'}${r?.status==='running'?B('暂停队列','pause-run','cm-button ghost small'):r?.status==='paused'?B('继续队列','resume-run','cm-button primary small'):''}${r&&['failed','blocked'].includes(r.status)?B('重试未完成步骤','retry-run','cm-button primary small'):''}${r&&['running','paused'].includes(r.status)?B('停止后续任务','cancel-run','cm-button ghost small'):''}</div></div>
      <div class="ct-list">${rows.map(n=>nodeRow(c,n)).join('')||`<section class="ct-empty"><h2>没有符合条件的步骤</h2><p>调整状态、供应能力或搜索词，查看其他制作步骤。</p>${action('清除筛选','reset')}</section>`}</div>
      <section class="ct-policy"><header><div><h2>编排设置</h2><p>上游失败时暂停依赖步骤，成功结果不重复生成。</p></div><div class="ct-budget"><span>本章已用 / 预算</span><strong>${C.money(e.spent)} <small>/ ${C.money(e.budget)}</small></strong>${B('调整预算','budget','cm-text-link')}</div></header><div class="ct-policy-fields"><label class="cm-label">最大并发<select data-cm-change="concurrency">${[1,2,3].map(v=>`<option ${e.concurrency===v?'selected':''}>${v}</option>`).join('')}</select></label><div><label class="cm-check"><input type="checkbox" data-cm-change="fail-demo" ${e.failDemo?'checked':''}>体验视频 API 超时与恢复</label><p>首次动态镜头任务模拟失败；重试可恢复。费用均为示例，无真实 API 调用。</p></div></div></section>
      <section class="ct-events"><h2>工程事件</h2>${e.events.length?`<ol>${e.events.slice(0,10).map(ev=>`<li><div><strong>${E(ev.text)}</strong><p>${E(ev.detail)}</p></div><time>${new Date(ev.time).toLocaleString('zh-CN',{hour12:false})}</time></li>`).join('')}</ol>`:'<p>创建、修改、运行与采用后，事件记录会显示在这里。</p>'}</section><p class="ct-footnote">本机任务模拟 · 候选结果需主动采用，不会自动覆盖当前版本。</p></div>`;
  }
  C.runs=runs;C.tasks=tasks;
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-ct-more]')){taskLimit+=60;S.render();return;}
    const sourceOpen=event.target.closest('[data-task-key]');if(sourceOpen?.dataset.taskKey){const task=taskItems().find(t=>t.key===sourceOpen.dataset.taskKey);if(task)taskDetail(task);return;}
    const open=event.target.closest('[data-ct-open]');if(open){const c=M.context(open.dataset.project,open.dataset.chapter),n=c?.e.graph.nodes.find(x=>x.id===open.dataset.node);if(c&&n)taskDetail({...c,ch:c.c,n,workspaceProject:window.StudioLibrary?.load().projects.find(p=>p.id===c.p.id&&p.legacySource)});return;}
    const control=event.target.closest('[data-ct-task]');if(control){const c=M.context(control.dataset.project,control.dataset.chapter),n=c?.e.graph.nodes.find(x=>x.id===control.dataset.node);if(!c)return;
      if(control.dataset.ctTask==='pause'&&c.e.run?.status==='running'){c.e.run.status='paused';M.log(c.e,'暂停制作批次','从任务中心暂停，已完成进度保留。');M.save();S.close();S.render();S.toast('所在批次已暂停，当前进度已保留。');}
      if(control.dataset.ctTask==='resume'&&c.e.run?.status==='paused'){c.e.run.status='running';M.log(c.e,'继续制作批次','从任务中心继续执行。');M.save();S.close();S.render();S.toast('所在批次已继续。');}
      if(control.dataset.ctTask==='retry'&&n?.status==='failed'){const proposal=M.plan(c.e,n.id,true),error=M.begin(c.e,proposal);if(error){S.toast(error);return;}M.save();S.close();S.render();S.toast('失败步骤已重新排队。');}
      return;
    }
    const n=event.target.closest('[data-ct-status],[data-ct]');if(!n)return;taskLimit=60;if(n.closest('.ct-global')){if(n.dataset.ct==='reset')taskQuery='';else taskStatus=n.dataset.ctStatus;}else if(n.dataset.ct==='reset'){status='all';query='';provider='all';}else status=n.dataset.ctStatus;S.render();
  });
  document.addEventListener('change',event=>{if(event.target.dataset.ctFilter==='provider'){provider=event.target.value;S.render();}});
  document.addEventListener('input',event=>{const global=event.target.matches('[data-ct-task-search]'),legacy=event.target.matches('[data-ct-search]');if(!global&&!legacy)return;let value=event.target.value;const pos=event.target.selectionStart;if(global){taskQuery=value;taskLimit=60;}else query=value;S.render();const next=document.querySelector(global?'[data-ct-task-search]':'[data-ct-search]');next?.focus();next?.setSelectionRange(pos,pos);});
})();
