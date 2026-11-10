(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value)),clean=value=>String(value||'').trim().slice(0,2000);
  const sample='雨夜，男主准备离开这座城市，突然收到前女友的消息。音乐克制、带一点遗憾，后半段有期待感，以钢琴为主，不要人声。';
  const directions={
    romance:[['克制告别','独奏钢琴 · 舒缓 · 留白','piano',72],['重逢预感','钢琴与轻弦乐 · 渐渐温暖','bloom',80],['都市夜色','柔和吉他与轻电子 · 夜景独白','city',84]],
    warm:[['午后日常','木吉他 · 明亮轻快 · 陪伴','warm',92],['心动片刻','钢琴与弦乐 · 温柔 · 浪漫','bloom',88],['角色登场','轻电子 · 轻盈节奏 · 展示感','city',100]],
    mystery:[['暗处的线索','低音钢琴 · 疏离 · 悬念','mystery',68],['夜色追逐','轻电子与低音 · 紧张推进','city',110],['未知来信','空灵弦乐 · 缓慢 · 神秘','ambient',64]],
    adventure:[['踏上旅途','弦乐与钢琴 · 开阔 · 期待','bloom',100],['奔向远方','吉他与鼓点 · 明亮 · 前进','warm',116],['觉醒时刻','低音与弦乐 · 张力 · 决心','mystery',96]]
  };
  function seed(text){let result=31;for(const char of text)result=(Math.imul(result,31)+char.charCodeAt(0))>>>0;return result;}
  function recommend(value,id){
    const description=clean(value.description);if(!description)throw Error('先描述音乐用途和情境，也可以试用示例。');
    const type=/悬疑|惊悚|恐怖|神秘|线索/.test(description)?'mystery':/战斗|冒险|热血|旅途|追逐/.test(description)?'adventure':/温暖|日常|可爱|直播|轻快|治愈/.test(description)?'warm':'romance';
    const group={id:id('music-group'),description,source:copy(value.source||null),createdAt:new Date().toISOString()};
    group.choices=directions[type].map(([name,tags,arrangement,bpm],index)=>({id:id('music-choice'),name,tags,previewDuration:12,plan:{schema:1,arrangement,bpm,seed:seed(description+group.id)+index*17,major:type==='warm'||type==='adventure',duration:12,loop:false,gains:{piano:1,strings:1,guitar:1,drums:1}},description,source:copy(group.source)}));
    return group;
  }
  function generate(value,id){
    if(!value.selected?.plan)throw Error('请先选择一个音乐方向。');
    const duration=Number(value.duration);if(!Number.isFinite(duration)||duration<5||duration>180)throw Error('配乐时长需在 5 到 180 秒之间。');
    const modification=clean(value.modification),plan=copy(value.selected.plan);plan.duration=duration;plan.loop=!!value.loop;
    if(/慢一点|慢些|更慢/.test(modification))plan.bpm=Math.max(50,plan.bpm-12);
    if(/快一点|更快|轻快一点/.test(modification))plan.bpm=Math.min(140,plan.bpm+12);
    if(/弦乐少|减少弦乐|不要弦乐/.test(modification))plan.gains.strings=/不要弦乐/.test(modification)?0:.25;
    if(/钢琴为主|保留钢琴|钢琴多/.test(modification))plan.gains.piano=1.25;
    if(/不要鼓|去掉鼓|鼓点少/.test(modification))plan.gains.drums=0;
    const version={id:id('music-version'),choiceId:value.selected.id,name:value.selected.name,tags:value.selected.tags,description:value.selected.description,source:copy(value.selected.source||null),modification,duration,loop:!!value.loop,plan,createdAt:new Date().toISOString()};
    const versions=[version,...(value.versions||[])];if(versions.length>10)versions.splice(versions.findLastIndex(item=>item.id!==value.keptId),1);
    return {...copy(value),versions,previewId:version.id};
  }
  function selected(value){return (value.versions||[]).find(item=>item.id===value.previewId)||value.versions?.[0];}
  function kept(value){return (value.versions||[]).find(item=>item.id===value.keptId);}
  function keep(value,versionId){if(!(value.versions||[]).some(item=>item.id===versionId))throw Error('配乐版本已不存在。');return {...copy(value),keptId:versionId,previewId:versionId};}
  function snapshot(value){
    const version=kept(value);if(!version)throw Error('请先采用一个完整配乐版本。');
    return {toolId:'background-music',title:version.name+' · 配乐',kind:'audio',prompt:version.description,images:[],audio:{kind:'music',text:version.description,preset:version.name,duration:version.duration,format:'wav',musicPlan:copy(version.plan),versionId:version.id},music:{...copy(version),versionId:version.id},notice:'本地合成的原创编曲示例，AI 作曲与自然语言音乐修改待接入。草稿仅保存编曲资料，播放与下载时合成音频。',createdAt:version.createdAt,prototype:true};
  }
  const api={sample,recommend,generate,selected,kept,keep,snapshot};if(typeof module!=='undefined')module.exports=api;else root.ToolMusicModel=api;
})(typeof window==='undefined'?globalThis:window);
