/* Creation Space (#/app): single-screen studio overview.
   Every number on this page is read from the local project state; invented
   figures are labelled "demo". No water glasses, no fitness copy. */
(()=>{
  const C=Cimora,{S,M,E}=C;
  const UI={format:'video',carFilter:'all',assetFilter:'all',chapterFilter:'all'};

  const ICON={
    story:'<path d="M4 5.5h9.5a2.5 2.5 0 0 1 2.5 2.5v11H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M16 8h4v11H6"/>',
    comic:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M10 10v9.5"/>',
    video:'<rect x="3.5" y="6" width="12.5" height="12" rx="2"/><path d="M16 10.5l4.5-2.4v7.8L16 13.5"/>',
    play:'<path d="M8 5.6l9 6.4-9 6.4z"/>',
    arrow:'<path d="M4.5 12h13"/><path d="M12.5 6.5L18 12l-5.5 5.5"/>',
    search:'<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4L20 20"/>',
    check:'<path d="M4.5 12.5l5 5 10-11"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>',
    alert:'<path d="M12 4.5l8.5 15H3.5z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    layers:'<path d="M12 3.5l8.5 4.5L12 12.5 3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5"/>',
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9"/><path d="M9.5 9.6h4a1.9 1.9 0 0 1 0 3.8h-3a1.9 1.9 0 0 0 0 3.8h4"/>',
    grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
    box:'<path d="M4 8.5L12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5l8 4.5 8-4.5"/><path d="M12 13v7"/>',
    task:'<rect x="4.5" y="4.5" width="15" height="15" rx="2.5"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    pencil:'<path d="M5 19l1-4 9.5-9.5a2 2 0 0 1 3 3L9 18z"/><path d="M14 6.5l3.5 3.5"/>',
    out:'<path d="M14 5.5h4.5V19H14"/><path d="M4.5 12h10"/><path d="M11 8.5l3.5 3.5-3.5 3.5"/>',
    gallery:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 15l4.5-4 4 3.5 3-2.5 4.5 4"/>',
    market:'<path d="M4.5 9.5V19h15V9.5"/><path d="M3 9.5l2-5h14l2 5z"/><path d="M9 19v-5h6v5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M4.5 12h2.2M17.3 12h2.2M6.6 6.6l1.6 1.6M15.8 15.8l1.6 1.6M17.4 6.6l-1.6 1.6M8.2 15.8l-1.6 1.6"/>',
    link:'<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>'
  };
  function svg(name,size){
    return '<svg class="vx-i" viewBox="0 0 24 24" width="'+(size||16)+'" height="'+(size||16)+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[name]+'</svg>';
  }

  const FORMATS={
    video:{label:'Video',step:'Story & Scenes / Shots / Motion',route:'/app/new?source=idea&output=motion',icon:'video'},
    comic:{label:'Comic',step:'Story & Assets / Scenes / Panels',route:'/app/comic',icon:'comic'},
    story:{label:'Story',step:'Idea / Characters / Episodes',route:'/app/script?intent=new',icon:'story'}
  };

  function projects(){try{return S.state.projects.filter(p=>!p.archived);}catch{return[];}}
  function activeProject(){
    const list=projects();
    if(!list.length)return null;
    const p=[...list].sort((a,b)=>String(b.lastOpenedAt||'').localeCompare(String(a.lastOpenedAt||'')))[0];
    try{
      const c=M.resume(p);
      return {p,chapter:c.c||(p.chapters||[])[0]||{title:'Chapter 1'},e:c.e||{graph:{nodes:[]}},context:c};
    }catch{return {p,chapter:(p.chapters||[])[0]||{title:'Chapter 1'},e:{graph:{nodes:[]}}};}
  }
  function nodes(ctx){return (ctx&&ctx.e&&ctx.e.graph&&ctx.e.graph.nodes)||[];}
  function steps(ctx){
    const n=nodes(ctx),by=k=>n.filter(x=>x.status===k).length;
    return{
      total:n.length,
      done:by('done'),
      running:by('running')+by('queued'),
      failed:by('failed'),
      stale:by('stale'),
      candidate:by('candidate')
    };
  }
  function wallet(){const w=M&&M.db?Number(M.db.wallet):NaN;return Number.isFinite(w)?w:680;}
  function chapters(p){return (p&&p.chapters?p.chapters.length:0)+(p&&p.episodes?p.episodes.length:0);}
  function assetCount(){try{return S.state.assets.length;}catch{return 0;}}

  /* ---------- top band: bold display type + glass panels (poster style) ---------- */
  function bandWords(ctx){
    const raw=(ctx&&ctx.p?String(ctx.p.name):'Before the Rain Ends').trim();
    const words=raw.split(/\s+/).filter(Boolean);
    if(words.length<=1)return [raw];
    if(words.length===2)return words;
    const half=Math.ceil(words.length/2);
    return [words.slice(0,half).join(' '),words.slice(half).join(' ')];
  }

  function glassAssetCards(ctx){
    /* 三张空玻璃卡：先不放内容，形状/角度/漂浮保留 */
    return ['a','b','c'].map(slug=>`<figure class="vx-glass vx-glass-${slug}" aria-hidden="true"></figure>`).join('');
  }

  function band(ctx){
    const words=bandWords(ctx).slice(0,2);
    const tones=['lime','white'];
    const offsets=['is-left','is-center'];
    const type=words.map((w,i)=>`<span class="vx-band-line ${offsets[i]||'is-center'} tone-${tones[i]||'white'}">${E(w.toUpperCase())}</span>`).join('');
    return `<section class="vx-band" aria-label="Current project">
      <div class="vx-band-grid" aria-hidden="true"></div>
      <h2 class="vx-band-type">${type}</h2>
      <div class="vx-band-cards" aria-hidden="true">${glassAssetCards(ctx)}</div>
      <div class="vx-badge" aria-hidden="true">
        <svg class="vx-badge-ring" viewBox="0 0 100 100">
          <defs><path id="vxBadgePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"/></defs>
          <text><textPath href="#vxBadgePath" startOffset="0%">OPEN THE STUDIO · CREATE · </textPath></text>
        </svg>
        <span class="vx-badge-core">c</span>
      </div>
    </section>`;
  }

  /* ---------- worlds carousel (poster cards + prev/next) ---------- */
  const SHOWCASE=[
    {cat:'Story · Mystery',kind:'story',title:'The Last Train Recording',art:0},
    {cat:'Comic · Fantasy',kind:'comic',title:'Letters to the Stars',art:1},
    {cat:'Comic + Video · Urban',kind:'comic',title:'Before the Rain Ends',art:6},
    {cat:'Video · Youth',kind:'video',title:'The Last Train of Summer',art:3}
  ];
  function worldCards(){
    const out=[];
    try{
      projects().slice(0,4).forEach(p=>{
        const motion=M.output&&M.output(p)==='motion';
        out.push({cat:motion?'Video':'Comic + Video',kind:motion?'video':'comic',title:p.name,art:p.art??0,href:'/app/projects/'+p.id});
      });
    }catch{}
    const seen=new Set(out.map(c=>c.title.toLowerCase()));
    SHOWCASE.forEach(x=>{
      if(out.length>=8||seen.has(x.title.toLowerCase()))return;
      seen.add(x.title.toLowerCase());
      out.push({cat:x.cat,kind:x.kind,title:x.title,art:x.art,href:'/app/community'});
    });
    return out;
  }
  function assetCards(){
    let list=[];
    try{list=(S.state.assets||[]).slice(0,8);}catch{}
    return list.map(a=>({cat:a.type||'Asset',kind:(a.type||'asset').toLowerCase(),title:a.name,art:a.art??0,href:'/app/assets/'+a.id}));
  }
  function chapterCards(){
    const out=[];
    try{
      S.state.projects.filter(p=>!p.archived).forEach(p=>{
        [...(p.chapters||[]),...(p.episodes||[])].forEach(c=>{
          const status=String(c.status||'In Progress');
          out.push({
            cat:status,
            kind:status.toLowerCase().replace(/[^a-z]+/g,'-'),
            title:c.title||'Untitled chapter',
            art:p.art??0,
            href:'/app/create/'+p.id+'/'+c.id+'?stage=story&view=flow'
          });
        });
      });
    }catch{}
    return out;
  }
  function filtersFor(list){
    const kinds=[];
    list.forEach(c=>{if(c.kind&&!kinds.includes(c.kind))kinds.push(c.kind);});
    return [['all','All']].concat(kinds.slice(0,4).map(k=>[k,k.charAt(0).toUpperCase()+k.slice(1)]));
  }
  function tiles(list,current){
    const shown=list.filter(c=>current==='all'||c.kind===current);
    if(!shown.length)return '<p class="vx-strip-empty">Nothing in this category yet</p>';
    return shown.map(c=>`<a class="vx-tile" href="#${c.href}" data-vx-tile>
      <img src="${Art.url(c.art)}" alt="" loading="lazy">
      <span class="vx-tile-body"><span class="vx-tile-cat">${E(c.cat)}</span></span>
    </a>`).join('');
  }
  function section(scope,title,list,current){
    const chips=filtersFor(list).map(([k,label])=>
      `<button type="button" class="vx-filter" data-vx="car-filter" data-scope="${scope}" data-kind="${k}" aria-pressed="${current===k}">${label}</button>`).join('');
    return `<section class="vx-carousel" aria-labelledby="vx-${scope}-title">
      <div class="vx-carousel-head">
        <h2 id="vx-${scope}-title" class="vx-carousel-title">${title}</h2>
        <div class="vx-filters" role="group" aria-label="${title}">${chips}</div>
      </div>
      <div class="vx-strip" data-vx-strip="${scope}">${tiles(list,current)}</div>
    </section>`;
  }
  function worlds(){
    const list=worldCards();
    return section('worlds','Get to know your worlds',list,UI.carFilter);
  }
  function chapters(){
    const list=chapterCards();
    return section('chapters','Chapters you are working on',list,UI.chapterFilter);
  }
  function assets(){
    const list=assetCards();
    return section('assets','Everything your worlds are made of',list,UI.assetFilter);
  }

  function dash(){
    S.pageTitle='Creation Space';
    const ctx=activeProject();
    return `<div class="vx">
      ${band(ctx)}
      ${worlds()}${assets()}${chapters()}
    </div>`;
  }

  /* ---------- sidebar icons: one line set, page-scoped ---------- */
  const NAV_ICON={'/app':'grid','/app/projects':'box','/app/assets':'layers','/app/tasks':'task','/app/tools':'pencil','/app/exports':'out','/app/community':'gallery','/app/market':'market','/app/wallet':'coin','/app/settings':'gear'};
  function paintIcons(){
    S.$$('.cm-sidebar .cm-nav-item').forEach(a=>{
      const href=a.getAttribute('href')||'';
      const path=href.replace(/^#/,'').split('?')[0];
      const span=a.querySelector('span');
      if(!span||!path)return;
      let name=NAV_ICON[path];
      if(!name&&path==='/')name='link';
      if(!name)return;
      if(!span.querySelector('svg'))span.innerHTML=svg(name,17);
    });
    const walletArrow=S.$('.cm-sidebar .cm-wallet b');
    if(walletArrow)walletArrow.textContent='';
    const siteLink=S.$('.cm-sidebar .cm-site-link');
    if(siteLink&&!siteLink.querySelector('svg')){
      const label=siteLink.textContent.replace(/^[\u2197\u2192\u2190\s]+/,'').trim();
      siteLink.innerHTML='<span>'+svg('link',17)+'</span>'+label;
    }
  }

  function rerender(){
    const host=S.$('.vx');
    if(!host)return;
    host.outerHTML=dash();
    paintIcons();
  }

  document.addEventListener('click',ev=>{
    const el=ev.target.closest('[data-vx]');
    if(!el)return;
    if(el.dataset.vx==='refresh-credits'){
      const btn=el;btn.classList.add('is-spinning');
      const value=S.$('.cm-wallet-value');
      if(value&&M.db)value.textContent=M.db.wallet;
      setTimeout(()=>btn.classList.remove('is-spinning'),700);
      S.toast('Balance refreshed from this browser.');
      return;
    }
    if(el.dataset.vx==='car-filter'){
      const scope=['assets','chapters'].includes(el.dataset.scope)?el.dataset.scope:'worlds';
      const kind=el.dataset.kind;
      if(scope==='assets')UI.assetFilter=kind;else if(scope==='chapters')UI.chapterFilter=kind;else UI.carFilter=kind;
      S.$$('.vx-filter[data-scope="'+scope+'"]').forEach(btn=>btn.setAttribute('aria-pressed',btn.dataset.kind===kind));
      const strip=S.$('[data-vx-strip="'+scope+'"]');
      const list=scope==='assets'?assetCards():scope==='chapters'?chapterCards():worldCards();
      if(strip)strip.innerHTML=tiles(list,kind);
      return;
    }
    if(el.dataset.vx==='car-prev'){scrollStrip(-1);return;}
    if(el.dataset.vx==='car-next'){scrollStrip(1);return;}
    if(el.dataset.vx==='search')return;
  });
  document.addEventListener('keydown',ev=>{
    const input=ev.target.closest('[data-vx="search"]');
    if(input&&ev.key==='Enter'){ev.preventDefault();S.route('/app/projects');}
  });

  const prevAfter=C.afterRender;
  C.pages.home=dash;
  C.afterRender=context=>{
    prevAfter(context);
    if(context.path==='/app'){
      S.pageTitle='Creation Space';
      paintIcons();
    }
  };
})();
