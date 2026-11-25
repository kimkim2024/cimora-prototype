(()=>{
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  function intent(prompt){
    const text=String(prompt||'');
    if(/让.{0,16}(角色|OC|oc)|换成.{0,12}(角色|OC|oc)|替换.{0,8}(人物|角色)|我的\s*(OC|oc)|指定角色/.test(text))return 'character';
    if(/街景|街道|实景|风景|场景|天台|校园/.test(text))return 'scene';
    return 'style';
  }
  function operations(value){
    if(Array.isArray(value.operations))return [...new Set(value.operations)];
    if(value.intentOverride)return [value.intentOverride];
    const text=String(value.prompt||''),items=[];
    if(/画风|配色|水彩|日漫风|动画风|线条|风格/.test(text))items.push('style');
    if(/让.{0,16}(角色|OC|oc)|换成.{0,12}(角色|OC|oc)|替换.{0,8}(人物|角色)|我的\s*(OC|oc)|指定角色|换角色/.test(text))items.push('character');
    if(/街景|街道|实景|风景|场景|背景|天台|校园/.test(text)&&!/背景(?:和场景)?(?:保持原样|不变)/.test(text))items.push('scene');
    return items.length?items:['style'];
  }
  function summary(request){
    const ops=operations(request),parts=[];
    if(ops.includes('style'))parts.push('调整画风与配色');
    if(ops.includes('character')){for(const item of request.replacements||[])parts.push(`${item.target||'待指定原片人物'} → ${item.replacement?.name||'待选角色参考'}`);if(!request.replacements?.length)parts.push('替换指定角色');parts.push('其余人物保持原样');}
    else parts.push('原角色外观与服装保持原样');
    parts.push(ops.includes('scene')?'更换场景'+(request.scene?.description?'：'+request.scene.description:'（按描述与参考）'):'场景保持原样');
    parts.push('沿用原动作与镜头');
    return parts.join('；');
  }
  function request(value,id){
    if(!value.source?.id||!(value.source.url||value.source.blobKey))throw Error('请先上传视频或选择已有片段。');
    const start=Number(value.start),end=Number(value.end),duration=Number(value.source.duration);
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration+.01)throw Error('请选择有效片段，终点应晚于起点且不超过原片。');
    if(end-start>10.01)throw Error('单次请选择 10 秒以内的片段，建议先试 3–5 秒。');
    if(!String(value.prompt||'').trim())throw Error('请描述想要的转绘效果。');
    const ops=operations(value);
    if(!ops.length)throw Error('请选择至少一项修改内容。');
    if(ops.some(op=>!['style','character','scene'].includes(op)))throw Error('请选择有效转绘方向。');
    const purpose=ops.includes('character')?'character':ops.includes('scene')?'scene':'style';
    let replacements=[];
    if(ops.includes('character')){
      replacements=Array.isArray(value.replacements)?copy(value.replacements):value.character?.src?[{id:'legacy-character',target:'原片角色（旧版要求）',replacement:copy(value.character)}]:[];
      if(!replacements.length)throw Error('请添加要替换的角色及参考。');
      const targets=new Set(),ids=new Set();
      for(const item of replacements){
        item.target=String(item.target||'').trim();
        if(!item.target)throw Error('请描述要替换的原片人物，例如戴眼镜的黑发男生。');
        if(targets.has(item.target)||!item.id||ids.has(item.id))throw Error('原片人物或替换条目重复，请合并后再生成。');
        targets.add(item.target);ids.add(item.id);
        if(!item.replacement?.src)throw Error('请为「'+item.target+'」上传或选择替换角色参考。');
        if(item.anchor&&(item.anchor.sourceId!==value.source.id||!Number.isFinite(item.anchor.time)||item.anchor.time<0||item.anchor.time>duration+(value.source.offset||0)+.01))throw Error('人物标记与当前视频不一致，请重新标记。');
        if(item.anchor&&(item.anchor.time<start+(value.source.offset||0)||item.anchor.time>end+(value.source.offset||0)))throw Error('人物标记不在选中的片段内，请播放选中片段后重新标记。');
        delete item.collapsed;
      }
    }
    const source=copy(value.source);delete source.objectURL;
    return {id,source,start,end,duration:Math.round((end-start)*100)/100,prompt:value.prompt.trim(),operations:ops,intent:purpose,replacements,character:replacements[0]?.replacement||null,scene:ops.includes('scene')?copy(value.scene||{description:'',reference:null}):null,style:ops.includes('style')?copy(value.style||null):null,preserve:{characters:!ops.includes('character'),otherCharacters:true,scene:!ops.includes('scene'),style:!ops.includes('style'),actions:true,camera:true},keepAudio:value.keepAudio!==false,parentId:value.baseId||'',at:new Date().toISOString()};
  }
  function snapshot(version){
    if(!version?.video||!version.poster)throw Error('请先选择一个完成的转绘版本。');
    return {toolId:'video-redraw',title:'视频转绘',kind:'image',prototype:true,prompt:version.request.prompt,images:[{role:'poster',src:version.poster}],params:{mode:version.request.intent},redraw:{versionId:version.id,video:version.video,duration:version.request.duration,request:copy(version.request),kind:version.kind},notice:'预置本地调色演示短片，非 AI 转绘；用于视频对比、版本及镜头候选流程演示。',createdAt:version.request.at};
  }
  window.ToolRedrawModel={intent,operations,summary,request,snapshot};
})();
