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
    const defaultTopActions=`<span class="cm-saved"><i></i> Saved to this device</span>${link('◷','/app/tasks','cm-icon-button')}${link('✦ '+M.db.wallet,'/app/wallet','cm-credit-pill')}<span class="cm-avatar small">M</span>`;
    const topActions=p==='/app/projects'?(C.projectLibrary?.tools()??defaultTopActions):defaultTopActions;
    const creditAllowance=1000,walletValue=Number(M.db.wallet)||0,creditPct=Math.max(0,Math.min(100,Math.round(walletValue/creditAllowance*100))),accountName=S.state.user?.name||'My Creative Universe',accountPlan=S.state.plan||'Free';
    const gaugePct=Math.max(0,Math.min(100,walletValue/creditAllowance*100));
    const gaugeAngle=Math.PI*(1-gaugePct/100),gaugeX=100+70*Math.cos(gaugeAngle),gaugeY=98-70*Math.sin(gaugeAngle);
    const accountCard=`<section class="cm-user-card" data-low="${gaugePct<30}" aria-label="Account and credits">
      <div class="cm-credit-gauge">
        <a class="cm-account-icon cm-account-settings" href="#/app/settings" aria-label="Workspace settings" title="Workspace settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></svg></a>
        <span class="cm-gauge-label">Credits</span>
        <a class="cm-account-icon cm-account-wallet" href="#/app/wallet" aria-label="View credits" title="View credits"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2 4 14h7l-1 8 10-13h-7z"/></svg></a>
        <svg class="cm-gauge-arc" viewBox="0 0 200 115" role="progressbar" aria-label="Credits remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${gaugePct}" aria-valuetext="${creditPct}% remaining, ${walletValue.toLocaleString('en-US')} of ${creditAllowance.toLocaleString('en-US')} credits">
          <defs><linearGradient id="cm-credit-gradient" x1="0" x2="1" y1="0" y2="0"><stop class="cm-gauge-start" offset="0"/><stop class="cm-gauge-end" offset="1"/></linearGradient></defs>
          <path class="cm-gauge-track" d="M30 98 A70 70 0 0 1 170 98" pathLength="100"/>
          <path class="cm-gauge-fill" d="M30 98 A70 70 0 0 1 170 98" pathLength="100" stroke-dasharray="${gaugePct} 100" opacity="${gaugePct>0?1:0}"/>
          <circle class="cm-gauge-dot" cx="${gaugeX}" cy="${gaugeY}" r="5" opacity="${gaugePct>0?1:0}"/>
        </svg>
        <strong class="cm-user-card-pct">${creditPct}%</strong>
      </div>
      <a class="cm-account-profile" href="#/app/settings" aria-label="Account settings for ${E(accountName)}">
        <img class="cm-account-avatar" src="assets/avatar-1-sq.png" alt="">
        <span class="cm-account-name" title="${E(accountName)}">${E(accountName)}</span>
        <span class="cm-account-plan" title="${E(accountPlan)}">${E(accountPlan)}</span>
        <svg class="cm-account-chevron" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 3 6 7-6 7"/></svg>
      </a>
    </section>`;
    return `<div class="cm-shell ${creation?'cm-creating':''}"><aside class="cm-sidebar">${logo()}<small class="cm-nav-label">WORKSPACE</small><nav aria-label="Cimora product navigation">${nav(items)}</nav><small class="cm-nav-label">DISCOVER & CREATE</small><nav>${nav(discover)}</nav><div class="cm-sidebar-bottom">${accountCard}${link(`<span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/></svg></span>Visit Website`,'/','cm-nav-item cm-site-link')}<span class="cm-local"><i></i> Local interactive prototype · task simulation</span></div></aside><div class="cm-app-main"><header class="cm-topbar">${btn('☰','mobile-menu','cm-icon-button cm-mobile-menu','aria-label="展开产品导航"')}<div class="cm-breadcrumb">${link('Creation Space','/app','')}<span>/</span><strong>${E(pageTitle(context))}</strong></div><div class="cm-top-actions">${topActions}</div></header><main class="cm-main">${content}</main></div></div>`;
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


