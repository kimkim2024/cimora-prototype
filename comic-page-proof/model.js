(function(root){
const text=(id,name,type,value,x,y,w,h,size,tailX=0,tailY=0)=>({id,name,type,text:value,x,y,w,h,size,tailX,tailY});
function initial(){return {version:1,adopted:false,crop:{zoom:1,x:0,y:0},texts:[
text('title','Title','title','Borrow some sunshine',30,0,250,29,20),
text('rain','Rain sound','sound','Sha sha',608,48,130,65,43),
text('thought','Xiaoman inner voice','thought','How did the light rain\nturn into heavy rain……',646,446,158,159,21,808,565),
text('ask','Uncle Zhou asks','dialogue','No umbrella?',110,670,130,96,23,274,767),
text('reply','Xiaoman answers','dialogue','Mm……',80,974,112,83,22,90,967),
text('lend','Umbrella handoff dialogue','dialogue','Let me lend you some sunshine first.',539,672,246,125,25,770,805),
text('bye','Farewell dialogue','dialogue','I will return it tomorrow!',510,1168,181,124,25,487,1280)
]};}
const numeric=['x','y','w','h','size','tailX','tailY'];
function editText(s,id,patch){let t=s.texts.find(t=>t.id===id);if(!t)throw Error('Text does not exist');for(let k of numeric)if(k in patch&&!Number.isFinite(patch[k]))throw Error('Invalid number');for(let k of ['text','type',...numeric])if(k in patch)t[k]=patch[k];}
function setCrop(s,c){const n={...s.crop,...c};if(!Number.isFinite(n.zoom)||n.zoom<1||n.zoom>2||!Number.isFinite(n.x)||!Number.isFinite(n.y)||Math.abs(n.x)>200||Math.abs(n.y)>200)throw Error('Framing parameters out of range');s.crop=n;}
function restore(raw){try{let x=JSON.parse(raw),d=initial();if(x.version!==1||typeof x.adopted!=='boolean'||!Array.isArray(x.texts)||x.texts.length!==d.texts.length)return d;setCrop(d,x.crop);for(let t of d.texts){let v=x.texts.find(v=>v.id===t.id);if(!v||typeof v.text!=='string'||v.text.length>200||!['title','sound','thought','dialogue'].includes(v.type))return initial();for(let k of numeric)if(!Number.isFinite(v[k])||Math.abs(v[k])>3000)return initial();if(v.w<25||v.h<20||v.size<8||v.size>100)return initial();editText(d,t.id,v);}d.adopted=x.adopted;return d;}catch{return initial();}}
const api={initial,editText,setCrop,restore};if(typeof module!=='undefined')module.exports=api;else root.PageProofModel=api;
})(globalThis);

