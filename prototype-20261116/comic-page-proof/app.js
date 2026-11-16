/* 单页验证：整页底图保真，只有显式区域和文字对象独立。 */
const M=PageProofModel,KEY='cimora-page-proof-v1',$=id=>document.getElementById(id);
let state=M.initial(),selected='lend',temporary=false,revision=0;
try{const raw=localStorage.getItem(KEY);if(raw)state=M.restore(raw);}catch{$('save').textContent='存储不可用，当前修改仅保留在此页';}
const load=src=>new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('图片加载失败：'+src));i.src=src;});
let art;
const R={rain:{x:780,y:32,w:214,h:278},face:{x:235,y:670,w:138,h:167}};
function lines(ctx,value,width){let out=[],line='';for(const ch of value){if(ch==='\n'){out.push(line);line='';continue;}if(ctx.measureText(line+ch).width>width&&line){if(/[，。！？；：、…）】》]/.test(ch)&&line.length>1){out.push(line.slice(0,-1));line=line.slice(-1)+ch;}else{out.push(line);line=ch;}}else line+=ch;}out.push(line);return out;}
function lettering(ctx,t){ctx.save();const {x,y,w,h}=t,cx=x+w/2,cy=y+h/2;ctx.lineWidth=1.6;ctx.strokeStyle='#161616';ctx.fillStyle='#fff';
if(t.type==='dialogue'){let dx=t.tailX-cx,dy=t.tailY-cy,scale=1/Math.sqrt(dx*dx/(w*w/4)+dy*dy/(h*h/4));if(Number.isFinite(scale)&&scale<1){let bx=cx+dx*scale*.94,by=cy+dy*scale*.94,len=Math.hypot(dx,dy),px=-dy/len*9,py=dx/len*9;ctx.beginPath();ctx.moveTo(bx+px,by+py);ctx.lineTo(t.tailX,t.tailY);ctx.lineTo(bx-px,by-py);ctx.closePath();ctx.fill();ctx.stroke();}}
if(['dialogue','thought'].includes(t.type)){ctx.beginPath();ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(t.type==='thought'){for(let k=0;k<2;k++){ctx.beginPath();ctx.ellipse(x+w+8+k*10,cy+27+k*7,6-k*2,5-k*2,0,0,7);ctx.fill();ctx.stroke();}}}
ctx.font=`${t.type==='title'?'bold ':''}${t.size}px "Microsoft YaHei",sans-serif`;ctx.textAlign=t.type==='title'?'left':'center';ctx.textBaseline='middle';let list=lines(ctx,t.text,w-24),lh=t.size*1.35;ctx.fillStyle=t.type==='sound'?'#fff':'#111';if(t.type==='sound'){ctx.strokeStyle='#222';ctx.lineWidth=3;}ctx.save();ctx.beginPath();ctx.rect(x+5,y+3,w-10,h-6);ctx.clip();list.forEach((l,i)=>{let tx=t.type==='title'?x+4:cx,ty=cy+(i-(list.length-1)/2)*lh;if(t.type==='sound')ctx.strokeText(l,tx,ty);ctx.fillText(l,tx,ty);});ctx.restore();ctx.restore();return list.length*lh>h-2;}
function draw(canvas,data,candidatePreview=false){canvas.width=1024;canvas.height=1536;const ctx=canvas.getContext('2d');ctx.drawImage(art.base,0,0,1024,1536);const b=R.rain,z=data.crop.zoom,cw=b.w*z,ch=b.h*z;let ox=Math.max(-(cw-b.w)/2,Math.min((cw-b.w)/2,data.crop.x)),oy=Math.max(-(ch-b.h)/2,Math.min((ch-b.h)/2,data.crop.y));ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();ctx.drawImage(art.rain,b.x-(cw-b.w)/2+ox,b.y-(ch-b.h)/2+oy,cw,ch);ctx.restore();if(data.adopted||candidatePreview){let f=R.face;ctx.drawImage(art.face,f.x,f.y,f.w,f.h);}let overflow=[];for(const t of data.texts)if(lettering(ctx,t))overflow.push(t.name);return overflow;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('save').textContent='已保存到本机 · 刷新可继续 · 独立存储';}catch{$('save').textContent='未保存：本机存储写入失败，请下载可编辑记录';}}
function dirty(){revision++;temporary=false;$('exportStatus').textContent='有修改，请重新合成当前 PNG';$('download').hidden=true;$('result').hidden=true;save();paint();}
function controls(){const t=state.texts.find(t=>t.id===selected);$('objects').value=selected;for(const k of ['text','type','x','y','w','h','size','tailX','tailY'])$(k).value=t[k];$('zoom').value=state.crop.zoom;$('panX').value=state.crop.x;$('panY').value=state.crop.y;}
function positionHandles(){for(const t of state.texts){let el=document.querySelector(`[data-text-id="${t.id}"]`);el.style.left=t.x/1024*100+'%';el.style.top=t.y/1536*100+'%';el.style.width=t.w/1024*100+'%';el.style.height=t.h/1536*100+'%';el.className='handle'+(t.id===selected?' selected':'')+(['title','sound'].includes(t.type)?' square':'');}}
function paint(){if(!art)return;const overflow=draw($('page'),state,temporary);positionHandles();$('textWarning').textContent=overflow.length?'文字可能超出气泡：'+overflow.join('、')+'。请增大气泡或缩小字号。':'';$('candidateStatus').textContent=temporary?'临时预览候选；尚未采用，导出仍使用已保存版本。':state.adopted?'已采用候选 · 可随时恢复原版':'当前采用原版；候选未覆盖。';$('summary').textContent=`7 个独立文字对象 · 雨景缩放 ${state.crop.zoom.toFixed(2)}× · 表情${state.adopted?'已采用候选':'原版'} · ${temporary?'正在临时比较':'编辑画面与合成共用绘制函数'}`;}
for(const t of state.texts){let opt=document.createElement('option');opt.value=t.id;opt.textContent=t.name;$('objects').append(opt);let el=document.createElement('button');el.dataset.textId=t.id;el.setAttribute('aria-label','选择并拖动：'+t.name);el.title=t.name;let drag;
el.addEventListener('pointerdown',e=>{selected=t.id;controls();paint();const rect=$('paper').getBoundingClientRect();drag={px:e.clientX,py:e.clientY,x:t.x,y:t.y,sx:1024/rect.width,sy:1536/rect.height,moved:false};el.setPointerCapture(e.pointerId);});el.addEventListener('pointermove',e=>{if(!drag)return;let nx=Math.max(0,Math.min(1024-t.w,drag.x+(e.clientX-drag.px)*drag.sx)),ny=Math.max(0,Math.min(1536-t.h,drag.y+(e.clientY-drag.py)*drag.sy));if(Math.abs(nx-t.x)+Math.abs(ny-t.y)>.1){drag.moved=true;M.editText(state,t.id,{x:Math.round(nx),y:Math.round(ny)});controls();paint();}});el.addEventListener('pointerup',()=>{if(drag?.moved)dirty();drag=null;});el.addEventListener('pointercancel',()=>{if(drag?.moved)dirty();drag=null;});el.addEventListener('click',()=>{selected=t.id;controls();paint();});$('handles').append(el);}
$('objects').addEventListener('change',()=>{selected=$('objects').value;controls();paint();});
for(const k of ['text','type','x','y','w','h','size','tailX','tailY'])$(k).addEventListener('input',()=>{const el=$(k);if(!el.validity.valid||el.value==='')return;M.editText(state,selected,{[k]:['text','type'].includes(k)?el.value:Number(el.value)});dirty();});
for(const [id,key]of [['zoom','zoom'],['panX','x'],['panY','y']])$(id).addEventListener('input',()=>{if(!$(id).validity.valid||$(id).value==='')return;try{M.setCrop(state,{[key]:Number($(id).value)});dirty();}catch(e){$('save').textContent=e.message;}});
$('cropReset').onclick=()=>{M.setCrop(state,{zoom:1,x:0,y:0});controls();dirty();};
$('previewCandidate').onclick=()=>{temporary=!temporary;paint();if(temporary)exportStatus.textContent='临时预览未采用；已有合成仍是已保存版本，重新合成将返回已采用画面。';};$('adopt').onclick=()=>{state.adopted=true;dirty();};$('original').onclick=()=>{state.adopted=false;dirty();};
$('backup').onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='页漫可编辑记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('export').onclick=async()=>{if(!art)return;temporary=false;paint();let seq=revision,c=document.createElement('canvas');draw(c,state);$('result').src=c.toDataURL('image/png');$('result').hidden=false;$('download').href=$('result').src;$('download').hidden=false;$('exportStatus').textContent=`已合成 1024 × 1536 PNG · 与当前编辑一致（不含蓝色选择框）`;};
const records=[
['一句话原文','下雨天，女孩在旧书店借到一把黄伞，次日送还时在伞里留下一颗纸太阳。影响：故事因果与借还主线。'],
['确认故事','样例由人工确认。小满遇雨，周叔借伞，次日还伞并赠纸太阳。本轮只做第一场借伞，不把第二场纸太阳放进本页。'],
['公共参考','小满：20岁、齐耳黑发、圆眼镜、开衫与帆布包；周叔：约60岁、灰发眼镜、围裙。参考约束身份与道具，不照搬参考图版式。'],
['分场节拍','雨中傍晚：看雨 → 担忧 → 被询问 → 递伞 → 回头告别。影响阅读顺序、表情与景别。'],
['逐格脚本','①书店环境大格：抱书看雨。②雨滴细节。③眼神近景：担忧。④周叔中景：没带伞？⑤递伞手部特写。⑥整行尾格：撑伞离开回头致谢。'],
['布局区域','大环境占左上约72%页宽；右上雨景细格＋眼神格；中段询问与递伞两格宽度不同；底部跨栏收尾。不等大格，不换成网格。'],
['气泡留白规划','心理放在环境与眼神间的跨格位置；询问位于周叔左上；递伞对白放手部动作上方；告别放尾格中部空隙。标题和雨声独立。'],
['生成约束','以认可整页为输入，只去文字及气泡、合理补画遮挡区、收回越框鞋。保留身份、格线、雨景、递伞和末格握伞。完整提示词可展开。'],
['本次修改范围','A：文字与气泡位置直接编辑。B：仅雨景矩形格取景，不生图。C：裁出周叔头部，经Packy定向改闭口微笑，候选未确认不覆盖；其余画格保持底图像素。']
];for(const [title,value]of records){let li=document.createElement('li'),b=document.createElement('strong');b.textContent=title+'：';li.append(b,document.createTextNode(value));$('record').append(li);}
Promise.all([load('assets/base.png'),load('assets/rain.png'),load('assets/face-candidate.png')]).then(([base,rain,face])=>{art={base,rain,face};controls();save();paint();}).catch(e=>{$('save').textContent=e.message;});
for(const [id,file]of [['basePrompt','base-prompt.txt'],['facePrompt','expression-prompt.txt']])fetch('assets/'+file).then(r=>{if(!r.ok)throw Error('提示词读取失败');return r.text();}).then(t=>$(id).textContent=t).catch(e=>$(id).textContent=e.message);


