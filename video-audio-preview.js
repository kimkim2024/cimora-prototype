/* Demo sound renderer. Production candidates can replace these local sources with audio URLs. */
window.VideoAudioPreview = (() => {
  function samples(candidate, seconds = 16, rate = 22050) {
    if(candidate.effectPlan&&window.ToolSoundRenderer)return ToolSoundRenderer.render(candidate.effectPlan,arguments.length>1?seconds:candidate.duration,rate);
    if(candidate.musicPlan&&window.ToolMusicRenderer)return ToolMusicRenderer.render(candidate.musicPlan,arguments.length>1?seconds:candidate.duration,rate);
    const prompt = candidate.prompt || candidate.title || '';
    const mood = candidate.mood || (/悬疑/.test(prompt) ? '悬疑氛围' : /温暖|轻快|明亮/.test(prompt) ? '温暖日常' : '雨夜钢琴');
    let seed = Number(candidate.seed) || 1;
    for (const char of prompt) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
    const minor = mood !== '温暖日常';
    const scale = minor ? [0,2,3,7,10,7,3,2] : [0,4,7,9,12,9,7,4];
    const root = 48 + seed % 5;
    const beat = mood === '悬疑氛围' ? .5 : mood === '温暖日常' ? .4 : .8;
    const output = new Float32Array(Math.round(seconds * rate));
    const chords = minor ? [0,5,3,7] : [0,5,7,0];
    for (let n=0;n<output.length;n++) {
      const t=n/rate, step=Math.floor(t/beat), age=t%beat;
      const chord=chords[Math.floor(t/4)%4], degree=scale[(step+seed)%scale.length];
      const hz=440*Math.pow(2,(root+12+degree+chord-69)/12);
      const env=(1-Math.exp(-age*65))*Math.exp(-age*4.8);
      const piano=(Math.sin(t*hz*Math.PI*2)+.25*Math.sin(t*hz*Math.PI*4))*env;
      const bassHz=440*Math.pow(2,(root+chord-69)/12);
      const pad=(Math.sin(t*bassHz*Math.PI*2)+.4*Math.sin(t*bassHz*1.5*Math.PI*2))*.18;
      const fade=Math.min(1,t/.08,(seconds-t)/.08);
      output[n]=(piano*.17+pad*.16)*Math.max(0,fade);
    }
    return output;
  }
  function create(onStatus = () => {}) {
    let context, musicSource, musicGain, voiceAudio, musicKey='', voiceKey='', previewId='', generation=0;
    const buffers = new Map();
    const effects = new Map();
    const speech=window.speechSynthesis;
    function unlock() {
      const Audio=window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw Error('当前浏览器不支持声音试听，请使用新版 Chrome 或 Edge。');
      context ||= new Audio();
      if (context.state==='suspended') context.resume().catch(()=>onStatus('', '声音播放被浏览器阻止，请再次点击试听。'));
      return context;
    }
    function stopMusic() { if(musicSource) {try{musicSource.stop();}catch{}musicSource.disconnect();} musicSource=null;musicGain?.disconnect();musicGain=null;musicKey=''; }
    function stopVoice() { speech?.cancel();if(voiceAudio){voiceAudio.pause();voiceAudio=null;}voiceKey=''; }
    function stopEffect(id) {const value=effects.get(id);if(!value)return;try{value.source.stop();}catch{}value.source.disconnect();value.gain.disconnect();effects.delete(id);}
    function stop() { generation++;stopVoice();stopMusic();for(const id of effects.keys())stopEffect(id);if(previewId){previewId='';onStatus('','已停止试听');} }
    function recorded(candidate, volume, offset=0, onEnd) {
      stopVoice();voiceAudio=new Audio(candidate.audioSrc);voiceAudio.volume=Math.max(0,Math.min(1,volume));
      const token=generation;voiceKey=candidate.id;
      voiceAudio.onloadedmetadata=()=>{if(token===generation&&voiceAudio)voiceAudio.currentTime=Math.min(offset,Math.max(0,voiceAudio.duration-.05));};
      voiceAudio.onended=()=>{if(token===generation)onEnd?.();};
      voiceAudio.onerror=()=>{if(token===generation)onStatus('','配音文件读取失败，请重新试听。');};
      voiceAudio.play().catch(()=>{if(token===generation)onStatus('','配音播放被阻止，请重新点击试听。');});
    }
    function say(input, volume, key, onEnd) {
      if (!speech || !window.SpeechSynthesisUtterance) throw Error('当前浏览器不支持对白试听。');
      speech.cancel();
      const utterance=new SpeechSynthesisUtterance(input.text);
      utterance.lang='zh-CN';
      const voices=speech.getVoices(), chinese=voices.filter(v=>/^zh[-_]/i.test(v.lang));
      const tone=input.voice?.tone || '';
      const engine=input.voice?.engineId;
      utterance.voice=(engine?voices.find(v=>v.voiceURI===engine||v.name.includes(engine)):null)||chinese.find(v=>/男|低沉|沉稳/.test(tone) ? /yunxi|kangkang|male/i.test(v.name) : /xiaoxiao|huihui|female/i.test(v.name)) || chinese[0] || null;
      utterance.rate=Number(input.voice?.rate) || 1;
      utterance.pitch=input.voice?.pitch||(/低|沉稳/.test(tone) ? .8 : /明亮|清澈|少女/.test(tone) ? 1.15 : 1);
      utterance.volume=Math.max(0,Math.min(1,volume));
      const token=generation;
      utterance.onend=()=>{if(token===generation)onEnd?.();};
      utterance.onerror=event=>{if(token===generation && !['interrupted','canceled'].includes(event.error))onStatus('', '对白试听不可用，请检查系统中文语音。');};
      voiceKey=key;speech.speak(utterance);
    }
    function music(candidate, volume, offset=0, loop=true) {
      const audio=unlock(),key=candidate.id || candidate.title;
      if(!buffers.has(key)) {const data=samples(candidate),buffer=audio.createBuffer(1,data.length,22050);buffer.copyToChannel(data,0);buffers.set(key,buffer);if(buffers.size>8)buffers.delete(buffers.keys().next().value);}
      stopMusic();musicSource=audio.createBufferSource();musicGain=audio.createGain();
      musicSource.buffer=buffers.get(key);musicSource.loop=loop&&(candidate.effectPlan?!!candidate.effectPlan.loop:candidate.musicPlan?!!candidate.musicPlan.loop:true);musicGain.gain.value=volume;
      musicSource.connect(musicGain);musicGain.connect(audio.destination);musicKey=key;
      musicSource.start(0,musicSource.loop?Math.max(0,offset)%musicSource.buffer.duration:Math.min(Math.max(0,offset),musicSource.buffer.duration));
      return musicSource;
    }
    function preview(candidate) {
      if(previewId===candidate.id){stop();return;}
      stop();previewId=candidate.id;const token=generation;
      onStatus(previewId,'正在试听');
      try {
        if(candidate.kind==='voice'&&candidate.audioSrc) recorded(candidate,.9,0,()=>{previewId='';onStatus('','试听结束');});
        else if(candidate.kind==='voice') say(candidate.input,.9,candidate.id,()=>{previewId='';onStatus('','试听结束');});
        else {const source=music(candidate,.6,0,false);source.onended=()=>{if(token===generation){previewId='';onStatus('','试听结束');}};}
      } catch(error){stop();throw error;}
    }
    function sync(position, audioRows, musicRow, mix, effectRows=[]) {
      const audible=effectRows.filter(row=>position>=row.start&&position<row.end);
      for(const id of effects.keys())if(!audible.some(row=>row.id===id))stopEffect(id);
      for(const row of audible){
        const active=effects.get(row.id),offset=row.in+position-row.start;
        if(active&&active.candidateId===row.candidate.id&&Math.abs(active.offset+(context.currentTime-active.started)-offset)<.4){active.gain.gain.setTargetAtTime(row.volume/100,context.currentTime,.05);continue;}
        stopEffect(row.id);const audio=unlock(),key=row.candidate.id;
        if(!buffers.has(key)){const data=samples(row.candidate),buffer=audio.createBuffer(1,data.length,22050);buffer.copyToChannel(data,0);buffers.set(key,buffer);if(buffers.size>8)buffers.delete(buffers.keys().next().value);}
        const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffers.get(key);source.loop=!!row.candidate.effectPlan.loop;gain.gain.value=row.volume/100;source.connect(gain);gain.connect(audio.destination);
        effects.set(row.id,{source,gain,candidateId:key,offset,started:audio.currentTime});source.start(0,source.loop?offset%source.buffer.duration:Math.min(offset,source.buffer.duration));
      }
      const active=audioRows.find(row=>!row.linked && row.candidate && position>=row.start && position<row.end);
      if(active && voiceKey!==active.id) {
        // Browser speech is a timing approximation; production plays the adopted audio file at its trim offset.
        const ratio=(active.in+position-active.start)/Math.max(.1,active.sourceDuration);
        const text=active.text.slice(Math.min(active.text.length-1,Math.floor(active.text.length*ratio)));
        if(active.candidate.audioSrc)recorded({...active.candidate,id:active.id},active.volume/100,active.in+position-active.start);
        else say({...active.candidate.input,text},active.volume/100,active.id);
      } else if(!active && voiceKey) stopVoice();
      if(musicRow && position>=musicRow.start && position<musicRow.end) {
        const candidate=musicRow.candidate || {id:musicRow.title,title:musicRow.title,mood:musicRow.title,seed:1};
        const volume=musicRow.volume/100*(mix.duck && active ? .35 : 1);
        if(musicKey!==(candidate.id || candidate.title)) music(candidate,volume,position-musicRow.start,true);
        else musicGain?.gain.setTargetAtTime(volume,context.currentTime,.08);
      } else if(musicSource)stopMusic();
    }
    return {unlock,stop,preview,sync,get previewId(){return previewId;}};
  }
  return {create,samples};
})();
