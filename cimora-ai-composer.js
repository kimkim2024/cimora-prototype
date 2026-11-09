/* Homepage composer: adapted from AI Prompt Composer (mode menu / model & quality / reference / voice / @ mentions).
   Native JS; submission still uses the homepage’s existing data-home-form="start" flow. Model selection and voice are local demos. */
(()=>{
  const C=Cimora,{S,M,E}=C;
  const MODES=[['comic','Comic','▤'],['motion','Video','▷'],['canvas','Infinite Canvas','⌘']];
  const MODELS=[
    {id:'aurora',name:'Aurora Dreamscape',badge:'A',hue:'#c9b0ff',q:['Standard','Fine','Ultra'],def:'Fine'},
    {id:'lumen',name:'Lumen Light',badge:'L',hue:'#ffd29a',q:['Standard','Fine','Ultra'],def:'Standard'},
    {id:'prism',name:'Prism Hand-drawn',badge:'P',hue:'#9fd8ff',q:['Standard','Fine','Ultra'],def:'Fine'},
    {id:'nova',name:'Nova Motion',badge:'N',hue:'#ff9fb4',q:['Standard','Fine','Ultra'],def:'Standard'},
    {id:'ember',name:'Ember Painterly',badge:'E',hue:'#ff9e72',q:['Standard','Fine','Ultra'],def:'Fine'},
    {id:'sol',name:'Sol Realistic',badge:'S',hue:'#a3dcca',q:['Fine','Ultra'],def:'Fine'}
  ];
  const CTX=[['@Character','Characters from your files'],['@Scene','Place and mood'],['@Prop','Key objects']];
  const AC={files:[],open:null,tab:'fav',q:'',hover:null,rec:false,sec:0,timer:0};
  const chev='<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const check='<svg class="ac-check" width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.2 8.5L6.5 11.8L13 4.5" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const star=(on,s=13.5)=>`<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="${on?'#FACC15':'none'}" stroke="${on?'#FACC15':'currentColor'}" stroke-width="1.3" stroke-linejoin="round"><path d="M8 1.6L9.95 5.55L14.3 6.18L11.15 9.25L11.89 13.58L8 11.53L4.11 13.58L4.85 9.25L1.7 6.18L6.05 5.55L8 1.6Z"/></svg>`;
  const A=d=>d.ac??={model:'aurora',auto:false,favs:['aurora','nova'],eff:{}};
  const model=a=>MODELS.find(m=>m.id===a.model)||MODELS[0];
  const eff=(a,m)=>{const e=a.eff[m.id]||m.def;return m.q.includes(e)?e:m.def;};
  const badge=m=>`<span class="ac-badge" style="color:${m.hue}">${m.badge}</span>`;
  const modeOf=d=>MODES.find(m=>m[0]===d.mode)||MODES[0];

  function trigger(a){const m=model(a);return a.auto
    ?`<div class="ac-auto" role="button" tabindex="0" data-ac="model-toggle" aria-label="Auto-select model"><span>Auto</span><span class="ac-auto-chev">${chev}</span><span class="ac-auto-switch"><span class="ac-switch on" data-ac="auto-off" role="switch" aria-checked="true" title="Turn Off Auto"><i></i></span></span></div>`
    :`<button type="button" class="ac-model-btn" data-ac="model-toggle" aria-haspopup="true" aria-expanded="${AC.open==='model'}">${badge(m)}<span class="ac-model-name"><b>${E(m.name)}</b><em>${eff(a,m)}</em></span>${chev}</button>`;}
  function rows(a){const q=AC.q.trim().toLowerCase(),favs=a.favs;const list=MODELS.filter(m=>(AC.tab==='all'||favs.includes(m.id))&&(!q||m.name.toLowerCase().includes(q)||eff(a,m).includes(q)));
    if(!list.length)return `<div class="ac-empty">${AC.tab==='fav'&&!q?'No favorite models yet. Switch to “All” and click ★ to add.':'No matching models'}</div>`;
    return list.map(m=>{const on=favs.includes(m.id);return `<div class="ac-row${AC.hover===m.id?' hover':''}" data-ac="pick" data-id="${m.id}" role="option" aria-selected="${!a.auto&&a.model===m.id}"><span class="ac-row-main">${badge(m)}<span class="ac-row-name"><b>${E(m.name)}</b><em>${eff(a,m)}</em></span><button type="button" class="ac-star${on?' on':''}" data-ac="star" data-id="${m.id}" aria-label="${on?'Unfavorite':'Favorite'} ${E(m.name)}" title="${on?'Unfavorite':'Favorite'}">${star(on)}</button></span>${!a.auto&&a.model===m.id?check:''}</div>`;}).join('');}
  function tabs(a){return `<button type="button" role="tab" class="ac-tab${AC.tab==='fav'?' active':''}" data-ac="tab" data-tab="fav" aria-selected="${AC.tab==='fav'}">${star(AC.tab==='fav',12)}<span>Favorite</span>${a.favs.length?`<small>${a.favs.length}</small>`:''}</button><button type="button" role="tab" class="ac-tab${AC.tab==='all'?' active':''}" data-ac="tab" data-tab="all" aria-selected="${AC.tab==='all'}"><span>All</span><small>${MODELS.length}</small></button>`;}
  function modeMenu(d){const order=[...MODES.filter(m=>m[0]!==d.mode),modeOf(d)];return order.map(([k,t,ic])=>`<div class="ac-item" role="menuitem" tabindex="0" data-ac="mode-pick" data-mode="${k}"><span><i>${ic}</i>${t}</span>${k===d.mode?check:''}</div>`).join('');}

  function build(scope,d){const a=A(d),[,mt,mi]=modeOf(d),drafts=M.db.draftBackups?.length||0;
    return `<form class="ac-form ${scope}" data-home-form="start" data-scope="${scope}" aria-label="Composer"><input class="ac-file" type="file" accept="image/*" multiple hidden>
      <div class="ac-chips" ${AC.files.length?'':'hidden'}>${chips()}</div>
      <section class="ac-card">
        <div class="ac-pop ac-ctx" role="menu"><div class="ac-pop-title">Mention Asset</div>${CTX.map(([t,c])=>`<div class="ac-item" role="menuitem" tabindex="0" data-ac="ctx" data-tag="${t}"><span>${t}</span><small>${c}</small></div>`).join('')}</div>
        <label class="hm-sr" for="ac-idea-${scope}">Write down your story idea</label>
        <div class="ac-top">
          <div class="ac-left ac-modes" role="group" aria-label="Creation mode">${[['motion','Video','▷'],['comic','Comic','▤'],['canvas','Canvas','⌘']].map(([k,t,ic])=>`<button type="button" class="ac-pill ac-mode" data-ac="mode-pick" data-mode="${k}" aria-pressed="${d.mode===k}"><i>${ic}</i><span>${t}</span></button>`).join('')}</div>
        </div>
        <textarea id="ac-idea-${scope}" class="ac-input" name="idea" rows="1" maxlength="6000" placeholder="Write an idea to start your story / type @ to mention a character, scene, or prop" data-home-input="idea">${E(d.text)}</textarea>
        <div class="ac-bar">
          <div class="ac-left">
            <button type="button" class="ac-pill ac-add" data-ac="files" aria-label="Add Reference"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="ac-lbl">Reference</span></button>
            <div class="ac-host ac-model-host"><div class="ac-trigger">${trigger(a)}</div>
              <div class="ac-pop ac-model-pop" role="listbox"><div class="ac-search"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7.2" cy="7.2" r="4.8" stroke="currentColor" stroke-width="1.5"/><path d="M10.8 10.8L13.8 13.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><input type="text" data-ac-search placeholder="Search models" autocomplete="off" aria-label="Search models"></div>
                <div class="ac-auto-row"><span>Auto</span><button type="button" class="ac-switch${a.auto?' on':''}" role="switch" aria-checked="${a.auto}" data-ac="auto-menu" aria-label="Auto-select model"><i></i></button></div>
                <div class="ac-tabs" role="tablist" aria-label="Filter models">${tabs(a)}</div><div class="ac-list">${rows(a)}</div></div>
              <div class="ac-pop ac-eff-pop"></div></div>
          </div>
          <div class="ac-right">
            <button type="button" class="ac-pill ac-rec" data-ac="record" aria-label="Voice input (demo)"><span class="ac-rec-ico"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="1.8" width="5" height="7.6" rx="2.5" stroke="currentColor" stroke-width="1.45"/><path d="M3.2 7.2C3.2 9.85 5.35 12 8 12C10.65 12 12.8 9.85 12.8 7.2M8 12V14.2M5.8 14.2H10.2" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg></span><span class="ac-lbl ac-rec-lbl">Voice</span></button>
            <button type="submit" class="ac-submit" aria-label="Start Ideating"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M3.5 7.5L8 3L12.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
      <div class="ac-foot"><span>Start with one line · Enter to start ideating, Shift + Enter for a new line</span><div><button type="button" class="ac-ghost" data-home="sample">✧ Surprise Me</button><button type="button" class="ac-ghost" data-home="drafts">Drafts${drafts?' · '+drafts:''}</button></div></div>
    </form>`;}
  function chips(){return AC.files.map((f,i)=>`<span class="ac-chip"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M9.5 2H4.5C3.67 2 3 2.67 3 3.5V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V5.5L9.5 2Z" stroke="currentColor" stroke-width="1.4"/></svg><span>${E(f.name)}</span><button type="button" data-ac="rm-file" data-i="${i}" aria-label="Remove ${E(f.name)}">✕</button></span>`).join('');}

  const form=el=>el.closest('.ac-form');
  function sync(f){const t=f.querySelector('.ac-input');t.style.height='auto';t.style.height=Math.min(140,Math.max(28,t.scrollHeight))+'px';f.querySelector('.ac-submit').classList.toggle('ready',!!t.value.trim()||AC.files.length>0);f.querySelector('.ac-ctx').classList.toggle('open',t.value.endsWith('@'));}
  function close(){AC.open=null;AC.hover=null;document.querySelectorAll('.ac-pop.open').forEach(p=>{if(!p.classList.contains('ac-ctx'))p.classList.remove('open');});document.querySelectorAll('[data-ac$="-toggle"][aria-expanded]').forEach(b=>b.setAttribute('aria-expanded','false'));document.querySelectorAll('.ac-row.hover').forEach(r=>r.classList.remove('hover'));}
  function open(f,name){const was=AC.open===name;close();if(was)return;AC.open=name;f.querySelector('.ac-ctx').classList.remove('open');const pop=f.querySelector(name==='mode'?'.ac-mode-pop':'.ac-model-pop');pop.classList.add('open');f.querySelector(name==='mode'?'.ac-mode':'.ac-model-btn,.ac-auto')?.setAttribute('aria-expanded','true');if(name==='model'){AC.tab='fav';AC.q='';const a=A(inputState(f));f.querySelector('[data-ac-search]').value='';paintModel(f,a);}}
  const inputState=f=>{M.db.homeInputs??={};return M.db.homeInputs[f.dataset.scope]??={text:'',mode:'comic'};};
  function paintModel(f,a){f.querySelector('.ac-trigger').innerHTML=trigger(a);f.querySelector('.ac-list').innerHTML=rows(a);f.querySelector('.ac-tabs').innerHTML=tabs(a);f.querySelector('.ac-model-pop .ac-switch').classList.toggle('on',a.auto);f.querySelector('.ac-model-pop .ac-switch').setAttribute('aria-checked',a.auto);if(AC.open==='model')f.querySelector('.ac-trigger [data-ac=model-toggle]')?.setAttribute('aria-expanded','true');}
  function paintEff(f,a){const pop=f.querySelector('.ac-eff-pop'),m=MODELS.find(x=>x.id===AC.hover),list=f.querySelector('.ac-list');if(!m||AC.q.trim()){pop.classList.remove('open');return;}
    pop.innerHTML=`<div class="ac-pop-title big">Quality</div>${m.q.map(l=>`<div class="ac-item" role="menuitem" tabindex="0" data-ac="eff" data-l="${l}"><span>${l}</span>${eff(a,m)===l?check:''}</div>`).join('')}`;
    const host=f.querySelector('.ac-model-host'),row=list.querySelector(`.ac-row[data-id="${m.id}"]`);if(!row)return;
    const hr=host.getBoundingClientRect(),rr=row.getBoundingClientRect(),pr=f.querySelector('.ac-model-pop').getBoundingClientRect();
    const inTop=!!host.closest('.ac-top');
    if(hr.left+266+150<innerWidth){pop.style.left='266px';if(inTop){pop.style.bottom='auto';pop.style.top=Math.max(0,rr.top-hr.top)+'px';}else{pop.style.top='auto';pop.style.bottom=Math.max(0,hr.bottom-rr.bottom)+'px';}}
    else{pop.style.left='0';if(inTop){pop.style.bottom='auto';pop.style.top=(pr.height+8)+'px';}else{pop.style.top='auto';pop.style.bottom=(pr.height+8)+'px';}}
    pop.classList.add('open');}
  function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  function stopRec(f,fill){AC.rec=false;clearInterval(AC.timer);const b=f.querySelector('.ac-rec');b.classList.remove('recording');f.querySelector('.ac-rec-lbl').textContent='Voice';const t=f.querySelector('.ac-input');if(fill&&!t.value.trim()){t.value='A girl who mails letters to the stars gets a letter from her future self, and decides to find its sender before sunset.';inputState(f).text=t.value;M.save();sync(f);}S.toast('Voice input is a demo: no audio is recorded.');}

  document.addEventListener('click',ev=>{const el=ev.target.closest('[data-ac]'),f=ev.target.closest('.ac-form');
    if(ev.target.closest('[data-home="sample"]')&&f)setTimeout(()=>sync(f),0);
    if(!el){if(AC.open&&!ev.target.closest('.ac-pop'))close();return;}
    const d=inputState(f),a=A(d),key=el.dataset.ac;
    switch(key){
      case'mode-toggle':open(f,'mode');break;
      case'mode-pick':d.mode=el.dataset.mode;M.save();f.querySelectorAll('[data-ac="mode-pick"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===d.mode)));close();break;
      case'model-toggle':open(f,'model');break;
      case'auto-menu':a.auto=!a.auto;M.save();paintModel(f,a);paintEff(f,a);if(a.auto)setTimeout(close,180);break;
      case'auto-off':ev.stopPropagation();a.auto=false;M.save();paintModel(f,a);close();break;
      case'tab':AC.tab=el.dataset.tab;AC.hover=null;paintModel(f,a);paintEff(f,a);break;
      case'star':{ev.stopPropagation();const id=el.dataset.id,i=a.favs.indexOf(id);if(i<0){a.favs.push(id);a.model=id;a.auto=false;}else a.favs.splice(i,1);M.save();paintModel(f,a);paintEff(f,a);break;}
      case'pick':a.model=el.dataset.id;a.auto=false;M.save();close();paintModel(f,a);break;
      case'eff':if(AC.hover){a.eff[AC.hover]=el.dataset.l;a.model=AC.hover;a.auto=false;M.save();paintModel(f,a);paintEff(f,a);}break;
      case'files':f.querySelector('.ac-file').click();break;
      case'rm-file':AC.files.splice(+el.dataset.i,1);{const c=f.querySelector('.ac-chips');c.innerHTML=chips();c.hidden=!AC.files.length;sync(f);}break;
      case'ctx':{const t=f.querySelector('.ac-input');t.value=t.value.replace(/@$/,el.dataset.tag+' ');d.text=t.value;M.save();sync(f);t.focus();break;}
      case'record':if(AC.rec)stopRec(f,true);else{AC.rec=true;AC.sec=0;f.querySelector('.ac-rec').classList.add('recording');f.querySelector('.ac-rec-lbl').textContent='0:00';AC.timer=setInterval(()=>{const l=document.querySelector('.ac-rec-lbl');if(!l||!AC.rec){clearInterval(AC.timer);return;}l.textContent=fmt(++AC.sec);},1000);}break;
    }
  });
  document.addEventListener('change',ev=>{if(!ev.target.matches('.ac-file'))return;const f=form(ev.target);AC.files.push(...[...ev.target.files]);ev.target.value='';const c=f.querySelector('.ac-chips');c.innerHTML=chips();c.hidden=!AC.files.length;sync(f);});
  document.addEventListener('input',ev=>{const t=ev.target,f=form(t);if(!f)return;if(t.matches('.ac-input'))sync(f);if(t.matches('[data-ac-search]')){AC.q=t.value;AC.hover=null;const a=A(inputState(f));f.querySelector('.ac-list').innerHTML=rows(a);paintEff(f,a);}});
  document.addEventListener('keydown',ev=>{const t=ev.target,f=form(t);if(!f)return;
    if(t.matches('.ac-input')&&ev.key==='Enter'&&!ev.shiftKey&&!ev.isComposing){ev.preventDefault();f.requestSubmit();}
    else if(ev.key==='Escape'&&AC.open){close();}
    else if((ev.key==='Enter'||ev.key===' ')&&t.matches('[role=menuitem],.ac-auto')){ev.preventDefault();t.click();}});
  document.addEventListener('mouseover',ev=>{const f=ev.target.closest?.('.ac-form');if(!f||AC.open!=='model')return;const row=ev.target.closest('.ac-row');
    if(row){if(AC.hover!==row.dataset.id){AC.hover=row.dataset.id;f.querySelectorAll('.ac-row').forEach(r=>r.classList.toggle('hover',r===row));paintEff(f,A(inputState(f)));}}
    else if(!ev.target.closest('.ac-eff-pop')&&ev.target.closest('.ac-model-pop')&&AC.hover){AC.hover=null;f.querySelectorAll('.ac-row.hover').forEach(r=>r.classList.remove('hover'));f.querySelector('.ac-eff-pop').classList.remove('open');}});

  C.aiComposer=(scope,d)=>build(scope,d);
  /* After the homepage route re-renders, restore the composer height and submit state from existing text. */
  new MutationObserver(()=>{document.querySelectorAll('.ac-form:not([data-ready])').forEach(f=>{f.dataset.ready='1';sync(f);});}).observe(document.documentElement,{childList:true,subtree:true});
})();
