(()=>{
  'use strict';
  let player;
  const escape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function samples(kind,prompt='',preset='',seconds=6,rate=22050){
    if(kind==='music')return window.VideoAudioPreview.samples({prompt,mood:preset,seed:1},seconds,rate);
    const output=new Float32Array(Math.round(seconds*rate));let seed=17;
    for(const char of prompt+preset)seed=(seed*31+char.charCodeAt(0))>>>0;
    for(let index=0;index<output.length;index++){
      const time=index/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const noise=seed/4294967296*2-1,fade=Math.max(0,Math.min(1,time/.03,(seconds-time)/.12));
      if(preset==='消息提示'){
        const age=time%2,frequency=age<.18?880:1174.66;
        output[index]=Math.sin(time*frequency*Math.PI*2)*Math.exp(-age*6)*(age<.55?.22:0)*fade;
      }else if(preset==='脚步声'){
        const age=time%.55;output[index]=(noise*.4+Math.sin(time*90*Math.PI*2)*.15)*Math.exp(-age*35)*fade;
      }else output[index]=noise*.15*(.8+.2*Math.sin(time*3))*fade;
    }
    return output;
  }
  function wav(data,rate=22050){
    const buffer=new ArrayBuffer(44+data.length*2),view=new DataView(buffer);
    const put=(offset,text)=>[...text].forEach((char,index)=>view.setUint8(offset+index,char.charCodeAt(0)));
    put(0,'RIFF');view.setUint32(4,36+data.length*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,data.length*2,true);
    for(let index=0;index<data.length;index++)view.setInt16(44+index*2,Math.max(-1,Math.min(1,data[index]))*0x7fff,true);
    return new Uint8Array(buffer);
  }
  function generate(tool,value){
    const kind=tool.id==='voiceover'?'voice':tool.id==='background-music'?'music':'effect';
    const audio={kind,text:value.prompt,preset:value.option,rate:Number(value.rate)||1,prototype:true};
    if(kind!=='voice'){
      const data=wav(samples(kind,value.prompt,value.option));let binary='';
      for(const byte of data)binary+=String.fromCharCode(byte);
      audio.src='data:audio/wav;base64,'+btoa(binary);audio.duration=6;
    }
    return audio;
  }
  function output(audio){
    if(audio.musicPlan&&window.ToolMusic)return ToolMusic.savedOutput(audio);
    if(audio.effectPlan&&window.ToolSound)return ToolSound.savedOutput(audio);
    const voice=audio.kind==='voice';
    return `<div class="ts-audio-result"><span class="ts-audio-icon">♫</span><h3>${escape(audio.preset)}</h3><p>${escape(audio.text)}</p>${voice&&!audio.src?'<div class="ts-actions"><button type="button" class="cm-button primary" data-ts="audio-play">▶ 试听配音</button><button type="button" class="cm-button ghost" data-ts="audio-stop">停止</button></div>':`<audio controls preload="metadata" src="${escape(audio.src)}">当前浏览器不支持声音播放。</audio>`}<p id="ts-audio-status" role="status"></p><small>${voice?audio.src?'真实预置语音示例，可下载 MP3。':'浏览器中文语音试听，音色取决于系统；可下载离线试听页。':'6 秒本地合成示例，可下载 WAV；不是 AI 音乐或真实录音。'}</small></div>`;
  }
  function stop(){player?.stop();player=null;}
  function play(audio){
    stop();
    player=window.VideoAudioPreview.create((id,message)=>{const status=document.getElementById('ts-audio-status');if(status)status.textContent=message;});
    player.preview({id:'tool-voice',kind:'voice',audioSrc:audio.src||'',input:{text:audio.text,voice:{...audio.profile,tone:audio.preset,rate:audio.rate}}});
  }
  function voiceHtml(audio){
    const config=JSON.stringify({engineId:audio.profile?.engineId||'',pitch:audio.profile?.pitch||1,rate:audio.rate||1}).replace(/</g,'\\u003c');
    return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>配音离线试听</title><style>body{font:18px sans-serif;max-width:640px;margin:60px auto;padding:20px;line-height:1.8}p{white-space:pre-wrap}button{padding:12px 20px;margin-right:12px}</style><h1>配音离线试听</h1><p id="text">'+escape(audio.text)+'</p><p>声音：'+escape(audio.preset)+' · 语速：'+audio.rate+'</p><button id="play">试听</button><button id="stop">停止</button><p id="status">系统语音演示，需要中文语音包；未生成 AI 音频文件。</p><script>const config='+config+';const status=document.getElementById("status");const stop=()=>window.speechSynthesis?.cancel();document.getElementById("stop").onclick=stop;document.getElementById("play").onclick=()=>{if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){status.textContent="当前浏览器不支持系统语音";return;}stop();const utterance=new SpeechSynthesisUtterance(document.getElementById("text").textContent);utterance.lang=config.engineId.startsWith("zh-TW")?"zh-TW":"zh-CN";utterance.rate=config.rate;utterance.pitch=config.pitch;const voices=speechSynthesis.getVoices();utterance.voice=voices.find(voice=>config.engineId&&(voice.voiceURI===config.engineId||voice.name.includes(config.engineId)))||voices.find(voice=>voice.lang===utterance.lang)||null;utterance.onerror=()=>{status.textContent="系统语音不可用，请检查中文语音包。";};speechSynthesis.speak(utterance)};window.addEventListener("pagehide",stop);</script></html>';
  }
  window.ToolAudio={samples,wav,generate,output,play,stop,voiceHtml};
})();
