/* A page script is editable production content; the source prose stays intact. */
(function(root){
'use strict';
const N=typeof module!=='undefined'?require('./narrative-content.js'):root.StoryNarrative;
const examples=typeof module!=='undefined'?require('./comic-page-examples.js'):root.ComicPageExamples;
const clone=x=>JSON.parse(JSON.stringify(x)),norm=x=>String(x||'').replace(/\s+/g,'').trim();
const types=['对白','旁白','拟声','画面文字','手机消息']; const typeLabels={'对白':'Dialogue','旁白':'Narration','拟声':'Sound effect','画面文字':'On-screen text','手机消息':'Phone message'}; const typeLabel=type=>typeLabels[type]||type;
const uid=()=> 'cps-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const source=pg=>N.merge(pg?.text,pg?.direction?.dialogue);
const boilerplate='Establish the characters and setting, then show the main action. Emphasize reactions during key dialogue.'; const legacyBoilerplate='围绕本页情节安排画面，先交代人物与环境，再表现主要行动；关键对白处突出人物反应。'; const displayLabels=new Map([['待填写本页情节',''],['按阅读顺序自动安排','Automatic reading order'],[legacyBoilerplate,boilerplate]]); const displayText=text=>displayLabels.get(text)??text;
function draft(pg){
 const text=source(pg),preset=examples.find(x=>norm(x.source)===norm(text));
 const paragraphs=text.split(/\n\s*\n/).filter(x=>x.trim()),group=Math.max(1,Math.ceil(paragraphs.length/6));
 const panels=[];for(let i=0;i<paragraphs.length;i+=group)panels.push({visual:paragraphs.slice(i,i+group).join('\n\n'),texts:[],needsReview:true});
 const d=preset?clone(preset):{title:pg.direction?.title||'',summary:pg.direction?.title||'',layout:'Automatic reading order',ending:'',panels:panels.length?panels:[{visual:'',texts:[]}]};
 delete d.source;d.version=1;d.origin=preset?'preset':'source';
 if(pg.direction?.title&&pg.direction.title!==text.trim().split(/[。！？\n]/)[0].slice(0,70)&&pg.direction.title!=='待填写本页情节')d.title=pg.direction.title;
 if(pg.direction?.visual&&pg.direction.visual!==boilerplate&&pg.direction.visual!==legacyBoilerplate)d.layout=pg.direction.visual;
 if(pg.direction?.ending)d.ending=pg.direction.ending;
 d.panels.forEach((p,i)=>{p.id=pg.id+'-panel-'+i;p.composition='';p.lettering='';p.texts.forEach((t,j)=>t.id=p.id+'-text-'+j);});
 return d;
}
function read(pg){return pg.pageScript?clone(pg.pageScript):draft(pg);}
function refs(pg,assets){
 const d=read(pg);if(pg.pageScript||pg.scriptRefsEdited||!d.characters)return clone(pg.refs||[]);
 const result=(pg.refs||[]).filter(r=>r.via!=='name-rule'||d.characters.includes(assets.find(a=>a.id===r.assetId)?.name)).map(clone);
 for(const name of d.characters){const a=assets.find(a=>a.name===name);if(a&&!result.some(r=>r.assetId===a.id))result.push({assetId:a.id,versionId:a.adoptedVisualId||'',via:'page-script'});}
 return result;
}
function adopt(pg,assets=[]){
 if(pg.pageScript)return pg.pageScript;
 const d=draft(pg),references=refs(pg,assets);
 pg.pageScriptOriginal??=clone({text:pg.text,direction:pg.direction||{},refs:pg.refs||[]});
 pg.pageScript=d;pg.refs=references;return d;
}
function set(pg,assets,field,value,panelId,textId){
 const current=read(pg),panel=panelId?current.panels.find(p=>p.id===panelId):null;
 const target=textId?panel?.texts.find(t=>t.id===textId):panel||current;
 const allowed=textId?['type','speaker','content']:panel?['visual','composition','lettering']:['title','summary','layout','ending'];
 if(!target||!allowed.includes(field))throw Error('The content changed. Reopen this page.');
 if(field==='type'&&!types.includes(value))throw Error('Select a valid lettering type.');
 if(target[field]===value)return false;
 const d=adopt(pg,assets),p=panelId?d.panels.find(p=>p.id===panelId):null,t=textId?p.texts.find(t=>t.id===textId):p||d;
 t[field]=value;if(textId&&field==='content'&&value.trim())p.needsReview=false;pg.edited=true;return true;
}
function mutate(pg,assets,action,panelId,textId){
 const before=read(pg),i=before.panels.findIndex(p=>p.id===panelId),p=before.panels[i];
 if(action==='add-panel'&&before.panels.length>=12)throw Error('Each page supports up to 12 panels. Add a new page for more panels.');
 if(['remove-panel','up','down','add-text','remove-text','no-text'].includes(action)&&!p)throw Error('This panel no longer exists. Select another.');
 if(action==='remove-panel'&&before.panels.length===1)throw Error('Keep at least one panel.');
 if(action==='up'&&i===0||action==='down'&&i===before.panels.length-1)return;
 if(action==='remove-text'&&!p.texts.some(t=>t.id===textId))throw Error('This lettering no longer exists.');
 if(!['add-panel','remove-panel','up','down','add-text','remove-text','no-text'].includes(action))throw Error('Unknown panel action.');
 pg.pageScriptUndo={pageScript:pg.pageScript?clone(pg.pageScript):null,refs:clone(pg.refs||[])};
 const d=adopt(pg,assets),panel=d.panels[i];
 if(action==='add-panel')d.panels.push({id:uid(),visual:'',texts:[],composition:'',lettering:''});
 if(action==='remove-panel')d.panels.splice(i,1);
 if(action==='up'||action==='down'){const next=i+(action==='up'?-1:1);[d.panels[i],d.panels[next]]=[d.panels[next],d.panels[i]];}
 if(action==='add-text')panel.texts.push({id:uid(),type:'对白',speaker:'',content:''});
 if(action==='remove-text')panel.texts=panel.texts.filter(t=>t.id!==textId);
 if(action==='no-text')panel.needsReview=false;
 pg.edited=true;
}
function undo(pg){const u=pg.pageScriptUndo;if(!u)return;if(u.pageScript)pg.pageScript=clone(u.pageScript);else delete pg.pageScript;pg.refs=clone(u.refs);delete pg.pageScriptUndo;}
function validate(d){
 if(!d.panels?.length)throw Error('Add a panel first.');
 d.panels.forEach((p,i)=>{if(!p.visual.trim())throw Error(`Describe the artwork for Panel ${i+1}.`);if(p.needsReview)throw Error(`Review Panel ${i+1} and add lettering or mark it as wordless.`);p.texts.forEach(t=>{if(!t.content.trim())throw Error(`Enter text for Panel ${i+1} or remove the blank lettering.`);if(['对白','手机消息'].includes(t.type)&&!t.speaker.trim())throw Error(`Identify the ${t.type==='对白'?'speaker':'sender'} for Panel ${i+1}.`);});});
 return true;
}
function ready(pg){try{return validate(read(pg));}catch{return false;}}
function print(d){return [d.title,displayText(d.summary)?'Page plot: '+displayText(d.summary):'',`Page layout: ${d.panels.length} panels · ${displayText(d.layout)||'Automatic layout'}`,...d.panels.map((p,i)=>[`Panel ${i+1}`,p.visual,...p.texts.map(t=>`${typeLabel(t.type)}${t.speaker?' · '+t.speaker:''}: ${t.content}`),p.composition?'Composition: '+p.composition:'',p.lettering?'Lettering position: '+p.lettering:''].filter(Boolean).join('\n')),d.ending?'Page transition: '+d.ending:''].filter(Boolean).join('\n\n');}
function view(d,E,{compact=false}={}){
 return `<div class="cps-script ${compact?'cps-compact':''}"><p class="cps-summary">${E(displayText(d.summary)||'Page plot needed')}</p><p class="cps-layout"><strong>${d.panels.length} panels</strong><span>${E(displayText(d.layout)||'Automatic layout')}</span></p><div class="cps-column-head" aria-hidden="true"><span>Panel</span><span>Artwork</span><span>Lettering</span></div><ol class="cps-panels">${d.panels.map((p,i)=>`<li class="cps-panel"><span class="cps-panel-number">Panel ${i+1}</span><p class="cps-visual">${E(displayText(p.visual)||'Artwork description needed')}</p><div class="cps-texts">${p.texts.length?p.texts.map(t=>`<div class="cps-letter"><span>${E(typeLabel(t.type))}${t.speaker?' · '+E(t.speaker):''}</span><p>${E(t.content||'Lettering needed')}</p></div>`).join(''):`<span class="cps-silent">${p.needsReview?'Review the wording from the source':'Wordless'}</span>`}</div>${p.composition||p.lettering?`<details class="cps-panel-notes"><summary>Panel notes</summary>${p.composition?`<p>Composition: ${E(p.composition)}</p>`:''}${p.lettering?`<p>Lettering position: ${E(p.lettering)}</p>`:''}</details>`:''}</li>`).join('')}</ol>${d.ending?`<p class="cps-ending"><span>Page transition</span>${E(d.ending)}</p>`:''}</div>`;
}
const api={types,typeLabel,displayText,source,read,refs,adopt,set,mutate,undo,validate,ready,print,view};
if(typeof module!=='undefined')module.exports=api;else root.ComicPageScript=api;
})(globalThis);
