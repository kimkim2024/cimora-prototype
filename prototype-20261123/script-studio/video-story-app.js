(function(root){
'use strict';
const D=root.VideoStoryModel,M=root.ScriptStudio,C=root.StoryContent,KEY='cimora-video-story-v1';
const assetKinds={
 '人物':{label:'Character',plural:'Characters',description:'Backstory and appearance',placeholder:'Role, background, motivation, relationships, and appearance',icon:'person',chipColor:'#527ec3'},
 '场景':{label:'Scene',plural:'Scenes',description:'Setting and atmosphere',placeholder:'Describe the setting and the details that should stay consistent.',icon:'genre',chipColor:'#329992'},
 '道具':{label:'Prop',plural:'Props',description:'Features and role in the story',placeholder:'Describe the prop’s role and the details that should stay consistent.',icon:'book',chipColor:'#8662bb'},
};
const referenceName=version=>(version.name||'').replace(/^预置日漫画风 · /,'Anime-style sample · ');
function read(){const raw=localStorage.getItem(KEY);if(!raw)return {version:1,projects:[],assets:[],active:null};const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.projects)||!Array.isArray(s.assets))throw Error('The video draft could not be loaded. The original data was kept.');return s;}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{root.Cimora.S.toast('Local storage is full. Download a project backup before continuing.');return false;}}
function download(text,name,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function mount(host,params){
 const state=read(),wanted=params.get('project'),fresh=params.get('intent')==='new'||!wanted;let confirmBoard=false,previewDemo=false,uploadBusy=false,releasePreview=()=>{};
 if(wanted&&!fresh){if(!state.projects.some(p=>p.id===wanted))throw Error('Video draft not found. Open the project again from Creation Space.');state.active=wanted;}
 const current=fresh?null:state.projects.find(p=>p.id===state.active);if(current){D.ensure(current);if(current.storyChapters.some(c=>c.id===params.get('chapter'))){current.video.chapter=params.get('chapter');current.agent.selectedChapter=params.get('chapter');}if(current.video.shots.some(s=>s.id===params.get('shot')))current.video.selectedShot=params.get('shot');}if(current&&D.tabs.some(t=>t[0]===params.get('tab')))current.agent.planningTab=params.get('tab');
 const selectAsset=p=>{const v=D.ensure(p);return v.assets.find(a=>a.id===v.selectedAsset&&a.kind===v.assetKind)||v.assets.find(a=>a.kind===v.assetKind);};
 const selectShot=p=>{const v=D.ensure(p),ch=D.selectedChapter(p);return v.shots.find(s=>s.id===v.selectedShot&&s.chapterId===ch?.id)||v.shots.find(s=>s.chapterId===ch?.id);};
 const goto=(p,tab,api)=>{p.agent.phase='planning';p.agent.planningTab=tab;p.agent.guideScope=tab;api.persist();api.render();};
 function entry(p,h){const v=D.ensure(p);return root.CreationEntry.view(p,h,{state:v,kind:'视频',prefix:'vp',backAction:'vp-back',uploadBusy,settings:[{key:'style',label:'Visual style',value:v.style,options:Object.entries(D.labels.style)},{key:'ratio',label:'Aspect ratio',value:v.ratio,options:['16:9','9:16','1:1']},{key:'quality',label:'Resolution',value:v.quality,options:['720p','1080p']}],guidance:v.mode==='manual'?'Start with an empty workspace and ask AI for help at any time.':'You can paste or upload a story and adjust the text and visual settings later.'});}
 const gateView=(gate,h)=>`<section class="as-content-empty">${h.icon('book')}<h2>Complete ${h.E(gate.label)} first</h2><p>${h.E(gate.message)}</p>${h.btn('Go to '+{overview:'Overview',chapters:'Chapters',assets:'Assets',storyboard:'Storyboard'}[gate.tab],'planning-tab','primary',`data-tab="${gate.tab}"`)}<small>Your edits are saved while you work.</small></section>`;
 function assets(p,h){const {E,btn,icon}=h,v=D.ensure(p),a=selectAsset(p),items=v.assets.filter(x=>x.kind===v.assetKind),version=a?.versions.find(x=>x.id===a.selectedVersion)||a?.versions.find(x=>x.id===a.adoptedId)||a?.versions.at(-1);
 const kind=assetKinds[v.assetKind],listLabel=kind.plural+' list';
 const description=a&&assetKinds[a.kind];
 const referenceLabel=a?.name||description?.label.toLowerCase();
 return `<section class="vp-assets">
   <header class="vp-section-heading"><div><h2>Characters and story world</h2><p>Organize characters, scenes, and props for use across your storyboard.</p></div></header>
   <div class="vp-asset-types" role="group" aria-label="Asset types">${Object.entries(assetKinds).map(([key,type])=>{
     const count=v.assets.filter(asset=>asset.kind===key).length;
     return btn(`<span class="plan-chip-icon" aria-hidden="true" style="--chip-ink:${type.chipColor}">${icon(type.icon)}</span>${type.plural}<span class="vp-asset-count">${count}</span>`,'vp-kind','plan-chip',`data-key="${key}" aria-pressed="${v.assetKind===key}"`);
   }).join('')}</div>
   <div class="vp-assets-layout">
     ${a?`<section class="vp-asset-detail" aria-label="Edit asset">
       <div class="vp-asset-fields">
         <label>${description.label} name<input data-vp-asset="name" data-id="${a.id}" value="${E(a.name)}" placeholder="Enter a ${description.label.toLowerCase()} name"></label>
         <label>${description.description}<textarea data-vp-asset="description" data-id="${a.id}" rows="9" placeholder="${description.placeholder}">${E(a.description)}</textarea></label>
         <p>Edits save automatically. Preview reference images before selecting one.</p>
       </div>
       <div class="vp-asset-visual">
         <div class="vp-reference">${version?`<img src="${E(version.url)}" alt="Reference image for ${E(referenceLabel)}"><span>${E(referenceName(version))}${version.id===a.adoptedId?' · In use':' · Preview'}</span>`:`<div>${icon(description.icon)}<h3>Reference image for ${E(referenceLabel)}</h3><p>Upload an image or try a sample.</p></div>`}</div>
         <div class="as-row">
           <label class="as-btn vp-file-button">Upload image<input type="file" accept="image/png,image/jpeg,image/webp" data-vp-image="${a.id}" aria-label="Upload reference image for ${E(referenceLabel)}"></label>
           ${btn('Generate reference image','vp-asset-generate','',`data-id="${a.id}"`)}
           ${version?btn(version.id===a.adoptedId?'In use':'Use this image','vp-adopt-asset','primary',`data-id="${a.id}" data-version="${version.id}" ${version.id===a.adoptedId?'disabled':''}`):''}
         </div>
         ${a.versions.length>1?`<div class="vp-versions">${a.versions.map(x=>btn(`<img src="${E(x.url)}" alt="${E(referenceName(x))}">`,'vp-asset-version',x.id===version?.id?'active':'',`data-id="${a.id}" data-version="${x.id}" aria-label="View ${E(referenceName(x))}"`)).join('')}</div>`:''}
         <small class="vp-demo-note">Sample images are anime-style. You can upload images for your own story.</small>
       </div>
     </section>`:`<section class="vp-empty">${icon(kind.icon)}<h3>No ${kind.plural.toLowerCase()} yet</h3><p>Use AI to find assets in your chapters, or add them manually.</p><div class="as-row">${btn(icon('spark')+'Extract assets with AI','vp-extract','primary')}${btn('Add '+kind.label.toLowerCase(),'vp-add-asset')}</div></section>`}
     <aside class="vp-asset-rail as-flow-rail" aria-label="${listLabel}">
       <div class="as-content-heading"><h3>${kind.plural}</h3><span>${items.length} ${items.length===1?'item':'items'}</span></div>
       <div class="vp-asset-list as-flow-rail-list">${items.map(x=>{
         const image=x.versions.find(y=>y.id===x.adoptedId);
         return btn(`${image?`<img src="${E(image.url)}" alt="">`:`<span class="vp-list-symbol">${icon(kind.icon)}</span>`}<span><strong>${E(x.name||'Untitled '+kind.label.toLowerCase())}</strong><small>${x.adoptedId?'Reference image in use':'Reference image needed'}</small></span>`,'vp-select-asset',a?.id===x.id?'active':'',`data-id="${x.id}" aria-pressed="${a?.id===x.id}"`);
       }).join('')}</div>
       <div class="as-flow-rail-actions">${btn('Add '+kind.label.toLowerCase(),'vp-add-asset','as-add-chapter')}${btn('Continue to storyboard '+icon('arrow'),'planning-tab','primary','data-tab="storyboard"')}<p>Assets save automatically. Reference images are shared across storyboard shots.</p></div>
     </aside>
   </div>
 </section>`;
 }
 function projectCover(p){
   return root.Cimora.projectLibrary?.projectCover(p.workspaceNativeId||p.id.replace(/^video-sc-workspace-/,''));
 }
 function chapterSelect(p,h){
   return root.CimoraActivityDropdown.render({
     label:'Current chapter',
     value:D.selectedChapter(p)?.id,
     action:'vp-select-chapter',
     className:'vp-chapter-select',
     icon:h.icon('book'),
     options:p.storyChapters.map((chapter,index)=>({
       value:chapter.id,
       label:chapter.title||'Untitled chapter',
       description:`Chapter ${index+1}`,
     })),
   });
 }
 function shotSettingDropdown(s,field,label){
   return root.CimoraActivityDropdown.render({
     label,value:s[field],action:`vp-shot-${field}`,className:'vp-shot-dropdown',compact:true,
     options:Object.entries(D.labels[field]).map(([value,label])=>({value,label})),
   });
 }
 const shotSettingLabels={framing:'Framing',camera:'Camera movement'};
 function shotSetting(s,field){
   const label=shotSettingLabels[field];
   return `<div class="vp-shot-field"><span>${label}</span>${shotSettingDropdown(s,field,label)}</div>`;
 }
 function shotRail(p,h,act){const v=D.ensure(p),c=D.selectedChapter(p),ss=v.shots.filter(s=>s.chapterId===c?.id),selected=selectShot(p);return `<aside class="vp-shot-rail as-flow-rail" aria-label="Shot list">${chapterSelect(p,h)}<div class="vp-shot-list as-flow-rail-list">${ss.map((s,i)=>h.btn(`<span>Shot ${String(i+1).padStart(2,'0')}</span><strong>${h.E(s.title||D.shotContent(s).slice(0,24)||'Untitled shot')}</strong><small>${s.duration} sec${D.stale(p,s)?' · Content updated':s.adoptedId?' · Video in use':s.request?' · Request recorded':' · Pending'}</small>`,'vp-select-shot',s.id===selected?.id?'active':'',`data-id="${s.id}" aria-pressed="${s.id===selected?.id}"`)).join('')}</div>${act?`<div class="as-flow-rail-actions">${h.btn('Add shot','vp-add-shot','as-add-chapter')}${h.btn('Continue to video '+h.icon('arrow'),'planning-tab','primary','data-tab="generation"')}<p>Your storyboard saves automatically. You can edit it before generating video.</p></div>`:''}</aside>`;}
 function storyboard(p,h){const {E,btn,icon}=h,v=D.ensure(p),c=D.selectedChapter(p),s=selectShot(p),ss=v.shots.filter(s=>s.chapterId===c?.id),stale=ss.some(s=>s.sourceRevision&&s.sourceRevision!==c.body);
 return `<section><header class="vp-section-heading"><div><h2>Turn chapters into shots</h2><p>Plan visuals, dialogue, and pacing before generating video.</p></div></header>${stale?'<p class="vp-notice">The chapter has changed. Review the existing shots against the updated text.</p>':''}<div class="vp-board-layout"><div class="vp-shot-editor">${confirmBoard?`<section class="vp-confirm" aria-label="Confirm AI storyboard"><h3>Create a storyboard for ${E(c?.title)} with AI?</h3><p>Split this chapter into shots and link relevant project assets. You can edit each shot afterward.</p><small>This demo uses paragraph breaks and suggests framing and duration.</small><div class="as-row">${btn('Create storyboard','vp-confirm-board','primary')}${btn('Cancel','vp-cancel-board')}</div></section>`:s?`<header class="vp-editor-heading"><h3>Shot ${ss.indexOf(s)+1}</h3><span>Autosaved</span></header><label>Shot title<input data-vp-shot="title" data-id="${s.id}" value="${E(s.title)}" placeholder="Summarize what happens in this shot"></label><label>Shot content<textarea data-vp-shot="content" data-id="${s.id}" rows="8" placeholder="Describe action, expressions, dialogue, and narration in order. Label each speaker.">${E(D.shotContent(s))}</textarea></label><div class="vp-shot-settings">${shotSetting(s,"framing")}${shotSetting(s,"camera")}<label>Duration (seconds)<input type="number" min="1" max="60" data-vp-shot="duration" data-id="${s.id}" value="${s.duration}"></label></div><fieldset class="vp-refs"><legend>Linked assets</legend>${v.assets.map(a=>`<label><input type="checkbox" data-vp-ref="${a.id}" data-id="${s.id}" ${s.assetIds.includes(a.id)?'checked':''}><span>${E(a.name||'Untitled asset')}<small>${E(assetKinds[a.kind]?.label||a.kind)} · ${a.adoptedId?'Reference image in use':'Reference image needed'}</small></span></label>`).join('')}</fieldset><details><summary>Chapter text</summary><p class="vp-source-text">${E(c?.body)}</p></details><footer class="vp-editor-footer"><span>Editing a shot keeps its existing video.</span>${btn('Preview shot '+icon('arrow'),'vp-preview','',`data-id="${s.id}"`)}</footer>`:`<section class="vp-empty">${icon('genre')}<h3>No shots in ${E(c?.title||'this chapter')} yet</h3><p>Create a first draft with AI or add a shot manually.</p><div class="as-row">${btn(icon('spark')+'Create storyboard with AI','vp-start-board','primary')}${btn('Add a shot','vp-add-shot')}</div></section>`}</div>${shotRail(p,h,true)}</div></section>`;
 }
 function referenceCards(p,s){const E=root.Cimora.E,refs=D.promptReferences(p,s);return refs.length?refs.map(r=>`<div class="vp-prompt-reference">${r.version?`<img src="${E(r.version.url)}" alt="Reference image for ${E(r.asset.name)}">`:'<span class="vp-reference-placeholder">@</span>'}<div><strong>${E(r.token)}</strong><small>${r.asset?E(assetKinds[r.asset.kind]?.label||r.asset.kind)+' · '+(r.version?'Reference image linked':'Reference image needed'):'Select a valid asset'}${r.asset&&!r.token.includes(r.asset.name)?' · Current name: '+E(r.asset.name):''}</small></div></div>`).join(''):'<p class="vp-demo-note">No assets referenced. Type @ to choose a character, scene, or prop for this shot.</p>';}
 function promptPanel(p,s,h){const {E,btn,icon}=h,d=D.prompt(p,s),v=D.ensure(p);return `<section class="vp-source-panel vp-prompt-panel" aria-label="Video generation prompt"><header><h3>Video prompt</h3><span>Autosaved</span></header><p class="vp-demo-note">Describe how the shot should move. Type @ to reference a project asset.</p>${d.basis!==D.promptBasis(p,s)?'<p class="vp-notice">The shot or visual settings changed. Your prompt is preserved. You can rebuild it from the latest storyboard.</p>':''}<label class="as-sr-only" for="vp-generation-prompt">Video prompt for this shot</label><textarea id="vp-generation-prompt" data-vp-prompt="${s.id}" rows="13" placeholder="Describe motion, camera, and sound. Type @ to reference assets.">${E(d.text)}</textarea><div class="vp-prompt-tools">${btn('@ Reference assets','vp-prompt-assets','',`data-id="${s.id}" aria-expanded="false" aria-controls="vp-prompt-picker"`)}${btn('Rebuild from storyboard','vp-prompt-refresh','',`data-id="${s.id}" title="Rebuild the prompt from the latest storyboard. You can undo this."`)}${s.promptUndo?btn('Undo rebuild','vp-prompt-undo','',`data-id="${s.id}"`):''}</div><div id="vp-prompt-picker" class="vp-prompt-picker" aria-label="Choose asset references" hidden><header><strong>Choose a project asset</strong>${btn(icon('close'),'vp-prompt-close','','aria-label="Close asset picker"')}</header>${v.assets.map(a=>btn(`<span>${E(a.name||'Untitled asset')}</span><small>${E(assetKinds[a.kind]?.label||a.kind)} · ${a.versions.some(x=>x.id===a.adoptedId)?'Reference image in use':'Reference image needed'}</small>`,'vp-prompt-insert','',`data-id="${s.id}" data-asset="${a.id}" data-search="${E(a.name)}"`)).join('')}<p class="vp-picker-empty" ${v.assets.length?'hidden':''}>No matching assets. Add assets in the Assets tab.</p></div><h4>Referenced assets</h4><div data-vp-prompt-references>${referenceCards(p,s)}</div><p class="vp-demo-note" data-vp-prompt-status>${D.stale(p,s)?'The prompt, shot, or assets changed. Your current video is kept.':'The referenced assets are used with this prompt.'}</p></section>`;}
 function updatePromptUI(p,s,el){const picker=host.querySelector('#vp-prompt-picker'),prefix=el.value.slice(0,el.selectionStart),match=prefix.match(/@([^@\s【】]*)$/);if(picker){picker.hidden=!match;let count=0;picker.querySelectorAll('[data-asset]').forEach(b=>{b.hidden=!!match&&!b.dataset.search.includes(match[1]);if(!b.hidden)count++;});picker.querySelector('.vp-picker-empty').hidden=count>0;host.querySelector('[data-action="vp-prompt-assets"]')?.setAttribute('aria-expanded',String(!!match));}const refs=host.querySelector('[data-vp-prompt-references]');if(refs)refs.innerHTML=referenceCards(p,s);const status=host.querySelector('[data-vp-prompt-status]');if(status)status.textContent=s.adoptedId?'Prompt updated. Your current video is kept. You can generate another version.':s.request?'Prompt updated. You can submit a new request.':'Prompt saved automatically.';}
 function generation(p,h){const {E,btn,icon}=h,v=D.ensure(p),s=selectShot(p),version=s?.versions.find(x=>x.id===s.selectedVersion)||s?.versions.find(x=>x.id===s.adoptedId)||s?.versions.at(-1);return `<section><header class="vp-section-heading"><div><h2>Preview and generate shots</h2><p>${E(D.labels.style[v.style]||v.style)} · ${E(v.ratio)} · ${E(v.quality)} <span class="vp-quiet">Preview a version before using it</span></p></div></header><div class="vp-generation-layout">${s?`<div class="vp-generation-main"><div class="vp-generation-top"><div><h3>${E(s.title||'Current shot')}</h3><span>${E(D.labels.framing[s.framing]||s.framing)} · ${E(D.labels.camera[s.camera]||s.camera)} · ${s.duration} sec</span></div><div class="as-row">${btn('Edit shot','vp-edit-shot','',`data-id="${s.id}"`)}${btn(s.adoptedId?'Regenerate shot':'Generate shot','vp-generate','primary',`data-id="${s.id}"`)}</div></div>${D.stale(p,s)?`<p class="vp-notice">The prompt, shot, or assets changed. Review the prompt before generating another version.</p>`:''}<div class="vp-preview-layout">${promptPanel(p,s,h)}<div class="vp-preview-column"><header class="vp-preview-heading"><h3>Video preview</h3><span data-vp-preview-ratio>${E(v.ratio)}</span></header><div class="vp-video-preview" style="--vp-ratio:${v.ratio.replace(':','/')}">${version?`<video controls preload="metadata" src="${E(version.url)}" aria-label="Video version for ${E(s.title||'this shot')}"></video>`:previewDemo?`<video controls preload="metadata" src="assets/short-film/${v.ratio==='9:16'?'shot-1-portrait-demo':'shot-1'}.mp4" poster="assets/short-film/${v.ratio==='9:16'?'shot-1-portrait-demo':'shot-1'}.jpg" aria-label="Sample video preview"></video>`:`<div class="vp-video-empty">${icon('genre')}<h3>${s.request?'Generation request recorded':'Preview this shot'}</h3><p>${s.request?'No video model is connected to this prototype.':'Review the prompt and asset references before requesting a video.'}</p>${btn('Play sample video','vp-demo-preview')}</div>`}</div>${previewDemo&&!version?'<p class="vp-demo-note">Sample video for previewing the player.</p>':''}${s.request?`<p class="vp-demo-note" role="status">Generation request recorded · ${E(new Date(s.request.at).toLocaleTimeString('en'))}${s.request.signature!==D.signature(p,s)?' · The prompt or source changed. You can submit a new request.':''}</p>`:''}<div class="vp-video-actions"><label class="as-btn vp-file-button">Upload video<input type="file" accept="video/mp4,video/webm" data-vp-video="${s.id}" aria-label="Upload a video version for this shot"></label>${version?btn(version.id===s.adoptedId?'Version in use':'Use this version','vp-adopt-video','primary',`data-id="${s.id}" data-version="${version.id}" ${version.id===s.adoptedId?'disabled':''}`):''}</div>${s.versions.length?`<div class="vp-version-list">${s.versions.map((x,i)=>btn('Version '+(i+1)+(x.id===s.adoptedId?' · In use':''),'vp-video-version',x.id===version?.id?'active':'',`data-id="${s.id}" data-version="${x.id}"`)).join('')}</div>`:''}<small class="vp-demo-note">MP4 or WebM, up to 8 MB. Uploads are stored locally.</small></div></div></div>`:`<div class="vp-empty"><h3>No shots in this chapter</h3><p>Add shots to this chapter before generating video.</p>${btn('Go to Storyboard','planning-tab','primary','data-tab="storyboard"')}</div>`}${shotRail(p,h,false)}</div></section>`;}
 function comicReference(p,h){const {E}=h,r=p.video.comicReference;if(!r)return '';const pages=r.chapters.flatMap(c=>c.pages),images=pages.filter(pg=>pg.image).length;return `<details class="vp-comic-reference"><summary>Imported comic reference · ${pages.length} script pages · ${images} adopted images</summary><p>Source: ${E(r.title)}. Use the original script and images as reference when adapting the story for video.</p>${r.chapters.filter(c=>c.pages.length).map(c=>`<details class="vp-comic-chapter"><summary>${E(c.title)} · ${c.pages.length} pages</summary>${c.pages.map(pg=>`<article class="vp-comic-page"><h3>Page ${pg.number} · ${E(pg.pageScript.title||'Comic script')}</h3><div class="vp-comic-page-columns">${pg.image?`<figure><img src="${E(pg.image.url)}" alt="Adopted image for comic page ${pg.number}" loading="lazy"><figcaption>Adopted comic image · Check against the latest script</figcaption></figure>`:''}<div>${root.ComicPageScript.view(pg.pageScript,E,{compact:true})}</div></div></article>`).join('')}</details>`).join('')}</details>`;}
 const bridge={continuousChapters:true,inspirationOverviewOnly:true,projectLabel:'My videos',newLabel:'New video',hasDraft:p=>!!p.video?.body,storageKey:KEY,routePrefix:'#/app/video',create:D.create,newIntent:fresh,load:()=>state,save,download,entryView:entry,baseTabs:D.tabs.slice(0,2),extraTabs:D.tabs.slice(2),overviewNext:'chapters',overviewNextLabel:'Chapters',
 beforeRender(){releasePreview();},
 destroy(){releasePreview();},
 afterRender(p){
   const cover=projectCover(p);
   if(cover){
     const image=document.createElement('img');
     image.className='vp-project-cover';
     image.alt='';
     image.src=cover;
     host.prepend(image);
   }
   const stages=host.querySelector('#video-editor-stage');
   const actions=host.querySelector('.as-plan-context-actions');
   if(stages){
     const row=document.createElement('div');
     row.className='vp-stage-toolbar';
     const scroll=host.querySelector('.as-plan-scroll');
     const tools=scroll.querySelector('.as-plan-toolbar');
     scroll.before(row);
     row.append(stages);
     if(p.agent.planningTab==='overview'){
       row.classList.add('vp-stage-toolbar-overview');
       row.append(tools);
     }else if(actions?.childElementCount){
       row.classList.add('vp-stage-toolbar-with-actions');
       actions.prepend(tools.querySelector('.as-plan-global-actions'));
       tools.remove();
     }else{
       row.before(tools);
     }
     if(actions)row.append(actions);
   }
   releasePreview=root.VideoPreview.mount(host,D.ensure(p).ratio);
 },
 planningSupplement(p,tab,h){return ['overview','chapters','storyboard'].includes(tab)?comicReference(p,h):'';},
 urlFor:p=>'#/app/video?'+new URLSearchParams({project:p.id,...(p.agent.phase==='planning'?{tab:p.agent.planningTab||'overview'}:{})}),
 manualStart(){confirmBoard=false;previewDemo=false;return D.enter(D.create(),'',{manual:true});},
 openStage(p,tab,api){goto(p,tab,api);},
 contentView(p,tab,h){const gate=D.prerequisite(p,tab),has=tab==='chapters'?p.storyChapters.length:tab==='assets'?p.video.assets.length:tab==='storyboard'||tab==='generation'?p.video.shots.length:false;if(gate&&!has)return gateView(gate,h);if(tab==='assets')return assets(p,h);if(tab==='storyboard')return storyboard(p,h);if(tab==='generation')return generation(p,h);return null;},
 contextActions(p,tab,{btn,icon}){
   if(!['assets','storyboard','generation'].includes(tab))return '';
   const v=D.ensure(p),c=D.selectedChapter(p),ss=v.shots.filter(s=>s.chapterId===c?.id);
   const downloadButton=(label,action,disabled=false)=>btn(icon('download'),action,'vp-download-button',`aria-label="${label}" title="${label}" ${disabled?'disabled':''}`);
   const actions=tab==='assets'?btn(icon('spark')+'Extract assets with AI','vp-extract','',D.prerequisite(p,'assets')?'disabled':'')
     :tab==='storyboard'?btn(icon('spark')+'Create storyboard with AI','vp-start-board','',ss.length||D.prerequisite(p,'storyboard')?'disabled title="Existing shots are kept. You can edit them or add new ones."':'')+downloadButton('Download storyboard','vp-export-shots',!v.shots.length)
     :downloadButton('Download project plan','vp-export-project');
   return `<div class="as-plan-context-actions" role="group" aria-label="Stage actions">${actions}</div>`;
 },
 contentOptions(p,h){return {chapterCover:projectCover(p),chapterActions:h.btn('Continue to assets '+h.icon('arrow'),'planning-tab','primary','data-tab="assets"'),chapterFooterNote:'<p>Organize characters, scenes, and props next.</p>'};},
 guideContent(p,tab){
   return {
     assets:{advice:'Tell me which character, scene, or prop you want to adjust.',examples:[['Develop a character','Develop this character’s motivation and appearance while preserving their identity.']]},
     storyboard:{advice:'Tell me which chapter and shot you want to adjust, and what should change.',examples:[['Adjust shot pacing','Review the current chapter’s pacing and suggest where to adjust shot lengths.']]},
     generation:{advice:'Tell me which shot needs a change in action, framing, or timing.',examples:[['Refine this shot','Suggest changes to facial expressions and camera movement based on the storyboard.']]},
   }[tab];
 },
 handleAction(action,el,p,api){if(!action.startsWith('vp-'))return false;const v=D.ensure(p),asset=()=>v.assets.find(a=>a.id===el.dataset.id),shot=()=>v.shots.find(s=>s.id===el.dataset.id);switch(action){
 case 'vp-back':
   if(p.agent.planningOrigin||p.storyChapters.length||wanted||p.agent.planningTab){goto(p,'overview',api);}
   else{api.persist(false);location.hash='/app';}
   return true;
 case 'vp-input':v.input=el.dataset.key;break;
 case 'vp-mode':v.mode=el.dataset.key;break;
 case 'vp-example':v.input='idea';v.mode='agent';v.style='清新日漫';p.agent.draft=root.ScriptFullExample.data.seed;break;
 case 'vp-clear-file':v.fileName='';v.body='';break;
 case 'vp-kind':v.assetKind=el.dataset.key;v.selectedAsset=v.assets.find(a=>a.kind===v.assetKind)?.id||'';break;
 case 'vp-select-asset':v.selectedAsset=el.dataset.id;break;
 case 'vp-add-asset':{const gate=D.prerequisite(p,'assets');if(gate)throw Error(gate.message);D.asset(p,v.assetKind);break;}
 case 'vp-extract':api.startJob('Finding characters, scenes, and props…',()=>{const n=D.extractAssets(p);if(!n)root.Cimora.S.toast('No new assets found. Your existing assets were kept.');});return true;
 case 'vp-asset-generate':{const a=asset();if(!a.name.trim()||!a.description.trim())throw Error('Enter a name and description before generating a reference image.');const fixture={'陆川':'luchuan-main.jpg','许宁':'xuning-main.jpg','孟遥':'mengyao-main.jpg','沈安':'shenan-main.jpg','旧页书店':'bookstore.jpg','旧书与地图':'book-phone.jpg'}[a.name];if(!fixture||C.kind(p)!=='romance')throw Error('Upload a reference image, or try reference images for characters, scenes, and props in the sample story.');api.startJob('Preparing a sample reference image…',()=>{const version={id:M.id('vimage'),url:'comic-studio/examples/romance-two/assets/'+fixture,name:'Anime-style sample · '+a.name};a.versions.push(version);a.selectedVersion=version.id;});return true;}
 case 'vp-adopt-asset':asset().adoptedId=el.dataset.version;break;
 case 'vp-asset-version':asset().selectedVersion=el.dataset.version;break;
 case 'vp-start-board':{const gate=D.prerequisite(p,'storyboard');if(gate)throw Error(gate.message);confirmBoard=true;break;}
 case 'vp-cancel-board':confirmBoard=false;break;
 case 'vp-confirm-board':confirmBoard=false;api.startJob('Creating the chapter storyboard…',()=>D.generateShots(p));return true;
 case 'vp-add-shot':{const gate=D.prerequisite(p,'storyboard');if(gate)throw Error(gate.message);const c=D.selectedChapter(p);D.shot(p,c.id);confirmBoard=false;break;}
 case 'vp-select-chapter':{
   const chapter=p.storyChapters.find(item=>item.id===el.dataset.id);
   if(!chapter)return true;
   if(chapter.id!==D.selectedChapter(p)?.id){
     v.chapter=chapter.id;
     v.selectedShot='';
     confirmBoard=false;
     previewDemo=false;
     api.persist();
     api.render();
   }
   const dropdown=host.querySelector('.vp-chapter-select');
   if(dropdown){
     dropdown.open=false;
     dropdown.querySelector('summary').focus({preventScroll:true});
   }
   return true;
 }
 case 'vp-shot-framing':case 'vp-shot-camera':{
   const field=action==='vp-shot-framing'?'framing':'camera',value=el.dataset.id,s=selectShot(p);
   const dropdown=el.closest('.vp-shot-dropdown');
   if(!s||!dropdown||!Object.hasOwn(D.labels[field],value))return true;
   const container=dropdown.parentElement;
   if(s[field]!==value){
     s[field]=value;
     api.persist();
     dropdown.outerHTML=shotSettingDropdown(s,field,shotSettingLabels[field]);
   }else dropdown.open=false;
   container.querySelector('summary').focus({preventScroll:true});
   return true;
 }
 case 'vp-select-shot':v.selectedShot=el.dataset.id;previewDemo=false;break;
 case 'vp-preview':v.selectedShot=el.dataset.id;goto(p,'generation',api);return true;
 case 'vp-edit-shot':v.selectedShot=el.dataset.id;goto(p,'storyboard',api);return true;
 case 'vp-prompt-assets':{const picker=host.querySelector('#vp-prompt-picker');picker.hidden=!picker.hidden;picker.querySelectorAll('[data-asset]').forEach(b=>b.hidden=false);picker.querySelector('.vp-picker-empty').hidden=!!v.assets.length;el.setAttribute('aria-expanded',String(!picker.hidden));return true;}
 case 'vp-prompt-close':host.querySelector('#vp-prompt-picker').hidden=true;host.querySelector('[data-action="vp-prompt-assets"]').setAttribute('aria-expanded','false');host.querySelector('#vp-generation-prompt').focus();return true;
 case 'vp-prompt-insert':{const s=shot(),input=host.querySelector('#vp-generation-prompt'),end=input.selectionEnd,prefix=input.value.slice(0,input.selectionStart),match=prefix.match(/@([^@\s【】]*)$/),start=match?input.selectionStart-match[0].length:input.selectionStart;const caret=D.insertReference(p,s,el.dataset.asset,start,end);api.persist();api.render();const next=host.querySelector('#vp-generation-prompt');next.focus();next.setSelectionRange(caret,caret);return true;}
 case 'vp-prompt-refresh':D.refreshPrompt(p,shot());break;
 case 'vp-prompt-undo':D.undoPrompt(p,shot());break;
 case 'vp-generate':D.requestGeneration(p,shot());break;
 case 'vp-demo-preview':previewDemo=true;break;
 case 'vp-adopt-video':shot().adoptedId=el.dataset.version;break;
 case 'vp-video-version':shot().selectedVersion=el.dataset.version;break;
 case 'vp-export-shots':download(D.exportShots(p),p.title+'-storyboard.txt');return true;
 case 'vp-export-project':download(JSON.stringify(p,null,2),p.title+'-video-project.json','application/json');return true;
 default:return false;
 }api.persist();api.render();return true;},
 onInput(e,p,api){const el=e.target,v=D.ensure(p);if(el.dataset.vpPrompt){const s=v.shots.find(x=>x.id===el.dataset.vpPrompt);D.setPrompt(p,s,el.value);updatePromptUI(p,s,el);api.scheduleSave();return true;}if(el.id==='vp-seed'){if(v.input==='idea')p.agent.draft=el.value;else v.body=el.value;const b=host.querySelector('.vp-start');if(b)b.disabled=uploadBusy||(v.mode!=='manual'&&!el.value.trim());const count=host.querySelector('[data-vp-count]');if(count&&v.input!=='idea')count.textContent=el.value.replace(/\s/g,'').length+' chars · Original text preserved';api.scheduleSave();return true;}if(el.dataset.vpAsset){const a=v.assets.find(a=>a.id===el.dataset.id);a[el.dataset.vpAsset]=el.value;api.scheduleSave();return true;}if(el.dataset.vpShot){updateShot(el,p);api.scheduleSave();return true;}return false;},
 async onChange(e,p,api){const el=e.target,v=D.ensure(p);try{if(el.dataset.vpShot){updateShot(el,p);api.persist();return true;}if(el.dataset.vpRef){const s=v.shots.find(s=>s.id===el.dataset.id);s.assetIds=el.checked?[...new Set([...s.assetIds,el.dataset.vpRef])]:s.assetIds.filter(id=>id!==el.dataset.vpRef);api.persist();return true;}if(el.id==='vp-file'){const file=el.files[0];if(!file)return true;uploadBusy=true;api.render();let result;if(/\.md$/i.test(file.name)){if(file.size>12*1024*1024)throw Error('Choose a file up to 12 MB.');result={text:await file.text()};}else result=await root.ScriptImport.read(file);if(!result.text.trim())throw Error('No readable text found. Choose another file.');if(!host.isConnected)return true;v.body=result.text;v.fileName=file.name;api.persist();uploadBusy=false;api.render();return true;}if(el.dataset.vpImage){const file=el.files[0];if(!file)return true;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('Choose a PNG, JPG, or WebP image under 8 MB.');const a=v.assets.find(a=>a.id===el.dataset.vpImage),bitmap=await createImageBitmap(file),scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();if(!host.isConnected)return true;const version={id:M.id('vimage'),url:canvas.toDataURL('image/webp',.86),name:file.name};a.versions.push(version);a.selectedVersion=version.id;api.persist();api.render();return true;}if(el.dataset.vpVideo){const file=el.files[0];if(!file)return true;if(!['video/mp4','video/webm'].includes(file.type)||file.size>8*1024*1024)throw Error('Choose an MP4 or WebM video up to 8 MB.');const s=v.shots.find(s=>s.id===el.dataset.vpVideo),url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read the video. Choose another file.'));r.readAsDataURL(file);});if(!host.isConnected)return true;D.candidate(p,s,url,file.name);api.persist();api.render();return true;}}catch(error){uploadBusy=false;api.report(error.message);return true;}return false;},
 onKey(e,p){if(e.key==='Escape'&&host.querySelector('#vp-prompt-picker:not([hidden])')){e.preventDefault();host.querySelector('#vp-prompt-picker').hidden=true;host.querySelector('[data-action="vp-prompt-assets"]').setAttribute('aria-expanded','false');host.querySelector('#vp-generation-prompt').focus();return true;}return false;},
 onSubmit(e,p,api){if(e.target.dataset.form!=='vp-start')return false;e.preventDefault();const v=D.ensure(p),text=v.input==='idea'?p.agent.draft||'':v.body||'';if(v.mode!=='manual'&&!text.trim()){api.report('Describe an idea, paste a story, or select a story file.');return true;}const imported=v.input!=='idea'&&!!text.trim();if(v.mode==='manual'){D.enter(p,text,{manual:true,imported});api.persist();api.render();}else api.startJob(imported?'Reading the story and chapter structure…':'Preparing the synopsis and chapters…',()=>D.enter(p,text,{imported}));return true;}
 };
 function updateShot(el,p){const s=D.ensure(p).shots.find(s=>s.id===el.dataset.id);if(!s)return;if(el.dataset.vpShot==='content'){D.setShotContent(s,el.value);return;}s[el.dataset.vpShot]=el.dataset.vpShot==='duration'?Math.max(1,Math.min(60,Number(el.value)||6)):el.value;}
 host.classList.add('vp-workspace');return root.mountScriptStudio(host,bridge);
}
root.VideoStoryWorkspace={read,mount,KEY};
const app=root.Cimora;let mounted=null;const oldRoute=app.route;
function handles(r){return r.parts[0]==='app'&&((r.parts[1]==='video'&&(!r.params.has('project')||r.params.get('project').startsWith('video-sc-')))||(r.parts[1]==='new'&&r.params.get('output')==='motion'&&!r.params.has('project')));}
app.route=r=>handles(r)?'<div id="script-workspace" class="ss-workspace vp-workspace" aria-label="Video workspace"></div>':oldRoute(r);
const oldAfter=app.afterRender;app.afterRender=r=>{mounted?.destroy();mounted=null;oldAfter(r);if(!handles(r))return;document.body.classList.add('cimora-script-workspace');const crumb=document.querySelector('.cm-breadcrumb strong');if(crumb)crumb.textContent='Video workspace';const host=document.getElementById('script-workspace');if(host)try{mounted=mount(host,r.params);}catch(error){host.innerHTML='<p role="alert">'+app.E(error.message)+'</p><a href="#/app/video?intent=new">Start a new video</a>';}};
})(globalThis);
