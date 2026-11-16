/* 漫画作品以独立工程挂载到主应用，不迁移视频或旧章节。 */
(()=>{
 const C=Cimora,S=Site,M=ComicStudio,KEY='cimora-comic-studio-v1',steps=['内容策划','视觉资产','漫画编排','生成与编辑'];
 let mounted=null,sequence=0;
 const base=new URL('comic-studio/',document.currentScript.src);
 const template=fetch(new URL('view.html',base)).then(r=>{if(!r.ok)throw Error('漫画页面载入失败');return r.text();});
 function stored(){try{const raw=localStorage.getItem(KEY);return raw?M.restore(raw):null;}catch{return null;}}
 const route=C.route;C.route=r=>r.parts[0]==='app'&&r.parts[1]==='comic'?'<div id="comic-workspace" class="cs-workspace" aria-label="漫画创作"><p role="status">正在读取漫画工程…</p></div>':route(r);
 const title=C.pageTitle;C.pageTitle=r=>r.parts[1]==='comic'?'创作漫画':title(r);
 const after=C.afterRender;C.afterRender=r=>{after(r);const token=++sequence;mounted?.destroy();mounted=null;document.body.classList.toggle('cimora-comic-workspace',r.parts[1]==='comic');if(r.parts[1]!=='comic')return;const host=document.getElementById('comic-workspace');template.then(html=>{if(token!==sequence||!host.isConnected)return;
 const wanted=r.params.get('project'),state=stored();if(wanted&&state?.projects.some(p=>p.id===wanted)){state.active=wanted;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
 host.innerHTML=html;host.querySelectorAll('button').forEach(b=>b.classList.add('cm-button'));mounted=mountComicStudio(host,{assetBase:base,onSave(p){const url='#/app/comic?project='+encodeURIComponent(p.id);if(location.hash!==url)history.replaceState(null,'',url);const breadcrumb=document.querySelector('.cm-breadcrumb strong');if(breadcrumb)breadcrumb.textContent=p.title+' / '+steps[p.stage];const saved=document.querySelector('.cm-saved');if(saved)saved.textContent='漫画已自动保存';}});
 }).catch(e=>{if(token===sequence)host.innerHTML=`<p role="alert">${C.E(e.message)}</p><a href="#/app">返回创作空间</a>`;});};
})();

