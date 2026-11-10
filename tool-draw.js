(()=>{
  'use strict';
  const E=Site.esc,copy=value=>JSON.parse(JSON.stringify(value));
  const styles=['AI 推荐','赛璐璐动画','清新手绘','漫画插画'],ratios=['AI 推荐','1:1','3:4','4:3','9:16','16:9'];
  let H,busy=false,drag=null;
  const id=()=>Site.id('drawing');
  const defaults={drawPrompt:'',drawStyle:'AI 推荐',drawRatio:'AI 推荐',drawRefs:[],drawVersions:[],drawSelectedId:'',drawBase:null,drawRegion:null,drawPlan:null,drawDemo:false};
  const value=()=>({...copy(defaults),...H.value()});
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-draw="${action}" ${extra}>${label}</button>`;
  const selected=data=>data.drawVersions.find(item=>item.id===data.drawSelectedId);
  const status=item=>item.status==='sample'?'预置示例':item.status==='legacy'?'旧工具示例':'用户上传成图';
  function write(patch){H.write(patch);H.render();}
  function request(data){
    if(!data.drawPrompt.trim())throw Error('请描述想要的画面，或这次想修改的地方。');
    return {id:id(),prompt:data.drawPrompt.trim(),style:data.drawStyle,ratio:data.drawRatio,refs:copy(data.drawRefs),base:copy(data.drawBase),region:data.drawBase?copy(data.drawRegion):null,at:new Date().toISOString()};
  }
  function migrate(previous,key){
    const refs=Object.values(previous.inputs||{}).filter(item=>item.src).slice(0,4).map(item=>({id:id(),name:item.name||'原工具参考',src:item.src}));
    const versions=(previous.preview||[]).filter(item=>/^data:image\/(png|jpeg|webp);base64,/.test(item.src)).map(item=>({id:id(),image:item.src,status:'legacy',parentId:'',request:{prompt:previous.generatedPrompt||previous.prompt||'旧工具示例',style:previous.generatedOption||previous.option||'AI 推荐',ratio:'AI 推荐',refs:copy(refs),base:null,region:null,at:previous.generatedAt||new Date().toISOString()}}));
    return {...copy(defaults),drawPrompt:previous.prompt||'',drawStyle:styles.includes(previous.option)?previous.option:'AI 推荐',drawRefs:refs,drawVersions:versions,drawSelectedId:versions[0]?.id||'',migratedFrom:key};
  }
  function referenceInputs(data){return `<section class="td-references"><div class="td-row"><h3>添加图片 <small>可选</small></h3><span>${data.drawRefs.length}/4</span></div><p>可参考人物、画风或构图，也可以直接描述要怎样修改图片。</p><div class="td-ref-list">${data.drawRefs.map(ref=>`<article><img src="${E(ref.src)}" alt="${E(ref.name)}"><div><strong>${E(ref.name)}</strong>${button('用作修改原图','base-reference',`data-id="${E(ref.id)}"`)}${button('移除','remove-reference',`data-id="${E(ref.id)}" aria-label="移除参考图 ${E(ref.name)}"`)}</div></article>`).join('')}</div><label class="td-upload">＋ 添加参考图片<input id="td-reference" type="file" accept="image/png,image/jpeg,image/webp" multiple ${data.drawRefs.length>=4?'disabled':''}><small>PNG / JPG / WebP，每张 1.5 MB 以内</small></label></section>`;}
  function baseInput(data){const base=data.drawBase;if(!base)return '';const region=data.drawRegion;return `<section class="td-base"><div class="td-row"><h3>本次修改原图</h3>${button('取消','clear-base')}</div><div class="td-base-summary"><img src="${E(base.src)}" alt="本次修改原图"><p>${E(base.name)}<small>原图保留，新结果单独成版。</small></p></div><details class="td-region-details"><summary>选择修改区域（可选）</summary><p>在图片上拖出范围；不选区域时，由描述决定修改内容。</p><div class="td-region" data-draw-region><img src="${E(base.src)}" alt="拖动选择修改区域" draggable="false"><span ${region?'':'hidden'} style="${region?`left:${region.x*100}%;top:${region.y*100}%;width:${region.w*100}%;height:${region.h*100}%;`:''}"></span></div><div class="td-row"><small data-draw-region-status>${region?'已选择局部修改范围':'未指定区域'}</small>${button('清除选区','clear-region')}</div></details></section>`;}
  function results(data){const item=selected(data),pending=data.drawPlan;return `<section class="ts-panel td-results"><div class="td-row"><h2>图片与版本</h2><small>${data.drawVersions.length} 个版本</small></div>${pending?`<div class="td-pending" role="status"><strong>生成要求已整理 · 待 AI 出图</strong><p>${E(pending.prompt)}</p><small>本地演示未调用模型。可上传已有成图，体验版本、保存和带入作品。</small><label class="td-result-upload">上传已有成图<input id="td-result-upload" type="file" accept="image/png,image/jpeg,image/webp"></label></div>`:''}${item?`<div class="td-row td-version-heading"><strong>第 ${data.drawVersions.indexOf(item)+1} 版</strong><span>${status(item)}</span></div><div class="td-preview">${button(`<img src="${E(item.image)}" alt="选中的绘图版本">`,'zoom','aria-label="放大选中图片"')}</div><p class="td-caption">${E(item.request.prompt)}</p><p class="td-meta">${E(item.request.style)} · ${E(item.request.ratio)}${item.parentId?' · 基于已有版本修改':''}</p>${item.status!=='uploaded'?'<p class="td-example-note">此图为预置案例，用于体验操作；未按当前描述、画风或比例实际重绘。</p>':''}<div class="td-result-actions">${button('继续修改','continue','',true)}${H.action('下载图片','download')}${H.action('保存选中版本','save')}${H.action('带入作品','bring')}</div><p class="td-subnote">保存和下载当前选中的版本；带入作品时新增候选，由你决定是否采用。</p><div class="td-versions" aria-label="绘图版本">${data.drawVersions.map((version,index)=>button(`<img src="${E(version.image)}" alt="第 ${index+1} 版缩略图"><span>第 ${index+1} 版</span><small>${status(version)}</small>`,'select',`data-id="${E(version.id)}" aria-label="查看第 ${index+1} 版" aria-pressed="${version.id===item.id}"`)).join('')}</div>`:pending?'':`<div class="td-empty"><span>✧</span><h3>从一句描述，开始画出你的想法</h3><p>也可以添加图片，参考人物或画风，或直接修改原图。</p>${button('试用绘图示例','sample')}</div>`}</section>`;}
  function render(input){const data={...copy(defaults),...input};return `<main class="ts-page td-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>二次元绘图</h1><p>描述画面，添加参考，或沿着一张图片继续修改。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><p class="td-demo-note">本地交互 Demo · 未调用 AI。可试用预置案例，或上传图片整理自己的生成要求。</p><div class="td-workbench"><section class="ts-panel td-input"><div class="td-row"><h2>想画什么，或改些什么？</h2>${button('试用示例','sample')}</div>${baseInput(data)}<label class="td-prompt-label"><span>${data.drawBase?'描述这次想修改的地方':'描述你想要的画面'}</span><textarea id="td-prompt" rows="5" maxlength="2000" placeholder="例如：雨夜便利店门口的少女，暖色灯光映在积水里。也可以添加图片，说说想改哪里。">${E(data.drawPrompt)}</textarea></label>${referenceInputs(data)}<details class="td-options"><summary>画风与比例 <small>${E(data.drawStyle)} · ${E(data.drawRatio)}</small></summary><div><label>画风<select id="td-style">${styles.map(style=>`<option ${style===data.drawStyle?'selected':''}>${style}</option>`).join('')}</select></label><label>画面比例<select id="td-ratio">${ratios.map(ratio=>`<option ${ratio===data.drawRatio?'selected':''}>${ratio}</option>`).join('')}</select></label></div></details>${data.drawDemo?'<p class="td-example-note">正在体验预置案例；生成和继续修改用于演示版本流转。</p>':''}${button(data.drawDemo?'生成示例图片':'生成图片','generate','id="td-generate"',true)}<p id="ts-message" role="status"></p></section>${results(data)}</div></main>`;}
  async function read(file){
    if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1500000)throw Error('请选择 1.5 MB 以内的 PNG、JPG 或 WebP 图片。');
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败。'));reader.readAsDataURL(file);});
    const image=new Image();image.src=src;await image.decode();const scale=Math.min(1,800/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    return {id:id(),name:file.name,src:canvas.toDataURL('image/webp',.86)};
  }
  async function sampleImage(index){const image=new Image();image.src=Art.url(index);await image.decode();const canvas=document.createElement('canvas'),scale=Math.min(1,800/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.84);}
  async function run(action,node){const data=value();
    if(action==='sample'){write({drawPrompt:'雨夜街头的少女，红色围巾，细腻的日漫插画，背景有柔和灯光。',drawStyle:'漫画插画',drawRatio:'AI 推荐',drawDemo:true,drawBase:null,drawRefs:[],drawRegion:null,drawPlan:null});return;}
    if(action==='generate'){
      const next=request(data);
      if(data.drawDemo){const item={id:next.id,image:await sampleImage(data.drawBase?8:1),status:'sample',parentId:data.drawBase?.versionId||'',request:next};write({drawVersions:[...data.drawVersions,item],drawSelectedId:item.id,drawPlan:null});}
      else write({drawPlan:next});return;
    }
    if(action==='select'){if(data.drawVersions.some(item=>item.id===node.dataset.id))write({drawSelectedId:node.dataset.id});return;}
    if(action==='continue'){
      const item=selected(data);if(!item)return;write({drawBase:{src:item.image,name:'第 '+(data.drawVersions.indexOf(item)+1)+' 版',versionId:item.id},drawPrompt:'',drawRegion:null,drawPlan:null,drawDemo:item.status==='sample' && data.drawRefs.length===0});document.getElementById('td-prompt')?.focus();return;
    }
    if(action==='base-reference'){const ref=data.drawRefs.find(item=>item.id===node.dataset.id);if(ref)write({drawBase:{src:ref.src,name:ref.name,referenceId:ref.id},drawRegion:null,drawPlan:null,drawDemo:false});return;}
    if(action==='clear-base'){write({drawBase:null,drawRegion:null,drawPlan:null});return;}
    if(action==='clear-region'){write({drawRegion:null,drawPlan:null});return;}
    if(action==='remove-reference'){const refId=node.dataset.id;write({drawRefs:data.drawRefs.filter(ref=>ref.id!==refId),...(data.drawBase?.referenceId===refId?{drawBase:null,drawRegion:null}:{}),drawPlan:null});return;}
    if(action==='zoom'){const item=selected(data);if(item)Site.modal('图片预览',`<img class="td-zoom" src="${E(item.image)}" alt="选中的绘图版本">`);return;}
  }
  function snapshot(input){
    const data={...copy(defaults),...input},item=selected(data);if(!item)throw Error('请先选择一个图片版本。');const req=item.request;
    return {toolId:'anime-draw',title:'二次元绘图 · 第 '+(data.drawVersions.indexOf(item)+1)+' 版',kind:'image',prototype:true,prompt:req.prompt,params:{style:req.style,ratio:req.ratio,status:item.status},inputs:{...(req.base?{main:{name:req.base.name}}:{}),...Object.fromEntries(req.refs.map((ref,index)=>['reference-'+(index+1),{name:ref.name}]))},images:[{role:'main',src:item.image}],edits:{base:copy(req.base),references:copy(req.refs),region:copy(req.region)},drawing:{versionId:item.id,parentId:item.parentId},notice:item.status==='uploaded'?'用户上传的已有成图，未调用 AI 生成或修改。':'预置绘图案例，未调用 AI，未按输入要求重绘。',createdAt:req.at};
  }
  function point(event,node){const box=node.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))};}
  const rectangle=(a,b)=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)});
  function paint(node,region){const span=node.querySelector('span');span.hidden=false;Object.assign(span.style,{left:region.x*100+'%',top:region.y*100+'%',width:region.w*100+'%',height:region.h*100+'%'});}
  function init(helpers){H=helpers;
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-draw]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.draw,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('input',event=>{if(event.target.id!=='td-prompt')return;event.stopImmediatePropagation();try{H.write({drawPrompt:event.target.value});document.getElementById('ts-message').textContent='要求已保存，点击生成后创建新版本。';}catch(error){H.notice(error);}},true);
    document.addEventListener('change',async event=>{const node=event.target;if(!['td-reference','td-result-upload','td-style','td-ratio'].includes(node.id))return;event.stopImmediatePropagation();if(busy)return;busy=true;try{
      const data=value();if(node.id==='td-style'||node.id==='td-ratio'){write({[node.id==='td-style'?'drawStyle':'drawRatio']:node.value});return;}
      const files=Array.from(node.files||[]);if(!files.length)return;
      if(node.id==='td-reference'){if(data.drawRefs.length+files.length>4)throw Error('最多添加 4 张参考图片。');const refs=await Promise.all(files.map(read));write({drawRefs:[...data.drawRefs,...refs],drawDemo:false,drawPlan:null});}
      else{if(!data.drawPlan)throw Error('请先生成本次要求。');const image=await read(files[0]),item={id:data.drawPlan.id,image:image.src,status:'uploaded',parentId:data.drawPlan.base?.versionId||'',request:copy(data.drawPlan)};write({drawVersions:[...data.drawVersions,item],drawSelectedId:item.id,drawPlan:null});}
    }catch(error){H.notice(error);node.value='';}finally{busy=false;}},true);
    document.addEventListener('pointerdown',event=>{const node=event.target.closest('[data-draw-region]');if(!node||event.button!==0||busy)return;event.preventDefault();node.setPointerCapture(event.pointerId);drag={node,start:point(event,node),id:event.pointerId};});
    document.addEventListener('pointermove',event=>{if(drag&&event.pointerId===drag.id)paint(drag.node,rectangle(drag.start,point(event,drag.node)));});
    document.addEventListener('pointerup',event=>{if(!drag||event.pointerId!==drag.id)return;const current=drag;drag=null;const region=rectangle(current.start,point(event,current.node));if(region.w<.03||region.h<.03){const previous=value().drawRegion;if(previous)paint(current.node,previous);else current.node.querySelector('span').hidden=true;return;}try{H.write({drawRegion:region,drawPlan:null});paint(current.node,region);document.querySelector('[data-draw-region-status]').textContent='已选择局部修改范围';}catch(error){H.notice(error);H.render();}});
    document.addEventListener('pointercancel',()=>{if(!drag)return;const current=drag;drag=null;const previous=value().drawRegion;if(previous)paint(current.node,previous);else current.node.querySelector('span').hidden=true;});
  }
  window.ToolDraw={render,snapshot,migrate,init};
})();
