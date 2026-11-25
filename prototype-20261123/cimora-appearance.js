/* 先于页面绘制应用外观；只更换颜色，不重新渲染或修改工程。 */
(()=>{
  const modes=['system','schedule','black','white','pink','purple','orange'];
  const names={system:'Follow system',schedule:'By time',black:'Black',white:'White',pink:'Sakura pink',purple:'Iris purple',orange:'Sunset orange'};
  const defaults={mode:'system',dayStart:'07:00',nightStart:'19:00'};
  const validTime=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  const minutes=v=>Number(v.slice(0,2))*60+Number(v.slice(3));
  function normalize(value){
    const v=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    const pref={mode:modes.includes(v.mode)?v.mode:'system',dayStart:validTime(v.dayStart)?v.dayStart:defaults.dayStart,nightStart:validTime(v.nightStart)?v.nightStart:defaults.nightStart};
    if(pref.dayStart===pref.nightStart){pref.dayStart=defaults.dayStart;pref.nightStart=defaults.nightStart;}return pref;
  }
  function read(raw){try{return normalize(JSON.parse(raw));}catch{return normalize(null);}}
  function resolve(value,systemDark,now=new Date()){
    const pref=normalize(value);if(pref.mode==='system')return systemDark?'black':'white';
    if(pref.mode!=='schedule')return pref.mode;
    const current=now.getHours()*60+now.getMinutes(),start=minutes(pref.dayStart),end=minutes(pref.nightStart);
    return (start<end?current>=start&&current<end:current>=start||current<end)?'white':'black';
  }
  window.CimoraAppearanceCore={normalize,read,resolve};
  if(typeof document==='undefined')return;
  const key='cimora-appearance-v1',root=document.documentElement,system=window.matchMedia('(prefers-color-scheme: dark)');
  const load=()=>{try{return read(localStorage.getItem(key));}catch{return normalize(null);}};
  let pref=load();
  function apply(){
    const theme=(document.body&&document.body.classList.contains('cimora-app'))?'white':resolve(pref,system.matches);root.dataset.cimoraTheme=theme;root.dataset.appearanceMode=pref.mode;root.style.colorScheme=theme==='black'?'dark':'light';
    const toolbar=document.querySelector('.cm-top-actions,.nav-actions,.editor-frame-header');
    if(toolbar&&!toolbar.querySelector('[data-appearance="open"]')){const trigger=document.createElement('button');trigger.type='button';trigger.className='ap-trigger';trigger.dataset.appearance='open';trigger.textContent='◐';toolbar.prepend(trigger);}
    if(window.Site?.context.path==='/app/settings'&&!document.querySelector('.ap-settings')){const target=document.querySelector('.cm-main .workspace-columns');if(target){const card=document.createElement('section');card.className='surface padded ap-settings';card.innerHTML='<div><h2>Appearance</h2><p>Shared by the website and Creation Space; switching never interrupts your work.</p><span class="ap-preference-name"></span></div><button type="button" class="cm-button" data-appearance="open">Adjust appearance ↗</button>';target.before(card);}}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',{black:'#101016',white:'#f7f8fc',pink:'#fff3f7',purple:'#f4f0ff',orange:'#fff6eb'}[theme]);
    document.querySelectorAll('[data-appearance="open"]').forEach(el=>{el.setAttribute('title','Appearance · '+names[pref.mode]);el.setAttribute('aria-label',(el.classList.contains('ap-trigger')?'Appearance settings':'Adjust appearance')+', current'+names[pref.mode]);});
    document.querySelectorAll('.ap-preference-name').forEach(el=>el.textContent=names[pref.mode]+' · Current'+names[theme]);
    const panel=document.querySelector('.ap-panel');if(panel){
      panel.querySelectorAll('[data-appearance-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.appearanceMode===pref.mode)));
      panel.querySelector('.ap-current').textContent=names[pref.mode]+' · Current'+names[theme];
      panel.querySelector('.ap-schedule').hidden=pref.mode!=='schedule';
    }
  }
  function persist(){try{localStorage.setItem(key,JSON.stringify(pref));}catch{window.Site?.toast('Appearance switched, but local storage is unavailable; it may return to default after a refresh.');}apply();}
  function open(){
    const S=window.Site;if(!S)return;
    S.modal('Appearance',`<div class="ap-panel"><p class="ap-intro">Pick a comfortable base color for your creative space.</p><div class="ap-auto" role="group" aria-label="Automatic appearance">${[['system','◐','跟随系统','系统浅色用白，深色用黑'],['schedule','◷','按时间','根据本地时间自动切换黑白']].map(([mode,icon,title,desc])=>`<button type="button" data-appearance-mode="${mode}" aria-pressed="false"><span>${icon}</span><strong>${title}<small>${desc}</small></strong><i>✓</i></button>`).join('')}</div><div class="ap-section-title">Fixed theme<span>Always uses the color you picked</span></div><div class="ap-swatches" role="group" aria-label="Fixed theme">${['black','white','pink','purple','orange'].map(mode=>`<button type="button" data-appearance-mode="${mode}" aria-pressed="false"><span class="ap-swatch ${mode}"><b>Aa</b><i>✓</i></span><strong>${names[mode]}</strong></button>`).join('')}</div><form class="ap-schedule" data-appearance-form="schedule" hidden><div class="ap-section-title">Day and night schedule<span>Uses the device local time</span></div><div class="ap-time-fields"><label>Light theme starts<input type="time" name="dayStart" value="${pref.dayStart}" required></label><span>→</span><label>Dark theme start<input type="time" name="nightStart" value="${pref.nightStart}" required></label></div><p>Supports time ranges across midnight. Switches automatically while the page is open.</p><button class="cm-button" type="submit">Save time range</button></form><div class="ap-preview"><span class="ap-preview-icon">✦</span><div><strong>Same story, different mood.</strong><p>Buttons, text and input areas adapt along with the theme.</p></div><span class="ap-preview-pill">In progress</span></div><div class="ap-current" role="status" aria-live="polite"></div><p class="ap-local">Auto-saved on this device, shared by the website and Creation Space.</p></div>`,`<button type="button" class="cm-button primary" data-act="close">Done</button>`);
    apply();requestAnimationFrame(()=>{const body=document.querySelector('.dialog:has(.ap-panel) .dialog-body');if(body)body.scrollTop=0;document.querySelector('.dialog:has(.ap-panel) .close')?.focus({preventScroll:true});});
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest('[data-appearance="open"]')){open();return;}
    const button=ev.target.closest('.ap-panel button[data-appearance-mode]');if(!button)return;
    pref={...pref,mode:button.dataset.appearanceMode};persist();
  });
  document.addEventListener('submit',ev=>{
    const form=ev.target.closest('[data-appearance-form="schedule"]');if(!form)return;ev.preventDefault();
    const dayStart=form.elements.dayStart.value,nightStart=form.elements.nightStart.value;
    if(!validTime(dayStart)||!validTime(nightStart)||dayStart===nightStart){window.Site?.toast('Please set two different valid moments.');return;}
    pref=normalize({...pref,dayStart,nightStart});persist();window.Site?.toast('Day/night periods saved.');
  });
  system.addEventListener('change',apply);
  window.addEventListener('storage',ev=>{if(ev.key===key||ev.key===null){pref=load();apply();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){pref=load();apply();}});
  document.addEventListener('DOMContentLoaded',apply);
  setInterval(apply,15000);
  window.CimoraAppearance={open,refresh:apply};apply();
})();
