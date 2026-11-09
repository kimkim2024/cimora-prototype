/* 产品壳、路由与公共界面组件。旧 M0 编辑器保留独立演示数据。 */
window.Cimora=(()=>{
  const S=Site,M=createCimoraDirectionModel(createCimoraImportModel(createCimoraComicModel(createCimoraAdaptationModel(createCimoraProductionModel(createCimoraModel(S),S),S),S),S),S),E=S.esc;
  const ui={assetScope:'chapter',assetType:'All',assetSearch:'',marketType:'All',galleryType:'All',selectedBoard:0,storyCandidate:null,newDraft:null,canvasLink:null,toolContext:false};
  const icons={home:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/></svg>',projects:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8.5L12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5l8 4.5 8-4.5"/><path d="M12 13v7"/></svg>',assets:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l8.5 4.5L12 12.5 3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5"/></svg>',tasks:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="2.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',tools:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19l1-4 9.5-9.5a2 2 0 0 1 3 3L9 18z"/><path d="M14 6.5l3.5 3.5"/></svg>',exports:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5.5h4.5V19H14"/><path d="M4.5 12h10"/><path d="M11 8.5l3.5 3.5-3.5 3.5"/></svg>',market:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 9.5V19h15V9.5"/><path d="M3 9.5l2-5h14l2 5z"/><path d="M9 19v-5h6v5"/></svg>',community:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 15l4.5-4 4 3.5 3-2.5 4.5 4"/></svg>',canvas:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M10 10v9.5"/></svg>',flow:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/><path d="M10.5 7.25h4.75V13.5"/></svg>'};
  const btn=(text,action,cls='cm-button',extra='')=>`<button type="button" class="${cls}" data-cm="${action}" ${extra}>${text}</button>`;
  const link=(text,path,cls='cm-button')=>`<a href="#${path}" class="${cls}">${text}</a>`;
  const money=v=>'$'+Number(v||0).toFixed(2);
  const seconds=e=>e.boards.reduce((sum,b)=>sum+(Number(b.duration)||5),0);
  const timecode=v=>Math.floor(v/60).toString().padStart(2,'0')+':'+Math.floor(v%60).toString().padStart(2,'0');
  const art=(n=0,alt='',cls='')=>S.art(n,alt,cls);
  const statusMap={done:'Generated',idle:'Not started',queued:'Waiting on dependency',running:'Generating',failed:'Failed, retryable',stale:'Source updated',blocked:'Waiting for input',paused:'Paused'};
  const badge=(s,text)=>`<span class="cm-status ${s}"><i></i>${E(text||statusMap[s]||s)}</span>`;
  const ctx=()=>M.context();
  const path=(c,stage='story',view)=>`/app/create/${c.p.id}/${c.c.id}?stage=${stage}${view?'&view='+view:''}`;
  const meta=(a,b)=>`<div class="cm-section-head"><div><span class="cm-kicker">${a}</span><h2>${b}</h2></div></div>`;
  function logo(to='/app'){return `<a href="#${to}" class="cm-logo" aria-label="Cimora home"><img src="assets/studio-cimora-logo.png" alt="Studio Cimora" width="1672" height="941"></a>`;}
  function scopePicker(c=ctx(),prefix='cm-global'){
    if(!c)return '';
    return `<div class="cm-scope"><label><span>Project</span><select id="${prefix}-project" data-cm-change="scope-project">${S.state.projects.filter(p=>!p.archived).map(p=>`<option value="${p.id}" ${c.p.id===p.id?'selected':''}>${E(p.name)}</option>`).join('')}</select></label><i>/</i><label><span>Chapter / Episode</span><select id="${prefix}-chapter" data-cm-change="scope-chapter">${[...c.p.chapters,...(c.p.episodes||[])].map((ch,i)=>`<option value="${ch.id}" ${ch.id===c.c.id?'selected':''}>${ch.kind==='episode'?'Video':'Comic'} · ${E(ch.title)}</option>`).join('')}</select></label></div>`;
  }
  function shell(content,context){
    const p=context.path,creation=p.startsWith('/app/create/')||p.startsWith('/app/canvas/');
    const items=[['home','Creation Space','/app'],['projects','My Projects','/app/projects'],['assets','Asset Library','/app/assets'],['tasks','Tasks & Orchestration','/app/tasks'],['tools','Creative Tools','/app/tools'],['exports','Export & Delivery','/app/exports']];
    const discover=[['community','Showcase','/app/community'],['market','Market','/app/market']];
    const nav=items=>items.map(([ic,t,to])=>link(`<span>${icons[ic]}</span>${t}`,to,'cm-nav-item '+(p===to||to!=='/app'&&p.startsWith(to+'/')?'active':''))).join('');
    return `<div class="cm-shell ${creation?'cm-creating':''}"><aside class="cm-sidebar">${logo()}<div class="cm-studio-name cm-studio-bar"><span class="cm-avatar"><img src="assets/avatar-1-sq.png" alt=""></span><div class="cm-studio-meta"><strong>My Creative Universe</strong><small>Personal Studio</small></div><span class="cm-studio-tag">Creator</span></div><small class="cm-nav-label">WORKSPACE</small><nav aria-label="Cimora product navigation">${nav(items)}</nav><small class="cm-nav-label">DISCOVER & CREATE</small><nav>${nav(discover)}</nav><div class="cm-sidebar-bottom">${`<div class="cm-wallet"><a class="cm-wallet-link" href="#/app/wallet"><span class="cm-wallet-top"><i class="cm-wallet-dot"></i><span class="cm-wallet-label">Credits</span></span><strong class="cm-wallet-value">${M.db.wallet}</strong><small class="cm-wallet-sub">Available in Market</small></a><button type="button" class="cm-wallet-refresh" data-vx="refresh-credits" aria-label="Refresh credits"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4.5h-4.5"/></svg></button></div>`}${link(`<span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M4.5 12h2.2M17.3 12h2.2M6.6 6.6l1.6 1.6M15.8 15.8l1.6 1.6M17.4 6.6l-1.6 1.6M8.2 15.8l-1.6 1.6"/></svg></span>Studio Settings`,'/app/settings','cm-nav-item')}${link(`<span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg></span>Visit Website`,'/','cm-nav-item cm-site-link')}<span class="cm-local"><i></i> Local interactive prototype · task simulation</span></div></aside><div class="cm-app-main"><header class="cm-topbar">${btn('☰','mobile-menu','cm-icon-button cm-mobile-menu','aria-label="展开产品导航"')}<div class="cm-breadcrumb">${link('Creation Space','/app','')}<span>/</span><strong>${E(pageTitle(context))}</strong></div><div class="cm-top-actions"><span class="cm-saved"><i></i> Saved to this device</span>${link('◷','/app/tasks','cm-icon-button')}${link('✦ '+M.db.wallet,'/app/wallet','cm-credit-pill')}<span class="cm-avatar small">M</span></div></header><main class="cm-main">${content}</main></div></div>`;
  }
  function pageTitle(c){return ({new:c.params.get('output')==='motion'?'Video creation':'Create work',projects:'My Projects',assets:'Asset Library',tools:'Creative Tools',tasks:'Tasks & Orchestration',market:'Market',community:'Showcase',wallet:'Credits and resources',creator:'Creator Center',create:ctx()?.p.name,canvas:ctx()?.p.name,runs:'Pipeline orchestration'})[c.parts[1]]||'My Creative Universe';}
  function route(context){
    if(context.parts[0]!=='app')return null;
    const k=context.parts[1];
    if(k==='editor')return null;
    if(k==='create'||k==='canvas'){
      const c=M.activate(context.parts[2],context.parts[3]);
      if(!c)return S.empty('Project does not exist','Back to the workspace to keep creating');
      if(context.params.get('view'))c.e.view=context.params.get('view');
      c.e.stage=context.params.get('stage')||c.e.stage||'story';
      if(k==='canvas')c.e.view='canvas';
      M.remember(c);
      M.save();return C.studio(c);
    }
    if(k==='runs')return C.runs(M.activate(context.parts[2],context.parts[3]));
    if(k==='tools'){const html=S.tools.render({parts:['tools',context.parts[2]]});return `<div class="cm-tool-context">${scopePicker()}<p>Tool results keep their source and can be saved to the current chapter.${link('Back to creating →',path(ctx(),ctx().e.stage),'cm-text-link')}${ui.toolContext&&context.parts[2]?btn('将结果带回选中panel','apply-tool-result','cm-button ghost small',`data-id="${context.parts[2]}"`):''}</p></div>`+html;}
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


