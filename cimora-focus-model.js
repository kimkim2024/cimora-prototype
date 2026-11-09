/* 聚焦只拥有视图状态，镜头编辑仍由导演模型负责。 */
window.createCimoraFocusModel=function(M,S){
 const list=c=>M.production.shots(c.e),state=c=>c.e.canvasFocus??={active:false,shotId:null,tab:'work',candidateId:null};
 function current(c){return list(c).find(s=>s.id===state(c).shotId)||list(c).find(s=>s.id===c.e.selectedShotId)||list(c)[0];}
 function open(c,id){const s=list(c).find(s=>s.id===id);if(!s)return false;const f=state(c);if(!f.active){f.overview=M.clone(c.e.creationCanvas);f.overviewShot=c.e.selectedShotId;}f.active=true;f.shotId=s.id;f.tab='work';f.candidateId=null;c.e.selectedShotId=s.id;M.save();return true;}
 function step(c,delta){const ss=list(c),i=ss.indexOf(current(c)),s=ss[i+delta];if(s)open(c,s.id);}
 function back(c){const f=state(c);if(f.overview)c.e.creationCanvas=M.clone(f.overview);if(f.overviewShot)c.e.selectedShotId=f.overviewShot;f.active=false;M.save();}
 function compared(c){const s=current(c);return s?.candidates.find(v=>v.id===state(c).candidateId)||s?.candidates.find(v=>v.id!==s.adoptedId)||s?.candidates[0]||null;}
 function compare(c,id){const f=state(c);if(id&&current(c)?.candidates.some(v=>v.id===id))f.candidateId=id;f.tab='compare';M.save();}
 M.focus={state,current,open,step,back,compared,compare};return M;
};
