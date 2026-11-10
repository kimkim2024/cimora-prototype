(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  function sourceKind(value){return value.inputs?.main?.src?'upload':'sample';}
  function main(value,image,id){return {version:1,main:{...clone(image),id,prompt:value.prompt,style:value.option},confirmedMainId:null,bundle:null,selected:'main',tasks:[]};}
  function confirm(value){if(value.dirty)throw Error('角色描述已更新，请重新生成或采用参考图。');if(!value.oc?.main)throw Error('请先生成主形象或采用参考图。');return {...clone(value.oc),confirmedMainId:value.oc.main.id};}
  function invalidate(value,patch){return {...patch,ready:false,dirty:true,oc:value.oc?{...clone(value.oc),confirmedMainId:null,bundle:null,outfitCandidate:null,originalLook:null,activeOutfit:null,lookView:'original',selected:'main'}:null};}
  function assertConfirmed(value){if(value.dirty||!value.oc?.main||value.oc.confirmedMainId!==value.oc.main.id)throw Error('请先确认当前角色主形象，再生成整套设定表。');}
  const outfitRoles=['front','side','back','portrait'];
  function lookBundle(bundle){return Object.fromEntries([...outfitRoles,'reference','clothing'].filter(role=>bundle?.[role]).map(role=>[role,clone(bundle[role])]));}
  function checkedOutfit(value,candidate){
    assertConfirmed(value);
    if(candidate?.mainId!==value.oc.main.id)throw Error('换装结果已失效，请基于当前角色重新生成。');
    if(candidate.demo&&value.oc.main.source!=='sample')throw Error('预置换装示例不能用于上传的角色。');
    if(!outfitRoles.every(role=>candidate.bundle?.[role]?.src)||!candidate.description?.trim())throw Error('换装结果需要完整的三视图、头像与服饰说明。');
  }
  function stageOutfit(value,candidate){
    checkedOutfit(value,candidate);
    return {...value.oc,originalLook:{bundle:lookBundle(value.oc.bundle),description:value.oc.activeOutfit?.description||'原始服饰设定'},outfitCandidate:{...clone(candidate),bundle:lookBundle(candidate.bundle)},lookView:'new'};
  }
  function adoptOutfit(value){
    const candidate=value.oc?.outfitCandidate;checkedOutfit(value,candidate);
    return {...value.oc,bundle:lookBundle(candidate.bundle),activeOutfit:{id:candidate.id,description:candidate.description,demo:!!candidate.demo},outfitCandidate:null,lookView:'new'};
  }
  function planEdit(selected,request){const shared=/服装|衣服|外套|夹克|衬衫|裙|裤|鞋|帽|背包|斜挎包|围巾|发型|头发|发色|肤色|瞳色|颜色|配色|饰|身高|体型/.test(request)||['main','sheet'].includes(selected);return {target:selected,request,scopes:shared?['front','side','back','portrait','clothing','sheet']:[selected,'sheet']};}
  function profileFromNotes(notes,{sample=false}={}){
    if(sample)return {intro:'陆川，准备离开这座城市的普通上班族。',traits:'外表平静，内心敏感，不善于直接表达自己的情绪。',story:'离开前的最后一晚，他和同事去吃宵夜，却收到三年未联系的前女友的好友申请。他没有立刻点下同意，原本确定的离开也变得犹豫。',source:'sample'};
    const text=String(notes||'').trim();
    return {intro:text.length>600?text.slice(0,599)+'…':text,traits:'',story:'',source:'notes'};
  }
  function checkedProfile(profile){const out={source:profile.source||'edited'};for(const [key,max]of [['intro',600],['traits',360],['story',1000],['notes',1800]]){out[key]=String(profile[key]||'').trim();if(out[key].length>max)throw Error('人物介绍过长，请精简后保存。');}return out;}
  function profilePatch(value,profile){return {profile:checkedProfile(profile),sheetDirty:!!value.oc?.bundle};}
  function profileReply(profile,request){
    const text=String(request||'').trim(),next=checkedProfile({...profile,source:'edited'}),fields={人物简介:'intro',简介:'intro',身份:'intro',性格与特点:'traits',性格:'traits',特点:'traits',角色小故事:'story',小故事:'story',经历:'story',背景:'story',补充设定:'notes'};
    let applied=false;
    for(const line of text.split(/\n/)){const match=line.trim().match(/^(?:请|把)?(人物简介|性格与特点|角色小故事|补充设定|简介|身份|性格|特点|小故事|经历|背景)(?:改为|改成|设为|：|:)\s*(.+)$/);if(match){next[fields[match[1]]]=match[2].replace(/^[：:]\s*/,'');applied=true;}}
    if(!applied&&/不要|去掉|删除|不安排/.test(text)&&/恋爱|爱情|恋情|感情经历/.test(text)){
      const romance=/前女友|前男友|恋爱|爱情|恋情|暗恋|初恋|失恋|恋人|情侣/;
      if(romance.test(next.story))next.story='';
      for(const key of ['intro','traits'])next[key]=next[key].split(/(?<=[。！？\n])/).filter(part=>!romance.test(part)).join('').trim();applied=true;
    }
    if(!applied&&/更?开朗|外向/.test(text)&&!/不要|不想|去掉/.test(text)){next.traits='开朗外向，愿意主动表达自己的想法，也会认真回应身边的人。';applied=true;}
    if(!applied&&/更?内向|话少/.test(text)&&!/不要|不想|去掉/.test(text)){next.traits='内向安静，习惯先观察和倾听，再用自己的方式表达关心。';applied=true;}
    return {applied,profile:applied?checkedProfile(next):checkedProfile(profile),reply:applied?'人物介绍已更新，主形象与各视图继续沿用。':'要求已记录，等待接入 AI 整理；本机可用「性格改为：…」「角色小故事：…」直接更新，也可点右侧「编辑介绍」。'};
  }
  const api={sourceKind,main,confirm,invalidate,assertConfirmed,stageOutfit,adoptOutfit,planEdit,profileFromNotes,profilePatch,profileReply};
  if(typeof module!=='undefined')module.exports=api;else root.ToolOCModel=api;
})(typeof window==='undefined'?globalThis:window);
