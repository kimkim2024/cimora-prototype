(function(root){
  'use strict';
  function render(plan,seconds=plan.duration,rate=22050){
    if(plan.kind!=='sound'||!Number.isFinite(seconds)||seconds<.5||seconds>60||!Number.isFinite(rate)||rate<8000||rate>48000)throw Error('声音参数或时长无效。');
    const length=Math.round(seconds*rate),output=new Float32Array(length),layers=plan.layers||[],distance=Number(plan.distance)||0,gain=Number(plan.gain)||.8,pace=Number(plan.pace)||1;
    let seed=Number(plan.seed)||17,low=0,previous=0;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
    const pulse=(time,at,decay)=>time>=at?Math.exp(-(time-at)*decay):0;
    for(let index=0;index<length;index++){
      const time=index/rate,noise=random();low=low*.98+noise*.02;let value=0;
      for(let layerIndex=0;layerIndex<layers.length;layerIndex++){
        const layer=layers[layerIndex],at=.12+layerIndex*Math.min(.6,seconds*.12),age=time-at;let sound=0;
        if(layer.type==='rain')sound=noise*.18+low*.8;
        if(layer.type==='wind')sound=low*1.8*(.65+.3*Math.sin(2*Math.PI*time/seconds*2));
        if(layer.type==='forest'){const beat=time%2.7,chirp=Math.max(0,Math.sin(beat*9))*pulse(beat,.12,3);sound=low*.8+Math.sin(2*Math.PI*(2200*time+80*Math.sin(time*12)))*chirp*.1;}
        if(layer.type==='room')sound=low*(1+.35*Math.sin(time*11))*.8+Math.sin(time*2*Math.PI*135)*Math.sin(time*4)*.012;
        if(layer.type==='steps'){
          const step=time%( .65/pace),envelope=Math.exp(-step*32)*Math.min(1,step*220),motion=plan.motion==='approach'?.2+.8*time/seconds:plan.motion==='depart'?1-.8*time/seconds:1;
          sound=(noise*.4+Math.sin(time*2*Math.PI*82)*.18)*envelope*motion*(plan.stopAtEnd&&time>seconds*.78?0:1);
        }
        if(layer.type==='sword'&&age>=0)sound=(noise*.22+Math.sin(2*Math.PI*(1700*age+850*age*age))*.2)*pulse(time,at,7)*Math.min(1,age*200);
        if(layer.type==='magic'&&age>=0)sound=(noise*.13+Math.sin(2*Math.PI*(300*age+900*age*age))*.22+Math.sin(age*2*Math.PI*900)*.08)*pulse(time,at,2.7)*Math.min(1,age*20);
        if(layer.type==='door'&&age>=0)sound=(noise*.22+Math.sin(age*2*Math.PI*65)*.35)*pulse(time,at,16)*Math.min(1,age*100);
        if(layer.type==='notify'&&age>=0){const second=age-.2;sound=Math.sin(age*2*Math.PI*880)*pulse(time,at,15)*.2+(second>0?Math.sin(second*2*Math.PI*1174.66)*Math.exp(-second*9)*.2:0);}
        value+=sound*(Number(layer.level)||0);
      }
      previous=previous*(.15+distance*.6)+value*(.85-distance*.6);output[index]=previous*gain*(1-distance*.4);
    }
    const delay=Math.round(rate*(.065+distance*.08)),echo=Number(plan.reverb)||0;
    for(let index=length-1;index>=0;index--)if(index>=delay)output[index]+=output[index-delay]*echo;
    for(let index=0;index<length;index++){
      const fade=plan.loop?1:Math.max(0,Math.min(1,index/(rate*.015),(length-1-index)/(rate*.15)));
      output[index]=Math.tanh(output[index]*1.8)*fade;
    }
    if(plan.loop){const overlap=Math.min(Math.round(rate*.06),length>>2),first=output[0];for(let index=0;index<overlap;index++){const mix=(index+1)/overlap;output[length-overlap+index]=output[length-overlap+index]*(1-mix)+first*mix;}}
    return output;
  }
  const api={render};if(typeof module!=='undefined')module.exports=api;else root.ToolSoundRenderer=api;
})(typeof window==='undefined'?globalThis:window);
