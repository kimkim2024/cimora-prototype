(()=>{
 let mounted=null,cleanup=()=>{};
 function mount(){
  const root=document.querySelector('.room-demo');if(root===mounted)return;cleanup();mounted=root;if(!root)return;
  root.querySelector('.room-demo__controls')?.remove();
  root.querySelector('.room-demo__status')?.remove();
  root.classList.remove('is-night');
  root.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load();video.remove();});
  const grid=root.querySelector('.cards'),first=grid.querySelector('.card-frame');
  const photo=first.querySelector('img');photo.src=photo.dataset.nightSrc;photo.style.transition='none';photo.style.opacity='1';photo.removeAttribute('data-night-src');
  while(grid.children.length<5){const clone=first.cloneNode(true);clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));grid.append(clone);}
  const cards=[...root.querySelectorAll('.direct-card')];
  const scale=()=>cards.forEach(card=>card.querySelector('.direct-card__artboard').style.setProperty('--direct-scale',Math.min(card.clientWidth/660,card.clientHeight/660)));
  const ro=new ResizeObserver(scale);cards.forEach(card=>ro.observe(card));scale();
  cleanup=()=>ro.disconnect();
 }
 new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
})();
