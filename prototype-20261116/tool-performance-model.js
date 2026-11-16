(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const presets={expression:['微笑','大笑','惊讶','生气','难过','害羞'],pose:['自然站立','坐姿','回头','奔跑','挥手','低头看手机']};
  function assertSource(value){if(!value.source?.key||!value.source.images?.main)throw Error('请先选择或上传角色参考。');}
  function reference(source,type){return type==='pose'?(source.images.front||source.images.main):(source.images.portrait||source.images.main);}
  function candidate(source,type,request,revision=1){return {src:reference(source,type),request,type,framing:type==='pose'?'全身动作参考':'半身近景参考',status:'reference-only',revision};}
  function generate(value,requests,id){
    assertSource(value);if(!['expression','pose'].includes(value.type))throw Error('请选择表情或姿势。');
    requests=[...new Set(requests.map(x=>String(x).trim()).filter(Boolean))];
    if(!requests.length)throw Error('请选择预设，或描述一个表情 / 动作。');
    if(requests.some(x=>x.length>500))throw Error('请将单项描述控制在500字以内。');
    const next=copy(value);next.items||=[];
    for(const request of requests){const old=next.items.find(x=>x.type===value.type&&x.label===request);if(old)old.candidate=candidate(value.source,value.type,request,old.candidate.revision+1);else next.items.push({id:id('performance'),type:value.type,label:request,sourceKey:value.source.key,candidate:candidate(value.source,value.type,request),kept:null});}
    if(next.items.length>18)throw Error('当前角色最多保留18项草稿，请先保存或移除不需要的项。');
    return next;
  }
  function entry(next,id){const item=next.items?.find(x=>x.id===id);if(!item||item.sourceKey!==next.source?.key)throw Error('这项参考已失效，请基于当前角色重新生成。');return item;}
  function keep(value,id){const next=copy(value),item=entry(next,id);item.kept=copy(item.candidate);return next;}
  function unkeep(value,id){const next=copy(value);entry(next,id).kept=null;return next;}
  function regenerate(value,id,request){assertSource(value);const next=copy(value),item=entry(next,id);request=String(request||'').trim();if(!request||request.length>500)throw Error('请填写500字以内的表情或姿势要求。');item.candidate=candidate(next.source,item.type,request,item.candidate.revision+1);return next;}
  function upload(value,id,src){if(!/^data:image\/(png|jpeg|webp);base64,/.test(src))throw Error('请选择有效图片。');const next=copy(value),item=entry(next,id);item.candidate={...item.candidate,src,status:'uploaded',revision:item.candidate.revision+1};return next;}
  function snapshot(value){
    assertSource(value);const kept=(value.items||[]).filter(x=>x.kept&&x.sourceKey===value.source.key);
    if(!kept.length)throw Error('请先保留至少一项表情或姿势参考。');
    const {images,profile,outfit,...source}=value.source;
    return {toolId:'expressions',title:value.source.name+' · 表情与姿势参考',kind:'image',prototype:true,prompt:kept.map(x=>x.kept.request).join('；'),params:{sourceKey:value.source.key},character:{name:value.source.name,profile:copy(profile||{}),outfit:copy(outfit||null),source},images:kept.map(x=>({role:x.type+':'+x.id,src:x.kept.src})),performance:kept.map(x=>({id:x.id,label:x.kept.request,...copy(x.kept)})),inputs:{},notice:'本机交互演示。标为「待生图」的项沿用原角色参考，未产生真实表情或姿势变化；上传图片按用户提供的版本保留。',createdAt:new Date().toISOString()};
  }
  const api={presets,generate,keep,unkeep,regenerate,upload,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolPerformanceModel=api;
})(typeof window==='undefined'?globalThis:window);
