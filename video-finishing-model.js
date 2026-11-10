window.createVideoFinishingModel = function(model, site) {
  const board = model.videoStoryboard;
  const copy = model.clone;
  function raw(context) {
    const workspace = board.state(context);
    workspace.finishing ||= { voices: {}, episodes: {} };
    return workspace.finishing;
  }
  function state(context) {
    const episodeId = board.state(context).selectedEpisodeId;
    const episode = raw(context).episodes[episodeId] ||= { clips: {}, order: [], sounds: {}, mix: { music: '不使用配乐', originalVolume: 80, voiceVolume: 90, musicVolume: 25, duck: true }, versions: [] };
    return episode;
  }
  function save(context, action) {
    const before = copy(context.e);
    try { return model.videoWorkspace.save(context, () => { action(); const episode = state(context); episode.stale = !!episode.versions.length && episode.versions[0].signature !== signature(context); }); }
    catch (error) { for (const key of Object.keys(context.e)) delete context.e[key]; Object.assign(context.e, before); throw error; }
  }
  function shot(context, shotId, edit = false) {
    const value = board.shots(context).find(item => item.id === shotId);
    if (!value) throw Error('没有找到本集分镜。');
    if (edit && value.direction.locked) throw Error('分镜已锁定，请先解锁。');
    return value;
  }
  function voiceProfile(context, assetId) { return raw(context).voices[assetId] || { tone: '自然叙述', rate: 1 }; }
  function voice(context, assetId, values) {
    if (!board.state(context).assets.some(asset => asset.id === assetId && asset.kind === '人物')) throw Error('请选择本工程人物。');
    const rate = Number(values.rate);
    if (!Number.isFinite(rate) || rate < 0.5 || rate > 2 || !String(values.tone || '').trim()) throw Error('请填写音色，语速需在 0.5 到 2 之间。');
    save(context, () => { raw(context).voices[assetId] = { tone: String(values.tone).trim(), rate }; });
  }
  function soundVoice(context, value) {
    const profile = value.speakerId ? voiceProfile(context,value.speakerId) : {tone:'自然旁白',rate:1};
    return {tone:value.tone || profile.tone, rate:Number(value.rate || profile.rate),...(value.engineId?{engineId:value.engineId,pitch:value.pitch||1}:{})};
  }
  function soundSignature(context, value) { return JSON.stringify({ mode: value.mode, speakerId: value.speakerId, text: value.text, effect: value.effect, voice: soundVoice(context,value) }); }
  function sound(context, shotId) {
    const current = shot(context, shotId);
    const value = state(context).sounds[shotId] || { mode: current.dialogue ? 'embedded' : 'off', speakerId: '', text: current.dialogue || '', effect: current.soundDirection || '', task: null };
    return { ...value, stale: !!value.task && value.task.signature !== soundSignature(context, value) };
  }
  function shotSound(context, shotId, values) {
    shot(context, shotId, true);
    save(context, () => {
      const value = { ...sound(context, shotId), ...values };
      delete value.stale;
      if (!['embedded','separate','off'].includes(value.mode)) throw Error('请选择有效配音方式。');
      if (value.speakerId && !board.state(context).assets.some(asset => asset.id === value.speakerId && asset.kind === '人物')) throw Error('配音角色不属于当前工程。');
      if ('rate' in values && (!Number.isFinite(Number(value.rate)) || Number(value.rate)<0.5 || Number(value.rate)>2)) throw Error('语速需在 0.5 到 2 之间。');
      if (value.mode !== 'separate') value.task = null;
      state(context).sounds[shotId] = value;
    });
  }
  function prepareVoice(context, shotId) {
    shot(context, shotId, true);
    save(context, () => {
      const value = sound(context, shotId);
      if (value.mode !== 'separate') throw Error('请选择独立配音后再准备。');
      if (!value.text.trim()) throw Error('请填写配音文案。');
      state(context).sounds[shotId] = { ...value, task: { id: site.id('voice-demo'), prototype: true, text: value.text, voice: copy(soundVoice(context,value)), signature: soundSignature(context, value), label: '配音方案已准备 · 未合成音频' } };
    });
  }
  function library(context) {
    return state(context).audioLibrary ||= {voices:{},music:[]};
  }
  function voiceCandidates(context, shotId) { shot(context,shotId); return library(context).voices[shotId] || []; }
  function effectCandidates(context, shotId) { shot(context,shotId); return library(context).effects?.[shotId] || []; }
  function importEffect(context, shotId, snapshot) {
    shot(context,shotId,true);
    const value=snapshot.sound,plan=value?.plan,duration=Number(value?.duration);
    if(snapshot.toolId!=='sound-effects'||!value?.versionId||plan?.kind!=='sound'||plan.schema!==1||!Number.isFinite(duration)||duration<.5||duration>60||!['environment','action'].includes(value.category)||!Array.isArray(plan.layers)||!plan.layers.length)throw Error('请从环境音与音效工具带入已采用的声音。');
    const existing=effectCandidates(context,shotId).find(item=>item.toolVersionId===value.versionId);
    if(existing)return existing;
    let candidate;
    save(context,()=>{
      const effects=library(context).effects ||= {},list=effects[shotId] ||= [];
      candidate={id:site.id('effect-candidate'),version:list.length+1,kind:'effect',title:snapshot.title,prompt:snapshot.prompt,duration,category:value.category,effectPlan:copy({...plan,duration,loop:value.category==='environment'&&!!value.loop}),toolVersionId:value.versionId,prototype:true,createdAt:new Date().toISOString()};
      list.unshift(candidate);
    });
    return candidate;
  }
  function adoptEffect(context, shotId, candidateId) {
    shot(context,shotId,true);
    save(context,()=>{
      const candidate=effectCandidates(context,shotId).find(item=>item.id===candidateId);
      if(!candidate)throw Error('没有找到本镜声音候选。');
      const adopted=state(context).effectAdopted ||= {};
      (adopted[shotId] ||= {})[candidate.category]=candidate.id;
    });
  }
  function effectRows(context) {
    const episode=state(context),video=rows(context),total=video.at(-1)?.end||0;
    return video.flatMap(row=>Object.entries(episode.effectAdopted?.[row.id]||{}).flatMap(([category,candidateId])=>{
      const candidate=effectCandidates(context,row.id).find(item=>item.id===candidateId);if(!candidate)return [];
      const id='sfx:'+row.id+':'+category,edit=episode.effectClips?.[id]||{},sourceDuration=candidate.duration;
      const begin=Math.max(0,Math.min(edit.in??0,sourceDuration-.1)),start=Math.max(0,Math.min(edit.start??row.start,total-.1));
      const end=Math.max(begin+.1,Math.min(edit.out??Math.min(sourceDuration,row.duration),sourceDuration,begin+total-start));
      return [{id,shotId:row.id,category,candidate:copy(candidate),start,end:start+end-begin,in:begin,out:end,duration:end-begin,sourceDuration,volume:edit.volume??60,linked:false,ready:true}];
    }));
  }
  function effectClip(context, rowId, values) {
    const row=effectRows(context).find(item=>item.id===rowId);if(!row)throw Error('声音片段不属于本集。');
    shot(context,row.shotId,true);
    save(context,()=>{
      const value={start:row.start,in:row.in,out:row.out,volume:row.volume,...values};
      for(const key of ['start','in','out','volume'])value[key]=Number(value[key]);
      if(!Object.values(value).every(Number.isFinite)||value.start<0||value.in<0||value.out>row.sourceDuration||value.out-value.in<.099||value.start+value.out-value.in>(rows(context).at(-1)?.end||0)+.001||value.volume<0||value.volume>100)throw Error('声音区间需在素材和本集时长内，音量为 0 到 100。');
      (state(context).effectClips ||= {})[rowId]=value;
    });
  }
  function removeEffect(context,rowId) {
    const row=effectRows(context).find(item=>item.id===rowId);if(!row)throw Error('声音片段不属于本集。');shot(context,row.shotId,true);
    save(context,()=>{delete state(context).effectAdopted[row.shotId][row.category];delete (state(context).effectClips||{})[rowId];});
  }
  function generateVoice(context, shotId) {
    shot(context,shotId,true);
    let candidate;
    save(context,()=>{
      const value = {...sound(context,shotId),mode:'separate'};
      if (!value.text.trim()) throw Error('请先填写对白文案。');
      const candidates = library(context).voices[shotId] ||= [];
      candidate = {id:site.id('voice-candidate'),version:candidates.length+1,kind:'voice',prototype:true,
        input:{mode:'separate',speakerId:value.speakerId,text:value.text,effect:value.effect,voice:copy(soundVoice(context,value))},
        signature:soundSignature(context,value),createdAt:new Date().toISOString(),label:'对白配音',preview:'browser-speech'};
      candidates.unshift(candidate);
    });
    return candidate;
  }
  function adoptVoice(context, shotId, candidateId) {
    shot(context,shotId,true);
    save(context,()=>{
      const candidate = voiceCandidates(context,shotId).find(value=>value.id===candidateId);
      if (!candidate) throw Error('没有找到本镜的配音候选。');
      const input = candidate.input;
      if (input.speakerId && !board.state(context).assets.some(asset=>asset.id===input.speakerId && asset.kind==='人物')) throw Error('候选使用的人物已不存在。');
      const value = {mode:'separate',speakerId:input.speakerId,text:input.text,effect:input.effect,tone:input.voice.tone,rate:input.voice.rate,...(input.voice.engineId?{engineId:input.voice.engineId,pitch:input.voice.pitch||1}:{})};
      value.task = {id:candidate.id,candidateId:candidate.id,prototype:true,text:input.text,voice:copy(input.voice),signature:soundSignature(context,value),label:`已替换为配音 v${candidate.version} · 本地试听`};
      state(context).sounds[shotId] = value;
    });
  }
  function importVoice(context, shotId, snapshot) {
    shot(context,shotId,true);
    if(snapshot.toolId!=='voiceover'||snapshot.voiceover?.type!=='take'||!snapshot.prompt?.trim()||!snapshot.voiceover.voice?.profile?.engineId)throw Error('请从声音工具带入已采用的配音。');
    const voices=voiceCandidates(context,shotId),existing=voices.find(candidate=>candidate.toolVersionId===snapshot.voiceover.versionId);
    if(existing)return existing;
    let candidate;
    save(context,()=>{
      const origin=snapshot.voiceover.source,voice=snapshot.voiceover.voice,profile=voice.profile;
      const speakerId=origin?.scope==='video'&&origin.projectId===context.p.id&&origin.episodeId===context.c.id&&board.state(context).assets.some(asset=>asset.id===origin.assetId&&asset.kind==='人物')?origin.assetId:'';
      const input={mode:'separate',speakerId,text:snapshot.prompt,effect:'',performance:snapshot.voiceover.performance||'',voice:{tone:voice.name,rate:profile.rate*(snapshot.voiceover.rate||1),engineId:profile.engineId,pitch:profile.pitch}};
      candidate={id:site.id('voice-candidate'),version:voices.length+1,kind:'voice',prototype:true,input,signature:soundSignature(context,{...input,tone:input.voice.tone,rate:input.voice.rate,engineId:profile.engineId,pitch:profile.pitch}),createdAt:new Date().toISOString(),label:'工具配音 · '+snapshot.title,preview:snapshot.audio?.src?'audio-file':'browser-speech',audioSrc:snapshot.audio?.src||'',toolVersionId:snapshot.voiceover.versionId,toolSource:copy(snapshot.voiceover)};
      library(context).voices[shotId]||=[];library(context).voices[shotId].unshift(candidate);
    });
    return candidate;
  }
  function musicDraft(context, values) {
    save(context,()=>{ state(context).musicDraft={prompt:String(values.prompt || '').trim().slice(0,2000)}; });
  }
  function musicCandidates(context) { return library(context).music; }
  function generateMusic(context) {
    let candidate;
    save(context,()=>{
      const prompt = state(context).musicDraft?.prompt || '';
      if (!prompt.trim()) throw Error('请先描述想要的背景音。');
      const candidates = musicCandidates(context);
      const mood = /悬疑|紧张|危险|惊悚/.test(prompt) ? '悬疑氛围' : /轻快|明亮|开心|活泼|温暖/.test(prompt) ? '温暖日常' : '雨夜钢琴';
      candidate={id:site.id('music-candidate'),version:candidates.length+1,kind:'music',prototype:true,prompt,title:`${mood} v${candidates.length+1}`,mood,seed:candidates.length+1,createdAt:new Date().toISOString(),preview:'local-music'};
      candidates.unshift(candidate);
    });
    return candidate;
  }
  function importMusic(context, snapshot) {
    const music=snapshot.music,duration=Number(music?.duration),plan=music?.plan;
    if(snapshot.toolId!=='background-music'||!music?.versionId||!plan||plan.schema!==1||!Number.isFinite(duration)||duration<5||duration>180||!Number.isFinite(plan.bpm)||!Number.isFinite(plan.seed))throw Error('请从背景音乐工具带入已采用的完整配乐。');
    const candidates=musicCandidates(context),existing=candidates.find(value=>value.toolVersionId===music.versionId);
    if(existing)return existing;
    let candidate;
    save(context,()=>{
      candidate={id:site.id('music-candidate'),version:candidates.length+1,kind:'music',prototype:true,prompt:snapshot.prompt,title:snapshot.title,duration,musicPlan:copy({...plan,duration,loop:!!music.loop}),toolVersionId:music.versionId,toolSource:copy(music.source||null),preview:'tool-music',createdAt:new Date().toISOString()};
      musicCandidates(context).unshift(candidate);
    });
    return candidate;
  }
  function adoptMusic(context, candidateId) {
    save(context,()=>{
      const candidate=musicCandidates(context).find(value=>value.id===candidateId);
      if (!candidate) throw Error('没有找到本集背景音候选。');
      state(context).musicAdoptedId=candidate.id;
      state(context).mix.music=candidate.title;
    });
  }
  function rows(context) {
    const episode = state(context);
    const shots = board.shots(context);
    const order = [...episode.order.filter(id => shots.some(value => value.id === id)), ...shots.map(value => value.id).filter(id => !episode.order.includes(id))];
    let start = 0;
    return order.map(id => {
      const current = shots.find(value => value.id === id);
      const trim = episode.clips[id] || { in: 0, out: current.duration, transition: '直接切换' };
      const begin = Math.min(trim.in, Math.max(0, current.duration - 0.1));
      const end = Math.max(begin + 0.1, Math.min(trim.out, current.duration));
      const candidate = current.candidates.find(value => value.id === current.adoptedId);
      const row = { id, shot: current, candidateId: current.adoptedId, image: candidate?.image || '', start, end: start + end - begin, duration: end - begin, in: begin, out: end, transition: trim.transition, sound: sound(context, id) };
      start = row.end;
      return row;
    });
  }
  function clip(context, shotId, values) {
    const current = shot(context, shotId);
    save(context, () => {
      const value = { ...(state(context).clips[shotId] || { in: 0, out: current.duration, transition: '直接切换' }), ...values };
      value.in = Number(value.in); value.out = Number(value.out);
      if (!Number.isFinite(value.in) || !Number.isFinite(value.out) || value.in < 0 || value.out > current.duration || value.out - value.in < 0.1) throw Error('裁切区间需在本镜时长内，至少保留 0.1 秒。');
      if (!['直接切换','淡入淡出'].includes(value.transition)) throw Error('请选择有效衔接方式。');
      state(context).clips[shotId] = value;
    });
  }
  function move(context, shotId, offset) {
    const order = rows(context).map(value => value.id);
    const index = order.indexOf(shotId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= order.length) return;
    save(context, () => { [order[index], order[target]] = [order[target], order[index]]; state(context).order = order; });
  }
  function reorder(context, shotId, beforeId) {
    shot(context, shotId);
    const order = rows(context).map(row => row.id).filter(id => id !== shotId);
    if (beforeId === shotId) return;
    if (beforeId != null && !order.includes(beforeId)) throw Error('目标片段不属于本集。');
    order.splice(beforeId == null ? order.length : order.indexOf(beforeId), 0, shotId);
    save(context, () => { state(context).order = order; });
  }
  function audioRows(context) {
    const video = rows(context), episode = state(context), total = video.at(-1)?.end || 0;
    return video.filter(row => row.sound.mode !== 'off').map(row => {
      const linked = row.sound.mode === 'embedded';
      const edit = linked ? {} : episode.audioClips?.[row.id] || {};
      const sourceDuration = row.shot.duration;
      const begin = Math.max(0, Math.min(edit.in ?? row.in, sourceDuration - 0.1));
      const end = Math.max(begin + 0.1, Math.min(edit.out ?? row.out, sourceDuration));
      const start = Math.max(0, Math.min(edit.start ?? row.start, Math.max(0, total - 0.1)));
      const duration = Math.min(end - begin, total - start);
      const candidate = !linked && voiceCandidates(context,row.id).find(value=>value.id===row.sound.task?.candidateId);
      return { id: row.id, linked, start, end: start + duration, in: begin, out: begin + duration, duration, sourceDuration, volume: edit.volume ?? (linked ? episode.mix.originalVolume : episode.mix.voiceVolume), text: !linked && row.sound.task ? row.sound.task.text : row.sound.text, candidate: candidate ? copy(candidate) : null, voice: row.sound.task?.voice || soundVoice(context,row.sound), ready: linked ? !!row.image : !!row.sound.task && !row.sound.stale };
    });
  }
  function audioClip(context, shotId, values) {
    shot(context, shotId, true);
    const row = audioRows(context).find(value => value.id === shotId);
    if (!row || row.linked) throw Error('视频原声随画面裁切；请在本步的配音与音效中选择独立配音后单独调整。');
    save(context, () => {
      const value = { start: row.start, in: row.in, out: row.out, volume: row.volume, ...values };
      for (const field of ['start', 'in', 'out', 'volume']) value[field] = Number(value[field]);
      const total = rows(context).at(-1)?.end || 0;
      if (![value.start, value.in, value.out].every(Number.isFinite) || value.start < 0 || value.in < 0 || value.out > row.sourceDuration || value.out - value.in < 0.099 || value.start + value.out - value.in > total + 0.001) throw Error('音频区间需在素材和本集时长内，至少保留 0.1 秒。');
      if (!Number.isFinite(value.volume) || value.volume < 0 || value.volume > 100) throw Error('音量需在 0 到 100 之间。');
      state(context).audioClips ||= {};
      state(context).audioClips[shotId] = value;
    });
  }
  function musicRow(context) {
    const episode = state(context), total = rows(context).at(-1)?.end || 0;
    if (!total || episode.mix.music === '不使用配乐') return null;
    const start = Math.max(0, Math.min(episode.musicClip?.start ?? 0, Math.max(0, total - 0.1)));
    const candidate = musicCandidates(context).find(value=>value.id===episode.musicAdoptedId && value.title===episode.mix.music);
    const limit=candidate?.musicPlan&&!candidate.musicPlan.loop?Math.min(total,start+candidate.duration):total;
    const end = Math.max(start + 0.1, Math.min(episode.musicClip?.end ?? total, limit));
    return { id: 'music', start, end, duration: end - start, volume: episode.mix.musicVolume, title: episode.mix.music, candidate:candidate ? copy(candidate) : null };
  }
  function musicClip(context, values) {
    const row = musicRow(context);
    if (!row) throw Error('请先选择背景音乐。');
    save(context, () => {
      const value = { start: row.start, end: row.end, ...values };
      value.start = Number(value.start); value.end = Number(value.end);
      if (![value.start, value.end].every(Number.isFinite) || value.start < 0 || value.end - value.start < 0.099 || value.end > (rows(context).at(-1)?.end || 0) + 0.001) throw Error('背景音区间需在本集时长内，至少保留 0.1 秒。');
      state(context).musicClip = value;
    });
  }
  function mix(context, values) {
    save(context, () => {
      const value = { ...state(context).mix, ...values };
      for (const field of ['originalVolume','voiceVolume','musicVolume']) { value[field] = Number(value[field]); if (!Number.isFinite(value[field]) || value[field] < 0 || value[field] > 100) throw Error('音量需在 0 到 100 之间。'); }
      state(context).mix = value;
    });
  }
  function signature(context) { return JSON.stringify({ clips: rows(context).map(value => ({ id: value.id, candidateId: value.candidateId, version: value.shot.version, in: value.in, out: value.out, transition: value.transition, sound: value.sound, voice: value.sound.speakerId ? voiceProfile(context, value.sound.speakerId) : null })), audio: audioRows(context), effects:effectRows(context), music: musicRow(context), mix: state(context).mix }); }
  function assemble(context) {
    let version;
    save(context, () => {
      const clips = rows(context);
      if (!clips.length || clips.some(value => !value.image)) throw Error('还有分镜未采用结果，请先返回镜头编排。');
      if (clips.some(value => value.sound.mode === 'separate' && (!value.sound.task || value.sound.stale))) throw Error('独立配音方案尚未准备或已更新，请在本步的音频轨道中确认配音。');
      if (clips.some(value => board.stale(value.shot))) throw Error('分镜要求已变化，请先核对并重新采用当前结果。');
      version = { id: site.id('episode-assembly'), prototype: true, signature: signature(context), createdAt: new Date().toISOString(), duration: clips.at(-1).end, clips: copy(clips.map(({ shot: current, ...value }) => value)), audio: copy(audioRows(context)), effects:copy(effectRows(context)), music: copy(musicRow(context)), mix: copy(state(context).mix), label: '整集拼接方案 · 未输出视频或混音' };
      state(context).versions.unshift(version);
    });
    return version;
  }
  model.videoFinishing = { state, voiceProfile, voice, sound, soundVoice, shotSound, prepareVoice, voiceCandidates, generateVoice, importVoice, adoptVoice, effectCandidates,importEffect,adoptEffect,effectRows,effectClip,removeEffect, musicDraft, musicCandidates, generateMusic, importMusic, adoptMusic, rows, clip, move, reorder, audioRows, audioClip, musicRow, musicClip, mix, assemble, signature };
  return model;
};
