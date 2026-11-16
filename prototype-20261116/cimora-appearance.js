/* 先于页面绘制应用外观；只更换颜色，不重新渲染或修改工程。 */
(()=>{
  const modes=['system','schedule','black','white','pink','purple','orange'];
  const names={system:'跟随系统',schedule:'按时间',black:'黑色',white:'白色',pink:'樱花粉',purple:'鸢尾紫',orange:'日落橙'};
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
    const theme=resolve(pref,system.matches);root.dataset.cimoraTheme=theme;root.dataset.appearanceMode=pref.mode;root.style.colorScheme=theme==='black'?'dark':'light';
    const toolbar=document.querySelector('.cm-top-actions,.nav-actions,.editor-frame-header');
    if(toolbar&&!toolbar.querySelector('[data-appearance="open"]')){const trigger=document.createElement('button');trigger.type='button';trigger.className='ap-trigger';trigger.dataset.appearance='open';trigger.textContent='◐';toolbar.prepend(trigger);}
    if(window.Site?.context.path==='/app/settings'&&!document.querySelector('.ap-settings')){const target=document.querySelector('.cm-main .workspace-columns');if(target){const card=document.createElement('section');card.className='surface padded ap-settings';card.innerHTML='<div><h2>外观</h2><p>官网与创作空间共用，切换不会打断创作。</p><span class="ap-preference-name"></span></div><button type="button" class="cm-button" data-appearance="open">调整外观 ↗</button>';target.before(card);}}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',{black:'#101016',white:'#f7f8fc',pink:'#fff3f7',purple:'#f4f0ff',orange:'#fff6eb'}[theme]);
    document.querySelectorAll('[data-appearance="open"]').forEach(el=>{el.setAttribute('title','外观 · '+names[pref.mode]);el.setAttribute('aria-label',(el.classList.contains('ap-trigger')?'外观设置':'调整外观')+'，当前'+names[pref.mode]);});
    document.querySelectorAll('.ap-preference-name').forEach(el=>el.textContent=names[pref.mode]+' · 当前'+names[theme]);
    const panel=document.querySelector('.ap-panel');if(panel){
      panel.querySelectorAll('[data-appearance-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.appearanceMode===pref.mode)));
      panel.querySelector('.ap-current').textContent=names[pref.mode]+' · 当前'+names[theme];
      panel.querySelector('.ap-schedule').hidden=pref.mode!=='schedule';
    }
  }
  function persist(){try{localStorage.setItem(key,JSON.stringify(pref));}catch{window.Site?.toast('外观已切换，本机存储不可用，刷新后可能恢复默认。');}apply();}
  function open(){
    const S=window.Site;if(!S)return;
    S.modal('外观',`<div class="ap-panel"><p class="ap-intro">为你的创作空间，选一个舒服的底色。</p><div class="ap-auto" role="group" aria-label="自动外观">${[['system','◐','跟随系统','系统浅色用白，深色用黑'],['schedule','◷','按时间','根据本地时间自动切换黑白']].map(([mode,icon,title,desc])=>`<button type="button" data-appearance-mode="${mode}" aria-pressed="false"><span>${icon}</span><strong>${title}<small>${desc}</small></strong><i>✓</i></button>`).join('')}</div><div class="ap-section-title">固定主题<span>一直使用你选的颜色</span></div><div class="ap-swatches" role="group" aria-label="固定主题">${['black','white','pink','purple','orange'].map(mode=>`<button type="button" data-appearance-mode="${mode}" aria-pressed="false"><span class="ap-swatch ${mode}"><b>Aa</b><i>✓</i></span><strong>${names[mode]}</strong></button>`).join('')}</div><form class="ap-schedule" data-appearance-form="schedule" hidden><div class="ap-section-title">日夜时段<span>使用设备的本地时间</span></div><div class="ap-time-fields"><label>白色主题开始<input type="time" name="dayStart" value="${pref.dayStart}" required></label><span>→</span><label>黑色主题开始<input type="time" name="nightStart" value="${pref.nightStart}" required></label></div><p>支持跨午夜时段。页面打开期间会自动切换。</p><button class="cm-button" type="submit">保存时段</button></form><div class="ap-preview"><span class="ap-preview-icon">✦</span><div><strong>同一个故事，不同的心情。</strong><p>按钮、文字与输入区域会随主题一起适配。</p></div><span class="ap-preview-pill">创作中</span></div><div class="ap-current" role="status" aria-live="polite"></div><p class="ap-local">自动保存至本机，官网与创作空间共用。</p></div>`,`<button type="button" class="cm-button primary" data-act="close">完成</button>`);
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
    if(!validTime(dayStart)||!validTime(nightStart)||dayStart===nightStart){window.Site?.toast('请设置两个不同的有效时刻。');return;}
    pref=normalize({...pref,dayStart,nightStart});persist();window.Site?.toast('日夜时段已保存。');
  });
  system.addEventListener('change',apply);
  window.addEventListener('storage',ev=>{if(ev.key===key||ev.key===null){pref=load();apply();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){pref=load();apply();}});
  document.addEventListener('DOMContentLoaded',apply);
  setInterval(apply,15000);
  window.CimoraAppearance={open,refresh:apply};apply();
})();
