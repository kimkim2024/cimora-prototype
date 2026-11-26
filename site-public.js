(()=>{
const S=Site,D=FrameData,{esc,art,link,button,sectionHead,faq,crumbs}=S;
const toolCard=t=>link(`<div class="tool-card-top"><span class="tool-icon">${t.icon}</span><span class="micro-tag">${t.stage==='P2'?'Advanced demo':'Try the demo'} ↗</span></div><h3>${t.title}</h3><p>${t.desc}</p><div class="tool-card-foot">${t.group}<span>Open Tool →</span></div>`,'/tools/'+t.id,'tool-card');
const caseCard=c=>link(`<div class="case-picture">${art(c.art,c.title)}<span class="play-circle">▷</span><span class="picture-label">${c.seconds}s · Video Showcase</span></div><div class="case-copy"><span class="eyebrow">${c.tag} / ORIGINAL STORY</span><h3>${c.title} <span>↗</span></h3><p>${c.subtitle}</p></div>`,'/showcase/'+c.id,'case-card');
const templateCard=t=>link(`<div class="template-picture">${art(t.art,t.title)}<span>${t.type}Templates</span></div><div class="case-copy"><h3>${t.title}</h3><p>${t.desc}</p></div>`,'/templates/'+t.id,'case-card');
const articleCard=a=>link(`<div class="article-picture">${art(a.art,a.title)}</div><div class="case-copy"><span class="eyebrow">${a.category} · ${a.time}</span><h3>${a.title}</h3><p>Clear steps for your next creation. →</p></div>`,'/resources/'+a.id,'case-card');
const cta=()=>`<section class="closing-cta"><h2>What happens in the next panel?</h2><p>Bring your characters and story. Start here.</p><div class="button-row">${link('Start a New Story ↗','/app/new','button primary')}${link('Try Free Tools First','/tools','button ghost')}</div></section>`;
function home(){S.pageTitle='Let your story break out of the frame';return `<main><section class="home-hero"><div class="hero-grid-lines"></div><div class="hero-copy"><span class="hero-label"><b></b> FOR YOUR NEXT CHAPTER</span><h1>Let your story<br><em>break out of the frame.</em></h1><div class="button-row">${link('Start Creating <span>↗</span>','/app/new','button primary large')}${link('▷ Explore Showcase','/showcase/rain','button ghost large')}</div><div class="hero-note"><span>One character</span><i>·</i><span>Every panel editable</span><i>·</i><span>Your work stays with you</span></div></div><div class="hero-art"><div class="hero-floating-note"><span>CHAPTER 01</span><strong>Some reunions are where a story begins again.</strong><small>Before the Rain Ends / Original demo</small></div><div class="hero-panel panel-back">${art(0,'Old bookstore in the rain')}<span>01 / THE SETTING</span></div><div class="hero-panel panel-front">${art(1,'Lin Xia reunites in the rain')}<div class="hero-dialogue">Seven years.<br>Do you still remember me?</div><span>02 / A FAMILIAR FACE</span></div><div class="hero-panel panel-side">${art(2,'Chen Xu at the bookstore')}<span>03 / THE REUNION</span></div><div class="hero-motion-pill"><span>▷</span><div>From comic to video<small>Characters and style, consistent all the way</small></div><b>↗</b></div></div></section><div class="manifesto-strip"><span>Designed for indie creators and small studios</span><b>WEBTOON</b><i>+</i><b>MOTION COMIC</b><i>+</i><b>YOUR ORIGINAL WORLD</b></div><section class="section wrap">${sectionHead('ONE STORY, MANY POSSIBILITIES','Every story has its own way in.','Bring an idea, or a world you have already drawn.')}<div class="entry-grid">${D.sources.map((x,i)=>link(`<span class="entry-no">0${i+1}</span><span class="entry-icon">${x.icon}</span><h3>${x.title}</h3><p>${x.desc}</p><span class="entry-arrow">Start →</span>`,'/app/new?source='+x.id,'entry-card')).join('')}</div></section><section class="section story-section wrap"><div>${sectionHead('CREATE ONCE. KEEP CREATING.','One world,<br>every way to tell it.','Characters, scenes, style and sound stay connected. Edit one panel and only the affected parts are redone.')}<div class="story-feature-list">${[['01','Tell the story first','Turn ideas, novels or stories into storyboards by chapter, confirmed by you.'],['02','Make every panel feel like yours','Lock characters and style, and keep the frames you love with local edits.'],['03','Let emotion flow','Steady camera moves carry the story, and you choose which key actions to enhance.']].map(([n,t,d])=>`<div><span>${n}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div>${link('Explore the all-in-one workflow ↗','/product','text-link')}</div><div class="story-demo"><div class="demo-toolbar"><span><b></b> Before the Rain Ends / Unified assets</span><small>STORY WORKSPACE</small></div><div class="demo-art">${art(6,'Lin Xia and Chen Xu share an umbrella')}<span class="demo-tag">Character identity locked ✓</span><span class="demo-subtitle">This time, let’s go together.</span></div><div class="demo-assets">${[1,2,0].map((v,i)=>`<div>${art(v)}<span>${['Lin Xia v2','Chen Xu v1','Bookstore v1'][i]}</span><b>✓</b></div>`).join('')}</div><div class="demo-timeline">${[0,1,2,3,6,7,8].map(v=>art(v)).join('')}</div></div></section><section class="section tools-home"><div class="wrap">${sectionHead('SMALL TOOLS, BIG IDEAS','Find your creative feel with one small tool.','Try the demos without logging in. Bring the results you like straight into your project.',link('Explore all 14 tools ↗','/tools','text-link'))}<div class="tool-grid">${D.tools.slice(0,4).map(toolCard).join('')}</div></div></section><section class="section wrap">${sectionHead('STORIES IN THE MAKING','See what a story can grow into.','These are original sample projects that show the creation and delivery flow.',link('View All Showcase ↗','/showcase','text-link'))}<div class="case-grid">${D.cases.map(caseCard).join('')}</div></section><section class="section principles wrap"><div><span>◎</span><h3>Characters are the anchor of your story.</h3><p>Asset versions stay with the project, so every connection between frames stays clear.</p></div><div><span>↶</span><h3>Good creation leaves room.</h3><p>Candidates are only used when you choose them, and every parameter change leaves a trace.</p></div><div><span>◒</span><h3>No guessing the cost.</h3><p>Check the estimated usage before enhancing, and keep a stable draft you can deliver.</p></div></section><section class="section faq-section wrap">${sectionHead('A FEW THINGS TO KNOW','Before you start, you may want to know.')}${faq()}</section>${cta()}</main>`;}
const features={story:{title:'A story that holds up before anyone draws it.',desc:'Start from one line, a pasted draft or an existing novel. Confirm the premise, the cast and the episode plan before a single panel exists.',art:3,tag:'STORY CREATION',source:'idea',steps:['Write or paste the first idea','Confirm premise, cast and episode plan','Draft each episode with what is already locked','Carry the approved episode into comic or video'],points:['One line is enough to start; the premise grows while you write.','The episode plan, cast and props stay editable while the text grows.','Every chapter keeps its own draft, so a rewrite never breaks earlier ones.','An approved episode can start a comic or a video without retyping anything.']},webtoon:{title:'Your story deserves to be drawn panel by panel.',desc:'From ideas and novels to full stories: confirm the narrative first, then bring characters into the frame.',art:1,tag:'WEBTOON CREATION',source:'idea',steps:['Organize standard chapter content','Confirm characters, scenes and style','Generate panel by panel and fix locally','Arrange reading rhythm and export'],points:['Characters and outfits share versions, so continuous frames stay consistent.','Speech bubbles, narration and sound effects are edited separately from the art.','No need to regenerate a satisfying frame for one expression.']},'motion-comic':{title:'Not just moving images: give emotion a rhythm.',desc:'Camera moves, dialogue, subtitles and limited animation form a stable draft. Key actions are left to the enhanced candidates you pick.',art:6,tag:'MOTION COMIC PRODUCTION',source:'comic',steps:['Import or reuse comic panels','Plan shot length and camera moves','Compare key-action enhancement candidates','Check audio, visuals and subtitles, then approve export'],points:['Stable animation is never overwritten by enhancements, and failures can still be delivered.','Edit shot by shot, with every parameter and adoption recorded.','After a comic edit, confirm the affected shots and sync them locally.']},studio:{title:'A studio’s world should remember every detail.',desc:'Projects, assets, versions, quality and budget in one place. Make continuous production clearer.',art:0,tag:'STUDIO WORKFLOW',source:'script',steps:['Build a shared Asset Library','Schedule tasks by chapter','Review version differences one by one','Confirm costs and delivery versions'],points:['See at a glance where characters, props and outfits are used.','Failed tasks can be located and retried without redoing the whole chapter.','Team comments and approvals are an advanced interaction demo; real services will be built in phases.']}};
function feature(id){const f=features[id];if(!f)return notFound();S.pageTitle=['webtoon','story','motion-comic','studio'].includes(id)?f.tag:'Product Features';return `<main class="wrap"><section class="feature-hero">${crumbs([['Product','/product'],[f.tag,null]])}<div class="feature-hero-grid"><div><h1>${f.title}</h1><div class="button-row">${link('Start Here ↗','/app/new?source='+f.source,'button primary')}${link('Try Demos','/app/editor/rain/ch1?step='+ (id==='webtoon'?'comic':'motion'),'button ghost')}</div></div><div class="feature-art">${art(f.art,f.tag)}<span class="feature-art-label">ONE STORY / ONE WORKSPACE</span></div></div></section><section class="section">${sectionHead('A CLEAR CREATIVE FLOW','From idea to deliverable work.')}<div class="process-grid">${f.steps.map((t,i)=>`<div><span>0${i+1}</span><h3>${t}</h3><p>${f.points[i]||f.points[i%3]}</p></div>`).join('')}</div></section><section class="section split-feature"><div class="feature-art">${art(id==='webtoon'?3:8,'Local edit and version demo')}</div><div><h2>Creation is not a gacha pull.<br>Every step can be refined further.</h2>${f.points.map(p=>`<p class="check-point">✓ ${p}</p>`).join('')}${link('Open the Workspace →','/app/editor/rain/ch1','text-link')}</div></section><section class="section">${sectionHead('TOOLS THAT CONNECT','Related tools connect straight to your project.')}<div class="tool-grid three">${D.tools.filter(t=>(id==='webtoon'||id==='story')?['oc-sheet','lettering','colorize'].includes(t.id):id==='studio'?t.group==='Studio Efficiency':['comic-to-motion','motion-quality','pngtuber'].includes(t.id)).map(toolCard).join('')}</div></section><section class="section">${faq(D.faqs.slice(0,3))}</section>${cta()}</main>`;}
const productDemo={
  title:'Before the Rain Ends',
  ideas:1,
  chapters:3,
  assets:[['Characters',4],['Locations',3],['Props',1]],
  panels:12,
  shots:[
    ['Bookshop',7,'Selected'],
    ['Arrival',8,'Selected'],
    ['Reunion',9,'Selected'],
    ['Unsent letter',8,'Draft'],
    ['Rain outside',6,'Draft'],
    ['Fade out',10,'Draft']
  ]
};
function product(){
  S.pageTitle='Product · Cimora Studio';
  plReveal();
  const selected=productDemo.shots.filter(([, , status])=>status==='Selected').length;
  const percentage=Math.round(100*selected/productDemo.shots.length);
  const assets=productDemo.assets.reduce((total,[,count])=>total+count,0);
  const seconds=productDemo.shots.reduce((total,[,duration])=>total+duration,0);
  const castAvatars=['01','02','03'].map(id=>'<img src="assets/product-character-'+id+'.svg" alt="" width="34" height="34">').join('');
  return `<main class="wrap product-bento-page">
    <header class="page-hero product-bento-hero">
      <h1>Build one world. Tell it in more ways.</h1>
      <p>Write the story once, reuse your characters and settings across comics and video, and refine each step as you go.</p>
      ${link('Open Demo Workspace','/app','button primary')}
    </header>
    <section class="product-bento" aria-label="Product features" aria-describedby="product-demo-label">
      <p class="product-demo-label" id="product-demo-label">Sample project · ${esc(productDemo.title)}</p>
      <article class="product-bento-card product-bento-story">
        <div class="product-story-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg></div>
        <h2>${link('Story Planning','/features/story','product-bento-link')}</h2>
        <p>Turn one idea into an outline and editable chapters. Keep the same character and setting references as your story moves from comics to video.</p>
        <div class="product-story-control">
          <label class="product-reuse-switch"><span>Reuse references</span><input type="checkbox" role="switch" data-product-reuse checked><span class="product-reuse-track" aria-hidden="true"></span></label>
          <p data-product-reuse-status aria-live="polite">Shared across comic and video</p>
        </div>
      </article>
      <article class="product-bento-card product-bento-assets">
        <h2>${link('Characters &amp; Assets','/app/assets','product-bento-link')}</h2>
        <p>${assets} shared assets in this project</p>
        <div class="product-avatar-stack" role="img" aria-label="Sample character portraits">${castAvatars}</div>
      </article>
      <article class="product-bento-card product-bento-comic">
        <strong class="product-panel-number">${productDemo.panels}</strong>
        <h2>${link('Editable comic panels','/features/webtoon','product-bento-link')}</h2>
      </article>
      <article class="product-bento-card product-bento-video">
        <header class="product-video-heading">
          <div><h2>${link('Video Production','/features/motion-comic','product-bento-link')}</h2><p>Shot selection</p></div>
          <span class="product-sample-chip">Sample project</span>
        </header>
        <strong class="product-shot-percentage">${percentage}%</strong>
        <div class="product-video-meta"><span>${selected} of ${productDemo.shots.length} shots selected</span><span>${seconds}s total runtime</span></div>
      </article>
      <article class="product-bento-card product-bento-canvas">
        <h2>${link('Infinite Canvas','/app/infinite-canvas','product-bento-link')}</h2>
        <p>Connect ideas, references, and shots. Trace any frame back to what shaped it.</p>
      </article>
      <article class="product-bento-card product-bento-modes">
        <div><h2>Creation Shortcuts</h2><p>Explore an idea quickly or build a project step by step.</p></div>
        <div class="product-start-options">
          <a class="button ghost small" href="#/app/new?mode=quick" aria-label="Quick Mode" title="Quick Mode">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-12h-7l1-8z"/></svg>
          </a>
          <svg class="product-start-plus" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>
          <a class="button ghost small" href="#/app/new?mode=studio" aria-label="Studio Mode" title="Studio Mode">
            <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17m-10 0v9.5"/></svg>
          </a>
        </div>
      </article>
    </section>
    ${productLine()}
    ${cta()}
  </main>`;
}
document.addEventListener('change',event=>{
  if(!event.target.matches('[data-product-reuse]'))return;
  event.target.closest('.product-story-control').querySelector('[data-product-reuse-status]').textContent=
    event.target.checked?'Shared across comic and video':'Separate references for each format';
});
const showcaseWorks=[
  {id:'hero',title:'Hero',type:'2D Animation',year:2018,shape:'tall',position:'70% center'},
  {id:'glass-half',title:'Glass Half',type:'3D Animation',year:2015,shape:'wide'},
  {id:'wing-it',title:'Wing It!',type:'3D Animation',year:2023,shape:'square'},
  {id:'coffee-run',title:'Coffee Run',type:'3D Animation',year:2020,shape:'landscape',position:'67% center'},
  {id:'sprite-fright',title:'Sprite Fright',type:'3D Animation',year:2021,shape:'landscape'},
  {id:'caminandes-3',title:'Caminandes: Llamigos',type:'3D Animation',year:2016,shape:'tall'},
  {id:'spring',title:'Spring',type:'3D Animation',year:2019,shape:'tall',position:'65% center'},
  {id:'agent-327',title:'Agent 327: Operation Barbershop',type:'3D Animation',year:2017,shape:'landscape',position:'75% center'},
  {id:'singularity',title:'Singularity',type:'3D Animation',year:2026,shape:'square',position:'66% center'},
  {id:'pepper-adventure',title:'Pepper & Carrot: Adventure',type:'Comics',year:2018,shape:'landscape',credit:'David Revoy'},
  {id:'dailydweebs',title:'The Daily Dweebs',type:'3D Animation',year:2017,shape:'tall',position:'68% center'},
  {id:'sintel',title:'Sintel',type:'3D Animation',year:2010,shape:'landscape',position:'64% center'},
  {id:'caminandes-2',title:'Caminandes: Gran Dillama',type:'3D Animation',year:2013,shape:'square',position:'42% center'},
  {id:'potion-of-flight',title:'The Potion of Flight',type:'Comics',year:2014,shape:'tall',credit:'David Revoy'},
  {id:'charge',title:'Charge',type:'3D Animation',year:2022,shape:'tall',position:'8% center'},
  {id:'cosmos-laundromat',title:'Cosmos Laundromat: First Cycle',type:'3D Animation',year:2015,shape:'square'},
  {id:'big-buck-bunny',title:'Big Buck Bunny',type:'3D Animation',year:2008,shape:'landscape',position:'75% center'},
  {id:'elephants-dream',title:'Elephants Dream',type:'3D Animation',year:2006,shape:'wide',position:'74% center'},
  {id:'sita-sings-the-blues',title:'Sita Sings the Blues',type:'2D Animation',year:2008,shape:'landscape',credit:'Nina Paley'},
  {id:'rainbow-potions',title:'Rainbow Potions',type:'Comics',year:2014,shape:'square',credit:'David Revoy'},
  {id:'deadline',title:'Deadline',type:'2D Animation',year:2018,shape:'landscape',position:'center top',credit:'Morevna Project'},
  {id:'dragons-tooth',title:"The Dragon’s Tooth",type:'Comics',year:2016,shape:'tall',position:'65% center',credit:'David Revoy'},
  {id:'pepper-motion-contest',title:'The Potion Contest',type:'2D Animation',year:2017,shape:'square',credit:'Morevna Project'},
  {id:'peppers-birthday',title:"Pepper’s Birthday Party",type:'Comics',year:2015,shape:'landscape',position:'58% center',credit:'David Revoy'},
  {id:'seder-masochism',title:'Seder-Masochism',type:'2D Animation',year:2018,shape:'tall',position:'center 64%',credit:'Nina Paley'},
  {id:'witches-of-chaosah',title:'The Witches of Chaosah',type:'Comics',year:2015,shape:'wide',credit:'David Revoy'},
  {id:'pepper-motion-snow',title:'Pepper & Carrot: Holiday Special',type:'2D Animation',year:2022,shape:'wide',credit:'Morevna Project'},
  {id:'destroyer-of-worlds',title:'Destroyer of Worlds',type:'Comics',year:2019,shape:'square',credit:'David Revoy'},
];
const catalogFilters={
  showcase:{label:'Showcase categories',key:'caseType',values:['All','2D Animation','3D Animation','Comics']},
  templates:{label:'Template categories',key:'templateType',values:['All','Camera Move','Webtoon','Character','Promo']},
};
function showcaseCard(item){
  return `<article class="showcase-masonry-card ${item.shape||'landscape'}" style="--showcase-position:${item.position||'center'}">
    <img src="assets/showcase/${item.id}.webp" alt="" loading="lazy" decoding="async">
    <div class="showcase-masonry-copy"><span>${esc(item.credit||'Blender Studio')}</span><h2>${esc(item.title)}</h2><small>${esc(item.type)} · ${item.year}</small></div>
  </article>`;
}
let showcaseObserver;
function mountShowcaseReveal(){
  showcaseObserver?.disconnect();
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cards=S.$$('.showcase-masonry-card');
  if(!cards.length)return;
  showcaseObserver=new IntersectionObserver((entries,observer)=>{
    for(const {target,isIntersecting} of entries){
      if(!isIntersecting)continue;
      target.classList.remove('awaiting-reveal');
      target.classList.add('showcase-revealed');
      observer.unobserve(target);
    }
  },{threshold:.2});
  for(const card of cards){
    card.classList.add('awaiting-reveal');
    showcaseObserver.observe(card);
  }
}
function catalogCards(kind){
  if(kind==='resources')return D.articles.map(articleCard).join('');
  const value=S.ui[catalogFilters[kind].key];
  if(kind==='showcase')return showcaseWorks.filter(item=>value==='All'||item.type===value).map(showcaseCard).join('');
  return D.templates.filter(item=>value==='All'||item.type===value).map(templateCard).join('');
}
function catalog(kind){
  const isCase=kind==='showcase',isTemplate=kind==='templates',filter=catalogFilters[kind];
  S.pageTitle=isCase?'Showcase':isTemplate?'Templates':'Guides';
  const controls=filter?CimoraSegmentedControl.render({
    id:'public-'+kind+'-filter',label:filter.label,value:S.ui[filter.key],
    options:filter.values.map(value=>({value,label:value})),
  }):'';
  if(isCase){
    requestAnimationFrame(mountShowcaseReveal);
    return `<main class="wrap public-showcase"><header class="page-hero showcase-masonry-hero"><h1>In these stories, see your next possibility.</h1><p>Explore independent animation and comic art.</p></header>
      <div class="showcase-masonry-toolbar">${controls}</div>
      <div class="showcase-masonry" id="catalog-grid" aria-label="Showcase works" aria-live="polite">${catalogCards(kind)}</div>
      ${cta()}</main>`;
  }
  return `<main class="wrap${isTemplate?' templates-catalog':''}"><section class="page-hero"><h1>${isTemplate?'Give inspiration a starting point.':'The methods behind making a story.'}</h1></section>
    ${controls}<div class="case-grid" id="catalog-grid">${catalogCards(kind)}</div>
    ${kind==='resources'?`<section class="section">${link('View Product Updates →','/resources/updates','text-link')}</section>`:''}${cta()}</main>`;
}
document.addEventListener('segment-change',event=>{
  const kind=S.context.parts[0],filter=catalogFilters[kind];
  if(!filter||event.target.id!=='public-'+kind+'-filter')return;
  const grid=S.$('#catalog-grid');
  if(!grid)return;
  S.ui[filter.key]=event.detail.value;
  grid.innerHTML=catalogCards(kind);
  if(kind==='showcase')mountShowcaseReveal();
});
function caseDetail(id){const c=D.cases.find(x=>x.id===id);if(!c)return notFound();S.pageTitle=c.title+' · Showcase';return `<main class="wrap"><section class="case-detail-head">${crumbs([['Showcase','/showcase'],[c.title,null]])}<div class="section-head"><div><h1>${c.title}</h1></div>${button('Copy Demo to My Projects ↗','copy-case','button primary',`data-id="${c.id}"`)}</div></section><div class="showcase-view"><div class="showcase-main" id="case-stage">${art(c.art,c.title)}<div class="showcase-overlay"><span>ORIGINAL STORY / ${c.shots} PANELS</span><h2>${c.title}</h2><p>${c.subtitle}</p>${button('▷ Play Camera Preview','case-play','button glass')}</div></div><aside><h3>One world, two ways to tell it.</h3><p>${c.shots} comic panels · ${c.seconds} seconds of video<br>Characters and scenes share asset versions</p><div class="button-row">${button('Video','case-mode','filter selected','data-value="motion"')}${button('Comic','case-mode','filter','data-value="comic"')}</div><div class="showcase-thumbs">${[1,2,7].map(i=>art(i)).join('')}</div><small>Original SVG demo, not model-generated output or real customer work.</small></aside></div><section class="section">${sectionHead('HOW THE STORY WAS MADE','Behind the frame, every step is traceable.')}<div class="process-grid">${['Lock characters and rainy-day style','Confirm storyboard and dialogue','Stable draft and key enhancements','Final review and version delivery'].map((t,i)=>`<div><span>0${i+1}</span><h3>${t}</h3><p>Done in one project, with existing versions and candidates always kept.</p></div>`).join('')}</div></section><section class="section">${sectionHead('CONTINUE WITH THESE TOOLS','Bring the approach you love into your own story.')}<div class="tool-grid three">${D.tools.slice(1,4).map(toolCard).join('')}</div></section></main>`;}
function templateDetail(id){const t=D.templates.find(x=>x.id===id);if(!t)return notFound();S.pageTitle=t.title;return `<main class="wrap"><section class="feature-hero">${crumbs([['Templates','/templates'],[t.title,null]])}<div class="feature-hero-grid"><div><h1>${t.title}</h1>${link('Use This Template ↗',t.type==='Promo'?'/app/promote/rain':'/app/new?template='+t.id,'button primary')}<ul class="plain-list"><li>✓ Local demo content, every parameter editable</li><li>✓ Template choices are kept in the new project draft</li><li>✓ No third-party works or real model calls included</li></ul></div><div class="feature-art ${t.type==='Camera Move'?'gentle-preview':''}">${art(t.art,t.title)}</div></div></section><section class="section">${sectionHead('MAKE IT YOURS','Three steps to make it your own.')}<div class="process-grid three">${['Choose or import your visuals','Replace characters and dialogue','Confirm the pacing and add to a chapter'].map((x,i)=>`<div><span>0${i+1}</span><h3>${x}</h3><p>Adjust unsatisfying parts locally; existing versions are kept.</p></div>`).join('')}</div></section>${cta()}</main>`;}
const pricingCatalog=()=>Object.entries(AccountUsage.plans);
const yearlyPricing=()=> (S.ui.priceCycle||S.state.cycle)==='yearly';
const featureMark=included=>included
  ?'<svg class="pricing-check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>'
  :'<span class="pricing-dash" aria-hidden="true">—</span>';
function pricingCards(plans,annual){
  return plans.map(([name,plan])=>{
    const featured=name==='Creator',paid=plan.monthly>0;
    const price=annual?plan.yearly*12:plan.monthly;
    const priceNote=paid?(annual?`$${plan.yearly} per month, billed yearly`:'Billed monthly'):'No payment details needed';
    return `<article class="pricing-plan${featured?' is-featured':''}" aria-label="${esc(name)} plan">
      <header>
        <div class="pricing-plan-heading"><h2>${esc(name)}</h2>${featured?'<span class="pricing-plan-tag">Recommended</span>':''}</div>
        <p class="pricing-plan-description">${esc(plan.description)}</p>
      </header>
      <div class="pricing-plan-cost"><strong>$${price}</strong>${paid?`<span>/ ${annual?'yr':'mo'}</span>`:''}</div>
      <p class="pricing-plan-note">${priceNote}</p>
      <ul class="pricing-features">${plan.features.map(feature=>`<li>${featureMark(true)}<span>${esc(feature)}</span></li>`).join('')}</ul>
      ${button(paid?'Try '+name+' plan':'Start Free Trial','choose-plan','button '+(featured?'primary':'ghost')+' full',`data-plan="${esc(name)}"`)}
    </article>`;
  }).join('');
}
function pricingComparison(plans){
  const features=[...new Set(plans.flatMap(([,plan])=>plan.features))];
  return `<section class="pricing-comparison" aria-labelledby="pricing-comparison-heading">
    <h2 id="pricing-comparison-heading">Compare plans</h2>
    <p class="pricing-comparison-intro">See what each plan includes, from exploring the free demo to creating solo or working with a team.</p>
    <div class="pricing-table-wrap"><table aria-describedby="pricing-comparison-note">
      <thead><tr><th scope="col">Feature</th>${plans.map(([name])=>`<th scope="col"${name==='Creator'?' class="is-featured"':''}>${esc(name)}</th>`).join('')}</tr></thead>
      <tbody>${features.map(feature=>`<tr><th scope="row">${esc(feature)}</th>${plans.map(([name,plan])=>{
        const listed=plan.features.includes(feature);
        return `<td${name==='Creator'?' class="is-featured"':''}>${featureMark(listed)}<span class="pricing-sr-only">${listed?'Listed':'Not listed'}</span></td>`;
      }).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <p id="pricing-comparison-note">A dash means the feature is not listed for that demo plan.</p>
  </section>`;
}
function pricingFaq(){
  return `<section class="pricing-faq" aria-labelledby="pricing-faq-heading">
    <header>
      <p class="pricing-faq-label">FAQ</p>
      <h2 id="pricing-faq-heading">Frequently Asked Questions</h2>
      <p>Find answers about plans, model usage and creating with Cimora.</p>
    </header>
    <div class="pricing-faq-items">
      ${D.faqs.map(([question,answer],index)=>`<details name="pricing-faq"${index===1?' open':''}>
        <summary>${esc(question)}</summary>
        <p>${esc(answer)}</p>
      </details>`).join('')}
    </div>
  </section>`;
}
function pricing(){
  S.pageTitle='Pricing & Usage';
  const plans=pricingCatalog(),annual=yearlyPricing();
  const saving=Math.floor(Math.min(...plans.filter(([,plan])=>plan.monthly>0).map(([,plan])=>(1-plan.yearly/plan.monthly)*100)));
  const billing=CimoraSegmentedControl.render({
    id:'pricing-billing',label:'Billing period',value:annual?'yearly':'monthly',
    options:[{value:'monthly',label:'Monthly'},{value:'yearly',label:'Yearly'}],
  });
  return `<main class="wrap pricing-page">
    <header class="page-hero centered pricing-hero"><h1>Find the right plan for your studio.</h1><p>Choose a workspace plan. Model usage is estimated and billed separately.</p></header>
    <div class="pricing-billing-row">${billing}<span class="pricing-saving">Save ${saving}% or more with yearly billing</span></div>
    <section class="pricing-plans" id="public-pricing-plans" aria-label="Workspace plans">${pricingCards(plans,annual)}</section>
    ${pricingComparison(plans)}
    ${pricingFaq()}
  </main>`;
}
document.addEventListener('segment-change',event=>{
  if(event.target.id!=='pricing-billing')return;
  const cycle=event.detail.value;
  if(cycle!=='monthly'&&cycle!=='yearly')return;
  S.ui.priceCycle=cycle;
  S.$('#public-pricing-plans').innerHTML=pricingCards(pricingCatalog(),cycle==='yearly');
});
function resource(id){if(id==='updates'){S.pageTitle='Product Updates';return `<main class="wrap narrow"><section class="page-hero">${crumbs([['Guides','/resources'],['Changelog',null]])}<h1>Keep making creation better.</h1></section>${[['2026.10.28','Site-wide Creative Experience','The website, 14 tools, projects, assets and promotion sharing all live in one prototype.'],['2026.10.28','Every version has a source','Added parameter history, restore as new version, focus canvas and timeline positioning.'],['2026.10.27','Start from one chapter','Built the M0 five-step workspace for comics and video.']].map(([d,t,p])=>`<article class="update-entry"><span class="eyebrow">${d}</span><h2>${t}</h2><p>${p}</p></article>`).join('')}</main>`;}const a=D.articles.find(x=>x.id===id);if(!a)return notFound();S.pageTitle=a.title;return `<main class="wrap narrow"><section class="page-hero">${crumbs([['Guides','/resources'],[a.category,null]])}<h1>${a.title}</h1></section><div class="article-cover">${art(a.art,a.title)}</div><article class="prose"><p>A complete creative flow should let you focus on the story itself. This guide uses “Before the Rain Ends” to show how to plan each step and keep existing results when you edit.</p>${a.steps.map((step,i)=>`<section><span class="eyebrow">STEP 0${i+1}</span><h2>${step}</h2><p>${['First decide what you want the audience to feel in this chapter. Express the plot goal in short scenes and dialogue, and avoid batch-generating frames before the story is confirmed.','Choose confirmed references and asset versions. Set specific constraints on hairstyle, outfit and emotion so later frames have a stable basis.','Limit issues to the affected frames and shots, compare candidates, then adopt one yourself. Old versions are kept for rollback and review.','Before delivery, check order, subtitles and versions. A comic can be exported on its own or continue into the video canvas.'][i]}</p></section>`).join('')}<div class="surface"><h3>Try It Yourself</h3><p>Open the local demo project and follow the steps. No paid models are called.</p>${link('Open “Before the Rain Ends” →','/app/projects/rain','button primary')}</div></article></main>`;}
function help(){S.pageTitle='Help Center';return `<main class="wrap"><section class="page-hero centered"><h1>Stuck while creating?<br>Keep moving from here.</h1></section><div class="help-categories">${[['Story & Storyboard','first-chapter','▤'],['Characters & Assets','consistent-characters','◎'],['Animation & Export','stable-motion','▷'],['Promotion & Sharing','release-kit','↗']].map(([t,id,ic])=>link(`<span>${ic}</span><h3>${t}</h3><p>View Step Guide →</p>`,'/resources/'+id,'surface')).join('')}</div><section class="section">${faq()}</section><div class="help-contact"><h2>Still haven’t found an answer?</h2><p>Log usage questions or prototype feedback, saved on this device.</p>${button('Give Feedback','support','button primary')}</div></main>`;}
const toolImageCredits=`<section><h2>Creative Tools image credits</h2><p>Illustrations by David Revoy (Pepper &amp; Carrot):
    <a href="https://www.peppercarrot.com/sb/viewer/sketchbook-src__2017-08-06_Pepper_s-model-sheet_by-David-Revoy.html">Model sheet</a>,
    <a href="https://www.peppercarrot.com/sv/viewer/sketchbook-src__2018-04-11_Pepper-expression-study-for-episode-30_by-David-Revoy.html">Expression study</a>,
    <a href="https://www.peppercarrot.com/en/webcomic/ep01_Potion-of-Flight.html">The Potion of Flight</a>.
    Cropped for display · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p></section>
  <section><h2>Character to film image credits</h2><p>Illustrations by David Revoy (Pepper &amp; Carrot):
    <a href="https://www.davidrevoy.com/article906/ep37-production-report-style">Episode 37 Production Report</a> (character design),
    <a href="https://www.davidrevoy.com/article453/pepper-with-anime-eyes">Pepper with anime eyes</a>, and
    <a href="https://www.davidrevoy.com/article743/powerful">Powerful</a>. Cropped and faded for display ·
    <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p></section>
  <section><h2>Showcase image credits</h2>
    <p>Animation artwork © <a href="https://studio.blender.org/films/">Blender Foundation</a>. <a href="https://studio.blender.org/remixing/">CC BY licensing</a> · <a href="https://peach.blender.org/about/">Big Buck Bunny</a> and <a href="https://studio.blender.org/projects/sintel/">Sintel</a> (CC BY 3.0) · <a href="https://orange.blender.org/press/">Elephants Dream</a> © Blender Foundation / Netherlands Media Art Institute (CC BY 2.5).</p>
    <p>2D animation artwork by Nina Paley · <a href="https://www.sitasingstheblues.com/">Sita Sings the Blues</a> and <a href="https://sedermasochism.com/">Seder-Masochism</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>.</p>
    <p><a href="https://morevnaproject.org/shorts/deadline/">Deadline</a> by Morevna Project (<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>). <a href="https://morevnaproject.org/pepper-and-carrot/episode-5/">Holiday Special</a> and <a href="https://morevnaproject.org/pepper-and-carrot/episode-6/">The Potion Contest</a> by Morevna Project, based on David Revoy’s original comic (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>).</p>
    <p>Comic artwork by David Revoy · <a href="https://www.davidrevoy.com/article355/peppercarrot-adventure">Pepper &amp; Carrot: Adventure</a> and <a href="https://www.peppercarrot.com/en/webcomics/peppercarrot.html">Pepper &amp; Carrot episode illustrations</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Images cropped for display.</p>
  </section>`;
function legal(id){const titles={privacy:'Privacy & Data',copyright:'Commercial Use & Copyright',terms:'Terms of Service',content:'Content & Voice Policy'};S.pageTitle=titles[id]||'Usage Policy';return `<main class="wrap narrow"><section class="page-hero"><h1>${S.pageTitle}</h1></section><div class="policy-notice">This page reviews what the official product should disclose and does not represent service commitments already live. This prototype collects no real account credentials, calls no models, and performs no payments or external publishing.</div><article class="prose">${[['Local Demo Data','Demo projects, settings and tool results are saved in the current browser. You can export or reset them in Studio settings. Uploaded materials are previewed locally only and never sent to external vendors.'],['Rights to Materials and Generated Results','Users must hold the rights to uploaded materials. The official service must detail vendor licenses, commercial use scope, copyright claims, DMCA handling and infringement complaint channels. Demo illustrations are original local SVG.'],['Data Use and Retention','Before launch, it must be clear whether materials are used for training, processing purposes, retention periods, deletion flow, vendor processing scope and GDPR data export. The prototype does not imply these operations are complete.'],['Voice and Content Boundaries','The prototype does not clone real people’s voices. The official service must define voice authorization, minors, NSFW and illegal content boundaries, and a subscription cannot replace material or voice authorization.'],['Subscription, Fees and Termination','Amounts and plans on this page are samples; actions create no contract or charge. Billing, refunds, cancellation, quotas and vendor-failure charges in the official service follow the official agreement.']].map(([t,p])=>`<section><h2>${t}</h2><p>${p}</p></section>`).join('')}${id==='terms'?toolImageCredits:''}</article><div class="button-row">${link('Privacy','/legal/privacy','button ghost')}${link('Copyright','/legal/copyright','button ghost')}${link('Content Policy','/legal/content','button ghost')}</div></main>`;}
function notFound(){S.pageTitle='Page Not Found';return `<main class="wrap">${S.empty('This page has no story yet.','Go back home, or keep exploring the creation tools.','Back to Home','/')}</main>`;}
S.public={toolCard,caseCard,templateCard,render(c){const [a,b]=c.parts;if(a===''||c.path==='/')return home();if(a==='product')return product();if(a==='features')return feature(b);if(['showcase','templates','resources'].includes(a)){if(!b)return catalog(a);return a==='showcase'?caseDetail(b):a==='templates'?templateDetail(b):resource(b);}if(a==='pricing')return pricing();if(a==='help')return help();if(a==='legal')return legal(b);return notFound();},onClick(action,el){if(action==='choose-plan'){S.modal('Try '+el.dataset.plan+' plan',`<p>This will switch the local demo account to <strong>${esc(el.dataset.plan)}</strong>. This is not a purchase and will not charge you or create a real subscription.</p>`,`<button class="button ghost" data-act="close">Cancel</button><button class="button primary" data-act="confirm-plan" data-plan="${el.dataset.plan}">Confirm Demo Plan</button>`);return true;}if(action==='case-play'){const stage=S.$('#case-stage');stage.classList.toggle('is-playing');el.textContent=stage.classList.contains('is-playing')?'Ⅱ Pause Camera Preview':'▷ Play Camera Preview';return true;}if(action==='case-mode'){S.$$('.showcase-view [data-act="case-mode"]').forEach(b=>b.classList.toggle('selected',b===el));S.$('#case-stage').classList.toggle('comic-preview',el.dataset.value==='comic');S.toast(el.dataset.value==='comic'?'Switched to comic preview.':'Switched to video camera preview.');return true;}return false;}};
})();
