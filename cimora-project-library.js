/* My projects: local, shared project data with compact page-scoped controls. */
(()=>{
  'use strict';
  const C=Cimora,{S,E,ui}=C;
  const model=createProjectLibraryModel(S);
  const demoCovers={'rain':'assets/project-cover-pop-art.webp','project-portable-romance-v2':'assets/project-cover-rope-run.webp'};
  const demoProjects=[{id:'demo-kimono-strike',name:'霓虹追逐 · 示例',desc:'动作 · 霓虹追逐',art:6,source:'script',mode:'studio',assetIds:[],chapters:[{id:'ch1',title:'起始镜头',status:'故事草稿',seconds:0}],cover:'assets/project-cover-kimono-strike.webp'},{id:'project-portable-romance-v2',name:'Portable Romance · 示例',desc:'都市恋爱 · 命运的绳结',art:6,source:'script',mode:'studio',assetIds:[],chapters:[{id:'ch1',title:'起始镜头',status:'故事草稿',seconds:0}],cover:'assets/project-cover-rope-run.webp'}];
  const settings={filter:'all',sort:'edited'};
  const sorts=[['edited','Last Edited'],['created','Date Created'],['name','Name']];
  ui.projectSearch??='';
  const beforeSave=S.beforeSave;
  S.beforeSave=()=>{beforeSave?.();model.sync(!!S.rendering);};
  const svg=paths=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons={
    star:svg('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>'),
    more:svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    search:svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    plus:svg('<path d="M12 5v14M5 12h14"/>'),
    archive:svg('<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>'),
    close:svg('<path d="m6 6 12 12M6 18 18 6"/>'),
    chevron:svg('<path d="m7 10 5 5 5-5"/>'),
    check:svg('<path d="m5 12 4 4L19 6"/>')
  };
  const tip=text=>`<span class="cm-project-tooltip" aria-hidden="true">${text}</span>`;
  const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
  function tools(){return `<div class="cm-project-tools" role="group" aria-label="Project Actions"><a href="#/app/new" class="cm-project-action" aria-label="New Project">${icons.plus}${tip('New Project')}</a><button type="button" class="cm-project-action" data-project-action="archive-list" aria-label="Recycle Bin">${icons.archive}${tip('Recycle Bin')}</button><button type="button" id="pl-search-trigger" class="cm-project-action${ui.projectSearch?' has-query':''}" data-project-action="toggle-search" aria-label="Search Projects" aria-expanded="false" aria-controls="pl-search-popover">${icons.search}${tip('Search Projects')}</button></div><div id="pl-search-popover" class="pl-search-popover" role="search" aria-label="Project Search" hidden><form data-project-form="search"><input id="pl-project-search" type="search" aria-label="Search Projects By Name" placeholder="Search Projects…" autocomplete="off" data-project-query value="${E(ui.projectSearch)}"><button type="button" class="pl-search-clear" data-project-action="clear-search" ${ui.projectSearch?'':'hidden'}>Clear</button><button type="button" class="pl-close" data-project-action="close-search" aria-label="Close Search">${icons.close}</button></form></div>`;}
  function unit(p){const units=[...(p.chapters||[]),...(p.episodes||[])];return units.find(c=>c.id===p.lastChapterId)||units[0];}
  function canvasPath(p){
    const c=unit(p);if(!c)return '/app/projects/'+encodeURIComponent(p.id);
    return `/app/canvas/${encodeURIComponent(p.id)}/${encodeURIComponent(c.id)}?view=canvas`;
  }
  function editor(p){const c=unit(p);return c?S.state.cimora?.projects?.[p.id]?.[c.id]:null;}
  function thumbnail(p){
    const e=editor(p)||{},positions=e.creationCanvas?.positions||{};
    const isEpisode=unit(p)?.kind==='episode',group=Math.max(0,Number(e.creationCanvas?.group)||0);
    const items=(isEpisode?e.productionShots||[]:e.boards||[]).slice(group*6,group*6+6),prefix=isEpisode?'shot:':'panel:';
    const nodes=items.length?items.map((b,i)=>({id:prefix+b.id,title:b.title,x:20+i%3*270,y:20+Math.floor(i/3)*240,...positions[prefix+b.id]})):(e.graph?.nodes||[]).slice(0,8);
    const number=n=>Number.isFinite(Number(n))?Number(n):0;
    const minX=Math.min(0,...nodes.map(n=>number(n.x))),minY=Math.min(0,...nodes.map(n=>number(n.y)));
    const maxX=Math.max(600,...nodes.map(n=>number(n.x)+240)),maxY=Math.max(340,...nodes.map(n=>number(n.y)+180));
    const scale=Math.min(440/(maxX-minX),230/(maxY-minY));
    const contents=nodes.map(n=>`<g transform="translate(${20+(number(n.x)-minX)*scale} ${20+(number(n.y)-minY)*scale})"><rect width="${240*scale}" height="${180*scale}" rx="7" fill="#fff" stroke="#bdc5ae"/><rect x="8" y="8" width="${Math.max(10,240*scale-16)}" height="${Math.max(14,100*scale)}" rx="4" fill="#eaf4d5"/><text x="9" y="${Math.max(32,125*scale)}" font-family="sans-serif" font-size="${Math.max(6,Math.min(10,16*scale))}" fill="#404040">${E(String(n.title||'Canvas item').slice(0,12))}</text><path d="M9 ${155*scale}h${Math.max(15,160*scale)}" stroke="#d6dbcd" stroke-width="3"/></g>`).join('');
    const image=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270"><rect width="480" height="270" fill="#f4f8ed"/>${contents||'<path d="M224 135h32m-16-16v32" stroke="#889778" stroke-width="2"/>'}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(image);
  }
  function openedTime(value){
    const time=model.time(value),elapsed=Math.max(0,Date.now()-time);
    if(elapsed<60000)return 'Just now';
    if(elapsed<3600000){const n=Math.floor(elapsed/60000);return `${n} ${n===1?'minute':'minutes'} ago`;}
    if(elapsed<86400000){const n=Math.floor(elapsed/3600000);return `${n} ${n===1?'hour':'hours'} ago`;}
    const days=Math.floor(elapsed/86400000);
    if(days<2)return 'Yesterday';
    if(days<7)return `${days} days ago`;
    return new Date(time).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }
  function starButton(p){return `<button type="button" class="pl-star" data-project-action="star" data-project-id="${E(p.id)}" aria-label="${p.starred?'Unstar':'Star'} ${E(p.name)}" aria-pressed="${p.starred===true}" title="${p.starred?'Unstar Project':'Star Project'}">${icons.star}</button>`;}
  function moreButton(p){return `<button type="button" class="pl-more" data-project-action="more" data-project-id="${E(p.id)}" aria-label="More Actions For ${E(p.name)}" aria-haspopup="dialog" title="More Actions">${icons.more}</button>`;}
  function card(p,recent=false){
    const href='#'+canvasPath(p);
    const cover=p.cover?`<img src="${E(p.cover)}" alt="${E(p.name)}" loading="lazy">`:recent?`<img src="${E(thumbnail(p))}" alt="Canvas Preview For ${E(p.name)}" loading="lazy">`:C.art(p.art,p.name);
    return `<article class="cm-project-card pl-card${recent?' pl-recent-card':''}" data-project-id="${E(p.id)}"><a href="${E(href)}" class="pl-cover" aria-label="Open Canvas: ${E(p.name)}">${cover}</a><div><h3><a href="${E(href)}">${E(p.name)}</a></h3>${recent?`<div class="pl-card-foot"><time datetime="${E(new Date(model.time(p.lastOpenedAt)).toISOString())}" title="${E(new Date(model.time(p.lastOpenedAt)).toLocaleString('en-US'))}">${E(openedTime(p.lastOpenedAt))}</time><nav class="pl-card-actions" aria-label="Actions For ${E(p.name)}">${starButton(p)}${moreButton(p)}</nav></div>`:`<p>${E(p.desc)}</p><div class="pl-card-foot"><small>${plural(p.chapters?.length||0,'Chapter')} &amp; ${plural(p.assetIds?.length||0,'Asset')}</small><nav class="pl-card-actions" aria-label="Actions For ${E(p.name)}">${starButton(p)}${moreButton(p)}</nav></div>`}</div></article>`;
  }
  function actionModal(p){
    S.modal('Project Actions',`<p class="pl-action-project">${E(p.name)}</p><div class="pl-action-menu" role="group" aria-label="Project Actions"><button type="button" class="cm-button ghost" data-project-action="rename" data-project-id="${E(p.id)}">Rename</button><button type="button" class="cm-button ghost" data-project-action="duplicate" data-project-id="${E(p.id)}">Duplicate</button><button type="button" class="cm-button ghost danger" data-project-action="confirm-archive" data-project-id="${E(p.id)}">Move To Recycle Bin</button></div>`);
  }
  function renameModal(p){
    S.modal('Rename Project',`<form data-project-form="rename" data-project-id="${E(p.id)}"><label class="cm-label">Project Name<input name="name" value="${E(p.name)}" required maxlength="80" autofocus></label><button class="cm-button primary full">Save</button></form>`);
  }
  function archiveModal(){
    const projects=S.state.projects.filter(p=>p.archived);
    S.modal('Recycle Bin',projects.map(p=>`<div class="cm-candidate-row"><span>${E(p.name)}</span><button type="button" class="cm-button ghost" data-project-action="restore" data-project-id="${E(p.id)}">Restore</button></div>`).join('')||'<p>No Projects In The Recycle Bin.</p>');
  }
  function duplicate(p){
    if(!model.duplicate(p.id)){S.toast('Could Not Save The Copy. Your Original Project Is Unchanged.');return;}
    S.close();updateRecent();update();S.toast('Project Duplicated.');
  }
  function archive(p){
    if(!model.archive(p.id)){S.toast('Could Not Move This Project. Please Try Again.');return;}
    S.close();updateRecent();update();S.toast('Moved To Recycle Bin. You Can Restore It Anytime.');
  }
  function emptyState(){
    if(!model.available().length)return `<div class="pl-empty pl-empty-start"><span class="pl-empty-mark" aria-hidden="true">＋</span><h3>Your Creative Journey Starts Here.</h3><p>Create Your First Project To Start Exploring Ideas.</p><a class="cm-button primary" href="#/app/new">Create Project</a></div>`;
    if(String(ui.projectSearch).trim())return `<div class="pl-empty"><h3>No Projects Found.</h3><p>Try Another Name Or Clear Your Filters.</p><button type="button" class="cm-button ghost" data-project-action="reset-filters">Clear Filters</button></div>`;
    return `<div class="pl-empty"><h3>No Starred Projects Yet.</h3><p>Star A Project To Keep It Close.</p></div>`;
  }
  function recentSection(){
    const projects=model.recent();
    if(!projects.length)return '';
    return `<section class="pl-recent" aria-labelledby="pl-recent-heading"><header class="pl-section-heading"><h2 id="pl-recent-heading">Recently Opened</h2></header><div class="pl-recent-row">${projects.map(p=>card(p,true)).join('')}</div></section>`;
  }
  function options(){return {query:ui.projectSearch,filter:settings.filter,sort:settings.sort};}
  function list(){return model.list(options()).map(p=>card(p)).join('')||emptyState();}
  function filterTab(value){
    const starred=value==='starred';
    return `<button type="button" class="pl-tab pl-tab-${value}" data-project-action="filter" data-value="${value}" aria-pressed="${settings.filter===value}">${starred?`<span class="pl-tab-icon" aria-hidden="true">${icons.star}</span>`:''}<span class="pl-tab-text">${starred?'Starred':'All'}</span></button>`;
  }
  function toolbar(){return `<div class="pl-toolbar"><div class="pl-filters" role="group" aria-label="Project Filter" data-active="${settings.filter}"><span class="pl-filter-thumb" aria-hidden="true"></span>${filterTab('all')}${filterTab('starred')}</div><button type="button" class="pl-query-chip" data-project-action="clear-search" hidden></button><div class="pl-sort"><button type="button" id="pl-sort-trigger" class="pl-sort-trigger" data-project-action="toggle-sort" aria-haspopup="menu" aria-expanded="false" aria-controls="pl-sort-menu"><span>${sorts.find(([key])=>key===settings.sort)[1]}</span>${icons.chevron}</button><div id="pl-sort-menu" class="pl-sort-menu" role="menu" aria-label="Sort Projects" hidden>${sorts.map(([value,label])=>`<button type="button" role="menuitemradio" aria-checked="${settings.sort===value}" tabindex="-1" data-project-action="sort" data-value="${value}"><span>${label}</span>${icons.check}</button>`).join('')}</div></div></div>`;}
  function hero(){return `<div class="pl-hero"><h1 class="pl-hero-title"><span>My</span><span>Projects</span></h1></div>`;}
  function render(){return `<div class="pl-page" lang="en">${hero()}<div id="pl-recent-region">${recentSection()}</div><section class="pl-all" aria-labelledby="pl-all-heading"><header class="pl-section-heading"><h2 id="pl-all-heading">All Projects</h2></header>${toolbar()}<div id="cm-project-list" class="cm-project-grid">${list()}</div></section></div>`;}
  function update(){
    const host=S.$('#cm-project-list');if(!host)return;
    host.innerHTML=list();
    const group=S.$('.pl-filters');if(group)group.dataset.active=settings.filter;
    S.$$('.pl-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===settings.filter)));
    const query=String(ui.projectSearch).trim(),chip=S.$('.pl-query-chip');
    if(chip){chip.hidden=!query;chip.innerHTML=`<span>${E(query)}</span>${icons.close}`;chip.title='Clear Search: '+query;chip.setAttribute('aria-label','Clear Search: '+query);}
    S.$('#pl-search-trigger')?.classList.toggle('has-query',!!query);
    const clear=S.$('.pl-search-clear');if(clear)clear.hidden=!ui.projectSearch;
    const sort=S.$('#pl-sort-trigger');
    if(sort){const label=sorts.find(([key])=>key===settings.sort)[1];sort.querySelector('span').textContent=label;sort.setAttribute('aria-label','Sort By '+label);sort.title='Sort By '+label;}
    S.$$('#pl-sort-menu button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.value===settings.sort)));
  }
  function updateRecent(){const host=S.$('#pl-recent-region');if(host)host.innerHTML=recentSection();}
  function closeSearch(focus=false){
    const panel=S.$('#pl-search-popover');if(!panel)return;
    panel.hidden=true;S.$('#pl-search-trigger')?.setAttribute('aria-expanded','false');
    if(focus)S.$('#pl-search-trigger')?.focus();
  }
  function closeSort(focus=false){
    const menu=S.$('#pl-sort-menu');if(!menu)return;
    menu.hidden=true;S.$('#pl-sort-trigger')?.setAttribute('aria-expanded','false');
    if(focus)S.$('#pl-sort-trigger')?.focus();
  }
  function openSort(){
    closeSearch();const menu=S.$('#pl-sort-menu');if(!menu)return;
    menu.hidden=false;S.$('#pl-sort-trigger').setAttribute('aria-expanded','true');
    menu.querySelector('[aria-checked="true"]')?.focus();
  }
  document.addEventListener('click',event=>{
    if(S.context.path!=='/app/projects')return;
    if(!event.target.closest('#pl-search-popover,#pl-search-trigger'))closeSearch();
    if(!event.target.closest('.pl-sort'))closeSort();
    const button=event.target.closest('[data-project-action]');if(!button)return;
    const action=button.dataset.projectAction;event.preventDefault();
    if(action==='toggle-search'){
      const panel=S.$('#pl-search-popover');if(!panel)return;
      if(!panel.hidden){closeSearch(true);return;}
      closeSort();panel.hidden=false;button.setAttribute('aria-expanded','true');S.$('#pl-project-search').focus();return;
    }
    if(action==='close-search'){closeSearch(true);return;}
    if(action==='toggle-sort'){if(S.$('#pl-sort-menu').hidden)openSort();else closeSort(true);return;}
    if(action==='sort'&&sorts.some(([key])=>key===button.dataset.value)){settings.sort=button.dataset.value;update();closeSort(true);return;}
    if(action==='archive-list'){archiveModal();return;}
    if(action==='restore'){
      if(!model.archive(button.dataset.projectId,false)){S.toast('Could Not Restore This Project. Please Try Again.');return;}
      S.close();updateRecent();update();S.toast('Project Restored.');return;
    }
    if(action==='more'){const p=model.byId(button.dataset.projectId);if(p)actionModal(p);return;}
    if(action==='rename'){const p=model.byId(button.dataset.projectId);if(p)renameModal(p);return;}
    if(action==='duplicate'){const p=model.byId(button.dataset.projectId);if(p)duplicate(p);return;}
    if(action==='confirm-archive'){const p=model.byId(button.dataset.projectId);if(p)archive(p);return;}
    if(action==='star'){
      if(!model.toggleStar(button.dataset.projectId)){S.toast('Could Not Save Your Starred Projects. Please Try Again.');return;}
      const inRecent=!!button.closest('.pl-recent');update();updateRecent();
      const region=S.$(inRecent?'#pl-recent-region':'#cm-project-list');
      [...(region?.querySelectorAll('[data-project-action="star"]')||[])].find(b=>b.dataset.projectId===button.dataset.projectId)?.focus();
      if(!document.activeElement?.closest('.pl-page'))S.$('.pl-filters button[aria-pressed="true"]')?.focus();return;
    }
    if(action==='filter'&&['all','starred'].includes(button.dataset.value))settings.filter=button.dataset.value;
    if(action==='clear-search'||action==='reset-filters'){
      ui.projectSearch='';if(action==='reset-filters')settings.filter='all';
      const input=S.$('#pl-project-search');if(input)input.value='';
      if(!S.$('#pl-search-popover')?.hidden)input?.focus();else S.$('#pl-search-trigger')?.focus();
    }
    update();
  });
  document.addEventListener('submit',event=>{
    if(event.target.matches('[data-project-form="search"]')){event.preventDefault();closeSearch(true);return;}
    const form=event.target.closest('[data-project-form="rename"]');if(!form)return;event.preventDefault();
    const p=model.byId(form.dataset.projectId),name=new FormData(form).get('name')?.toString().trim();
    if(!p||!name||name.length>80){S.toast('Enter A Project Name Between 1 And 80 Characters.');return;}
    if(!model.rename(p.id,name)){S.toast('Could Not Save The Name. Your Original Name Is Unchanged.');return;}
    S.close();updateRecent();update();S.toast('Project Renamed.');
  });
  document.addEventListener('input',event=>{if(event.target.matches('[data-project-query]')){ui.projectSearch=event.target.value;update();}});
  document.addEventListener('keydown',event=>{
    if(S.context.path!=='/app/projects')return;
    if(event.key==='Escape'){
      if(!S.$('#pl-search-popover')?.hidden){event.preventDefault();closeSearch(true);}
      if(!S.$('#pl-sort-menu')?.hidden){event.preventDefault();closeSort(true);}return;
    }
    if(event.target.closest('#pl-sort-trigger')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openSort();return;}
    if(!event.target.closest('#pl-sort-menu'))return;
    const buttons=S.$$('#pl-sort-menu button'),i=buttons.indexOf(document.activeElement);
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();
    }
  });
  document.addEventListener('focusin',event=>{
    if(S.context.path!=='/app/projects')return;
    if(!event.target.closest('.pl-sort'))closeSort();
    if(!event.target.closest('#pl-search-popover,#pl-search-trigger'))closeSearch();
  });
  // Missing covers use the saved canvas overview, never a fabricated project image.
  document.addEventListener('error',event=>{
    const image=event.target;if(!(image instanceof HTMLImageElement)||image.dataset.projectFallback)return;
    const owner=image.closest('.pl-card'),p=owner&&model.byId(owner.dataset.projectId);if(!p)return;
    image.dataset.projectFallback='true';image.src=thumbnail(p);image.alt='Canvas Preview For '+p.name;
  },true);
  function localizeShell(){
    // One sidebar for every page: the My Projects wording is the baseline.
    const translations=[['Cimora 首页','Cimora Home'],['Cimora 产品导航','Workspace Navigation'],['展开产品导航','Open Navigation'],['我的创作宇宙','My Workspace'],['个人工作室','Personal Workspace'],['创作空间','Workspace'],['我的项目','My Projects'],['资产库','Asset Library'],['任务与编排','Tasks'],['创作工具','Creative Tools'],['导出与交付','Exports'],['作品广场','Community'],['创作市场可用','Available In The Marketplace'],['创作市场','Marketplace'],['工作室设置','Workspace Settings'],['访问官网','Visit Website'],['本机交互原型 · 任务模拟','Local Prototype'],['积分','Credits'],['WORKSPACE','Workspace'],['DISCOVER & CREATE','Discover']];
    const translate=text=>translations.reduce((value,[from,to])=>value.replaceAll(from,to),text);
    for(const root of S.$$('.cm-sidebar')){
      root.lang='en';const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.nodeValue=translate(walker.currentNode.nodeValue);
      root.querySelectorAll('[aria-label],[title]').forEach(el=>{for(const attr of ['aria-label','title'])if(el.hasAttribute(attr))el.setAttribute(attr,translate(el.getAttribute(attr)));});
    }
  }
  C.localizeShell=localizeShell;
  function applyDemoData(){
    let changed=false;
    for(const [id,src] of Object.entries(demoCovers)){const p=model.byId(id);if(p&&!Object.hasOwn(p,'cover')){p.cover=src;changed=true;}}
    for(const demo of demoProjects){
      if(model.byId(demo.id))continue;
      S.state.projects.push({...demo,chapters:demo.chapters.map(c=>({...c})),updated:'Just Now'});
      changed=true;
    }
    if(changed)S.save();
  }
  const after=C.afterRender;
  C.afterRender=context=>{
    after(context);
    const projectRoute=context.parts[0]==='app'&&['projects','create','canvas','runs'].includes(context.parts[1]);
    applyDemoData();
    model.sync(true);model.visit(projectRoute?context.parts[2]:null);S.refreshSaveStatus?.();
    if(context.parts[0]==='app'){localizeShell();if(context.path==='/app/projects'){update();document.title='My Projects · Cimora';}}
  };
  C.projectLibrary={model,settings,render,list,canvasPath,thumbnail,tools};
  const previousProjects=C.pages.projects;
  C.pages.projects=context=>context.parts[2]?previousProjects(context):render();
  C.projectTools=tools;
  C.projectList=list;
  C.pages.home=C.workspaceHome;
})();
