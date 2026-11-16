(function(root){
  'use strict';
  function encode({width,height,frames,delay=10}){
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>512||height>512)throw Error('GIF 尺寸需在 1 到 512 像素之间。');
    if(!frames?.length||frames.length>24||frames.some(frame=>frame.length!==width*height*4))throw Error('GIF 帧数据不完整或超过 24 帧。');
    const result=[],byte=value=>result.push(value&255),word=value=>{byte(value);byte(value>>8);},text=value=>{for(const character of value)byte(character.charCodeAt(0));};
    text('GIF89a');word(width);word(height);byte(247);byte(0);byte(0);
    for(let index=0;index<256;index++){const color=index-1;byte(index>0&&index<=252?Math.round(Math.floor(color/42)*255/5):0);byte(index>0&&index<=252?Math.round(Math.floor(color%42/6)*255/6):0);byte(index>0&&index<=252?Math.round(color%6*255/5):0);}
    byte(33);byte(255);byte(11);text('NETSCAPE2.0');byte(3);byte(1);word(0);byte(0);
    for(const frame of frames){
      const indices=new Uint8Array(width*height);for(let index=0;index<indices.length;index++){const offset=index*4;indices[index]=frame[offset+3]<128?0:1+Math.round(frame[offset]*5/255)*42+Math.round(frame[offset+1]*6/255)*6+Math.round(frame[offset+2]*5/255);}
      byte(33);byte(249);byte(4);byte(9);word(Math.max(2,Math.min(100,Math.round(delay))));byte(0);byte(0);byte(44);word(0);word(0);word(width);word(height);byte(0);byte(8);
      const compressed=[];let buffer=0,bits=0,next=258,dictionary=new Map(),prefix=indices[0];
      function code(value){buffer|=value<<bits;bits+=9;while(bits>=8){compressed.push(buffer&255);buffer>>>=8;bits-=8;}}
      code(256);
      for(let index=1;index<indices.length;index++){const symbol=indices[index],key=prefix*256+symbol,found=dictionary.get(key);if(found!==undefined){prefix=found;continue;}code(prefix);if(next<510)dictionary.set(key,next++);else{code(256);dictionary=new Map();next=258;}prefix=symbol;}
      code(prefix);code(257);if(bits)compressed.push(buffer&255);
      for(let offset=0;offset<compressed.length;offset+=255){const length=Math.min(255,compressed.length-offset);byte(length);for(let index=0;index<length;index++)byte(compressed[offset+index]);}byte(0);
    }
    byte(59);return Uint8Array.from(result);
  }
  const api={encode};if(typeof module!=='undefined')module.exports=api;else root.ToolStickerGIF=api;
})(typeof window==='undefined'?globalThis:window);
