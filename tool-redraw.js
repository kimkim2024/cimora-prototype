(()=>{
  'use strict';
  const E=Site.esc,R=ToolRedrawModel,copy=value=>JSON.parse(JSON.stringify(value));
  const SAMPLE_PROMPT='保留人物动作和镜头，调整成柔和低饱和的动画配色。';
  const defaults={source:null,start:0,end:4,prompt:'',intentOverride:'',operations:null,replacements:null,character:null,scene:{description:'',reference:null},style:null,keepAudio:true,versions:[],selectedId:'',pending:null,modification:''};
  const labels={style:'换画风',character:'换角色',scene:'换场景'};
  const urls=new Map();let H,busy=false,database,marking;
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-tr="${action}" ${extra}>${label}</button>`;
  const normalized=input=>{const value={...copy(defaults),...input};value.replacements??=value.character?[{id:'legacy-character',target:'',replacement:value.character}]:[];value.scene??={description:'',reference:null};return value;};
  const state=()=>normalized(H.value());
  const selected=value=>value.versions.find(version=>version.id===value.selectedId);
  const playingSource=source=>source?.url||urls.get(source?.blobKey)||'';
  const write=patch=>{if(['source','start','end','prompt','operations','replacements','scene','character','style','keepAudio'].some(key=>key in patch)){patch.framePreview=null;patch.confirmation=null;}H.write(patch);H.render();};
  function invalidatePreview(){H.write({framePreview:null,confirmation:null});document.getElementById('tr-frame-preview')?.remove();}
  function refreshScope(){const value=state(),node=document.getElementById('tr-scope-label');if(node)node.textContent=R.summary(value);}
  function updateMapping(id,patch,render=true){const value=state();const replacements=value.replacements.map(item=>item.id===id?{...item,...patch}:item);if(render)write({replacements});else{invalidatePreview();H.write({replacements});refreshScope();}}
  function resetTargets(){return state().replacements.map(item=>({...item,target:'',anchor:null}));}
  function roleOptions(){return characters().map(person=>`<option value="${E(person.key)}">${E(person.name)}</option>`).join('');}
function mappingCard(item,index){return `<details class="tr-mapping" data-mapping="${E(item.id)}" ${item.collapsed?'':'open'}><summary><strong>${E(item.target||'角色替换 '+(index+1))}</strong> → ${E(item.replacement?.name||'待选角色参考')}</summary><div class="tr-row"><strong>角色替换 ${index+1}</strong>${button('移除','remove-mapping',`data-id="${E(item.id)}"`)}</div><label>原片中要替换谁？<input type="text" maxlength="120" data-tr-target="${E(item.id)}" value="${E(item.target||'')}" placeholder="例如：戴眼镜的黑发男生"></label>${item.anchor?`<div class="tr-anchor"><img src="${E(item.anchor.image)}" alt="原片人物标记"><span class="tr-anchor-dot" style="left:${item.anchor.point.x*100}%;top:${item.anchor.point.y*100}%"></span></div><small>已标记原片 ${item.anchor.time.toFixed(1)} 秒的位置，请用人物特征补充说明。</small>`:''}${button(item.anchor?'重新标记原片人物':'从原片画面标记','mark-target',`data-id="${E(item.id)}"`)}<div class="tr-map-arrow">↓ 替换为</div>${item.replacement?`<div class="tr-ref-image"><img src="${E(item.replacement.src)}" alt="替换角色参考"><span>${E(item.replacement.name)}</span>${button('清除参考','clear-replacement',`data-id="${E(item.id)}"`)}</div>`:''}<label class="tr-upload">${item.replacement?'更换角色参考图':'上传替换角色参考图'}<input type="file" data-tr-mapping-upload="${E(item.id)}" accept="image/png,image/jpeg,image/webp"></label><label>或选择已有角色<select data-tr-mapping-select="${E(item.id)}"><option value="">选择角色资产</option>${roleOptions()}</select></label></details>`;}
  function operationButtons(value){const ops=R.operations(value);return Object.entries(labels).map(([key,label])=>button(label,'toggle-operation',`data-operation="${key}" aria-pressed="${ops.includes(key)}"`)).join('');}
  async function markTarget(id){
    const value=state(),video=document.getElementById('tr-source-video');
    if(!value.source||!video||video.readyState<2)throw Error('请先上传并播放原片，暂停到目标人物出现的画面。');
    video.pause();
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{video.removeEventListener('seeked',done);reject(Error('当前画面尚未解码，请播放原片后重新暂停标记。'));},5000);function done(){clearTimeout(timer);resolve();}video.addEventListener('seeked',done,{once:true});video.currentTime=Math.max(0,Math.min(video.duration-.01,video.currentTime+.01));});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const time=video.currentTime,canvas=document.createElement('canvas'),scale=Math.min(1,720/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    marking={id,sourceId:value.source.id,time,image:canvas.toDataURL('image/webp',.8)};
    Site.modal('标记原片人物',`<p>点击要替换的人物；此处只记录目标位置，请在角色条目中补充人物特征。</p><div class="tr-mark-image" id="tr-mark-image"><img src="${E(marking.image)}" alt="点击原片中的目标人物"></div><p id="tr-mark-label" role="status">原片 ${time.toFixed(1)} 秒 · 尚未标记</p>`,button('取消','close')+button('确认人物标记','confirm-target','',true));
  }
  function openDB(){
    if(!database)database=new Promise((resolve,reject)=>{const request=indexedDB.open('cimora-tool-video-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('无法打开视频存储，请检查浏览器存储权限。'));request.onblocked=()=>reject(Error('视频存储暂时被其他页面占用，请关闭旧页面后重试。'));});
    return database;
  }
  async function fileStore(mode,key,file){const db=await openDB();return new Promise((resolve,reject)=>{const transaction=db.transaction('files',mode),request=mode==='readwrite'?transaction.objectStore('files').put(file,key):transaction.objectStore('files').get(key);transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(Error('视频未能存入本机，请释放浏览器存储空间后重试。'));transaction.onabort=transaction.onerror;});}
  function sources(){
    const items=[];
    for(const result of H.store.list())if(result.redraw?.video)items.push({key:'result:'+result.id,id:result.id,name:'工具成果 · '+result.title+' v'+result.version,url:result.redraw.video,duration:result.redraw.duration,poster:result.images?.[0]?.src,origin:'已保存的演示短片'});
    for(const entry of H.targets())if(entry.scope==='video')for(const shot of entry.context.e.productionShots||[])for(const candidate of shot.candidates||[]){const media=candidate.media;if(media?.url&&/^assets\/[\w/-]+\.mp4$/.test(media.playbackUrl||media.url))items.push({key:entry.key+':'+candidate.id,id:candidate.id,name:entry.label+' / '+shot.title+' v'+candidate.version,url:media.playbackUrl||media.url,duration:(media.out||shot.duration)-(media.in||0),offset:media.playbackUrl?0:media.in||0,poster:candidate.image||'assets/tool-motion-first.webp',origin:candidate.origin||media.source||'项目视频候选',projectId:entry.context.p.id,episodeId:entry.context.c.id,shotId:shot.id});}
    return items;
  }
  function characters(){
    const items=[];
    for(const result of H.store.list())if(result.toolId==='oc-sheet'&&result.character){const src=result.images.find(image=>image.role==='main')?.src||result.images.find(image=>image.role==='sheet')?.src;if(src)items.push({key:'result:'+result.id,name:result.character.name||result.title,src,profile:result.character.profile,source:{resultId:result.id}});}
    for(const entry of H.targets())for(const asset of entry.scope==='comic'?entry.project.assets:entry.context.e.videoFlow.workspace.assets){if(!['角色','人物'].includes(asset.kind))continue;const candidate=entry.scope==='comic'?asset.visualVersions?.find(version=>version.id===asset.adoptedVisualId):asset.candidates?.find(version=>version.id===asset.adoptedId);const src=candidate?.images?.main||candidate?.image||asset.reference;if(src)items.push({key:entry.key+':'+asset.id,name:asset.name,src,profile:asset.characterProfile||asset.storyProfile||null,source:{scope:entry.scope,projectId:entry.project?.id||entry.context?.p.id,episodeId:entry.context?.c.id,assetId:asset.id,versionId:candidate?.id}});}
    return items;
  }
  function reference(value,role,label){const item=value[role];return `<section class="tr-reference"><div class="tr-row"><strong>${label}</strong>${item?button('移除','remove-ref',`data-role="${role}"`):''}</div>${item?`<div class="tr-ref-image"><img src="${E(item.src)}" alt="${label}"><span>${E(item.name)}</span></div>`:''}<label class="tr-upload">${item?'替换参考图':'上传参考图'}<input type="file" data-tr-reference="${role}" accept="image/png,image/jpeg,image/webp"></label>${role==='character'?`<label>或选择已有角色<select id="tr-character"><option value="">选择角色资产</option>${characters().map(person=>`<option value="${E(person.key)}">${E(person.name)}</option>`).join('')}</select></label>`:''}</section>`;}
  function output(value){
    const version=selected(value),request=version?.request,pending=value.pending;
    const original=playingSource(request?.source);
return `<section class="ts-panel tr-output"><div class="tr-row"><h2>预览与修改</h2><small>${value.versions.length} 个版本</small></div>${pending?`<section class="tr-pending" role="status"><strong>${pending.kind==='frame'?'效果预览要求':'转绘要求'}已保存 · 待接入 AI</strong><p>${E(pending.request.prompt)}</p><p class="tr-caption">${E(R.summary(pending.request))}</p><small>${pending.request.duration} 秒 · ${E(R.operations(pending.request).map(key=>labels[key]).join(' + '))} · ${pending.request.keepAudio?'保留原声':'不保留原声'}${version?'。下方保留上一版，当前要求尚未生成。':'。尚未处理输入视频，不产生费用。'}</small>${button('取消本次要求','cancel')}</section>`:''}${version?`<div class="tr-compare" role="group" aria-label="对比原片与转绘"><button type="button" class="cm-button ghost" data-tr="compare" data-mode="original" aria-pressed="${value.compare==='original'}">原片</button><button type="button" class="cm-button ghost" data-tr="compare" data-mode="result" aria-pressed="${value.compare!=='original'}">转绘结果</button></div><div class="tr-screen"><video id="tr-result" controls playsinline preload="metadata" src="${E(value.compare==='original'?original:version.video)}" poster="${E(value.compare==='original'?request.source.poster||'':version.poster)}" ${!request.keepAudio?'muted':''}></video><span>${value.compare==='original'?'原片':'预置调色演示 · 非 AI 转绘'}</span></div>${value.compare==='original'&&!original?'<p class="tr-note">原视频暂不可用，请重新选择原文件。</p>':''}<p class="tr-caption">${E(request.prompt)}</p><p class="tr-caption">${E(R.summary(request))}</p><p class="tr-note">第 ${value.versions.indexOf(version)+1} 版 · ${request.duration} 秒 · ${request.keepAudio?'保留原声要求':'静音要求'}。本示例原片无声；转绘结果为同动作的本地调色短片。</p><label for="tr-modify">描述想修改的地方</label><textarea id="tr-modify" rows="3" maxlength="1000" placeholder="${request.intent==='character'?'例如：发型和服装沿用角色参考，动作保持原样。':request.intent==='scene'?'例如：改成傍晚，增加雨雾，保持原来的运镜。':'例如：颜色更柔和一些，保持原来的动作。'}">${E(value.modification)}</textarea><div class="tr-suggestions">${(request.intent==='character'?['发型沿用参考','保留这套服装']:request.intent==='scene'?['改成傍晚','增加雨雾氛围']:['颜色更柔和','线条更清晰']).map(text=>button(E(text),'suggest',`data-text="${E(text)}"`)).join('')}</div><div class="tr-actions">${button('修改生成','modify','',true)}${H.action('下载选中版本','download')}${H.action('保存选中版本','save')}${H.action('带入视频镜头','bring')}</div><p class="tr-note">保存和带入使用当前选中的完成版；未生成的修改要求单独保留。</p><div class="tr-versions" aria-label="转绘版本">${value.versions.map((item,index)=>button(`<img src="${E(item.poster)}" alt="第 ${index+1} 版封面"><span>第 ${index+1} 版</span>`,'version',`data-id="${E(item.id)}" aria-label="查看转绘第 ${index+1} 版" aria-pressed="${item.id===version.id}"`)).join('')}</div>`:pending?'':'<div class="tr-empty"><span>▷</span><h3>沿用动作，换一种画面表达</h3><p>上传视频并描述效果，或先试用完整示例。</p>'+button('试用完整示例','sample')+'</div>'}</section>`;
  }
  function render(input){
    const value=normalized(input),src=playingSource(value.source);
    return `<main class="ts-page tr-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>视频转绘</h1><p>保留喜欢的动作与镜头，把视频变成你的二次元表达。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><p class="tr-note">本机交互 Demo · 示例可播放对比；自定义视频转绘与角色替换待接入模型。</p><div class="tr-workbench"><section class="ts-panel tr-input"><div class="tr-row"><h2>视频与效果</h2>${button('试用示例','sample')}</div><label class="tr-upload tr-video-upload">${value.source?'替换视频':'＋ 上传视频'}<input type="file" id="tr-upload" accept="video/mp4,video/webm,video/quicktime"><small>MP4 / WebM / MOV，100 MB 以内；能否预览取决于浏览器是否支持视频编码。</small></label><details class="tr-existing"><summary>选择已有视频片段</summary><label>项目片段或工具成果<select id="tr-source"><option value="">选择视频</option>${sources().map(source=>`<option value="${E(source.key)}">${E(source.name)}</option>`).join('')}</select></label>${sources().length?'':'<p class="tr-note">暂无已有视频片段，可上传视频或试用示例。</p>'}</details>${value.source?`<div class="tr-source-heading"><strong>${E(value.source.name)}</strong>${button('移除视频','remove-source')}</div>${src?`<video id="tr-source-video" controls playsinline preload="metadata" src="${E(src)}" poster="${E(value.source.poster||'')}"></video>`:'<p class="tr-note">正在恢复本机视频。如文件已清理，请重新上传。</p>'}<div class="tr-range"><div class="tr-row"><strong>选择处理片段</strong><small id="tr-length">${(value.end-value.start).toFixed(1)} 秒 / 原片 ${value.source.duration.toFixed(1)} 秒</small></div><label>起点 <input id="tr-start" type="range" min="0" max="${value.source.duration}" step="0.1" value="${value.start}"></label><label>终点 <input id="tr-end" type="range" min="0" max="${value.source.duration}" step="0.1" value="${value.end}"></label><div class="tr-time-fields"><label>开始 / 秒<input id="tr-start-number" type="number" min="0" max="${value.source.duration}" step="0.1" value="${value.start}"></label><label>结束 / 秒<input id="tr-end-number" type="number" min="0" max="${value.source.duration}" step="0.1" value="${value.end}"></label>${button('播放选中片段','preview-clip')}</div><p class="tr-note">建议先试 3–5 秒，单次最多 10 秒。</p></div>`:''}<label for="tr-prompt">你想怎么改？</label><textarea id="tr-prompt" rows="4" maxlength="2000" placeholder="例如：把这段舞蹈变成日漫风，保留原来的动作和节奏。">${E(value.prompt)}</textarea><div class="tr-suggestions tr-operations" aria-label="选择修改内容">${operationButtons(value)}</div><p class="tr-note">可组合选择。未指定的人物保持原样，沿用原动作与镜头。</p><div id="tr-guidance">${guidance(value)}</div><div class="tr-scope"><strong>本次修改与保留</strong><p id="tr-scope-label" class="tr-caption">${E(R.summary(value))}</p><label class="tr-checkbox"><input type="checkbox" id="tr-audio" ${value.keepAudio?'checked':''}>保留原声</label><small>生成前展示处理时长与预计消耗；Demo 不调用模型，消耗为 0。</small></div><div class="tr-actions">${button('先看一张效果','preview-frame')}${button('生成转绘','generate','',true)}</div><p id="ts-message" role="status"></p></section>${output(value)}</div></main>`;
  }
  function guidance(value){
    const ops=R.operations(value);
    return `${ops.includes('character')?`<section class="tr-character-list"><h3>谁换成谁</h3><p class="tr-note">只替换一人就填一条，多人分别对应。可暂停原片后标记人物，补充发型、衣着等特征。</p>${value.replacements.map(mappingCard).join('')}${button('＋ 添加替换角色','add-mapping')}<p class="tr-note">其余人物保持原样。人物标记用于说明目标，不代表已完成自动跟踪。</p></section>`:''}${ops.includes('scene')?`<section class="tr-scene"><h3>场景要换成什么？</h3><label for="tr-scene-description">新场景描述（可在上方统一描述）</label><textarea id="tr-scene-description" rows="2" maxlength="800" placeholder="例如：雨夜天台，远处是城市霓虹。">${E(value.scene.description||'')}</textarea><details ${value.scene.reference?'open':''}><summary>添加场景参考（可选）</summary>${reference({scene:value.scene.reference},'scene','场景参考')}</details><p class="tr-note">${ops.includes('character')?'只替换清单中指定的角色，其余人物保持原样。':'原角色外观、服装和动作保持原样。'}</p></section>`:''}${ops.includes('style')?`<details class="tr-style" ${value.style?'open':''}><summary>添加画风参考（可选）</summary>${reference(value,'style','画风参考')}</details>`:''}`;
  }
  async function readVideo(file){
    if(!file||file.size>100*1024*1024||!(/\.(mp4|webm|mov)$/i.test(file.name)||/^video\//.test(file.type)))throw Error('请选择 100 MB 以内的视频文件。');
    const url=URL.createObjectURL(file),video=document.createElement('video');video.preload='auto';video.muted=true;video.src=url;
    try{
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('视频读取超时，请使用 MP4（H.264）重试。')),12000);video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(Error('浏览器无法播放此视频，请换成 MP4（H.264）或 WebM。'));};});
      if(!Number.isFinite(video.duration)||video.duration<.2)throw Error('视频时长无效，请换一个片段。');
      const canvas=document.createElement('canvas'),scale=Math.min(1,480/video.videoWidth);canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      const blobKey=Site.id('tool-video');await fileStore('readwrite',blobKey,file);urls.set(blobKey,url);
      return {id:blobKey,blobKey,name:file.name,duration:video.duration,poster:canvas.toDataURL('image/webp',.75),origin:'本机上传',size:file.size};
    }catch(error){URL.revokeObjectURL(url);throw error;}finally{video.removeAttribute('src');video.load();}
  }
  async function readImage(file){
    if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>5*1024*1024)throw Error('请选择 5 MB 以内的 PNG、JPG 或 WebP。');
    const url=URL.createObjectURL(file),image=new Image();
    try{image.src=url;await image.decode();if(image.naturalWidth*image.naturalHeight>25000000)throw Error('参考图片请控制在 2500 万像素以内。');const canvas=document.createElement('canvas'),scale=Math.min(1,720/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return {name:file.name,src:canvas.toDataURL('image/webp',.8),source:{scope:'upload'}};}finally{URL.revokeObjectURL(url);}
  }
  async function generate(value,kind='video'){
    if(value.versions.length>=12)throw Error('本轮已保留 12 个版本，请先保存需要的成果。');
    const request=R.request(value,Site.id('redraw-request'));
    const firstDemo=request.prompt===SAMPLE_PROMPT&&!request.parentId,softDemo=request.prompt===SAMPLE_PROMPT+'\n本次修改：颜色更柔和'&&request.parentId,fixture=softDemo?'soft':'demo';
    if(request.operations.join(',')!=='style'||request.source.id!=='redraw-demo'||request.start!==0||request.end!==4||(!firstDemo&&!softDemo)||request.style||!request.keepAudio){write({pending:{kind,request},confirmation:null,framePreview:null});return;}
    const image=new Image();image.src='assets/tool-redraw-'+fixture+'.webp';await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);
    const poster=canvas.toDataURL('image/webp',.8);
    if(kind==='frame'){write({framePreview:{poster,request},pending:null,confirmation:null});return;}
    const version={id:Site.id('redraw-version'),kind:'demo',request,video:'assets/tool-redraw-'+fixture+'.mp4',poster};
    write({versions:[...value.versions,version],selectedId:version.id,pending:null,confirmation:null,compare:'result',compareTime:0,modification:'',framePreview:null});
  }
  function confirmation(request,kind){Site.modal(kind==='frame'?'确认效果预览':'确认视频转绘',`<p>${E(request.source.name)} · ${request.start.toFixed(1)}–${request.end.toFixed(1)} 秒（${request.duration} 秒）</p><p>${E(R.summary(request))} · ${request.keepAudio?'保留原声':'不保留原声'}</p><p>${E(request.prompt)}</p><p>${kind==='frame'?'仅用于确认单张画面的视觉方向，不能判断动作连续性。':'Demo 预计消耗 0，不调用模型。自定义要求保存后显示待接入；完整预置示例可播放体验。'}</p>`,button('取消','close')+button(kind==='frame'?'确认效果预览':'确认生成','confirm','',true));}
  async function run(action,node){
    const value=state();
    if(action==='close'){marking=null;Site.close();return;}
    if(action==='sample'){write({source:{id:'redraw-demo',name:'读信与回头 · 演示原片',url:'assets/direction-a.mp4',poster:'assets/tool-motion-first.webp',duration:4,origin:'原创程序绘制演示'},start:0,end:4,prompt:SAMPLE_PROMPT,operations:['style'],intentOverride:'',replacements:[],character:null,scene:{description:'',reference:null},style:null,pending:null,modification:'',confirmation:null,framePreview:null});return;}
    if(action==='toggle-operation'){
      const op=node.dataset.operation,ops=R.operations(value),next=ops.includes(op)?ops.filter(item=>item!==op):[...ops,op];
      const replacements=next.includes('character')&&!value.replacements.length?[{id:Site.id('replace-role'),target:'',replacement:null}]:value.replacements;
      write({operations:next,intentOverride:'',replacements});return;
    }
    if(action==='add-mapping'){if(value.replacements.length>=8)throw Error('单次最多替换 8 个角色，请分段处理。');write({replacements:[...value.replacements.map(item=>({...item,collapsed:!!item.target&&!!item.replacement})),{id:Site.id('replace-role'),target:'',replacement:null}]});return;}
    if(action==='remove-mapping'){write({replacements:value.replacements.filter(item=>item.id!==node.dataset.id)});return;}
    if(action==='clear-replacement'){updateMapping(node.dataset.id,{replacement:null});return;}
    if(action==='mark-target'){await markTarget(node.dataset.id);return;}
    if(action==='confirm-target'){if(!marking?.point)throw Error('请先点击画面中要替换的人物。');const item=value.replacements.find(item=>item.id===marking.id);if(!item)throw Error('角色条目已变更，请重新标记。');Site.close();const {id,...anchor}=marking;marking=null;updateMapping(id,{anchor});return;}
    if(action==='remove-source'){write({source:null,replacements:resetTargets()});return;}
    if(action==='remove-ref'){if(node.dataset.role==='scene')write({scene:{...value.scene,reference:null}});else write({[node.dataset.role]:null});return;}
    if(action==='compare'){const current=document.getElementById('tr-result'),version=selected(value);if(current&&version)H.write({compareTime:Math.max(0,current.currentTime-(value.compare==='original'?(version.request.source.offset||0)+version.request.start:0))});write({compare:node.dataset.mode});return;}
    if(action==='version'){write({selectedId:node.dataset.id,compare:'result',compareTime:0,modification:''});return;}
    if(action==='cancel'){write({pending:null});return;}
    if(action==='use-frame'){const preview=value.framePreview;if(!preview)throw Error('请先重新查看效果。');const request=preview.request;H.write({confirmation:{kind:'video',request}});confirmation(request,'video');return;}
    if(action==='suggest'){H.write({modification:node.dataset.text});document.getElementById('tr-modify').value=node.dataset.text;document.getElementById('tr-modify').focus();return;}
    if(action==='preview-clip'){const video=document.getElementById('tr-source-video');if(!video)throw Error('原视频暂不可用，请重新上传。');video.currentTime=(value.source.offset||0)+value.start;await video.play();return;}
    if(action==='generate'||action==='preview-frame'){const kind=action==='preview-frame'?'frame':'video',request=R.request(value,Site.id('redraw-check'));H.write({confirmation:{kind,request}});confirmation(request,kind);return;}
    if(action==='modify'){const version=selected(value);if(!version)throw Error('请先选择一个完成版。');if(!value.modification.trim())throw Error('请描述想修改的地方。');const req=version.request,next={...value,source:copy(req.source),start:req.start,end:req.end,prompt:req.prompt+'\n本次修改：'+value.modification.trim(),operations:R.operations(req),replacements:copy(req.replacements||[]),scene:copy(req.scene||{description:'',reference:null}),intentOverride:'',character:copy(req.character),style:copy(req.style),keepAudio:req.keepAudio,baseId:version.id};const request=R.request(next,Site.id('redraw-check'));H.write({confirmation:{kind:'video',request}});confirmation(request,'video');return;}
    if(action==='confirm'){const confirmed=value.confirmation;if(!confirmed)throw Error('请重新确认本次要求。');Site.close();const req=confirmed.request;await generate({...value,source:req.source,start:req.start,end:req.end,prompt:req.prompt,operations:R.operations(req),replacements:req.replacements,scene:req.scene,intentOverride:'',character:req.character,style:req.style,keepAudio:req.keepAudio,baseId:req.parentId},confirmed.kind);}
  }
  async function hydrate(){
    if(!document.querySelector('.tr-page'))return;
    const value=state(),versions=value.versions.map(version=>version.request.source),items=[value.source,value.pending?.request.source,...versions].filter(source=>source?.blobKey&&!urls.has(source.blobKey));
    for(const source of items){try{const file=await fileStore('readonly',source.blobKey);if(file)urls.set(source.blobKey,URL.createObjectURL(file));}catch(error){H.notice(error);}}
    if(items.some(source=>urls.has(source.blobKey))&&document.querySelector('.tr-page')){H.render();return;}
    if(value.framePreview){const host=document.querySelector('.tr-output');host.querySelector('.tr-empty')?.remove();host.querySelector('.tr-row').insertAdjacentHTML('afterend',`<section id="tr-frame-preview"><h3>单张效果预览</h3><img src="${E(value.framePreview.poster)}" alt="预置调色效果帧"><p class="tr-note">本地调色示意，非 AI 转绘；单张效果无法判断动作连续性。</p>${button('按这个效果生成短片','use-frame','',true)}</section>`);}
    const sourceVideo=document.getElementById('tr-source-video');if(sourceVideo)sourceVideo.addEventListener('timeupdate',()=>{const current=state();if(sourceVideo.currentTime>=(current.source?.offset||0)+current.end)sourceVideo.pause();});
    const result=document.getElementById('tr-result');if(result){const current=selected(value);result.addEventListener('loadedmetadata',()=>{if(!current)return;const time=value.compare==='original'?(current.request.source.offset||0)+current.request.start+(value.compareTime||0):value.compareTime||0;result.currentTime=Math.min(time,Math.max(0,result.duration-.01));},{once:true});result.addEventListener('timeupdate',()=>{if(value.compare==='original'&&current&&result.currentTime>=(current.request.source.offset||0)+current.request.end)result.pause();});}
  }
  function hydrateVideo(){
    const projectId=Site.context.params.get('project'),episodeId=Site.context.params.get('episode'),entry=H.targets().find(item=>item.scope==='video'&&item.context.p.id===projectId&&(!episodeId||item.context.c.id===episodeId));
    if(!entry)return;
    for(const card of document.querySelectorAll('.vsb-shot')){
      const form=card.querySelector('.vsb-shot-form'),shot=entry.context.e.productionShots.find(item=>item.id===form?.dataset.shot),versionId=card.querySelector('.vsb-version-list [aria-pressed="true"]')?.dataset.id,candidate=shot?.candidates.find(item=>item.id===versionId);
      if(candidate?.redrawClip){const host=card.querySelector('.vsb-result-image');if(host)host.innerHTML=`<video class="tr-candidate-video" controls playsinline preload="metadata" src="${E(candidate.redrawClip.video)}" poster="${E(candidate.image)}"></video>`;const label=card.querySelector('.vsb-result .vsb-section-title small');if(label)label.textContent='预置转绘演示短片';}
    }
    const screen=document.querySelector('[data-vsb-stage="4"] .vsb-player-screen'),shotId=entry.context.e.videoFlow.selectedShotId||entry.context.e.selectedShotId,shot=entry.context.e.productionShots.find(item=>item.id===shotId),candidate=shot?.candidates.find(item=>item.id===shot.adoptedId);
    if(screen&&candidate?.redrawClip){screen.innerHTML=`<video class="tr-candidate-video" controls playsinline preload="metadata" src="${E(candidate.redrawClip.video)}" poster="${E(candidate.image)}"></video><span class="vsb-static-label">本镜转绘演示短片 · 下方整集时间线为节奏示意</span>`;}
  }
  function release(){for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();}
  async function download(snapshot){if(!snapshot.redraw)return false;const response=await fetch(snapshot.redraw.video);if(!response.ok)throw Error('转绘短片下载失败。');Site.download(await response.blob(),'视频转绘-预置调色演示.mp4');return true;}
  function init(helpers){
    H=helpers;
    document.addEventListener('toggle',event=>{const node=event.target;if(!node.matches?.('details.tr-mapping')||!node.isConnected)return;const value=state(),item=value.replacements.find(item=>item.id===node.dataset.mapping);if(item&&!!item.collapsed===node.open)H.write({replacements:value.replacements.map(item=>item.id===node.dataset.mapping?{...item,collapsed:!node.open}:item)});},true);
    document.addEventListener('click',event=>{const host=event.target.closest('#tr-mark-image');if(!host||!marking)return;const box=host.getBoundingClientRect();marking.point={x:Math.min(1,Math.max(0,(event.clientX-box.left)/box.width)),y:Math.min(1,Math.max(0,(event.clientY-box.top)/box.height))};host.querySelector('.tr-anchor-dot')?.remove();host.insertAdjacentHTML('beforeend',`<span class="tr-anchor-dot" style="left:${marking.point.x*100}%;top:${marking.point.y*100}%"></span>`);document.getElementById('tr-mark-label').textContent='已标记目标位置 · 原片 '+marking.time.toFixed(1)+' 秒';},true);
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-tr]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.tr,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('input',event=>{
      const node=event.target;if(!node.closest('.tr-page'))return;
      try{
        if(node.id==='tr-prompt'){invalidatePreview();const before=R.operations(state()).join(',');H.write({prompt:node.value});let value=state();if(before!==R.operations(value).join(',')){if(R.operations(value).includes('character')&&!value.replacements.length){H.write({replacements:[{id:Site.id('replace-role'),target:'',replacement:null}]});value=state();}document.getElementById('tr-guidance').innerHTML=guidance(value);document.querySelector('.tr-operations').innerHTML=operationButtons(value);}refreshScope();}
        if(node.dataset.trTarget)updateMapping(node.dataset.trTarget,{target:node.value},false);
        if(node.id==='tr-scene-description'){invalidatePreview();H.write({scene:{...state().scene,description:node.value}});refreshScope();}
        if(node.id==='tr-modify')H.write({modification:node.value,confirmation:null});
        if(['tr-start','tr-end','tr-start-number','tr-end-number'].includes(node.id)){invalidatePreview();const value=state(),key=node.id.includes('start')?'start':'end',number=Number(node.value);H.write({[key]:number,confirmation:null});document.getElementById('tr-'+key).value=number;document.getElementById('tr-'+key+'-number').value=number;document.getElementById('tr-length').textContent=(key==='start'?value.end-number:number-value.start).toFixed(1)+' 秒 / 原片 '+value.source.duration.toFixed(1)+' 秒';}
      }catch(error){H.notice(error);}
    },true);
    document.addEventListener('change',async event=>{
      const node=event.target;if(!node.closest('.tr-page'))return;
      if(!['tr-upload','tr-source','tr-audio'].includes(node.id)&&!node.dataset.trReference&&!node.dataset.trMappingUpload&&!node.dataset.trMappingSelect)return;
      event.stopImmediatePropagation();if(busy)return;busy=true;
      try{
        if(node.id==='tr-upload'){if(!node.files[0])return;const source=await readVideo(node.files[0]);if(document.querySelector('.tr-page'))write({source,start:0,end:Math.min(5,Math.floor(source.duration*10)/10),replacements:resetTargets()});}
        if(node.id==='tr-source'){const source=sources().find(item=>item.key===node.value);if(source)write({source,start:0,end:Math.min(5,source.duration),replacements:resetTargets()});}
        if(node.dataset.trMappingSelect){const person=characters().find(item=>item.key===node.value);if(person)updateMapping(node.dataset.trMappingSelect,{replacement:copy(person)});}
        if(node.dataset.trMappingUpload){if(!node.files[0])return;const reference=await readImage(node.files[0]);if(document.querySelector('.tr-page'))updateMapping(node.dataset.trMappingUpload,{replacement:reference});}
        if(node.id==='tr-audio'){invalidatePreview();H.write({keepAudio:node.checked,confirmation:null});}
        if(node.dataset.trReference){if(!node.files[0])return;const reference=await readImage(node.files[0]);if(document.querySelector('.tr-page')){if(node.dataset.trReference==='scene')write({scene:{...state().scene,reference}});else write({[node.dataset.trReference]:reference});}}
      }catch(error){H.notice(error);node.value='';}finally{busy=false;}
    },true);
  }
  window.ToolRedraw={render,hydrate,hydrateVideo,release,snapshot:input=>R.snapshot(selected({...copy(defaults),...input})),download,init};
})();
