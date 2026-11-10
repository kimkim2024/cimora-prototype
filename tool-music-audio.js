(()=>{
  'use strict';
  const workerURL=new URL('tool-music-worker.js?v=20261109-sound1',document.currentScript.src).href;
  const cache=new Map(),jobs=new Set();let context,source,gain,progressTimer=null,token=0,started=0,playing='';
  function data(plan,duration=plan.duration){
    const key=JSON.stringify({...plan,duration});if(cache.has(key)){const result=cache.get(key);cache.delete(key);cache.set(key,result);return Promise.resolve(result);}
    return new Promise((resolve,reject)=>{
      let worker,timeout,fallback,finished=false;
      const job={cancel:()=>finish(Error('已取消音频准备。'))};
      function finish(error,result){if(finished)return;finished=true;clearTimeout(timeout);clearTimeout(fallback);worker?.terminate();jobs.delete(job);if(error){reject(error);return;}cache.set(key,result);while(cache.size>3)cache.delete(cache.keys().next().value);resolve(result);}
      jobs.add(job);
      try{worker=new Worker(workerURL);worker.onmessage=event=>event.data.error?finish(Error(event.data.error)):finish(null,new Float32Array(event.data.buffer));worker.onerror=()=>finish(Error('音频准备失败，请重试。'));timeout=setTimeout(()=>finish(Error('音频准备超时，请重试。')),30000);worker.postMessage({plan,duration,rate:22050});}
      catch{fallback=setTimeout(()=>{try{finish(null,(plan.kind==='sound'?ToolSoundRenderer:ToolMusicRenderer).render(plan,duration,22050));}catch(error){finish(error);}},0);}
    });
  }
  function stop(){token++;if(progressTimer)clearInterval(progressTimer);progressTimer=null;if(source){try{source.stop();}catch{}source.disconnect();source=null;}gain?.disconnect();gain=null;playing='';}
  function release(){stop();for(const job of Array.from(jobs))job.cancel();cache.clear();const previous=context;context=null;if(previous&&previous.state!=='closed')previous.close().catch(()=>{});}
  async function play(plan,duration,key,onProgress=()=>{},onEnd=()=>{}){
    if(playing===key){stop();onEnd();return;}
    stop();const revision=token,Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('当前浏览器不支持音频，请使用新版 Chrome 或 Edge。');
    context||=new Audio();await context.resume();const samples=await data(plan,duration);if(revision!==token)return;
    const buffer=context.createBuffer(1,samples.length,22050);buffer.copyToChannel(samples,0);source=context.createBufferSource();gain=context.createGain();source.buffer=buffer;source.loop=!!plan.loop;gain.gain.value=.75;source.connect(gain);gain.connect(context.destination);playing=key;started=context.currentTime;const audioSource=source;
    source.onended=()=>{if(revision===token){source=null;playing='';if(progressTimer)clearInterval(progressTimer);progressTimer=null;audioSource.disconnect();onEnd();}};
    source.start();onProgress(0,duration);progressTimer=setInterval(()=>{if(revision===token&&context)onProgress((context.currentTime-started)%duration,duration);},120);
  }
  async function wav(plan,duration=plan.duration){return new Blob([ToolAudio.wav(await data(plan,duration),22050)],{type:'audio/wav'});}
  window.ToolMusicAudio={data,play,stop,release,wav,get playing(){return playing;}};
})();
