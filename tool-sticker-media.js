(()=>{
  'use strict';
  const images=new Map();
  async function image(src){if(images.has(src))return images.get(src);const promise=(async()=>{const picture=new Image();picture.crossOrigin='anonymous';picture.src=src;await picture.decode();return picture;})();images.set(src,promise);try{const picture=await promise;while(images.size>12)images.delete(images.keys().next().value);return picture;}catch(error){images.delete(src);throw error;}}
  async function prepare(source){const main=await image(source.images.main),states={main};if(source.scope==='sample')for(const role of ['speaking','blink'])states[role]=await image('assets/pngtuber/'+role+'.png');return states;}
  function lines(context,text,max){const result=[''];for(const character of text){const index=result.length-1;if(character==='\n')result.push('');else if(context.measureText(result[index]+character).width>max)result.push(character);else result[index]+=character;}return result;}
  function paint(canvas,states,item,phase=0){
    const context=canvas.getContext('2d');context.clearRect(0,0,320,320);
    const cycle=phase*Math.PI*2,picture=states.blink&&phase>.83?states.blink:states.speaking&&phase>.2&&phase<.5?states.speaking:states.main;
    const text=item.captionEnabled?item.caption:'',space=text?72:20;
    let offset=0,rotation=0;if(item.motion==='nod')offset=(1-Math.cos(cycle))*6;else if(item.motion==='shake')rotation=Math.sin(cycle*2)*.075;else if(item.motion==='sway')rotation=Math.sin(cycle)*.07;else offset=-Math.abs(Math.sin(cycle))*12;
    const scale=Math.min(276/picture.naturalWidth,(296-space)/picture.naturalHeight),width=picture.naturalWidth*scale,height=picture.naturalHeight*scale;
    context.save();context.translate(160,154-space/3+offset);context.rotate(rotation);context.drawImage(picture,-width/2,-height/2,width,height);context.restore();
    if(!text)return;
    let font=34,rows;do{context.font='900 '+font+'px "Microsoft YaHei","PingFang SC",sans-serif';rows=lines(context,text,280);if(rows.length*font*1.2<=78)break;font-=2;}while(font>14);
    const block=rows.length*font*1.2,start=320-12-block+font*.6;
    context.textAlign='center';context.textBaseline='middle';context.lineJoin='round';
    if(item.captionStyle==='bubble'){const width=Math.min(300,Math.max(...rows.map(row=>context.measureText(row).width))+28);context.fillStyle='#fff';context.strokeStyle='#34253f';context.lineWidth=2;context.beginPath();context.roundRect(160-width/2,start-font*.7,width,block+10,16);context.fill();context.stroke();context.fillStyle='#34253f';rows.forEach((row,index)=>context.fillText(row,160,start+index*font*1.2));}
    else{context.strokeStyle='#35273f';context.lineWidth=Math.max(4,font*.17);context.fillStyle='#fff';rows.forEach((row,index)=>{context.strokeText(row,160,start+index*font*1.2);context.fillText(row,160,start+index*font*1.2);});}
  }
  async function output(source,item,{animated=true}={}){
    const states=await prepare(source),canvas=document.createElement('canvas');canvas.width=canvas.height=320;canvas.getContext('2d',{willReadFrequently:true});paint(canvas,states,item,0);const src=canvas.toDataURL('image/png');
    if(!animated||item.format==='png'){canvas.width=canvas.height=1;return{id:item.id,src,gif:null,format:item.format};}
    const frames=[];for(let index=0;index<12;index++){paint(canvas,states,item,index/12);frames.push(canvas.getContext('2d').getImageData(0,0,320,320).data);await new Promise(resolve=>setTimeout(resolve,0));}
    const bytes=ToolStickerGIF.encode({width:320,height:320,frames,delay:Math.round(10/item.speed)}),gif=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('GIF 读取失败。'));reader.readAsDataURL(new Blob([bytes],{type:'image/gif'}));});canvas.width=canvas.height=1;return{id:item.id,src,gif,format:item.format};
  }
  function blob(src){const [header,data]=src.split(',');return new Blob([Uint8Array.from(atob(data),character=>character.charCodeAt(0))],{type:header.match(/data:([^;]+)/)[1]});}
  function download(data,name){const url=URL.createObjectURL(data),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
  window.ToolStickerMedia={prepare,paint,output,blob,download};
})();
