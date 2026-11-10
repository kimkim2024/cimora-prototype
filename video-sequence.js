window.VideoSequence=(()=>{
 function rows(shots,episodeId){let total=0;return shots.filter(s=>s.episodeId===episodeId).map(shot=>{const duration=Math.max(1,Number(shot.duration)||6),candidate=shot.candidates?.find(c=>c.id===shot.adoptedId),row={id:shot.id,shot,start:total,end:total+duration,duration,image:candidate?.image||null,status:shot.direction?.locked?'已锁定':candidate?.image?'已有示意':'未准备'};total+=duration;return row;});}
 function locate(rows,time){return rows.find(row=>time>=row.start&&time<row.end)||rows.at(-1)||null;}
 function controller(schedule,cancel){let handle=null,generation=0;return {start(tick){this.stop();const token=generation;const run=()=>{if(token!==generation)return;tick();if(token===generation)handle=schedule(run,250);};handle=schedule(run,250);},stop(){generation++;if(handle!==null)cancel(handle);handle=null;},get active(){return handle!==null;}};}
 return {rows,locate,controller};
})();
