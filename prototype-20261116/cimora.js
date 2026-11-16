/* 产品壳、路由与公共界面组件。旧 M0 编辑器保留独立演示数据。 */
window.Cimora=(()=>{
  const S=Site,M=createCimoraDirectionModel(createCimoraImportModel(createCimoraComicModel(createCimoraAdaptationModel(createCimoraProductionModel(createCimoraModel(S),S),S),S),S),S),E=S.esc;
  const ui={assetScope:'chapter',assetType:'全部',assetSearch:'',marketType:'全部',galleryType:'全部',selectedBoard:0,storyCandidate:null,newDraft:null,canvasLink:null,toolContext:false};
  const icons={home:'⌂',projects:'▦',assets:'◈',tasks:'◷',tools:'✧',exports:'↗',market:'▱',community:'✦',canvas:'⌘',flow:'☷'};
  const btn=(text,action,cls='cm-button',extra='')=>`<button type="button" class="${cls}" data-cm="${action}" ${extra}>${text}</button>`;
  const link=(text,path,cls='cm-button')=>`<a href="#${path}" class="${cls}">${text}</a>`;
  const money=v=>'$'+Number(v||0).toFixed(2);
  const seconds=e=>e.boards.reduce((sum,b)=>sum+(Number(b.duration)||5),0);
  const timecode=v=>Math.floor(v/60).toString().padStart(2,'0')+':'+Math.floor(v%60).toString().padStart(2,'0');
  const art=(n=0,alt='',cls='')=>S.art(n,alt,cls);
  const statusMap={done:'已生成',idle:'待开始',queued:'等待依赖',running:'生成中',failed:'失败可重试',stale:'来源已更新',blocked:'等待输入',paused:'已暂停'};
  const badge=(s,text)=>`<span class="cm-status ${s}"><i></i>${E(text||statusMap[s]||s)}</span>`;
  const ctx=()=>M.context();
  const path=(c,stage='story',view)=>`/app/create/${c.p.id}/${c.c.id}?stage=${stage}${view?'&view='+view:''}`;
  const meta=(a,b)=>`<div class="cm-section-head"><div><span class="cm-kicker">${a}</span><h2>${b}</h2></div></div>`;
  function logo(to='/app'){return `<a href="#${to}" class="cm-logo" aria-label="Cimora 首页"><span class="cm-logomark">c<span>✦</span></span><strong>cimora<span>CREATE YOUR UNIVERSE</span></strong></a>`;}
  function scopePicker(c=ctx(),prefix='cm-global'){
    if(!c)return '';
    return `<div class="cm-scope"><label><span>项目</span><select id="${prefix}-project" data-cm-change="scope-project">${S.state.projects.filter(p=>!p.archived).map(p=>`<option value="${p.id}" ${c.p.id===p.id?'selected':''}>${E(p.name)}</option>`).join('')}</select></label><i>/</i><label><span>章节 / 剧集</span><select id="${prefix}-chapter" data-cm-change="scope-chapter">${[...c.p.chapters,...(c.p.episodes||[])].map((ch,i)=>`<option value="${ch.id}" ${ch.id===c.c.id?'selected':''}>${ch.kind==='episode'?'视频':'漫画'} · ${E(ch.title)}</option>`).join('')}</select></label></div>`;
  }
  function shell(content,context){
    const p=context.path,creation=p.startsWith('/app/create/')||p.startsWith('/app/canvas/');
    const items=[['home','创作空间','/app'],['projects','我的项目','/app/projects'],['assets','资产库','/app/assets'],['tasks','生成任务','/app/tasks'],['exports','导出中心','/app/exports']];
    const discover=[['community','作品广场','/app/community'],['tools','创作工具','/app/tools'],['market','创作市场','/app/market']];
    const nav=items=>items.map(([ic,t,to])=>link(`<span>${icons[ic]}</span>${t}`,to,'cm-nav-item '+(p===to||to!=='/app'&&p.startsWith(to+'/')?'active':''))).join('');
    return `<div class="cm-shell ${creation?'cm-creating':''}"><aside class="cm-sidebar">${logo()}<div class="cm-studio-name">${window.StudioAccount?StudioAccount.avatar():'<span class="cm-avatar">M</span>'}<div>${E(window.StudioAccount?StudioAccount.profile().name:S.state.prefs.studio||'我的创作宇宙')}<small>个人创作账户</small></div></div><small class="cm-nav-label">WORKSPACE</small><nav aria-label="Cimora 产品导航">${nav(items)}</nav><small class="cm-nav-label">DISCOVER & CREATE</small><nav>${nav(discover)}</nav><div class="cm-sidebar-bottom">${link('♧ 创作者中心','/app/creator?tab=works','cm-nav-item'+(context.parts[1]==='creator'?' active':''))}${link('⚙ 个人中心','/app/settings','cm-nav-item'+(['settings','billing'].includes(context.parts[1])?' active':''))}${link('↗ 访问官网','/','cm-nav-item cm-site-link')}<span class="cm-local"><i></i> 本机交互原型 · 任务模拟</span></div></aside><div class="cm-app-main"><header class="cm-topbar">${btn('☰','mobile-menu','cm-icon-button cm-mobile-menu','aria-label="展开产品导航"')}<div class="cm-breadcrumb">${link('创作空间','/app','')}<span>/</span><strong>${E(pageTitle(context))}</strong></div><div class="cm-top-actions"><span class="cm-saved"><i></i> 已保存到本机</span>${link('◷','/app/tasks','cm-icon-button')}${link('✦ '+(window.PointsWallet?PointsWallet.balance():M.db.wallet),'/app/settings?tab=wallet','cm-credit-pill')}${window.StudioAccount?link(StudioAccount.avatar(),'/app/settings','sa-account-link'):'<span class="cm-avatar small">M</span>'}</div></header><main class="cm-main">${content}</main></div></div>`;
  }
  function pageTitle(c){return ({new:c.params.get('output')==='motion'?'视频创作':'创建作品',projects:'我的项目',assets:'资产库',tools:'创作工具',tasks:'生成任务',exports:'导出中心',market:'创作市场',community:'作品广场',wallet:'个人中心',creator:'创作者中心',settings:'个人中心',billing:'个人中心',create:ctx()?.p.name,canvas:ctx()?.p.name,runs:'工程编排'})[c.parts[1]]||'我的创作宇宙';}
  function route(context){
    if(context.parts[0]!=='app')return null;
    const k=context.parts[1];
    if(k==='editor')return null;
    if(k==='create'||k==='canvas'){
      const c=M.activate(context.parts[2],context.parts[3]);
      if(!c)return S.empty('项目不存在','返回工作空间继续创作');
      if(context.params.get('view'))c.e.view=context.params.get('view');
      c.e.stage=context.params.get('stage')||c.e.stage||'story';
      if(k==='canvas')c.e.view='canvas';
      M.remember(c);
      M.save();return C.studio(c);
    }
    if(k==='runs')return C.runs(M.activate(context.parts[2],context.parts[3]));
    if(k==='tools'){const html=S.tools.render({parts:['tools',context.parts[2]]});return `<div class="cm-tool-context">${scopePicker()}<p>工具结果将保留来源，可保存到当前章节。${link('返回创作 →',path(ctx(),ctx().e.stage),'cm-text-link')}${ui.toolContext&&context.parts[2]?btn('将结果带回选中分格','apply-tool-result','cm-button ghost small',`data-id="${context.parts[2]}"`):''}</p></div>`+html;}
    if(C.pages?.[k||'home'])return C.pages[k||'home'](context);
    if(k==='projects'&&context.parts[2])return C.project(S.project(context.parts[2]));
    return null;
  }
  function afterRender(context){
    const isApp=context.parts[0]==='app';
    document.body.classList.toggle('cimora-app',isApp);
    document.body.classList.toggle('cimora-home-app',context.path==='/app');
    document.body.classList.toggle('cimora-home-public',context.path==='/');
    if(isApp){
      S.$$('a[href^="#/tools"]').forEach(a=>{a.href='#/app'+a.getAttribute('href').slice(1);});
      S.$$('a[href^="#/app/editor/"]').forEach(a=>{if(a.dataset.legacy)return;const url=a.getAttribute('href').replace('/editor/','/create/').replace('step=script','stage=story').replace('step=assets','stage=assets').replace('step=motion','stage=motion').replace('step=comic','stage=boards');a.href=url;});
      if(context.parts[1]==='tools'){S.$$('a[href="#/product"]').forEach(a=>a.href='#/app');S.$$('a[href^="#/templates"]').forEach(a=>a.href='#/app/market');}
    }
    C.bindCanvas?.();C.bindTimeline?.();window.CimoraAppearance?.refresh();
  }
  const originalToolCard=S.public.toolCard;S.public.toolCard=t=>{const html=originalToolCard(t);return S.context.path.startsWith('/app')?html.replaceAll('href="#/tools/','href="#/app/tools/'):html;};
  const C={S,M,E,ui,btn,link,money,seconds,timecode,art,badge,ctx,path,meta,logo,scopePicker,shell,route,afterRender,pageTitle};return C;
})();


