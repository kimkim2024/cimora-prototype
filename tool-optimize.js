(()=>{
  'use strict';
  const M=ToolOptimizeModel,E=Site.esc;let H,busy=false,epoch=0,session={},storageNote='';
  const defaults={optMode:'upscale',optScale:2,optStrategy:'quality',optTargetMB:2,optSources:[],optSelected:'',optResults:{}};
  const value=()=>({...defaults,...H.value(),...session});
  const button=(text,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-opt="${action}" ${extra}>${text}</button>`;
  const source=data=>data.optSources.find(item=>item.id===data.optSelected)||data.optSources[0];
  const settings=data=>M.settings(data.optMode,{scale:data.optScale,strategy:data.optStrategy,targetMB:data.optTargetMB});
  const size=bytes=>bytes>=1048576?(bytes/1048576).toFixed(2)+' MB':Math.max(.1,bytes/1024).toFixed(1)+' KB';
  const dataBytes=src=>src.startsWith('data:')?Math.floor((src.split(',')[1]||'').replace(/=+$/,'').length*3/4):0;
  const image=async src=>{const item=new Image();item.crossOrigin='anonymous';item.src=src;await item.decode();return item;};
  function write(patch,render=true){
    const next={...value(),...patch};
    try{H.write(next);session={};storageNote='';}catch(error){session=next;storageNote='图片较大，当前仅保留在本次页面会话；仍可处理和下载，保存成功后才会出现在成果中。';H.notice(error);}
    if(render)H.render();
  }
  async function load(src,name,meta={}){
    const item=await image(src),width=item.naturalWidth,height=item.naturalHeight;
    if(!width||!height||width*height>12000000||Math.max(width,height)>8192)throw Error('请选择 1200 万像素以内、最长边不超过 8192 的图片。');
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(item,0,0);
    const pixels=context.getImageData(0,0,width,height).data;let transparent=false;for(let index=3;index<pixels.length;index+=4)if(pixels[index]<255){transparent=true;break;}
    if(!/^data:image\/(png|jpeg|webp);base64,/.test(src))src=canvas.toDataURL('image/png');
    canvas.width=canvas.height=1;
    return{id:Site.id('opt-source'),name,src,width,height,transparent,mime:src.match(/^data:([^;]+)/)[1],bytes:meta.bytes||dataBytes(src),origin:meta.origin||'本机上传',reference:meta.reference||null};
  }
  async function read(file){
    if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('请选择 12 MB 以内的 PNG、JPG 或 WebP 图片。');
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败。'));reader.readAsDataURL(file);});
    return load(src,file.name,{bytes:file.size});
  }
  function sources(){
    const result=[];for(const item of H.store.list())if(item.kind==='image'&&item.images?.[0]?.src)result.push({key:'saved:'+item.id,name:item.title+' · v'+item.version,src:item.images.find(part=>part.role==='main')?.src||item.images[0].src,origin:'个人工具成果',reference:{snapshotId:item.id}});
    let entries=[];try{entries=H.targets();}catch{}
    for(const entry of entries){const assets=entry.scope==='comic'?entry.project.assets:entry.context.e.videoFlow.workspace.assets;for(const asset of assets||[]){const adopted=entry.scope==='comic'?asset.visualVersions?.find(item=>item.id===asset.adoptedVisualId):asset.candidates?.find(item=>item.id===asset.adoptedId),src=adopted?.images?.main||adopted?.image||(entry.scope==='comic'?asset.reference:'');if(src)result.push({key:entry.key+':'+asset.id,name:entry.label+' / '+asset.name,src,origin:entry.label,reference:{scope:entry.scope,projectId:entry.scope==='comic'?entry.project.id:entry.context.p.id,assetId:asset.id}});}}
    return result.slice(0,80);
  }
  function input(data){const item=source(data),choices=sources();return `<section class="ts-panel opt-input"><div class="opt-row"><h2>选择图片</h2>${button('试用示例','sample')}</div><label class="opt-upload">＋ 上传图片<input id="opt-upload" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG / JPG / WebP，12 MB 以内；保留原图。</small></label><details><summary>使用已有资产</summary><label>选择图片<select id="opt-source"><option value="">选择已保存图片或作品资产</option>${choices.map(choice=>`<option value="${E(choice.key)}">${E(choice.name)}</option>`).join('')}</select></label></details><details><summary>批量处理（可选）</summary><label class="opt-upload">一次选择最多 6 张<input id="opt-batch" type="file" multiple accept="image/png,image/jpeg,image/webp"></label><p>共用当前设置，结果逐张对比、保存与下载。</p></details>${data.optSources.length>1?`<div class="opt-source-list" aria-label="待处理图片">${data.optSources.map(part=>button(E(part.name),'select',`data-id="${E(part.id)}" aria-pressed="${part.id===item?.id}"`)).join('')}</div>`:''}<div class="opt-settings"><h2>${data.optMode==='upscale'?'高清放大':'压缩图片'}</h2>${data.optMode==='upscale'?`<p>推荐 2 倍，兼顾尺寸和处理开销。</p><div class="opt-options" role="group" aria-label="放大倍数">${[2,4].map(scale=>button(scale+' 倍','scale',`data-value="${scale}" aria-pressed="${Number(data.optScale)===scale}"`)).join('')}</div><p class="opt-note">当前为本地插值放大预览，AI 超分辨率与细节修复待接入。</p>`:`<label>压缩方式<select id="opt-strategy"><option value="quality" ${data.optStrategy==='quality'?'selected':''}>画质优先（推荐）</option><option value="target" ${data.optStrategy==='target'?'selected':''}>压到指定大小以内</option></select></label>${data.optStrategy==='target'?`<label>最大文件大小（MB）<input id="opt-target" type="number" min="0.05" max="20" step="0.1" value="${data.optTargetMB}"></label><p>优先降低编码质量，必要时缩小尺寸，结果会标明实际大小。</p>`:'<p>优先保持原尺寸；若编码后更大，直接保留更小的原文件。</p>'}<p class="opt-note">本地真实压缩，优先输出 WebP${item?.transparent?'，保留透明通道':''}。</p>`}</div>${item?`<div class="opt-meta"><strong>${E(item.name)}</strong><span>${item.width} × ${item.height} · ${size(item.bytes)}${item.transparent?' · 透明底':''}</span></div>`:''}${button(data.optMode==='upscale'?'生成放大预览':'开始压缩','process','id="opt-process" '+(!item?'disabled':''),true)}${data.optSources.length>1?button('处理全部 '+data.optSources.length+' 张','process-all'):''}</section>`;}
  function figure(item,title){return `<figure><figcaption><strong>${title}</strong><span>${item.width} × ${item.height} · ${size(item.bytes)}</span></figcaption><div class="opt-picture"><img src="${E(item.src)}" alt="${title}" draggable="false"></div></figure>`;}
  function output(data){const item=source(data),result=item&&data.optResults[item.id];let fresh=false;try{fresh=M.fresh(item,result,settings(data));}catch{}
    return `<section class="ts-panel opt-output"><div class="opt-row"><h2>前后对比</h2><small>${result?fresh?'当前处理结果':'上次结果 · 设置已变化':'等待处理'}</small></div>${item?`<div class="opt-comparison">${figure(item,'原图')}${result?figure(result,result.settings.mode==='upscale'?'放大预览':'压缩结果'):'<div class="opt-placeholder"><span>⇄</span><p>选择处理方式，结果会在这里显示。</p></div>'}</div>${result?`<p class="opt-summary">${E(result.message)}</p><div class="opt-actions">${button('放大查看细节','zoom')}${button('下载结果','download','',true)}${button('保存新版本','save',fresh?'':'disabled')}${button('带入作品','bring',fresh?'':'disabled')}</div>${!fresh?'<p class="opt-note">设置已变化，请重新处理。下载仍为上次结果。</p>':''}`:''}`:`<div class="opt-empty"><span>▧</span><h3>让图片更适合你的用途</h3><p>高清放大用于壁纸、封面和角色参考；压缩用于上传、分享和减少文件占用。</p>${button('试用图片示例','sample')}</div>`}</section>`;}
  function render(raw){const data={...value(),...raw,...session};return `<main class="ts-page opt-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>图片高清与压缩</h1><p>放大图片或减小文件，处理后直接下载，也能带回作品。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><nav class="opt-modes" aria-label="图片处理方式">${button('高清放大','mode','data-value="upscale" aria-pressed="'+(data.optMode==='upscale')+'"')}${button('压缩图片','mode','data-value="compress" aria-pressed="'+(data.optMode==='compress')+'"')}</nav><p class="opt-demo">本机 Demo · 压缩真实执行；高清仅演示插值放大，AI 细节修复待接入。</p><div class="opt-workbench">${input(data)}${output(data)}</div><p id="opt-storage-note" role="status">${E(storageNote)}</p><p id="ts-message" role="status"></p></main>`;}
  const encode=(canvas,type,quality)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片编码失败。')),type,quality));
  const blobData=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('结果读取失败。'));reader.readAsDataURL(blob);});
  async function process(item,setting){
    const original=await image(item.src),dimensions=M.dimensions(item,setting),canvas=document.createElement('canvas');let width=dimensions.width,height=dimensions.height;
    function draw(){canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(original,0,0,width,height);}
    try{
      draw();let blob,src,message;
      if(setting.mode==='upscale'){blob=await encode(canvas,'image/png');message=setting.scale+' 倍本地放大预览，尺寸增大；尚未进行 AI 细节修复。';}
      else if(setting.strategy==='quality'){
        blob=await encode(canvas,'image/webp',.84);
        if(blob.size>=item.bytes){src=item.src;message='原文件已经较小，保留原图，避免文件反而变大。';}else message='保持原尺寸，文件减少 '+Math.round((1-blob.size/item.bytes)*100)+'%。';
      }else if(item.bytes<=setting.targetBytes){src=item.src;message='原图已小于目标大小，直接保留原文件。';}
      else{
        for(let attempt=0;attempt<9;attempt++){
          draw();let low=.2,high=.94,best=null;
          const smallest=await encode(canvas,'image/webp',low);
          if(smallest.size<=setting.targetBytes){best=smallest;for(let step=0;step<7;step++){const quality=(low+high)/2,candidate=await encode(canvas,'image/webp',quality);if(candidate.size<=setting.targetBytes){best=candidate;low=quality;}else high=quality;}blob=best;break;}
          width=Math.max(1,Math.round(width*.75));height=Math.max(1,Math.round(height*.75));await new Promise(resolve=>setTimeout(resolve,0));
        }
        if(!blob)throw Error('未能压到指定大小，请提高目标大小。');
        message='已压至 '+size(blob.size)+'，满足 '+setting.targetMB+' MB 以内'+(width!==item.width?'；尺寸缩小为 '+width+' × '+height:'，保留原尺寸')+'。';
      }
      if(!src)src=await blobData(blob);
      return{sourceId:item.id,settings:setting,src,width:src===item.src?item.width:width,height:src===item.src?item.height:height,bytes:src===item.src?item.bytes:blob.size,mime:src===item.src?item.mime:blob.type,message,createdAt:new Date().toISOString()};
    }finally{canvas.width=canvas.height=1;}
  }
  function snapshot(raw){const data={...defaults,...raw,...session},item=source(data);return M.snapshot(item,item&&data.optResults[item.id],settings(data));}
  async function download(result,name){
    const blob=await(await fetch(result.src)).blob(),extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[blob.type]||'png',link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name.replace(/\.[^.]+$/,'')+'-'+(result.settings.mode==='upscale'?'放大预览':'压缩')+'.'+extension;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);Site.toast('下载已发起。');
  }
  async function downloadSnapshot(item){if(!item.optimization)return false;await download({...item.optimization,src:item.images[0].src,settings:item.params},item.inputs.main.name);return true;}
  async function run(action,node){const data=value(),item=source(data);
    if(action==='mode'){write({optMode:node.dataset.value});return;}
    if(action==='scale'){write({optScale:Number(node.dataset.value)});return;}
    if(action==='select'){write({optSelected:node.dataset.id});return;}
    if(action==='sample'){const revision=epoch,hash=location.hash,sample=await load('assets/cimora-story-1.webp','雨夜角色示例.webp',{origin:'预置示例'});if(revision!==epoch||location.hash!==hash)return;write({optSources:[sample],optSelected:sample.id,optResults:{}});return;}
    if(action==='process'||action==='process-all'){
      if(!item)throw Error('请先选择图片。');const setting=settings(data),revision=epoch,hash=location.hash,queue=action==='process-all'?data.optSources:[item],results={...data.optResults},failures=[];
      for(const [index,part]of queue.entries()){if(revision!==epoch||location.hash!==hash)return;document.getElementById('ts-message').textContent='正在处理 '+(index+1)+' / '+queue.length+'…';try{results[part.id]=await process(part,setting);}catch(error){failures.push(part.name+'：'+error.message);}await new Promise(resolve=>setTimeout(resolve,0));}
      if(revision!==epoch||location.hash!==hash)return;write({optResults:results});document.getElementById('ts-message').textContent=failures.length?failures.join('；'):'处理完成，可对比细节后下载或保存。';return;
    }
    const result=item&&data.optResults[item.id];if(!result)throw Error('请先处理图片。');
    if(action==='zoom'){Site.modal('原图与结果 · 按实际像素查看',`<p>两个窗口均按图片原始像素显示，可滚动查看同一处细节。</p><div class="opt-detail">${[item,result].map((part,index)=>`<section><h3>${index?'处理结果':'原图'} · ${part.width} × ${part.height}</h3><div><img src="${E(part.src)}" alt="${index?'处理结果细节':'原图细节'}"></div></section>`).join('')}</div>`);return;}
    if(action==='download'){await download(result,item.name);return;}
    const output=snapshot(data);
    if(action==='save'){H.store.save('batch-assets',output);Site.toast('已保存新的图片成果。');return;}
    if(action==='bring'){H.bring(output);return;}
  }
  function setBusy(value){busy=value;document.querySelector('.opt-page')?.setAttribute('aria-busy',String(value));for(const panel of document.querySelectorAll('.opt-workbench,.opt-modes'))panel.inert=value;}
  function init(helpers){H=helpers;window.addEventListener('hashchange',()=>{epoch++;});
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-opt]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;setBusy(true);node.disabled=true;const revision=epoch;try{await run(node.dataset.opt,node);}catch(error){if(revision===epoch)H.notice(error);}finally{setBusy(false);if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('change',async event=>{const node=event.target;if(!['opt-upload','opt-batch','opt-source','opt-strategy','opt-target'].includes(node.id))return;event.stopImmediatePropagation();if(busy)return;setBusy(true);const revision=epoch;try{
      if(node.id==='opt-strategy'){write({optStrategy:node.value});return;}
      if(node.id==='opt-target'){write({optTargetMB:Number(node.value)},false);document.querySelector('.opt-output').outerHTML=output(value());return;}
      let selected=[];
      if(node.id==='opt-source'){const found=sources().find(part=>part.key===node.value);if(!found)return;selected=[await load(found.src,found.name,found)];}
      else{const files=Array.from(node.files||[]);if(!files.length)return;if(files.length>6)throw Error('一次最多选择 6 张图片。');for(const file of files)selected.push(await read(file));}
      if(revision!==epoch)return;write({optSources:selected,optSelected:selected[0].id,optResults:{}});
    }catch(error){if(revision===epoch)H.notice(error);}finally{setBusy(false);}},true);
  }
  window.ToolOptimize={render,init,snapshot,downloadSnapshot,process,sources};
})();
