window.VideoShotPlanner=(()=>{
 function sentences(text){const result=[];let start=0,depth=0;for(let index=0;index<text.length;index++){const char=text[index];if('“「『（('.includes(char))depth++;if('”」』）)'.includes(char))depth=Math.max(0,depth-1);if('。！？'.includes(char)&&depth===0){result.push(text.slice(start,index+1));start=index+1;}}if(start<text.length)result.push(text.slice(start));return result;}
 function plan(text,assets=[],episodeId=''){
  const boundaries=[0],pattern=/(?:^|\n)[ \t]*(?:场景\s*\d+|第[一二三四五六七八九十\d]+场)[^\n]*/g;let match;
  while((match=pattern.exec(text)))if(match.index>0)boundaries.push(match.index);
  if(boundaries.length===1){const paragraphs=/\n[ \t]*\n/g;while((match=paragraphs.exec(text)))boundaries.push(match.index+match[0].length);}
  boundaries.push(text.length);const chunks=[];
  for(let index=0;index<boundaries.length-1;index++){
   const start=boundaries[index],end=boundaries[index+1];if(!text.slice(start,end).trim())continue;
   const block=text.slice(start,end),units=block.match(/[^\n]*\n|[^\n]+$/g)||[];let cursor=start,groupStart=start,weight=0;
   for(const unit of units){const speech=/^\s*[^：:\n]{1,16}[：:]/.test(unit),parts=!speech&&unit.length>100?sentences(unit):[unit];for(const part of parts){const cost=part.trim().length/(speech?4:8);if(weight+cost>16&&cursor>groupStart&&text.slice(groupStart,cursor).trim()&&!/^\s*(场景\s*\d+[^\n]*|第[^\n]+场)\s*$/.test(text.slice(groupStart,cursor))){chunks.push({start:groupStart,end:cursor,text:text.slice(groupStart,cursor),sceneStart:groupStart===start});groupStart=cursor;weight=0;}cursor+=part.length;weight+=cost;}}
   if(cursor>groupStart)chunks.push({start:groupStart,end:cursor,text:text.slice(groupStart,cursor),sceneStart:groupStart===start});
  }
  return chunks.map((chunk,index)=>{
   const lines=chunk.text.split('\n'),dialogues=[],narration=[],speakers=[];
   for(const line of lines){const speech=line.match(/^\s*([^：:\n]{1,16})[：:](.*)$/);if(speech&&!/^(时间|地点|人物|动作|场景|心理|旁白)/.test(speech[1])){dialogues.push(line);speakers.push(speech[1].trim());}else if(/^\s*(旁白|心理)[：:]/.test(line))dialogues.push(line);else narration.push(line);}
   const visible=narration.join('\n').replace(/[“「『][\s\S]*?[”」』]/g,''),related=assets.filter(asset=>{
    const aliases=asset.storyProfile?.aliases,names=[asset.name,...(Array.isArray(aliases)?aliases:String(aliases||'').split(/[、,，/]/))].filter(Boolean);
    return names.some(name=>visible.includes(name)||speakers.includes(name));
   });
   const scene=chunk.text.match(/^\s*(场景\s*\d+[^\n]*|第[一二三四五六七八九十\d]+场[^\n]*)/),action=narration.join('\n').trim(),duration=Math.max(4,Math.min(180,Math.ceil((action.length/8)+(dialogues.join('').length/4))));
   return {title:scene?scene[1].slice(0,45):'连续动作 '+(index+1),intent:chunk.text,initialFrame:action.split(/[。！？\n]/).find(x=>x.trim())||'',actionChange:action,dialogue:dialogues.join('\n'),soundDirection:dialogues.length?'环境声与已有对白':'环境声，按需补充',duration,assetIds:related.map(a=>a.id),continuity:index?(scene?'场景切换':chunk.sceneStart?'待确认':'连续动作'):'开场',planningNote:'按明确场景、段落和文字节奏整理；长对白保持完整，可人工拆分。出场和表演需核对。',sourceRange:{start:chunk.start,end:chunk.end},sourceRefs:[{kind:'confirmed-body',episodeId,start:chunk.start,end:chunk.end}],episodeId,framing:''};
  });
 }
 return {plan};
})();
