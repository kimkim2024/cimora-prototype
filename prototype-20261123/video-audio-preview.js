/* Demo sound renderer. Production candidates can replace these local sources with audio URLs. */
window.VideoAudioPreview = (() => {
  function samples(candidate, seconds = 16, rate = 22050) {
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
    let context, musicSource, musicGain, musicKey='', voiceKey='', previewId='', generation=0;
    const buffers = new Map();
    const speech=window.speechSynthesis;
    function unlock() {
      const Audio=window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw Error('当前浏览器不支持声音试听，请使用新版 Chrome 或 Edge。');
      context ||= new Audio();
      if (context.state==='suspended') context.resume().catch(()=>onStatus('', '声音播放被浏览器阻止，请再次点击试听。'));
      return context;
    }
    function stopMusic() { if(musicSource) {try{musicSource.stop();}catch{}musicSource.disconnect();} musicSource=null;musicGain?.disconnect();musicGain=null;musicKey=''; }
    function stop() { generation++;speech?.cancel();voiceKey='';stopMusic();if(previewId){previewId='';onStatus('','已停止试听');} }
    function say(input, volume, key, onEnd) {
      if (!speech || !window.SpeechSynthesisUtterance) throw Error('当前浏览器不支持对白试听。');
      speech.cancel();
      const utterance=new SpeechSynthesisUtterance(input.text);
      utterance.lang='zh-CN';
      const voices=speech.getVoices(), chinese=voices.filter(v=>/^zh[-_]/i.test(v.lang));
      const tone=input.voice?.tone || '';
      utterance.voice=chinese.find(v=>/男|低沉|沉稳/.test(tone) ? /yunxi|kangkang|male/i.test(v.name) : /xiaoxiao|huihui|female/i.test(v.name)) || chinese[0] || null;
      utterance.rate=Number(input.voice?.rate) || 1;
      utterance.pitch=/低|沉稳/.test(tone) ? .8 : /明亮|清澈|少女/.test(tone) ? 1.15 : 1;
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
      musicSource.buffer=buffers.get(key);musicSource.loop=loop;musicGain.gain.value=volume;
      musicSource.connect(musicGain);musicGain.connect(audio.destination);musicKey=key;
      musicSource.start(0,Math.max(0,offset)%musicSource.buffer.duration);
      return musicSource;
    }
    function preview(candidate) {
      if(previewId===candidate.id){stop();return;}
      stop();previewId=candidate.id;const token=generation;
      onStatus(previewId,'正在试听');
      try {
        if(candidate.kind==='voice') say(candidate.input,.9,candidate.id,()=>{previewId='';onStatus('','试听结束');});
        else {const source=music(candidate,.6,0,false);source.onended=()=>{if(token===generation){previewId='';onStatus('','试听结束');}};}
      } catch(error){stop();throw error;}
    }
    function sync(position, audioRows, musicRow, mix) {
      const active=audioRows.find(row=>!row.linked && row.candidate && position>=row.start && position<row.end);
      if(active && voiceKey!==active.id) {
        // Browser speech is a timing approximation; production plays the adopted audio file at its trim offset.
        const ratio=(active.in+position-active.start)/Math.max(.1,active.sourceDuration);
        const text=active.text.slice(Math.min(active.text.length-1,Math.floor(active.text.length*ratio)));
        say({...active.candidate.input,text},active.volume/100,active.id);
      } else if(!active && voiceKey) {speech?.cancel();voiceKey='';}
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
