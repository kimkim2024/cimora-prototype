(()=>{
  'use strict';
  const E=Site.esc,M=ToolMotionModel,copy=value=>JSON.parse(JSON.stringify(value));
  const SAMPLE_VIDEO='assets/direction-a.mp4',SAMPLE_PROMPT='雨夜车站，女孩手持信封，缓慢移动手臂读信，镜头保持固定。';
  const defaults={motionMode:'single',motionVersions:[],motionSelectedId:'',motionPlan:null,motionBaseId:'',inputs:{},prompt:'',option:'缓慢推进',region:null};
  let H,busy=false,activeFrame='first',assetPicker=null;
  const current=()=>({...copy(defaults),...H.value()});
  const selected=value=>value.motionVersions.find(item=>item.id===value.motionSelectedId);
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-tm="${action}" ${extra}>${label}</button>`;
  const assetLink=()=>window.ToolDetailLayout.assetLibraryLink();
  const icons={upload:'<path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5"/>',library:'<path d="m12 3-9 4.5 9 4.5 9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',ai:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',swap:'<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>'};
  const icon=name=>`<svg class="tm-control-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name]||icons.library}</svg>`;
  icons.play='<path d="M8 5.5v13L19 12 8 5.5Z"/>';
  icons.pause='<path d="M9 5v14M15 5v14"/>';
  const versionTime=item=>{
    const date=new Date(item?.request?.at||'');
    if(Number.isNaN(date.getTime()))return '';
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };
  const uploadHeading=text=>`<span class="tm-upload-heading">${icon('upload')}<span>${E(text)}</span></span>`;
  const backButton=()=>`<button type="button" class="tm-back-button tm-tooltip" data-tm="back" aria-label="Go back" data-tooltip="Go Back"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14 5-7 7 7 7M7 12h14"/></svg></button>`;
  function write(patch){H.write(patch);H.render();}
  function prepare(value,legacy,mode){
    if(value.motionInitialized){if(mode==='keyframes'&&!value.inputs?.first&&legacy?.inputs?.first)return {inputs:{...copy(value.inputs||{}),...copy(legacy.inputs)}};return null;}
    const old=mode==='keyframes'&&legacy?.inputs?legacy:value;
    const patch={motionInitialized:true,motionMode:mode||value.motionMode||'single',inputs:{...copy(value.inputs||{}),...copy(old.inputs||{})},prompt:old.prompt||value.prompt||'',option:value.option||'缓慢推进'};
    if(value.ready&&value.preview?.[0]?.src&&!value.motionVersions?.length){const frame=value.inputs?.main||{name:'原运镜示例',src:value.preview[0].src},req=M.request({motionMode:'single',inputs:{main:frame},prompt:value.generatedPrompt||value.prompt||'沿用原运镜方案',option:value.generatedOption||value.option,region:value.taskRegion},Site.id('motion-legacy'));const version={id:Site.id('motion-version'),kind:'panzoom',image:value.preview[0].src,duration:10,request:req};patch.motionVersions=[version];patch.motionSelectedId=version.id;}
    return patch;
  }
  const frameLabel=role=>({main:'Current image',first:'Start frame',last:'End frame'})[role];
  const frameRole=value=>value.motionMode==='keyframes'?activeFrame:'main';
  function sources(){
    const result=[],seen=new Set(),L=window.StudioLibraryModel;
    for(const asset of window.StudioLibrary?.load().assets||[]){
      if(asset.state!=='active'||!['角色','场景','道具','图片与漫画'].includes(L.categoryOf(asset)))continue;
      const frames=Object.entries(asset.version?.images||{});
      if(asset.image)frames.unshift(['image',asset.image]);
      for(const [part,value] of frames){
        const src=L.imageOf(value,asset.owner?.startsWith('comic:'));
        if(!src||seen.has(src))continue;
        seen.add(src);result.push({key:asset.key+':'+part,name:asset.name||'Untitled image',src});
      }
    }
    return result;
  }
  function focusControl(role){
    requestAnimationFrame(()=>document.querySelector(`[data-tm="frame-step"][data-role="${role}"]`)?.focus({preventScroll:true}));
  }
  function acceptFrame(role,frame,{closePicker=false}={}){
    const value=current();
    if(role==='last'&&value.motionPlan?.type==='tail'&&value.motionPlan.first.src!==value.inputs.first?.src)throw Error('The start frame changed. Submit the end frame request again.');
    const advance=value.motionMode==='keyframes'&&role==='first'&&!value.inputs.first&&!value.motionFirstAdded;
    H.write({inputs:{...value.inputs,[role]:frame},motionPlan:null,...(role==='first'?{motionFirstAdded:true}:{}),...(role==='main'?{region:null}:{})});
    if(closePicker){Site.close();assetPicker=null;}
    if(advance)activeFrame='last';
    H.render();
    if(advance){Site.toast('Start frame added. Now add an end frame.');focusControl('last');}
    else requestAnimationFrame(()=>document.querySelector(`.tm-slot-actions [data-tm="asset-open"][data-role="${role}"]`)?.focus({preventScroll:true}));
  }
  function openAssetPicker(role){
    if(!['main','first','last'].includes(role))return;
    const entries=sources();
    Site.modal('Asset library',`<div class="tm-asset-picker"><p class="tm-picker-target">Target: <strong>${E(frameLabel(role))}</strong></p><p id="tm-picker-error" role="alert"></p>${entries.length?`<div class="tm-asset-grid">${entries.map((entry,index)=>`<button type="button" class="tm-asset-choice" data-tm="asset-pick" data-index="${index}"><img src="${E(entry.src)}" alt="" loading="lazy"><span class="tm-user-copy">${E(entry.name)}</span></button>`).join('')}</div>`:'<p class="tm-picker-empty">No image assets available. Upload an image to continue.</p>'}</div>`,button('Cancel','asset-cancel'),true);
    const dialog=document.querySelector('#site-modal .dialog');
    dialog.classList.add('tm-picker-dialog');
    assetPicker={role,entries,dialog};
  }
  function frameSteps(value){
    return `<nav class="tm-frame-steps" aria-label="Frame steps">${['first','last'].map(role=>`<button type="button" class="cm-button ghost tm-step" data-tm="frame-step" data-role="${role}" aria-pressed="${activeFrame===role}" aria-controls="tm-current-frame">${frameLabel(role)}</button>`).join('')}</nav>`;
  }
  function slot(value,role,label){
    const frame=value.inputs[role],uploadText=frame?'Replace image':'Upload image';
    return `<section class="tm-slot" id="tm-current-frame" aria-label="${E(frameLabel(role))}">
      ${role==='main'?`<div class="tm-row"><strong>${E(label)}</strong></div>`:''}
      ${frame?`<div class="tm-frame"><img src="${E(frame.src)}" alt="${E(frameLabel(role))}">${button('Remove','remove',`data-role="${role}" aria-label="Remove ${E(frameLabel(role).toLowerCase())}"`)}</div><div class="tm-frame-meta"><small class="tm-user-copy">${E(displayCopy(frame.name))}</small></div>`:`<p class="tm-frame-empty"><span>No ${role==='main'?'image':frameLabel(role).toLowerCase()} added yet.</span>${button('Try with a sample','sample')}</p>`}
      <div class="tm-slot-actions">
        <label class="tm-upload">${uploadHeading(uploadText)}<input data-tm-upload="${role}" type="file" accept="image/png,image/jpeg,image/webp" aria-label="${uploadText}"></label>
        <button type="button" class="cm-button ghost tm-library-button" data-tm="asset-open" data-role="${role}">${icon('library')}<span>Asset library</span></button>
        ${role==='main'&&frame?`<button type="button" class="cm-button ghost tm-crop-toggle tm-tooltip" data-tm="crop-toggle" data-tooltip="Select an Image Region" aria-label="Select an image region" aria-expanded="false"><svg class="tm-control-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>`:''}
        ${role!=='main'?`<details class="tm-frame-menu"><summary class="cm-button ghost tm-tooltip" aria-label="More options" data-tooltip="More Options"><svg class="tm-control-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></summary><div class="tm-frame-menu-panel">${role==='last'?button(icon('ai')+'<span>AI end frame</span>','tail',!value.inputs.first?'disabled':''):''}${button(icon('swap')+'<span>Swap frames</span>','swap',!value.inputs.first||!value.inputs.last?'disabled':'')}</div></details>`:''}
      </div>
    </section>`;
  }
  function results(value){
    const version=selected(value),plan=value.motionPlan;
    const position=version?value.motionVersions.indexOf(version)+1:0,kind=version?.kind==='sample-video'?'sample-video':'local';
    return `<section class="ts-panel tm-output tm-result"><div class="tm-result-head"><h2>预览与版本</h2><small>${value.motionVersions.length} 个版本</small></div>
      ${plan?`<section class="tm-pending" role="status"><strong>${plan.type==='tail'?'尾帧要求已记录':'视频生成要求已记录'} · 待接入 AI</strong><p class="tm-user-copy">${E(displayCopy(plan.prompt))}</p><small>${version?'下方保留上一次结果，当前要求尚未生成新版本。':'当前不调用付费模型，不会将预置短片当作你的生成结果。'}</small>${plan.type==='tail'?'<p>Add an existing end frame using Upload or Asset library in End frame.</p>':''}${button('取消本次要求','cancel')}</section>`:''}
      ${version?`<section class="tm-stage" aria-label="第 ${position} 版视频预览">
        <div class="tm-stage-media">
          ${kind==='sample-video'?`<video class="tm-video" src="${E(version.video)}" controls playsinline preload="metadata" poster="${E(version.request.frames.first.src)}"></video>`:`<div class="tl-motion is-playing" id="tool-motion-frame" data-preset="${E(version.request.preset)}"><img src="${E(version.image)}" alt="选定画面的运镜预览"></div>`}
          <div class="tm-stage-bar">
            ${kind==='sample-video'?'':`<button type="button" class="cm-button tm-play" data-tm="play" aria-pressed="true" aria-label="暂停"><span class="tm-play-glyph">${icon('play')}</span><span class="tm-pause-glyph">${icon('pause')}</span><span class="tm-play-label">暂停</span></button>`}
            <span class="tm-stage-meta">${version.duration||10} 秒循环 · ${E(version.request.preset)}</span>
          </div>
        </div>
      </section>
      <section class="tm-description">
        <div class="tm-section-head"><h3>运动描述</h3>${button('继续修改','continue')}</div>
        <p class="tm-user-copy">${E(displayCopy(version.request.prompt))}</p>
        <p class="tm-note">${kind==='sample-video'?'预置运镜短片：可体验播放与版本选择，未按输入要求生成角色动作。':'描述随方案保存；本地仅执行选区与运镜，不生成角色动作。'}</p>
      </section>
      <section class="tm-version-block">
        <div class="tm-section-head"><h3>版本</h3></div>
        <div class="tm-versions" role="group" aria-label="动态版本">${value.motionVersions.map((item,index)=>`<button type="button" class="cm-button tm-version" data-tm="select" data-id="${E(item.id)}" aria-label="查看动态第 ${index+1} 版" aria-pressed="${item.id===version.id}"><img src="${E(item.image||item.request.frames.first.src)}" alt="第 ${index+1} 版缩略图"><span class="tm-version-label">第 ${index+1} 版</span>${versionTime(item)?`<small class="tm-version-time">${versionTime(item)}</small>`:''}</button>`).join('')}</div>
      </section>
      <section class="tm-result-actions">
        <div class="tm-action-primary">${H.action('带入视频镜头','bring')}</div>
        <div class="tm-action-secondary">${H.action('下载当前结果','download')}${H.action('保存到资产库','save')}</div>
        <p class="tm-note">带入时新增镜头参考方案，由你确认采用；不自动替换原镜头。</p>
      </section>`:plan?'':`<div class="tm-empty"><span>▷</span><h3>让一张画面，或两个瞬间连起来</h3><p>选择图片并描述动作，或先试用一份完整示例。</p>${button('试用完整示例','sample')}</div>`}
    </section>`;
  }
  function render(input){
    const value={...copy(defaults),...input},paired=value.motionMode==='keyframes',base=selected(value);
    Site.pageTitle='Image to motion';
    const role=frameRole(value);
    return `<main class="ts-page tm-page tw-v2">
      <header class="ts-heading"><div><nav class="tm-back-nav" aria-label="Tool navigation">${backButton()}${Site.link('Creative tools','/app/tools','cm-text-link')}</nav><h1>图片动起来</h1><p>选择图片，描述动作，预览动态方案。</p></div>${assetLink()}</header>
      <div class="tm-workbench"><section class="ts-panel tm-input">
        <div class="tm-row"><h2>画面与动作</h2></div>
        <div class="tm-mode" role="group" aria-label="动态创作方式">${button('单图动起来','mode','data-mode="single" aria-pressed="'+!paired+'"')}${button('首尾帧','mode','data-mode="keyframes" aria-pressed="'+paired+'"')}</div>
        ${paired?frameSteps(value):''}
        <div class="tm-slots">${slot(value,role,frameLabel(role))}</div>
        ${paired?'':value.inputs.main?`<details class="tm-crop"><summary aria-label="选择画面区域（可选）"></summary><p class="tm-crop-title">选择画面区域（可选）</p><p class="tm-note">拖出要动起来的区域，默认使用整图。</p><div class="tl-region" data-tl-region><img src="${E(value.inputs.main.src)}" alt="原图，拖动选择区域" draggable="false"><span style="left:${(value.region?.x||0)*100}%;top:${(value.region?.y||0)*100}%;width:${(value.region?.w||1)*100}%;height:${(value.region?.h||1)*100}%"></span></div><div class="tm-region-footer"><small data-tl-region-status>${value.region?'已选择区域':'当前使用整图'}</small>${button('使用整图','region-reset')}</div></details>`:''}
        <section class="tm-group tm-prompt-group">
          <div class="tm-group-head"><label class="tm-prompt-label" for="tm-prompt">${value.motionBaseId?'描述这次想修改的地方':'描述动作或修改要求'}</label>${value.motionBaseId?`<span class="tm-edit-status">第 ${value.motionVersions.findIndex(item=>item.id===value.motionBaseId)+1} 版编辑中</span>`:''}</div>
          <textarea id="tm-prompt" rows="3" maxlength="2000" placeholder="例如：女孩听见呼喊，缓慢转身，最后露出惊讶的表情，镜头保持固定。">${E(displayCopy(value.prompt))}</textarea>
          ${value.motionBaseId?`<div class="tm-edit-foot"><p class="tm-note">旧结果保留。</p>${button('取消基于此版修改','clear-base')}</div>`:''}
        </section>
        ${!paired?`<section class="tm-group tm-settings"><h3>运镜方式</h3><label class="tm-camera-label"><select id="tm-preset" aria-label="运镜方式">${['缓慢推进','横向摇移','缓慢拉远'].map(preset=>`<option ${preset===value.option?'selected':''}>${preset}</option>`).join('')}</select></label></section>`:''}
        <div class="tm-submit">${button(paired?'生成短片':'生成运镜预览','generate','id="tm-generate"',true)}<p class="tm-submit-hint">仅本地预览运镜，不生成人物动作。</p><p id="ts-message" role="status"></p></div>
      </section>${results(value)}</div>
    </main>`;
  }
  const image=async src=>{const result=new Image();result.src=src;await result.decode();return result;};
  async function dataImage(src){if(src.startsWith('data:image/'))return src;const im=await image(src),canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;canvas.getContext('2d').drawImage(im,0,0);return canvas.toDataURL('image/webp',.85);}
  async function read(file){if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1500000)throw Error('请选择 1.5 MB 以内的 PNG、JPG 或 WebP。');const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败。'));reader.readAsDataURL(file);});const im=await image(src);if(im.naturalWidth*im.naturalHeight>25000000)throw Error('请使用 2500 万像素以内的图片。');const canvas=document.createElement('canvas'),scale=Math.min(1,900/Math.max(im.naturalWidth,im.naturalHeight));canvas.width=Math.round(im.naturalWidth*scale);canvas.height=Math.round(im.naturalHeight*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);return {name:file.name,src:canvas.toDataURL('image/webp',.85),origin:'本机上传'};}
  async function sampleFrames(){
    const sample={first:{name:'读信示例 · 起点',src:'assets/tool-motion-first.webp',origin:'预置短片'},last:{name:'读信示例 · 终点',src:'assets/tool-motion-last.webp',origin:'预置短片'}};
    try{
      await Promise.all([image(sample.first.src),image(sample.last.src)]);
      return {...sample,duration:4};
    }catch{
      const entries=sources().slice(0,2);
      if(entries.length<2)throw Error('Sample frames are unavailable. Add two images from your asset library instead.');
      return {first:{name:entries[0].name,src:entries[0].src,origin:'Asset library'},last:{name:entries[1].name,src:entries[1].src,origin:'Asset library'},duration:4};
    }
  }
  async function run(action,node){const value=current();
    if(action==='back'){if(history.length>1)history.back();else location.hash='#/app/tools';return;}
    if(action==='play'){const frame=document.getElementById('tool-motion-frame');if(frame){const playing=!frame.classList.contains('is-playing');frame.classList.toggle('is-playing',playing);node.setAttribute('aria-pressed',String(playing));node.setAttribute('aria-label',playing?'Pause':'Play');const label=node.querySelector('.tm-play-label');if(label)label.textContent=playing?'Pause':'Play';else node.textContent=playing?'Ⅱ 暂停':'▷ 播放';}return;}
    if(action==='crop-toggle'){const crop=document.querySelector('.tm-crop');if(crop){crop.open=!crop.open;node.setAttribute('aria-expanded',String(crop.open));}return;}
    if(action==='frame-step'){activeFrame=node.dataset.role==='last'?'last':'first';H.render();focusControl(activeFrame);return;}
    if(action==='asset-open'){openAssetPicker(node.dataset.role);return;}
    if(action==='asset-cancel'){assetPicker=null;Site.close();return;}
    if(action==='asset-pick'){
      const picker=assetPicker,source=picker?.entries[Number(node.dataset.index)];
      if(!source||!picker.dialog.isConnected)return;
      picker.dialog.setAttribute('aria-busy','true');
      try{
        const available=sources().find(entry=>entry.key===source.key);
        if(!available)throw Error('This image is no longer available. Reopen the library to choose another.');
        const src=await dataImage(available.src);
        if(assetPicker!==picker||!picker.dialog.isConnected)return;
        acceptFrame(picker.role,{...available,src,origin:'Asset library'},{closePicker:true});
      }catch(error){if(picker.dialog.isConnected)picker.dialog.querySelector('#tm-picker-error').textContent=error.message;}
      finally{picker.dialog.removeAttribute('aria-busy');}
      return;
    }
    if(action==='mode'){const mode=node.dataset.mode,inputs=copy(value.inputs);if(mode==='keyframes'&&!inputs.first&&inputs.main)inputs.first=copy(inputs.main);if(mode==='single'&&!inputs.main&&inputs.first)inputs.main=copy(inputs.first);activeFrame='first';write({motionMode:mode,inputs,motionPlan:null,motionBaseId:'',motionFirstAdded:value.motionFirstAdded||!!inputs.first});return;}
    if(action==='sample'){if(value.motionMode==='keyframes'){const frames=await sampleFrames();write({inputs:{...value.inputs,first:frames.first,last:frames.last},prompt:SAMPLE_PROMPT,motionSample:{first:frames.first.src,last:frames.last.src,duration:frames.duration},motionPlan:null,motionBaseId:''});}else write({inputs:{...value.inputs,main:{name:'雨夜少女 · 示例',src:'assets/cimora-story-1.webp',origin:'预置案例'}},prompt:'镜头缓慢推进，保持雨夜少女清晰。',option:'缓慢推进',region:null,motionPlan:null,motionBaseId:''});return;}
    if(action==='remove'){const inputs=copy(value.inputs);delete inputs[node.dataset.role];write({inputs,motionPlan:null,motionFirstAdded:value.motionFirstAdded||!!value.inputs.first});return;}
    if(action==='swap'){if(!value.inputs.first||!value.inputs.last)return;write({inputs:{...value.inputs,first:value.inputs.last,last:value.inputs.first},motionPlan:null});return;}
    if(action==='tail'){if(!value.inputs.first)throw Error('请先选择首帧。');if(!value.prompt.trim())throw Error('请先描述动作，以及尾帧应呈现的状态。');write({motionPlan:{id:Site.id('tail-request'),type:'tail',prompt:value.prompt.trim(),first:copy(value.inputs.first),at:new Date().toISOString()}});return;}
    if(action==='cancel'){write({motionPlan:null});return;}
    if(action==='region-reset'){write({region:null,motionPlan:null});return;}
    if(action==='clear-base'){write({motionBaseId:'',motionPlan:null});return;}
    if(action==='continue'){const version=selected(value);if(!version)return;const req=version.request;write({motionMode:req.mode,inputs:{...value.inputs,...copy(req.frames)},prompt:'',option:req.preset,region:copy(req.region),motionBaseId:version.id,motionPlan:null});document.getElementById('tm-prompt')?.focus();return;}
    if(action==='select'){write({motionSelectedId:node.dataset.id});return;}
    if(action==='generate'){
      if(value.motionVersions.length>=12)throw Error('本次已保留 12 个版本，请先保存需要的成果。');
      const req=M.request(value,Site.id('motion-request'));
      if(req.mode==='keyframes'&&!(req.prompt===SAMPLE_PROMPT&&req.frames.first.src===value.motionSample?.first&&req.frames.last.src===value.motionSample?.last&&!req.parentId)){write({motionPlan:{...req,type:'video'}});return;}
      let version={id:Site.id('motion-version'),request:req};
      if(req.mode==='keyframes')version={...version,kind:'sample-video',video:SAMPLE_VIDEO,duration:value.motionSample.duration};
      else{const result=await ToolLightTasks.generate({kind:'motion',art:1},{...value,inputs:{main:req.frames.main},region:req.region});version={...version,kind:'panzoom',image:result.preview[0].src,duration:10};}
      write({motionVersions:[...value.motionVersions,version],motionSelectedId:version.id,motionPlan:null,motionBaseId:''});
    }
  }
  async function snapshot(input){const value={...copy(defaults),...input},version=selected(value);if(!version)throw Error('请先生成并选择一个结果。');const images=version.request.mode==='keyframes'?await Promise.all(['first','last'].map(async role=>({role,src:await dataImage(version.request.frames[role].src)}))):[{role:'main',src:version.image}];return M.snapshot(version,images);}
  async function download(snapshot,emit){
    if(!snapshot.motion)return false;
    if(!emit&&window.ExportCenter){await ExportCenter.exportTool(snapshot);return true;}
    emit ||= Site.download;
    
    if(snapshot.motion.video){const response=await fetch(snapshot.motion.video);if(!response.ok)throw Error('短片下载失败，请重试。');await emit(await response.blob(),'图片动起来-预置运镜短片.mp4');return true;}
    const paired=snapshot.motion.type==='keyframes',frames=snapshot.images;
    const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>图片动起来</title><style>body{font:16px/1.8 sans-serif;max-width:900px;margin:30px auto;padding:0 20px}img{max-width:100%}.preview{max-width:540px;overflow:hidden}.preview img{display:block;animation:move 10s ease-in-out infinite alternate}.frames{display:flex;gap:16px}.frames figure{margin:0;width:50%}@keyframes move{from{transform:scale(1)}to{transform:scale(1.1)}}@media(prefers-reduced-motion:reduce){.preview img{animation:none}}</style><h1>'+E(snapshot.title)+'</h1><p>'+E(snapshot.prompt)+'</p><p>'+E(snapshot.notice)+'</p>'+(paired?'<div class="frames">'+frames.map(frame=>'<figure><img src="'+E(frame.src)+'"><figcaption>'+(frame.role==='first'?'首帧':'尾帧')+'</figcaption></figure>').join('')+'</div><p>此离线文件保留首尾参考和动作要求，不包含生成视频。</p>':'<div class="preview"><img src="'+E(frames[0].src)+'" style="'+(snapshot.motion.preset==='横向摇移'?'animation-name:pan':snapshot.motion.preset==='缓慢拉远'?'animation-direction:alternate-reverse':'')+'"></div><style>@keyframes pan{from{transform:scale(1.12) translateX(-3%)}to{transform:scale(1.12) translateX(3%)}}</style>');
    await emit(new Blob([html],{type:'text/html;charset=utf-8'}),'图片动起来-离线方案.html');
    return true;
  }
  function init(helpers){H=helpers;
    document.addEventListener('click',event=>{const menu=document.querySelector('.tm-frame-menu[open]');if(menu&&!menu.contains(event.target))menu.open=false;},true);
    document.addEventListener('keydown',event=>{const menu=document.querySelector('.tm-frame-menu[open]');if(event.key==='Escape'&&menu){event.preventDefault();menu.open=false;menu.querySelector('summary').focus();}},true);
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-tm]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(node.disabled)return;if(node.dataset.tm==='asset-cancel'){assetPicker=null;Site.close();return;}if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.tm,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('change',event=>{const node=event.target;if(node.id!=='tm-preset')return;event.stopImmediatePropagation();try{H.write({option:node.value});H.render();}catch(error){H.notice(error);}},true);
    document.addEventListener('input',event=>{if(event.target.id!=='tm-prompt')return;event.stopImmediatePropagation();try{H.write({prompt:event.target.value});document.getElementById('ts-message').textContent='描述已保存，提交后生成新版本。';}catch(error){H.notice(error);}},true);
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-tm]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(node.disabled)return;if(node.dataset.tm==='asset-cancel'){assetPicker=null;Site.close();return;}if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.tm,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;document.querySelectorAll('.tm-frame-menu[open]').forEach(menu=>{menu.open=false;});}},true);
  }
  // Presentation-only copy. Stored presets, requests and user-authored text stay intact.
  const demoCopy={
    '镜头缓慢推进，保持角色脸部清晰，营造雨夜重逢的氛围。':'Slowly push in, keep the character in focus, and capture a rainy-night reunion.',
    '镜头缓慢推进，保持雨夜少女清晰。':'Slowly push in and keep the girl in focus.',
    [SAMPLE_PROMPT]:'At a rainy station, a girl slowly raises her arms to read a letter. Keep the camera still.',
    '雨夜少女 · 示例':'Rainy-night girl · sample',
    '读信示例 · 起点':'Reading a letter · start frame',
    '读信示例 · 终点':'Reading a letter · end frame'
  };
  const displayCopy=value=>demoCopy[value]||value;
  const uiCopy={
    '1 Start Frame':'1 Start Frame','2 End Frame':'2 End Frame',
    '图片动起来':'Image to motion','创作工具':'Creative tools','资产库':'Asset Library','Asset Library':'Asset Library',
    '选择图片，描述动作，预览动态方案。':'Choose an image, describe the motion, and preview your idea.',
    '本机交互 Demo · 单图可预览真实运镜；首尾帧提供预置短片，自定义视频生成待接入。':'Local demo · preview camera motion from one image. Keyframes use a sample clip; custom video generation is not connected.',
    '画面与动作':'Image & motion','预览与版本':'Preview & versions',
    '试用示例':'Sample','试用完整示例':'Sample',
    '单图动起来':'Single image','首尾帧':'Start & end frames','动态创作方式':'Motion mode',
    '添加首尾两帧，描述中间的动作。':'Add both frames and describe the motion between them.',
    '选择原图，再描述动作。':'Choose an image, then describe the motion.',
    '原图':'Source image','首帧':'Start frame','尾帧':'End frame',
    '原图图片':'Source image','首帧图片':'Start frame image','尾帧图片':'End frame image',
    '移除':'Remove','移除原图':'Remove source image','移除首帧':'Remove start frame','移除尾帧':'Remove end frame',
    '上传图片':'Upload image','替换图片':'Replace image','上传已有尾帧图片':'Upload end frame',
    '＋ 选择图片':'Choose an image','点击选择或拖入文件':'Choose or drop a file',
    '选择已有成果或资产':'Choose an existing asset','请选择已有图片':'Choose an existing image',
    '原图素材':'Source image asset','首帧素材':'Start frame asset','尾帧素材':'End frame asset',
    '交换首尾':'Swap frames','AI 帮我生成尾帧':'Create end frame with AI',
    '选择画面区域（可选）':'Select an image region (optional)',
    '拖出要动起来的区域，默认使用整图。':'Drag to select a region.',
    '原图，拖动选择区域':'Source image; drag to select a region',
    '已选择区域':'Region selected','当前使用整图':'Full image in use','使用整图':'Use full image',
    '描述这次想修改的地方':'Motion prompt','描述动作或修改要求':'Motion prompt',
    '例如：女孩听见呼喊，缓慢转身，最后露出惊讶的表情，镜头保持固定。':'For example: a girl hears a call, turns slowly, and looks surprised. Keep the camera still.',
    '取消基于此版修改':'Cancel this revision','运镜方式':'Camera motion',
    '旧结果保留。':'Previous results are kept.','仅本地预览运镜，不生成人物动作。':'Local preview only. Character motion is not generated.',
    '缓慢推进':'Slow push in','横向摇移':'Horizontal pan','缓慢拉远':'Slow pull back',
    '生成短片':'Generate clip','生成运镜预览':'Generate motion preview',
    '尾帧要求已记录 · 待接入 AI':'End frame request saved · AI not connected',
    '视频生成要求已记录 · 待接入 AI':'Video request saved · AI not connected',
    '下方保留上一次结果，当前要求尚未生成新版本。':'Your previous result is kept below. This request has not generated a new version.',
    '当前不调用付费模型，不会将预置短片当作你的生成结果。':'No paid model is called. The sample clip is not presented as your generated result.',
    '取消本次要求':'Cancel request','预置运镜短片':'Sample motion clip','本地运镜预览':'Local motion preview',
    '选定画面的运镜预览':'Camera motion preview',
    '预置运镜短片：可体验播放与版本选择，未按输入要求生成角色动作。':'Sample clip: try playback and version selection. Character motion is not generated from your request.',
    '描述随方案保存；本地仅执行选区与运镜，不生成角色动作。':'Your description is saved with the plan. The local preview animates the camera, not the character.',
    '本机 CSS 运镜预览，非生成的人物动画或 MP4。下载后可离线播放。':'Local CSS camera preview, not generated character animation or MP4. The offline preview supports playback.',
    '继续修改':'Continue editing','下载当前结果':'Download','保存到资产库':'Save to asset library','带入视频镜头':'Add as new shot',
    '带入时新增镜头参考方案，由你确认采用；不自动替换原镜头。':'Adds a new shot reference for your approval. The original shot is not replaced.',
    '动态版本':'Motion versions','Ⅱ 暂停':'Pause','▷ 播放':'Play',
    '运动描述':'Motion description','版本':'Versions','暂停':'Pause','播放':'Play',
    '让一张画面，或两个瞬间连起来':'Animate an image or connect two frames',
    '选择图片并描述动作，或先试用一份完整示例。':'Choose an image and describe the motion, or try a complete sample.',
    '请先选择一张图片。':'Choose an image first.','请先选择首帧图片。':'Choose a start frame first.',
    '请选择尾帧，只有一张图片可切换到单图动起来。':'Choose an end frame, or switch to single image mode.',
    '请描述想要的动作或这次修改的地方。':'Describe the motion or changes first.',
    '请先选择首帧。':'Choose a start frame first.','请先描述动作，以及尾帧应呈现的状态。':'Describe the motion and desired end frame first.',
    '请选择 1.5 MB 以内的 PNG、JPG 或 WebP。':'Choose a PNG, JPG, or WebP file under 1.5 MB.',
    '图片读取失败。':'Unable to read the image.','请使用 2500 万像素以内的图片。':'Use an image under 25 megapixels.',
    '首帧已变化，请重新提交尾帧要求。':'The start frame has changed. Submit the end frame request again.',
    '本次已保留 12 个版本，请先保存需要的成果。':'You have 12 versions. Save the results you need first.',
    '请先生成并选择一个结果。':'Generate and select a result first.',
    '描述已保存，提交后生成新版本。':'Description saved. Submit to create a new version.',
    '短片下载失败，请重试。':'Clip download failed. Please try again.',
    '已保存到资产库':'Saved to asset library','将成果带入作品':'Add result to a project',
    '只向选中位置增加候选，不替换已采用结果。首尾帧与来源保留在候选快照中。':'Adds a candidate to the selected target without replacing adopted results. Frame references are preserved.',
    '还没有可用作品。可先保存个人成果，创建漫画或视频后再带入。':'No compatible projects yet. Save your result and create a comic or video project first.',
    '选择作品':'Choose a project','兼容目标':'Compatible target','请选择要加入的位置':'Choose a target',
    '确认新增候选':'Confirm new candidate','查看资产库':'View asset library',
    '本版动作描述':'Motion description for this version',
    '✓ 已保存到资产库':'✓ Saved to asset library','查看资产':'View asset','View 资产':'View asset',
    '已选择区域，生成预览后生效':'Region selected. Generate a preview to apply it.',
    '选区已保存，请生成预览。':''
  };
  const ACRONYMS={ai:'AI',css:'CSS',mp4:'MP4',png:'PNG',jpg:'JPG',jpeg:'JPEG',webp:'WebP',html:'HTML',url:'URL',api:'API'};
  const SMALL_WORDS=new Set(['a','an','the','and','or','nor','but','of','in','on','at','to','for','with','from','by','as','via','per','vs','into','over']);
  function sentenceCase(text){
    return text.replace(/[A-Za-z][A-Za-z0-9'’-]*/g,(token,offset)=>{
      const before=text.slice(0,offset),lower=token.toLowerCase();
      if(ACRONYMS[lower])return ACRONYMS[lower];
      if(/[A-Z]/.test(token.slice(1)))return token;
      const capitalize=/(?:^|[.!?·:]\s*)$/.test(before);
      return capitalize?lower.charAt(0).toUpperCase()+lower.slice(1):lower;
    });
  }
  function titleCase(text){
    const parts=text.split(/(\s+)/);
    const wordIndexes=parts.map((part,index)=>/[A-Za-z]/.test(part)?index:-1).filter(index=>index>=0);
    const first=wordIndexes[0];
    return parts.map((part,index)=>{
      if(!/[A-Za-z]/.test(part))return part;
      return part.replace(/[A-Za-z][A-Za-z0-9'’-]*/g,word=>{
        const lower=word.toLowerCase();
        if(ACRONYMS[lower])return ACRONYMS[lower];
        if(/[A-Z]/.test(word.slice(1)))return word;
        if(index!==first&&SMALL_WORDS.has(lower))return lower;
        return lower.charAt(0).toUpperCase()+lower.slice(1);
      });
    }).join('');
  }
  function uiLabel(value){
    const key=value.trim();
    const has=Object.prototype.hasOwnProperty;
    const mapped=has.call(uiCopy,key)||has.call(demoCopy,key);
    let result=has.call(uiCopy,key)?uiCopy[key]:demoCopy[key],fallback=false;
    if(!mapped){
      fallback=true;
      const rules=[
        [/^(\d+) 个版本$/,(_,count)=>count+' '+(count==='1'?'version':'versions')],[/^第\s*(\d+)\s*版$/,'Version $1'],
        [/^第\s*(\d+)\s*版缩略图$/,'Version $1 thumbnail'],[/^查看动态第\s*(\d+)\s*版$/,'View motion version $1'],
        [/^第\s*(\d+)\s*版编辑中$/,'Editing version $1'],[/^基于第\s*(\d+)\s*版继续修改，旧结果保留。$/,'Editing version $1. Previous results are kept.'],
        [/^(\d+) 秒循环 · (.+)$/,(_,seconds,preset)=>seconds+'-second loop · '+(uiCopy[preset]||preset)],
        [/^已保存「图片动起来 · (单图|首尾帧)」到资产库。$/,(_,mode)=>'Saved image to motion · '+(mode==='单图'?'single image':'start & end frames')+' to asset library.']
      ];
      for(const [pattern,replacement] of rules)if(pattern.test(key)){result=key.replace(pattern,replacement);break;}
    }
    if(!mapped)result=result||key;
    if(fallback&&!/[\u3400-\u9fff]/.test(result))result=/[.!?][)"'”’]?\s*$/.test(result)?sentenceCase(result):titleCase(result);
    return value.replace(key,()=>result);
  }
  window.ToolMotion={prepare,render,snapshot,download,init,uiLabel};
})();
