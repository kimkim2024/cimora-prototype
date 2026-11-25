/* DitheredFooter reference adapted to the static homepage. No subscription backend. */
(()=>{
 const columns=[['Product',[['Features','/product'],['Pricing','/pricing'],['Templates','/templates'],['Changelog','/resources/updates']]],['Resources',[['Docs','/help'],['Guides','/resources'],['Community','/app/community'],['Tools','/tools']]],['Studio',[['Showcase','/showcase'],['Comic Creation','/features/webtoon'],['Video Creation','/features/motion-comic'],['Start Creating','/app/new']]]];
 function render(){return `<link rel="stylesheet" href="cimora-footer03.css"><footer class="cdf" aria-label="Cimora footer"><div class="cdf-main"><div><a href="#/" class="cdf-brand">Cimora</a><p class="cdf-tagline">Turn the worlds you love into your own work. Stories, characters, comics and motion in one studio.</p><form class="cdf-subscribe"><label for="cdf-email">Get product updates by email</label><div class="cdf-form-row"><input id="cdf-email" name="email" type="email" required autocomplete="email" aria-describedby="cdf-subscribe-status"><button type="submit">Subscribe</button></div><p id="cdf-subscribe-status" role="status">Demo only — email subscriptions are not connected.</p></form></div>${columns.map(([title,links])=>`<nav class="cdf-column" aria-label="${title}"><h3>${title}</h3><ul>${links.map(([label,url])=>`<li><a href="#${url}">${label}</a></li>`).join('')}</ul></nav>`).join('')}</div><div class="cdf-bottom"><div class="cdf-bottom-inner"><div class="cdf-legal"><p>© ${new Date().getFullYear()} Cimora.</p><a href="#/legal/privacy">Privacy</a><a href="#/legal/terms">Terms</a></div><button type="button" class="cdf-top">Back to top<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button></div></div><div class="df-band" aria-hidden="true"><div class="df-field"><div class="df-dots"></div></div><p class="df-mark">Cimora Studio</p></div></footer>`;}
 function mount(root){
  const controller=new AbortController(),opts={signal:controller.signal};const band=root.querySelector('.df-band'),field=root.querySelector('.df-field');let frame=0,visible=false;
  const pause=()=>root.classList.toggle('is-paused',!visible||document.hidden);
  const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;pause();});observer.observe(band);pause();document.addEventListener('visibilitychange',pause,opts);
  band.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=field.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{field.style.setProperty('--df-x',x+'px');field.style.setProperty('--df-y',y+'px');field.classList.add('df-lit');});},opts);
  band.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);field.classList.remove('df-lit');},opts);
  root.querySelector('.cdf-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),opts);
  root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();root.querySelector('[role=status]').textContent='Subscriptions are not connected yet. Your email has not been sent or saved.';},opts);
  return ()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);};
 }
 const mounted=new Map();
 function sync(){mounted.forEach((dispose,el)=>{if(!el.isConnected){dispose();mounted.delete(el);}});document.querySelectorAll('footer.cdf').forEach(el=>{if(!mounted.has(el))mounted.set(el,mount(el));});}
 new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
 window.CimoraFooter03=Object.freeze({render});sync();
})();
