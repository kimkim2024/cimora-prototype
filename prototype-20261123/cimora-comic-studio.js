/* 漫画作品以独立工程挂载到主应用，不迁移视频或旧章节。 */
(()=>{
 const C=Cimora,S=Site,M=ComicStudio,KEY='cimora-comic-studio-v1',steps=['Story Planning','Visual Assets','Comic Layout','Generate and Edit'];
 let mounted=null,sequence=0;
 const base=new URL('comic-studio/',document.currentScript.src);
 const template=fetch(new URL('view.html',base)).then(r=>{if(!r.ok)throw Error('Could not load the comic editor');return r.text();});
 function stored(){try{const raw=localStorage.getItem(KEY);return raw?M.restore(raw):null;}catch{return null;}}
 const route=C.route;C.route=r=>r.parts[0]==='app'&&r.parts[1]==='comic'?'<div id="comic-workspace" class="cs-workspace" aria-label="Comic workspace"><p role="status">Loading comic project…</p></div>':route(r);
 const title=C.pageTitle;C.pageTitle=r=>r.parts[1]==='comic'?'Comic workspace':title(r);
 const after=C.afterRender;C.afterRender=r=>{after(r);const token=++sequence;mounted?.destroy();mounted=null;document.body.classList.toggle('cimora-comic-workspace',r.parts[1]==='comic');if(r.parts[1]!=='comic')return;const host=document.getElementById('comic-workspace');
 const legacy=stored(),wantedId=r.params.get('project'),isLegacy=wantedId&&legacy?.projects.some(p=>p.id===wantedId);
 const linked=legacy?.projects.find(p=>p.id===wantedId&&p.storyDraftId);if(linked){r.params.set('project',linked.storyDraftId);r.params.set('production',linked.id);if(!r.params.has('tab'))r.params.set('tab',linked.stage===3?'production':'arrangement');history.replaceState(null,'','#/app/comic?'+r.params.toString().replace(/&?studio=1/,''));}
 if(linked||r.params.get('studio')!=='1'&&!isLegacy){document.body.classList.remove('cimora-comic-workspace');document.body.classList.add('cimora-script-workspace');host.id='script-workspace';host.className='ss-workspace';host.setAttribute('aria-label','Comic story workspace');try{mounted=ComicStoryWorkspace.mount(host,r.params);const crumb=document.querySelector('.cm-breadcrumb strong');if(crumb)crumb.textContent='Comic workspace';}catch(error){host.innerHTML='<p role="alert">'+C.E(error.message)+'</p><a href="#/app/comic?intent=new">Create a comic draft</a>';}return;}
 template.then(html=>{if(token!==sequence||!host.isConnected)return;
 const wanted=r.params.get('project'),state=stored();if(wanted&&state?.projects.some(p=>p.id===wanted)){state.active=wanted;const p=state.projects.find(p=>p.id===wanted),chapter=r.params.get('chapter'),page=r.params.get('page'),stage=r.params.get('stage');if(stage!==null&&['0','1','2','3'].includes(stage))p.stage=+stage;if(chapter&&[...(p.storyPlan?.episodes||[]),...(p.comicEpisodes||[]),...(p.source?.outline||[])].some(c=>c.id===chapter))p.activeEpisodeId=chapter;if(page&&p.bodyPagination?.episodes?.[chapter]?.pages?.some(pg=>pg.id===page)){p.wholePageStudio??={works:{},selected:{}};p.wholePageStudio.selected??={};p.wholePageStudio.selected[chapter]=page;}try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
 host.innerHTML=html;host.querySelectorAll('button').forEach(b=>b.classList.add('cm-button'));mounted=mountComicStudio(host,{assetBase:base,onStoryTab(p,tab){location.hash='#/app/comic?project='+encodeURIComponent(p.storyDraftId)+'&tab='+tab;},onNew(){location.hash='#/app/comic?intent=new';},onSave(p){const url='#/app/comic?project='+encodeURIComponent(p.id)+'&studio=1';if(location.hash!==url)history.replaceState(null,'',url);const breadcrumb=document.querySelector('.cm-breadcrumb strong');if(breadcrumb)breadcrumb.textContent=p.title+' / '+steps[p.stage];const saved=document.querySelector('.cm-saved');if(saved)saved.textContent='Comic saved automatically';}});
 }).catch(e=>{if(token===sequence)host.innerHTML=`<p role="alert">${C.E(e.message)}</p><a href="#/app">Back to Creation Space</a>`;});};
})();

