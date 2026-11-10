(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const auditionText='你怎么现在才来？算了，先坐吧。我还以为，今天等不到你了。';
  const sampleText='三年了，没想到离开这座城市之前，还能收到你的消息。';
  const presets=[
    {key:'calm',name:'清冷克制',tags:'偏低女声 · 咬字清楚 · 情绪内收',engineId:'zh-CN-XiaoyiNeural',pitch:.92,rate:.94},
    {key:'bright',name:'清亮利落',tags:'清亮女声 · 节奏轻快 · 亲近自然',engineId:'zh-CN-XiaoxiaoNeural',pitch:1.12,rate:1.03},
    {key:'soft',name:'温柔讲述',tags:'柔和女声 · 舒缓 · 有陪伴感',engineId:'zh-TW-HsiaoChenNeural',pitch:1,rate:.93},
    {key:'youth',name:'自然青年',tags:'青年男声 · 自然清晰 · 松弛',engineId:'zh-CN-YunxiNeural',pitch:1,rate:1},
    {key:'deep',name:'沉稳低声',tags:'浑厚男声 · 稳重 · 有力量',engineId:'zh-CN-YunjianNeural',pitch:.87,rate:.94},
    {key:'narrator',name:'冷静叙述',tags:'清晰男声 · 平稳 · 讲述感',engineId:'zh-CN-YunyangNeural',pitch:1,rate:.98}
  ];
  function clean(value,max=2000){return String(value||'').trim().slice(0,max);}
  function source(value){const current=value.source;if(!current)return null;return copy(Object.fromEntries(['key','scope','snapshotId','projectId','episodeId','assetId','name','origin'].filter(key=>current[key]!==undefined).map(key=>[key,current[key]])));}
  function voice(preset,id,text=auditionText){return {id:id('voice-choice'),presetKey:preset.key,name:preset.name,tags:preset.tags,text,profile:{engineId:preset.engineId,pitch:preset.pitch,rate:preset.rate},prototype:true};}
  function recommend(value,id){
    const description=clean(value.description);if(!description)throw Error('先描述角色或声音需求，也可以试用示例。');
    const text=clean(value.auditionText===undefined?auditionText:value.auditionText,500);if(!text)throw Error('请填写统一的试听文本。');
    const pool=value.mode==='narration'?[presets[5],presets[2],presets[1]]:/男生|男声|男性|少年|青年男|大叔/.test(description)?presets.slice(3):presets.slice(0,3);
    const voices=pool.map(preset=>voice(preset,id,text));
    if(/慢一点|慢些|舒缓/.test(description))for(const item of voices)item.profile.rate=Math.max(.7,item.profile.rate-.1);
    if(/低一点|偏低|不要甜|不甜/.test(description))for(const item of voices)item.profile.pitch=Math.max(.7,item.profile.pitch-.08);
    return {id:id('voice-group'),description,text,mode:value.mode||'character',source:source(value),voices,prototype:true,createdAt:new Date().toISOString()};
  }
  function select(value,chosen){if(!chosen?.profile?.engineId)throw Error('请选择一个声音。');return {...copy(value),selectedVoice:copy(chosen)};}
  function generate(value,id){
    if(!value.selectedVoice?.profile?.engineId)throw Error('请先选择声音。');
    const text=clean(value.text);if(!text)throw Error('请填写配音内容。');
    const rate=Number(value.rate||1);if(!Number.isFinite(rate)||rate<.5||rate>2)throw Error('语速需在 0.5 到 2 之间。');
    const version={id:id('voice-take'),text,voice:copy(value.selectedVoice),source:source(value),performance:clean(value.performance,500),rate,prototype:true,createdAt:new Date().toISOString()};
    const versions=[version,...(value.versions||[])];
    if(versions.length>12){const removable=versions.findLastIndex(item=>item.id!==value.keptId);versions.splice(removable,1);}
    return {...copy(value),versions,previewId:version.id};
  }
  function keep(value,versionId){if(!(value.versions||[]).some(item=>item.id===versionId))throw Error('配音版本已不存在。');return {...copy(value),keptId:versionId,previewId:versionId};}
  function selected(value){return (value.versions||[]).find(item=>item.id===value.previewId)||value.versions?.[0];}
  function kept(value){return (value.versions||[]).find(item=>item.id===value.keptId);}
  function profileSnapshot(value){
    if(!value.selectedVoice)throw Error('请先选择声音。');
    return {toolId:'voiceover',title:clean(value.voiceName,40)||value.selectedVoice.name,kind:'audio',prompt:clean(value.description),images:[],audio:{kind:'voice',text:value.selectedVoice.text,preset:value.selectedVoice.name,rate:value.selectedVoice.profile.rate,profile:copy(value.selectedVoice.profile),src:value.selectedVoice.src||'',format:'mp3'},voiceover:{type:'profile',voice:copy(value.selectedVoice),source:source(value)},notice:'保存的是角色音色方案和试听文本，本段表演另行保存。自定义 AI 声音设计待接入。',prototype:true};
  }
  function snapshot(value){
    const version=kept(value);if(!version)throw Error('请先采用一个配音版本。');
    return {toolId:'voiceover',title:version.voice.name+' · 配音',kind:'audio',prompt:version.text,images:[],audio:{kind:'voice',text:version.text,preset:version.voice.name,rate:version.rate*version.voice.profile.rate,profile:copy(version.voice.profile),src:version.src||'',format:'mp3'},voiceover:{type:'take',versionId:version.id,voice:copy(version.voice),source:copy(version.source),performance:version.performance,rate:version.rate},notice:version.src?'预置真实语音示例，用于验证试听、采用和作品衔接。':'浏览器系统语音演示；自定义 AI 配音与情绪合成待接入，下载为离线试听页。',prototype:true,createdAt:version.createdAt};
  }
  function attach(assets,snapshot,target,id){
    const origin=snapshot.voiceover?.source;if(snapshot.voiceover?.type!=='profile')throw Error('请保存角色声音后再关联。');
    if(['comic','video'].includes(origin?.scope)&&(target.scope!==origin.scope||target.projectId!==origin.projectId||target.assetId!==origin.assetId||(origin.scope==='video'&&target.episodeId!==origin.episodeId)))throw Error('来源不一致，请关联回原角色。');
    const asset=assets.find(item=>item.id===target.assetId&&['人物','角色'].includes(item.kind));if(!asset)throw Error('角色已不存在。');
    const choice=snapshot.voiceover.voice;if(!choice?.profile?.engineId)throw Error('缺少角色声音。');
    asset.voiceProfiles||=[];
    const duplicate=asset.voiceProfiles.find(item=>item.voiceId===choice.id);if(duplicate)return duplicate;
    const profile={id:id('voice-profile'),voiceId:choice.id,name:snapshot.title,profile:copy(choice.profile),voice:copy(choice),source:copy(origin),createdAt:new Date().toISOString()};
    asset.voiceProfiles.push(profile);return profile;
  }
  const api={auditionText,sampleText,presets,voice,source,recommend,select,generate,keep,selected,kept,snapshot,profileSnapshot,attach};
  if(typeof module!=='undefined')module.exports=api;else root.ToolVoiceoverModel=api;
})(typeof window==='undefined'?globalThis:window);
