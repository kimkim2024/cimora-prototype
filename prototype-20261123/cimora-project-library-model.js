/* Shared project-library metadata. No duplicate project collection or fabricated dates. */
(function(root){
  'use strict';
  function createProjectLibraryModel(S,clock=()=>Date.now()){
    const state=S.state;
    const transient=new Set(['view','stage','navigation','viewport','selected','selectedId','selectedShotId','selectedPanelId','canvasFocus','group','panel','branches','legacy']);
    function time(value){
      if(typeof value==='number')return Number.isFinite(value)&&value>0?value:0;
      if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value))return 0;
      const n=Date.parse(value);return Number.isFinite(n)&&n>0?n:0;
    }
    function snapshot(p){
      const {createdAt,updatedAt,updated,lastOpenedAt,lastChapterId,starred,archived,...content}=p;
      return JSON.stringify({content,editor:state.cimora?.projects?.[p.id]},(key,value)=>transient.has(key)?undefined:value);
    }
    const snapshots=new Map(state.projects.map(p=>[p.id,snapshot(p)]));
    let activeProject=null;
    function sync(rendering=false){
      const now=new Date(clock()).toISOString(),ids=new Set();
      for(const p of state.projects){
        ids.add(p.id);
        const next=snapshot(p),previous=snapshots.get(p.id);
        // Lazy editor initialization and view changes are not user edits.
        if(!rendering){
          if(previous===undefined){
            if(!time(p.createdAt))p.createdAt=now;
            if(!time(p.updatedAt))p.updatedAt=now;
          }else if(next!==previous){p.updatedAt=now;}
        }
        snapshots.set(p.id,next);
      }
      for(const id of snapshots.keys())if(!ids.has(id))snapshots.delete(id);
    }
    const available=()=>state.projects.filter(p=>!p.archived);
    const byId=id=>state.projects.find(p=>p.id===id);
    const collator=new Intl.Collator('zh-CN',{numeric:true,sensitivity:'base'});
    function list({query='',filter='all',sort='edited'}={}){
      const q=String(query).trim().toLocaleLowerCase();
      return available().filter(p=>(filter!=='starred'||p.starred===true)&&String(p.name||'').toLocaleLowerCase().includes(q)).sort((a,b)=>{
        if(sort==='name')return collator.compare(a.name||'',b.name||'');
        const key=sort==='created'?'createdAt':'updatedAt';
        const date=p=>time(p[key])||(key==='updatedAt'?time(p.updated):0);
        // Stable ties preserve the source order; missing dates sort after recorded dates.
        return date(b)-date(a);
      });
    }
    function recent(){
      const all=available();
      if(all.length<2)return [];
      const limit=all.length<=4?Math.min(2,all.length-1):4;
      return all.filter(p=>time(p.lastOpenedAt)).sort((a,b)=>time(b.lastOpenedAt)-time(a.lastOpenedAt)).slice(0,limit);
    }
    function toggleStar(id){
      const p=byId(id);if(!p||p.archived)return false;
      const before=p.starred;p.starred=!p.starred;
      if(S.save()===false){p.starred=before;return false;}
      return true;
    }
    function visit(id){
      const p=byId(id);
      if(!p||p.archived){activeProject=null;return false;}
      if(activeProject===id)return false;
      activeProject=id;
      const previous=p.lastOpenedAt;p.lastOpenedAt=new Date(clock()).toISOString();
      if(S.save()===false){p.lastOpenedAt=previous;activeProject=null;return false;}
      return true;
    }
    function persist(rollback){
      try{if(S.save()!==false)return true;}catch{}
      rollback();sync(true);return false;
    }
    function rename(id,name){
      const p=byId(id),next=String(name??'').trim();
      if(!p||p.archived||!next||next.length>80)return false;
      const before={name:p.name,updatedAt:p.updatedAt};p.name=next;
      return persist(()=>{p.name=before.name;if(before.updatedAt===undefined)delete p.updatedAt;else p.updatedAt=before.updatedAt;});
    }
    function archive(id,archived=true){
      const p=byId(id);if(!p)return false;
      const before=p.archived;p.archived=archived;
      return persist(()=>{if(before===undefined)delete p.archived;else p.archived=before;});
    }
    function duplicate(id){
      const original=byId(id);if(!original||original.archived)return null;
      const newId=S.id('project');if(byId(newId))return null;
      const owned=(state.assets||[]).filter(a=>a.projectId===id);
      const mapping=new Map([[id,newId],...owned.map(a=>[a.id,S.id('asset')])]);
      function copy(value){
        if(typeof value==='string')return mapping.get(value)||value;
        if(Array.isArray(value))return value.map(copy);
        if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[mapping.get(key)||key,copy(v)]));
        return value;
      }
      const project=copy(original),ed=state.cimora?.projects,editor=ed?.[id]&&copy(ed[id]);
      const base=String(original.name||'Untitled project')+' · Copy';let name=base,n=2;
      while(state.projects.some(p=>p.name===name))name=base+' '+n++;
      Object.assign(project,{id:newId,name,archived:false,starred:false,createdAt:new Date(clock()).toISOString(),updatedAt:new Date(clock()).toISOString(),updated:'Just now'});
      delete project.lastOpenedAt;
      if(editor)for(const e of Object.values(editor)){
        if(!e||typeof e!=='object')continue;e.projectId=newId;e.run=null;
        for(const node of e.graph?.nodes||[])if(['running','queued','paused'].includes(node.status))node.status='idle';
      }
      const assets=owned.map(copy);state.projects.unshift(project);
      if(editor)ed[newId]=editor;
      if(assets.length)state.assets.push(...assets);
      const saved=persist(()=>{
        state.projects.splice(state.projects.indexOf(project),1);
        if(editor)delete ed[newId];
        for(const asset of assets){const i=state.assets.indexOf(asset);if(i>=0)state.assets.splice(i,1);}
      });
      return saved?project:null;
    }
    return {time,sync,available,byId,list,recent,toggleStar,visit,rename,archive,duplicate};
  }
  if(typeof module==='object'&&module.exports)module.exports=createProjectLibraryModel;
  else root.createProjectLibraryModel=createProjectLibraryModel;
})(typeof window==='object'?window:globalThis);
