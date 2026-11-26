(()=>{
  'use strict';
  const S=Site,C=Cimora,M=C.M,T=ToolCatalog,E=S.esc,copy=value=>JSON.parse(JSON.stringify(value));
  const legacy=S.tools,legacyResult=legacy.renderResult;
  let store,storageError='',group='全部',query='',active='',selectedSnapshot=null,pickerSnapshot=null,pickerProject='';
  try{store=ToolResults.create({storage:localStorage,id:S.id});}catch(error){storageError=error.message;}
  const dialogues=['那家书店，还在原来的地方。','七年了，你还记得我吗？','我以为，你不会再来了。','有些话，写了很久也没寄出去。'];
  const textDefault=tool=>tool.kind==='motion'?'镜头缓慢推进，保持角色脸部清晰，营造雨夜重逢的氛围。':tool.id==='voiceover'?'三年了，没想到离开这座城市之前，还能收到你的消息。':tool.id==='background-music'?'雨夜街头的重逢，缓慢、克制，带一点期待，不要人声。':tool.id==='sound-effects'?'深夜的街边，下着细雨。':tool.id==='oc-sheet'?'原创角色，银色短发、蓝色外套，喜欢旅行。':tool.id==='storyboard'?'女孩推开书店的门，与久别的朋友重逢。':tool.id==='image-gen'?'一个在星海邮局工作的二次元女孩，手持发光信封。':'';
  const draft=tool=>({prompt:tool.id==='oc-sheet'?ToolOC.samplePrompt:textDefault(tool),option:tool.options[0],inputs:{},order:[0,1,2,3],dialogues:copy(dialogues),...store?.draft(tool.id)});
  const action=(label,name,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-ts="${name}" ${extra}>${label}</button>`;
  const href=id=>'/app/tools/'+id;
  function note(tool){if(tool&&ToolLightTasks.isTask(tool))return '<p class="ts-note">本机演示 · 不调用模型。'+(tool.kind==='motion'?'真实图片运镜；人物动画待接入。':'手工核对与选区排字；自动识别、翻译待接入。')+'</p>';return '<p class="ts-note">本机示例演示 · 不调用模型。上传素材仅作输入参考，示例结果不代表已处理你的文件。</p>';}
  function notice(error){S.toast(error.message||String(error));const node=document.getElementById('ts-message');if(node)node.textContent=error.message||String(error);}
  function write(tool,patch){if(!store)throw Error(storageError);return store.update(tool.id,patch);}
  const cardDescriptions={"image-motion":"让单图动起来，或连接首尾两帧。","oc-sheet":"创建角色形象与人物设定。","pngtuber":"制作会随声音切换的角色形象。","expressions":"为角色补充表情和姿势。","lettering":"翻译漫画文字，调整画面排字。","colorize":"清理线稿，为画面上色。","batch-assets":"放大图片，或压缩文件体积。","sticker-maker":"添加配字，制作静态或动态表情包。","live2d-generation":"整理角色分层与绑定，预览动作。","anime-draw":"文字生图，或修改已有图片。","remove-bg":"移除背景，修补透明边缘。","video-redraw":"保留视频动作，调整画风与角色。","voiceover":"选择声音，为角色和旁白配音。","music-sound":"制作背景音乐、环境音与音效。"};
  function card(tool){return `<a class="ts-card" href="#${href(tool.id)}"><span class="ts-card-icon${tool.reviewRound?' ts-reviewed':''}" ${tool.reviewRound?'title="一轮通过" aria-label="一轮通过"':''}>${tool.reviewRound?'★':tool.icon}</span><div><h3>${E(tool.title)}</h3><p>${E(cardDescriptions[tool.id]||tool.desc)}</p></div><b>↗</b></a>`;}
  const cardCovers={
    'image-motion':{images:['https://images.unsplash.com/photo-1699307558369-cdb8e8a9dbc2?auto=format&fit=crop&w=960&q=82']},
    'oc-sheet':{style:'sheet',images:['https://www.peppercarrot.com/0_sources/0ther/sketchbook/hi-res/2017-08-06_Pepper_s-model-sheet_by-David-Revoy.jpg']},
    'pngtuber':{style:'puppet',images:[
      'https://res.cloudinary.com/dol86wsz1/image/upload/c_limit,w_680,f_auto,q_auto:good/v1789853000/summer_transparent/nobg-1407d086a575-1789853000037_1789853000037_7xjk49qv.png',
      'https://res.cloudinary.com/dol86wsz1/image/upload/c_limit,w_680,f_auto,q_auto:good/v1789853008/summer_transparent/nobg-cd44ca97c2fe-1789853007793_1789853007793_wvnx7nlm.png'
    ]},
    'expressions':{style:'sheet',images:['https://www.peppercarrot.com/0_sources/0ther/sketchbook/hi-res/2018-04-11_Pepper-expression-study-for-episode-30_by-David-Revoy.jpg']},
    'lettering':{images:['https://www.peppercarrot.com/0_sources/ep01_Potion-of-Flight/low-res/en_Pepper-and-Carrot_by-David-Revoy_E01P02.jpg']},
    'colorize':{style:'colorize',images:[
      'https://opengameart.org/sites/default/files/lineart_transparent_file.png',
      'https://opengameart.org/sites/default/files/png_transparent_file_0.png'
    ]},
    'batch-assets':{images:['https://images.unsplash.com/photo-1773047747721-f75d546d7290?auto=format&fit=crop&w=960&q=82']},
    'sticker-maker':{style:'stickers',images:['https://kenney.nl/media/pages/assets/emotes-pack/0cae06c6af-1677578794/preview.png']},
    'live2d-generation':{style:'rig',images:['https://opengameart.org/sites/default/files/Character_Bones.png']},
    'anime-draw':{images:['https://images.unsplash.com/photo-1758521232750-909a8b065963?auto=format&fit=crop&w=960&q=82']},
    'remove-bg':{style:'cutout',images:[
      'https://opengameart.org/sites/default/files/png_transparent_file_0.png',
      'https://opengameart.org/sites/default/files/png_transparent_file_0.png'
    ]},
    'video-redraw':{images:['https://images.unsplash.com/photo-1764557175375-9e2bea91530e?auto=format&fit=crop&w=960&q=82']},
    'voiceover':{images:['https://images.unsplash.com/photo-1701491086385-83b8cefeb4fe?auto=format&fit=crop&w=960&q=82']},
    'music-sound':{images:['https://images.unsplash.com/photo-1789182219782-748f25a6c4f9?auto=format&fit=crop&w=960&q=82']},
  };
  function coverCard(tool){
    const cover=cardCovers[tool.id];
    const art=cover?.images.map(src=>`<span class="ts-cover-frame"><img src="${E(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`).join('')||'';
    return `<a class="ts-card ts-cover-card" href="#${href(tool.id)}">
      <span class="ts-cover-art" data-cover="${cover?.style||'image'}" aria-hidden="true">${art}</span>
      <div class="ts-cover-copy"><h3>${tool.id==='oc-sheet'?'OC Character Sheet':E(tool.title)}</h3><p>${E(cardDescriptions[tool.id]||tool.desc)}</p></div>
      <span class="ts-cover-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M8 6h10v10"/></svg></span>
    </a>`;
  }
  function filtered(){return T.all().filter(tool=>(group==='全部'||tool.group===group)&&(`${tool.title} ${tool.desc} ${tool.group} ${tool.id}`).toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>Number(!!a.secondary)-Number(!!b.secondary));}
  function catalogCards(items,publicCatalog){
    return items.map(publicCatalog?coverCard:card).join('')||'<p class="ts-empty">No matching tools. Try another keyword or select All.</p>';
  }
  function refreshCatalog(){
    const grid=document.getElementById('ts-grid');
    const items=filtered();
    grid.innerHTML=catalogCards(items,grid.classList.contains('ts-cover-grid'));
    document.getElementById('ts-count').textContent=items.length+' 项';
  }
  function list(publicCatalog=false){
    active='';S.pageTitle='创作工具';
    const items=filtered();
return `<main class="ts-page"><header class="ts-heading"><div><h1 class="cm-workspace-title">创作工具</h1></div></header>${storageError?`<p role="alert">${E(storageError)}</p>`:''}<div class="ts-catalog-toolbar"><nav class="ts-groups cm-segment-group" aria-label="工具分类">${T.groups.map(name=>action(name,'group',`data-value="${name}" aria-pressed="${group===name}"`)).join('')}</nav>${CimoraSearchField.render(`<input id="ts-search" type="search" aria-label="搜索工具" placeholder="搜索图片、角色、Live2D、配音…" value="${E(query)}">`, "ts-search")}</div><div class="ts-count"><span id="ts-count">${items.length} 项</span></div><div class="ts-grid${publicCatalog?' ts-cover-grid':''}" id="ts-grid">${catalogCards(items,publicCatalog)}</div></main>`;
  }
  function inputSlot(tool,value,role,label,accept='image/png,image/jpeg,image/webp',multiple=false){const input=value.inputs[role];return `<label class="ts-upload">${E(label)}<input type="file" data-ts-upload="${role}" accept="${accept}" ${multiple?'multiple':''}>${input?`<small>${E(input.name)} · 已保留本机参考</small>${input.src?`<img src="${E(input.src)}" alt="${E(label)}输入参考">`:'<small>文件未处理，刷新后需重选文件才能重新预览</small>'}`:'<small>可选；也可直接使用示例</small>'}</label>`;}
  function inputs(tool,value){
    if(ToolLightTasks.isTask(tool))return inputSlot(tool,value,'main',tool.input)+ToolLightTasks.inputs(tool,value);
    if(tool.kind==='audio')return tool.id==='voiceover'?`<label>语速<select id="ts-rate">${[.8,1,1.2].map(rate=>`<option value="${rate}" ${Number(value.rate||1)===rate?'selected':''}>${rate} 倍</option>`).join('')}</select></label>`:'';
    if(['sheet','image','storyboard'].includes(tool.kind))return '';
    if(tool.kind==='keyframes')return `<div class="ts-input-pair">${inputSlot(tool,value,'first','首帧：动作起点')}${inputSlot(tool,value,'last','尾帧：动作终点')}</div>`;
    if(tool.kind==='checks')return inputSlot(tool,value,'reference','角色参考')+inputSlot(tool,value,'check','待检查图片','image/png,image/jpeg,image/webp',true);
    if(tool.kind==='continuity')return '<p>章节连续性：上传前后章节参考，仅演示报告；不会自动读取或检测作品正文。</p>'+inputSlot(tool,value,'before','前章参考')+inputSlot(tool,value,'after','后章参考');
    return inputSlot(tool,value,'main',tool.kind==='redraw'?'参考封面（真实视频转绘待接）':tool.input,['rig','live2d'].includes(tool.kind)?'image/png,image/jpeg,image/webp,.psd':tool.kind==='quality'?'image/*,video/*':'image/png,image/jpeg,image/webp',tool.kind==='batch');
  }
  function refreshUpload(tool,role){
    if(active!==tool.id)return;
    const template=document.createElement('template');template.innerHTML=inputs(tool,draft(tool));
    const current=document.querySelector(`[data-ts-upload="${role}"]`)?.closest('.ts-upload');
    const replacement=template.content.querySelector(`[data-ts-upload="${role}"]`)?.closest('.ts-upload');
    if(current&&replacement)current.replaceWith(replacement);
    if(ToolLightTasks.isTask(tool)){const fresh=template.content.querySelector('.tl-task');document.querySelector('.tl-task')?.replaceWith(fresh);}
    const result=document.getElementById('ts-result');if(result)result.innerHTML=output(tool,draft(tool));
    document.querySelector('.ts-output>.ts-actions')?.remove();
    const status=document.querySelector('.ts-result-heading span');if(status)status.textContent='等待开始';
    const run=document.getElementById('ts-run');if(run)run.textContent=tool.kind==='lettering'?'生成排字预览':tool.kind==='motion'?'生成运镜预览':'生成示例结果';
    const message=document.getElementById('ts-message');if(message)message.textContent='素材已更新，请生成预览。';
  }
  function translated(value){return value.translated??(value.option==='日语'?'ずっと、伝えたかった。':value.option==='简体中文'?'有些话，终于能说出口。':'Some words took years to find their way to you.');}
  function output(tool,value){
    if(!value.ready)return '<div class="ts-empty"><span>✧</span><h3>结果将在这里展示</h3><p>生成清楚标记的示例结果，可修改、下载或保存。</p></div>';
    if(tool.kind==='audio')return ToolAudio.output(value.audio);
    if(ToolLightTasks.isTask(tool))return ToolLightTasks.output(tool,value);
    if(['image','edit','transparent','keyframes','redraw'].includes(tool.kind)){
      const images=value.preview||[];return `<div class="ts-preview ${tool.kind==='transparent'?'ts-checker':''}">${images.map(image=>`<figure><img src="${E(image.src)}" alt="${E(tool.title)}示例"><figcaption>${E(image.role==='first'?'首帧参考':image.role==='last'?'尾帧参考':'示例结果 · 非上传素材处理')}</figcaption></figure>`).join('')}</div><p>${E(value.generatedPrompt||'使用默认示例')}</p>${tool.kind==='keyframes'?'<p>首尾参考用于动作方案，尚未生成中间帧或视频。</p>':''}`;
    }
    const result={...value,characterName:value.generatedPrompt?.split(/[，,。\n]/)[0]||'示例角色',prompt:value.generatedPrompt||value.prompt,option:value.generatedOption||value.option};
    const renderLegacy=(S.tools&&S.tools.renderResult)||legacyResult;
    let html=typeof renderLegacy==='function'
      ? renderLegacy(tool.kind==='live2d'?{...tool,kind:'rig'}:tool,result)
      : `<div class="ts-empty"><h3>${E(tool.output||tool.title)}</h3><p>Sample ready to save or download.</p></div>`;
    if(tool.kind==='lettering')html=html.replace(/(<span class="bubble translated" id="translated-bubble">)[\s\S]*?(<\/span>)/,(_,open,close)=>open+E(translated(value))+close).replace(/(<textarea id="translated-text">)[\s\S]*?(<\/textarea>)/,(_,open,close)=>open+E(translated(value))+close);
    return html;
  }
  function detail(tool,original){
    if(tool.id==='music-sound')return detail(T.find(S.context.params.get('type')==='effects'?'sound-effects':'background-music'),original);
    if(tool.id==='anime-draw'&&store&&!Object.keys(store.draft(tool.id)).length){
      const keys=[T.aliases[original]?.legacy,'image-gen','image-edit'].filter(Boolean),legacyKey=keys.find(key=>Object.keys(store.draft(key)).length);
      if(legacyKey)write(tool,ToolDraw.migrate(store.draft(legacyKey),legacyKey));
    }
    if(tool.id==='live2d-generation'&&store&&!Object.keys(store.draft(tool.id)).length){
      const keys=[T.aliases[original]?.legacy,'live2d-layers','live2d-rig'].filter(Boolean),legacyKey=keys.find(key=>Object.keys(store.draft(key)).length);
      if(legacyKey){const previous=store.draft(legacyKey);write(tool,{...previous,option:tool.options[0],ready:false,dirty:false,migratedFrom:legacyKey});}
    }
    active=tool.id;const value=draft(tool),preset=T.aliases[original]?.preset;
    if(tool.id==='video-redraw'){S.pageTitle=tool.title;return ToolRedraw.render(value);}
    if(tool.id==='pngtuber'){S.pageTitle=tool.title;return ToolPNGTuber.render(value);}
    if(tool.id==='voiceover'){S.pageTitle=tool.title;return ToolVoiceover.render(value);}
    if(tool.id==='background-music'||tool.id==='sound-effects'){
      S.pageTitle='音乐与音效';
      const effects=tool.id==='sound-effects';
      const html=effects?ToolSound.render(value):ToolMusic.render(value);
      const navigation=`<nav class="ts-sound-modes" aria-label="声音创作类型">${S.link('背景音乐','/app/tools/music-sound?type=music','cm-button '+(!effects?'primary':'ghost'))}${S.link('环境音与动作音效','/app/tools/music-sound?type=effects','cm-button '+(effects?'primary':'ghost'))}</nav>`;
      return html.replace('<h1>'+tool.title+'</h1>','<h1>音乐与音效</h1>').replace('</header>','</header>'+navigation);
    }
    if(tool.id==='image-motion'){
      const alias=T.aliases[original],initial=ToolMotion.prepare(value,store.draft('keyframes'),alias?.mode);
      if(initial)Object.assign(value,write(tool,initial));
      else if(alias?.mode&&value.motionMode!==alias.mode)Object.assign(value,write(tool,{motionMode:alias.mode}));
      if(alias?.mode)history.replaceState(null,'','#/app/tools/image-motion');
      S.pageTitle=tool.title;return ToolMotion.render(value);
    }
    if(tool.id==='anime-draw'){S.pageTitle=tool.title;return ToolDraw.render(value);}
    if(tool.id==='oc-sheet'){S.pageTitle=tool.title;return ToolOC.render(value);}
    if(tool.id==='expressions'){S.pageTitle=tool.title;return ToolPerformance.render(value);}
    if(tool.id==='colorize'){S.pageTitle=tool.title;return ToolColor.render(value);}
    if(tool.id==='remove-bg'){S.pageTitle=tool.title;return ToolCutout.render(value);}
    if(tool.id==='batch-assets'){S.pageTitle=tool.title;return ToolOptimize.render(value);}
    if(tool.id==='sticker-maker'){S.pageTitle=tool.title;return ToolSticker.render(value);}
    if(preset&&!value.preset){value.option=preset;value.preset=preset;write(tool,{option:preset,preset});}
    S.pageTitle=tool.title;
    const context=S.context.params.get('from');
    return `<main class="ts-page ts-detail ${tool.kind==='live2d'?'ts-live2d':''}${tool.id==='lettering'?' tw-v2':''}"><header class="ts-heading"><div>${S.link('← 创作工具','/app/tools','cm-text-link')}<h1>${E(tool.title)}</h1><p>${E(tool.desc)}</p></div>${tool.id==='lettering'?ToolDetailLayout.assetLibraryLink():S.link('资产库 ↗','/app/assets?assetSource=tools','cm-button ghost')}</header>${context?`<p class="ts-note">从${E(context)}打开。结果仍先保存为个人成果，带入作品需显式选择目标。</p>`:''}${note(tool)}${storageError?`<p role="alert">${E(storageError)}</p>`:''}<div class="ts-workbench"><section class="ts-panel"><h2>输入与设置</h2><form id="ts-form">${inputs(tool,value)}${tool.kind==='lettering'?'<details><summary>排字备注（可选）</summary>':''}<label>${tool.kind==='motion'?'描述想要的动作或氛围':tool.kind==='lettering'?'排字备注（随成果保存）':tool.kind==='audio'?(tool.id==='voiceover'?'配音文案':'声音描述'):'描述或修改要求'}<textarea id="ts-prompt" rows="4" placeholder="${tool.kind==='audio'?'输入台词、旁白或声音氛围…':'写下你想要的画面或调整…'}">${E(value.prompt)}</textarea></label>${tool.kind==='lettering'?'</details>':''}<label>${E(tool.param)}<select id="ts-option">${tool.options.map(option=>`<option ${value.option===option?'selected':''}>${E(option)}</option>`).join('')}</select></label>${tool.kind==='batch'?'<label><input type="checkbox" id="ts-batch"> 批量整理（示例）</label>':''}<div class="tw-run-actions">${action('使用示例输入','sample')}<button type="submit" class="cm-button primary" id="ts-run">${tool.kind==='lettering'?'生成排字预览':tool.kind==='motion'?'生成运镜预览':value.ready?'重新生成示例':'生成示例结果'}</button></div><p id="ts-message" role="status">${value.dirty?'输入已修改，当前结果为上一次示例，请重新生成。':''}</p></form><p class="ts-note">${ToolLightTasks.isTask(tool)?'输入与选区保存在本机草稿，修改后重新生成预览。':'上传文件保存在本机草稿；PSD及视频仅保留文件信息，不进行解析。请勿将示例当作真实处理结果。'}</p></section><section class="ts-panel ts-output"><div class="ts-result-heading"><h2>结果</h2><span>${value.ready?'示例已就绪':'等待开始'}</span></div><div id="ts-result">${output(tool,value)}</div>${value.ready?`<div class="ts-actions">${action('保存到资产库','save','',true)}${['audio','live2d'].includes(tool.kind)?'':action('带入作品','bring')}${action('下载当前结果','download')}</div><p class="ts-note">${tool.kind==='live2d'?'保存本次分层与绑定方案，下载 JSON 资料清单；旧成果保留。':tool.kind==='motion'?'保存独立方案；下载可离线播放的 HTML，暂不输出 MP4。':tool.kind==='lettering'?'保存独立成果；下载当前译文排字 PNG。':'每次保存生成独立快照，旧成果保留。图片任务下载PNG；多图/动态方案下载HTML清单；质检和资料下载JSON；音乐和音效下载WAV，配音下载离线试听页。'}</p>`:''}</section></div></main>`;
  }
  async function imageData(src){const image=new Image();image.src=src;await image.decode();return image;}
  async function compactReference(src){const image=await imageData(src),scale=Math.min(1,900/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.82);}
  function textLines(context,text,width){const lines=[];let content='';for(const char of String(text||'')){if(char==='\n'||context.measureText(content+char).width>width){lines.push(content);content=char==='\n'?'':char;}else content+=char;}lines.push(content);return lines;}
  function wrapText(context,text,x,y,width,line=23){const lines=textLines(context,text,width);lines.forEach((content,index)=>context.fillText(content,x,y+index*line));return y+lines.length*line;}
  function imageRoles(tool){return tool.kind==='keyframes'?['first','last']:tool.kind==='panels'?['panel-1','panel-2','panel-3','panel-4']:tool.kind==='sheet'?['肖像参考','表情参考','服装参考']:tool.kind==='expressions'?['平静','微笑','惊讶','回望','低头','期待']:tool.kind==='storyboard'?['建立书店与雨景','林夏推门抬头','陈序回应目光','信封作为情绪转折']:['main'];}
  async function renderImage(tool,value,role='main',index=0){
    if(tool.kind==='keyframes'&&value.inputs[role]?.src)return value.inputs[role].src;
    const canvas=document.createElement('canvas');canvas.width=540;const ctx=canvas.getContext('2d');ctx.font='23px sans-serif';
    const descriptions=[value.generatedPrompt||value.prompt,'预设：'+(value.generatedOption||value.option),...(role==='main'?[]:[role]),...(tool.kind==='lettering'?[translated(value)]:[]),...(tool.kind==='panels'?[value.dialogues[index]]:[])];
    const logicalHeight=Math.max(1100,820+descriptions.reduce((rows,text)=>rows+textLines(ctx,text,830).length*23+10,0)+70);
    canvas.height=tool.kind==='transparent'?540:Math.ceil(logicalHeight*.6);ctx.scale(.6,.6);
    if(tool.kind!=='transparent'){ctx.fillStyle='#f1edf8';ctx.fillRect(0,0,900,logicalHeight);}
    const source=tool.kind==='panels'?value.order[index]:tool.kind==='sheet'?[1,8,6][index]:tool.kind==='expressions'?[1,8,3,6,4,9][index]:tool.kind==='storyboard'?index:tool.kind==='keyframes'?(role==='first'?1:3):tool.kind==='lettering'?3:tool.art;
    const image=await imageData(Art.url(source));
    if(tool.kind==='transparent'){ctx.save();ctx.beginPath();ctx.ellipse(450,450,330,385,0,0,Math.PI*2);ctx.clip();ctx.drawImage(image,80,50,740,800);ctx.restore();ctx.fillStyle='#594584';ctx.font='24px sans-serif';ctx.fillText('透明底示例 · 非上传图抠图结果',130,870);}
    else{ctx.fillStyle='#28223b';ctx.font='bold 32px sans-serif';ctx.fillText(tool.title+' · 示例',35,53);ctx.drawImage(image,35,85,830,650);ctx.font='23px sans-serif';let row=780;for(const description of descriptions)row=wrapText(ctx,description,35,row+10,830);ctx.font='18px sans-serif';ctx.fillText('Cimora · 本机示例 / 未调用模型 / 非上传图处理成品',35,logicalHeight-30);}
    return canvas.toDataURL(tool.kind==='transparent'?'image/png':'image/webp',.8);
  }
  async function generate(tool){
    const value=draft(tool);if(tool.kind==='keyframes'&&!!value.inputs.first!==!!value.inputs.last)throw Error('请同时选择首帧和尾帧，或清空后直接使用完整示例。');
    if(tool.kind==='audio'&&!value.prompt.trim())throw Error(tool.id==='voiceover'?'请填写配音文案。':'请描述想要的声音。');
    const next={...value,ready:true,dirty:false,generatedPrompt:value.prompt,generatedOption:value.option,generatedAt:new Date().toISOString()};
    if(ToolLightTasks.isTask(tool))Object.assign(next,await ToolLightTasks.generate(tool,value));
    if(tool.kind==='audio'){ToolAudio.stop();next.audio=ToolAudio.generate(tool,value);}
    if(['image','edit','transparent','keyframes','redraw'].includes(tool.kind)){const roles=tool.kind==='keyframes'?['first','last']:['main'];next.preview=await Promise.all(roles.map(async(role,index)=>({role,src:await renderImage(tool,next,role,index)})));}
    write(tool,next);S.render();
  }
  async function snapshot(tool){
    if(tool.id==='voiceover')return ToolVoiceover.snapshot(draft(tool));
    if(tool.id==='background-music')return ToolMusic.snapshot(draft(tool));
    if(tool.id==='sound-effects')return ToolSound.snapshot(draft(tool));
    if(tool.id==='pngtuber')return ToolPNGTuber.snapshot(draft(tool));
    if(tool.id==='video-redraw')return ToolRedraw.snapshot(draft(tool));
    if(tool.id==='image-motion')return ToolMotion.snapshot(draft(tool));
    if(tool.id==='anime-draw')return ToolDraw.snapshot(draft(tool));
    if(tool.id==='oc-sheet')return ToolOC.snapshot(draft(tool));
    if(tool.id==='expressions')return ToolPerformance.snapshot(draft(tool));
    if(tool.id==='colorize')return ToolColor.snapshot(draft(tool));
    if(tool.id==='remove-bg')return ToolCutout.snapshot(draft(tool));
    if(tool.id==='batch-assets')return ToolOptimize.snapshot(draft(tool));
    const value=draft(tool);if(!value.ready)throw Error('请先生成示例结果。');if(value.dirty)throw Error('输入有修改，请重新生成后保存当前成果。');
    if(tool.kind==='audio')return {toolId:tool.id,title:tool.title,kind:'audio',prototype:true,prompt:value.generatedPrompt,params:{option:value.generatedOption,rate:value.audio.rate},inputs:{},images:[],audio:copy(value.audio),notice:'本机声音示例；配音使用系统中文语音，音乐与音效为本地合成，未调用 AI 模型。',createdAt:value.generatedAt};
    const kind=tool.asset==='质检报告'?'report':['layers','rig','live2d','batch'].includes(tool.kind)?'document':'image';let images=[];
    if(kind==='image'){
      const roles=imageRoles(tool);
      images=ToolLightTasks.isTask(tool)?copy(value.preview||[]):await Promise.all(roles.map(async(role,index)=>({role,src:await renderImage(tool,value,role,index)})));
    }
    const inputs=Object.fromEntries(Object.entries(value.inputs).map(([role,input])=>[role,{name:input.name,size:input.size,type:input.type,...(tool.kind==='keyframes'?{imageRole:role}:{}),files:input.files?.map(file=>({name:file.name,size:file.size,type:file.type}))}]));
    return {toolId:tool.id,title:tool.title,kind,prototype:true,prompt:value.generatedPrompt,params:{option:value.generatedOption,preset:value.preset||'',batch:!!value.batch},inputs,images,motion:tool.kind==='motion'?{duration:10,preset:value.generatedOption,type:'css-panzoom',notice:'示例运镜方案，无真实视频。'}:undefined,edits:{region:value.taskRegion,original:value.generatedOriginal,translated:tool.kind==='lettering'?value.generatedTranslation:undefined,dialogues:value.dialogues,order:value.order},report:kind!=='image'?document.getElementById('ts-result')?.innerText||'工具示例资料':'',notice:ToolLightTasks.isTask(tool)?(tool.kind==='motion'?'本机 CSS 图片运镜方案，未生成真实视频或人物动画。':'手工选区覆盖与译文排字图片，未调用 OCR、翻译或背景修复模型。'):'本机示例成果；上传图未进行AI处理；无真实视频、PSD或绑定文件。输入仅记录文件信息，首尾参考保存在结果图片中。',createdAt:value.generatedAt};
  }
  const savedByTool=new Map();
  const assetURL=result=>'/app/assets?item='+encodeURIComponent('tool:'+result.id);
  function libraryFeedback(){
    const heading=document.querySelector('.ts-page .ts-heading');if(!heading)return;
    document.getElementById('ts-library-feedback')?.remove();
    const saved=savedByTool.get(active);
    if(saved)heading.insertAdjacentHTML('afterend',`<div id="ts-library-feedback" class="ts-library-feedback" role="status"><span>✓ 已保存到资产库</span>${S.link('查看资产 →',assetURL(saved),'cm-text-link')}</div>`);
  }
  function saveToLibrary(toolId,snapshot){
    if(!store)throw Error(storageError);
    const saved=store.save(toolId,snapshot);savedByTool.set(toolId,saved);libraryFeedback();S.toast('已保存到资产库');return saved;
  }
  function editingFeedback(){
    const id=S.context.params.get('fromAsset'),saved=id&&store?.list().find(item=>item.id===id&&T.find(item.toolId)?.id===active);
    const heading=document.querySelector('.ts-page .ts-heading');if(!saved||!heading)return;
    const message=saved.editorDraft?'正在编辑「'+saved.title+'」的副本，保存后新增资产。':'历史资产未记录编辑状态，已打开原工具的当前草稿。';
    heading.insertAdjacentHTML('afterend',`<div class="ts-editing-context"><span>${E(message)}</span><div>${S.link('返回资产',assetURL(saved),'cm-text-link')}${saved.editorDraft?S.link('返回工具原草稿',href(active),'cm-text-link'):''}</div></div>`);
  }
  async function saveCurrent(tool){return saveToLibrary(tool.id,await snapshot(tool));}
  async function download(snapshot,emit){
    if(!emit&&window.ExportCenter)return ExportCenter.exportTool(snapshot);
    emit ||= S.download;
    if(snapshot.toolId==='voiceover'&&await ToolVoiceover.download(snapshot,emit))return;
    if(snapshot.toolId==='background-music'&&await ToolMusic.download(snapshot,emit))return;
    if(snapshot.toolId==='sound-effects'&&await ToolSound.download(snapshot,emit))return;
    if(snapshot.toolId==='pngtuber'&&await ToolPNGTuber.download(snapshot,emit))return;
    if(snapshot.toolId==='video-redraw'&&await ToolRedraw.download(snapshot,emit))return;
    if(snapshot.toolId==='image-motion'&&await ToolMotion.download(snapshot,emit))return;
    if(snapshot.toolId==='batch-assets'&&await ToolOptimize.downloadSnapshot(snapshot,emit))return;
    if(snapshot.toolId==='sticker-maker'&&await ToolSticker.download(snapshot,emit))return;
    if(snapshot.toolId==='expressions'){
      const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(snapshot.title)+'</title><style>body{font:15px sans-serif;max-width:1000px;margin:30px auto;padding:0 18px;color:#493951}p{line-height:1.8}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}figure{margin:0;background:#f8f5fc;padding:18px;border-radius:12px}img{width:100%;height:260px;object-fit:contain}figcaption{line-height:1.8;margin:14px 0}a{color:#7853a4}</style><h1>'+E(snapshot.title)+'</h1><p>'+E(snapshot.notice)+'</p><main>'+snapshot.performance.map((item,index)=>'<figure><img src="'+E(item.src)+'" alt="'+E(item.request)+'"><figcaption>'+E(item.request)+'<br><small>'+(item.status==='uploaded'?'用户上传图片':'待生图方案 · 原角色参考，未改变表现')+'</small></figcaption><a href="'+E(item.src)+'" download="表现参考-'+(index+1)+'.webp">下载此参考图片</a></figure>').join('')+'</main></html>';
      await emit(new Blob([html],{type:'text/html;charset=utf-8'}),snapshot.title+'-参考图集.html');return;
    }
    if(snapshot.toolId==='oc-sheet'&&snapshot.images.length>1){const sheet=snapshot.images.find(image=>image.role==='sheet');if(!sheet)throw Error('请先生成完整设定表。');await emit(await pngData(sheet.src),snapshot.title+'-v'+(snapshot.version||'当前')+'.png');return;}
    if(snapshot.kind==='audio'){
      if(snapshot.audio.src)await emit(dataBlob(snapshot.audio.src),snapshot.toolId+'-本地声音示例.wav');
      else await emit(new Blob([ToolAudio.voiceHtml(snapshot.audio)],{type:'text/html;charset=utf-8'}),'配音离线试听方案.html');
      return;
    }
    if(snapshot.kind==='image'&&snapshot.images.length===1&&!snapshot.motion){await emit(await pngData(snapshot.images[0].src),snapshot.toolId+'-示例-v'+(snapshot.version||'当前')+'.png');return;}
    if(snapshot.kind==='image'){
      const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>'+E(snapshot.title)+'</title><style>body{font:16px sans-serif;max-width:1000px;margin:30px auto;padding:0 16px}img{max-width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}.motion{max-width:540px;overflow:hidden;border-radius:12px}.motion img{display:block;animation:panzoom 10s ease-in-out infinite alternate}.motion[data-preset="横向摇移"] img{animation-name:pan}.motion[data-preset="缓慢拉远"] img{animation-direction:alternate-reverse}@keyframes pan{from{transform:scale(1.12) translateX(-3%)}to{transform:scale(1.12) translateX(3%)}}@keyframes panzoom{from{transform:scale(1)}to{transform:scale(1.08) translateY(-1%)}}@media(prefers-reduced-motion:reduce){.motion img{animation:none}}</style><h1>'+E(snapshot.title)+' · 示例方案</h1><p>'+E(snapshot.notice)+'</p>'+(snapshot.motion?'<p>10秒 CSS 运镜循环示意，可离线打开；未生成中间帧或视频文件。</p>':'')+snapshot.images.map(image=>`<h2>${E(image.role)}</h2><div class="${snapshot.motion?'motion':''}" data-preset="${E(snapshot.params.option)}"><img src="${image.src}" alt="示例参考"></div>`).join('')+'<h2>当前参数与编辑</h2><pre>'+E(JSON.stringify({...snapshot,images:snapshot.images.map(image=>({role:image.role,embedded:true}))},null,2))+'</pre></html>';
      await emit(new Blob([html],{type:'text/html;charset=utf-8'}),snapshot.toolId+'-示例方案.html');
    }else await emit(snapshot,snapshot.toolId+'-示例资料.json');
  }
  async function pngData(source){const image=await imageData(source),canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;canvas.getContext('2d').drawImage(image,0,0);return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('图片导出失败')),'image/png'));}
  function dataBlob(data){const [header,body]=data.split(','),bytes=Uint8Array.from(atob(body),char=>char.charCodeAt(0));return new Blob([bytes],{type:header.match(/data:([^;]+)/)[1]});}
  function comicLibrary(){const raw=localStorage.getItem('cimora-comic-studio-v1');if(!raw)return null;return ComicStudio.restore(raw);}
  function libraryActive(key){const value=StudioLibrary.meta();return !value.projects?.[key]?.state||value.projects[key].state==='active';}
  function libraryAssetActive(key){const value=StudioLibrary.meta();return value.assets?.[key]?.state!=='trash';}
  function activeSource(source){if(!['comic','video'].includes(source?.scope))return;const project=source.scope+':'+source.projectId,key=project+(source.scope==='video'?':'+source.episodeId:'')+':'+source.assetId;if(!libraryActive(project)||!libraryAssetActive(key))throw Error('来源工程或角色已归档、回收，请先恢复。');}
  function videoContexts(){return S.state.projects.filter(project=>!project.archived&&libraryActive('video:'+project.id)).flatMap(project=>(project.episodes||[]).map(episode=>({p:project,c:episode,e:M.ensure(project,episode)}))).filter(context=>context.e.videoFlow?.workspace);}
  function targets(){const comics=(comicLibrary()?.projects||[]).filter(project=>!project.archived&&libraryActive('comic:'+project.id));return [...comics.map(project=>({key:'comic:'+project.id,label:'漫画 · '+project.title,project,scope:'comic'})),...videoContexts().map(context=>({key:'video:'+context.p.id+':'+context.c.id,label:'视频 · '+context.p.name+' / '+context.c.title,context,scope:'video'}))];}
  function targetOptions(entry){
    if(!entry)return [];
    if(pickerSnapshot?.redraw||pickerSnapshot?.toolId==='image-motion'&&pickerSnapshot.motion)return entry.scope==='video'?entry.context.e.productionShots.map(shot=>({key:'shot:'+shot.id,label:(pickerSnapshot.redraw?'转绘视频候选 · ':'镜头动作方案 · ')+(shot.title||shot.intent||shot.id),target:{type:'shot',id:shot.id}})):[];
    const allAssets=(entry.scope==='comic'?entry.project.assets:entry.context.e.videoFlow.workspace.assets).filter(asset=>libraryAssetActive(entry.scope==='comic'?'comic:'+entry.project.id+':'+asset.id:'video:'+entry.context.p.id+':'+entry.context.c.id+':'+asset.id));
    const performance=pickerSnapshot?.toolId==='expressions',source=pickerSnapshot?.character?.source,characterOnly=pickerSnapshot?.toolId==='oc-sheet'||performance;
    const assets=characterOnly?allAssets.filter(asset=>['角色','人物'].includes(asset.kind)&&(!performance||!['comic','video'].includes(source?.scope)||source.assetId===asset.id)):allAssets;
    const result=assets.map(asset=>({key:'asset:'+asset.id,label:`${asset.kind}参考 · ${asset.name}`,target:{type:'asset',id:asset.id}}));
    if(pickerSnapshot?.toolId==='remove-bg')return [...result.filter(item=>assets.some(asset=>asset.id===item.target.id&&['角色','人物','道具'].includes(asset.kind))),...(entry.scope==='comic'?['角色','道具']:['人物','道具']).map(kind=>({key:'new:'+kind,label:'新增'+kind+'透明素材（候选待采用）',target:{type:'asset',newKind:kind}}))];
    if(characterOnly){if(!performance){const kind=entry.scope==='comic'?'角色':'人物';result.push({key:'new:'+kind,label:'新增'+kind+'参考（候选待采用）',target:{type:'asset',newKind:kind}});}return result;}
    for(const kind of entry.scope==='comic'?['角色','场景','道具']:['人物','场景','道具'])result.push({key:'new:'+kind,label:'新增'+kind+'参考（候选待采用）',target:{type:'asset',newKind:kind}});
    if(entry.scope==='comic'){
      for(const [episodeId,pagination] of Object.entries(entry.project.bodyPagination?.episodes||{}))for(const [index,page] of (pagination.pages||[]).entries())result.push({key:'whole-page:'+page.id,label:'当前整页候选 · 第'+(index+1)+'页 / '+(entry.project.storyPlan?.episodes?.find(episode=>episode.id===episodeId)?.title||episodeId),target:{type:'whole-page',id:page.id,episodeId}});
      if(!Object.keys(entry.project.bodyPagination?.episodes||{}).length)for(const page of entry.project.scenes){result.push({key:'page:'+page.id,label:'旧版页候选 · '+page.name,target:{type:'page',id:page.id}});for(const panel of page.panels)result.push({key:'panel:'+panel.id,label:page.name+' / '+(panel.beat||panel.id)+' · 旧版单格候选',target:{type:'page',id:page.id,panelId:panel.id}});}
    }
    else for(const shot of entry.context.e.productionShots||[])result.push({key:'shot:'+shot.id,label:'镜头候选 · '+(shot.title||shot.intent||shot.id),target:{type:'shot',id:shot.id}});
    return result;
  }
  function picker(snapshot){
    if(snapshot?.id&&!libraryAssetActive(snapshot.libraryAssetKey||'tool:'+snapshot.id))throw Error('成果已回收，请先恢复');
    if(snapshot.toolId==='pngtuber')throw Error('PNGTuber 请在工具内关联原角色，或下载四状态素材包。');
    if(snapshot.kind!=='image')throw Error('报告和资料请保存或下载，不作为图片带入作品。');pickerSnapshot=copy(snapshot);
    const performance=snapshot.toolId==='expressions',source=snapshot.character?.source;
    const entries=targets().filter(entry=>!(snapshot.redraw||snapshot.toolId==='image-motion'&&snapshot.motion)||entry.scope==='video'&&targetOptions(entry).length).filter(entry=>!performance||((!['comic','video'].includes(source?.scope)||(entry.scope===source.scope&&(entry.scope==='comic'?entry.project.id===source.projectId:entry.context.p.id===source.projectId&&entry.context.c.id===source.episodeId)))&&targetOptions(entry).length));const entry=entries.find(item=>item.key===pickerProject)||entries[0];pickerProject=entry?.key||'';
    S.modal(performance?'添加到角色的表现参考':'将成果带入作品',`<p>${performance?'挂在已有角色下面，不替换人物主设定。由项目角色生成的参考，只能带回原角色。':'只向选中位置增加候选，不替换已采用结果。首尾帧与来源保留在候选快照中。'}</p>${entries.length?`<label>选择作品<select id="ts-project">${entries.map(item=>`<option value="${E(item.key)}" ${entry.key===item.key?'selected':''}>${E(item.label)}</option>`).join('')}</select></label><label>兼容目标<select id="ts-target"><option value="">请选择要加入的位置</option>${targetOptions(entry).map(item=>`<option value="${E(item.key)}">${E(item.label)}</option>`).join('')}</select></label>`:`<p>${performance?'暂无可用的已有角色。可先保存个人成果，在漫画或视频中准备人物后再带入。':'还没有可用作品。可先保存个人成果，创建漫画或视频后再带入。'}</p>`}<p id="ts-picker-message" role="status"></p>`,entries.length?action(performance?'添加表现参考':'确认新增候选','confirm-bring','',true).replace('<button ','<button disabled '):S.link('查看资产库','/app/assets?assetSource=tools','cm-button ghost'));
  }
  function confirmBring(){
    if(pickerSnapshot?.id&&!libraryAssetActive('tool:'+pickerSnapshot.id))throw Error('成果已回收，请先恢复');
    const entry=targets().find(item=>item.key===document.getElementById('ts-project').value);if(!entry)throw Error('作品已不存在，请重新选择。');
    const chosen=targetOptions(entry).find(item=>item.key===document.getElementById('ts-target').value);if(!chosen)throw Error('目标已不存在。');
    let destinationId=chosen.target.id;
    if(entry.scope==='comic'){
      const db=comicLibrary(),project=db.projects.find(item=>item.id===entry.project.id);ToolResults.addComic(project,pickerSnapshot,chosen.target,S.id);if(!ComicStudio.validProject(project))throw Error('成果超过漫画可保存范围，未写入；请减少候选或另选目标。');
      try{localStorage.setItem('cimora-comic-studio-v1',JSON.stringify(db));}catch{throw Error('本机存储不足，漫画未修改。');}
      if(chosen.target.newKind)destinationId=project.assets.at(-1).id;
    }else{
      const context=entry.context,before=copy(context.e),next=copy(context.e);ToolResults.addVideo({...context,e:next},pickerSnapshot,chosen.target,S.id);
      Object.keys(context.e).forEach(key=>delete context.e[key]);Object.assign(context.e,next);if(S.save()===false){Object.keys(context.e).forEach(key=>delete context.e[key]);Object.assign(context.e,before);throw Error('本机存储不足，未新增候选。');}
      if(chosen.target.newKind)destinationId=context.e.videoFlow.workspace.assets.at(-1).id;
    }
    S.close();if(window.StudioLibrary){const assetKey=chosen.target.type==='asset'&&destinationId?(entry.scope==='comic'?'comic:'+entry.project.id+':'+destinationId:'video:'+entry.context.p.id+':'+entry.context.c.id+':'+destinationId):null;if(assetKey)S.route('/app/assets?item='+encodeURIComponent(assetKey)+'&back='+encodeURIComponent(location.hash.slice(1)));else S.render();}S.toast(pickerSnapshot.toolId==='expressions'?'表现参考已添加到角色下面，主设定保持原样。':'候选已加入'+entry.label+'，请在作品中主动采用。');
  }
  function savedSnapshot(id){const original=store.list().find(item=>item.id===id);if(original)return original;const asset=window.StudioLibrary?.findAsset(id);return asset?.state==='active'&&asset.raw?.toolId?{...copy(asset.raw),libraryAssetKey:asset.key,libraryVersionId:asset.version?.id}:null;}
  function openSnapshot(id){selectedSnapshot=typeof id==='object'?copy(id):savedSnapshot(id);if(!selectedSnapshot)throw Error('成果不存在。');S.modal(selectedSnapshot.title+' · v'+selectedSnapshot.version,`<p>${E(selectedSnapshot.notice)}</p>${selectedSnapshot.redraw?.video?`<video class="tm-video" controls playsinline src="${E(selectedSnapshot.redraw.video)}"></video>`:''}${selectedSnapshot.toolId==='image-motion'&&selectedSnapshot.motion?.video?`<video class="tm-video" controls playsinline src="${E(selectedSnapshot.motion.video)}"></video>`:''}${selectedSnapshot.stickers?ToolSticker.savedHtml(selectedSnapshot):selectedSnapshot.kind==='audio'?ToolAudio.output(selectedSnapshot.audio).replace(/<button[^>]+data-(?:bgm|sfx)="bring-saved"[^>]*>[\s\S]*?<\/button>/g,''):selectedSnapshot.images?.map(image=>`<figure class="ts-snapshot"><img src="${E(image.src)}" alt="成果快照"><figcaption>${E(image.role)}</figcaption></figure>`).join('')||`<pre>${E(selectedSnapshot.report)}</pre>`}<details><summary>来源、参数与编辑</summary><pre>${E(JSON.stringify({...selectedSnapshot,stickers:selectedSnapshot.stickers?{...selectedSnapshot.stickers,outputs:selectedSnapshot.stickers.outputs.map(output=>({id:output.id,format:output.format}))}:undefined,images:selectedSnapshot.images?.map(image=>({role:image.role})),inputs:Object.fromEntries(Object.entries(selectedSnapshot.inputs||{}).map(([role,item])=>[role,{name:item.name}]))},null,2))}</pre></details>`,action('下载已保存快照','download-saved')+(selectedSnapshot.kind==='audio'&&typeof id==='string'?action('用于作品','apply-open'):'')+((selectedSnapshot.kind==='audio'||['live2d-generation','pngtuber','sticker-maker'].includes(selectedSnapshot.toolId))?'':action('带入作品','bring-open','',true)));}
  const oldRoute=C.route;C.route=context=>{
    ToolVoiceover.stop();
    ToolMusic.stop();
    ToolSound.stop();
    ToolAudio.stop();document.querySelectorAll('.ts-audio-result audio').forEach(audio=>audio.pause());
    store?.endEdit();
    if(context.parts[0]==='app'&&context.parts[1]==='tools'){
      const id=context.params.get('fromAsset');
      if(id){
        const saved=store?.list().find(item=>item.id===id),tool=T.find(context.parts[2]);
        if(!saved||T.find(saved.toolId)?.id!==tool?.id||!libraryAssetActive('tool:'+id))return S.empty('资产暂不可编辑','请在资产库中确认资产是否已被回收。','返回资产库','/app/assets');
        store.beginEdit(id);
      }
      return context.parts[2]?renderDetail(context.parts[2]):list();
    }
    if(context.parts[0]==='app'&&context.parts[1]==='video-tool')return renderDetail(context.params.get('tool')||'image-motion');
    if(context.parts[0]==='app'&&context.parts[1]==='tool-results'){location.replace('#/app/assets?assetSource=tools');return '';}
    return oldRoute(context);
  };
  function renderDetail(id){const tool=T.find(id);if(tool?.retired){active='';return S.empty('这个工具已移除','可返回创作工具继续使用其他功能。','创作工具','/app/tools');}if(tool?.hidden&&tool.id==='storyboard'){active='';return '<main class="ts-page"><h1>剧情分镜已归入作品创作</h1><p>在漫画创作中分页编排，或在视频创作中拆分镜头，继续沿用项目的人物、场景与道具。</p><div class="ts-actions">'+S.link('进入漫画创作','/app/comic','cm-button primary')+S.link('进入视频创作','/app/video','cm-button ghost')+S.link('查看资产库','/app/assets?assetSource=tools','cm-button ghost')+'</div></main>';}if(tool?.hidden){active='';return `<main class="ts-page"><h1>漫画切格与文字整理已归入素材导入</h1><p>不再作为独立小工具。已有项目素材直接复用，无需重新切格或识别。</p><p>要改编外部漫画，可进入视频创作，选择「外部漫画」上传页面并整理文字；当前为人工核对演示。</p><div class="ts-actions">${S.link('进入视频创作','/app/video','cm-button primary')}${S.link('漫画翻译与排字',href('lettering'),'cm-button ghost')}${S.link('图片动起来',href('image-motion'),'cm-button ghost')}${S.link('查看资产库','/app/assets?assetSource=tools','cm-button ghost')}</div></main>`;}return tool?detail(tool,id):S.empty('工具不存在','可回到全部工具查找。','创作工具','/app/tools');}
  S.tools={...legacy,render:context=>context.parts[1]?renderDetail(context.parts[1]):list(true)};
  const oldAfter=C.afterRender;C.afterRender=context=>{
    oldAfter(context);document.body.classList.toggle('tool-studio-page',!!document.querySelector('.ts-page'));libraryFeedback();editingFeedback();
    if(document.querySelector('.stk-page'))ToolSticker.hydrate();else ToolSticker.stop();
    if(document.querySelector('.cut-page'))ToolCutout.hydrate();
    if(document.querySelector('.tr-page'))ToolRedraw.hydrate();else ToolRedraw.release();
    if(document.querySelector('.vsb-workbench'))ToolRedraw.hydrateVideo();
    window.ToolDetailLayout?.enhance();
    const host=context.parts[1]==='comic'?document.getElementById('comic-workspace'):document.querySelector('.v4-workspace');
    if(host&&!host.querySelector('.ts-context-links'))contextLinks(host,context.parts[1]==='comic'?'漫画':'视频');
    if(document.querySelector('.vsb-workbench'))orderedVideoReferences();
  };
  function orderedVideoReferences(){
    const projectId=S.context.params.get('project'),episodeId=S.context.params.get('episode'),context=videoContexts().find(entry=>entry.p.id===projectId&&(!episodeId||entry.c.id===episodeId));if(!context)return;
    const host=document.querySelector('.vsb-workbench[data-vsb-stage="3"] .vsb-main');if(!host)return;host.querySelector('.ts-ordered-frames')?.remove();
    const shotId=context.e.selectedShotId||context.e.videoFlow.selectedShotId,shot=context.e.productionShots.find(item=>item.id===shotId)||context.e.productionShots[0];if(!shot)return;
    const candidates=(shot.candidates||[]).filter(candidate=>candidate.motionPlan||candidate.orderedReferences?.some(reference=>reference.role==='last'));if(!candidates.length)return;
    const node=document.createElement('details');node.className='ts-ordered-frames';node.dataset.shot=shot.id;node.open=true;node.innerHTML='<summary>'+E(shot.title||'当前镜头')+' · 工具候选的动作参考方案</summary><p>每组图片与动作描述共同组成一个方案；应用到生成要求后再生成，不自动替换当前采用版。</p>'+candidates.map(candidate=>`<section><h4>工具候选 v${candidate.version}</h4>${candidate.motionPlan?`<p>${E(candidate.input.prompt||'')}</p>${action('应用到本镜生成要求','apply-motion',`data-id="${E(candidate.id)}" data-shot="${E(shot.id)}"`,true)}`:''}<div class="ts-preview">${candidate.orderedReferences.map(reference=>`<figure><img src="${E(reference.image)}" alt="${reference.role==='first'?'首帧':reference.role==='last'?'尾帧':'画面'}候选参考"><figcaption>${reference.role==='first'?'首帧 · 动作起点':reference.role==='last'?'尾帧 · 动作终点':'运镜画面参考'}</figcaption></figure>`).join('')}</div></section>`).join('');host.append(node);
  }
  function contextLinks(host,kind){const node=document.createElement('div');node.className='ts-context-links';node.innerHTML='<span>'+kind+'创作辅助</span>'+S.link(T.find('live2d-generation').title,href('live2d-generation')+'?from='+encodeURIComponent(kind),'cm-text-link');host.append(node);}
  const observer=new MutationObserver(()=>{const host=document.getElementById('comic-workspace');if(host&&host.querySelector('#stage')&&!host.querySelector('.ts-context-links'))contextLinks(host,'漫画');});observer.observe(document.getElementById('site'),{childList:true,subtree:true});
  let regionDrag=null;
  function regionPoint(event,node){const rect=node.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};}
  function paintRegion(node,bounds){const box=node.querySelector('span');Object.assign(box.style,{left:bounds.x*100+'%',top:bounds.y*100+'%',width:bounds.w*100+'%',height:bounds.h*100+'%'});}
  document.addEventListener('pointerdown',event=>{const node=event.target.closest('[data-tl-region]');if(!node||event.button!==0)return;event.preventDefault();node.setPointerCapture(event.pointerId);regionDrag={node,start:regionPoint(event,node),id:event.pointerId};});
  document.addEventListener('pointermove',event=>{if(regionDrag&&event.pointerId===regionDrag.id)paintRegion(regionDrag.node,ToolLightTasks.rectangle(regionDrag.start,regionPoint(event,regionDrag.node)));});
  document.addEventListener('pointerup',event=>{if(!regionDrag||event.pointerId!==regionDrag.id)return;const {node,start}=regionDrag,bounds=ToolLightTasks.rectangle(start,regionPoint(event,node));regionDrag=null;const tool=T.find(active);if(!tool)return;if(bounds.w<.05||bounds.h<.05){paintRegion(node,ToolLightTasks.region(tool,draft(tool)));return;}try{write(tool,{region:bounds,dirty:!!draft(tool).ready});}catch(error){notice(error);}});
  document.addEventListener('pointercancel',()=>{regionDrag=null;});
  document.addEventListener('submit',async event=>{if(event.target.id!=='ts-form')return;event.preventDefault();event.stopImmediatePropagation();const button=document.getElementById('ts-run');button.disabled=true;try{await generate(T.find(active));}catch(error){notice(error);button.disabled=false;}},true);
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-ts]');
    if(button){event.preventDefault();event.stopImmediatePropagation();try{const tool=T.find(active),value=tool&&draft(tool);switch(button.dataset.ts){
      case'group':
        group=button.dataset.value;
        button.closest('.ts-groups').querySelectorAll('[data-ts="group"]').forEach(tab=>{
          tab.setAttribute('aria-pressed',String(tab.dataset.value===group));
        });
        refreshCatalog();
        break;
      case'audio-play':ToolAudio.play(button.closest('#site-modal')?selectedSnapshot?.audio:tool?.kind==='audio'?value.audio:selectedSnapshot?.audio);break;
      case'audio-stop':ToolAudio.stop();break;
      case'sample':write(tool,{prompt:textDefault(tool),inputs:{},region:null,sourceText:null,targetText:null,translated:null,ready:false,dirty:false});S.render();break;
      case'region-reset':write(tool,{region:null,dirty:!!value.ready});S.render();break;
      case'save':button.disabled=true;await saveCurrent(tool);button.disabled=false;if(tool.id==='video-redraw')S.render();break;
      case'bring':picker(await saveCurrent(tool));break;
      case'download':await download(await snapshot(tool));break;
      case'open-result':openSnapshot(button.dataset.id);break;
      case'bring-saved':picker(store.list().find(item=>item.id===button.dataset.id));break;
      case'download-saved':await download(selectedSnapshot);break;
      case'bring-open':picker(selectedSnapshot);break;
      case'apply-open':{const snapshot=selectedSnapshot;if(!snapshot)throw Error('请重新打开成果。');if(snapshot.toolId==='background-music')ToolMusic.bring(snapshot);else if(snapshot.toolId==='sound-effects')ToolSound.bring(snapshot);else if(snapshot.toolId==='voiceover')ToolVoiceover.bringSaved(snapshot);break;}
      case'confirm-bring':confirmBring();break;
      case'apply-motion':{
        const episodeId=S.context.params.get('episode'),context=videoContexts().find(entry=>entry.p.id===S.context.params.get('project')&&(!episodeId||entry.c.id===episodeId));
        const shot=context?.e.productionShots.find(item=>item.id===button.dataset.shot),candidate=shot?.candidates.find(item=>item.id===button.dataset.id&&item.motionPlan);
        if(!candidate)throw Error('镜头方案已不存在，请重新选择。');
        if(shot.direction.locked)throw Error('请先解锁镜头，再应用动作方案。');
        const blocked=M.direction.blocked(context);if(blocked)throw Error(blocked);
        M.videoWorkspace.save(context,()=>{const paired=candidate.motionPlan.type==='keyframes';shot.storyboardInput={...shot.storyboardInput,mode:paired?'keyframes':'reference',prompt:candidate.input.prompt,firstFrame:paired?candidate.input.firstFrame:'',lastFrame:paired?candidate.input.lastFrame:'',...(paired?{}:{references:[...(shot.storyboardInput?.references||[]),{id:S.id('tool-reference'),name:'图片动起来 · 画面参考',image:candidate.image}]})};shot.version++;M.videoFlow.ensure(context).reviewed=false;});
        S.render();S.toast('动作要求与图片已应用，请核对后生成本镜。');break;
      }
    }}catch(error){button.disabled=false;notice(error);const node=document.getElementById('ts-picker-message');if(node)node.textContent=error.message;}return;}
    const old=event.target.closest('.ts-output [data-act]');if(!old)return;event.preventDefault();event.stopImmediatePropagation();const tool=T.find(active),value=draft(tool);
    try{if(old.dataset.act==='panel-up'){const index=+old.dataset.index;[value.order[index-1],value.order[index]]=[value.order[index],value.order[index-1]];[value.dialogues[index-1],value.dialogues[index]]=[value.dialogues[index],value.dialogues[index-1]];write(tool,{order:value.order,dialogues:value.dialogues});S.render();}
      if(old.dataset.act==='tool-motion'){const frame=document.getElementById('tool-motion-frame');frame.classList.toggle('is-playing');old.textContent=frame.classList.contains('is-playing')?'Ⅱ 暂停':'▷ 播放';}
      if(old.dataset.act==='motion-channel'){document.querySelectorAll('.ts-output [data-act="motion-channel"]').forEach(node=>node.classList.toggle('selected',node===old));document.getElementById('channel-note').textContent=old.dataset.value==='stable'?'稳定运镜示例，无真实视频输出。':'增强候选流程示意，无模型调用和费用。';}
      if(old.dataset.act==='puppet-state'){document.getElementById('puppet-label').textContent=old.textContent;document.getElementById('puppet-stage').dataset.state=old.dataset.index;}
    }catch(error){notice(error);}
  },true);
  document.addEventListener('input',event=>{
    const input=event.target;
    if(input.id==='ts-search'){
      query=input.value;
      refreshCatalog();
      return;
    }
    if(!input.closest('.ts-page'))return;const tool=T.find(active);if(!tool)return;
    try{if(input.id==='ts-prompt'){write(tool,{prompt:input.value,dirty:!!draft(tool).ready});document.getElementById('ts-message').textContent='输入已保存；修改后请重新生成示例。';}
      if(['tl-original','tl-target'].includes(input.id)){write(tool,{[input.id==='tl-original'?'sourceText':'targetText']:input.value,dirty:!!draft(tool).ready});document.getElementById('ts-message').textContent='文字已保存，请生成排字预览。';event.stopImmediatePropagation();}
      if(input.id==='translated-text'){write(tool,{translated:input.value});document.getElementById('translated-bubble').textContent=input.value;event.stopImmediatePropagation();}
      if(input.dataset.resultDialogue!==undefined){const value=draft(tool);value.dialogues[+input.dataset.resultDialogue]=input.value;write(tool,{dialogues:value.dialogues});event.stopImmediatePropagation();}
      if(input.id==='rig-range'){document.querySelector('.ts-output .rig-preview img').style.transform=`rotate(${+input.value/3}deg)`;event.stopImmediatePropagation();}
    }catch(error){notice(error);}
  },true);
  document.addEventListener('change',async event=>{
    const input=event.target;if(input.id==='ts-target'){const button=document.querySelector('[data-ts=confirm-bring]');if(button)button.disabled=!input.value;return;}if(input.id==='ts-project'){pickerProject=input.value;try{picker(pickerSnapshot);}catch(error){notice(error);}return;}
    if(!input.closest('.ts-page'))return;const tool=T.find(active);if(!tool)return;
    if(input.dataset.resultDialogue!==undefined)event.stopImmediatePropagation();
    try{if(input.id==='ts-option'){const value=draft(tool);write(tool,{option:input.value,...(tool.kind==='lettering'&&!value.inputs.main?.src&&value.targetText==null?{targetText:undefined}:{}),dirty:!!value.ready});if(tool.kind==='lettering'&&!value.inputs.main?.src&&value.targetText==null)document.getElementById('tl-target').value=ToolLightTasks.sampleTranslation(input.value);document.getElementById('ts-message').textContent='预设已修改，请重新生成示例。';}
      if(input.id==='ts-rate'){ToolAudio.stop();write(tool,{rate:Number(input.value),dirty:!!draft(tool).ready});document.getElementById('ts-message').textContent='语速已修改，请重新生成示例。';}
      if(input.id==='ts-batch')write(tool,{batch:input.checked,dirty:!!draft(tool).ready});
      if(input.dataset.tsUpload&&input.files.length){event.stopImmediatePropagation();const files=Array.from(input.files);if(files.length>12)throw Error('一次最多12份参考。');if(files.some(file=>file.size>1500000))throw Error('为便于本机保存，请选1.5MB以内素材。');const entries=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{if(!/^image\/(png|jpeg|webp)$/.test(file.type)){resolve({name:file.name,size:file.size,type:file.type});return;}const reader=new FileReader();reader.onload=async()=>{try{resolve({name:file.name,size:file.size,type:file.type,src:await compactReference(reader.result)});}catch(error){reject(error);}};reader.onerror=()=>reject(Error('文件读取失败。'));reader.readAsDataURL(file);})));const value=draft(tool);value.inputs[input.dataset.tsUpload]={...entries[0],files:entries.map(({name,size,type})=>({name,size,type}))};write(tool,{inputs:value.inputs,region:null,sourceText:'',targetText:'',ready:false,dirty:false});refreshUpload(tool,input.dataset.tsUpload);}
    }catch(error){notice(error);input.value='';}
  },true);
  ToolOC.init({value:()=>draft(T.find('oc-sheet')),write:patch=>write(T.find('oc-sheet'),patch),render:()=>S.render(),notice,action,store,download});
  ToolPerformance.init({value:()=>draft(T.find('expressions')),write:patch=>write(T.find('expressions'),patch),render:()=>S.render(),notice,action,store,download,targets});
  ToolColor.init({value:()=>draft(T.find('colorize')),write:patch=>write(T.find('colorize'),patch),render:()=>S.render(),notice,action});
  ToolDraw.init({value:()=>draft(T.find('anime-draw')),write:patch=>write(T.find('anime-draw'),patch),render:()=>S.render(),notice,action});
  ToolCutout.init({value:()=>draft(T.find('remove-bg')),write:patch=>write(T.find('remove-bg'),patch),render:()=>S.render(),notice,action,store,targets});
  ToolOptimize.init({value:()=>draft(T.find('batch-assets')),write:patch=>write(T.find('batch-assets'),patch),render:()=>S.render(),notice,store,targets,bring:picker});
  ToolSticker.init({value:()=>draft(T.find('sticker-maker')),write:patch=>write(T.find('sticker-maker'),patch),render:()=>S.render(),store,targets});
  ToolMotion.init({value:()=>draft(T.find('image-motion')),write:patch=>write(T.find('image-motion'),patch),render:()=>S.render(),notice,action,store,targets});
  ToolRedraw.init({value:()=>draft(T.find('video-redraw')),write:patch=>write(T.find('video-redraw'),patch),render:()=>S.render(),notice,action,store,targets});
  ToolVoiceover.init({value:()=>draft(T.find('voiceover')),write:patch=>write(T.find('voiceover'),patch),render:()=>S.render(),notice,store,targets,download,attachProfile:snapshot=>{
    const source=snapshot.voiceover.source;
    activeSource(source);
    if(source?.scope==='comic'){
      const library=comicLibrary(),project=library?.projects.find(item=>item.id===source.projectId);if(!project)throw Error('原漫画项目已不存在。');
      ToolVoiceoverModel.attach(project.assets,snapshot,{scope:'comic',projectId:project.id,assetId:source.assetId},S.id);
      if(!ComicStudio.validProject(project))throw Error('项目数据超过本机保存范围，请先保存声音。');
      try{localStorage.setItem('cimora-comic-studio-v1',JSON.stringify(library));}catch{throw Error('本机存储不足，未关联原角色。');}
    }else if(source?.scope==='video'){
      const context=videoContexts().find(item=>item.p.id===source.projectId&&item.c.id===source.episodeId);if(!context)throw Error('原视频项目已不存在。');
      const before=copy(context.e.videoFlow.workspace.assets),next=copy(before);ToolVoiceoverModel.attach(next,snapshot,{scope:'video',projectId:context.p.id,episodeId:context.c.id,assetId:source.assetId},S.id);
      context.e.videoFlow.workspace.assets=next;if(S.save()===false){context.e.videoFlow.workspace.assets=before;throw Error('本机存储不足，未关联原角色。');}
    }else throw Error('请先选择漫画或视频的已有角色，再关联声音。');
  },bring:(entry,shotId,snapshot)=>{
    const context=videoContexts().find(item=>item.p.id===entry.context.p.id&&item.c.id===entry.context.c.id);if(!context)throw Error('目标作品已不存在。');
    const shot=context.e.productionShots.find(item=>item.id===shotId);if(!shot)throw Error('目标镜头已不存在。');
    const previousEpisode=context.e.videoFlow.workspace.selectedEpisodeId,selectedEpisode=shot.episodeId||previousEpisode;
    const before=copy(context.e);
    try{context.e.videoFlow.workspace.selectedEpisodeId=selectedEpisode;M.videoFinishing.importVoice(context,shotId,snapshot);context.e.videoFlow.workspace.selectedEpisodeId=previousEpisode;if(S.save()===false)throw Error('本机存储不足，未添加配音候选。');}
    catch(error){Object.keys(context.e).forEach(key=>delete context.e[key]);Object.assign(context.e,before);throw error;}
  }});
  ToolPNGTuber.init({value:()=>draft(T.find('pngtuber')),write:patch=>write(T.find('pngtuber'),patch),render:()=>S.render(),notice,action,store,targets,attach:snapshot=>{
    const source=snapshot.character.source;
    activeSource(source);
    if(source.scope==='comic'){
      const library=comicLibrary(),project=library?.projects.find(item=>item.id===source.projectId);if(!project)throw Error('原漫画项目已不存在。');
      ToolPNGTuberModel.attach(project.assets,snapshot,{scope:'comic',projectId:project.id},S.id);
      if(!ComicStudio.validProject(project))throw Error('项目数据超过本机保存范围，请下载素材包。');
      try{localStorage.setItem('cimora-comic-studio-v1',JSON.stringify(library));}catch{throw Error('本机存储不足，未关联角色；可下载素材包。');}
    }else{
      const context=videoContexts().find(item=>item.p.id===source.projectId&&item.c.id===source.episodeId);if(!context)throw Error('原视频项目已不存在。');
      const previous=copy(context.e.videoFlow.workspace.assets),next=copy(previous);ToolPNGTuberModel.attach(next,snapshot,{scope:'video',projectId:context.p.id,episodeId:context.c.id},S.id);
      context.e.videoFlow.workspace.assets=next;if(S.save()===false){context.e.videoFlow.workspace.assets=previous;throw Error('本机存储不足，未关联原角色。');}
    }
  }});
  ToolMusic.init({value:()=>draft(T.find('background-music')),write:patch=>write(T.find('background-music'),patch),render:()=>S.render(),notice,store,targets:()=>videoContexts().map(context=>({key:'video:'+context.p.id+':'+context.c.id,label:'视频 · '+context.p.name+' / '+context.c.title,context,scope:'video'})),bring:(entry,episodeId,snapshot)=>{
    const context=videoContexts().find(item=>item.p.id===entry.context.p.id&&item.c.id===entry.context.c.id);if(!context)throw Error('目标作品已不存在。');
    if(!context.e.videoFlow.workspace.episodes.some(item=>item.id===episodeId))throw Error('目标集已不存在。');
    const before=copy(context.e),previousEpisode=context.e.videoFlow.workspace.selectedEpisodeId;
    try{
      context.e.videoFlow.workspace.selectedEpisodeId=episodeId;
      M.videoFinishing.importMusic(context,snapshot);
      context.e.videoFlow.workspace.selectedEpisodeId=previousEpisode;
      if(S.save()===false)throw Error('本机存储不足，未添加配乐候选。');
    }catch(error){Object.keys(context.e).forEach(key=>delete context.e[key]);Object.assign(context.e,before);throw error;}
  }});
  ToolSound.init({value:()=>draft(T.find('sound-effects')),write:patch=>write(T.find('sound-effects'),patch),render:()=>S.render(),notice,store,targets:()=>videoContexts().map(context=>({key:'video:'+context.p.id+':'+context.c.id,label:'视频 · '+context.p.name+' / '+context.c.title,context,scope:'video'})),bring:(entry,shotId,snapshot)=>{
    const context=videoContexts().find(item=>item.p.id===entry.context.p.id&&item.c.id===entry.context.c.id);if(!context)throw Error('目标作品已不存在。');
    const shot=context.e.productionShots.find(item=>item.id===shotId);if(!shot)throw Error('目标镜头已不存在。');
    const before=copy(context.e),previous=context.e.videoFlow.workspace.selectedEpisodeId;
    try{context.e.videoFlow.workspace.selectedEpisodeId=shot.episodeId||previous;M.videoFinishing.importEffect(context,shotId,snapshot);context.e.videoFlow.workspace.selectedEpisodeId=previous;if(S.save()===false)throw Error('本机存储不足，未添加声音候选。');}
    catch(error){Object.keys(context.e).forEach(key=>delete context.e[key]);Object.assign(context.e,before);throw error;}
  }});
  function bringSaved(id){const saved=savedSnapshot(id);if(!saved)throw Error('成果不存在');if(!libraryAssetActive(saved.libraryAssetKey||'tool:'+id))throw Error('成果已回收，请先恢复');if(saved.toolId==='background-music')return ToolMusic.bring(saved);if(saved.toolId==='sound-effects')return ToolSound.bring(saved);if(saved.toolId==='voiceover')return ToolVoiceover.bringSaved(saved);if(saved.toolId==='pngtuber')return ToolPNGTuber.attachSaved(saved);return picker(saved);}
  window.ToolStudio={saveToLibrary,exportFiles:async snapshot=>{const files=[];await download(snapshot,(data,name,type)=>{files.push({data,name,type});});return files;},store,snapshot,targets,openSaved:openSnapshot,bringSaved};
})();
