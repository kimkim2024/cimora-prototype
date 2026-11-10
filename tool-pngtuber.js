(()=>{
  'use strict';
  const M=ToolPNGTuberModel,E=Site.esc,copy=value=>JSON.parse(JSON.stringify(value));
  let H,busy=false,timer=null,started=0;
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-png="${action}" ${extra}>${label}</button>`;
  const current=()=>({sourceMode:'upload',source:null,versions:[],selectedId:'',keptId:'',role:'idle',scope:'all',modification:'',background:'checker',pending:null,...H.value()});
  const write=patch=>{H.write(patch);H.render();};
  function sources(){
    const list=H.store.list().filter(item=>item.toolId==='oc-sheet'&&item.character&&item.images?.some(image=>image.role==='main')).map(item=>({key:'oc:'+item.id,scope:'oc',snapshotId:item.id,versionId:item.id,name:item.character.name||item.title,origin:'已保存 OC · v'+item.version,profile:item.character.profile||{},images:Object.fromEntries(item.images.filter(image=>['main','portrait'].includes(image.role)).map(image=>[image.role,image.src]))}));
    for(const entry of H.targets()){
      const assets=entry.scope==='comic'?entry.project.assets:entry.context.e.videoFlow.workspace.assets;
      for(const asset of assets.filter(item=>['角色','人物'].includes(item.kind))){
        const version=entry.scope==='comic'?asset.visualVersions?.find(item=>item.id===asset.adoptedVisualId):asset.candidates?.find(item=>item.id===asset.adoptedId);
        const main=version?.images?.portrait||version?.images?.main||version?.image||asset.reference;
        if(!main)continue;
        list.push({key:entry.key+':'+asset.id+':'+(version?.id||'reference'),scope:entry.scope,projectId:entry.project?.id||entry.context?.p.id,episodeId:entry.context?.c.id,assetId:asset.id,versionId:version?.id||'',name:asset.name,origin:entry.label,profile:asset.characterProfile||asset.storyProfile||{},packages:asset.pngtuberRefs||[],images:{main:entry.scope==='comic'&&!/^(data:|https?:|blob:|\/|assets\/|comic-studio\/)/.test(main)?'comic-studio/'+main:main}});
      }
    }
    return list;
  }
  function sourcePanel(value){
    const source=value.source,existing=value.sourceMode==='existing',choices=existing?sources():[];
    return `<div class="pn-row"><h2>选择一个角色</h2>${button('试用示例','sample')}</div><div class="pn-tabs" role="group" aria-label="角色来源">${button('上传角色','source-mode',`data-mode="upload" aria-pressed="${!existing}"`)}${button('已有角色','source-mode',`data-mode="existing" aria-pressed="${existing}"`)}</div>${existing?`<label for="pn-source">OC / 漫画 / 视频人物</label><select id="pn-source"><option value="">选择已保存或已采用的角色</option>${choices.map(item=>`<option value="${E(item.key)}" ${item.key===source?.key?'selected':''}>${E(item.name+' · '+item.origin)}</option>`).join('')}${source&&!choices.some(item=>item.key===source.key)?`<option value="${E(source.key)}" selected>${E(source.name)} · 已保留来源快照</option>`:''}</select>${choices.length?'':'<p class="pn-note">暂时没有可用角色，可以上传角色图或试用示例。</p>'}`:`<label class="pn-upload">＋ 上传角色参考<input id="pn-source-upload" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG / JPG / WebP，3 MB 以内；推荐正面半身图</small></label>`}${source?`<div class="pn-identity"><img src="${E(source.images.portrait||source.images.main)}" alt="${E(source.name)}的角色参考"><div><strong>${E(source.name)}</strong><small>${E(source.origin||'本机上传')}</small><p>${E(source.profile?.intro||'沿用角色外貌、发型、服装与画风。')}</p></div></div>${source.scope==='upload'?`<label for="pn-name">角色名称<input id="pn-name" maxlength="32" value="${E(source.name)}"></label>`:''}`:''}<p class="pn-note">一次准备说话和眨眼所需的四张透明图，试演时无需反复生图。</p>${button(value.versions.length?'重新生成整套':'生成四状态','generate',source?'':'disabled',true)}`;
  }
  function editing(value){
    if(!M.selected(value))return '';
    return `<section class="pn-edit"><h2>和 AI 说说怎么改</h2><div class="pn-tabs" role="group" aria-label="修改范围">${button('整套','scope',`data-scope="all" aria-pressed="${value.scope==='all'}"`)}${button('选中状态','scope',`data-scope="one" aria-pressed="${value.scope==='one'}"`)}</div><p class="pn-note">${value.scope==='one'?'只修改「'+M.labels[value.role]+'」，其余三张沿用当前版本。':'保持角色一致，同时调整整套表现。'}</p><label for="pn-modify">修改要求<textarea id="pn-modify" rows="3" maxlength="1000" placeholder="例如：张嘴幅度小一点，角色造型保持原样。">${E(value.modification)}</textarea></label><div class="pn-suggestions">${button('张嘴幅度小一点','suggest',`data-text="张嘴幅度小一点"`)}${button('闭眼更自然','suggest',`data-text="闭眼更自然"`)}</div>${button('按要求修改','modify','',true)}<small class="pn-note">修改生成新版本，确认后再保留。</small></section>`;
  }
  function linkedPackages(source){
    if(!source||!['comic','video'].includes(source.scope))return '';
    const packages=sources().find(item=>item.key===source.key)?.packages||[];
    return packages.length?`<details class="pn-linked"><summary>已关联演绎资料 · ${packages.length} 套</summary>${packages.map((item,index)=>button('查看第 '+(index+1)+' 套','linked',`data-id="${E(item.id)}"`)).join('')}</details>`:'';
  }
  function pendingPanel(value){
    const pending=value.pending;if(!pending)return '';
    return `<section class="pn-pending" role="status"><div class="pn-row"><strong>要求已整理 · 待接入 AI</strong>${button('取消','cancel')}</div><p>${E(pending.prompt||'生成基础四状态，保持角色造型一致。')}</p><small>本次处理：${pending.states.map(role=>M.labels[role]).join('、')}。${value.versions.length?'下方仍是之前的完成版。':'未把原图当作生成结果。'}</small><details ${Object.keys(pending.images||{}).length?'open':''}><summary>已有状态图片？上传完成本套</summary><p class="pn-note">上传透明 PNG，四张尺寸须一致，最大 1024 × 1024。保持角色位置一致以免切换跳动。</p><div class="pn-pending-files">${pending.states.map(role=>`<label>${M.labels[role]}<input type="file" accept="image/png" data-png-result="${role}"><small>${pending.images?.[role]?'✓ 已上传':'等待图片'}</small></label>`).join('')}</div>${button('采用上传的状态图片','complete',pending.states.every(role=>pending.images?.[role])?'':'disabled')}</details></section>`;
  }
  function result(value){
    const version=M.selected(value),kept=value.versions.find(item=>item.id===value.keptId);
return `<div class="pn-row"><h2>角色试演</h2><small>${version?(version.status==='sample'?'预置四状态示例':'用户上传的状态图'):'等待生成'}</small></div>${pendingPanel(value)}${version?`<div class="pn-stage" data-bg="${E(value.background)}">${M.roles.map(role=>`<img data-png-image="${role}" src="${E(version.images[role].src)}" alt="${M.labels[role]}" ${role!==value.role?'hidden':''}>`).join('')}<span id="pn-stage-label">${M.labels[value.role]}</span></div><div class="pn-preview-controls">${button('▷ 模拟说话','play','id="pn-play" aria-pressed="false"')}<div class="pn-background" role="group" aria-label="试演背景">${[['checker','透明'],['light','浅色'],['dark','深色']].map(([key,label])=>button(label,'background',`data-value="${key}" aria-pressed="${value.background===key}"`)).join('')}</div></div><div class="pn-states" role="group" aria-label="四个基础状态">${M.roles.map(role=>`<button type="button" data-png="state" data-role="${role}" aria-pressed="${value.role===role}"><img src="${E(version.images[role].src)}" alt=""><span>${M.labels[role]}</span></button>`).join('')}</div><p class="pn-note">点击状态预览；模拟说话会自动开口、闭嘴和眨眼。素材包可用于支持 PNGTuber 的直播、录屏工具。</p><div class="pn-row pn-version-head"><strong>整套版本</strong><small>${kept?'已保留第 '+(value.versions.indexOf(kept)+1)+' 套':'尚未保留'}</small></div><div class="pn-versions">${value.versions.map((item,index)=>button(`第 ${index+1} 套${item.id===value.keptId?' · 已保留':''}`,'version',`data-id="${E(item.id)}" aria-pressed="${item.id===version.id}"`)).join('')}</div><div class="pn-actions">${button(version.id===value.keptId?'✓ 已保留此套':'保留这一套','keep','aria-pressed="'+(version.id===value.keptId)+'"',true)}${H.action('保存已保留套','save',kept?'':'disabled')}${kept&&['comic','video'].includes(kept.source.scope)?button('关联回原角色','attach'):''}${H.action('下载已保留套 ZIP','download',kept?'':'disabled')}</div><p class="pn-note">${kept&&kept.id!==version.id?'当前预览还未保留，保存与下载使用之前保留的一套。':'保留一整套后再保存或下载，包含四张透明 PNG 与使用说明。'}${kept?.source?.scope&&['oc','comic','video'].includes(kept.source.scope)?' 成果记录原角色与版本来源，可在「我的工具成果」查看。':''}</p>`:value.pending?'':`<div class="pn-empty"><span>◉</span><h3>让角色陪你说话</h3><p>上传或选择角色，生成四状态。<br>先试演，再保留满意的一套。</p>${button('先体验完整示例','sample')}</div>`}`;
  }
  function render(input){
    stop();const value={...current(),...input};
    return `<main class="ts-page pn-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>PNGTuber 生成器</h1><p>把喜欢的角色，变成直播和录屏里会说话的小伙伴。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><p class="pn-note pn-demo">本机交互 Demo · 预置示例可真实切换、试演和下载；自定义角色 AI 生成待接入。</p><div class="pn-workbench"><section class="ts-panel pn-input">${sourcePanel(value)}${linkedPackages(value.source)}${editing(value)}<p id="ts-message" role="status"></p></section><section class="ts-panel pn-output">${result(value)}</section></div></main>`;
  }
  function stop(){if(timer)clearInterval(timer);timer=null;const play=document.getElementById('pn-play');if(play){play.textContent='▷ 模拟说话';play.setAttribute('aria-pressed','false');}}
  function paint(role){for(const image of document.querySelectorAll('[data-png-image]'))image.hidden=image.dataset.pngImage!==role;const label=document.getElementById('pn-stage-label');if(label)label.textContent=M.labels[role];}
  async function selectSource(source){
    const value=current();if(value.source?.key===source.key)return;
    if((value.versions.length||value.pending)&&!window.confirm('切换角色将清空当前工具草稿；已保存的成果保留。继续吗？')){H.render();return;}
    const {packages,...reference}=source;
    stop();write({source:reference,sourceMode:['oc','comic','video'].includes(source.scope)?'existing':'upload',versions:[],selectedId:'',keptId:'',pending:null,role:'idle',scope:'all',modification:''});
  }
  async function read(file,result=false){
    if(!file||file.size>3*1024*1024||!(result?/^image\/png$/:/^image\/(png|jpeg|webp)$/).test(file.type))throw Error(result?'请上传 3 MB 以内的透明 PNG。':'请上传 3 MB 以内的 PNG、JPG 或 WebP。');
    const url=URL.createObjectURL(file);
    try{
      const image=new Image();image.src=url;await image.decode();
      if(image.naturalWidth*image.naturalHeight>25000000)throw Error('图片太大，请使用 2500 万像素以内的图片。');
      if(result&&(image.naturalWidth>1024||image.naturalHeight>1024))throw Error('状态 PNG 请使用 1024 × 1024 以内的图片。');
      const scale=result?1:Math.min(1,640/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);
      if(result){const data=context.getImageData(0,0,canvas.width,canvas.height).data;let visible=false,clear=false;for(let index=3;index<data.length;index+=4){if(data[index]>0)visible=true;if(data[index]<255)clear=true;}if(!visible||!clear)throw Error('需要包含人物和透明区域的 PNG，不能是空图或实色背景。');}
      return {src:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height};
    }finally{URL.revokeObjectURL(url);}
  }
  function sampleImages(soft=false){return Object.fromEntries(M.roles.map(role=>[role,{src:'assets/pngtuber/'+role+(soft&&role.includes('speaking')?'-soft':'')+'.png',width:512,height:512}]));}
  async function generate(role,prompt){
    const value=current();if(value.versions.length>=6)throw Error('当前最多保留 6 套草稿，请先保存满意的成果再重新选择角色。');
    const job=M.request(value,role,prompt),soft=prompt==='张嘴幅度小一点';
    if(value.source.scope==='sample'&&(!prompt||soft)){
      const all=sampleImages(soft),images=Object.fromEntries(job.states.map(state=>[state,all[state]]));
      await Promise.all(Object.values(images).map(async entry=>{const image=new Image();image.src=entry.src;await image.decode();}));
      write(M.complete(value,job,images,Site.id,'sample'));return;
    }
    write({pending:{...job,images:{}}});
  }
  async function run(action,node){
    const value=current();
    if(action==='sample'){
      const source={key:'sample:hoshina',scope:'sample',name:'星奈',origin:'预置原创角色',images:{main:'assets/pngtuber/idle.png'},profile:{intro:'喜欢分享日常的星奈，准备开始自己的第一场直播。'}};
      await selectSource(source);if(current().source?.key===source.key&&!current().versions.length)await generate('all','');return;
    }
    if(action==='source-mode'){write({sourceMode:node.dataset.mode});return;}
    if(action==='generate'){await generate('all','');return;}
    if(action==='state'){write({role:node.dataset.role});return;}
    if(action==='scope'){write({scope:node.dataset.scope});return;}
    if(action==='background'){write({background:node.dataset.value});return;}
    if(action==='version'){write({selectedId:node.dataset.id});return;}
    if(action==='keep'){write(M.keep(value));return;}
    if(action==='attach'){await H.attach(M.snapshot(value));H.render();Site.toast('四状态已关联为原角色的演绎资料，人物主形象保持原样。');return;}
    if(action==='linked'||action==='download-linked'){
      const item=sources().find(source=>source.key===value.source?.key)?.packages?.find(item=>item.id===node.dataset.id);if(!item)throw Error('关联资料已失效，请重新选择角色。');
      if(action==='download-linked'){const {images,...manifest}=item;await download({title:item.title,notice:item.notice,pngtuber:manifest,images});return;}
      Site.modal(item.title,`<p>${E(item.notice)}</p><div class="pn-linked-grid">${item.images.map(image=>`<figure><img src="${E(image.src)}" alt="${E(M.labels[image.role])}"><figcaption>${E(M.labels[image.role])}</figcaption></figure>`).join('')}</div>`,button('下载这套素材','download-linked',`data-id="${E(item.id)}"`,true));return;
    }
    if(action==='cancel'){write({pending:null});return;}
    if(action==='suggest'){H.write({modification:node.dataset.text});document.getElementById('pn-modify').value=node.dataset.text;return;}
    if(action==='modify'){if(!value.modification.trim())throw Error('请先描述想修改的地方。');await generate(value.scope==='all'?'all':value.role,value.modification.trim());return;}
    if(action==='complete'){if(value.versions.length>=6)throw Error('最多保留 6 套草稿，请先保存当前成果。');write(M.complete(value,value.pending,value.pending.images,Site.id));return;}
    if(action==='play'){
      if(timer){stop();paint(value.role);return;}
      const version=M.selected(value);if(!version)return;
      await Promise.all(M.roles.map(async role=>{const image=new Image();image.src=version.images[role].src;await image.decode();}));
      started=performance.now();node.textContent='Ⅱ 停止试演';node.setAttribute('aria-pressed','true');
      timer=setInterval(()=>{if(!document.getElementById('pn-play')||document.hidden){stop();return;}const elapsed=performance.now()-started;paint(M.stateAt(elapsed,elapsed%2200<1550&&elapsed%390<240));},80);
    }
  }
  async function bytes(src){const response=await fetch(src);if(!response.ok)throw Error('图片读取失败，请刷新后重试。');return new Uint8Array(await response.arrayBuffer());}
  async function download(snapshot){
    if(!snapshot.pngtuber)return false;
    const images=await Promise.all(M.roles.map(async role=>{const image=snapshot.images.find(item=>item.role===role);if(!image)throw Error('缺少状态图片。');return {name:role+'.png',data:await bytes(image.src)};}));
    const preview='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>PNGTuber 离线试演</title><style>body{background:#272334;color:#fff;text-align:center;font:15px sans-serif;margin:24px}main{position:relative;width:min(90vw,420px);aspect-ratio:1;margin:auto}img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}img[hidden]{display:none}button{margin:5px;padding:10px;border:0;border-radius:8px;cursor:pointer}</style><h1>PNGTuber 离线试演</h1><main>'+M.roles.map((role,index)=>'<img data-role="'+role+'" src="'+role+'.png" alt="'+M.labels[role]+'" '+(index?'hidden':'')+'>').join('')+'</main>'+M.roles.map(role=>'<button data-state="'+role+'">'+M.labels[role]+'</button>').join('')+'<p><button id="play">模拟说话</button></p><p>这是状态图切换，不包含配音。四张 PNG 可按目标软件要求分别导入。</p><script>let timer;const roles='+JSON.stringify(M.roles)+';function paint(role){document.querySelectorAll("img").forEach(img=>img.hidden=img.dataset.role!==role)}document.querySelectorAll("[data-state]").forEach(button=>button.onclick=()=>{clearInterval(timer);timer=null;document.getElementById("play").textContent="模拟说话";paint(button.dataset.state)});document.getElementById("play").onclick=function(){if(timer){clearInterval(timer);timer=null;this.textContent="模拟说话";paint("idle");return}this.textContent="停止试演";const start=Date.now();timer=setInterval(()=>{const elapsed=Date.now()-start;paint(roles[(elapsed%3600>=3300?2:0)+(elapsed%2200<1550&&elapsed%390<240?1:0)])},80)};<\/script></html>';
    const readme='PNGTuber 四状态素材包\n\n'+snapshot.title+'\n'+snapshot.notice+'\n\nidle.png：睁眼闭嘴\nspeaking.png：睁眼张嘴\nblink.png：闭眼闭嘴\nblink-speaking.png：闭眼张嘴\n\n双击「试演.html」可离线预览。\n四张透明 PNG 尺寸相同；导入支持 PNGTuber 的软件后，按各软件要求配置说话与眨眼状态。此包不包含通用直播软件绑定文件、配音、Live2D 模型或虚拟摄像头。\n\n原角色与版本来源保存在 manifest.json。\n';
    Site.download(ToolPNGTuberZip.zip([...images,{name:'使用说明.txt',data:readme},{name:'试演.html',data:preview},{name:'manifest.json',data:JSON.stringify({...snapshot.pngtuber,title:snapshot.title,notice:snapshot.notice},null,2)}]),snapshot.title.replace(/[<>:"/\\|?*]/g,'_')+'.zip');return true;
  }
  function init(helpers){
    H=helpers;
    window.addEventListener('hashchange',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-png]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.png,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('input',event=>{if(!['pn-modify','pn-name'].includes(event.target.id))return;event.stopImmediatePropagation();try{if(event.target.id==='pn-modify')H.write({modification:event.target.value});else{const value=current();H.write({source:{...value.source,name:event.target.value.trim()||'我的角色'}});}}catch(error){H.notice(error);}},true);
    document.addEventListener('change',async event=>{
      const node=event.target;if(!['pn-source','pn-source-upload'].includes(node.id)&&!node.dataset.pngResult)return;event.stopImmediatePropagation();if(busy)return;busy=true;
      try{
        if(node.id==='pn-source'){const source=sources().find(item=>item.key===node.value);if(source)await selectSource(source);return;}
        if(!node.files[0])return;
        if(node.id==='pn-source-upload'){const image=await read(node.files[0]);await selectSource({key:Site.id('pngtuber-source'),scope:'upload',name:node.files[0].name.replace(/\.[^.]+$/,'').slice(0,32),origin:'本机角色参考',images:{main:image.src}});}
        else{const value=current();if(!value.pending)throw Error('生成要求已失效，请重试。');const image=await read(node.files[0],true),images={...value.pending.images,[node.dataset.pngResult]:image};write({pending:{...value.pending,images}});}
      }catch(error){H.notice(error);node.value='';}finally{busy=false;}
    },true);
  }
  window.ToolPNGTuber={render,init,download,snapshot:value=>M.snapshot(value),sources,stop};
})();
