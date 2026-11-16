/* 仅管理执行记录。成果始终保存在原工作台。 */
(function(root){
 'use strict';
 const ended=new Set(['done','failed','cancelled']);
 const labels={queued:'等待中',running:'生成中',done:'已完成',failed:'失败',cancelled:'已取消',recorded:'已记录 · 未执行'};
 const sources={story:'故事创作',comic:'漫画创作',video:'视频创作',tools:'创作工具'};
 const copy=x=>JSON.parse(JSON.stringify(x));
 // 同步摘要只用于检测输入变更，不作安全散列；媒体内容不重复写入任务库。
 function fingerprint(value){const text=JSON.stringify(value)??'';let a=2166136261,b=5381;for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}return text.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);}
 function describeInput(value){return (JSON.stringify(value,(_key,x)=>typeof x==='string'&&/^(?:data:|blob:)/.test(x)?'[媒体参考保存在原工作台]':x,2)||'').slice(0,12000);}
 function initial(){return {version:1,records:[],hidden:[]};}
 function merge(external,state){const map=new Map();for(const row of [...state.records,...external]){const key=row.originKey||row.id;if(!key)continue;map.set(key,{...map.get(key),...row});}return [...map.values()].filter(x=>!state.hidden.includes(x.id)&&!state.hidden.includes(x.originKey)).sort((a,b)=>(b.at||'').localeCompare(a.at||''));}
 function filter(rows,f={}){return rows.filter(x=>(!f.status||f.status==='all'||(f.status==='active'?['queued','running'].includes(x.state):x.state===f.status))&&(!f.source||f.source==='all'||x.source===f.source)&&(!f.project||f.project==='all'||(f.project==='independent'?!x.projectKey:x.projectKey===f.project))&&(!f.search||[x.title,x.projectTitle,x.location,x.input,sources[x.source]].join(' ').toLowerCase().includes(f.search.toLowerCase())));}
 function groups(rows){const all=[],map=new Map();for(const row of rows){if(!row.batchId){all.push({...row,children:null});continue;}let g=map.get(row.batchId);if(!g){g={id:row.batchId,title:row.batchTitle||'批量生成',source:row.source,projectKey:row.projectKey,projectTitle:row.projectTitle,demo:row.demo,children:[],at:row.at};map.set(row.batchId,g);all.push(g);}g.children.push(row);}return all.map(g=>{if(!g.children)return g;const a=g.children,n=a.filter(x=>ended.has(x.state)).length;return {...g,progress:Math.round(n/a.length*100),state:a.some(x=>x.state==='failed')?'failed':a.some(x=>x.state==='running')?'running':a.some(x=>x.state==='queued')?'queued':a.some(x=>x.state==='recorded')?'recorded':a.every(x=>x.state==='cancelled')?'cancelled':'done'};});}
 const canCancel=x=>!!x.demo&&x.state==='queued';
 const canRetry=x=>!!(x.demo||x.retrySpec)&&x.state==='failed';
 function transition(row,action){if(action==='cancel'&&canCancel(row)){row.state='cancelled';return row;}if(action==='retry'&&canRetry(row)){row.state='queued';row.attempt=(row.attempt||1)+1;row.error='';return row;}throw Error('当前任务不可执行此操作，请返回原工作台。');}
 function hide(state,id){const row=state.records.find(x=>x.id===id);if(row&&!ended.has(row.state)&&row.state!=='recorded')throw Error('进行中的任务不能清理');if(!state.hidden.includes(id))state.hidden.push(id);}
 function example(id,at){const base={source:'comic',projectKey:'demo:task-center',projectTitle:'任务操作示例',batchId:id,batchTitle:'第1集 · 4页漫画',at,demo:true,input:'将雨夜重逢的第1集整理成四页漫画；复用人物和街景参考。',resultNote:'任务操作占位，不调用模型，也不生成图片。'};return ['done','failed','queued','queued'].map((state,i)=>({...base,id:id+'-'+i,state,title:'第'+(i+1)+'页 · 整页生成',location:'第1集 / 第'+(i+1)+'页',attempt:1,error:state==='failed'?'示例：生成服务超时，本页未产生结果；第1页成功结果仍然保留。':'',result:state==='done'?{kind:'demo',text:'第1页：离城前夜，主角与同事在街边吃宵夜，手机收到陌生的好友请求。'}:undefined}));}
 const api={initial,merge,filter,groups,ended,labels,sources,canCancel,canRetry,transition,hide,example,copy,fingerprint,describeInput};
 if(typeof module!=='undefined')module.exports=api;else root.GenerationTasksModel=api;
})(typeof window!=='undefined'?window:globalThis);
