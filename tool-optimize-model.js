(function(root){
  'use strict';
  function settings(mode,values={}){
    if(mode==='upscale'){const scale=Number(values.scale??2);if(![2,4].includes(scale))throw Error('请选择 2 倍或 4 倍。');return{mode,scale};}
    if(mode!=='compress')throw Error('请选择高清放大或压缩图片。');
    const strategy=values.strategy||'quality';if(!['quality','target'].includes(strategy))throw Error('请选择压缩方式。');
    if(strategy==='quality')return{mode,strategy};
    const targetMB=Number(values.targetMB??2);if(!Number.isFinite(targetMB)||targetMB<.05||targetMB>20)throw Error('目标大小需在 0.05 到 20 MB 之间。');
    return{mode,strategy,targetMB,targetBytes:Math.floor(targetMB*1024*1024)};
  }
  function dimensions(source,setting){
    const width=Math.round(source.width*(setting.mode==='upscale'?setting.scale:1)),height=Math.round(source.height*(setting.mode==='upscale'?setting.scale:1));
    if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width*height>16000000||Math.max(width,height)>8192)throw Error('输出超过本地预览像素上限，请选择较低倍数或较小图片。');
    return{width,height};
  }
  function fresh(source,result,setting){return!!source&&!!result&&source.id===result.sourceId&&JSON.stringify(result.settings)===JSON.stringify(setting);}
  function snapshot(source,result,setting){
    if(!fresh(source,result,setting))throw Error('图片或设置已变化，请重新处理后保存。');
    const action=setting.mode==='upscale'?'放大预览':'压缩图片';
    return{toolId:'batch-assets',title:action+' · '+source.name,kind:'image',prototype:setting.mode==='upscale',prompt:source.name+' · '+(setting.mode==='upscale'?setting.scale+' 倍本地放大':setting.strategy==='target'?'压至 '+setting.targetMB+' MB 以内':'画质优先压缩'),images:[{role:'main',src:result.src}],inputs:{main:{name:source.name,width:source.width,height:source.height,size:source.bytes,origin:source.origin||'本机图片',source:source.reference||null}},params:setting,optimization:{width:result.width,height:result.height,bytes:result.bytes,mime:result.mime,transparent:source.transparent,sourceId:source.id},notice:setting.mode==='upscale'?'浏览器插值放大预览；未调用 AI 超分辨率或细节修复模型。':'浏览器本地压缩结果；未调用 AI，不覆盖原图。',createdAt:result.createdAt};
  }
  const api={settings,dimensions,fresh,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolOptimizeModel=api;
})(typeof window==='undefined'?globalThis:window);
