(()=>{
  const C=Cimora,{S,M,E,ui,btn,link,art,badge,money,path,meta}=C;
  const catalog=[
    {id:'story-skill',title:'Give the dialogue its subtext',type:'Skills',category:'Story writing',desc:'Keep the character goal, polish the dialogue and scene action.',price:80,art:2,author:'Qingkong Narrative',uses:'Text input → Story candidate',steps:['Read character and scene constraints','Analyze dialogue intent','Output comparable revision candidates']},
    {id:'rain-layout',title:'Letters on a rainy day · breathing vertical comic',type:'Template',category:'Comic layout',desc:'Generous white space and restrained dialogue, so every reunion lingers.',price:120,art:6,author:'Mist Island design studio',uses:'Panel material → vertical strip comic',steps:['Reference chapter panels','Apply loose layout','Check bubbles and reading order']},
    {id:'film-workflow',title:'From one chapter of story to a motion teaser',type:'Workflow',category:'Video',desc:'A complete recipe for storyboards, assets, key shots and review.',price:180,art:10,author:'Cimora Studio',uses:'Chapter content → Shot pipeline',steps:['Extract characters, scenes and props','Plan shots and stable camera moves','Select key shots to enhance','Review and generate delivery snapshot']},
    {id:'oc-identity',title:'OC identity profile · continuous creation edition',type:'Template',category:'Character assets',desc:'Give appearance, outfit, emotion and story relationships a clear basis.',price:60,art:1,author:'Yuejian Huiyan',uses:'Character description → reference profile',steps:['Organize identity constraints','Save outfit and expression references','Create project version reference']},
    {id:'continuity-skill',title:'Prop and outfit continuity check',type:'Skills',category:'Pipeline efficiency',desc:'Find the spots in chapter changes that need creator confirmation.',price:90,art:3,author:'Daylight production room',uses:'Chapters and assets → difference list',steps:['Read fixed asset version','Compare chapter state','Locate the panel that needs review']},
    {id:'starter-free',title:'Chapter one · Beginner creation recipe',type:'Workflow',category:'Getting started',desc:'Start from one idea and finish chapter one in the fewest steps.',price:0,art:8,author:'Cimora Studio',uses:'Idea description → Chapter 1 draft',steps:['Expand the story direction','Split chapters and storyboard','Confirm sketch','Finish comic layout']}
  ];
  const works=[
    {
      id: 'rain-public', title: 'Before the Rain Stops', author: 'Cimora Originals', tag: 'Urban romance', art: 6,
      desc: 'A letter that was never sent, and a reunion seven years late.',
      type: 'both', kinds: ['story', 'comic', 'motion'], published: '2026-11-02',
      chapters: [
        {
          id: 'c1', title: 'The Seventh Day After', free: true, pages: 8,
          text: [
            'The forecast said the rain would stop by Thursday. It was already the seventh day, and the street still smelled of wet concrete and closed umbrellas.',
            'Lin Xia stopped in front of the bookshop without deciding to. The sign had been repainted, but the brass handle was the same one she had gripped seven years ago, on the afternoon she said she was leaving.',
            'Through the window she could see the shelf she used to lean against. Someone had put a chair there, as if the shop had learned that people sometimes need to sit down before they can speak.',
            'The door opened. The bell above it had not been replaced either.'
          ],
          shots: [
            { n: 1, framing: 'Wide, street corner', action: 'Rain on the old bookshop sign; Lin Xia stops in the middle of the crossing.', line: 'Narration: the seventh day of rain.' },
            { n: 2, framing: 'Close-up, hands', action: 'Her fingers tighten around the red scarf.', line: 'Narration: she had counted the years in umbrellas.' },
            { n: 3, framing: 'Over-shoulder, window', action: 'She looks in: the chair by the shelf, the light left on.', line: 'No dialogue.' },
            { n: 4, framing: 'Medium close, doorway', action: 'Chen Xu turns around behind the door frame.', line: 'Chen Xu: You came back on a rainy day.' },
            { n: 5, framing: 'Two-shot, interior', action: 'Neither moves; the bell keeps swinging.', line: 'Lin Xia: I was passing by.' },
            { n: 6, framing: 'Wide, interior', action: 'Rain on the glass, two silhouettes and a chair between them.', line: 'Narration: the shop had been waiting longer than either of them.' }
          ]
        },
        {
          id: 'c2', title: 'The Unsent Letter', free: false, price: 40, pages: 8,
          text: [
            'The envelope was yellowed at the corners, the way paper goes when it has been carried in a coat pocket for a week and then put away for years.',
            'She did not open it in front of him. She put it on the counter, next to the empty cup he had not cleared, and said the only sentence she had practiced on the way over.'
          ],
          shots: [
            { n: 1, framing: 'Prop close-up', action: 'The envelope lands on the counter; a crease catches the window light.', line: 'Narration: some words waited seven years.' },
            { n: 2, framing: 'Close-up, faces', action: 'Chen Xu looks at the envelope, not at her.', line: 'Chen Xu: You kept it.' },
            { n: 3, framing: 'Medium, counter', action: 'Her hand stays flat on the paper.', line: 'Lin Xia: I never finished it.' },
            { n: 4, framing: 'Two-shot, wide', action: 'The rain gets quieter outside; neither of them moves.', line: 'Narration: this time nobody left first.' }
          ]
        },
        { id: 'c3', title: 'Rain on the Shop Window', free: false, price: 40, pages: 9 },
        { id: 'c4', title: 'Under the Same Umbrella', free: false, price: 40, pages: 7 }
      ]
    },
    {
      id: 'sky-public', title: 'Star Sea Post Office', author: 'Yuejian Huiyan', tag: 'Fantasy healing', art: 10,
      desc: 'She delivers letters for the stars, and is also looking for her own place to belong.',
      type: 'comic', kinds: ['story', 'comic'], published: '2026-10-24',
      chapters: [
        {
          id: 's1', title: 'Letters for the Stars', free: true, pages: 10,
          text: [
            'The post office opened only when the sky was clear enough to see where the letters had to go.',
            'She sorted them by brightness: the ones that had waited a long time glowed faintly, and those were always the hardest to deliver.',
            'Tonight there was one address she had never seen before, written in her own handwriting.'
          ]
        },
        { id: 's2', title: 'The Address Nobody Found', free: false, price: 30, pages: 9 }
      ]
    },
    {
      id: 'book-public', title: 'Slow Days Bookshop', author: 'Cimora Originals', tag: 'Slice of life', art: 0,
      desc: 'Between old books and the sound of rain, pick up the tenderness that was forgotten.',
      type: 'comic', kinds: ['comic'], published: '2026-10-11',
      chapters: [
        { id: 'b1', title: 'The Doorbell in the Rain', free: true, pages: 6 },
        { id: 'b2', title: 'A Book Nobody Borrowed', free: false, price: 30, pages: 6 }
      ]
    },
    {
      id: 'light-public', title: 'Letters in the Glimmer', author: 'Mist Island studio', tag: 'Mood short', art: 8,
      desc: 'Dusk falls into the eyes; the story has only just begun.',
      type: 'motion', kinds: ['motion', 'image'], published: '2026-09-30',
      chapters: [
        { id: 'v1', title: 'Dusk Into the Eyes', free: true, pages: 1 },
        { id: 'v2', title: 'Glimmer, Shot 02', free: false, price: 20, pages: 1 }
      ]
    }
  ];
  function heading(k,h,p='',a=''){return `<div class="cm-page-heading"><div>${k?`<span class="cm-kicker">${k}</span>`:''}<h1>${h}</h1><p>${p}</p></div><div>${a}</div></div>`;}
  function projectCard(p){const c=M.resume(p),e=c.e;return `<article class="cm-project-card"><a href="#/app/projects/${p.id}">${art(p.art,p.name)}<span class="cm-image-badge">${M.output(p)==='comic'?'Comic':M.output(p)==='motion'?'Video':'Comic + Video'}</span><div class="cm-project-hover">Continue story ↗</div></a><div><small>${p.chapters.length} chapter · ${p.assetIds?.length||0} assets</small><h3>${link(E(p.name),'/app/projects/'+p.id,'')}</h3><p>${E(p.desc)}</p><footer><span><i></i>${E(p.updated||'Local草稿')}</span>${link('Continue: '+E(M.navigation?.task(c)||e.stage),M.navigation?.resume(c)||path(c,e.stage),'cm-text-link')}</footer></div></article>`;}
  function home(){const ps=S.state.projects.filter(p=>!p.archived);return heading('YOUR CREATIVE UNIVERSE','Welcome back, creator.','Every world starts with your imagination.',link('＋ New project','/app/new','cm-button primary'))+`<section class="cm-dashboard-hero"><img src="assets/cimora-cover.webp" alt="Cimora original star-sea girl and fantasy city" class="cm-hero-image"><div class="cm-dashboard-hero-copy"><span class="cm-kicker">WHERE YOUR STORIES COME ALIVE</span><h2>Turn the world in your head,<br>into your next work.</h2><p>A line of inspiration, a chapter of comic, a story that moves.<br>Let characters and stories grow in the same universe.</p><div>${link('✧ 从灵感开始','/app/new?source=idea','cm-button primary')}${link('⌘ 自由Canvas','/app/new?view=canvas','cm-button glass')}</div></div><span class="cm-original-mark">CIMORA ORIGINAL WORLD / 001</span></section><div class="cm-quick-starts">${[['✎','Comic创作','分镜、草图到长图排版','comic'],['▷','Video creation','镜头、Voice到动态演绎','motion'],['⌘','无限Canvas','让灵感与Flow自由连接','canvas'],['✧','创作小工具','为正在做的作品添一点灵感','tools']].map(([ic,t,d,v])=>link(`<span>${ic}</span><div><h3>${t}</h3><p>${d}</p></div>`,v==='tools'?'/app/tools':v==='canvas'?'/app/new?view=canvas':'/app/new?output='+v,'cm-quick-start')).join('')}</div><div class="cm-section-head"><div><span class="cm-kicker">CONTINUE CREATING</span><h2>The story continues.</h2></div>${link('All projects →','/app/projects','cm-text-link')}</div><div class="cm-project-grid">${ps.slice(0,3).map(projectCard).join('')}${ps.length<3?link('<b>＋</b><h3>下一个世界</h3><p>从一个小小的想法开始。</p>','/app/new','cm-empty-project'):''}</div><div class="cm-section-head"><div><span class="cm-kicker">MADE WITH IMAGINATION</span><h2>Inspiration from the Creative Universe.</h2></div>${link('探索Showcase →','/app/community','cm-text-link')}</div><div class="cm-discovery-row">${works.slice(1).map(workCard).join('')}</div>`;}
  function projects(ctx){if(ctx.parts[2])return C.project(S.project(ctx.parts[2]));return heading('YOUR ORIGINAL WORLDS','My Projects','A project is the home of a story; a chapter is each continuation.',link('＋ New project','/app/new','cm-button primary'))+`<div class="cm-filter-toolbar">${CimoraSearchField.render(`<input placeholder="Search projects…" aria-label="Search Cimora projects" data-cm-input="project-search" value="${E(ui.projectSearch||'')}">`, "cm-search")}${btn('View archive','show-archive','cm-button ghost')}</div><div class="cm-project-grid" id="cm-project-list">${projectList()}</div>`;}
  function projectList(){return S.state.projects.filter(p=>!p.archived&&(!ui.projectSearch||(p.name+p.desc).includes(ui.projectSearch))).map(projectCard).join('')||'<div class="cm-empty-small">No matching projects. Try another keyword.</div>';}
  function newProject(ctx){const d=M.db.newDraft??={name:'',text:'',source:ctx.params.get('source')||'idea',output:ctx.params.get('output')||'comic',view:ctx.params.get('view')||'flow',tone:'Gentle and healing',candidate:'',direction:0};if(ctx.params.get('view'))d.view=ctx.params.get('view');if(ctx.params.get('output'))d.output=ctx.params.get('output');if(ctx.params.get('source'))d.source=ctx.params.get('source');return heading('LET’S MAKE SOMETHING YOURS','Where does your next story begin?','You don’t need a complete story ready. Write one idea first, and we’ll unfold it together.')+`<div class="cm-new-layout"><section class="cm-panel cm-new-input"><div class="cm-source-tabs">${[['idea','✧','一句灵感'],['novel','▤','小说改编'],['script','文','已有故事'],['comic','▦','导入Comic']].map(([k,ic,t])=>btn(`${ic} ${t}`,'new-source',d.source===k?'selected':'',`data-source="${k}"`)).join('')}</div><label class="cm-label">Name your story <small>You can also decide later</small><input id="cm-new-name" placeholder="e.g. Before the Rain Stops" data-cm-input="new-name" value="${E(d.name)}" maxlength="60"></label><label class="cm-label">${d.source==='idea'?'描述你脑海里的画面':d.source==='novel'?'粘贴想改编的小说片段':d.source==='script'?'粘贴已有故事故事':'描述Comic内容（可选）'}<textarea id="cm-new-text" data-cm-input="new-text" rows="7" placeholder="A girl returns to the old bookstore she left years ago and meets again the person who has been waiting for her. She carries a letter she never sent…">${E(d.text)}</textarea></label>${d.source==='comic'?'<label class="cm-upload">↥ 选择Comic图片<input type="file" id="cm-new-file" accept="image/*" multiple><small>Local预览；切格与识别为sample</small></label>':''}<div class="cm-inline-actions">${btn('试试这个灵感','sample-idea','cm-text-link')}<span>Original input is always kept</span></div><div class="cm-new-options"><label class="cm-label">Story tone<select id="cm-new-tone" data-cm-change="new-tone">${['细腻治愈','悬疑反转','奇幻冒险','轻松日常'].map(t=>`<option ${d.tone===t?'selected':''}>${t}</option>`).join('')}</select></label><label class="cm-label">Target work<select id="cm-new-output" data-cm-change="new-output"><option value="comic" ${d.output==='comic'?'selected':''}>Comic</option><option value="motion" ${d.output==='motion'?'selected':''}>Video</option><option value="both" ${d.output==='both'?'selected':''}>Comic + video</option></select></label></div><div class="cm-inline-actions">${btn('✧ 帮我扩写故事','new-expand','cm-button primary')}${btn('✎ 只润色原文','new-polish','cm-button ghost')}</div><small class="cm-help">This local example organizes story structure without calling a text model. Your description and edits are saved.</small></section><section class="cm-panel cm-new-output"><div class="cm-panel-title"><div><span class="cm-kicker">STORY CO-CREATION</span><h2>Give inspiration room to grow.</h2></div><span class="cm-sparkle">✦</span></div><div class="cm-direction-tabs">${['细腻重逢','悬疑来信','奇幻约定'].map((t,i)=>btn(t,'story-direction',d.direction===i?'selected':'',`data-index="${i}"`)).join('')}</div>${d.candidate?`<label class="cm-label">故事候选 / 可编辑<textarea id="cm-new-candidate" data-cm-input="new-candidate" rows="14">${E(d.candidate)}</textarea></label>`:`<div class="cm-story-placeholder">${art(3,'未寄出的信')}<h3>一封信，也可以是一整个故事。</h3><p>写下你的灵感，生成故事方向、大纲与对白候选。<br>不满意的部分，可以Continue修改。</p></div>`}<div class="cm-start-choice"><strong>Choose how you create</strong><div>${btn('☷ Flow引导 <small>一步步确认内容</small>','new-view',d.view==='flow'?'selected':'','data-view="flow"')}${btn('⌘ 无限Canvas <small>从关联和灵感开始</small>','new-view',d.view==='canvas'?'selected':'','data-view="canvas"')}</div></div><div class="cm-new-submit">${btn('创建 items目，Continue这个故事 ↗','create-cimora-project','cm-button primary full')}${btn('Start from a blank infinite canvas','create-blank-project','cm-text-link')}</div></section></div>`;}
  function scopedAssets(){const c=C.ctx();return S.state.assets.filter(a=>{const match=ui.assetScope==='studio'?!a.projectId:ui.assetScope==='project'?a.projectId===c.p.id||c.p.assetIds?.includes(a.id):!!c.e.bindings[a.id]||a.projectId===c.p.id&&a.chapterIds?.includes(c.c.id);return match&&(ui.assetType==='All'||a.type===ui.assetType)&&(!ui.assetSearch||(a.name+a.desc).includes(ui.assetSearch));});}
  function assetCard(a){return `<button class="cm-library-asset" data-cm="asset-detail" data-id="${a.id}"><div>${art(a.art,a.name)}<span class="cm-image-badge">${E(a.type)}</span></div><section><h3>${E(a.name)}</h3><p>${a.projectId?E(S.project(a.projectId)?.name||' items目'):'Studio-wide'}${a.chapterIds?.length?' / '+a.chapterIds.length+' chapter':''}</p><footer><span>${a.locked?'● Locked':'◌ 草稿'} · v${a.version}</span></footer></section></button>`;}
  function assets(ctx){if(ctx.parts[2]){const a=S.state.assets.find(a=>a.id===ctx.parts[2]);return a?assetDetail(a):S.empty('Asset not found','Back to Asset Library.','Asset Library','/app/assets');}return heading('YOUR WORLD, ORGANIZED','Every asset has its own place.','Find what you need by project and chapter, and reference the same pinned version across chapters.',btn('+ Create asset','new-asset','cm-button primary'))+C.scopePicker()+`<div class="cm-library-scope">${[['chapter','Used in this chapter'],['project','All projects'],['studio','Studio-wide']].map(([k,t])=>btn(t,'asset-scope',ui.assetScope===k?'selected':'',`data-scope="${k}"`)).join('')}</div><div class="cm-filter-toolbar"><div class="cm-filter-tabs cm-segment-group">${['All','Character','Scene','Prop','Outfit','Art Style','Voice','Background music','Ambient sound','Action sound effects'].map(t=>btn(t,'library-type',ui.assetType===t?'selected':'',`data-type="${t}"`)).join('')}</div>${CimoraSearchField.render(`<input placeholder="Search assets, constraints…" aria-label="Search Cimora assets" data-cm-input="asset-search" value="${E(ui.assetSearch)}">`, "cm-search")}</div><div class="cm-library-grid" id="cm-library-grid">${assetList()}</div><div class="cm-notice">References in this chapter do not copy assets. New versions need active sync; sketches and candidates are managed in the chapter storyboard and version records.</div>`;}
  const assetList=()=>scopedAssets().map(assetCard).join('')||'<div class="cm-empty-small">No assets in this scope yet. Create one, reference one from the project, or generate a sample with Creative Tools.</div>';
  function assetDetail(a){const refs=S.state.projects.flatMap(p=>[...p.chapters,...(p.episodes||[])].map(ch=>({p,ch,e:M.ensure(p,ch)}))).filter(c=>c.e.bindings[a.id]);return heading('ASSET & REFERENCES',E(a.name),`${a.type} / ${a.projectId?E(S.project(a.projectId)?.name||' items目'):'Studio-wide'} / v${a.version}`,btn('Create new version','asset-revise','cm-button primary',`data-id="${a.id}"`))+`<div class="cm-asset-detail"><div>${art(a.art,a.name)}</div><section class="cm-panel"><h3>Identity and visual constraints</h3><p>${E(a.desc)}</p><div class="cm-detail-lines"><span>Current version<b>v${a.version}</b></span><span>Status<b>${a.locked?'Locked':'草稿'}</b></span><span>Reference position<b>${refs.length} chapters</b></span></div>${!a.locked?btn('锁定当前版本','cm-lock-asset','cm-button ghost',`data-id="${a.id}"`):''}${btn('View version changes','asset-impact','cm-button ghost',`data-id="${a.id}"`)}${btn('Reference in this chapter','bind-asset','cm-button primary',`data-id="${a.id}"`)}<h3>Pinned version references</h3>${refs.map(c=>`<div class="cm-asset-reference"><div><strong>${E(c.p.name)} / ${E(c.ch.title)}</strong><small>Referenced v${c.e.bindings[a.id]} ${c.e.bindings[a.id]!==a.version?'· 新版本可同步':' · matches current'}</small></div>${link('View chapters',path({p:c.p,c:c.ch,e:c.e},'assets'),'cm-text-link')}</div>`).join('')||'<p>还没有 chapters引用。</p>'}<h3>Legacy constraints</h3>${(a.history||[]).slice().reverse().map(h=>`<p><b>v${h.version}</b> ${E(h.desc)}</p>`).join('')||'<p>Initial version, no history yet.</p>'}</section></div>`;}
  function marketCard(it){const installed=M.db.purchases.includes(it.id);return link(`<div class="cm-market-picture">${art(it.art,it.title)}<span class="cm-image-badge">${it.type}</span></div><div class="cm-market-copy"><small>${it.category} / BY ${E(it.author)}</small><h3>${E(it.title)}</h3><p>${E(it.desc)}</p><span class="cm-market-price">${installed?'✓ In library':it.price?'✦ '+it.price+' credits':'Free'}</span></div>`,'/app/market/'+it.id,'cm-market-card');}
  const assetPacks=[
    {
      id: 'pack-urban-character', title: 'Urban Youth Character Pack', type: 'Asset pack', category: 'Character pack', art: 1, price: 180, author: 'Cimora Originals',
      desc: 'A ready-to-reuse city character: identity, three-view sheet, portraits and outfit variants.',
      uses: 'Drop the character into a story or comic chapter and keep the same face, hair and clothing across panels.',
      steps: ['Read the character sheet and lock the identity you want', 'Pick the outfits and expressions for this chapter', 'Apply the versions to the panels you select'],
      license: 'Use in your own personal and commercial works. Do not resell the pack as-is or redistribute the reference sheets. The creator must confirm any wider licensing.',
      contents: ['Character sheet, front / side / back', 'Two portrait crops for covers and avatars', 'Four outfit references with colour notes', 'One scene-ready lighting note']
    },
    {
      id: 'pack-night-city', title: 'Night City Scene Pack', type: 'Asset pack', category: 'Scene pack', art: 0, price: 120, author: 'Cimora Originals',
      desc: 'A rainy street corner and an old bookshop, built as a small reusable stage for waiting and reunion scenes.',
      uses: 'Reuse one location across chapters so lighting, props and camera positions stay consistent.',
      steps: ['Choose the street or the interior variant', 'Set the time of day and weather note', 'Apply to the panels that share the location'],
      license: 'Use in your own works, including commercial projects. Do not resell the scene files or publish them as a standalone asset pack.',
      contents: ['Street corner, wide and medium', 'Bookshop interior, two camera angles', 'Rain and window light notes', 'Four prop references']
    },
    {
      id: 'pack-star-post', title: 'Star Sea Post Office World Guide', type: 'Asset pack', category: 'World guide', art: 10, price: 90, author: 'Yuejian Huiyan',
      desc: 'Rules, tone and visual language for a healing fantasy world where letters travel between stars.',
      uses: 'Start a new story inside this world without rebuilding its rules, tone and palette.',
      steps: ['Read the world rules and the story seeds', 'Pick a seed that fits your chapter', 'Carry the palette and tone into the first storyboard'],
      license: 'Adapt the world for your own stories. Credit the original guide when a work is published. Do not sell the guide itself.',
      contents: ['World rules and tone sheet', 'Six story seeds', 'Palette and lighting reference', 'Three location sketches']
    },
    {
      id: 'pack-voice-soft', title: 'Soft and Clear Voice Set', type: 'Asset pack', category: 'Voice set', art: 8, price: 60, author: 'Cimora Originals',
      desc: 'Two preset narration voices and one character voice with sample lines, for dialogue and trailers.',
      uses: 'Keep narration consistent across chapters and match a character voice to the same character.',
      steps: ['Listen to the sample lines', 'Pick a voice for narration or a character', 'Apply it to the shots that carry dialogue'],
      license: 'Use the presets in your own works. These are recorded presets, not voice cloning, and cannot be resold.',
      contents: ['Narration voice, calm', 'Narration voice, warm', 'Character voice with four sample lines', 'Mixing notes for dialogue and music']
    }
  ];
  function allCatalog(){return [...catalog,...assetPacks,...M.db.drafts.filter(d=>d.published)];}
  function market(ctx){const item=ctx.parts[2]&&allCatalog().find(it=>it.id===ctx.parts[2]);if(ctx.parts[2])return item?marketDetail(item):S.empty('Resource not found','Return to the Market.','Market','/app/market');return heading('','Help good methods get seen by more people.','Explore skills, creation templates and workflows, and turn someone else’s experience into your new starting point.',link('Become a creator','/app/creator','cm-button ghost'))+`<section class="cm-market-banner"><div><span class="cm-kicker">THE CREATOR EXCHANGE</span><h2>Inspiration is worth sharing,<br>experience has its own value.</h2><p>Exchange creative methods with credits. Bought resources and model run costs are shown separately.</p></div>${art(10,'Star Sea Post Office, original fantasy world')}</section><div class="cm-filter-toolbar"><div class="cm-filter-tabs cm-segment-group">${['All','Skill','Template','Workflow','Asset pack','Owned'].map(t=>btn(t,'market-filter',ui.marketType===t?'selected':'',`data-type="${t}"`)).join('')}</div></div><div class="cm-market-grid">${allCatalog().filter(it=>ui.marketType==='All'||ui.marketType==='Owned'?ui.marketType==='All'||M.db.purchases.includes(it.id):it.type===ui.marketType).map(marketCard).join('')||'<div class="cm-empty-small">Your library is empty. Start with a free starter recipe.</div>'}</div>`;}
  function marketDetail(it) {
    const owns = M.db.purchases.includes(it.id);
    const contents = (it.contents || []).map((c) => `<li>${E(c)}</li>`).join('');
    return `<div class="cm-market-detail-header">${link('Back to Market','/app/market','cm-back')}<div><span class="cm-soft-tag">${E(it.type)} / ${E(it.category)}</span><h1>${E(it.title)}</h1><p>${E(it.desc)}</p><small>BY ${E(it.author)} · ${it.type === 'Asset pack' ? 'Asset pack v1.0' : 'Resource v1.0'} · local product example</small></div></div><div class="cm-market-detail"><div><div class="cm-market-main-art">${art(it.art,it.title)}</div><section class="cm-panel"><h3>What you get</h3><p>${E(it.uses)}</p><ol class="cm-template-steps">${it.steps.map((t) => `<li>${E(t)}</li>`).join('')}</ol>${contents ? `<h3>What is inside</h3><ul class="cm-pack-contents">${contents}</ul>` : ''}<h3>Inputs, permissions and cost</h3><p>Reads only the chapter content and reference assets you choose, and outputs a candidate for your confirmation. This version runs no external code and fetches no keys.</p><p class="cm-license"><strong>License.</strong> ${E(it.license || 'Usable in your own creative projects; no resale as-is. Formal licensing must be explicitly confirmed by the creator.')}</p></section></div><aside class="cm-panel"><span class="cm-kicker">ADD TO YOUR LIBRARY</span><h2>${owns ? 'In your library' : it.price ? '✦ ' + it.price + ' credits' : 'Free claim'}</h2><p>Resources are bought once; model calls are billed separately by usage. The prototype only simulates credits and creates no real transactions.</p>${btn(owns ? 'Use in the current chapter' : 'Add to my library', owns ? 'use-market' : 'buy-market', 'cm-button primary full', `data-id="${it.id}"`)}${C.scopePicker()}<div class="cm-notice">When you use it, you'll see what will be added or applied; existing works aren't overwritten.</div>${link('View the credits ledger','/app/wallet','cm-text-link')}</aside></div>`;
  }
  function workLabel(w){return w.type==='motion'?'Video':w.type==='both'?'Comic and video':'Comic';}
  function workCard(w){
    const chapters=w.chapters||[];
    return link(`<div class="cm-work-picture">${art(w.art,w.title)}<span>${workLabel(w)}</span>${w.local?'<b>Local publish</b>':''}</div><div class="cm-work-copy"><h3>${E(w.title)}</h3><div class="cm-work-info"><p>${E(w.author)} <small>· ${E(w.tag||'Original work')}</small></p><div class="cm-work-meta"><span>${chapters.length||1} ${chapters.length===1?'chapter':'chapters'}</span><span>${E(w.published||'Sample work')}</span></div></div></div>`,'/app/community/'+w.id,'cm-work-card');
  }
  const SHOWCASE_TABS = ['Featured', 'Latest updates', 'Following', 'Saved', 'My publishes'];
  const SHOWCASE_KINDS = [['All', 'all'], ['Story', 'story'], ['Comic', 'comic'], ['Video', 'motion'], ['Image and sound', 'image']];
  function showcaseLibrary() { return [...M.db.publications, ...works]; }
  function showcaseFilter() {
    const tab = ui.galleryTab || 'Featured';
    const kind = ui.galleryGenre || 'all';
    const query = String(ui.galleryQuery || '').trim().toLowerCase();
    let list = showcaseLibrary();
    if (tab === 'Latest updates') list = [...list].sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));
    if (tab === 'Following') list = list.filter((w) => M.db.follows.includes(w.id));
    if (tab === 'Saved') list = list.filter((w) => M.db.favorites.includes(w.id));
    if (tab === 'My publishes') list = list.filter((w) => w.local);
    if (kind !== 'all') list = list.filter((w) => (w.kinds || [w.type]).includes(kind));
    if (query) list = list.filter((w) => [w.title, w.author, w.tag, w.desc].filter(Boolean).join(' ').toLowerCase().includes(query));
    return list;
  }
  function showcaseList() {
    const list = showcaseFilter();
    if (!list.length) {
      const text = String(ui.galleryQuery || '').trim()
        ? 'No work matches that search. Try another title, author or genre.'
        : (ui.galleryTab || 'Featured') === 'Following'
          ? 'You are not following anyone yet. Follow a creator from a work page and their updates land here.'
          : (ui.galleryTab || 'Featured') === 'My publishes'
            ? 'Nothing published under this local account yet. Open a project and publish a work snapshot.'
            : 'Nothing here yet. Save a world you like, or publish your own snapshot.';
      return `<div class="cm-empty-small">${text}</div>`;
    }
    return list.map(workCard).join('');
  }
  function community(ctx) {
    const list = showcaseLibrary();
    const w = ctx.parts[2] && list.find((item) => item.id === ctx.parts[2]);
    if (ctx.parts[2]) return w ? workDetail(w) : S.empty('Work not found', 'Back to Showcase.', 'Showcase', '/app/community');
    const tab = ui.galleryTab || 'Featured';
    const kind = ui.galleryGenre || 'all';
    const feature = tab === 'Featured'
      ? `<div class="cm-gallery-feature">${art(10,'Star Sea Post Office, original fantasy world')}<div><h2>Star Sea Post Office</h2><p>Send the words left unsaid to where the stars live.</p>${link('Step into this world','/app/community/sky-public','cm-button glass')}</div></div>`
      : '';
    const tabs = `<div class="cm-showcase-tabs cm-segment-group" role="tablist" aria-label="Showcase feeds">${SHOWCASE_TABS.map((t) => btn(t, 'gallery-tab', 'cm-showcase-tab' + (tab === t ? ' selected' : ''), `data-tab="${t}" role="tab" aria-selected="${tab === t}"`)).join('')}</div>`;
    const filters = `<div class="cm-showcase-bar"><div class="cm-filter-tabs cm-segment-group" role="group" aria-label="Filter by kind">${SHOWCASE_KINDS.map(([label, key]) => btn(label, 'gallery-genre', kind === key ? 'selected' : '', `data-genre="${key}"`)).join('')}</div><div class="cm-showcase-search"><span>Search</span>${CimoraSearchField.render(`<input type="search" data-cm-input="gallery-search" value="${E(ui.galleryQuery||'')}" placeholder="Title, author or genre" aria-label="Search works">`)}</div></div>`;
    return heading('','Every kind of imagination deserves to be seen.','Meet new characters, worlds and creators. Official site cases and public works each have their place here.',btn('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>Publish','publish-work','cm-button primary cm-showcase-publish'))
      + tabs + feature + filters
      + `<div class="cm-gallery-grid" id="cm-gallery-grid">${showcaseList()}</div>`;
  }
  function workDetail(w) {
    const chapters = w.chapters || [];
    const favor = M.db.favorites.includes(w.id);
    const follow = M.db.follows.includes(w.id);
    const openId = chapters.some((c) => c.id === ui.openChapter) ? ui.openChapter : null;
    const open = chapters.find((c) => c.id === openId) || null;
    const mode = ui.readMode || 'Pages';
    const unlocked = (cid) => M.db.unlocks.includes(w.id + '/' + cid);
    const rows = chapters.map((c, i) => {
      const isOpen = c.id === openId;
      const has = !!c.free || unlocked(c.id);
      const pill = c.free
        ? '<span class="cm-chapter-pill accent">Free</span>'
        : has
          ? '<span class="cm-chapter-pill">Unlocked</span>'
          : `<span class="cm-chapter-pill">✦ ${c.price} credits</span>`;
      const action = has
        ? btn(isOpen ? 'Reading' : 'Read chapter', 'read-chapter', 'cm-button ghost small', `data-id="${c.id}"`)
        : btn('Unlock', 'unlock-chapter', 'cm-button primary small', `data-id="${c.id}"`);
      return `<div class="cm-chapter-row${isOpen ? ' open' : ''}"><span class="cm-chapter-number">${String(i + 1).padStart(2, '0')}</span><div><strong>${E(c.title)}</strong><small>${c.pages} ${c.pages === 1 ? 'page' : 'pages'}${c.text ? ' · with story text' : ''}</small></div>${pill}${action}</div>`;
    }).join('');
    const modes = open
      ? `<div class="cm-reader-modes" role="group" aria-label="Reading mode">${['Story text', 'Comic pages', 'Shot list'].map((label) => btn(label, 'read-mode', 'cm-reader-mode' + (mode === label ? ' selected' : ''), `data-mode="${label}"`)).join('')}</div>`
      : '';
    let body = '';
    if (open && mode === 'Story text') {
      body = open.text
        ? `<div class="cm-story-text">${open.text.map((p) => `<p>${E(p)}</p>`).join('')}</div><p class="cm-help">Sample chapter text for the demo. The project script in the studio holds the full episode.</p>`
        : `<p class="cm-help">This chapter has no story text in the demo. Switch to Comic pages to see the page previews.</p>`;
    } else if (open && mode === 'Shot list') {
      body = open.shots
        ? `<ol class="cm-shot-list">${open.shots.map((s) => `<li><span>${String(s.n).padStart(2, '0')}</span><div><strong>${E(s.framing)}</strong><p>${E(s.action)}</p><small>${E(s.line)}</small></div></li>`).join('')}</ol><p class="cm-help">Shots carry the same panel and asset links as the storyboard in the studio; motion is not rendered in this demo.</p>`
        : `<p class="cm-help">This chapter has no shot list in the demo.</p>`;
    } else if (open) {
      body = `<div class="cm-reader-pages">${Array.from({ length: Math.min(open.pages, 4) }, (_, i) => `<figure>${art((w.art + i) % 12, open.title + ' sample page ' + (i + 1))}<figcaption>Page ${String(i + 1).padStart(2, '0')} / ${open.pages}</figcaption></figure>`).join('')}</div><p class="cm-help">Page previews only. Full page creation and export stay inside the studio.</p>`;
    }
    const reader = open
      ? `<div class="cm-reader"><header><h3>${E(open.title)}</h3><small>${open.pages} sample ${open.pages === 1 ? 'page' : 'pages'} · demo content, not a finished chapter</small></header>${modes}${body}</div>`
      : '';
    return `<div class="cm-work-detail"><section><div class="cm-work-feature">${art(w.art, w.title)}<span>${w.local ? 'LOCAL PUBLISH SNAPSHOT' : 'CIMORA ORIGINAL DEMO'}</span></div><div class="cm-panel"><div class="cm-panel-title"><div><h1>${E(w.title)}</h1><p class="cm-work-byline">${E(w.author)} · ${E(w.tag || 'Original work')}</p></div><div class="cm-inline-actions">${btn(follow ? 'Following' : 'Follow creator', 'follow-work', 'cm-button ghost' + (follow ? ' selected' : ''), `data-id="${w.id}"`)}${btn(favor ? 'Saved' : 'Save', 'favorite-work', 'cm-button ghost', `data-id="${w.id}"`)}</div></div><p class="cm-work-desc">${E(w.desc || 'Original demo work.')}</p><div class="cm-work-facts"><span>${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}</span><span>${workLabel(w)}</span><span>${E(w.published || 'Sample work')}</span></div><div class="cm-chapter-list">${rows || '<p class="cm-help">This work has no readable chapters yet.</p>'}</div>${reader}</div></section><aside class="cm-panel"><span class="cm-kicker">BEHIND THE STORY</span><h3>The craft behind the story.</h3><p>Showing a work and licensing its source pipeline are managed separately. Author prompts, assets and project files are never published here automatically.</p><ul class="cm-work-notes"><li>Chapters unlock with credits in this local demo.</li><li>Following a creator only fills the Following feed.</li><li>Reading never exposes the project file.</li></ul>${link('Browsing related creative resources','/app/market','cm-text-link')}</aside></div>`;
  }
  function wallet(){return heading('YOUR CREATIVE RESOURCES','Credits and resources','Purchases, claims and creator earnings are recorded separately. Credits are a local demo only.',link('Discover new assets ↗','/app/market','cm-button primary'))+`<div class="cm-wallet-overview"><section><span>Available credits</span><h2>✦ ${M.db.wallet}</h2><p>Local sample balance · no withdrawal · no real payment</p></section><section><span>My library</span><h2>${M.db.purchases.length}<small> items</small></h2><p>Skills, templates, workflows and asset packs</p></section></div><div class="cm-market-grid">${allCatalog().filter(it=>M.db.purchases.includes(it.id)).map(marketCard).join('')}</div><section class="cm-panel"><h3>Credits ledger</h3>${M.db.ledger.map(l=>`<div class="cm-ledger-row"><span>${E(l.title)}</span><small>${new Date(l.time).toLocaleDateString('en-GB')}</small><b>${l.delta>0?'+':''}${l.delta}</b></div>`).join('')||'<p>No credit changes yet. The starting demo balance is 680 credits.</p>'}<p class="cm-help">Model run budgets are shown separately in USD examples and are not deducted from this balance.</p></section>`;}
  const CREATOR_TABS = ['Works', 'Asset packs', 'Earnings'];
  function creator() {
    const tab = ui.creatorTab || 'Works';
    const published = M.db.publications || [];
    const drafts = M.db.drafts || [];
    const earned = (M.db.ledger || []).filter((l) => l.delta > 0);
    const earnedTotal = earned.reduce((sum, l) => sum + l.delta, 0);
    const tabs = `<div class="cm-showcase-tabs cm-segment-group" role="tablist" aria-label="Creator center">${CREATOR_TABS.map((t) => btn(t, 'creator-tab', 'cm-showcase-tab' + (tab === t ? ' selected' : ''), `data-tab="${t}" role="tab" aria-selected="${tab === t}"`)).join('')}</div>`;
    const worksPanel = `<section class="cm-panel"><div class="cm-panel-title"><h3>Published works</h3><small>${published.length} ${published.length === 1 ? 'work' : 'works'}</small></div>${published.map((p) => `<div class="cm-candidate-row"><div><strong>${E(p.title)}</strong><p>${E(p.author)} · snapshot of ${E(p.snapshot?.chapter || 'one chapter')} · ${p.type === 'motion' ? 'Video' : 'Comic'}</p></div><div class="cm-inline-actions">${link('View page','/app/community/' + p.id,'cm-button ghost small')}</div></div>`).join('') || '<p class="cm-help">Nothing published yet. Open a project, pick a chapter and publish a work snapshot; the project file itself stays private.</p>'}</section>`;
    const packPanel = `<section class="cm-panel"><div class="cm-panel-title"><h3>Asset packages</h3><small>${drafts.length} ${drafts.length === 1 ? 'draft' : 'drafts'}</small></div>${drafts.map((d) => `<div class="cm-candidate-row"><div><strong>${E(d.title)}</strong><p>${E(d.type)} · ${d.price} credits · ${d.published ? 'Listed in this local demo' : 'Draft, not listed'}</p></div>${btn(d.published ? 'View page' : 'Preview and list', d.published ? 'open-market' : 'publish-resource', 'cm-button ghost small', `data-id="${d.id}"`)}</div>`).join('') || '<p class="cm-help">No package drafts. Group results from your asset library, write the contents and license, then preview the listing.</p>'}<p class="cm-help">A listing needs contents, usage scope and license. Publishing a draft never awards credits directly.</p></section>`;
    const earningsPanel = `<section class="cm-panel"><div class="cm-wallet-overview"><section><span>Credits earned</span><h2>✦ ${earnedTotal}</h2><p>Local demo balance · no payout</p></section><section><span>Sales recorded</span><h2>${earned.length}<small> entries</small></h2><p>Valid transactions only</p></section></div>${earned.map((l) => `<div class="cm-ledger-row"><span>${E(l.title)}</span><small>${new Date(l.time).toLocaleDateString('en-GB')}</small><b>+${l.delta}</b></div>`).join('') || '<p class="cm-help">No earnings recorded yet. Earnings come from valid transactions, not from uploading a draft.</p>'}<p class="cm-help">All amounts here are simulated; no real payment or payout happens in this prototype.</p></section>`;
    return heading('SHARE WHAT YOU KNOW','Turn a method that works into the next spark of inspiration.','Publish works and asset packages, and keep the receipts in one place. Earnings come from valid transactions; uploading a draft does not award credits.',btn('＋ Create asset draft','creator-draft','cm-button primary'))
      + tabs
      + (tab === 'Works' ? worksPanel : tab === 'Asset packs' ? packPanel : earningsPanel);
  }
  function tasks(){return C.tasks();}
  function publicHome(){return `<main class="cm-public-home"><header class="cm-public-hero"><img src="assets/cimora-cover.webp" alt="Cimora original anime fantasy world"><div class="cm-public-hero-copy"><span class="cm-kicker">FOR EVERY WORLD INSIDE YOU</span><h1>Your imagination<br>deserves a <span>universe.</span></h1><p>From a single spark of inspiration to a chapter of comic, then to a story that moves.<br>At Cimora, create the world you love with your own hands.</p><div>${link('进入Creation Space ↗','/app','cm-button primary large')}${link('探索作品','/app/community','cm-button glass large')}</div><small>Story co-creation / Unified assets / Free canvas / Motion staging</small></div><div class="cm-public-art-caption">ORIGINAL WORLD NO.001<br><strong>Sea of Stars Post Office / LETTERS TO THE STARS</strong></div></header><section class="cm-public-manifesto"><span>YOUR STORY.</span><i>✦</i><span>YOUR CHARACTERS.</span><i>✦</i><span>YOUR UNIVERSE.</span></section><section class="cm-public-section"><span class="cm-kicker">FROM YOUR FIRST SPARK</span><h2>Inspiration does not have to be complete,<br>a story can grow with you.</h2><div class="cm-public-entry-grid">${[['✧','只有一句灵感','从故事方向、大纲到 chapters内容。','idea'],['▤','想让小说被看见','提炼人物、动作与可视化分镜。','novel'],['▦','已经拥有Comic','让panel、Character和对白Continue成为动态故事。','comic']].map(([ic,h,p,v])=>link(`<span>${ic}</span><h3>${h}</h3><p>${p}</p><b>开始创作 ↗</b>`,'/app/new?source='+v,'')).join('')}</div></section><section class="cm-public-split"><div>${art(6,'雨停之前原创二次元作品')}</div><article><span class="cm-kicker">ONE WORLD, MANY WAYS TO CREATE</span><h2>One story,<br>more than one way to tell it.</h2><p>Comics pace emotion with empty space, while video carries the story on with shots and sound. Characters, scenes, props and every edit stay connected in the same pipeline.</p><div>${link('☷ 跟着Flow开始','/app/new','cm-button primary')}${link('⌘ 打开自由Canvas','/app/new?view=canvas','cm-button ghost')}</div></article></section><section class="cm-public-section"><div class="cm-section-head"><div><span class="cm-kicker">CREATED, NOT JUST GENERATED</span><h2>Every creation leaves a trace.</h2></div>${link('体验制作编排 →','/app/tasks','cm-text-link')}</div><div class="cm-public-benefits">${[['◈','Character始终属于你的世界',' items目与 chapters固定引用资产版本，修改后只同步受影响的画面。'],['⌘','按自己的习惯创作','在Flow和无限Canvas之间切换，内容、依赖和候选始终相连。'],['↶','好作品，留有余地','成功结果保留，失败步骤单独重试，增强不覆盖稳定底稿。']].map(([ic,h,p])=>`<article><span>${ic}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section><section class="cm-public-section"><div class="cm-section-head"><div><span class="cm-kicker">A UNIVERSE OF CREATORS</span><h2>Meet new worlds, and share your own.</h2></div>${link('走进Showcase →','/app/community','cm-text-link')}</div><div class="cm-discovery-row">${works.slice(0,3).map(workCard).join('')}</div></section><section class="cm-public-cta"><span>✦</span><h2>The next work you love,<br>might come from your hands.</h2>${link('开始创造你的宇宙 ↗','/app','cm-button primary large')}<p>Cimora · anime story creation space</p></section></main>`;}
  function showcaseWork(id){return showcaseLibrary().find(w=>w.id===id)||null;}
  C.pages={home,projects,new:newProject,assets,tasks,market,community,wallet,creator};C.publicHome=publicHome;C.catalog=allCatalog;C.projectList=projectList;C.assetList=assetList;C.scopedAssets=scopedAssets;C.works=()=>[...M.db.publications,...works];C.showcaseList=showcaseList;C.showcaseWork=showcaseWork;
})();
