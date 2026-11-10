(function(root){
  'use strict';
  const RESET=256,MAX=63000;
  function checksum(bytes){let value=2166136261;for(const byte of bytes)value=Math.imul(value^byte,16777619)>>>0;return value;}
  function character(code){const value=code+32;return String.fromCharCode(value>=0xd800?value+2048:value);}
  function pack(value){
    const bytes=new TextEncoder().encode(JSON.stringify(value)),dictionary=new Map(),codes=[];let next=257,previous=bytes[0];
    for(let index=1;index<bytes.length;index++){
      const byte=bytes[index],key=previous*256+byte,found=dictionary.get(key);
      if(found!==undefined){previous=found;continue;}
      codes.push(character(previous));
      if(next<=MAX)dictionary.set(key,next++);else{codes.push(character(RESET));dictionary.clear();next=257;}
      previous=byte;
    }
    if(previous!==undefined)codes.push(character(previous));
    return [bytes.length,checksum(bytes),codes.join('')];
  }
  function unpack(record){
    if(!Array.isArray(record)||record.length!==3||!Number.isSafeInteger(record[0])||record[0]<1||record[0]>32*1024*1024||!Number.isInteger(record[1])||typeof record[2]!=='string')throw Error('压缩记录无效');
    const output=new Uint8Array(record[0]),prefix=new Uint16Array(MAX+1),suffix=new Uint8Array(MAX+1),stack=[];let next=257,previous=-1,position=0;
    for(const char of record[2]){
      let code=char.charCodeAt(0);code=(code>=0xe000?code-2048:code)-32;
      if(code===RESET){if(next<=MAX)throw Error('重置标记无效');next=257;previous=-1;continue;}
      if(code<0||code>next||code>MAX||code===next&&previous<0)throw Error('压缩数据损坏');
      const original=code;stack.length=0;
      if(code===next){code=previous;while(code>=257){stack.push(suffix[code]);code=prefix[code];}const first=code;stack.length=0;stack.push(first);code=previous;}
      while(code>=257){stack.push(suffix[code]);code=prefix[code];}
      if(code>255)throw Error('压缩引用无效');
      const first=code;stack.push(first);
      while(stack.length){if(position>=output.length)throw Error('压缩长度无效');output[position++]=stack.pop();}
      if(previous>=0&&next<=MAX){prefix[next]=previous;suffix[next]=first;next++;}
      previous=original;
    }
    if(position!==output.length||checksum(output)!==record[1])throw Error('压缩数据校验失败');
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(output));
  }
  const api={pack,unpack};if(typeof module!=='undefined')module.exports=api;else root.ToolStorageCodec=api;
})(typeof window==='undefined'?globalThis:window);
