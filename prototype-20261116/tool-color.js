(()=>{
  'use strict';
  const E=Site.esc,copy=value=>JSON.parse(JSON.stringify(value));
  const modes=['清理线稿','AI 上色'],styles=['AI 推荐','赛璐璐','柔和厚涂'];
  let H,busy=false;
  const modeName=mode=>mode==='只清理线稿'||mode==='清理线稿'?'清理线稿':'AI 上色';
  function normalize(input){const value={colorStyle:'AI 推荐',colorPrompt:'',...input};value.colorMode=modeName(value.colorMode);if(value.colorResult){const result=value.colorResult;value.colorResult={...result,mode:modeName(result.mode),spec:result.spec.replace(/^(只清理线稿|直接上色|清理并上色)(?=\r?\n|$)/,modeName(result.mode))};}return value;}
  const current=()=>normalize(H.value());
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-color="${action}" ${extra}>${label}</button>`;
  const usable=value=>!!value.colorResult?.image&&!value.colorDirty;
  const note='本机交互演示：示例使用同构图的预置线稿与彩色图；上传图片不会调用 AI 处理。';
  function settings(value){return `<section class="tc-settings"><h2>想怎样处理？</h2><div class="tc-modes" role="group" aria-label="处理方式">${modes.map(mode=>button(mode,'mode',`data-mode="${E(mode)}" aria-pressed="${value.colorMode===mode}"`)).join('')}</div><p class="ts-note">${value.colorMode==='清理线稿'?'整理杂线与脏点、提高线条清晰度，保留黑白线稿。':'输出彩色成图，AI 自动判断是否需要清理线条；保持人物与构图，有参考图时沿用角色配色。'}</p>${value.colorMode!=='清理线稿'?`<label>上色风格<select id="tc-style">${styles.map(style=>`<option ${value.colorStyle===style?'selected':''}>${E(style)}</option>`).join('')}</select></label><details class="tc-reference" ${value.colorReference?'open':''}><summary>添加配色参考（可选）</summary><p>上传角色彩图，供上色时参考头发、衣服和配饰的颜色。</p><label class="tc-file">选择配色参考<input type="file" id="tc-reference" accept="image/png,image/jpeg,image/webp"></label>${value.colorReference?`<div class="tc-ref-preview"><img src="${E(value.colorReference.src)}" alt="配色参考"><span>${E(value.colorReference.name)}</span>${button('移除','remove-reference')}</div>`:''}</details>`:''}<label>补充要求（可选）<textarea id="tc-prompt" rows="3" maxlength="500" placeholder="例如：头发银白色，外套深蓝色；保留原来的线条。">${E(value.colorPrompt)}</textarea></label>${button(value.colorSource?.kind==='sample'?'生成示例效果':'生成处理方案','generate',value.colorSource?'':'disabled',true)}<p id="ts-message" role="status">${value.colorDirty?'设置已修改，右侧保留上次结果，请重新生成。':''}</p></section>`;}
  function output(value){const result=value.colorResult;
    if(!result)return `<div class="tc-empty"><span>◒</span><h3>让线稿多一种可能</h3><p>上传草稿或线稿，或使用示例查看处理前后的效果。</p></div>`;
    return `<div class="tc-result-meta"><strong>${E(result.mode)}</strong><span>${result.status==='sample'?'预置示例':result.status==='uploaded'?'已上传成图':'待 AI 出图'}</span></div>${value.colorDirty?'<p class="tc-stale" role="status">输入已修改 · 下方是上一次的结果</p>':''}<div class="tc-compare"><figure>${button(`<img src="${E(result.original)}" alt="本次处理的原图">`,'zoom','data-view="original" aria-label="放大原图"')}<figcaption>原图</figcaption></figure><figure>${result.image?button(`<img src="${E(result.image)}" alt="${E(result.mode)}${result.status==='sample'?'示例效果':'上传成图'}">`,'zoom','data-view="result" aria-label="放大处理结果"'):'<div class="tc-waiting"><span>✧</span><strong>处理方案已整理</strong><p>接入 AI 后在这里显示成图；当前保留原图与要求。</p></div>'}<figcaption>${result.image?'处理结果':'等待 AI 出图'}</figcaption></figure></div><p class="tc-result-note">${result.status==='sample'?'预置示例用于体验同一幅画的前后对比，不代表已按修改要求重新生图。':result.status==='uploaded'?'这里显示你上传的已有成图，可与原图对比、下载或保存。':'此演示不处理上传图片，也不会以另一张示例替代你的作品。'}</p><div class="tc-plan"><small>本次处理要求</small><p>${E(result.spec)}</p></div><div class="tc-result-actions">${button('修改要求','adjust')}${button('重新生成','generate',value.colorSource?'':'disabled')}<label class="tc-result-upload">上传已有成图<input type="file" id="tc-result-upload" accept="image/png,image/jpeg,image/webp" ${value.colorDirty?'disabled':''}></label></div><footer class="tc-footer"><div class="ts-actions">${H.action('下载结果','download',usable(value)?'':'disabled',true)}${H.action('保存本次成果','save',usable(value)?'':'disabled')}${H.action('带入作品','bring',usable(value)?'':'disabled')}</div><p>只新增图片候选，已有采用版本与故事内容保留。</p></footer>`;
  }
  function render(input){const value=normalize(input),source=value.colorSource;
    return `<main class="ts-page tc-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>线稿清理与上色</h1><p>整理草稿与线条，为喜欢的角色和画面添上颜色。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><p class="ts-note">${note}</p><div class="tc-workbench"><section class="ts-panel tc-input"><section class="tc-source"><h2>上传草稿或线稿</h2><label class="tc-file tc-main-file">＋ 选择图片<input type="file" id="tc-main" accept="image/png,image/jpeg,image/webp"><small>PNG / JPG / WebP，1.5 MB 以内</small></label>${button('试用示例线稿','sample')}${source?`<div class="tc-current"><img src="${E(source.src)}" alt="当前待处理的草稿或线稿"><div><strong>${E(source.name)}</strong><small>${source.kind==='sample'?'预置示例':'本机上传'} · 保持原构图</small></div></div>`:''}</section>${settings(value)}</section><section class="ts-panel tc-output"><h2>原图与处理结果</h2>${output(value)}</section></div></main>`;
  }
  async function image(src){const img=new Image();img.src=src;await img.decode();return img;}
  async function compact(src){const img=await image(src),scale=Math.min(1,800/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/webp',.85);}
  async function read(file){if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1500000)throw Error('请选择1.5 MB以内的 PNG、JPG 或 WebP 图片。');const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败，请重试。'));reader.readAsDataURL(file);});return {name:file.name,src:await compact(src)};}
  async function sample(){
    const img=await image('comic-studio/examples/romance-two/assets/luchuan-portrait.jpg'),c=document.createElement('canvas');
    const scale=Math.min(1,640/Math.max(img.width,img.height));c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,c.width,c.height);const colored=c.toDataURL('image/webp',.86),pixels=ctx.getImageData(0,0,c.width,c.height),gray=new Float32Array(c.width*c.height),out=ctx.createImageData(c.width,c.height);
    for(let i=0;i<gray.length;i++)gray[i]=pixels.data[i*4]*.299+pixels.data[i*4+1]*.587+pixels.data[i*4+2]*.114;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      const i=y*c.width+x;let tone=255;
      if(x>0&&y>0&&x<c.width-1&&y<c.height-1){const a=gray[i-c.width-1],b=gray[i-c.width],d=gray[i-1],e=gray[i+1],f=gray[i+c.width-1],g=gray[i+c.width],h=gray[i+c.width+1],r=gray[i-c.width+1],gx=-a-2*d-f+r+2*e+h,gy=-a-2*b-r+f+2*g+h;tone=Math.max(20,255-Math.max(0,Math.hypot(gx,gy)-30)*1.8);}
      out.data[i*4]=out.data[i*4+1]=out.data[i*4+2]=tone;out.data[i*4+3]=255;
    }
    ctx.putImageData(out,0,0);const clean=c.toDataURL('image/webp',.88);
    ctx.strokeStyle='#bdc2ca';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(c.width*.08,c.height*.28);ctx.lineTo(c.width*.18,c.height*.19);ctx.moveTo(c.width*.83,c.height*.66);ctx.lineTo(c.width*.94,c.height*.59);ctx.stroke();
    for(let i=0;i<16;i++){ctx.fillStyle='#bfc4ca';ctx.fillRect((i*37+11)%(c.width*.16), (i*53+23)%c.height,1.6,1.6);}
    return {name:'陆川 · 示例线稿',kind:'sample',src:c.toDataURL('image/webp',.88),clean,colored};
  }
  function spec(value){if(!modes.includes(value.colorMode))throw Error('请选择处理方式。');return [value.colorMode,value.colorMode==='清理线稿'?'整理杂线和脏点，保持黑白线稿。':'根据原图判断是否需要清理杂线和脏点，再完成上色。上色风格：'+value.colorStyle+'。',value.colorMode!=='清理线稿'&&value.colorReference?'角色配色参考：'+value.colorReference.name+'。':'','保持人物身份、动作、构图与原有线条特征。',value.colorPrompt.trim()].filter(Boolean).join('\n');}
  function write(patch){H.write(patch);H.render();}
  async function run(action,node){const value=current();
    if(action==='sample'){write({colorSource:await sample(),colorResult:null,colorDirty:false});return;}
    if(action==='mode'){if(modes.includes(node.dataset.mode)&&node.dataset.mode!==value.colorMode)write({colorMode:node.dataset.mode,colorDirty:!!value.colorResult});return;}
    if(action==='remove-reference'){write({colorReference:null,colorDirty:!!value.colorResult});return;}
    if(action==='generate'){
      if(!value.colorSource)throw Error('请先上传草稿或使用示例线稿。');
      const source=value.colorSource,isSample=source.kind==='sample';
      write({colorDirty:false,colorResult:{original:source.src,image:isSample?(value.colorMode==='清理线稿'?source.clean:source.colored):null,status:isSample?'sample':'pending',mode:value.colorMode,style:value.colorStyle,spec:spec(value),reference:value.colorMode!=='清理线稿'?copy(value.colorReference||null):null,at:new Date().toISOString()}});return;
    }
    if(action==='adjust'){document.getElementById('tc-prompt')?.focus();document.getElementById('tc-prompt')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
    if(action==='zoom'){const src=node.dataset.view==='original'?value.colorResult?.original:value.colorResult?.image;if(src)Site.modal(node.dataset.view==='original'?'原图':'处理结果',`<img class="tc-zoom" src="${E(src)}" alt="放大查看图片">`);return;}
  }
  function snapshot(input){const value=normalize(input),result=value.colorResult;if(!result?.image||value.colorDirty)throw Error(value.colorDirty?'输入已修改，请重新生成后保存。':'请先生成示例，或上传已有成图。');return {toolId:'colorize',title:'线稿清理与上色 · '+result.mode,kind:'image',prototype:true,prompt:result.spec,params:{mode:result.mode,style:result.style,status:result.status},inputs:{main:{name:value.colorSource.name},...(result.reference?{colorReference:{name:result.reference.name}}:{})},images:[{role:'main',src:result.image}],edits:{original:result.original,colorReference:result.reference},notice:result.status==='sample'?'本机预置同构图示例，未调用 AI，也未按补充要求重新绘图。':'用户上传的已有成图，未调用 AI 处理。',createdAt:result.at};}
  function init(helpers){H=helpers;
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-color]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.color,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('input',event=>{if(event.target.id!=='tc-prompt')return;event.stopImmediatePropagation();try{H.write({colorPrompt:event.target.value,colorDirty:!!current().colorResult});document.getElementById('ts-message').textContent='要求已保存，修改后请重新生成。';document.querySelectorAll('.tc-footer button').forEach(node=>node.disabled=true);const resultUpload=document.getElementById('tc-result-upload');if(resultUpload)resultUpload.disabled=true;}catch(error){H.notice(error);}},true);
    document.addEventListener('change',async event=>{const node=event.target;if(!['tc-style','tc-main','tc-reference','tc-result-upload'].includes(node.id))return;event.stopImmediatePropagation();if(busy)return;busy=true;try{
      const value=current();if(node.id==='tc-style'){write({colorStyle:node.value,colorDirty:!!value.colorResult});return;}if(!node.files?.[0])return;const file=await read(node.files[0]);
      if(node.id==='tc-main')write({colorSource:{...file,kind:'upload'},colorResult:null,colorDirty:false});
      if(node.id==='tc-reference')write({colorReference:file,colorDirty:!!value.colorResult});
      if(node.id==='tc-result-upload'){if(value.colorDirty||!value.colorResult)throw Error('请先按当前设置生成处理方案。');write({colorResult:{...value.colorResult,image:file.src,status:'uploaded'}});}
    }catch(error){H.notice(error);node.value='';}finally{busy=false;}},true);
  }
  window.ToolColor={render,snapshot,init};
})();
