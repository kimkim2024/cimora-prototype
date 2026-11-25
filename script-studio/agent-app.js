(function(root){
'use strict';
const M=root.ScriptStudio,A=root.StoryAgent,P=root.StoryPlanning,C=root.StoryContent,Entry=root.CreationEntry,E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guideAvatar='assets/assistant-bighetti-avatar.png';
const guideName='MORA AI';
const guideTabLabels={overview:'Story Overview',characters:'Characters','story-outline':'Story Outline',chapters:'All Chapters',assets:'Assets',storyboard:'Storyboard',generation:'Video',arrangement:'Comic Layout',production:'Comic Production'};
const icon=(name)=>{const shapes={heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',smile:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM8 9h.01M16 9h.01M7 14q5 7 10 0',rise:'m3 17 6-6 4 4 8-10m-6 0h6v6',bolt:'m13 2-9 12h7l-1 8 10-13h-7Z',person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-3a7 7 0 0 1 14 0v3',genre:'M4 5h16v14H4ZM8 9h8M8 13h5',core:'M12 2v4m0 12v4M2 12h4m12 0h4M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0',style:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3-4-6-9-6M7 9h.01M9 6h.01M15 6h.01',chat:'M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.6-3.2A7.5 7.5 0 1 1 20 11.5ZM9.5 10h6m-6 3h4',spark:'M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',up:'M12 19V5m-6 6 6-6 6 6',download:'M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5',attach:'M21.4 11.1 12 20.5a5.5 5.5 0 0 1-7.8-7.8l9.4-9.4a3.7 3.7 0 0 1 5.2 5.2l-9.4 9.4a1.8 1.8 0 0 1-2.6-2.6l8.7-8.7',send:'m5 12 14-7-5 14-2-7-7 0m7 0 7-7',book:'M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4Zm8 2v15',edit:'m4 16 12-12 4 4L8 20H4Zm10-10 4 4',check:'m5 12 4 4L19 6',arrow:'M4 12h16m-6-6 6 6-6 6',back:'M20 12H4m6 6-6-6 6-6',folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',close:'m6 6 12 12M18 6 6 18',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z',history:'M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 3'};return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(shapes[name]||shapes.book)+'"/></svg>';};
root.mountScriptStudio=function(host,bridge){
 const storageKey=bridge.storageKey||'cimora-script-studio-v1',routePrefix=bridge.routePrefix||'#/app/script',createProject=bridge.create||M.create;const state=bridge.load();let p=bridge.newIntent?createProject():state.projects.find(x=>x.id===state.active)||createProject();A.init(p);
 let panel='',editor=null,targetKey='',notice='',guideNotice='',saveStatus='Autosave enabled',busy='',activeJob=null,timer=null,dead=false,mobile='agent',handoffEpisode='',draftTimer=null,pendingAsset=null,planEditKey='',planEditAt=0,contentEditKey='',contentEditAt=0,guideMobileOpen=false,entryUploadBusy=false;
 const $=s=>host.querySelector(s),btn=(text,action,cls='',extra='')=>`<button type="button" class="as-btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
 function persist(updateUrl=true){if(!p.original&&!p.outline.length&&!p.agent.draft&&!p.agent.planning&&!p.agent.entry&&!bridge.hasDraft?.(p))return;try{const latest=JSON.parse(localStorage.getItem(storageKey)||'null');if(latest?.version===1&&Array.isArray(latest.projects)&&Array.isArray(latest.assets)){state.projects=latest.projects;state.assets=latest.assets;}}catch{}if(pendingAsset){const ai=state.assets.findIndex(x=>x.assetId===pendingAsset.assetId);if(ai<0)state.assets.push(pendingAsset);else state.assets[ai]=pendingAsset;}p.workspaceVisitedAt=new Date().toISOString();state.active=p.id;const i=state.projects.findIndex(x=>x.id===p.id);if(i<0)state.projects.push(p);else state.projects[i]=p;saveStatus=bridge.save(state)===false?'Save failed · Export a backup':'Saved locally';if(updateUrl&&location.hash.startsWith(routePrefix)&&!location.hash.includes('project='+p.id))history.replaceState(null,'',routePrefix+'?project='+encodeURIComponent(p.id));if(updateUrl&&bridge.urlFor&&location.hash.split('?')[0]===routePrefix){const nextUrl=bridge.urlFor(p);if(location.hash!==nextUrl)history.replaceState(null,'',nextUrl);}const el=$('[data-save]');if(el)el.textContent=saveStatus;return !saveStatus.startsWith('Save failed');}
 function report(msg){notice=msg;render();}
 function finishJob(status,error=''){if(activeJob){activeJob.status=status;activeJob.progress=status==='done'?100:activeJob.progress;activeJob.error=error;activeJob.finishedAt=new Date().toISOString();}activeJob=null;}
 function startJob(label,fn,steps=[]){if(busy)return;busy=label;notice='';activeJob={id:M.id('task'),title:label,status:'running',progress:0,model:'Local simulation',tab:p.agent.planningTab||'overview',chapterId:p.agent.selectedChapter||p.video?.chapter||'',createdAt:new Date().toISOString()};p.workspaceTasks??=[];p.workspaceTasks.push(activeJob);if(persist()===false){finishJob('failed','Save failed');busy='';return;}render();let step=0;const advance=()=>{if(dead)return;if(step<steps.length){busy=steps[step++];if(activeJob)activeJob.progress=Math.round(step/(steps.length+1)*100);persist();render();timer=setTimeout(advance,650);return;}try{const owner=p;fn();if(activeJob&&owner!==p){owner.workspaceTasks=owner.workspaceTasks.filter(j=>j!==activeJob);p.workspaceTasks??=[];p.workspaceTasks.push(activeJob);}finishJob('done');persist();}catch(e){finishJob('failed',e.message);notice=e.message;persist();bridge.onJobError?.();}busy='';timer=null;render();};timer=setTimeout(advance,650);}

 function actionTools(key){const locked=p.agent.locks.includes(key);return `<div class="as-inline-tools">${btn(icon('edit')+'Edit','edit','',`data-key="${E(key)}" ${locked?'disabled':''}`)}${btn(icon('spark')+'Revise with AI','revise','',`data-key="${E(key)}" ${locked?'disabled':''}`)}${btn(locked?'Locked':'Lock','lock',locked?'as-locked':'',`data-key="${E(key)}" aria-pressed="${locked}"`)}</div>`;}
 function milestones(){const a=p.agent,items=[['idea','Idea and length'],['foundation','Story foundation'],['script','Script'],['delivery','Handoff']];return `<nav class="as-milestones" aria-label="Writing stages">${items.map(([id,name],i)=>{const available=id==='idea'||id==='foundation'&&p.outline.length||id==='script'&&Object.keys(p.scripts).length||id==='delivery'&&Object.keys(p.scripts).length;return btn(`<span>${i+1}</span>${name}`,'view',a.view===id?'active':'',`data-view="${id}" ${available?'':'disabled'} aria-current="${a.view===id?'step':'false'}"`);}).join('')}</nav>`;}
 function next(){const a=p.agent;if(busy)return `<div class="as-next" role="status"><strong>${E(busy)}</strong><p>Working on your story. You can cancel at any time.</p>${btn('Cancel','cancel')}</div>`;
 if(a.pending)return `<div class="as-next"><strong>Review your revision</strong><p>Your original is saved. Compare the revision before applying it.</p>${btn('View revision','pending','primary')}</div>`;
 if(a.phase==='idea')return `<div class="as-next"><strong>Start with an idea</strong><p>Start with a character, a conflict, or a scene. You can also try the sample.</p>${btn('Try Before Leaving the City','demo','primary')}</div>`;
 if(a.phase==='proposal')return `<div class="as-next"><strong>Choose a direction</strong><p>Choose a direction and confirm the length. Suggested: ${E(a.plans[0]?.title)}.</p><div class="as-mini-summary">${E(a.plans[a.selected]?.title)}<br>${a.count} episodes · about ${a.minutes} minutes per episode</div>${btn('Confirm and draft the story foundation','foundation','primary')}</div>`;
 if(!a.foundation)return `<div class="as-next"><strong>Confirm your story foundation</strong><p>Review the characters’ motivations and episode outlines, then ${Object.keys(p.scripts).length?'review existing scripts':'draft the first episode'}.</p>${btn(Object.keys(p.scripts).length?'Confirm updated foundation':'Confirm and draft episode 1','confirm-foundation','primary')}</div>`;
 const first=p.outline[0];if(!p.scripts[first.id])return `<div class="as-next"><strong>Start with episode 1</strong><p>Use the first episode to check the voice and pacing.</p>${btn('Generate episode 1','pilot','primary')}</div>`;
 const selected=p.outline.find(e=>e.id===p.selectedEpisode)||first;
 if(a.stale.length)return `<div class="as-next"><strong>${a.stale.length} episodes need review</strong><p>The story foundation changed and existing scripts were kept. Review the affected episodes.</p>${btn('Review affected scripts','review-stale','primary')}</div>`;
 if(!a.approved.includes(first.id))return `<div class="as-next"><strong>How does episode 1 read?</strong><p>Edit the dialogue and scenes, then confirm the episode to continue in this direction.</p>${btn('View episode 1','first')}${btn('Confirm episode 1','approve-first','primary')}</div>`;
 if(p.outline.some(e=>!p.scripts[e.id]))return `<div class="as-next"><strong>Finish the remaining episodes</strong><p>The first episode is confirmed. Continue with the same characters and story direction.</p>${btn('Generate '+p.outline.filter(e=>!p.scripts[e.id]).length+' remaining episodes','remaining','primary')}</div>`;
 if(!a.approved.includes(selected.id))return `<div class="as-next"><strong>Review “${E(selected.title)}”</strong><p>Confirm each episode before handing it off, or confirm them all to hand off the full story.</p>${btn('Confirm episode','approve','primary')}</div>`;
 const unapproved=p.outline.find(e=>!a.approved.includes(e.id));return `<div class="as-next"><strong>${unapproved?'Episode confirmed':'Story ready'}</strong><p>${unapproved?'There are '+(p.outline.length-a.approved.length)+' episodes left to review. You can use any confirmed episode now.':'The next stage includes characters, setting, and scripts.'}</p>${unapproved?btn('Review next episode','next-episode'):''}${btn('View handoff','delivery','primary')}</div>`;}
 function agentPanel(){const a=p.agent;return `<aside class="as-agent" aria-label="AI Writing Assistant"><header class="as-agent-heading"><span class="as-agent-symbol">${icon('spark')}</span><div><strong>AI Writing Assistant</strong><span>Develop an idea into a story</span></div><span class="as-prototype">Demo</span></header><div class="as-dialogue" aria-label="Conversation">${a.messages.slice(-8).map(m=>`<div class="as-message ${m.role}"><span>${m.role==='user'?'You':'Cimora'}</span><p>${E(m.text)}</p></div>`).join('')}</div>${next()}<form class="as-composer" data-form="chat">${targetKey?`<div class="as-context">Discussing ${E(A.target(p,targetKey).label)} ${btn('Cancel','untarget')}</div>`:''}<label class="as-sr-only" for="as-chat">Enter a story idea or revision request</label><textarea id="as-chat" rows="3" placeholder="${a.phase==='idea'?'Describe your story idea…':'Describe your edit or choose a section on the right…'}">${E(a.draft||'')}</textarea><div class="as-composer-bottom"><span>Editable sample</span><button class="as-btn primary" type="submit" ${busy?'disabled':''} aria-label="Send to the writing assistant">${icon('send')}</button></div></form></aside>`;}
 function ideaView(){const a=p.agent;if(a.phase==='idea')return `<div class="as-welcome"><div class="as-welcome-icon">${icon('book')}</div><h1>Turn an idea into a story you can film.</h1><p>Develop a concept, build characters, outline episodes, and write a script.</p><div class="as-start-example"><div><h2>Before Leaving the City</h2><p>Three days before leaving town, a friend request from an ex sets up a story about second chances and boundaries.</p><span>Sample story · 3 directions · up to 10 episodes</span></div>${btn('Start with AI '+icon('arrow'),'demo','primary')}</div><details class="as-import"><summary>Import existing text</summary><label>Original text<textarea id="as-source" rows="5" placeholder="Paste a story, novel excerpt, or script"></textarea></label><label>Or choose a TXT or DOCX file<input type="file" id="as-file" accept=".txt,.docx"></label><p>Files are read locally. Use your own text to plan and edit the story.</p>${btn('Organize with AI','import','primary')}</details></div>`;
 if(!a.plans.length)return `<div class="as-document"><h1>Existing story imported</h1><p>Your original direction and text were kept. Continue in Story foundation.</p><section class="as-prose"><h2>${E(p.title)}</h2><p>${E(p.story)}</p></section></div>`;
 return `<div class="as-document"><div class="as-doc-heading"><div><h1>Choose the story you want to tell</h1><p>Compare the conflicts and endings, then choose a direction.</p></div><span class="as-status">${a.phase==='proposal'?'Awaiting confirmation':'Direction confirmed'}</span></div><div class="as-proposals" role="group" aria-label="Story directions">${a.plans.map((plan,i)=>`<article class="as-proposal ${a.selected===i?'selected':''}"><div class="as-proposal-top"><span>Option ${i+1}${i===0?' · AI suggestion':''}</span><input aria-label="Choose ${E(plan.title)}" type="radio" name="proposal" value="${i}" ${a.selected===i?'checked':''} ${a.phase!=='proposal'?'disabled':''}></div><h2>${E(plan.title)}</h2><p class="as-hook">${E(plan.hook)}</p><dl><dt>Main conflict</dt><dd>${E(plan.conflict)}</dd><dt>Ending</dt><dd>${E(plan.ending)}</dd></dl></article>`).join('')}</div><section class="as-length"><div><h2>How long should the story be?</h2><p>Your episode count shapes the outline. Episode duration is a target.</p></div><label>Episodes<select id="as-count" ${a.phase!=='proposal'?'disabled':''}>${[3,5,10].map(n=>`<option value="${n}" ${a.count===n?'selected':''}>${n} episodes · ${n===3?'Short':n===5?'Standard':'Extended'}</option>`).join('')}</select></label><label>Target duration<select id="as-minutes" ${a.phase!=='proposal'?'disabled':''}>${[1,3,5].map(n=>`<option value="${n}" ${a.minutes===n?'selected':''}>About ${n} minutes per episode</option>`).join('')}</select></label></section><p class="as-footnote">${a.demo?'The three directions share a setting. The sample adapts key scenes, and actual duration may vary.':'This prototype demonstrates story structure with sample content.'}</p></div>`;}
 function foundationView(){const a=p.agent;return `<div class="as-document"><div class="as-doc-heading"><div><h1>${E(p.title)}</h1><p>${p.outline.length} episodes · Story foundation ${a.foundation?'Confirmed':'Ready for review'}</p></div>${btn('Writing constraints','advanced')}</div><nav class="as-tabs" aria-label="Story foundation sections">${[['overview','Synopsis and setting'],['characters','Character profiles · '+p.characters.length],['outline','Episode outlines · '+p.outline.length]].map(([id,label])=>btn(label,'tab',a.tab===id?'active':'',`data-tab="${id}" aria-pressed="${a.tab===id}"`)).join('')}</nav>${a.tab==='overview'?`<section class="as-prose"><h2>Story synopsis</h2><p>${E(p.story)}</p>${actionTools('story')}</section><section class="as-prose"><h2>World and setting</h2><p>${E(p.facts||p.adoptedPlan?.world||'No setting has been added.')}</p>${actionTools('facts')}</section><details><summary>View original idea</summary><p>${E(p.original)}</p></details>`:a.tab==='characters'?p.characters.map((c,i)=>`<section class="as-character"><div class="as-character-title"><span class="as-avatar">${E(c.name.slice(0,1))}</span><div><h2>${E(c.name)}</h2><span>${E(c.identity||c.role||'Character')}</span></div></div><div class="as-character-meta"><p><strong>Relationships</strong>${E(c.relation||'Needs details')}</p>${actionTools('person/'+c.id+'/relation')}</div><p>${E(c.background||'Add the character’s backstory and motivation.')}</p>${actionTools('person/'+c.id+'/background')}<details><summary>Edit name or identity</summary>${actionTools('person/'+c.id+'/name')}${actionTools('person/'+c.id+'/identity')}</details></section>`).join(''):p.outline.map((ep,i)=>`<section class="as-episode-outline"><span class="as-episode-number">${String(i+1).padStart(2,'0')}</span><div><h2>${E(ep.title)}</h2><p>${E(ep.events)}</p><p class="as-secondary">${E(ep.ending||'')}</p>${actionTools('episode/'+ep.id+'/events')}</div></section>`).join('')}</div>`;}
 function scriptView(){const a=p.agent,ep=p.outline.find(e=>e.id===p.selectedEpisode)||p.outline[0],script=p.scripts[ep.id];return `<div class="as-script-top"><label>Current episode<select id="as-episode">${p.outline.map((e,i)=>`<option value="${e.id}" ${ep.id===e.id?'selected':''}>Episode ${i+1} · ${E(e.title)}${a.stale.includes(e.id)?' · Needs review':a.approved.includes(e.id)?' · Confirmed':p.scripts[e.id]?' · Ready for review':' · No draft'}</option>`).join('')}</select></label><span>Confirmed ${a.approved.length} / ${p.outline.length} episodes</span></div><div class="as-document as-screenplay"><div class="as-doc-heading"><div><h1>${E(ep.title)}</h1><p>Shared scene script for comics and video</p></div><span class="as-status">${a.stale.includes(ep.id)?'Needs review':a.approved.includes(ep.id)?'Confirmed':'Ready for review'}</span></div>${a.stale.includes(ep.id)?`<div class="as-alert"><strong>Story foundation updated</strong><p>Check this episode against the latest characters and outline. Edit it or keep the current draft.</p>${btn('Keep reviewed draft','resolve','',`data-id="${ep.id}"`)}</div>`:''}${!script?`<div class="as-empty"><h2>No draft for this episode</h2><p>Confirm the first episode before drafting the rest.</p></div>`:script.fullText?`<section class="as-prose"><p>${E(script.fullText)}</p>${actionTools('body/'+ep.id)}</section>`:script.scenes.map((s,i)=>`<section class="as-scene"><div class="as-scene-heading"><span>Scene ${String(i+1).padStart(2,'0')}</span><h2>${E(s.title.replace(/^场景\s*\d+\s*/,''))}</h2></div><div class="as-scene-meta"><span>${E(s.place||'Location pending')}</span><span>${E(s.time||'Time pending')}</span></div><div class="as-scene-block"><h3>Action and visuals</h3><p>${E(s.action)}</p>${actionTools('scene/'+s.id+'/action')}</div><div class="as-scene-block as-dialogue-block"><h3>Dialogue</h3><p>${E(s.dialogue||'No dialogue')}</p>${actionTools('scene/'+s.id+'/dialogue')}</div></section>`).join('')}<p class="as-footnote">${E(script?.authorship||'')}. Plan comic panels, video shots, and camera movement in the next stage.</p>${script&&!a.approved.includes(ep.id)&&!a.stale.includes(ep.id)?btn('Confirm reviewed episode','approve','primary'):''}</div>`;}
 function deliveryView(){const a=p.agent,selected=handoffEpisode||p.selectedEpisode||p.outline[0].id;handoffEpisode=selected;const id=selected==='all'?'':selected,ready=A.ready(p,id);return `<div class="as-document"><div class="as-doc-heading"><div><h1>Continue to production</h1><p>Save a version to use as a starting point for comics or video.</p></div></div><div class="as-delivery-summary"><h2>${E(p.title)}</h2><p>Synopsis and setting · ${p.characters.length} characters · ${p.outline.length} episode outlines · ${Object.keys(p.scripts).length} episode scripts</p><label>Handoff scope<select id="as-handoff"><option value="all" ${selected==='all'?'selected':''}>Entire story</option>${p.outline.map((e,i)=>`<option value="${e.id}" ${selected===e.id?'selected':''}>Episode ${i+1} · ${E(e.title)}</option>`).join('')}</select></label><p class="${ready?'as-success':'as-secondary'}">${ready?'Confirmed and ready for handoff.':'Confirm the story foundation, review changes, and approve the scripts before handing off this selection.'}</p></div><div class="as-delivery-options"><section><h2>Continue as a comic</h2><p>Bring characters, scene actions, and dialogue into the comic layout.</p>${btn('Open comic workspace '+icon('arrow'),'handoff-comic','primary',ready?'':'disabled')}</section><section><h2>Continue as a video</h2><p>Bring characters and scripts into the video workspace to plan shots and pacing.</p>${btn('Open video workspace '+icon('arrow'),'handoff-video','primary',ready?'':'disabled')}</section></div><div class="as-export"><h2>Save and export</h2><p>Save a snapshot for later use. Projects created from it keep that version.</p><div class="as-row">${btn('Save story snapshot','publish','',ready?'':'disabled')}${btn('Download script (TXT)','export-txt')}${btn('Export project (JSON)','export-json')}</div></div></div>`;}
 function videoProjectsDrawer(){
   const cards=state.projects.filter(project=>!project.deletedAt).map(project=>{
     const count=project.storyChapters?.length||0;
     const current=project.id===p.id;
     const title=project.title?.trim()||'Untitled video';
     const details=`<span class="vp-project-card-copy"><strong>${E(title)}</strong><small>${count} ${count===1?'chapter':'chapters'}</small></span>`;
     const indicator=current?'<span class="vp-project-current">Current</span>':icon('arrow');
     return btn(details+indicator,'open-project','vp-project-card',`data-id="${E(project.id)}"${current?' aria-current="true"':''}`);
   }).join('');
   return `<aside class="as-drawer vp-project-drawer" aria-label="My projects">
     <header><h2>${icon('folder')}<span>My projects</span></h2>${btn(icon('close'),'close','vp-project-close','aria-label="Close panel" title="Close panel"')}</header>
     <div class="as-drawer-content">
       ${btn('<span aria-hidden="true">+</span> New video','new','vp-project-new')}
       ${cards?`<div class="as-project-list">${cards}</div>`:'<p>No video projects yet.</p>'}
     </div>
   </aside>`;
 }
 function closeVideoProjectsDrawer(){
   const drawer=$('.vp-project-drawer');
   if(!drawer)return false;
   panel='';
   drawer.inert=true;
   $('.as-entry-projects-icon')?.focus();
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){
     drawer.remove();
   }else{
     const {opacity,transform}=getComputedStyle(drawer);
     drawer.animate([{opacity,transform},{opacity:0,transform:'translateX(24px)'}],{
       duration:180,easing:'ease-in',fill:'forwards',
     }).finished.then(()=>drawer.remove(),()=>drawer.remove());
   }
   return true;
 }
 function panelView(){if(!panel)return '';if(panel==='projects'&&bridge.continuousChapters&&p.agent.phase==='idea')return videoProjectsDrawer();let body='',title='';if(panel==='edit'&&editor){title='Edit '+editor.label;body=`<p>Saving updates the project and keeps the previous version.</p><label>Content<textarea id="as-edit-value" rows="14">${E(editor.value)}</textarea></label>${btn('Save changes','save-edit','primary')}`;}if(panel==='pending'&&p.agent.pending){const c=p.agent.pending;title='Review revision · '+c.label;body=`<p>${E(c.note)}</p><details><summary>View original</summary><p class="as-before">${E(c.before)}</p></details><label>Suggested text · Editable<textarea id="as-candidate" rows="13">${E(c.after)}</textarea></label><div class="as-row">${btn('Apply revision','accept','primary')}${btn('Keep original','reject')}</div>`;}if(panel==='revise'){title='Revise with AI';body=`<p>Scope: ${E(A.target(p,targetKey).label)}</p><label>Revision request<textarea id="as-request" rows="4" placeholder="For example, clarify the motivation while keeping the backstory"></textarea></label><div class="as-suggestions">${btn('Shorten this passage','preset-request','',`data-request="精简这段内容"`)}${targetKey.startsWith('person/')?btn('Clarify motivation','preset-request','',`data-request="补充人物动机"`):''}${p.agent.demo&&targetKey.endsWith('/dialogue')?btn('Tone down the dialogue','preset-request','',`data-request="对白更克制"`):''}</div>${btn('Generate revision','request','primary')}<p class="as-footnote">Try shortening the text, developing motivation, or editing dialogue. Add other requests to the draft manually.</p>`;}if(panel==='advanced'){title='Writing constraints';body=`<p>List any details or rules that should stay consistent.</p><label>Writing constraints<textarea id="as-constraints" rows="8" placeholder="For example, keep the planned departure and avoid conflicts driven by misunderstandings">${E(p.agent.constraints)}</textarea></label><p>This prototype saves your constraints with the project.</p>${btn('Save constraints','constraints','primary')}<h2>Locked content</h2>${p.agent.locks.length?p.agent.locks.map(k=>`<div class="as-history-item"><span>${E(A.target(p,k).label)}</span>${btn('Unlock','lock','',`data-key="${E(k)}"`)}</div>`).join(''):'<p>No content is locked. Lock any section you want to protect from revisions.</p>'}`;}if(panel==='history'){title='Version history';body=`<p>The last 12 changes are kept. Restoring an older version also saves the current one.</p>${p.agent.history.map(v=>`<div class="as-history-item"><div><strong>${E(v.label)} · Previous version</strong><span>${E(new Date(v.at).toLocaleString('zh-CN'))}</span></div>${btn('Restore','restore','',`data-id="${v.id}"`)}</div>`).join('')||'<p>Versions appear here once you start editing.</p>'}`;}if(panel==='projects'){title=bridge.projectLabel|| (bridge.comic?'My Comic Projects':'My Story Projects');body=`${btn(bridge.newLabel||(bridge.comic?'New comic':'New story'),'new','primary')}<div class="as-project-list">${state.projects.filter(x=>!x.deletedAt).map(x=>`<div class="as-history-item"><div><strong>${E(x.title)}</strong><span>${x.storyChapters?.length||0} chapters · ${x.id===p.id?'Current project':'Local draft'}</span></div>${btn('Open','open-project','',`data-id="${x.id}"`)}</div>`).join('')}</div>`;}return `<aside class="as-drawer" aria-label="${E(title)}"><header><h2>${E(title)}</h2>${btn(icon('close'),'close','',`aria-label="Close panel"`)}</header><div class="as-drawer-content">${body}</div></aside>`;}
 function entryView(){const custom=bridge.entryView?.(p,{E,btn,icon,busy,notice});if(custom!=null)return custom+panelView();const e=Entry.ensure(p);return Entry.view(p,{E,btn,icon,busy,notice},{state:e,kind:bridge.comic?'漫画':'故事',uploadBusy:entryUploadBusy,resume:!!p.agent.planning,compactComposer:!bridge.comic&&!p.agent.planning,settings:bridge.entrySettings?.(p)||[],extra:bridge.entryControls?.(p,{E,btn,icon,busy:busy||entryUploadBusy})||''})+panelView();}
 function startEntry(){if(busy||entryUploadBusy)return;try{if(!Entry.canStart(p))throw Error('Describe your idea, paste text, or upload a story file.');clearTimeout(draftTimer);if(persist()===false)throw Error('Your draft has not been saved. Try saving again first.');const manual=Entry.ensure(p).mode==='manual';const complete=()=>{p=Entry.begin(p,{M,A,P,C,example:root.ScriptFullExample.data,create:createProject,comic:bridge.comic?root.ComicStoryModel:null});guideMobileOpen=false;panel='';notice='';bridge.afterEntryStart?.(p);};if(manual){complete();persist();render();}else startJob('Drafting the story setting and synopsis…',complete);}catch(error){report(error.message);}}

 function guideIsOpen(){if(bridge.inlineGuide?.(p))return !!bridge.inlineGuideOpen?.(p);return innerWidth<=1600?guideMobileOpen:!p.agent.guideCollapsed;}
 function guideToggle(open){
   const entering=open&&!guideIsOpen();
   const scroll=$('.as-plan-scroll')?.scrollTop||0;
   if(innerWidth<=1600)guideMobileOpen=open;else p.agent.guideCollapsed=!open;
   persist();render();
   if($('.as-plan-scroll'))$('.as-plan-scroll').scrollTop=scroll;
   if(open){
     if(entering)$('.as-guide-sidebar')?.classList.add('as-guide-entering');
     const thread=$('.as-guide-thread');
     if(thread)thread.scrollTop=thread.scrollHeight;
     $('#as-guide-request')?.focus({preventScroll:true});return;
   }
   const chapterId=p.agent.guideScope?.startsWith('chapter:')?p.agent.guideScope.slice(8):p.agent.selectedChapter;
   const trigger=$('[data-action="planning-guide-toggle"]')||(chapterId?$(`[data-action="chapter-ai-edit"][data-id="${CSS.escape(chapterId)}"]`):null);
   trigger?.focus({preventScroll:true});
 }
 function refreshGuide(focusSelector, revealRevision=false){
   const scroll=$('.as-plan-scroll')?.scrollTop||0;
   render();
   const main=$('.as-plan-scroll');
   if(main)main.scrollTop=scroll;
   const thread=$('.as-guide-thread'), revision=revealRevision&&$('.as-revision');
   if(thread){
     thread.scrollTop=revision
       ? revision.getBoundingClientRect().top-thread.getBoundingClientRect().top-8
       : thread.scrollHeight;
   }
   if(focusSelector)$(focusSelector)?.focus({preventScroll:true});
 }
 function revisionView(revision){
   if(!revision)return '';
   const {items,status}=revision;
   const scope=revision.scope==='chapters'?`All Chapters · ${items.length} ${items.length===1?'chapter':'chapters'}`:items[0].title||'Untitled Chapter';
   if(status==='applied')return `<section class="as-revision as-revision-applied" aria-label="Revision applied"><h3 tabindex="-1">${icon('check')} Revision applied</h3><p>${E(scope)}</p>${btn('Done','chapter-revision-dismiss')}</section>`;
   const preview=status==='preview';
   return `<section class="as-revision" aria-label="Chapter revision review">
     <header><span class="as-revision-icon">${icon('edit')}</span><div><h3 tabindex="-1">${preview?'Revision preview':'Confirm revision scope'}</h3><p>${E(scope)}</p></div></header>
     <p class="as-revision-note">${preview?'Edit this sample if needed. Your chapter updates when you apply it.':'Preview a shorter draft generated by the prototype’s local rules.'}</p>
     ${preview?items.map((item,index)=>`<details class="as-revision-chapter" ${index===0?'open':''}>
       <summary>${E(item.title||'Untitled Chapter')}</summary>
       <details><summary>View original</summary><p>${E(item.before)}</p></details>
       <label>Suggested text<textarea rows="5" data-revision-id="${E(item.id)}" aria-label="Suggested text for ${E(item.title||'Untitled Chapter')}">${E(item.after)}</textarea></label>
     </details>`).join(''):''}
     <div class="as-revision-actions">${btn('Keep original','chapter-revision-dismiss')}${preview?btn('Apply changes','chapter-revision-apply','primary'):btn('Preview sample','chapter-revision-preview','primary')}</div>
   </section>`;
 }
 const guideTabs=()=>[...(bridge.baseTabs||[['overview','故事梗概'],['characters','人物小传'],['chapters','全部故事章节']]),...(bridge.extraTabs||[])];
 function guideScopeOptions(tabs=guideTabs()){
 return [
   ...tabs.map(([value,label])=>({value,label:guideTabLabels[value]||label})),
   ...(bridge.guideScopes?.(p)||[]).map(([value,label])=>({value,label,shortLabel:'Outline'})),
   ...p.storyChapters.map((chapter,index)=>({value:'chapter:'+chapter.id,label:`Chapter ${index+1} · ${chapter.title||'Untitled Chapter'}`,shortLabel:`Chapter ${index+1}`})),
 ];
 }
 function selectedGuideScope(options){
 return options.find(option=>option.value===p.agent.guideScope)||options.find(option=>option.value===(p.agent.planningTab||'overview'))||options[0];
 }
 function planningGuide(){
 if(bridge.inlineGuide?.(p))return '';
 const a=p.agent,tab=a.planningTab||'overview';
 const tabs=guideTabs(),options=guideScopeOptions(tabs),selected=selectedGuideScope(options);
 const scope=selected.value,isChapter=scope==='chapters'||scope.startsWith('chapter:'),guideExtra=bridge.guideContent?.(p,tab,scope);
 const advice=isChapter?'What would you like to change in this chapter? Try starting with pacing, conflict, or character motivation.':guideExtra?.advice||(tab==='characters'?'Tell me which character you want to develop and what you’d like to change.':'Tell me what you’d like to change in the story overview.');
 const examples=isChapter?[
   ['Adjust pacing','Tighten the pacing and cut repetition while keeping the key events.'],
   ['Raise the stakes','Strengthen the conflict between the characters while keeping the current ending.'],
   ['Clarify motivation','Make the characters’ motivations clearer while preserving their established traits.'],
 ]:guideExtra?.examples||[['Strengthen conflict','Strengthen the main conflict while keeping the current story direction.'],['Develop character motivation','Develop the characters’ motivations while preserving their backstories.']];
 const legacyScopes={'故事梗概':'Story Overview','人物小传':'Characters','故事大纲':'Story Outline','故事章节':'All Chapters','全部故事章节':'All Chapters','项目资产':'Assets','分镜剧情':'Storyboard','视频生成':'Video','漫画编排':'Comic Layout','生成与编辑':'Comic Production'};
 const displayScope=label=>(Object.hasOwn(legacyScopes,label)?legacyScopes[label]:label.replace(/^第 (\d+) 章(大纲)?(?= · |$)/,(_,number,outline)=>`Chapter ${number}${outline?' Outline':''}`));
 const messages=a.guideMessages||[],revision=a.chapterRevision;
 const revisionIndex=revision?messages.findLastIndex(message=>message.chapterRevision&&message.text===revision.request):-1;
 return `<aside class="as-guide-sidebar" aria-label="Cimora AI Assistant">
   <header class="as-guide-head">
     <div class="as-guide-brand">
       <img class="as-guide-portrait" src="${guideAvatar}" alt="" width="36" height="36">
       <div class="as-guide-name"><h2>${guideName}</h2><p>Cimora AI Assistant</p></div>
     </div>
     ${root.CimoraActivityDropdown.render({label:'Revision scope',options,value:scope,action:'planning-guide-scope',className:'as-guide-scope',compact:true})}
     ${btn(icon('close'),'planning-guide-close','',`aria-label="Close assistant" title="Close assistant"`)}
   </header>
   <div class="as-guide-thread" role="log" aria-label="Revision conversation">
     ${messages.length?'':`<div class="as-guide-assistant"><div class="as-guide-welcome"><p>${E(advice)}</p><div class="as-guide-examples">${examples.map(([example,request])=>btn(example,'planning-guide-example','',`data-request="${E(request)}" data-scope="${E(scope)}"`)).join('')}</div></div></div>`}
     ${messages.map((message,index)=>`<article class="as-guide-exchange">
       <div class="as-guide-user"><span>${E(displayScope(message.scope))}</span><p>${E(message.text)}</p></div>
       <div class="as-guide-assistant"><div class="as-guide-reply">
         ${index===revisionIndex
           ? (revision.status==='impact'?'<p>Review which chapters this revision will affect.</p>':'')
           : '<p>I’ve noted your request.</p>'}
         ${index===revisionIndex?revisionView(revision):''}
       </div></div>
     </article>`).join('')}
     ${revision&&revisionIndex===-1?`<div class="as-guide-assistant"><div class="as-guide-reply">${revisionView(revision)}</div></div>`:''}
     ${guideNotice?`<p class="as-guide-notice" role="status">${E(guideNotice)}</p>`:''}
   </div>
   <form class="as-guide-input" data-form="planning-guide">
   <label class="as-sr-only" for="as-guide-request">Revision request</label>
   <textarea id="as-guide-request" rows="2" placeholder="Describe your revision…">${E(a.guideDraft||'')}</textarea>
   <div class="as-guide-tools">
     <button type="submit" class="as-btn as-guide-send" aria-label="Send message" title="Send (Enter)" ${a.guideDraft?.trim()?'':'disabled'}>${icon('up')}</button>
   </div>
 </form></aside>`;
 }
 const planPresets={genre:['都市','爱情','悬疑','奇幻','科幻','古装','喜剧','剧情'],core:['破镜重圆','成长逆袭','时间循环','双向救赎','身份反转','探寻真相'],style:['克制细腻','轻松幽默','悬念递进','温暖治愈','快节奏','开放式结局']};
 const audiencePresets=['男频','女频','大众向'],planAddLabels={genre:'Add genre',core:'Add premise',style:'Add style'};
 let planPickerKey='',audienceCustom=false,customAudienceDraft='';
 const addIcon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
 function customAudience(){return audienceCustom||!!p.agent.planning.audience&&!audiencePresets.includes(p.agent.planning.audience);}
 function planningAudience(){const d=p.agent.planning,custom=customAudience();if(bridge.continuousChapters)return `<section class="as-plan-setting" id="as-plan-audience"><h3>Audience <em>*</em></h3>${inlinePlanningTags('audience',d.audience?[d.audience]:[])}</section>`;return `<section class="as-plan-setting" id="as-plan-audience"><h3>Audience <em>*</em></h3><div class="as-plan-setting-control"><div class="as-plan-audience" role="group" aria-label="Audience">${audiencePresets.map(v=>btn((bridge.continuousChapters?chipTile(v):'')+E(planningTagLabel(v)),'planning-audience',(bridge.continuousChapters?'plan-chip ':'')+(!custom&&d.audience===v?'selected':''),`data-value="${v}" aria-pressed="${!custom&&d.audience===v}"`)).join('')}${btn((bridge.continuousChapters?chipTile('',true):'')+'Custom','planning-audience-custom',(bridge.continuousChapters?'plan-chip ':'')+(custom?'selected':''),`aria-pressed="${custom}" aria-expanded="${custom}"`)}</div>${custom?`<input class="as-plan-audience-input" data-plan-field="audience" aria-label="Custom audience" placeholder="For example, young readers who enjoy mysteries" value="${E(audiencePresets.includes(d.audience)?'':d.audience)}">`:''}</div></section>`;}
 const tagEnglish={男频:'Men',女频:'Women',大众向:'General audience',离城倒计时:'Countdown to departure',双向成长:'Shared growth',生活感:'Everyday realism',未来留言:'Messages from the future',时间代价:'Cost of changing time',小人物抉择:'Ordinary people, difficult choices',细节伏笔:'Subtle foreshadowing',温暖底色:'Warm tone',人物选择:'Character choices',想象力:'Imagination',人物驱动:'Character-driven',情感真实:'Emotional realism',都市:'Urban',爱情:'Romance',悬疑:'Mystery',奇幻:'Fantasy',科幻:'Sci-fi',古装:'Historical',喜剧:'Comedy',剧情:'Drama',破镜重圆:'Second chance',成长逆袭:'Rise against the odds',时间循环:'Time loop',双向救赎:'Mutual redemption',身份反转:'Hidden identity',探寻真相:'Search for truth',克制细腻:'Subtle',轻松幽默:'Lighthearted',悬念递进:'Building suspense',温暖治愈:'Heartwarming',快节奏:'Fast-paced',开放式结局:'Open ending'};
 const planningTagLabel=value=>Object.hasOwn(tagEnglish,value)?tagEnglish[value]:value;
 const chipArt=new Map([
   ['都市',['genre','#417ab0']],['爱情',['heart','#c65c82']],['悬疑',['search','#8662bb']],['奇幻',['spark','#a465cc']],['科幻',['core','#309ca7']],['古装',['book','#ac7939']],['喜剧',['smile','#c48434']],['剧情',['edit','#527ec3']],
   ['破镜重圆',['heart','#c65c82']],['成长逆袭',['rise','#588f53']],['时间循环',['history','#527ec3']],['双向救赎',['person','#329992']],['身份反转',['lock','#8662bb']],['探寻真相',['search','#ac7939']],
   ['克制细腻',['edit','#b16f90']],['轻松幽默',['smile','#bd8539']],['悬念递进',['rise','#8662bb']],['温暖治愈',['heart','#c96e57']],['快节奏',['bolt','#427fb0']],['开放式结局',['book','#329992']],
   ['男频',['person','#527ec3']],['女频',['person','#a467a8']],['大众向',['person','#329992']]
 ]);
 function chipTile(value,custom=false){
   const [name,color]=chipArt.get(value)||['edit','#788394'];
   return `<span class="plan-chip-icon" aria-hidden="true" style="--chip-ink:${color}">${custom?addIcon:icon(name)}</span>`;
 }
 function inlinePlanningTags(key,list){
   const audience=key==='audience';
   const options=audience?audiencePresets:planPresets[key].slice(0,3);
   const full=!audience&&list.length>=P.limits[key];
   const extras=list.filter(value=>!options.includes(value));
   const chips=options.map(value=>{
     const selected=list.includes(value);
     const label=planningTagLabel(value);
     return btn(chipTile(value)+E(label),audience?'planning-audience':'planning-tag','plan-chip',`data-key="${key}" data-value="${E(value)}" aria-pressed="${selected}" ${full&&!selected?'disabled':''}`);
   });
   const caption=extras.length?'Custom · '+extras.map(planningTagLabel).join(', '):'Custom';
   chips.push('<div class="plan-custom-group">'+btn(chipTile('',true)+E(caption),'inline-custom-toggle','plan-chip',`data-key="${key}" aria-expanded="false" aria-pressed="${!!extras.length}" ${full&&!extras.length?'disabled':''}`)+'</div>');
   return `<div class="plan-inline-tags">${chips.join('')}</div>`;
 }
 function closeInlineCustom(editor){
   const trigger=editor.previousElementSibling;
   trigger.setAttribute('aria-expanded','false');
   editor.remove();
   trigger.focus({preventScroll:true});
 }
 function toggleInlineCustom(trigger){
   const open=host.querySelector('.plan-custom-editor');
   if(open){
     const same=open.previousElementSibling===trigger;
     closeInlineCustom(open);
     if(same)return;
   }
   const key=trigger.dataset.key,d=p.agent.planning;
   const values=key==='audience'?[d.audience].filter(v=>v&&!audiencePresets.includes(v)):d[key].filter(v=>!planPresets[key].slice(0,3).includes(v));
   const fields=(values.length?values:['']).map(v=>`<input type="text" aria-label="Custom ${key}" placeholder="Enter a label" value="${E(v)}">`).join('');
   trigger.insertAdjacentHTML('afterend',`<div class="plan-custom-editor" data-key="${key}"><div class="plan-custom-fields">${fields}</div>${btn(icon('check'),'inline-custom-confirm','plan-custom-action','aria-label="Confirm" title="Confirm"')}${btn(icon('close'),'inline-custom-cancel','plan-custom-action','aria-label="Cancel" title="Cancel"')}</div>`);
   trigger.setAttribute('aria-expanded','true');
   trigger.nextElementSibling.querySelector('input').focus({preventScroll:true});
 }
 function confirmInlineCustom(editor){
   const key=editor.dataset.key;
   const values=[...editor.querySelectorAll('input')].map(input=>input.value.trim()).filter(Boolean);
   const value=key==='audience'?values[0]||'':[...p.agent.planning[key].filter(v=>planPresets[key].slice(0,3).includes(v)),...values];
   P.set(p,key,value);planEditKey='';persist();refreshPlanningField(key);
   host.querySelector(`[data-action="inline-custom-toggle"][data-key="${key}"]`).focus({preventScroll:true});
 }
 function planningTagContents(key){const list=p.agent.planning[key];if(bridge.continuousChapters)return inlinePlanningTags(key,list);return `<div class="as-plan-selected">${list.map(value=>`<span>${E(planningTagLabel(value))}${btn(icon('close'),'planning-remove','',`data-key="${key}" data-value="${E(value)}" aria-label="Remove ${E(planningTagLabel(value))}"`)}</span>`).join('')}${btn(addIcon+planAddLabels[key],'planning-picker','as-plan-add',`data-key="${key}" aria-haspopup="dialog" aria-expanded="${planPickerKey===key}" aria-controls="as-plan-picker"`)}</div>`;}
 function planningTags(key){return `<div class="as-plan-tags" id="as-plan-${key}">${planningTagContents(key)}</div>`;}
 const planningFieldFilled=value=>typeof value==='string'?!!value.trim():!!value?.length;
 function planningIndex(fields,values,timeline){
   return `<nav class="as-flow-rail-list as-setting-index${timeline?' as-settings-timeline':''}" aria-label="Story settings progress">${fields.map(([key,label],index)=>{
     const filled=planningFieldFilled(values[key]);
     const marker=`<i class="${filled?'filled':''}" aria-hidden="true">${timeline?`<span>${index+1}</span>${icon('check')}`:''}</i>`;
     const status=timeline?`<span class="as-sr-only" data-setting-status> · ${filled?'Filled in':'Empty'}</span>`:'';
     return btn(timeline?`${marker}<span>${label}</span>${status}`:`<span>${label}</span>${marker}`,'planning-anchor','',`data-key="${key}"`);
   }).join('')}</nav>`;
 }
 function updatePlanningMarker(key,value){
   const item=$(`[data-action="planning-anchor"][data-key="${key}"]`);
   if(!item)return;
   const filled=planningFieldFilled(value);
   item.querySelector('i').classList.toggle('filled',filled);
   const status=item.querySelector('[data-setting-status]');
   if(status)status.textContent=filled?' · Filled in':' · Empty';
 }
 function planningBasics(){return `<div class="as-plan-basics">${planningAudience()}${Object.keys(planPresets).map(key=>`<section class="as-plan-setting"><h3>${P.labels[key]} <em>*</em><small data-plan-count="${key}">Selected ${p.agent.planning[key].length}/${P.limits[key]}</small></h3>${planningTags(key)}</section>`).join('')}</div>`;}
 function planningPickerView(){return `<div id="as-plan-picker" class="as-plan-picker" popover="auto" role="dialog" aria-labelledby="as-plan-picker-title"><div class="as-plan-picker-heading"><strong id="as-plan-picker-title"></strong>${btn(icon('close'),'planning-picker-close','','aria-label="Close tag picker"')}</div><div class="as-plan-custom">${CimoraSearchField.render(`<input data-plan-custom="" aria-label="Search or enter a custom tag" placeholder="Search or enter a custom tag" autocomplete="off" maxlength="80">`)}<button type="button" class="as-btn primary" data-action="planning-custom">Add</button></div><div class="as-plan-options" role="group" aria-label="Available tags"></div><p class="as-plan-picker-status" role="status" aria-live="polite"></p></div>`;}
 function positionPlanningPicker(){const picker=$('#as-plan-picker'),anchor=$('[data-action="planning-picker"][data-key="'+planPickerKey+'"]');if(!picker||!anchor||!picker.matches(':popover-open'))return;const box=anchor.getBoundingClientRect(),height=picker.getBoundingClientRect().height;picker.style.left=Math.max(12,Math.min(box.left,innerWidth-picker.offsetWidth-12))+'px';const below=box.bottom+8;picker.style.top=Math.max(12,Math.min(below+height<=innerHeight-12?below:box.top-height-8,innerHeight-height-12))+'px';}
 function updatePlanningPicker(message=''){const picker=$('#as-plan-picker'),key=planPickerKey;if(!picker||!key)return;const list=p.agent.planning[key],input=picker.querySelector('input'),query=input.value.trim(),full=list.length>=P.limits[key],duplicate=list.includes(query),options=[...new Set([...planPresets[key],...list])].filter(v=>v.toLocaleLowerCase().includes(query.toLocaleLowerCase())||planningTagLabel(v).toLocaleLowerCase().includes(query.toLocaleLowerCase()));picker.querySelector('.as-plan-options').innerHTML=options.map(value=>btn((list.includes(value)?icon('check'):'')+E(planningTagLabel(value)),'planning-tag',list.includes(value)?'selected':'',`data-key="${key}" data-value="${E(value)}" aria-pressed="${list.includes(value)}" ${full&&!list.includes(value)?'disabled title="Remove a tag before adding another"':''}`)).join('')||'<p class="as-plan-picker-empty">No matching tags. Add a custom tag instead.</p>';picker.querySelector('[data-action="planning-custom"]').disabled=!query||full||duplicate;picker.querySelector('.as-plan-picker-status').textContent=message||(duplicate?'This tag is already selected.':full?'Limit reached. Remove a tag before adding another. Maximum: '+P.limits[key]+'':'Selected '+list.length+'/'+P.limits[key]+' · Choose tags or press Enter to add a new one.');positionPlanningPicker();}
 function closePlanningPicker(focus=false){const key=planPickerKey,picker=$('#as-plan-picker');planPickerKey='';if(picker?.matches(':popover-open'))picker.hidePopover();const trigger=$('[data-action="planning-picker"][data-key="'+key+'"]');trigger?.setAttribute('aria-expanded','false');if(focus)trigger?.focus({preventScroll:true});}
 function openPlanningPicker(key){const picker=$('#as-plan-picker');if(!picker||!planPresets[key])return;if(planPickerKey===key&&picker.matches(':popover-open')){closePlanningPicker(true);return;}closePlanningPicker();planPickerKey=key;picker.querySelector('strong').textContent='Choose '+P.labels[key];const input=picker.querySelector('input');input.dataset.planCustom=key;input.setAttribute('aria-label','Search or customize '+P.labels[key]);input.value='';picker.querySelector('[data-action="planning-custom"]').dataset.key=key;updatePlanningPicker();picker.onbeforetoggle=e=>{if(e.newState==='closed'){const trigger=$('[data-action="planning-picker"][data-key="'+planPickerKey+'"]');trigger?.setAttribute('aria-expanded','false');planPickerKey='';}};picker.showPopover();$('[data-action="planning-picker"][data-key="'+key+'"]')?.setAttribute('aria-expanded','true');positionPlanningPicker();input.focus({preventScroll:true});}
 function refreshPlanningField(key){const el=$('#as-plan-'+key);if(el){if(key==='audience')el.outerHTML=planningAudience();else el.innerHTML=planningTagContents(key);}const count=$('[data-plan-count="'+key+'"]');if(count)count.textContent='Selected '+p.agent.planning[key].length+'/'+P.limits[key];updatePlanningMarker(key,p.agent.planning[key]);const undo=$('[data-action="planning-undo"]'),redo=$('[data-action="planning-redo"]');if(undo)undo.disabled=!p.agent.planningUndo?.length;if(redo)redo.disabled=!p.agent.planningRedo?.length;}
 function changePlanningTag(key,value,custom=false){if(!planPresets[key]||!value)return;const list=p.agent.planning[key],picker=$('#as-plan-picker'),focusValue=document.activeElement?.dataset?.value;try{P.set(p,key,custom?[...list,value]:list.includes(value)?list.filter(x=>x!==value):[...list,value]);}catch(error){updatePlanningPicker(error.message);return;}planEditKey='';persist();refreshPlanningField(key);if(planPickerKey===key){if(custom)picker.querySelector('input').value='';updatePlanningPicker();const option=[...picker.querySelectorAll('[data-action="planning-tag"]')].find(el=>el.dataset.value===focusValue);(custom?picker.querySelector('input'):option||picker.querySelector('input')).focus({preventScroll:true});}else (host.querySelector('.plan-inline-tags [data-key="'+key+'"][data-value="'+CSS.escape(value)+'"]')||$('[data-action="planning-picker"][data-key="'+key+'"]'))?.focus({preventScroll:true});}
 function videoStages(tab){
   const options=[['overview','Overview'],['chapters','Chapters'],['assets','Assets'],['storyboard','Storyboard'],['generation','Video']].map(([value,label])=>({value,label}));
   return CimoraSegmentedControl.render({id:'video-editor-stage',label:'Production stage',options,value:tab});
 }
 function onStageChange(event){
   if(event.target.id==='video-editor-stage')handle('planning-tab',{dataset:{tab:event.detail.value}});
 }
 function focusChapter(event){
   if(!host.classList.contains('video-chapters'))return;
   const chapter=event.target.closest('[data-chapter-section]');
   if(chapter)highlightChapter(chapter.dataset.chapterSection);
 }
 function videoTitle(title){
   return `<div class="as-plan-name vp-title"><button type="button" class="vp-title-button" data-action="edit-video-title" aria-label="Rename project: ${E(title)}"><span>${E(title||'Untitled project')}</span>${icon('edit')}</button></div>`;
 }
 function editVideoTitle(button){
   const box=button.parentElement,original=p.agent.planning.title;
   const input=document.createElement('input');
   input.setAttribute('aria-label','Project title');
   input.value=original;
   box.replaceChildren(input);
   input.focus();input.select();
   function finish(save,restoreFocus){
     if(!input.isConnected)return;
     input.removeEventListener('blur',commit);
     const title=save?input.value.trim():original;
     if(title&&title!==original){
       planEditKey='';planChanged('title',title);persist();
       const cardTitle=$('.vp-chapter-project-title');
       if(cardTitle)cardTitle.textContent=title;
     }
     box.innerHTML=videoTitle(p.agent.planning.title);
     const replacement=box.firstElementChild;
     box.replaceWith(replacement);
     if(restoreFocus)replacement.querySelector('button').focus({preventScroll:true});
   }
   function commit(){finish(true,false);}
   input.addEventListener('blur',commit);
   input.addEventListener('keydown',event=>{
     if(event.isComposing||!['Enter','Escape'].includes(event.key))return;
     event.preventDefault();event.stopPropagation();finish(event.key==='Enter',true);
   });
 }
 function planningView(){C.ensure(p);const a=p.agent,d=a.planning,tab=a.planningTab||'overview',videoOverview=bridge.continuousChapters&&tab==='overview',videoChapters=bridge.continuousChapters&&tab==='chapters',scope=tab==='characters'||tab==='chapters'?tab:null,isExtra=bridge.extraTabs?.some(x=>x[0]===tab)||bridge.customTabs?.includes(tab);const nav=[['audience','Audience'],['genre','Genre'],['core','Premise'],['style','Style'],['synopsis','Story synopsis'],['world','Worldbuilding'],['highlights','Story hook']];return `<header class="as-plan-header">${bridge.continuousChapters?videoTitle(d.title):`<div class="as-plan-name">${icon('spark')}<label><span class="as-sr-only">Project title</span><input data-plan-field="title" aria-label="Project title" placeholder="Project title" value="${E(d.title)}"></label></div>`}</header>${bridge.continuousChapters?videoStages(tab):''}<main class="as-plan-scroll" aria-label="Story editor"><div class="as-plan-wrap"><div class="as-plan-toolbar">${bridge.continuousChapters?'':`<nav aria-label="Story sections"><div class="as-plan-tabs">${[...(bridge.baseTabs||[['overview','Overview'],['characters','Characters'],['chapters','Chapters']]),...(bridge.extraTabs||[])].map(([key,label])=>btn((key==='overview'?'Overview':key==='chapters'?'Chapters':guideTabLabels[key])||label,'planning-tab',tab===key?'active':'',`data-tab="${key}" aria-pressed="${tab===key}"`)).join('')}</div></nav>`}<div class="as-plan-global-actions" role="group" aria-label="Writing tools">${!bridge.inspirationOverviewOnly||tab==='overview'?btn(videoOverview?icon('book')+'Story Planning':bridge.inspirationOverviewOnly?'Story Planning':'Story Planning','planning-back',videoOverview?'as-story-planning':'',videoOverview?'title="Open story planning"':'title="Open story planning. Your edits are saved."'):''}${videoChapters?'':btn(icon('chat')+'AI Writing Assistant','planning-guide-toggle','as-assistant-toggle'+(guideIsOpen()?' active':''),`aria-expanded="${guideIsOpen()}" title="Generate, expand, or revise your work"`)}</div></div>${!videoChapters&&!a.assistantHintDismissed&&!guideIsOpen()?`<div class="as-assistant-hint"><span>Tell the assistant what you’d like to develop or revise.</span>${btn(icon('close'),'assistant-hint-dismiss','','aria-label="Dismiss assistant hint"')}</div>`:''}${videoChapters||(!isExtra&&!scope)?'':!isExtra?`<div class="as-plan-context-actions" role="group" aria-label="Content actions">${scope==='chapters'&&p.storyChapters.some(c=>c.body.trim())?(bridge.continuousChapters?'':btn(icon('spark')+'Revise with AI','chapter-ai-edit','primary'))+btn('Fill empty sections','content-generate','','data-scope="chapters"'):scope?btn(icon('spark')+(scope==='characters'?(p.characters.length?'Fill missing character details with AI':'Generate character profiles with AI'):(p.storyChapters.length?'Fill empty chapters with AI':'Generate chapters with AI')),'content-generate','primary',`data-scope="${scope}"`):''}${tab==='chapters'?btn('Download chapters (TXT)','chapters-download','',p.storyChapters.some(c=>c.body.trim())?'':'disabled'):''}</div>`:(bridge.contextActions?.(p,tab,{E,btn,icon})||'<div class="as-plan-context-actions" aria-hidden="true"></div>')}${busy?`<div class="as-plan-notice" role="status">${E(busy)} ${btn('Cancel','cancel')}</div>`:''}${notice?`<p class="as-plan-notice" role="status">${E(notice)}</p>`:''}${tab==='chapters'&&p.storyChapters.some(c=>c.body.trim())&&!a.chapterEditHintDismissed?`<div class="as-chapter-edit-hint"><div><strong>Your chapters are ready to edit</strong><p>Edit the text directly or use Revise chapter to get AI suggestions. Use Revise with AI to work across chapters.</p></div>${btn('Revise with AI','chapter-ai-edit')}${btn(icon('close'),'chapter-hint-dismiss','',`aria-label="Dismiss editing tips"`)}</div>`:''}${bridge.planningSupplement?.(p,tab,{E,btn,icon})||''}${tab==='overview'?`<div class="as-plan-layout"><form id="as-planning-form" class="as-plan-form" data-form="planning"><div class="as-plan-section-heading"><h2>Story settings</h2><span>${a.planningOrigin==='generated'?'AI draft · Editable':a.planningOrigin==='imported'?'Imported story · Editable':'Manual editing · Autosaved'}</span></div>${planningBasics()}<label class="as-plan-long as-plan-main-story" id="as-plan-synopsis">Story synopsis <em>*</em><textarea data-plan-field="synopsis" rows="8" placeholder="Describe the main characters, setup, development, and ending">${E(d.synopsis)}</textarea></label><div class="as-plan-supplements"><label class="as-plan-long" id="as-plan-world">Worldbuilding <small>Optional</small><textarea data-plan-field="world" rows="4" placeholder="Describe the time, place, and rules of this world">${E(d.world)}</textarea></label><label class="as-plan-long" id="as-plan-highlights">Story hook <small>Optional</small><textarea data-plan-field="highlights" rows="4" placeholder="Describe the central conflict, twist, or unique feature">${E(d.highlights)}</textarea></label></div>${planningPickerView()}<div class="as-plan-bottom"><span>${a.planningOrigin==='generated'?'This prototype uses local rules and sample content.':'Your edits are saved locally as you work.'}</span></div></form><aside class="as-plan-index as-flow-rail" aria-label="Story settings navigation"><div class="as-content-heading"><h3>Story settings</h3></div>${planningIndex(nav,d,videoOverview)}<div class="as-flow-rail-actions"><button type="submit" form="as-planning-form" class="as-btn primary" ${busy?'disabled':''}>${busy?E(busy):'Continue to '+(({chapters:'Chapters',characters:'Characters',writing:'Draft'})[bridge.overviewNext]||bridge.overviewNextLabel||'Characters')+' '+icon('arrow')}</button><p>You can return and edit anytime.</p></div></aside></div>`:(bridge.contentView?.(p,tab,{E,btn,icon})??root.storyContentView(p,tab,{E,btn,icon,...(bridge.contentOptions?.(p,{E,btn,icon})||{})}))}</div></main>${planningGuide()}${panelView()}${bridge.extraView?.(p,{E,btn,icon})||''}`;}
 function planChanged(key,value){if(key==='audience')host.querySelectorAll('[data-action="planning-audience"]').forEach(el=>{const selected=!audienceCustom&&el.dataset.value===value;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});const record=key!==planEditKey||Date.now()-planEditAt>1500;const scope=['characters','chapters'].includes(p.agent.planningTab)?p.agent.planningTab:null;if(key==='title'&&scope){if(record)C.checkpoint(p,scope,true);P.set(p,key,value,false);}else P.set(p,key,value,record);planEditKey=key;planEditAt=Date.now();scheduleSave();const undo=$('[data-action="planning-undo"]'),redo=$('[data-action="planning-redo"]');if(undo)undo.disabled=!(scope?p.agent.contentUndo[scope]:p.agent.planningUndo)?.length;if(redo)redo.disabled=!(scope?p.agent.contentRedo[scope]:p.agent.planningRedo)?.length;updatePlanningMarker(key,value);}
 function planContinue(){planningSwitch(bridge.overviewNext||'characters');}
 function planningSwitch(tab){clearTimeout(draftTimer);contentEditKey='';planEditKey='';C.ensure(p);p.agent.planningTab=tab;p.agent.guideScope=tab;persist();render();}
 function render(){if(dead)return;closePlanningPicker();bridge.beforeRender?.();const a=p.agent;host.classList.add('as-root');host.classList.toggle('video-planning',!!bridge.continuousChapters&&a.phase==='planning');host.classList.toggle('video-chapters',!!bridge.continuousChapters&&a.phase==='planning'&&a.planningTab==='chapters');host.classList.toggle('as-entry',a.phase==='idea');host.classList.toggle('as-planning',a.phase==='planning');host.classList.toggle('as-guide-collapsed',!!a.guideCollapsed||!!bridge.inlineGuide?.(p));host.classList.toggle('as-guide-mobile-open',guideMobileOpen&&!bridge.inlineGuide?.(p));if(a.phase==='planning'){host.innerHTML=planningView();bridge.afterRender?.(p,{persist,render,report,host,switchTab:planningSwitch});const selected=a.selectedChapter;resizeChapterBodies();if(selected&&a.planningTab==='chapters')locateChapter(selected,false);if(busy){host.querySelectorAll('input,textarea,select,button:not([data-action="cancel"])').forEach(el=>el.disabled=true);}return;}if(a.phase==='idea'){host.innerHTML=entryView();return;}host.dataset.mobile=mobile;host.innerHTML=`<header class="as-topbar"><div class="as-title">${btn(icon('book'),'projects','',`aria-label="Switch story"`)}<div><strong>${E(p.title==='未命名故事'||p.title==='Untitled story'?'Story workspace':p.title)}</strong></div></div><div class="as-top-actions">${btn('New project','new')}${btn(icon('history')+'History','history')}${btn('Writing constraints','advanced')}${Object.keys(p.scripts).length?btn('Hand off story','delivery','primary'):''}</div></header>${milestones()}<div class="as-mobile-tabs">${btn('Chat with AI','mobile-agent',mobile==='agent'?'active':'')}${btn('View story','mobile-doc',mobile==='doc'?'active':'')}</div>${notice?`<div class="as-notice" role="status">${E(notice)}${btn('Dismiss','dismiss')}</div>`:''}<div class="as-layout">${agentPanel()}<main class="as-artifact" aria-label="Story content">${a.view==='idea'?ideaView():a.view==='foundation'?foundationView():a.view==='script'?scriptView():deliveryView()}</main></div>${panelView()}`;const messages=$('.as-dialogue');if(messages)messages.scrollTop=messages.scrollHeight;}
 function begin(text,demo,name){A.start(p,text,demo,name);panel='';persist();render();}
 function publish(){const id=handoffEpisode==='all'?'':handoffEpisode||p.selectedEpisode;if(!A.ready(p,id))throw Error('Review and confirm the selected content first.');const asset=A.deliveryAsset(p,id);if(!asset)throw Error('Finish the script first.');p.savedAssetId=asset.assetId;pendingAsset=asset;persist();pendingAsset=null;if(saveStatus.startsWith('Save failed'))throw Error('Could not save locally. Export a backup before trying again.');return asset;}
 function handle(action,el){const a=p.agent;notice='';if(entryUploadBusy||busy&&!['cancel','dismiss','mobile-agent','mobile-doc'].includes(action))return;
 if(['planning-guide-toggle','chapter-ai-edit','assistant-hint-dismiss'].includes(action)){a.assistantHintDismissed=true;$('.as-assistant-hint')?.remove();persist(false);}
 if(bridge.handleAction?.(action,el,p,{persist,render,report,startJob,scheduleSave,host,openGuide:guideToggle,startEntry}))return;
 switch(action){
 case 'ce-attach':el.closest('details')?.removeAttribute('open');$('#ce-file')?.click();return;
 case 'ce-input':Entry.ensure(p).input=el.dataset.key;break;
 case 'ce-mode':Entry.ensure(p).mode=el.dataset.key;break;
 case 'ce-clear-file':Entry.ensure(p).body='';Entry.ensure(p).fileName='';break;
 case 'ce-example':Entry.ensure(p).input='idea';Entry.ensure(p).mode='agent';a.draft=root.ScriptFullExample.data.seed;persist();render();$('#ce-seed')?.focus();return;
 case 'ce-resume':a.phase='planning';a.planningTab='overview';break;
 case 'assistant-hint-dismiss' :$('[data-action="planning-guide-toggle"]')?.focus({preventScroll:true});return;
 case 'chapter-hint-dismiss':a.chapterEditHintDismissed=true;break;
 case 'chapter-ai-edit':a.guideScope=el.dataset.id?'chapter:'+el.dataset.id:'chapters';a.chapterEditHintDismissed=true;guideToggle(true);return;
 case 'chapter-revision-preview':
 case 'chapter-revision-apply':{
   guideNotice='';
   try{
     if(action==='chapter-revision-preview')root.ChapterRevision.preview(a.chapterRevision);
     else root.ChapterRevision.apply(p,a.chapterRevision,C);
     persist();
   }catch(error){guideNotice=error.message;}
   refreshGuide('.as-revision h3',!guideNotice);return;
 }
 case 'chapter-revision-dismiss':a.chapterRevision=null;guideNotice='';persist();refreshGuide('#as-guide-request');return;
 case 'planning-guide-toggle':{const open=!guideIsOpen();if(open&&!a.guideDraft?.trim()&&!['impact','preview'].includes(a.chapterRevision?.status)){a.guideScope=a.planningTab==='chapters'&&p.storyChapters.some(c=>c.id===a.selectedChapter)?'chapter:'+a.selectedChapter:a.planningTab;}guideToggle(open);return;}
 case 'planning-guide-close':guideToggle(false);return;
 case 'planning-guide-scope':a.guideScope=el.dataset.id;guideNotice='';persist();refreshGuide('.as-guide-scope > summary');return;
 case 'planning-guide-example':{a.guideDraft=el.dataset.request;a.guideScope=el.dataset.scope;$('#as-guide-request').value=a.guideDraft;$('[data-form="planning-guide"] button[type="submit"]').disabled=false;scheduleSave();$('#as-guide-request').focus();return;}
 case 'content-add':{const item=C.add(p,el.dataset.scope);contentEditKey='';persist();render();if(el.dataset.scope==='chapters'){locateChapter(item.id,false);$('[data-content-id="'+item.id+'"][data-content-field="title"]')?.focus({preventScroll:true});}return;}
 case 'content-select':planEditKey='';a[el.dataset.scope==='characters'?'selectedCharacter':'selectedChapter']=el.dataset.id;contentEditKey='';break;
 case 'content-remove':C.remove(p,el.dataset.scope,el.dataset.id);contentEditKey='';notice='Removed. Choose Undo to restore it.';break;
 case 'chapter-move':C.move(p,el.dataset.id,+el.dataset.offset);contentEditKey='';persist();render();locateChapter(el.dataset.id,false);return;
 case 'chapter-locate':{
   locateChapter(el.dataset.id,true);
   if(host.classList.contains('video-chapters')){
     host.querySelector('[data-chapter-section="'+CSS.escape(el.dataset.id)+'"] textarea')?.focus({preventScroll:true});
     scheduleSave();
   }
   return;
 }
 case 'flow-locate':locateFlow(el.dataset.id);return;
 case 'chapters-download':{clearTimeout(draftTimer);persist();if(bridge.exportStory){bridge.exportStory(p);return;}const text=C.exportChapters(p);bridge.download('\uFEFF'+text,(p.title||'Untitled story').replace(/[\\/:*?"<>|]/g,'-')+'-all-chapters.txt','text/plain');return;}
 case 'content-generate':{const scope=el.dataset.scope;contentEditKey='';if(!(p.agent.planning?.synopsis||p.story||'').trim()){notice='Write a synopsis in Overview before generating content.';break;}startJob(scope==='characters'?'Drafting character profiles…':'Drafting chapters…',()=>{const updated=C.generate(p,scope,el.dataset.id);notice=updated?'The sample filled missing details and kept your edits.':'No empty fields to fill. Your existing content was kept.';});return;}
 case 'planning-skip':if(bridge.manualStart){clearTimeout(draftTimer);persist();if(saveStatus.startsWith('Save failed'))throw Error('Back up your unsaved draft before starting a blank project.');p=bridge.manualStart();guideMobileOpen=false;}else P.enter(p,a.draft||'',true,root.ScriptFullExample.data);panel='';break;
 case 'edit-video-title':editVideoTitle(el);return;
 case 'planning-back':a.phase='idea';a.draft=a.planningSeed||p.original||a.draft||'';break;
 case 'planning-tab':if(bridge.extraTabs?.some(x=>x[0]===el.dataset.tab)){clearTimeout(draftTimer);persist();bridge.openStage(p,el.dataset.tab,{persist,render,report,host,switchTab:planningSwitch});return;}planningSwitch(el.dataset.tab);return;
 case 'planning-anchor':$('#as-plan-'+el.dataset.key)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;
 case 'planning-undo':audienceCustom=false;if(a.chapterRevision?.status==='applied')a.chapterRevision=null;if(['characters','chapters'].includes(a.planningTab))C.travel(p,a.planningTab,false);else P.travel(p,false);planEditKey='';contentEditKey='';break;
 case 'planning-redo':audienceCustom=false;if(['characters','chapters'].includes(a.planningTab))C.travel(p,a.planningTab,true);else P.travel(p,true);planEditKey='';contentEditKey='';break;
 case 'inline-custom-toggle':toggleInlineCustom(el);return;
 case 'inline-custom-cancel':closeInlineCustom(el.closest('.plan-custom-editor'));return;
 case 'inline-custom-confirm':confirmInlineCustom(el.closest('.plan-custom-editor'));return;
 case 'planning-audience':{if(!audiencePresets.includes(a.planning.audience))customAudienceDraft=a.planning.audience;audienceCustom=false;P.set(p,'audience',el.dataset.value);planEditKey='';persist();refreshPlanningField('audience');$('[data-action="planning-audience"][data-value="'+el.dataset.value+'"]')?.focus({preventScroll:true});return;}
 case 'planning-audience-custom':audienceCustom=true;P.set(p,'audience',audiencePresets.includes(a.planning.audience)?customAudienceDraft:a.planning.audience);planEditKey='';persist();refreshPlanningField('audience');$('[data-plan-field="audience"]')?.focus({preventScroll:true});return;
 case 'planning-picker':openPlanningPicker(el.dataset.key);return;
 case 'planning-picker-close':closePlanningPicker(true);return;
 case 'planning-save':persist();notice=saveStatus.startsWith('Save failed')?saveStatus:'Story synopsis saved locally.';break;
 case 'planning-tag':case 'planning-remove':changePlanningTag(el.dataset.key,el.dataset.value);return;
 case 'planning-custom':{const key=el.dataset.key,input=$('[data-plan-custom="'+key+'"]');changePlanningTag(key,input?.value.trim(),true);return;}
 case 'entry-example':a.draft=root.ScriptFullExample.data.seed;persist();render();$('#as-chat')?.focus();return;
 case 'demo':startJob('Preparing three story directions…',()=>A.start(p,root.ScriptFullExample.data.seed,true));return;
 case 'foundation':startJob('Drafting character profiles and episode outlines…',()=>A.foundation(p));return;
 case 'confirm-foundation':A.snapshot(p,'Confirm story foundation');a.foundation=true;A.say(p,'user','Confirm the story foundation and continue writing.');if(!Object.keys(p.scripts).length){startJob('Drafting episode 1…',()=>A.generate(p,false));return;}a.view='script';break;
 case 'pilot':startJob('Drafting episode 1…',()=>A.generate(p,false));return;
 case 'remaining':startJob('Drafting the remaining episodes…',()=>A.generate(p,true));return;
 case 'cancel':clearTimeout(timer);timer=null;finishJob('cancelled');busy='';notice='Cancelled. Your existing content was kept.';break;
 case 'view':a.view=el.dataset.view;mobile='doc';break;
 case 'tab':a.tab=el.dataset.tab;break;
 case 'first':p.selectedEpisode=p.outline[0].id;a.view='script';mobile='doc';break;
 case 'approve-first':A.approve(p,p.outline[0].id);break;
 case 'approve':A.approve(p,p.selectedEpisode||p.outline[0].id);break;
 case 'next-episode':p.selectedEpisode=p.outline.find(e=>!a.approved.includes(e.id)).id;a.view='script';mobile='doc';break;
 case 'delivery':a.view='delivery';mobile='doc';break;
 case 'review-stale':p.selectedEpisode=a.stale[0];a.view='script';mobile='doc';break;
 case 'resolve':A.snapshot(p,'Review and keep current draft');a.stale=a.stale.filter(id=>id!==el.dataset.id);A.say(p,'user','Reviewed against the current story foundation. The draft was kept.');notice='Review complete. Confirm this episode to continue.';break;
 case 'edit':{const t=A.target(p,el.dataset.key);editor={key:el.dataset.key,label:t.label,value:t.obj[t.field]||''};panel='edit';break;}
 case 'save-edit':A.edit(p,editor.key,$('#as-edit-value').value);panel='';editor=null;break;
 case 'revise':targetKey=el.dataset.key;panel='revise';break;
 case 'untarget':targetKey='';break;
 case 'preset-request':$('#as-request').value=el.dataset.request;return;
 case 'request':{const req=$('#as-request').value.trim();if(!req)throw Error('Enter a revision request or choose a suggestion.');A.candidate(p,targetKey,req);panel='pending';break;}
 case 'pending':panel='pending';break;
 case 'accept':A.edit(p,a.pending.key,$('#as-candidate').value);a.pending=null;panel='';targetKey='';break;
 case 'reject':a.pending=null;panel='';targetKey='';A.say(p,'assistant','The original was kept. Try a different revision request.');break;
 case 'lock':{const key=el.dataset.key;if(a.locks.includes(key))a.locks=a.locks.filter(k=>k!==key);else a.locks.push(key);break;}
 case 'history':case 'advanced':panel=action;break;
 case 'projects':panel=action;persist();render();$('.vp-project-close')?.focus();return;
 case 'close':if(closeVideoProjectsDrawer())return;panel='';break;
 case 'constraints':a.constraints=$('#as-constraints').value;panel='';A.say(p,'assistant','Writing constraints saved: '+(a.constraints||'No additional constraints.'));break;
 case 'restore':A.restore(p,el.dataset.id);panel='';targetKey='';editor=null;break;
 case 'new':persist();p=A.init(createProject());panel='';targetKey='';editor=null;handoffEpisode='';notice=bridge.comic?'Comic created. Your earlier draft is in My Comic Projects.':'Story created. Your earlier draft is in My Story Projects.';saveStatus='Changes save as you type.';history.replaceState(null,'',routePrefix+'?intent=new');render();return;
 case 'open-project':persist();p=A.init(state.projects.find(x=>x.id===el.dataset.id));panel='';targetKey='';handoffEpisode='';break;
 case 'import':{const text=$('#as-source').value;begin(text,false,p.sourceName==='用户故事想法'?'粘贴文本':p.sourceName||'粘贴文本');return;}
 case 'publish':publish();notice='Story snapshot saved to the Asset Library.';break;
 case 'handoff-comic':case 'handoff-video':{const asset=publish();bridge.handoff(asset,handoffEpisode==='all'?'':handoffEpisode,action==='handoff-comic'?'comic':'video');return;}
 case 'export-json':bridge.download(JSON.stringify(p,null,2),p.title+'-工程.json','application/json');return;
 case 'export-txt':{if(bridge.exportStory){clearTimeout(draftTimer);persist();bridge.exportStory(p);return;}const text=[p.title,'故事梗概\n'+p.story,'世界与背景\n'+p.facts,'人物传记\n'+p.characters.map(c=>c.name+' · '+c.identity+'\n'+c.background).join('\n\n'),'分集大纲\n'+p.outline.map((e,i)=>(i+1)+'. '+e.title+'\n'+e.events).join('\n\n'),'分场剧本\n'+p.outline.filter(e=>p.scripts[e.id]).map(e=>e.title+'\n'+M.bodyText(p,e.id)).join('\n\n')].join('\n\n');bridge.download(text,p.title+'-剧本.txt','text/plain');return;}
 case 'mobile-agent':mobile='agent';break;
 case 'mobile-doc':mobile='doc';break;
 case 'dismiss':notice='';break;
 }
 persist();render();if(['edit','revise','pending'].includes(panel))$(panel==='edit'?'#as-edit-value':panel==='revise'?'#as-request':'#as-candidate')?.focus();
 }
 host.addEventListener('segment-change',onStageChange);host.addEventListener('focusin',focusChapter);host.addEventListener('scroll',onPlanScroll,true);window.addEventListener('resize',resizeChapterBodies);host.addEventListener('click',onClick);host.addEventListener('change',onChange);host.addEventListener('input',onInput);host.addEventListener('submit',onSubmit);host.addEventListener('keydown',onKey);
 function onClick(e){const el=e.target.closest('[data-action]');if(el)try{handle(el.dataset.action,el);}catch(error){report(error.message);}}
 async function onChange(e){if(e.target.id==='ce-file'){const file=e.target.files[0],owner=p;if(!file)return;entryUploadBusy=true;notice='';render();try{const result=await Entry.readFile(file,f=>root.ScriptImport.read(f));if(dead||p!==owner)return;const entry=Entry.ensure(p);entry.input='upload';entry.body=result.text;entry.fileName=result.fileName;if(persist()===false)notice='The file was read, but there is not enough space to save it. Try a smaller file.';}catch(error){if(!dead&&p===owner)notice=error.message;}finally{entryUploadBusy=false;if(!dead&&p===owner)render();}return;}if(bridge.onChange&&await bridge.onChange(e,p,{persist,render,report,startJob,scheduleSave,host}))return;if(e.target.dataset.contentField){contentChanged(e.target);return;}if(e.target.id==='as-entry-file'){const file=e.target.files[0];if(!file)return;try{const result=await root.ScriptImport.read(file);p.agent.draft=typeof result==='string'?result:result.text;p.sourceName=file.name;p.agent.entrySource=file.name;notice='Imported '+file.name+'. Add ideas before planning if you like.';persist();render();}catch(error){report(error.message);}return;}if(e.target.name!=='proposal'&&!['as-count','as-minutes','as-episode','as-handoff','as-file'].includes(e.target.id))return;try{const el=e.target,a=p.agent;if(el.name==='proposal')a.selected=+el.value;if(el.id==='as-count')a.count=+el.value;if(el.id==='as-minutes')a.minutes=+el.value;if(el.id==='as-episode')p.selectedEpisode=el.value;if(el.id==='as-handoff')handoffEpisode=el.value;if(el.id==='as-file'&&el.files[0]){const result=await root.ScriptImport.read(el.files[0]);$('#as-source').value=typeof result==='string'?result:result.text;p.sourceName=el.files[0].name;return;}persist();render();}catch(error){report(error.message);}}
 function resizeChapterBody(el){el.style.height='auto';el.style.height=Math.max(host.classList.contains('video-chapters')?80:190,el.scrollHeight+2)+'px';}
 function fitFlowRails(){const scroll=$('.as-plan-scroll');if(!scroll)return;const box=scroll.getBoundingClientRect();host.querySelectorAll('.as-flow-rail').forEach(rail=>{if(scroll.clientWidth<=720){rail.style.removeProperty('max-height');return;}const top=Math.max(box.top+64,rail.getBoundingClientRect().top);rail.style.maxHeight=Math.max(180,box.bottom-top-16)+'px';});}
 function resizeChapterBodies(){positionPlanningPicker();fitFlowRails();host.querySelectorAll('textarea.as-chapter-body').forEach(resizeChapterBody);if($('.as-plan-scroll'))onPlanScroll({target:$('.as-plan-scroll')});const toggle=$('[data-action="planning-guide-toggle"]');if(toggle){const open=guideIsOpen();toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('active',open);}}
 function highlightChapter(id){p.agent.selectedChapter=id;
 if(host.classList.contains('video-chapters'))for(const card of host.querySelectorAll('[data-chapter-section]'))card.classList.toggle('is-current',card.dataset.chapterSection===id);
 host.querySelectorAll('[data-action="chapter-locate"]').forEach(el=>{const active=el.dataset.id===id;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'location':'false');});}
 function locateChapter(id,smooth){const section=$('[data-chapter-section="'+id+'"]'),scroll=$('.as-plan-scroll');if(!section||!scroll)return;highlightChapter(id);scroll.scrollTo({top:scroll.scrollTop+section.getBoundingClientRect().top-scroll.getBoundingClientRect().top-($('.as-plan-scroll').clientWidth<=720?($('.as-chapter-rail')?.getBoundingClientRect().height||130)+80:80),behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});}
 function highlightFlow(id){host.querySelectorAll('[data-action="flow-locate"]').forEach(el=>{const active=el.dataset.id===id;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'location':'false');});}
 function locateFlow(id){const section=host.querySelector('[data-flow-section="'+id+'"]'),scroll=$('.as-plan-scroll');if(!section||!scroll)return;highlightFlow(id);const rail=host.querySelector('.as-chapter-rail'),offset=scroll.clientWidth<=720?(rail?.getBoundingClientRect().height||100)+80:80;scroll.scrollTo({top:scroll.scrollTop+section.getBoundingClientRect().top-scroll.getBoundingClientRect().top-offset,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 function onPlanScroll(e){if(!e.target.classList?.contains('as-plan-scroll'))return;positionPlanningPicker();fitFlowRails();const flow=[...host.querySelectorAll('[data-flow-section]')];if(flow.length){const rail=host.querySelector('.as-chapter-rail'),top=e.target.getBoundingClientRect().top+(e.target.clientWidth<=720?(rail?.getBoundingClientRect().height||100)+104:104);let current=flow[0];for(const section of flow){if(section.getBoundingClientRect().top<=top)current=section;else break;}highlightFlow(current.dataset.flowSection);return;}if(p.agent.planningTab!=='chapters'||(host.classList.contains('video-chapters')&&document.activeElement?.closest('[data-chapter-section]')))return;const top=e.target.getBoundingClientRect().top+($('.as-plan-scroll').clientWidth<=720?($('.as-chapter-rail')?.getBoundingClientRect().height||130)+104:104),sections=[...host.querySelectorAll('[data-chapter-section]')];let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=top)current=section;else break;}if(current)highlightChapter(current.dataset.chapterSection);}
 function contentChanged(el){const {contentScope:scope,contentId:id,contentField:key}=el.dataset;const editKey=scope+'/'+id+'/'+key;const record=editKey!==contentEditKey||Date.now()-contentEditAt>1500;C.set(p,scope,id,key,el.value,record);contentEditKey=editKey;contentEditAt=Date.now();scheduleSave();const undo=$('[data-action="planning-undo"]'),redo=$('[data-action="planning-redo"]');if(undo)undo.disabled=!p.agent.contentUndo[scope].length;if(redo)redo.disabled=!p.agent.contentRedo[scope].length;const update=(selector,text)=>{const node=$(selector);if(node)node.textContent=text;};if(scope==='characters'){if(key==='name')update('[data-person-name="'+id+'"]',el.value||'Untitled character');if(key==='role')update('[data-person-role="'+id+'"]',el.value?el.selectedOptions[0].textContent:'Needs details');}else{if(key==='title')update('[data-chapter-title="'+id+'"]',el.value||'Untitled chapter');if(key==='body'){const charCount=el.value.replace(/\s/g,'').length;const words=charCount+' characters';update('[data-chapter-count="'+id+'"]',words);resizeChapterBody(el);host.querySelectorAll('[data-action="chapters-download"]').forEach(b=>b.disabled=!p.storyChapters.some(c=>c.body.trim()));update('[data-chapter-words="'+id+'"]',p.video?charCount+' chars':words);const editButton=$('[data-action="chapter-ai-edit"][data-id="'+id+'"]');if(editButton)editButton.disabled=!el.value.trim();bridge.afterContentEdit?.(p,host);}}}
 function scheduleSave(){saveStatus='Saving…';const status=$('[data-save]');if(status)status.textContent=saveStatus;clearTimeout(draftTimer);draftTimer=setTimeout(persist,350);}
 function flushOnLeave(){clearTimeout(draftTimer);if(activeJob){clearTimeout(timer);finishJob('cancelled');busy='';}return persist(false);}
 const flushWorkspace=flushOnLeave;if(root.Site)root.Site.flushWorkspace=flushWorkspace;
 function onInput(e){if(e.target.dataset.planCustom){updatePlanningPicker();return;}if(e.target.id==='ce-seed'){const entry=Entry.ensure(p);if(entry.input==='idea')p.agent.draft=e.target.value;else entry.body=e.target.value;const send=$('.vp-start');if(send)send.disabled=entryUploadBusy||!!busy||!Entry.canStart(p);const count=$('[data-ce-count]');if(count)count.textContent=e.target.value.replace(/\s/g,'').length+' characters · Original text preserved';scheduleSave();return;}if(e.target.dataset.revisionId){const item=p.agent.chapterRevision?.items.find(x=>x.id===e.target.dataset.revisionId);if(item){item.after=e.target.value;scheduleSave();}return;}if(bridge.onInput?.(e,p,{persist,render,report,startJob,scheduleSave,host}))return;if(e.target.id==='as-guide-request'){p.agent.guideDraft=e.target.value;const send=$('[data-form="planning-guide"] button[type="submit"]');if(send)send.disabled=!e.target.value.trim();scheduleSave();return;}if(e.target.dataset.contentField){contentChanged(e.target);return;}if(e.target.dataset.planField){planChanged(e.target.dataset.planField,e.target.value);return;}if(e.target.dataset.entrySetting){p.settings[e.target.dataset.entrySetting]=e.target.value;e.target.closest('details').querySelector('.as-setting-dot').hidden=!e.target.value.trim();clearTimeout(draftTimer);draftTimer=setTimeout(persist,400);}if(e.target.id==='as-chat'){p.agent.draft=e.target.value;const send=$('.as-entry-send');if(send)send.disabled=!e.target.value.trim()||!!busy;clearTimeout(draftTimer);draftTimer=setTimeout(persist,400);}if(e.target.id==='as-edit-value'&&editor)editor.value=e.target.value;if(e.target.id==='as-candidate'&&p.agent.pending){p.agent.pending.after=e.target.value;clearTimeout(draftTimer);draftTimer=setTimeout(persist,400);}}
 function onSubmit(e){if(e.target.dataset.form==='ce-start'){e.preventDefault();if(busy||entryUploadBusy||!Entry.canStart(p))return;try{if(bridge.beforeEntryStart?.(p,{persist,render,report,startEntry,host}))return;startEntry();}catch(error){report(error.message);}return;}if(bridge.onSubmit?.(e,p,{persist,render,report,startJob,scheduleSave,host}))return;if(e.target.dataset.form==='planning-guide'){e.preventDefault();const text=$('#as-guide-request').value.trim();if(!text||busy)return;guideNotice='';const scope=selectedGuideScope(guideScopeOptions());p.agent.guideScope=scope.value;const chapterRevision=scope.value==='chapters'||scope.value.startsWith('chapter:');if(chapterRevision){if(p.agent.chapterRevision&&['impact','preview'].includes(p.agent.chapterRevision.status)){guideNotice='Apply the current revision or keep the original before starting a new one.';refreshGuide('#as-guide-request');return;}try{p.agent.chapterRevision=root.ChapterRevision.create(p,scope.value,text);}catch(error){guideNotice=error.message;refreshGuide('#as-guide-request');return;}}p.agent.guideMessages=[...(p.agent.guideMessages||[]),{scope:scope.label,text,chapterRevision}].slice(-20);p.agent.guideDraft='';persist();refreshGuide('#as-guide-request');return;}if(e.target.dataset.form==='planning'){e.preventDefault();if(!busy)planContinue();return;}if(e.target.dataset.form!=='chat')return;e.preventDefault();if(busy)return;const text=$('#as-chat').value.trim();if(!text)return;try{if(p.agent.phase==='idea'){startJob('Drafting the story setting and synopsis…',()=>{P.enter(p,text,false,root.ScriptFullExample.data);bridge.afterPlanning?.(p);p.agent.draft='';});return;}p.agent.draft='';if(targetKey){A.candidate(p,targetKey,text);panel='pending';}else{A.say(p,'user',text);A.say(p,'assistant','Choose Revise with AI next to the passage you want to edit. You can compare the suggestion with the original before applying it.');}persist();render();}catch(error){report(error.message);}}
 function onKey(e){if(e.key==='Escape'&&e.target.closest('.as-guide-scope[open]'))return;const editor=e.target.closest('.plan-custom-editor');if(editor&&e.target.matches('input')&&['Enter','Escape'].includes(e.key)){if(e.isComposing)return;e.preventDefault();if(e.key==='Enter')confirmInlineCustom(editor);else closeInlineCustom(editor);return;}if(e.key==='Escape'&&planPickerKey){e.preventDefault();closePlanningPicker(true);return;}if(e.key==='Enter'&&e.target.dataset.planCustom&&e.isComposing)return;if(bridge.onKey?.(e,p,{persist,render,host}))return;if(e.key==='Escape'&&e.target.closest('.as-guide-sidebar')){e.preventDefault();guideToggle(false);return;}if(e.key==='Enter'&&e.target.id==='as-guide-request'){if(e.isComposing||e.keyCode===229||e.shiftKey)return;e.preventDefault();e.target.closest('form').requestSubmit();return;}if(e.key==='Enter'&&e.target.dataset.planCustom){e.preventDefault();handle('planning-custom',{dataset:{key:e.target.dataset.planCustom}});return;}if(e.key==='Escape'&&panel){if(closeVideoProjectsDrawer()){e.preventDefault();return;}panel='';render();}if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)&&['as-chat','ce-seed'].includes(e.target.id)){e.preventDefault();e.target.closest('form').requestSubmit();}}
 window.addEventListener('pagehide',flushOnLeave);render();return {destroy(){if(root.Site?.flushWorkspace===flushWorkspace)root.Site.flushWorkspace=null;finishJob('cancelled');bridge.destroy?.();host.removeEventListener('segment-change',onStageChange);host.removeEventListener('focusin',focusChapter);host.removeEventListener('scroll',onPlanScroll,true);window.removeEventListener('resize',resizeChapterBodies);window.removeEventListener('pagehide',flushOnLeave);dead=true;clearTimeout(timer);clearTimeout(draftTimer);persist(false);host.removeEventListener('click',onClick);host.removeEventListener('change',onChange);host.removeEventListener('input',onInput);host.removeEventListener('submit',onSubmit);host.removeEventListener('keydown',onKey);}};
};
})(globalThis);
