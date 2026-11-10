(function(root){
  'use strict';
  function zip(entries){
    const encoder=new TextEncoder(),parts=[],directory=[];let offset=0;
    for(const entry of entries){
      const name=encoder.encode(entry.name),data=typeof entry.data==='string'?encoder.encode(entry.data):entry.data;
      let checksum=0xffffffff;
      for(const byte of data){checksum^=byte;for(let bit=0;bit<8;bit++)checksum=(checksum>>>1)^((checksum&1)?0xedb88320:0);}
      checksum=(checksum^0xffffffff)>>>0;
      const local=new Uint8Array(30+name.length),view=new DataView(local.buffer);
      view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);view.setUint16(12,0x21,true);view.setUint32(14,checksum,true);view.setUint32(18,data.length,true);view.setUint32(22,data.length,true);view.setUint16(26,name.length,true);local.set(name,30);
      parts.push(local,data);
      const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,0x21,true);cv.setUint32(16,checksum,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);directory.push(central);
      offset+=local.length+data.length;
    }
    const length=directory.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,length,true);ev.setUint32(16,offset,true);
    return new Blob([...parts,...directory,end],{type:'application/zip'});
  }
  if(typeof module!=='undefined')module.exports={zip};else root.ToolPNGTuberZip={zip};
})(typeof window==='undefined'?globalThis:window);
