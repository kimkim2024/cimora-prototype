(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const roles=['idle','speaking','blink','blink-speaking'];
  const labels={idle:'睁眼 · 闭嘴',speaking:'睁眼 · 张嘴',blink:'闭眼 · 闭嘴','blink-speaking':'闭眼 · 张嘴'};
  const selected=value=>(value.versions||[]).find(version=>version.id===value.selectedId)||null;
  function request(value,role,prompt){
    if(!value.source?.key||!value.source.images?.main)throw Error('请先上传或选择一个角色。');
    if(role!=='all'&&!roles.includes(role))throw Error('请选择有效的状态。');
    prompt=String(prompt||'').trim();if(prompt.length>1000)throw Error('修改要求请控制在 1000 字以内。');
    const base=selected(value);
    if(role!=='all'&&!base)throw Error('请先生成一整套，再修改单个状态。');
    const {packages,...source}=value.source;
    return {source:copy(source),parentId:base?.id||'',states:role==='all'?[...roles]:[role],prompt,createdAt:new Date().toISOString(),constraints:['人物身份、服饰和画风一致','同尺寸、同构图、同位置','透明 PNG，只修改眼睛和嘴巴']};
  }
  function complete(value,job,images,id,status='uploaded'){
    if(job.source?.key!==value.source?.key)throw Error('角色来源已改变，请重新生成。');
    const base=(value.versions||[]).find(version=>version.id===job.parentId);
    if(job.states.length!==4&&!base)throw Error('原版本已不存在，请重新生成四状态。');
    const merged={...(base?copy(base.images):{}),...copy(images)};
    if(roles.some(role=>!merged[role]?.src))throw Error('缺少四状态图片，请补全。');
    if(job.states.some(role=>!images[role]?.src))throw Error('缺少本次要求的状态图片。');
    const size=merged.idle;
    if(roles.some(role=>!Number.isInteger(merged[role].width)||merged[role].width!==size.width||merged[role].height!==size.height))throw Error('四张图片尺寸必须一致，请上传相同尺寸的 PNG。');
    const version={id:id('pngtuber-version'),source:copy(job.source),images:merged,prompt:job.prompt,parentId:job.parentId,status,createdAt:new Date().toISOString()};
    return {...copy(value),versions:[...(value.versions||[]),version],selectedId:version.id,pending:null,modification:''};
  }
  function keep(value){if(!selected(value))throw Error('请先完成四状态图片。');return {...copy(value),keptId:value.selectedId};}
  function snapshot(value){
    const version=(value.versions||[]).find(item=>item.id===value.keptId);
    if(!version)throw Error('请先保留一整套，再保存或下载。');
    const {images,...source}=version.source;
    return {toolId:'pngtuber',title:(source.name||'我的角色')+' · PNGTuber 四状态',kind:'image',prototype:true,prompt:version.prompt,character:{name:source.name,source},images:roles.map(role=>({role,src:version.images[role].src})),pngtuber:{versionId:version.id,width:version.images.idle.width,height:version.images.idle.height,states:roles.map(role=>({role,label:labels[role],file:role+'.png'})),status:version.status,source:copy(source)},inputs:{},params:{},notice:version.status==='sample'?'预置四状态示例，可切换与下载；自定义 AI 生成尚未接入。':'用户提供的四状态 PNG；自定义 AI 生成尚未接入。',createdAt:version.createdAt};
  }
  function stateAt(elapsed,talking){const blink=elapsed%3600>=3300;return blink?(talking?'blink-speaking':'blink'):(talking?'speaking':'idle');}
  function attach(assets,snapshot,target,id){
    const source=snapshot.character?.source;
    if(!['comic','video'].includes(source?.scope)||source.scope!==target.scope||source.projectId!==target.projectId||(source.scope==='video'&&source.episodeId!==target.episodeId))throw Error('来源不一致，只能关联回原角色。');
    const asset=assets.find(item=>item.id===source.assetId);
    if(!asset||!['角色','人物'].includes(asset.kind))throw Error('原角色已不存在，请先保存个人成果。');
    if(!snapshot.pngtuber||roles.some(role=>!snapshot.images?.some(image=>image.role===role)))throw Error('缺少完整四状态素材。');
    asset.pngtuberRefs??=[];
    if(asset.pngtuberRefs.some(item=>item.versionId===snapshot.pngtuber.versionId))return;
    asset.pngtuberRefs.push({id:id('pngtuber-ref'),...copy(snapshot.pngtuber),images:copy(snapshot.images),title:snapshot.title,createdAt:snapshot.createdAt,notice:snapshot.notice});
  }
  const api={roles,labels,selected,request,complete,keep,snapshot,stateAt,attach};
  if(typeof module!=='undefined')module.exports=api;else root.ToolPNGTuberModel=api;
})(typeof window==='undefined'?globalThis:window);
