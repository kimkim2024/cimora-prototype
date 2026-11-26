/* Two homepages: shared visuals and creative handoff. The website showcases works; the workspace puts continuing first. */
(()=>{
  const C=Cimora,{S,M,E,link,art,path}=C;
  const H={slide:0,collection:'all'};
  const films=[
    {title:'Letters to the Stars',en:'LETTERS TO THE STARS',tag:'Fantasy · Original World',type:'Comic',cover:'assets/work-02.jpg',id:'sky-public',line:'The one who delivers letters to the stars is still looking for home.',prompt:'A girl at the Star Sea Post Office receives a letter from the future, and must find its sender before sunset.',position:'center'},
    {title:'Before the Rain Ends',en:'BEFORE THE RAIN ENDS',tag:'Urban · A Gentle Reunion',type:'Comic / Video',cover:'assets/work-03.jpg',id:'rain-public',line:'An unsent letter, and a reunion seven years late.',prompt:'Back at the bookstore after seven years, a girl meets the one who has kept her letter all along.',position:'center'},
    {title:'The Last Train of Summer',en:'THE LAST TRAIN OF SUMMER',tag:'Youth · A Musical Journey',type:'Video Concept',cover:'assets/work-04.jpg',id:null,line:'Before summer ends, be brave one more time.',prompt:'A girl with a guitar catches the last summer train to play a seaside show with no audience.',position:'center'}
  ];
  const reel=[
    {title:'Fire in the New Year',en:'HAPPY NEW YEAR',tag:'Character Ensemble · Bold Palette',type:'Illustration',cover:'assets/hero-1.jpg',id:null,line:'A crowd bursts into the frame and sets the first scene of the new year on fire.',prompt:'Vivid characters crash into one New Year poster, promising to meet again.',position:'center 72%'},
    {title:'Within the Shattered Light',en:'SATURDAY, 22:20',tag:'Light & Shadow Illustration · Girl',type:'Comic / Video',cover:'assets/hero-2.jpg',id:null,line:'The wind turns her hair to scattered light as she gazes quietly into the distance.',prompt:'On the rooftop at dusk, she watches a distant light rise and decides not to look back tonight.',position:'center 38%'},
    {title:'Different, Together',en:'ART STYLE & CHARACTER DESIGN',tag:'Character Design · Art Style',type:'Comic / Video',cover:'assets/hero-3.jpg',id:null,line:'Every character is different, yet they share one world.',prompt:'Characters of very different temperaments are swept into one adventure, and no one wants to speak first.',position:'center 62%'}
  ];
  const N=reel.length,A={elapsed:0,last:null,interval:6000};
  const stages={story:'Story & Chapters',boards:'Storyboards & Sketches',assets:'Assets & Constraints',comic:'Comic Layout',motion:'Motion & Sound',audio:'Edit & Audio',review:'Review & Delivery'};
  const action=(text,key,cls='hm-button',extra='')=>`<button type="button" class="${cls}" data-home="${key}" ${extra}>${text}</button>`;
  const label=(no,title,desc='',tail='')=>`<div class="hm-section-heading"><div><span class="hm-eyebrow">${no}</span><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>${tail}</div>`;
  function inputState(scope){M.db.homeInputs??={};return M.db.homeInputs[scope]??={text:'',mode:'comic'};}
  function composer(scope){const d=inputState(scope);if(scope==='public'&&C.aiComposer)return C.aiComposer(scope,d);return `<form class="hm-composer ${scope}" data-home-form="start" data-scope="${scope}"><div class="hm-composer-modes" aria-label="Choose a Format">${[['comic','▤','Comic'],['motion','▷','Video'],['canvas','⌘','Infinite Canvas']].map(([k,ic,t])=>action(`<span>${ic}</span>${t}`,'mode','',`data-mode="${k}" aria-pressed="${d.mode===k}"`)).join('')}<span class="hm-composer-hint">Start with one line</span></div><label class="hm-sr" for="hm-idea-${scope}">Write down your story idea</label><textarea id="hm-idea-${scope}" name="idea" rows="2" maxlength="6000" placeholder="For example: a girl who mails letters to the stars gets a letter from her future self..." data-home-input="idea">${E(d.text)}</textarea><div class="hm-composer-bottom">${action('✧ Surprise Me','sample','hm-subtle')}${action('Drafts'+(M.db.draftBackups?.length?' · '+M.db.draftBackups.length:''),'drafts','hm-subtle')}<button class="hm-button primary" type="submit">Start Ideating <span>↗</span></button></div></form>`;}
  function slides(){return reel.map((f,i)=>`<article class="hm-card" data-i="${i}"><i class="hm-notch" aria-hidden="true"><svg viewBox="0 0 20 37.3338" preserveAspectRatio="none"><path d="M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z"/></svg></i><div class="hm-card-clip"><img src="${f.cover}" alt="${f.title} · Original anime-style artwork" style="object-position:${f.position}" draggable="false" ${i?'loading="lazy"':'fetchpriority="high"'}><div class="hm-film-shade"></div><div class="hm-film-caption"><span class="hm-film-tag">${f.tag} <i></i> ${f.type}</span><h2>${f.title}</h2><p>${f.line}</p><div>${action('View Artwork ↗','preview','hm-button glass',`data-film="${i}"`)}<small>Original concept art · Static preview</small></div></div><span class="hm-film-edition">${f.en} <b>0${i+1} / 0${N}</b></span></div></article>`).join('');}
  function gallery(){return `<section class="hm-gallery" aria-label="Cimora Featured works carousel" aria-roledescription="carousel" tabindex="0"><div class="hm-gallery-intro"><span class="hm-eyebrow">CIMORA · A HOME FOR YOUR IMAGINATION</span><h1>Turn the worlds you love, <em>into your own work.</em></h1><p>From a single spark, to a comic chapter, to a story that moves.</p></div><div class="hm-film-stage"><div id="hm-slides">${slides()}</div>${action('←','previous','hm-carousel-arrow left','aria-label="Previous work"')}${action('→','next','hm-carousel-arrow right','aria-label="Next work"')}</div><div class="hm-carousel-bottom"><span id="hm-film-announcement" aria-live="polite">01 — ${reel[H.slide].title}</span><div aria-label="Select featured work">${reel.map((f,i)=>action(`<span class="hm-sr">${f.title}</span>`,'slide','hm-dot',`data-index="${i}" aria-label="Switch to ${f.title}" aria-pressed="${H.slide===i}"`)).join('')}</div><span>Your story, up next.</span></div></section>`;}
  const capabilities=[
    ['Comic Creation','Let your story unfold, panel by panel.','comic',0,'▤'],['Video Creation','Give your visuals a little life.','motion',4,'▷'],['OC Character Sheet','Make every appearance feel familiar.','oc',1,'◎'],['Infinite Canvas','Ideas roam free, connections stay clear.','canvas',3,'⌘'],['Mini Tools','Start with a small idea.','tools',8,'✧']
  ];
  function capabilitiesSection(){return `<section class="room-demo" aria-label="Creation capabilities"><div class="cards">${capabilities.map(([title,description],i)=>{const image=i===0?'assets/comic-creation-square.png':i===1?'assets/video-creation.jpg':i===2?'assets/oc-dress-up.png':i===4?'assets/mini-tools-arcade.png':'assets/infinite-canvas.jpg';const tag=i===3?'a':'div';return `<${tag} class="card-frame"${i===3?' href="#/app/infinite-canvas" aria-label="Open Infinite Canvas"':''}><article class="direct-card" aria-label="${E(title)}"><div class="direct-card__artboard" id="capabilityArtboard${i}"><img class="direct-card__photo" src="${image}" data-night-src="${image}" alt="${i===0?'Comic illustration artwork':i===1?'Ronin film poster':i===2?'Character dress-up interface with outfit selection':i===4?'Retro pocket arcade artwork':'Colorful interface and dashboard collage'}"><div class="direct2-grade"></div><div class="direct-footer"><div class="direct-footer__head"><span class="direct-footer__icon" aria-hidden="true"><span class="material-icons">construction</span></span><h3 class="direct-footer__title">${E(title)}</h3></div><p class="direct-footer__desc">${E(description)}</p></div></div></article></${tag}>`;}).join('')}</div></section>`;}
  function processSection(){
    const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
    const start=`<span class="hm-journey-start-label">Start creating</span><span class="hm-journey-start-icon" aria-hidden="true">${arrow}${arrow}</span>`;
    return `<section class="hm-section hm-journey" id="hm-process" aria-labelledby="hm-journey-title">
      <header class="hm-journey-header" data-journey-reveal>
        <h2 id="hm-journey-title"><span><span>Every step of creating,</span></span><span><span>firmly in your hands.</span></span></h2>
        <div class="hm-journey-actions">${link(start,'/app/new','hm-journey-start')}</div>
      </header>
      <div class="hm-journey-grid">
        <article class="hm-journey-card" data-journey-reveal>
          <h3>Story Room</h3><p>Turn a single idea into a chapter.</p>
          <div class="hm-journey-window hm-journey-story">
            <div class="hm-journey-window-bar">Before the Rain Ends <span>Chapter 01</span></div>
            <div class="hm-journey-script">
              <h4>Reunion in the Rain</h4><p>Seven years later, Lin Xia returns to the old bookstore. The doorbell rings, and a familiar figure turns.</p>
              <blockquote>“I thought you’d never come back.”</blockquote>
            </div>
            <ol class="hm-journey-stages" aria-label="Writing stages"><li>Idea</li><li>Outline</li><li>Chapter</li></ol>
          </div>
        </article>
        <article class="hm-journey-card" data-journey-reveal>
          <h3>Storyboards &amp; Characters</h3><p>Plan each shot and pin the character’s look.</p>
          <div class="hm-journey-window">
            <div class="hm-journey-window-bar">Storyboard <span>Sketch v2</span></div>
            <div class="hm-journey-boards">
              ${[[0,'Bookshop'],[5,'Reunion'],[3,'Unsent letter']].map(([image,caption])=>`<figure>${art(image,caption)}<figcaption>${caption}</figcaption></figure>`).join('')}
            </div>
            <div class="hm-journey-character">${art(1,'Portrait of Lin Xia')}<strong>Lin Xia</strong><span>v2 · Locked</span></div>
          </div>
        </article>
        <article class="hm-journey-card" data-journey-reveal>
          <h3>Comic &amp; Motion</h3><p>Tell the same scene in panels or in motion.</p>
          <div class="hm-journey-window hm-journey-output">
            <div class="hm-journey-window-bar">Scene preview <div class="hm-journey-switch" role="group" aria-label="Preview format">
              ${action('Comic','journey-format','', 'data-format="comic" aria-pressed="true" aria-controls="hm-journey-comic"')}
              ${action('Video','journey-format','', 'data-format="video" aria-pressed="false" aria-controls="hm-journey-video"')}
            </div></div>
            <div id="hm-journey-comic" class="hm-journey-comic">
              <div>${art(0,'The bookstore on a rainy evening')}</div>
              <div>${art(5,'Lin Xia and Chen Xu meet in the rain')}<span>“I thought you’d never come back.”</span></div>
            </div>
            <div id="hm-journey-video" class="hm-journey-video" hidden>
              <div class="hm-journey-shot">${art(5,'Lin Xia and Chen Xu meet in the rain')}<span>Slow push-in</span></div>
              <div class="hm-journey-timeline" aria-label="Timeline, three shots">${[0,5,3].map(i=>`<span>${art(i,' ')}</span>`).join('')}</div>
            </div>
          </div>
        </article>
      </div>
    </section>`;
  }
  let journeyObserver;
  function mountProcess(){
    journeyObserver?.disconnect();
    const section=S.$('#hm-process');
    if(!section||!('IntersectionObserver' in window)||reduceMotion.matches)return;
    journeyObserver=new IntersectionObserver((entries,observer)=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    },{threshold:.12});
    section.querySelectorAll('[data-journey-reveal]:not(.is-in-view)').forEach(el=>journeyObserver.observe(el));
  }
  function showWorkflowPlaybackButton(button,mode){
    const label=mode==='replay'?'Replay scene':'Play scene';
    button.dataset.playback=mode;
    button.setAttribute('aria-label',label);
    button.title=label;
    button.hidden=false;
  }
  function playWorkflowFilm(compare){
    const video=compare.querySelector('video');
    const button=compare.querySelector('[data-home="workflow-replay"]');
    if(button===document.activeElement)compare.querySelector('input').focus({preventScroll:true});
    button.hidden=true;
    if(video.ended)video.currentTime=0;
    video.play().catch(()=>{
      if(compare.dataset.film==='true'&&video.paused){
        showWorkflowPlaybackButton(button,'play');
      }
    });
  }
  function updateWorkflowSlider(slider){
    const position=Number(slider.value);
    const compare=slider.closest('.hm-workflow-compare');
    const video=compare.querySelector('video');
    const wasFilm=compare.dataset.film==='true';
    const showFilm=position===0;
    compare.style.setProperty('--split',`${position}%`);
    compare.dataset.film=String(showFilm);
    compare.toggleAttribute('data-sheet-expanded',position>=97);
    slider.setAttribute('aria-valuetext',showFilm?'Finished scene':position===100?'Full character sheet':`${position}% character sheet, ${100-position}% finished scene`);
    if(showFilm&&!wasFilm){
      playWorkflowFilm(compare);
    }else if(!showFilm&&wasFilm){
      video.pause();
      video.currentTime=0;
      compare.querySelector('[data-home="workflow-replay"]').hidden=true;
    }
  }
  function engineeringSection(){
    return `<section class="hm-section hm-workflow" id="hm-workflow" aria-labelledby="hm-workflow-title">
      <div class="hm-workflow-copy">
        ${link('Open My Studio','/app','hm-button primary hm-workflow-cta')}
        <h2 id="hm-workflow-title">From character sheet to final shot.</h2>
        <p>See the same character go from front, side and back views to a finished scene.</p>
        <ul class="hm-workflow-highlights">
          <li><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="4.5"/><path d="M9 3v18m6-18v18"/></svg><div><strong>Define the look</strong><p>Capture the silhouette, outfit and props from three angles.</p></div></li>
          <li><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10.8 2.7a3.2 3.2 0 0 1 2.4 0l5.2 2A3.2 3.2 0 0 1 20.5 7.7v3.1c0 4.5-2.8 7.9-7.4 10.3a2.4 2.4 0 0 1-2.2 0c-4.6-2.4-7.4-5.8-7.4-10.3V7.7a3.2 3.2 0 0 1 2.1-3zM8.2 12.1l2 2a.8.8 0 0 0 1.2-.05l4.4-5"/></svg><div><strong>Keep details consistent</strong><p>Use the same character reference across shots.</p></div></li>
          <li><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M9.4 8.9q0-1 1-.5l5.1 2.9q1 .7 0 1.4l-5.1 2.9q-1 .5-1-.5z"/></svg><div><strong>Bring the scene to life</strong><p>Give the character movement, lighting and a setting.</p></div></li>
        </ul>
      </div>
      <figure class="hm-workflow-panel">
        <div class="hm-workflow-bar"><strong>Character to film DEMO</strong></div>
        <div class="hm-workflow-compare" data-film="false">
          <video class="hm-workflow-film" src="assets/spring-final-shot.mp4" poster="assets/spring-final-shot.webp" preload="metadata" muted playsinline aria-label="Spring in the finished animated scene"></video>
          <div class="hm-workflow-sheet">
            <img src="assets/spring-character-sheet.webp" alt="Front, side and back views of Spring in her coat and boots" loading="lazy" width="840" height="550">
            <div class="hm-workflow-view-labels" aria-hidden="true"><span>Front</span><span>Side</span><span>Back</span></div>
            <div class="hm-workflow-character-note"><strong>Spring</strong><p>A red coat, braided hair and a carved wooden staff.</p></div>
          </div>
          <div class="hm-workflow-divider" aria-hidden="true"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4m8-8 4 4-4 4"/></svg></span></div>
          <input class="hm-workflow-slider" type="range" min="0" max="100" value="80" aria-label="Reveal the finished scene" aria-valuetext="80% character sheet, 20% finished scene" aria-describedby="hm-workflow-instruction" data-home-input="workflow">
          ${action('<svg class="hm-workflow-replay-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10a7.5 7.5 0 1 1 .8 6M4.5 5v5h5"/></svg><svg class="hm-workflow-play-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>','workflow-replay','hm-workflow-replay','hidden data-playback="replay" aria-label="Replay scene" title="Replay scene"')}
        </div>
        <figcaption class="hm-workflow-caption">
          <p id="hm-workflow-instruction">Drag all the way left to play the scene, or press Home on the slider.</p>
          <p><a href="https://commons.wikimedia.org/wiki/File:Spring-concept_art-Spring.png">Character views by Julien Kaspar</a> · <a href="https://studio.blender.org/projects/spring/pages/about/">Spring © Blender Foundation</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Cropped character views and film stills · Muted excerpt</p>
        </figcaption>
      </figure>
    </section>`;
  }
  function workTile(f,i){return `<article class="hm-work-tile">${action(`<img src="${f.cover}" alt="${f.title}" loading="lazy" style="object-position:${f.position}"><span class="hm-work-kind">${f.type}</span>`,'work-preview','hm-work-art',`data-work="${i}" aria-label="Preview ${f.title}"`)}<div><h3>${f.title}</h3><p>${f.tag}<span>Original demo</span></p></div></article>`;}
  function storyTile(){return `<article class="hm-work-tile">${action('<img src="assets/work-01.jpg" alt="The Last Train Recording: story sample"><span class="hm-work-kind">Story</span>','read-story','hm-work-art','aria-label="Read the full story: The Last Train Recording"')}<div><h3>The Last Train Recording</h3><p>Mystery · A Late Reconciliation<span>Original complete short story</span></p></div></article>`;}
  function collection(){const shown=films.map((f,i)=>({f,i})).filter(({i})=>H.collection==='all'||H.collection==='comic'&&i<2||H.collection==='motion'&&i>0);return (['all','story'].includes(H.collection)?storyTile():'')+shown.map(({f,i})=>workTile(f,i)).join('');}
  function worksSection(app=false){
    const grid=`<div class="hm-work-grid" id="hm-collection">${collection()}</div>`;
    return `<section class="${app?'hm-workspace-section':'hm-section'}">${label(app?'Discover Inspiration':'03 / MADE OF IMAGINATION',app?'Find your inspiration':'Every story has its own light.','',link('Explore Community ↗','/app/community','hm-text-link'))}<div class="hm-collection-filters cm-segment-group" aria-label="Filter works">${[['all','Featured Works'],['story','Story'],['comic','Comic'],['motion','Video']].map(([k,t])=>action(t,'collection','',`data-filter="${k}" aria-pressed="${H.collection===k}"`)).join('')}</div>${app?`<div class="hm-slide-stage">${grid}</div>`:grid}</section>`;
  }
  const TPL_EN={'rain-layout':{title:'Rainy Day Letters · Breathing Webtoon',category:'Comic Layout',desc:'Generous white space and restrained dialogue leave every reunion room to linger.',author:'Misty Isle Studio'},'film-workflow':{title:'From One Chapter to a Motion Trailer',category:'Video',desc:'A complete recipe for storyboards, assets, key shots and review.',author:'Cimora Studio'},'oc-identity':{title:'OC Identity Sheet · Continuity Edition',category:'Character Assets',desc:'Give appearance, outfit, mood and story relationships something solid to rely on.',author:'Tsukimi Lab'}},TPL_TYPE={'模板':'Template','工作流':'Workflow','技能':'Skill'};
  const recipeSteps={'rain-layout':['Reference chapter panels','Apply spacious layouts','Check bubbles and reading order'],'film-workflow':['Identify characters and scenes','Plan shots and camera moves','Enhance key shots','Review and export a snapshot'],'oc-identity':['Define character identity','Save outfit and expression references','Pin versions to your project']};
  function courseTemplates(){return `<link rel="stylesheet" href="cimora-icon-cards.css"><section class="hm-section course-templates" aria-label="Creative recipes">${label('','Let a good method be your next starting point.','',link('Open Skills & Template Market','/app/market','hm-text-link'))}<div class="icon-card-grid">${C.catalog().filter(x=>['rain-layout','film-workflow','oc-identity'].includes(x.id)).map((raw,i)=>{const x={...raw,...TPL_EN[raw.id]},short=x.title.split('·')[0].trim();return `<article class="icon-card icon-${['green','orange','rose'][i]}">${action(`<span class="icon-card-tile"><span class="icon-card-label">${E(short)}</span></span><span class="icon-card-avatars" aria-hidden="true"><span class="icon-card-avatar"></span><span class="icon-card-avatar"></span><span class="icon-card-avatar"></span></span>`,'course-preview','icon-card-art',`data-id="${x.id}" aria-label="Preview ${E(x.title)}"`)}</article>`;}).join('')}</div></section>`;}
  document.addEventListener('click',ev=>{const b=ev.target.closest('[data-home="course-preview"]');if(!b)return;ev.preventDefault();const raw=C.catalog().find(x=>x.id===b.dataset.id);if(!raw)return;const x={...raw,...TPL_EN[raw.id]};S.modal('Recipe · '+x.title,`<div class="hm-template-modal">${art(x.art,x.title)}<p>${E(x.desc)}</p><ol>${recipeSteps[x.id].map(t=>`<li>${E(t)}</li>`).join('')}</ol><small>${x.price} credits · Simulated resource license; later model costs are billed separately.</small></div>`,link('View License & Usage','/app/market/'+x.id,'hm-button primary'));});
  function templatesSection(app=false){if(!app)return courseTemplates();return `<section class="${app?'hm-workspace-section':'hm-section'}">${label(app?'Recipes':'04 / A GOOD PLACE TO START','Start with a template, make it your own','',link('Open Skills & Template Market ↗','/app/market','hm-text-link'))}<div class="hm-template-grid">${C.catalog().filter(x=>['rain-layout','film-workflow','oc-identity'].includes(x.id)).map((x0,i)=>{const x={...x0,...(app?{}:TPL_EN[x0.id]),type:app?x0.type:(TPL_TYPE[x0.type]||x0.type)};return `<article class="hm-template-card">${action(`${art(x.art,x.title)}<span>${x.type}</span><b>Preview Recipe ↗</b>`,'template','hm-template-art',`data-id="${x.id}" aria-label="Preview ${E(x.title)}"`)}<div><small>${E(x.category)} / ${E(x.author)}</small><h3>${E(x.title)}</h3><p>${E(x.desc)}</p><footer><span>✦ ${x.price} credits</span></footer></div></article>`}).join('')}</div></section>`;}
  function official(){S.pageTitle='Turn the worlds you love into your own work';return `<main class="hm-home hm-official"><div class="hm-hero-vignette">${gallery()}<div class="hm-public-launch">${composer('public')}</div><div class="hm-main-width">${capabilitiesSection()}</div><div class="hm-main-width">${processSection()}${engineeringSection()}${worksSection()}${templatesSection()}<section class="hm-final-cta"><span class="hm-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><div class="hm-final-poster"><h2 class="hm-final-banner"><span class="hm-sr">The next work you love starts with you.</span><img src="assets/cta-banner.png" alt="" aria-hidden="true"></h2><span class="hm-final-poster-action">${link('Enter Studio ↗','/app','hm-button primary large')}</span></div><p>Co-write stories · Unified assets · Infinite Canvas · Motion</p></section></div></div></main>`;}
  function projectContexts(){return S.state.projects.filter(p=>!p.archived).map(p=>M.resume(p)).sort((a,b)=>(b.p.lastOpenedAt||'').localeCompare(a.p.lastOpenedAt||''));}
  function projectCard(c){const {p,e}=c,url=M.navigation?.resume(c)||path(c,e.stage,e.view),failed=e.graph.nodes.filter(n=>n.status==='failed').length,stale=e.graph.nodes.filter(n=>n.status==='stale').length,done=e.graph.nodes.filter(n=>n.status==='done').length,total=e.graph.nodes.length;return `<article class="hm-resume-card"><a href="#${url}" class="hm-resume-art">${art(p.art,p.name)}<span>${M.output(p)==='comic'?'Comic':M.output(p)==='motion'?'Video':'Comic + Video'}</span><b>Continue Creating ↗</b></a><div><h3>${link(E(p.name),url,'')}</h3><p>${E(c.c.title)} <i>·</i> ${E(M.navigation?.task(c)||stages[e.stage]||'Story & Chapters')}</p><footer><small class="${failed?'error':stale?'warning':''}">${E(M.navigation?.status(c)||(failed?failed+'  steps to recover':stale?stale+'  sources updated':done+'/'+total+'  steps ready'))}</small>${link('Project Details',`/app/projects/${p.id}`,'hm-text-link')}</footer></div></article>`;}
  function projectList(query=''){const q=query.toLowerCase();return projectContexts().map(c=>{if(!q||c.p.name.toLowerCase().includes(q)||c.c.title.toLowerCase().includes(q))return c;const chapter=[...c.p.chapters,...(c.p.episodes||[])].find(ch=>ch.title.toLowerCase().includes(q));return chapter?M.context(c.p.id,chapter.id):null;}).filter(Boolean).slice(0,3).map(projectCard).join('')||`<div class="hm-home-empty"><span>✧</span><h3>${query?'Story not found':'Your next world starts here.'}</h3><p>${query?'Try a project or chapter name.':'Write a line of inspiration, or browse works and recipes first.'}</p>${query?'':link('Start Your First Story ↗','/app/new','hm-button secondary')}</div>`;}
  function taskGroups(){const groups={running:[],failed:[],stale:[],candidate:[]};for(const p of S.state.projects.filter(p=>!p.archived))for(const c of [...p.chapters,...(p.episodes||[])]){const e=M.ensure(p,c);for(const [k,pred]of Object.entries({running:n=>n.status==='running'||n.status==='queued'&&['running','paused'].includes(e.run?.status),failed:n=>n.status==='failed',stale:n=>n.status==='stale',candidate:n=>n.status==='done'&&n.version>n.adopted})){const nodes=k==='stale'&&M.adaptation?M.adaptation.sourceItems({p,c,e}):e.graph.nodes.filter(pred);if(nodes.length)groups[k].push({p,c,e,nodes});}}return groups;}
  function tasks(){const groups=taskGroups();return `<aside class="hm-tasks"><div class="hm-tasks-heading"><span>Studio Activity</span>${link('All →','/app/tasks','hm-text-link')}</div>${[['running','◷','Queued','#b9a5ef'],['failed','↶','Failed, Awaiting Recovery','#eea8b4'],['stale','◈','Source items (shots/steps)','#e8c18e'],['candidate','✦','Candidates to Adopt','#9ecab9']].map(([k,ic,t,color])=>action(`<span class="hm-task-icon" style="color:${color}">${ic}</span><span>${t}</span><b>${groups[k].reduce((n,g)=>n+g.nodes.length,0)}</b><i>↗</i>`,'tasks','hm-task-row',`data-kind="${k}"`)).join('')}<div class="hm-tasks-note"><i></i> Counts come from your projects and chapters<br><span>Generation tasks and costs are simulated in this local demo</span></div></aside>`;}
  function tools(){
    const shortcuts=[['image-motion','Image to Motion','Animate a still image.'],['video-redraw','Video Restyle','Try a new art direction for a clip.'],['keyframes','Keyframe Animation','Set the opening and closing frames.']];
    return `<section class="hm-workspace-section">${label('Tools','Add a little spark','',link('All Tools ↗','/app/tools','hm-text-link'))}<div class="hm-tool-grid">${shortcuts.map(([id,title,desc],i)=>link(`<div>${art([4,8,3][i],title)}<span>✧</span></div><h3>${title}<b>↗</b></h3><p>${desc}</p>`,'/app/video-tool?tool='+id,'hm-tool-card')).join('')}</div></section>`;
  }
  const creationTypes={script:{name:'Story Creation',title:'Grow one spark into a great story.',desc:'Start from a spark or existing text, then refine characters and plot.',route:'/app/script?intent=new',cta:'Start a New Story',steps:'Ideas & Text / Story & Characters / Episodes & Scenes'},comic:{name:'Comic Creation',title:'Bring the world of your story into the panel.',desc:'Arrange characters, storyboards, and dialogue to bring the story into panels.',route:'/app/comic?intent=new',cta:'Enter Comic Creation',steps:'Story & Assets / Scenes & Script / Comic & Layout'},video:{name:'Video Creation',title:'Let the scene you imagined start to move.',desc:'Arrange shots, visuals, and sound to set the story in motion.',route:'/app/video?intent=new',cta:'Enter Video Creation',steps:'Story & Scenes / Shots & Visuals / Motion & Editing'}};
  let creationTab='video'; // The homepage defaults to Video on every load and ignores old tab preferences.
  function recentCreation(){try{const kind=creationTab==='script'?'story':creationTab,index=window.StudioLibrary?.load();if(!index)return '';const project=index.projects.filter(p=>p.kind===kind&&['active','archived'].includes(p.state)).sort((a,b)=>String(b.raw.workspaceVisitedAt||b.raw.lastOpenedAt||b.updated||'').localeCompare(String(a.raw.workspaceVisitedAt||a.raw.lastOpenedAt||a.updated||'')))[0];return project?link('Continue recent '+kind+': '+E(project.title),window.StudioProjects?.resume(project)||project.url,'hm-text-link'):'';}catch{return '';}}
  function creationPanel(){const x=creationTypes[creationTab];return `<div class="hm-create-copy"><h2>${x.title}</h2><p>${x.desc}</p><small>${x.steps}</small><div class="hm-create-actions">${link(x.cta+' →',x.route,'cm-button primary')}</div><div class="hm-create-recent">${recentCreation()}</div></div><div class="hm-create-art" aria-hidden="true"><img src="assets/cimora-cover.webp" alt=""></div>`;}
  function creationTabs(){
    const options=['video','comic','script'].map(value=>({value,label:creationTypes[value].name}));
    return CimoraSegmentedControl.render({id:'hm-type',label:'Creation type',options,value:creationTab,panelId:'hm-create-panel'});
  }
  const slidesInProgress=new WeakMap();
  function slideContent(panel,markup,direction){
    const stage=panel.parentElement;
    if(!stage.classList.contains('hm-slide-stage')||reduceMotion.matches||!panel.animate){
      slidesInProgress.get(stage)?.();
      panel.innerHTML=markup;
      return;
    }
    const startHeight=stage.getBoundingClientRect().height;
    const oldPosition=getComputedStyle(panel).transform;
    slidesInProgress.get(stage)?.();
    const outgoing=panel.cloneNode(true);
    outgoing.removeAttribute('id');
    outgoing.classList.add('hm-slide-leaving');
    outgoing.setAttribute('aria-hidden','true');
    outgoing.inert=true;
    outgoing.style.height=`${panel.offsetHeight}px`;
    panel.innerHTML=markup;
    const endHeight=stage.getBoundingClientRect().height;
    stage.append(outgoing);
    stage.classList.add('hm-sliding');
    const timing={duration:500,easing:'ease-in-out'};
    const animations=[
      outgoing.animate([{transform:oldPosition},{transform:`translateX(${-direction*100}%)`}],timing),
      panel.animate([{transform:`translateX(${direction*100}%)`},{transform:'none'}],timing)
    ];
    if(startHeight!==endHeight)animations.push(stage.animate([{height:`${startHeight}px`},{height:`${endHeight}px`}],timing));
    const finish=()=>{
      if(slidesInProgress.get(stage)!==finish)return;
      slidesInProgress.delete(stage);
      for(const animation of animations)animation.cancel();
      outgoing.remove();
      stage.classList.remove('hm-sliding');
    };
    slidesInProgress.set(stage,finish);
    Promise.allSettled(animations.map(animation=>animation.finished)).then(finish);
  }
  document.addEventListener('segment-change',event=>{
    if(event.target.id!=='hm-type')return;
    const next=event.detail.value;
    const options=Array.from(event.target.children,button=>button.value);
    const direction=options.indexOf(next)>options.indexOf(creationTab)?1:-1;
    creationTab=next;
    slideContent(document.getElementById('hm-create-panel'),creationPanel(),direction);
  });
  function workspace(){return `<div class="hm-home hm-workspace"><section class="hm-create-hub" aria-label="Creation Entry"><div class="hm-create-heading"><span class="hm-eyebrow">My Creative Universe</span><h1>Turn imagination into your work.</h1><p>Pick a format and start creating.</p></div>${creationTabs()}<div class="hm-slide-stage"><div class="hm-create-panel" id="hm-create-panel" role="tabpanel" aria-labelledby="hm-type-${creationTab}">${creationPanel()}</div></div><div class="hm-create-secondary">${link('Continue Existing Work ↗','/app/projects','hm-text-link')}${action('Story Drafts','drafts','hm-text-link')}</div></section>${worksSection(true)}${templatesSection(true)}<div class="hm-workspace-bottom">${tools()}<div class="hm-workspace-footer"><span>cimora</span> Keep a place for every world you imagine.${link('Visit Website ↗','/','hm-text-link')}</div></div></div>`;}
  function showFilm(index){const f=reel[index];S.modal(f.title+' · Artwork',`<div class="hm-preview-modal"><img src="${f.cover}" alt="${f.title}"><span class="hm-eyebrow">${f.en}</span><h3>${f.line}</h3><p>${f.tag} · Original concept art. This is a static preview, not a live-generated video.</p></div>`,(f.id?link('Read Showcase Story →','/app/community/'+f.id,'hm-button secondary'):'')+action('Start with This Idea ↗','use-film','hm-button primary',`data-film="${index}"`),true);}
  function showWork(index){const f=films[index];if(!f)return;S.modal(f.title+' · Artwork',`<div class="hm-preview-modal"><img src="${f.cover}" alt="${f.title}"><span class="hm-eyebrow">${f.en}</span><h3>${f.line}</h3><p>${f.tag} · ${f.type} · Static preview of demo artwork.</p></div>`,f.id?link('Read Showcase Story →','/app/community/'+f.id,'hm-button secondary'):'');}
  function launch(v){const result=M.startFromHome(v);if(result==='empty'){S.toast('Write a line of story first, or click “Surprise Me”.');return;}if(result==='draft-exists'){H.pending=v;const d=M.db.newDraft;S.modal('A story is waiting for you',`<p class="hm-draft-intro">Your current draft is kept. Continue it, or save it to Drafts and start a new idea.</p><div class="hm-draft-summary"><strong>${E(d.name||'Untitled Story')}</strong><p>${E((d.text||d.candidate||'').slice(0,180))}</p></div>`,action('Continue Draft','resume-draft','hm-button secondary')+action('Back Up Draft, Start New Idea','replace-draft','hm-button primary'));return;}S.close();S.route('/app/new');}
  function drafts(){const current=M.db.newDraft,has=current&&(current.name||current.text||current.candidate),backups=M.db.draftBackups||[];S.modal('Story Drafts',`<p class="hm-draft-intro">Restoring a backup automatically backs up the current draft. Continue created projects in “My Projects”.</p>${has?`<div class="hm-draft-summary"><span class="hm-eyebrow">In Progress</span><strong>${E(current.name||'Untitled Story')}</strong><p>${E((current.text||current.candidate||'').slice(0,150))}</p>${action('Continue Current Draft →','resume-draft','hm-button secondary')}</div>`:''}${backups.map((b,i)=>`<div class="hm-draft-summary"><span class="hm-eyebrow">${E(new Date(b.time).toLocaleString('zh-CN'))} · Auto backup</span><strong>${E(b.draft.name||'Untitled Story')}</strong><p>${E((b.draft.text||b.draft.candidate||'').slice(0,150))}</p>${action('Restore This Draft →','restore-draft','hm-button secondary',`data-index="${i}"`)}</div>`).join('')}${!has&&!backups.length?'<div class="hm-home-empty"><span>✧</span><h3>No ideas on paper yet.</h3><p>Write one line to begin your first draft.</p></div>':''}`);}
  function geo(off,W,Hs){const aw=Math.min(W>=1550?1100:1000,W-(W<=600?40:W<=800?80:W<=1100?120:160)),gap=W<=800?10:18,side=(W-aw)/2;if(!off)return{x:side,w:aw,h:Hs,o:1,z:1,aw};const s=Math.sign(off),w1=Math.min(W>=1100?260:150,Math.max(0,side-gap)),h1=Hs*.84,w2=Math.min(160,w1*.62),h2=Hs*.6;if(Math.abs(off)===1)return{x:s<0?side-gap-w1:side+aw+gap,w:w1,h:h1,o:w1>=24?1:0,z:2,aw};const room=side-gap-w1-gap,w=Math.max(0,Math.min(w2,room));return{x:s<0?side-gap-w1-gap-w:side+aw+gap+w1+gap,w:w||w2,h:h2,o:w>=30?1:0,z:2,aw};}
  function layout(force){const st=S.$('#hm-slides');if(!st)return false;const box=st.parentElement,W=box.clientWidth,Hs=box.clientHeight,sig=W+'x'+Hs+':'+H.slide;if(!force&&st.dataset.sig===sig)return true;if(!W||!Hs)return true;if(!st.children.length)st.innerHTML=slides();st.dataset.sig=sig;const half=Math.floor(N/2);[...st.children].forEach(el=>{const i=+el.dataset.i,off=((i-H.slide+N+half)%N)-half,g=geo(off,W,Hs),jump=el._off===undefined||Math.abs(off-el._off)>(N<4?1:2);el._off=off;if(jump)el.style.transition='none';Object.assign(el.style,{left:g.x+'px',top:(Hs-g.h)/2+'px',width:g.w+'px',height:g.h+'px',opacity:g.o,zIndex:g.z,pointerEvents:g.o?'auto':'none'});el.dataset.off=off;el.setAttribute('aria-hidden',off!==0);if(off){el.dataset.home='slide';el.dataset.index=i;el.setAttribute('role','button');el.setAttribute('aria-label','Switch to '+reel[i].title);}else{delete el.dataset.home;delete el.dataset.index;el.removeAttribute('role');el.removeAttribute('aria-label');}el.querySelectorAll('button').forEach(b=>b.tabIndex=off?-1:0);if(jump){void el.offsetWidth;el.style.transition='';}});box.style.setProperty('--aw',geo(0,W,Hs).aw+'px');return true;}
  function syncGallery(){S.$$('.hm-dot').forEach((b,i)=>{b.setAttribute('aria-pressed',H.slide===i);if(H.slide!==i)b.style.removeProperty('--p');});const a=S.$('#hm-film-announcement');if(a)a.textContent='0'+(H.slide+1)+' — '+reel[H.slide].title;}
  function goSlide(n){H.slide=((n%N)+N)%N;A.elapsed=0;A.last=null;layout();syncGallery();}
  function repaintGallery(){goSlide(H.slide);}
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function galleryTick(ts){requestAnimationFrame(galleryTick);if(!S.$('#hm-slides'))return A.last=null;layout();if(document.hidden||reduceMotion.matches||S.$('.modal,[role=dialog]')&&S.$('.modal,[role=dialog]').offsetParent){A.last=null;return;}if(A.last===null)A.last=ts;A.elapsed+=ts-A.last;A.last=ts;if(A.elapsed>=A.interval)return goSlide(H.slide+1);const d=S.$('.hm-dot[aria-pressed=true]');if(d)d.style.setProperty('--p',(A.elapsed/A.interval*100).toFixed(1));}
  requestAnimationFrame(galleryTick);
  document.addEventListener('click',ev=>{const el=ev.target.closest('[data-home]');if(!el)return;ev.preventDefault();switch(el.dataset.home){
    case'read-story':{S.modal('The Last Train Recording · Full Story',`<article class="hm-story-reader"><p class="hm-eyebrow">Original sample · Mystery / Friendship</p>${ScriptSample.story.split(/\n\s*\n/).map(t=>'<p>'+E(t)+'</p>').join('')}<footer>— The End —</footer></article>`,'',true);break;}
    case'previous':case'next':goSlide(H.slide+(el.dataset.home==='next'?1:-1));break;
    case'slide':goSlide(+el.dataset.index);break;
    case'preview':showFilm(+el.dataset.film);break;
    case'work-preview':showWork(+el.dataset.work);break;
    case'use-film':{const scope=S.context.path==='/app'?'app':'public',d=inputState(scope);launch({text:reel[+el.dataset.film].prompt,output:d.mode==='motion'?'motion':'comic',view:d.mode==='canvas'?'canvas':'flow'});break;}
    case'mode':{const f=el.closest('form'),d=inputState(f.dataset.scope);d.mode=el.dataset.mode;M.save();f.querySelectorAll('[data-home="mode"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===d.mode));break;}
    case'sample':{const f=el.closest('form'),d=inputState(f.dataset.scope);d.sample=((d.sample??-1)+1)%films.length;d.text=films[d.sample].prompt;f.querySelector('textarea').value=d.text;M.save();break;}
    case'resume-draft':S.close();S.route('/app/new');break;
    case'drafts':drafts();break;
    case'restore-draft':if(M.restoreHomeDraft(+el.dataset.index)){S.toast('Backup not found. Please reopen Drafts.');break;}S.close();S.route('/app/new');S.toast('Draft restored; the previous draft was backed up automatically.');break;
    case'replace-draft':M.startFromHome(H.pending,true);H.pending=null;S.close();S.route('/app/new');break;
    case'journey-format':{
      const card=el.closest('.hm-journey-output');
      const video=el.dataset.format==='video';
      card.querySelectorAll('[data-home="journey-format"]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));
      card.querySelector('#hm-journey-comic').hidden=video;
      card.querySelector('#hm-journey-video').hidden=!video;
      break;
    }
    case'workflow-replay':playWorkflowFilm(el.closest('.hm-workflow-compare'));break;
    case'collection':{
      const next=el.dataset.filter;
      if(H.collection===next)break;
      const buttons=Array.from(el.parentElement.querySelectorAll('button'));
      const previous=buttons.findIndex(button=>button.dataset.filter===H.collection);
      const direction=buttons.indexOf(el)>previous?1:-1;
      H.collection=next;
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button===el)));
      slideContent(S.$('#hm-collection'),collection(),direction);
      break;
    }
    case'template':{const x=C.catalog().find(t=>t.id===el.dataset.id);S.modal('Recipes · '+x.title,`<div class="hm-template-modal">${art(x.art,x.title)}<p>${E(x.desc)}</p><ol>${x.steps.map(t=>`<li>${E(t)}</li>`).join('')}</ol><small>✦ ${x.price} credits · Simulated resource license; later model costs are billed separately.</small></div>`,link('View License & Usage →','/app/market/'+x.id,'hm-button primary'));break;}
    case'tasks':{const k=el.dataset.kind,title={running:'Queued tasks',failed:'Failed, Awaiting Recovery',stale:'Pending source items · shots/steps',candidate:'Candidates to Adopt'}[k],groups=taskGroups()[k];S.modal(title,groups.map(g=>`<div class="hm-task-detail"><div><strong>${E(g.p.name)} / ${E(g.c.title)}</strong><p>${g.nodes.filter(n=>!n.sourceDifference).map(n=>E(n.title)).join('、')}</p>${g.nodes.filter(n=>n.sourceDifference).map(n=>`<p>${link(E(n.title)+' · Compare →',path(g,'boards','flow')+'&shot='+n.shotId+'&compare=1','hm-button secondary')}</p>`).join('')}</div>${g.nodes.some(n=>!n.sourceDifference)?link(k==='candidate'?'Confirm Candidate →':'View Project →',k==='candidate'?path(g,'review','flow'):k==='stale'?path(g,g.e.stage,'canvas'):`/app/runs/${g.p.id}/${g.c.id}`,'hm-button secondary'):''}</div>`).join('')||'<div class="hm-home-empty"><span>✓</span><h3>Nothing pending here for now.</h3><p>Keep creating; project status will sync here.</p></div>');break;}
  }});
  document.addEventListener('ended',ev=>{
    if(!ev.target.matches('.hm-workflow-film'))return;
    const compare=ev.target.closest('.hm-workflow-compare');
    if(compare.dataset.film!=='true')return;
    const button=compare.querySelector('[data-home="workflow-replay"]');
    showWorkflowPlaybackButton(button,'replay');
  },true);
  document.addEventListener('input',ev=>{const el=ev.target;if(el.dataset.homeInput==='idea'){inputState(el.closest('form').dataset.scope).text=el.value;M.save();}if(el.dataset.homeInput==='workflow')updateWorkflowSlider(el);if(el.dataset.homeInput==='project-search')S.$('#hm-home-projects').innerHTML=projectList(el.value.trim());});
  document.addEventListener('submit',ev=>{const f=ev.target.closest('[data-home-form="start"]');if(!f)return;ev.preventDefault();const d=inputState(f.dataset.scope);launch({text:f.querySelector('textarea').value,output:d.mode==='motion'?'motion':'comic',view:d.mode==='canvas'?'canvas':'flow'});});
  document.addEventListener('keydown',ev=>{if(!ev.target.closest('.hm-gallery')||!['ArrowLeft','ArrowRight'].includes(ev.key))return;ev.preventDefault();goSlide(H.slide+(ev.key==='ArrowRight'?1:-1));});
  C.pages.home=workspace;C.workspaceHome=workspace;C.publicHome=official;C.home={projectList,taskGroups,mountProcess};
})();
