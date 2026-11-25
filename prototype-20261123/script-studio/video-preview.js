/* Display geometry only: never changes project settings or generation history. */
(function(root){
'use strict';
const mediaSizes=new Map();
function geometry(setting='16:9',size={}){
 const parts=String(setting).split(/[:/]/).map(Number);
 const configured=parts.length===2&&parts.every(n=>Number.isFinite(n)&&n>0)?parts[0]/parts[1]:16/9;
 const actual=Number.isFinite(size.width)&&Number.isFinite(size.height)&&size.width>0&&size.height>0;
 const ratio=actual?size.width/size.height:configured;
 const known=[[16/9,'16:9'],[9/16,'9:16'],[1,'1:1']].find(([n])=>Math.abs(n-ratio)<.015);
 const label=known?.[1]||(actual?size.width+':'+size.height:parts.join(':'));
 return {ratio,label,shape:ratio>1.02?'landscape':ratio<.98?'portrait':'square',actual};
}
function fit({ratio,width,height,top=0,padding=50,gap=24}){
 const safeRatio=Number.isFinite(ratio)&&ratio>0?ratio:16/9;
 const available=Math.max(1,Number(width)||1),landscape=safeRatio>1.02;
 // Keep an inspectable image. A narrow work area puts the preview above the prompt.
 const stacked=available<(landscape?920:720);
 const maxHeight=Math.min(820,Math.max(240,(Number(height)||800)-Math.max(180,Number(top)||0)-40));
 const maxColumn=stacked?available:Math.max(1,Math.min((available-gap)*(landscape?.66:.52),available-gap-320));
 const column=Math.min(maxColumn,maxHeight*safeRatio+padding);
 const frameWidth=Math.max(1,Math.min(Math.max(1,column-padding),maxHeight*safeRatio));
 return {stacked,column,frameWidth,frameHeight:frameWidth/safeRatio};
}
function mount(host,setting){
 const layout=host.querySelector('.vp-preview-layout'),frame=layout?.querySelector('.vp-video-preview');
 if(!layout||!frame)return ()=>{};
 const column=layout.querySelector('.vp-preview-column'),video=frame.querySelector('video'),label=column.querySelector('[data-vp-preview-ratio]'),scroll=host.querySelector('.as-plan-scroll');
 let observer,raf=0,disposed=false,last='';
 const source=video?.getAttribute('src');
 function update(){
  raf=0;if(disposed||!layout.isConnected)return;
  const size=video?.videoWidth&&video.videoHeight?{width:video.videoWidth,height:video.videoHeight}:mediaSizes.get(source)||{};
  if(source&&size.width)mediaSizes.set(source,size);
  const g=geometry(setting,size),style=getComputedStyle(column),padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+2;
  // Size for the reading viewport, not the whitespace above the card. This lets
  // portrait video stay large and fully visible after the user reaches it.
  const top=(scroll?.getBoundingClientRect().top||0)+120;
  const f=fit({ratio:g.ratio,width:layout.clientWidth,height:innerHeight,top,padding});
  const key=JSON.stringify([g,f]);if(key===last)return;last=key;
  layout.dataset.previewShape=g.shape;layout.dataset.stacked=String(f.stacked);
  layout.style.setProperty('--vp-preview-column',f.column+'px');
  frame.style.setProperty('--vp-ratio',String(g.ratio));
  frame.style.width=f.frameWidth+'px';frame.style.height=f.frameHeight+'px';
  if(label){label.textContent=g.label+' · '+({landscape:'Landscape',portrait:'Portrait',square:'Square'}[g.shape]);label.title=g.actual?'Fit the original video aspect ratio':'Use the project aspect ratio';}
  column.dataset.actualRatio=String(g.actual);
 }
 function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(update);}
 video?.addEventListener('loadedmetadata',schedule);video?.addEventListener('resize',schedule);
 window.addEventListener('resize',schedule);
 observer=new ResizeObserver(schedule);observer.observe(layout);observer.observe(document.documentElement);
 update();
 return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('resize',schedule);video?.removeEventListener('loadedmetadata',schedule);video?.removeEventListener('resize',schedule);};
}
const api={geometry,fit,mount};if(typeof module!=='undefined')module.exports=api;else root.VideoPreview=api;
})(globalThis);
