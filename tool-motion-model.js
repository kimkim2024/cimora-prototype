(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  function request(value,id){
    const mode=value.motionMode==='keyframes'?'keyframes':'single',inputs=value.inputs||{};
    if(mode==='single'&&!inputs.main?.src)throw Error('请先选择一张图片。');
    if(mode==='keyframes'&&!inputs.first?.src)throw Error('请先选择首帧图片。');
    if(mode==='keyframes'&&!inputs.last?.src)throw Error('请选择尾帧，只有一张图片可切换到单图动起来。');
    if(!value.prompt?.trim())throw Error('请描述想要的动作或这次修改的地方。');
    return {id,mode,prompt:value.prompt.trim(),frames:copy(mode==='keyframes'?{first:inputs.first,last:inputs.last}:{main:inputs.main}),region:mode==='single'?copy(value.region||{x:0,y:0,w:1,h:1}):null,preset:value.option||'缓慢推进',parentId:value.motionBaseId||'',at:new Date().toISOString()};
  }
  function snapshot(version,images){
    if(!version)throw Error('请先生成并选择一个结果。');
    const req=version.request;
    return {toolId:'image-motion',title:'图片动起来 · '+(req.mode==='keyframes'?'首尾帧':'单图'),kind:'image',prototype:true,prompt:req.prompt,params:{option:req.preset,mode:req.mode},inputs:Object.fromEntries(Object.entries(req.frames).map(([key,frame])=>[key,{name:frame.name,imageRole:key}])),images:copy(images),motion:{type:req.mode==='keyframes'?'keyframes':'css-panzoom',duration:version.duration||10,preset:req.preset,video:version.video||null,versionId:version.id,parentId:req.parentId,prototype:true},edits:{region:copy(req.region),request:copy(req)},notice:version.kind==='sample-video'?'预置运镜短片，仅供体验播放；未按用户要求生成角色动画。':'本地 CSS 运镜方案，未调用 AI 生成角色动作或视频。',createdAt:req.at};
  }
  const api={request,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolMotionModel=api;
})(typeof window==='undefined'?globalThis:window);
