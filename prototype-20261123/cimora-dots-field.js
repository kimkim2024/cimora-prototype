/* SVG dot pattern behind the homepage composer. Native port of the shadcn DotPattern reference. */
(()=>{
 const NS='http://www.w3.org/2000/svg';
 const SETTINGS={width:16,height:16,x:0,y:0,cx:1,cy:1,cr:1};
 let uid=0;
 const el=(name,attrs)=>{const node=document.createElementNS(NS,name);for(const key in attrs)node.setAttribute(key,attrs[key]);return node;};
 function build(){
  const {width,height,x,y,cx,cy,cr}=SETTINGS;
  const id='hm-dot-pattern-'+(++uid)+'-'+Math.random().toString(36).slice(2,7);
  const svg=el('svg',{class:'hm-dot-pattern','aria-hidden':'true'});
  const defs=el('defs',{});
  const pattern=el('pattern',{id,width,height,patternUnits:'userSpaceOnUse',patternContentUnits:'userSpaceOnUse',x,y});
  pattern.appendChild(el('circle',{id:'hm-pattern-circle',cx,cy,r:cr}));
  defs.appendChild(pattern);
  svg.appendChild(defs);
  svg.appendChild(el('rect',{width:'100%',height:'100%','stroke-width':0,fill:`url(#${id})`}));
  return svg;
 }
 function mount(host){
  if(host.querySelector(':scope > .hm-dot-pattern'))return()=>{};
  const svg=build();
  host.prepend(svg);
  host.classList.add('hm-dot-pattern-host');
  return()=>{svg.remove();host.classList.remove('hm-dot-pattern-host');};
 }
 const mounted=new Map();
 function sync(){
  mounted.forEach((dispose,host)=>{if(!host.isConnected){dispose();mounted.delete(host);}});
  document.querySelectorAll('.hm-official .hm-public-launch').forEach(host=>{if(!mounted.has(host))mounted.set(host,mount(host));});
 }
 new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
 sync();
})();
