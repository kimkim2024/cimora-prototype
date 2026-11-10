(()=>{
  'use strict';
  const M=ToolVoiceoverModel,E=Site.esc,copy=value=>JSON.parse(JSON.stringify(value));
  const sampleDescription='外表冷淡的短发女生，性格要强，不喜欢暴露情绪。深夜收到久未联系的朋友的消息，嘴上不在乎，其实有些期待。';
  let H,busy=false,player=null,playingId='',playToken=0,sourceError='';
  const button=(label,action,extra='',primary=false)=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-vo="${action}" ${extra}>${label}</button>`;
  const current=()=>({step:1,mode:'character',description:'',auditionText:M.auditionText,groups:[],groupId:'',selectedVoice:null,source:null,text:'',performance:'',rate:1,versions:[],previewId:'',keptId:'',voiceName:'',...H.value()});
  const write=patch=>{H.write(patch);H.render();};
  function targets(){try{sourceError='';return H.targets();}catch(error){sourceError='已有作品暂时无法读取：'+error.message+' 可以继续独立配音。';return [];}}
  function sources(){
    const entries=H.store.list().filter(item=>item.toolId==='oc-sheet'&&item.character).map(item=>({key:'oc:'+item.id,scope:'oc',snapshotId:item.id,name:item.character.name||item.title,origin:'已保存 OC',description:Object.values(item.character.profile||{}).filter(value=>typeof value==='string').join('；')}));
    for(const entry of targets())for(const asset of (entry.scope==='comic'?entry.project.assets:entry.context.e.videoFlow.workspace.assets)||[]){
      if(!['人物','角色'].includes(asset.kind))continue;
      const profile=asset.characterProfile||asset.storyProfile||{};
      entries.push({key:entry.key+':'+asset.id,scope:entry.scope,projectId:entry.project?.id||entry.context?.p.id,episodeId:entry.context?.c.id,assetId:asset.id,name:asset.name,origin:entry.label,description:[asset.description,asset.stable,asset.facts,...Object.values(profile).filter(value=>typeof value==='string')].filter(Boolean).join('；'),voiceProfiles:asset.voiceProfiles||[]});
    }
    return entries;
  }
  function savedVoices(){
    const result=H.store.list().filter(item=>item.toolId==='voiceover'&&item.voiceover?.type==='profile').map(item=>({key:'saved:'+item.id,voice:{...item.voiceover.voice,name:item.title},source:item.voiceover.source,label:item.title+' · 我的声音'}));
    for(const source of sources())for(const profile of source.voiceProfiles||[])result.push({key:source.key+':'+profile.id,voice:profile.voice,source,label:source.name+' · '+profile.name});
    return result;
  }
  function group(value){return value.groups.find(item=>item.id===value.groupId)||value.groups[0];}
  function sourcePicker(value){
    const choices=sources();return `<details class="vo-source"><summary>${value.source?'已带入：'+E(value.source.name):'从已有角色带入（可选）'}</summary>${sourceError?`<p role="status">${E(sourceError)}</p>`:''}<label>选择 OC / 漫画 / 视频角色<select id="vo-source"><option value="">不关联角色，直接描述</option>${choices.map(item=>`<option value="${E(item.key)}" ${item.key===value.source?.key?'selected':''}>${E(item.name+' · '+item.origin)}</option>`).join('')}</select></label>${value.source?`<p>人物资料已带入声音描述，可继续补充。</p>`:choices.length?'':'<p>暂无已保存角色，直接描述也可以开始。</p>'}</details>`;
  }
  function findInput(value){
    return `<div class="vo-section-title"><span>描述</span><h2>这个声音属于谁？</h2></div><div class="vo-tabs" role="group" aria-label="声音用途">${button('角色声音','mode','data-value="character" aria-pressed="'+(value.mode==='character')+'"')}${button('旁白声音','mode','data-value="narration" aria-pressed="'+(value.mode==='narration')+'"')}</div>${sourcePicker(value)}<label for="vo-description">${value.mode==='narration'?'想要什么样的讲述感？':'描述角色或使用情境'}<textarea id="vo-description" rows="6" maxlength="2000" placeholder="比如：外表冷淡、内心温柔的女生，深夜收到老朋友的消息，声音不要太甜…">${E(value.description)}</textarea></label><div class="vo-examples">${button('冷淡却心软的女生','example','data-value="girl"')}${button('自然松弛的青年','example','data-value="boy"')}${button('温柔故事旁白','example','data-value="narrator"')}</div><details class="vo-audition"><summary>统一试听文本 · 可修改</summary><p>三个声音读相同内容，更容易听出区别。</p><label for="vo-audition">试听文本<textarea id="vo-audition" rows="3" maxlength="500">${E(value.auditionText)}</textarea></label></details><p class="vo-hint">${value.groups.length?'继续修改描述，再推荐一组；旧候选仍可回听。':'性格、年龄感和说话方式更有帮助，外貌可作辅助参考。'}</p>${button(value.groups.length?'再推荐 3 个声音':'生成 3 个声音试听','recommend','id="vo-recommend" '+(!value.description.trim()?'disabled':''),true)}<div class="vo-secondary">${button('已有喜欢的声音，直接配音 →','direct')}</div>`;
  }
  function voiceCard(voice,value){
    const chosen=value.selectedVoice?.id===voice.id;return `<article class="vo-card ${chosen?'is-selected':''}"><div class="vo-card-top"><span class="vo-avatar">♫</span><div><h3>${E(voice.name)}</h3><p>${E(voice.tags)}</p></div><span class="vo-state">${chosen?'已选':'声音试听'}</span></div>${audioControl(voice,voice.id)}<div class="vo-card-actions">${button(chosen?'✓ 已选这个声音':'选这个声音','choose',`data-id="${E(voice.id)}" aria-pressed="${chosen}"`,chosen)}</div></article>`;
  }
  function findOutput(value){
    const entry=group(value);
    const selection=value.selectedVoice?`<section class="vo-selection"><div><small>已选声音</small><h3>${E(value.selectedVoice.name)}</h3><p>可以继续调整，也可以开始配台词。</p></div>${button('用这个声音配音 →','continue','',true)}<details><summary>保存这个声音，以后继续用</summary><label for="vo-name">声音名称<input id="vo-name" maxlength="40" value="${E(value.voiceName||value.selectedVoice.name)}"></label><div class="vo-actions">${button('保存声音','save-profile')}${['comic','video'].includes(value.source?.scope)?button('关联到 '+E(value.source.name),'attach-profile'):''}</div></details></section>`:'';
    return `<div class="vo-section-title"><span>试听与比较</span><h2>找到适合角色的声音</h2></div>${selection}${entry?`<div class="vo-group-nav">${value.groups.map((item,index)=>button('第 '+(value.groups.length-index)+' 组','group',`data-id="${E(item.id)}" aria-pressed="${item.id===entry.id}"`)).join('')}</div><p class="vo-quote">“${E(entry.text)}”</p><p class="vo-hint">同一段文本 · 3 个声音方向 · ${entry.voices.every(voice=>voice.src)?'真实预置试听':'系统语音试听'}</p><div class="vo-candidates">${entry.voices.map(voice=>voiceCard(voice,value)).join('')}</div>`:`<div class="vo-empty"><span>♫</span><h3>声音候选会出现在这里</h3><p>描述角色，听三个声音，再选一个去配台词。</p>${button('试用角色声音示例','sample')}</div>`}`;
  }
  function audioControl(item,key){
    const file=!!item.src;return `<div class="vo-player" data-voice-player="${E(key)}">${file?`<audio preload="metadata" src="${E(item.src)}" data-vo-audio="${E(key)}"></audio>`:''}${button('▶ 试听','play',`data-id="${E(key)}" aria-label="试听${E(item.name||item.voice?.name||'配音')}" aria-pressed="false"`)}${file?'<progress max="1" value="0" aria-label="播放进度"></progress>':''}<span class="vo-play-status">${file?'可播放音频':'系统语音演示'}</span><span class="vo-duration">${item.duration?item.duration.toFixed(1)+' 秒':''}</span></div>`;
  }
  function scriptText(script){return typeof script?.fullText==='string'?script.fullText:(script?.scenes||[]).map(item=>[item.action,item.dialogue,item.mind].filter(Boolean).join('\n')).join('\n\n');}
  function textSources(){
    const result=[];
    let stories;try{stories=JSON.parse(localStorage.getItem('cimora-script-studio-v1')||'null');}catch{}
    for(const project of stories?.projects||[])for(const [episodeId,script] of Object.entries(project.scripts||{})){const text=scriptText(script);if(text.trim())result.push({key:'story:'+project.id+':'+episodeId,label:'故事 · '+project.title+' / '+(project.outline?.find(item=>item.id===episodeId)?.title||'本集正文'),text});}
    for(const entry of targets()){
      if(entry.scope==='comic')for(const [episodeId,episode] of Object.entries(entry.project.bodyPagination?.episodes||{}))if(episode.text?.trim())result.push({key:entry.key+':'+episodeId,label:entry.label+' / '+(entry.project.storyPlan?.episodes?.find(item=>item.id===episodeId)?.title||'本集正文'),text:episode.text});
      if(entry.scope==='video')for(const shot of entry.context.e.productionShots||[])if(shot.dialogue?.trim())result.push({key:entry.key+':'+shot.id,label:entry.label+' / '+(shot.title||'本镜台词'),text:shot.dialogue});
    }
    return result;
  }
  function takeInput(value){
    const texts=textSources();
    return `<div class="vo-section-title"><span>配台词</span><h2>用这个声音，说出你的内容</h2></div><label for="vo-text">配音内容<textarea id="vo-text" rows="8" maxlength="2000" placeholder="写下角色要说的话，或需要朗读的旁白…">${E(value.text)}</textarea></label><div class="vo-actions">${button('填入示例台词','sample-text')}${texts.length?button('从作品带入台词','import-text'):''}</div><label for="vo-performance">这段怎么说（可选）<textarea id="vo-performance" rows="3" maxlength="500" placeholder="例如：故作轻松，最后一句犹豫一下。只调整本段表演，不改变角色音色。">${E(value.performance)}</textarea></label><label for="vo-rate">语速<select id="vo-rate">${[.8,1,1.2].map(rate=>`<option value="${rate}" ${Number(value.rate)===rate?'selected':''}>${rate===1?'自然':rate<1?'慢一点':'快一点'} · ${rate} 倍</option>`).join('')}</select></label><p class="vo-hint">修改文案后重新生成；已采用的配音会继续保留。情绪要求随版本保存，AI 情绪合成待接入。</p>${button(value.versions.length?'修改后重新生成':'生成配音','generate','id="vo-generate" '+(!value.text.trim()?'disabled':''),true)}`;
  }
  function takeOutput(value){
    const version=M.selected(value),kept=M.kept(value);
    return `<div class="vo-section-title"><span>试听与采用</span><h2>本次配音</h2></div>${version?`<div class="vo-take"><div class="vo-card-top"><span class="vo-avatar">♫</span><div><h3>${E(version.voice.name)}</h3><p>${version.src?'预置配音示例 · 真实音频':'系统语音演示 · AI 配音待接入'}</p></div><span class="vo-state">${version.id===value.keptId?'已采用':'待采用'}</span></div>${audioControl(version,version.id)}<p class="vo-take-text">${E(version.text)}</p>${version.performance?`<p class="vo-hint">表演要求：${E(version.performance)}（待 AI 合成）</p>`:''}${button(version.id===value.keptId?'✓ 已采用此版':'采用这版配音','keep',`data-id="${E(version.id)}" aria-pressed="${version.id===value.keptId}"`,true)}</div><div class="vo-history"><h3>配音版本</h3><div class="vo-actions">${value.versions.map((item,index)=>button('v'+(value.versions.length-index)+(item.id===value.keptId?' · 已采用':''),'version',`data-id="${E(item.id)}" aria-pressed="${item.id===version.id}"`)).join('')}</div></div><div class="vo-delivery"><h3>${kept?'交付已采用版':'满意后采用，再保存或下载'}</h3>${kept?`<p>当前交付：${E(kept.voice.name)} · v${value.versions.length-value.versions.findIndex(item=>item.id===kept.id)}${kept.id!==version.id?'（当前预览尚未采用）':''}</p><div class="vo-actions">${button('保存配音','save-take')}${button(kept.src?'下载音频 MP3':'下载离线试听页','download')}${button('带入作品','bring')}</div>`:''}</div>`:`<div class="vo-empty"><span>▷</span><h3>这里听见角色的台词</h3><p>左侧填写内容，生成后试听、修改，再采用满意的一版。</p>${button('填入示例台词','sample-text')}</div>`}`;
  }
  function render(input){
    stop();const value={...current(),...input},step=value.step===2&&value.selectedVoice?2:1;
    return `<main class="ts-page vo-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>角色配音与旁白</h1><p>先找到角色的声音，再让它说出你的故事。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><nav class="vo-steps" aria-label="配音步骤">${button('<b>1</b><span>确定声音<small>描述角色，试听挑选</small></span>','step','data-step="1" aria-current="'+(step===1?'step':'false')+'"')}<span>→</span>${button('<b>2</b><span>生成配音<small>填写台词，试听采用</small></span>','step','data-step="2" '+(!value.selectedVoice?'disabled':'')+' aria-current="'+(step===2?'step':'false')+'"')}</nav><p class="vo-demo">交互 Demo · 预置示例可播放和下载真实音频；自定义内容使用系统语音试听，AI 声音设计与情绪合成待接入。</p>${step===2?`<div class="vo-current"><span>当前声音</span><strong>${E(value.selectedVoice.name)}</strong>${button('▶ 试听声音','play-selected')}${button('更换声音','step','data-step="1"')}<small>本次表演调整不会覆盖角色音色</small></div>`:''}<div class="vo-workbench"><section class="ts-panel vo-input">${step===1?findInput(value):takeInput(value)}</section><section class="ts-panel vo-output">${step===1?findOutput(value):takeOutput(value)}</section></div><p id="ts-message" role="status" aria-live="polite"></p></main>`;
  }
  function stop(){
    playToken++;if(player){player.pause();player=null;}if(playingId&&window.speechSynthesis)window.speechSynthesis.cancel();playingId='';
    document.querySelectorAll('.vo-player').forEach(node=>{const control=node.querySelector('[data-vo=play]');if(control){control.innerHTML='▶ 试听';control.setAttribute('aria-pressed','false');}const status=node.querySelector('.vo-play-status');if(status)status.textContent=node.querySelector('audio')?'可播放音频':'系统语音演示';const bar=node.querySelector('progress');if(bar)bar.value=0;});
    const selected=document.querySelector('[data-vo=play-selected]');if(selected){selected.textContent='▶ 试听声音';selected.setAttribute('aria-pressed','false');}
  }
  function paintStatus(id,text){const node=Array.from(document.querySelectorAll('[data-voice-player]')).find(item=>item.dataset.voicePlayer===id);if(node){node.querySelector('.vo-play-status').textContent=text;const control=node.querySelector('[data-vo=play]');control.innerHTML=playingId===id?'Ⅱ 停止':'▶ 试听';control.setAttribute('aria-pressed',String(playingId===id));}if(id==='selected'){const control=document.querySelector('[data-vo=play-selected]');if(control){control.textContent=playingId===id?'Ⅱ 停止试听':'▶ 试听声音';control.setAttribute('aria-pressed',String(playingId===id));}}}
  async function play(item,id){
    if(playingId===id){stop();return;}stop();playingId=id;const token=playToken;paintStatus(id,'正在试听');
    if(item.src){
      player=new Audio(item.src);player.onended=()=>{if(token===playToken){playingId='';paintStatus(id,'试听结束');}};
      player.ontimeupdate=()=>{if(token===playToken){paintStatus(id,Math.floor(player.currentTime)+' / '+Math.round(player.duration||item.duration||0)+' 秒');const bar=Array.from(document.querySelectorAll('[data-voice-player]')).find(node=>node.dataset.voicePlayer===id)?.querySelector('progress');if(bar)bar.value=player.currentTime/(player.duration||1);}};
      try{await player.play();}catch{stop();throw Error('音频播放失败，请重新点击试听。');}return;
    }
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){stop();throw Error('当前浏览器不支持系统语音，请使用预置示例音频。');}
    const utterance=new SpeechSynthesisUtterance(item.text),profile=item.profile||item.voice?.profile||{},voices=speechSynthesis.getVoices(),engine=profile.engineId||'';
    utterance.lang=engine.startsWith('zh-TW')?'zh-TW':'zh-CN';utterance.voice=voices.find(voice=>voice.voiceURI===engine||voice.name.includes(engine)||voice.name.toLowerCase().includes(engine.split('-').at(-1).replace('Neural','').toLowerCase()))||voices.find(voice=>voice.lang===utterance.lang)||voices.find(voice=>/^zh/i.test(voice.lang))||null;
    utterance.rate=Number(item.rate||profile.rate||1);utterance.pitch=Number(profile.pitch||1);
    utterance.onend=()=>{if(token===playToken){playingId='';paintStatus(id,'试听结束');}};
    utterance.onerror=event=>{if(token===playToken&&!['canceled','interrupted'].includes(event.error)){stop();H.notice(Error('系统中文语音不可用，请试用预置音频。'));}};
    speechSynthesis.speak(utterance);
  }
  async function metadata(src){const audio=new Audio();audio.preload='metadata';return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{audio.src='';reject(Error('试听音频读取超时，请重试。'));},10000);audio.onloadedmetadata=()=>{clearTimeout(timeout);resolve(audio.duration);audio.src='';};audio.onerror=()=>{clearTimeout(timeout);reject(Error('试听音频读取失败，请重试。'));};audio.src=src;});}
  function status(text){const node=document.getElementById('ts-message');if(node)node.textContent=text;}
  async function recommend(){
    const value=current(),entry=M.recommend(value,Site.id);status('正在准备 3 个声音试听…');
    await Promise.all(entry.voices.map(async voice=>{const preset=M.presets.find(item=>item.key===voice.presetKey),same=JSON.stringify(voice.profile)===JSON.stringify({engineId:preset.engineId,pitch:preset.pitch,rate:preset.rate});if(entry.text===M.auditionText&&same){voice.src='assets/voiceover/'+voice.presetKey+'-audition.mp3';voice.duration=await metadata(voice.src);}}));
    write({groups:[entry,...value.groups].slice(0,6),groupId:entry.id});status('已准备三个声音，点击试听比较，再选择喜欢的一个。');
  }
  function choose(voice,origin){const value=current(),changed=M.select(value,voice);write({selectedVoice:changed.selectedVoice,source:origin||null,voiceName:voice.name});}
  function direct(){
    const saved=savedVoices();Site.modal('选择声音，直接配音',`<p>使用预设或之前保存的声音，选择后直接填写台词。</p><div class="vo-direct-list">${saved.map(item=>button(E(item.label),'use-saved',`data-key="${E(item.key)}"`)).join('')}${M.presets.map(preset=>button(E(preset.name+' · '+preset.tags),'use-preset',`data-key="${preset.key}"`)).join('')}</div>`);
  }
  function importText(){
    const entries=textSources();if(!entries.length)throw Error('暂无可带入的正文或台词。');Site.modal('从作品带入台词','<p>选择后可编辑，修改仅保存在本工具。</p><label>选择正文或台词<select id="vo-text-source">'+entries.map(item=>`<option value="${E(item.key)}">${E(item.label)}</option>`).join('')+'</select></label>',button('带入文本','confirm-text','',true));
  }
  function bring(snapshot){
    const entries=targets().filter(entry=>entry.scope==='video'&&entry.context.e.productionShots?.length);Site.modal('将配音带入视频作品',`<p>新增到目标镜头的配音候选；在整集制作中试听并替换，不自动覆盖当前声音。</p>${sourceError?'<p>'+E(sourceError)+'</p>':''}${entries.length?`<label>选择视频作品<select id="vo-target-project">${entries.map(entry=>`<option value="${E(entry.key)}">${E(entry.label)}</option>`).join('')}</select></label><label>目标镜头<select id="vo-target-shot"></select></label>`:'<p>暂无已拆分镜头的视频作品。可以先保存配音或下载，准备作品后再带入。</p>'}<p id="vo-bring-status" role="status"></p>`,entries.length?button('新增配音候选','confirm-bring','',true):'');
    if(entries.length){document.getElementById('vo-target-project').dataset.snapshot=JSON.stringify(snapshot);updateTarget();}
  }
  function updateTarget(){const entry=targets().find(item=>item.key===document.getElementById('vo-target-project').value),select=document.getElementById('vo-target-shot');if(!entry){select.innerHTML='';return;}select.innerHTML=entry.context.e.productionShots.map(shot=>`<option value="${E(shot.id)}" ${shot.direction?.locked?'disabled':''}>${E((shot.title||shot.intent||'镜头')+(shot.direction?.locked?' · 已锁定':''))}</option>`).join('');}
  async function run(action,node){
    const value=current();
    if(action==='sample'){H.write({description:sampleDescription,auditionText:M.auditionText,text:M.sampleText,mode:'character',source:null});await recommend();return;}
    if(action==='example'){const examples={girl:sampleDescription,boy:'自然松弛的青年男生，准备离开生活多年的城市，和朋友告别时故作轻松。',narrator:'温柔的故事讲述者，讲述一段雨夜重逢的爱情故事，自然、有陪伴感。'};write({description:examples[node.dataset.value],mode:node.dataset.value==='narrator'?'narration':'character',source:null});return;}
    if(action==='mode'){write({mode:node.dataset.value});return;}
    if(action==='recommend'){await recommend();return;}
    if(action==='group'){write({groupId:node.dataset.id});return;}
    if(action==='play'){const entry=group(value),item=entry?.voices.find(voice=>voice.id===node.dataset.id)||value.versions.find(version=>version.id===node.dataset.id);if(!item)throw Error('试听版本不存在。');await play(item,item.id);return;}
    if(action==='play-selected'){await play(value.selectedVoice,'selected');return;}
    if(action==='choose'){const entry=group(value),voice=entry?.voices.find(item=>item.id===node.dataset.id);if(!voice)throw Error('声音候选已不存在。');choose(voice,entry.source);return;}
    if(action==='continue'||action==='step'){const step=action==='continue'?2:Number(node.dataset.step);if(step===2&&!value.selectedVoice)throw Error('请先选择声音。');write({step});return;}
    if(action==='direct'){direct();return;}
    if(action==='use-preset'){const preset=M.presets.find(item=>item.key===node.dataset.key);if(!preset)throw Error('声音预设已不存在。');const voice=M.voice(preset,Site.id);voice.src='assets/voiceover/'+preset.key+'-audition.mp3';voice.duration=await metadata(voice.src);Site.close();choose(voice,value.source);write({step:2});return;}
    if(action==='use-saved'){const saved=savedVoices().find(item=>item.key===node.dataset.key);if(!saved)throw Error('保存的声音已不存在。');Site.close();choose(saved.voice,saved.source);write({step:2});return;}
    if(action==='sample-text'){write({text:M.sampleText,performance:'',rate:1});return;}
    if(action==='import-text'){importText();return;}
    if(action==='confirm-text'){const entry=textSources().find(item=>item.key===document.getElementById('vo-text-source').value);if(!entry)throw Error('来源文本已不存在。');if(entry.text.length>2000)throw Error('本工具一次支持 2000 字，请直接粘贴需要配音的片段。');if(value.text.trim()&&!window.confirm('用所选文本替换当前输入？已生成的配音版本会保留。'))return;Site.close();write({text:entry.text,textOrigin:entry.label});return;}
    if(action==='generate'){
      status('正在生成这段配音…');const next=M.generate(value,Site.id),version=next.versions[0],preset=M.presets.find(item=>item.key===version.voice.presetKey);
      if(version.text===M.sampleText&&!version.performance&&version.rate===1&&preset&&JSON.stringify(version.voice.profile)===JSON.stringify({engineId:preset.engineId,pitch:preset.pitch,rate:preset.rate})){version.src='assets/voiceover/'+preset.key+'-take.mp3';version.duration=await metadata(version.src);}
      write({versions:next.versions,previewId:next.previewId});status(version.src?'配音示例已准备，请试听后采用。':'已准备系统语音试听；表演要求已记录，AI 情绪合成待接入。');return;
    }
    if(action==='version'){write({previewId:node.dataset.id});return;}
    if(action==='keep'){write(M.keep(value,node.dataset.id));return;}
    if(action==='save-profile'){const saved=H.store.save('voiceover',M.profileSnapshot(value));Site.toast('声音已保存为「'+saved.title+'」，可从直接配音入口继续使用。');return;}
    if(action==='attach-profile'){await H.attachProfile(M.profileSnapshot(value));Site.toast('声音已关联原角色，后续可从已有声音中选用。');return;}
    if(action==='save-take'){const saved=H.store.save('voiceover',M.snapshot(value));Site.toast('已保存已采用配音 v'+saved.version+'。');return;}
    if(action==='download'){await H.download(M.snapshot(value));return;}
    if(action==='bring'){bring(M.snapshot(value));return;}
    if(action==='confirm-bring'){const project=document.getElementById('vo-target-project'),entry=targets().find(item=>item.key===project.value),shotId=document.getElementById('vo-target-shot').value;if(!entry||!shotId)throw Error('请选择可编辑的目标镜头。');await H.bring(entry,shotId,JSON.parse(project.dataset.snapshot));Site.close();Site.toast('已加入配音候选，请在整集制作中试听、替换。');return;}
  }
  async function download(snapshot){
    if(snapshot.toolId!=='voiceover'||!snapshot.voiceover)return false;
    const audio=snapshot.audio;
    if(audio.src){const response=await fetch(audio.src);if(!response.ok)throw Error('音频下载失败，请重试。');Site.download(await response.blob(),snapshot.title.replace(/[<>:"/\\|?*]/g,'_')+'.mp3');}
    else Site.download(new Blob([ToolAudio.voiceHtml(audio)],{type:'text/html;charset=utf-8'}),snapshot.title+'-离线试听.html');
    return true;
  }
  function init(helpers){
    H=helpers;window.addEventListener('hashchange',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-vo]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;const original=node.innerHTML,loading=['recommend','generate','sample'].includes(node.dataset.vo);node.disabled=true;try{if(loading){node.textContent=node.dataset.vo==='generate'?'正在生成这段配音…':'正在准备 3 个声音试听…';document.querySelector('.vo-workbench')?.setAttribute('aria-busy','true');}await run(node.dataset.vo,node);}catch(error){H.notice(error);const statusNode=document.getElementById('vo-bring-status');if(statusNode)statusNode.textContent=error.message;}finally{busy=false;document.querySelector('.vo-workbench')?.setAttribute('aria-busy','false');if(node.isConnected){node.disabled=false;if(loading)node.innerHTML=original;}}},true);
    document.addEventListener('input',event=>{const input=event.target,mapping={'vo-description':'description','vo-audition':'auditionText','vo-text':'text','vo-performance':'performance','vo-name':'voiceName'},key=mapping[input.id];if(!key)return;event.stopImmediatePropagation();try{H.write({[key]:input.value});if(key==='description')document.getElementById('vo-recommend').disabled=!input.value.trim();if(key==='text')document.getElementById('vo-generate').disabled=!input.value.trim();status(key==='text'||key==='performance'?'输入已保存，修改后请重新生成；已采用版保留。':'输入已保存。');}catch(error){H.notice(error);}},true);
    document.addEventListener('change',event=>{const node=event.target;if(!['vo-source','vo-rate','vo-target-project'].includes(node.id))return;event.stopImmediatePropagation();try{if(node.id==='vo-rate'){H.write({rate:Number(node.value)});status('语速已修改，重新生成后生效。');}else if(node.id==='vo-target-project')updateTarget();else{const source=sources().find(item=>item.key===node.value);write({source:M.source({source}),description:source?[source.name,source.description].filter(Boolean).join('；').slice(0,2000):'',selectedVoice:null});}}catch(error){H.notice(error);}},true);
  }
  window.ToolVoiceover={init,render,snapshot:value=>M.snapshot(value),download,sources,textSources,stop};
})();
