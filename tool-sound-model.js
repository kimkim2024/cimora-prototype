(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value)),clean=value=>String(value||'').trim().slice(0,2000);
  const examples={rain:'雨夜的街道，屋檐滴水，远处有一点风声。安静、真实，不要音乐和说话声。',steps:'空旷走廊里，皮鞋慢慢靠近，最后停在门口，带一点回声。',magic:'少女拔剑，随后释放一道魔法，清脆的金属声衔接能量爆发，不要配乐。',notify:'手机收到一条消息，短促清脆，适合雨夜里突然响起。'};
  const definitions=[['rain',/雨|滴水/,'雨声'],['wind',/风|空旷/,'风声'],['forest',/森林|鸟|树林/,'林间氛围'],['room',/教室|人声|人群|咖啡|室内/,'室内氛围'],['steps',/脚步|皮鞋|走廊|踩|行走/,'脚步'],['sword',/拔剑|刀|金属|挥剑/,'金属划过'],['magic',/魔法|能量|法术|爆发/,'魔法'],['door',/门|开门|关门/,'门响'],['notify',/消息|通知|提示|手机/,'消息提示']];
  function layers(text){text=text.replace(/(?:不要|无|不含|去掉)[^，。；\n]*/g,'');return definitions.filter(([,pattern])=>pattern.test(text)).filter(([type])=>type!=='door'||/开门|关门|门响/.test(text)).map(([type,,name])=>({type,name,level:1}));}
  function suggest(description){
    const text=clean(description),parts=layers(text),action=parts.some(item=>['steps','sword','magic','door','notify'].includes(item.type));
    return {category:action?'action':'environment',duration:action?parts.some(item=>item.type==='steps')?8:parts.length>1?5:3:12,loop:!action,supported:!!parts.length,layers:parts.length?parts:[{type:'wind',name:'通用氛围',level:1}]};
  }
  function seed(text){let value=13;for(const char of text)value=(Math.imul(value,31)+char.charCodeAt(0))>>>0;return value;}
  function trim(value){const versions=value.versions||[];while(versions.length>15){const index=versions.findLastIndex(item=>item.id!==value.keptId&&item.id!==value.previewId);versions.splice(index,1);}return value;}
  function selected(value){return (value.versions||[]).find(item=>item.id===value.previewId)||value.versions?.[0];}
  function kept(value){return (value.versions||[]).find(item=>item.id===value.keptId);}
  function generate(value,id){
    const description=clean(value.description);if(!description)throw Error('先描述想要的场景或声音，也可以试用示例。');
    const recommendation=suggest(description),category=['environment','action'].includes(value.category)?value.category:recommendation.category;
    const duration=value.duration===undefined?recommendation.duration:Number(value.duration);if(!Number.isFinite(duration)||duration<.5||duration>60)throw Error('声音时长需在 0.5 到 60 秒之间。');
    const groupId=id('sound-group'),loop=category==='environment'&&!!value.loop;
    const motion=/靠近|走近|由远及近/.test(description)?'approach':/远离|走远/.test(description)?'depart':'still';
    const versions=['近景清晰','自然均衡','远处空间'].map((name,index)=>({id:id('sound-version'),groupId,name,category,description,duration,loop,source:copy(value.source||null),modification:'',supported:recommendation.supported,createdAt:new Date().toISOString(),plan:{schema:1,kind:'sound',seed:seed(description+groupId)+index*97,duration,loop,category,layers:copy(recommendation.layers),distance:[.05,.4,.8][index],reverb:[.12,.2,.45][index],gain:[.9,.8,.65][index],pace:/慢/.test(description)?.75:1,motion,stopAtEnd:/停在|停下|停止/.test(description)}}));
    return trim({...copy(value),versions:[...versions,...(value.versions||[])],previewId:versions[0].id,modification:''});
  }
  function revise(value,id){
    const base=selected(value),modification=clean(value.modification);if(!base)throw Error('先生成声音，再选择要修改的版本。');if(!modification)throw Error('请描述想调整的声音。');
    const duration=Number(value.duration??base.duration);if(!Number.isFinite(duration)||duration<.5||duration>60)throw Error('声音时长需在 0.5 到 60 秒之间。');
    const plan=copy(base.plan);plan.duration=duration;plan.loop=base.category==='environment'&&!!value.loop;
    if(/小一点|轻一点|更轻|低一点|弱一点/.test(modification))plan.gain=Math.max(.1,plan.gain*.65);
    if(/大一点|响一点|更响|强一点/.test(modification))plan.gain=Math.min(1.3,plan.gain*1.25);
    if(/远一点|远一些|远处/.test(modification))plan.distance=Math.min(1,plan.distance+.25);
    if(/近一点|近一些/.test(modification))plan.distance=Math.max(0,plan.distance-.25);
    if(/混响少|回声少|不要回声|不要混响/.test(modification))plan.reverb=.03;
    if(/回声多|混响多|更空旷/.test(modification))plan.reverb=.5;
    if(/慢一点|更慢/.test(modification))plan.pace=Math.max(.4,plan.pace*.75);
    if(/快一点|更快/.test(modification))plan.pace=Math.min(2,plan.pace*1.3);
    if(/雨声少|雨声小/.test(modification))plan.layers.filter(item=>item.type==='rain').forEach(item=>item.level*=.5);
    if(/靠近/.test(modification))plan.motion='approach';if(/远离|走远/.test(modification))plan.motion='depart';
    if(/停在|停下|停止/.test(modification))plan.stopAtEnd=true;
    const version={...copy(base),id:id('sound-version'),name:base.name.replace(/ · 修改版$/,'')+' · 修改版',baseId:base.id,modification,duration,loop:plan.loop,plan,createdAt:new Date().toISOString()};
    return trim({...copy(value),versions:[version,...value.versions],previewId:version.id});
  }
  function keep(value,versionId){if(!(value.versions||[]).some(item=>item.id===versionId))throw Error('声音版本已不存在。');return {...copy(value),keptId:versionId,previewId:versionId};}
  function snapshot(value){const version=kept(value);if(!version)throw Error('请先采用一个声音版本。');return {toolId:'sound-effects',title:(version.category==='environment'?'环境音':'动作音效')+' · '+version.name,kind:'audio',prompt:version.description,images:[],audio:{kind:'effect',text:version.description,preset:version.name,duration:version.duration,format:'wav',effectPlan:copy(version.plan),versionId:version.id},sound:{...copy(version),versionId:version.id},prototype:true,notice:'本地合成声音示例，非实录；AI 环境音、拟音及自定义声音生成待接入。',createdAt:version.createdAt};}
  const api={examples,suggest,generate,revise,selected,kept,keep,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolSoundModel=api;
})(typeof window==='undefined'?globalThis:window);
