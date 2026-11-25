importScripts('tool-music-renderer.js?v=20261109-music1','tool-sound-renderer.js?v=20261109-sound1');
self.onmessage=event=>{
  try{const renderer=event.data.plan.kind==='sound'?ToolSoundRenderer:ToolMusicRenderer,data=renderer.render(event.data.plan,event.data.duration,event.data.rate);self.postMessage({buffer:data.buffer},[data.buffer]);}
  catch(error){self.postMessage({error:error.message});}
};
