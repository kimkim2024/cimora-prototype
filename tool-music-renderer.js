(function(root){
  'use strict';
  function render(plan,seconds=plan.duration||12,rate=22050){
    if(!Number.isFinite(seconds)||seconds<1||seconds>180||!Number.isFinite(rate)||rate<8000||rate>48000)throw Error('音频时长或采样率超出范围。');
    const size=Math.round(seconds*rate),output=new Float32Array(size),loop=!!plan.loop,arrangement=plan.arrangement||'piano',gains={piano:1,strings:1,guitar:1,drums:1,...plan.gains};
    const bpm=Math.max(50,Math.min(140,Number(plan.bpm)||80)),bars=Math.max(2,Math.round(seconds*bpm/240)),barLength=loop?seconds/bars:240/bpm,rootNote=48+(Number(plan.seed)||0)%4;
    const progression=plan.major?[0,5,7,0]:[0,5,3,7],third=plan.major?4:3;
    const phrases=[[12,19,15,14,12,10,7,14],[12,16,19,21,19,16,14,12],[7,12,14,15,19,15,14,10]],melody=phrases[(Number(plan.seed)||0)%phrases.length];
    function note(midi,start,duration,kind,level){
      if(!level||start>=seconds)return;
      const frequency=440*Math.pow(2,(midi-69)/12),length=Math.ceil(duration*rate),offset=Math.round(start*rate);let noise=123+(midi|0);
      for(let index=0;index<length;index++){
        const position=offset+index;if(!loop&&position>=size)break;const age=index/rate,phase=2*Math.PI*frequency*age,attack=Math.min(1,age/.012),release=Math.min(1,(duration-age)/.09);let sample=0;
        if(kind==='pad')sample=(Math.sin(phase)+.3*Math.sin(phase*1.0018)+.18*Math.sin(phase*2))*Math.pow(Math.sin(Math.PI*age/duration),2)*.3;
        else if(kind==='guitar')sample=(Math.sin(phase)+.42*Math.sin(phase*2)+.16*Math.sin(phase*3)+.08*Math.sin(phase*4))*Math.exp(-age*3.5)*attack*release*.45;
        else if(kind==='bass')sample=Math.sin(phase)*Math.exp(-age*2)*attack*release*.5;
        else if(kind==='hat'){noise=(Math.imul(noise,1664525)+1013904223)>>>0;sample=(noise/4294967296-.5)*Math.exp(-age*35)*attack*.08;}
        else if(kind==='kick')sample=Math.sin(2*Math.PI*(48*age+3*(1-Math.exp(-age*30))))*Math.exp(-age*14)*attack*.18;
        else sample=(Math.sin(phase)*Math.exp(-age*2.6)+.35*Math.sin(phase*2)*Math.exp(-age*4)+.1*Math.sin(phase*3)*Math.exp(-age*7))*attack*release*.42;
        output[position%size]+=sample*level;
      }
    }
    for(let bar=0;bar<Math.ceil(seconds/barLength);bar++){
      const start=bar*barLength,chord=rootNote+progression[bar%4],beat=barLength/4,withStrings=['bloom','ambient','mystery'].includes(arrangement),withGuitar=['warm','city'].includes(arrangement);
      if(withStrings)for(const interval of [0,third,7])note(chord+interval,start,barLength*1.35,'pad',gains.strings*(arrangement==='ambient'?.5:.32));
      for(let step=0;step<8;step++){
        if(arrangement==='ambient'&&step%4!==0||arrangement==='piano'&&step%3===2)continue;
        const intervals=[0,7,12,third+12,7,third+12,12,7],kind=withGuitar?'guitar':'piano';
        note(chord+intervals[step],start+step*beat/2,Math.min(2.8,beat*2.4),kind,(withGuitar?gains.guitar:gains.piano)*(arrangement==='mystery'?.25:.34));
      }
      if(arrangement!=='ambient')for(let step=0;step<4;step++){
        if(arrangement==='piano'&&step%2)continue;
        const degree=melody[(bar*4+step)%melody.length];note(rootNote+degree+(plan.major&&degree===15?1:0),start+step*beat,Math.min(3,beat*1.8),'piano',gains.piano*(bar===0?.27:.39));
      }
      note(chord-12,start,Math.min(3,barLength),'bass',arrangement==='piano'?.12:.2);
      if(['warm','city'].includes(arrangement))for(let step=0;step<4;step++){note(36,start+step*beat,.3,'kick',gains.drums*.5);note(80,start+(step+.5)*beat,.16,'hat',gains.drums*.8);}
    }
    let peak=.001;for(const value of output)peak=Math.max(peak,Math.abs(value));const scale=Math.min(1.8,.78/peak);
    for(let index=0;index<size;index++){const fade=loop?1:Math.min(1,index/(rate*.15),(size-1-index)/(rate*1.2));output[index]=Math.tanh(output[index]*scale)*fade;}
    return output;
  }
  const api={render};if(typeof module!=='undefined')module.exports=api;else root.ToolMusicRenderer=api;
})(typeof window==='undefined'?globalThis:window);
