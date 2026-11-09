/* Spider-Verse glitch CTA for the homepage closing section. Native port of spider-verse-glitch-button. */
(()=>{
 const TARGET='.hm-official .hm-final-cta .hm-final-poster-action > .hm-button';
 const clean=value=>String(value||'').replace(/[↗→←]/g,'').replace(/\s+/g,' ').trim();
 const span=(className,text)=>{const node=document.createElement('span');node.className=className;if(text!=null)node.textContent=text;return node;};
 function enhance(anchor){
  if(anchor.dataset.svButton==='1')return;
  const text=clean(anchor.textContent)||'Enter Studio';
  anchor.dataset.svButton='1';
  anchor.classList.add('sv-button');
  anchor.setAttribute('aria-label',text);
  const layers=span('sv-layers');layers.setAttribute('aria-hidden','true');
  layers.appendChild(span('sv-layer sv-1',text));
  layers.appendChild(span('sv-layer sv-2',text));
  const noise=span('sv-noise');noise.setAttribute('aria-hidden','true');
  const slice=span('sv-slice');slice.setAttribute('aria-hidden','true');
  const label=span('sv-label',text);
  anchor.replaceChildren(label,layers,noise,slice);
 }
 function sync(){document.querySelectorAll(TARGET).forEach(anchor=>{if(!anchor.classList.contains('sv-button'))enhance(anchor);});}
 new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
 sync();
})();
