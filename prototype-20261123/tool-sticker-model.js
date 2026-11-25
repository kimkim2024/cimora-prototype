(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const presets=[{id:'hello',label:'打招呼',caption:'嗨！',prompt:'开心地挥手打招呼',motion:'wave'},{id:'yes',label:'收到',caption:'收到',prompt:'认真地点头，表示收到',motion:'nod'},{id:'love',label:'撒娇',caption:'拜托啦',prompt:'歪着头撒娇，轻轻摇晃',motion:'sway'},{id:'speechless',label:'无语',caption:'……',prompt:'无语地左右摇头',motion:'shake'},{id:'crazy',label:'发疯',caption:'啊啊啊',prompt:'抓狂地抖动，表达发疯的心情',motion:'shake'},{id:'work',label:'打工',caption:'好的呢',prompt:'疲惫但礼貌地点头，打工人的微笑',motion:'nod'}];
  function defaults(value={}){return{sourceMode:'upload',source:null,characterDescription:'',prompt:'',format:'gif',items:[],selectedId:'',pending:null,chat:[],...copy(value)};}
  const selected=value=>value.items.find(item=>item.id===value.selectedId)||value.items[0]||null;
  function intent(prompt){const preset=presets.find(item=>prompt===item.prompt)||(/收到|点头|好的|好哒/.test(prompt)?presets[1]:/撒娇|拜托/.test(prompt)?presets[2]:/无语/.test(prompt)?presets[3]:/发疯|抓狂|抖动/.test(prompt)?presets[4]:/打工|加班/.test(prompt)?presets[5]:presets[0]);return preset;}
  function finish(value,source,specifications,id){
    if(value.source?.key!==source?.key)throw Error('角色来源已变化，请重新生成。');
    if(value.items.length+specifications.length>12)throw Error('这一套最多保留 12 张，可先保存或移除不需要的卡片。');
    const items=specifications.map(spec=>({id:id('sticker'),sourceKey:source.key,request:spec.prompt,motion:spec.motion,caption:spec.caption,captionEnabled:true,captionStyle:'outline',format:value.format,speed:1,revision:1,pending:'',origin:source.scope==='sample'?'预置角色动作示例':'原角色图片动作预览',createdAt:new Date().toISOString()}));
    return{...copy(value),items:[...copy(value.items),...items],selectedId:items[0]?.id||value.selectedId,pending:null};
  }
  function generate(raw,id){const value=defaults(raw),prompt=value.prompt.trim();if(!prompt)throw Error('请描述想做的表情包。');if(prompt.length>800)throw Error('想法请控制在 800 字以内。');
    if(value.sourceMode==='describe'){
      if(!value.characterDescription.trim())throw Error('请先描述你想创建的角色。');
      return{...value,pending:{characterDescription:value.characterDescription.trim(),prompt,format:value.format,status:'pending-model'}};
    }
    if(!value.source?.images?.main)throw Error('请上传或选择角色，也可以试用示例。');
    if(!presets.some(item=>item.prompt===prompt)&&(!/收到|点头|摇头|摇晃|挥手|打招呼|撒娇|拜托|无语|发疯|抓狂|打工|加班/.test(prompt)||/哭|眼泪|眼睛|嘴|笑|表情|服装|衣服|背景|头发/.test(prompt)))return{...value,pending:{characterDescription:value.source.name,prompt,format:value.format,status:'pending-model'}};
    const recommendation=intent(prompt);return finish(value,value.source,[{...recommendation,prompt}],id);
  }
  function caption(raw,itemId,patch){const value=defaults(raw),item=value.items.find(part=>part.id===itemId);if(!item)throw Error('请选择一张表情包。');
    const text=String(patch.caption??item.caption);if(Array.from(text).length>30)throw Error('配字最多 30 个字，请精简后再试。');
    const style=patch.captionStyle??item.captionStyle;if(!['outline','bubble'].includes(style))throw Error('请选择有效的配字样式。');
    Object.assign(item,{caption:text,captionEnabled:patch.captionEnabled??item.captionEnabled,captionStyle:style});return value;
  }
  function revise(raw,itemId,text){let value=defaults(raw),item=value.items.find(part=>part.id===itemId);if(!item)throw Error('请先选择一张表情包。');text=String(text).trim();if(!text)throw Error('请填写修改要求。');if(text.length>500)throw Error('修改要求请控制在 500 字以内。');
    const captionMatch=text.match(/(?:配字|文字|字)[改换成：:\s]*(?:「([^」]*)」|“([^”]*)”|"([^"]*)"|([^，。；\n]+))/),local=/慢|快|配字|文字|去掉字|不加字|摇头|点头|摇晃/.test(text),needsModel=/哭|眼泪|眼睛|嘴|笑|表情|服装|衣服|背景|头发|变成|换成.*角色/.test(text);
    if(!local||needsModel){item.pending=text;value.chat.push({role:'user',text},{role:'assistant',text:'这次需要 AI 改画，要求已保留；当前画面保持原版本。'});return value;}
    if(captionMatch){value=caption(value,itemId,{caption:captionMatch.slice(1).find(part=>part!==undefined)});item=value.items.find(part=>part.id===itemId);}
    if(/去掉字|不加字/.test(text))item.captionEnabled=false;
    if(/慢/.test(text))item.speed=.7;if(/快/.test(text))item.speed=1.4;
    if(/摇头/.test(text))item.motion='shake';else if(/点头/.test(text))item.motion='nod';else if(/摇晃/.test(text))item.motion='sway';
    item.revision++;item.pending='';value.chat.push({role:'user',text},{role:'assistant',text:'已更新本地动作或配字，人物原图保持不变。'});return value;
  }
  function expand(raw,id){const value=defaults(raw);if(!value.source?.images?.main||!value.items.length)throw Error('先完成一张，再扩展同角色的一套。');const existing=new Set(value.items.map(item=>item.request)),specifications=presets.filter(item=>!existing.has(item.prompt)).slice(0,Math.max(0,6-value.items.length));if(!specifications.length)throw Error('已有一套表情包，可修改单张或继续描述新想法。');return finish(value,value.source,specifications,id);}
  function snapshot(raw,outputs){const value=defaults(raw);if(!outputs?.length)throw Error('请先生成一张可保存的表情包。');const items=outputs.map(output=>value.items.find(item=>item.id===output.id));if(items.some(item=>!item||item.sourceKey!==value.source?.key))throw Error('角色或结果已变化，请重新选择。');
    const {images,...source}=value.source;
    return{toolId:'sticker-maker',title:(source.name||'角色')+' · '+(items.length===1?items[0].caption||'表情包':'表情包合集'),kind:'image',prototype:true,prompt:items.map(item=>item.request).join('；'),images:outputs.map((output,index)=>({role:index?'sticker-'+index:'main',src:output.src})),stickers:{source,items:copy(items),outputs:copy(outputs),width:320,height:320},notice:'本地合成表情包预览；保留角色原图，动作与配字真实合成。AI 表情改画与文字生角色尚未接入。',createdAt:new Date().toISOString()};
  }
  const api={defaults,presets,selected,generate,finish,caption,revise,expand,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolStickerModel=api;
})(typeof window==='undefined'?globalThis:window);
