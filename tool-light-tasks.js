(()=>{
  'use strict';
  const E=text=>String(text??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clamp=n=>Math.max(0,Math.min(1,n));
  const rectangle=(a,b)=>({x:Math.min(clamp(a.x),clamp(b.x)),y:Math.min(clamp(a.y),clamp(b.y)),w:Math.abs(clamp(a.x)-clamp(b.x)),h:Math.abs(clamp(a.y)-clamp(b.y))});
  const sampleTranslation=language=>language==='日语'?'ずっと、伝えたかった。':language==='简体中文'?'有些话，一直想告诉你。':'I have wanted to tell you for so long.';
  const translation=value=>value.targetText??(value.inputs?.main?.src?'':sampleTranslation(value.option));
  const isTask=tool=>['motion','lettering'].includes(tool.kind);
  const region=(tool,value)=>value.region||(tool.kind==='lettering'?{x:.12,y:.08,w:.76,h:.25}:{x:0,y:0,w:1,h:1});
  const source=(tool,value)=>value.inputs?.main?.src||Art.url(tool.art);
  function inputs(tool,value){
    const bounds=region(tool,value),uploaded=!!value.inputs?.main?.src;
    return `<div class="tl-task"><p class="ts-note">${tool.kind==='motion'?'① 选择画面 → ② 描述动作 → ③ 预览与下载':'① 上传漫画 → ② 核对文字 → ③ 翻译排字与下载'}</p><p>${tool.kind==='motion'?'可在下图拖出要动起来的区域；默认使用整图。':'在下图框选气泡区域，译文会覆盖排入这个区域。'}</p><div class="tl-region" data-tl-region><img src="${E(source(tool,value))}" alt="${uploaded?'上传原图':'示例画面'}，拖动选择区域" draggable="false">${tool.kind==='lettering'&&!uploaded?'<b class="tl-sample-text">有些话，一直想告诉你。</b>':''}<span style="left:${bounds.x*100}%;top:${bounds.y*100}%;width:${bounds.w*100}%;height:${bounds.h*100}%"></span></div><button type="button" class="cm-button ghost" data-ts="region-reset">${tool.kind==='motion'?'使用整图':'重置排字区域'}</button><small data-tl-region-status role="status">${value.region?'已选择区域':'当前使用默认区域'}</small>${tool.kind==='lettering'?`<label>核对原文<textarea id="tl-original" rows="2" placeholder="输入选区中的原文；本地演示不自动识别图片文字">${E(value.sourceText??(uploaded?'':'有些话，一直想告诉你。'))}</textarea></label><label>译文（可修改）<textarea id="tl-target" rows="3" placeholder="粘贴或输入译文，再生成排字预览">${E(translation(value))}</textarea></label><p class="ts-note">示例提供三种语言对照；上传图片需自行填写原文和译文。框选区域使用纯白覆盖，不进行 AI 擦字或背景修复。</p>`:'<p class="ts-note">当前演示镜头移动与缩放；人物动作、动画视频生成待接入模型。下载的是可离线打开的运镜 HTML。</p>'}</div>`;
  }
  async function image(src){const result=new Image();result.src=src;await result.decode();return result;}
  function lines(ctx,text,width){const result=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of paragraph){if(line&&ctx.measureText(line+char).width>width){result.push(line);line=char;}else line+=char;}result.push(line);}return result;}
  async function generate(tool,value){
    const original=await image(source(tool,value)),bounds=region(tool,value),canvas=document.createElement('canvas');
    if(tool.kind==='motion'){
      canvas.width=Math.max(1,Math.round(original.naturalWidth*bounds.w));canvas.height=Math.max(1,Math.round(original.naturalHeight*bounds.h));
      canvas.getContext('2d').drawImage(original,bounds.x*original.naturalWidth,bounds.y*original.naturalHeight,bounds.w*original.naturalWidth,bounds.h*original.naturalHeight,0,0,canvas.width,canvas.height);
      return {preview:[{role:'选定画面',src:canvas.toDataURL('image/webp',.88)}],taskRegion:{...bounds}};
    }
    const text=translation(value).trim();if(!text)throw Error('请填写选区译文，再生成排字预览。');
    canvas.width=original.naturalWidth;canvas.height=original.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(original,0,0);if(!value.inputs?.main?.src){ctx.fillStyle='white';ctx.fillRect(canvas.width*.12,canvas.height*.08,canvas.width*.76,canvas.height*.25);ctx.fillStyle='#20202b';ctx.font=`${Math.min(28,canvas.width*.035)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('有些话，一直想告诉你。',canvas.width*.5,canvas.height*.205,canvas.width*.7);}const originalPreview=canvas.toDataURL('image/webp',.88);
    const x=bounds.x*canvas.width,y=bounds.y*canvas.height,w=bounds.w*canvas.width,h=bounds.h*canvas.height,pad=Math.max(3,Math.min(w,h)*.08);
    let size=Math.min(32,Math.max(10,canvas.width*.035)),rows;
    do{ctx.font=`${size}px sans-serif`;rows=lines(ctx,text,w-pad*2);if(rows.length*size*1.4<=h-pad*2)break;size--;}while(size>=8);
    if(rows.length*size*1.4>h-pad*2||rows.some(row=>ctx.measureText(row).width>w-pad*2))throw Error('译文放不进选区，请扩大区域或精简译文。');
    ctx.fillStyle='white';ctx.fillRect(x,y,w,h);ctx.fillStyle='#20202b';ctx.textAlign='center';ctx.textBaseline='middle';
    rows.forEach((line,index)=>ctx.fillText(line,x+w/2,y+h/2+(index-(rows.length-1)/2)*size*1.4));
    return {preview:[{role:'翻译排字',src:canvas.toDataURL('image/png')}],originalPreview,taskRegion:{...bounds},generatedTranslation:text,generatedOriginal:value.sourceText??'有些话，一直想告诉你。'};
  }
  function output(tool,value){
    const src=value.preview?.[0]?.src;if(!src)return '<p>请重新生成预览以使用当前版本。</p>';
    if(tool.kind==='motion')return `<div class="tl-motion is-playing" id="tool-motion-frame" data-preset="${E(value.generatedOption)}"><img src="${E(src)}" alt="选定画面的运镜预览"></div><div class="ts-actions"><button type="button" class="cm-button ghost" data-act="tool-motion">Ⅱ 暂停</button><span>10 秒循环 · ${E(value.generatedOption)}</span></div><p>${E(value.generatedPrompt||'镜头缓慢移动，保持主体清晰。')}</p><p class="ts-note">本机 CSS 运镜预览，非生成的人物动画或 MP4。下载后可离线播放。</p>`;
    return `<div class="tl-compare"><figure><img src="${E(value.originalPreview)}" alt="同一张原图"><figcaption>原图</figcaption></figure><figure><img src="${E(src)}" alt="译文排字结果"><figcaption>${E(value.generatedOption)} · 排字预览</figcaption></figure></div><p>${E(value.generatedTranslation)}</p><p class="ts-note">可在左侧修改译文、重选气泡，再生成预览。下载 PNG 保留当前排字。</p>`;
  }
  window.ToolLightTasks={isTask,inputs,generate,output,rectangle,sampleTranslation,translation,region};
})();
