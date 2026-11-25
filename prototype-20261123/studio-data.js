(()=>{
 'use strict';
 const S=Site,E=S.esc,format='cimora-local-backup',journalName='cimora-local-recovery-v1';
 const schemas=[{name:'cimora-studio-management-v1',stores:[['metadata',null]]},{name:'cimora-community-v1',stores:[['works','id'],['preferences',null]]},{name:'cimora-export-center-v1',stores:[['exports','id'],['counters',null]]},{name:'cimora-tool-video-v1',stores:[['files',null]]}];
 const productKey=key=>typeof key==='string'&&/^(cimora-|framein-)/.test(key);
 let pending=null,busy=false;
 function open(schema){return new Promise((resolve,reject)=>{const request=indexedDB.open(schema.name);request.onupgradeneeded=()=>{for(const [name,keyPath]of schema.stores)request.result.createObjectStore(name,keyPath?{keyPath}:undefined);};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('数据库无法读取'));request.onblocked=()=>reject(Error('数据库被其他窗口占用，请关闭其他创作标签页后重试。'));});}
 function transaction(db,names,mode,operation){return new Promise((resolve,reject)=>{const tx=db.transaction(names,mode);let result;tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||Error('本机数据库写入失败'));tx.onerror=()=>{};try{result=operation(tx);}catch(error){tx.abort();reject(error);}});}
 async function nativeSnapshot(){
  const local=Object.keys(localStorage).filter(productKey).sort().map(key=>[key,localStorage.getItem(key)]),databases=[];
  for(const schema of schemas){const db=await open(schema);try{
   const stores=await transaction(db,schema.stores.map(([name])=>name),'readonly',tx=>schema.stores.map(([name,keyPath])=>{const entries=[],cursor=tx.objectStore(name).openCursor();cursor.onsuccess=()=>{const row=cursor.result;if(row){entries.push([row.key,row.value]);row.continue();}};return {name,keyPath,entries};}));
   databases.push({name:schema.name,version:1,stores});
  }finally{db.close();}}
  return {local,databases};
 }
 async function encode(value){
  if(value===undefined)return {type:'undefined'};
  if(value===null||['string','number','boolean'].includes(typeof value))return value;
  if(value instanceof Blob){const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(value);});return {type:'blob',mime:value.type,data,...(value instanceof File?{name:value.name,lastModified:value.lastModified}:{})};}
  if(value instanceof Date)return {type:'date',value:value.toISOString()};
  if(value instanceof ArrayBuffer||ArrayBuffer.isView(value)){const bytes=new Uint8Array(value instanceof ArrayBuffer?value:value.buffer,value.byteOffset||0,value.byteLength);return {type:'bytes',view:value instanceof ArrayBuffer?'ArrayBuffer':value.constructor.name,data:Array.from(bytes)};}
  if(Array.isArray(value))return {type:'array',items:await Promise.all(value.map(encode))};
  if(typeof value==='object')return {type:'object',entries:await Promise.all(Object.entries(value).map(async([key,item])=>[key,await encode(item)]))};
  throw Error('备份中存在无法保存的数据类型。');
 }
 function decode(node,depth=0){
  if(depth>120)throw Error('备份结构过深，无法恢复。');
  if(node===null||['string','number','boolean'].includes(typeof node))return node;
  if(!node||typeof node!=='object')throw Error('备份数据格式无效。');
  if(node.type==='undefined')return undefined;
  if(node.type==='blob'){if(typeof node.data!=='string'||!/^data:[^,]*;base64,/.test(node.data))throw Error('媒体备份格式无效。');const bytes=Uint8Array.from(atob(node.data.slice(node.data.indexOf(',')+1)),char=>char.charCodeAt(0));return typeof node.name==='string'?new File([bytes],node.name,{type:node.mime||'',lastModified:node.lastModified}):new Blob([bytes],{type:node.mime||''});}
  if(node.type==='date'){const value=new Date(node.value);if(Number.isNaN(value.getTime()))throw Error('备份日期无效');return value;}
  if(node.type==='bytes'){if(!Array.isArray(node.data)||node.data.some(value=>!Number.isInteger(value)||value<0||value>255))throw Error('备份文件字节无效');const bytes=Uint8Array.from(node.data),views={Uint8Array,Uint8ClampedArray,Int8Array,Uint16Array,Int16Array,Uint32Array,Int32Array,Float32Array,Float64Array,DataView};if(node.view==='ArrayBuffer')return bytes.buffer;const View=views[node.view];if(!View)throw Error('不支持的文件数据类型');return new View(bytes.buffer);}
  if(node.type==='array'&&Array.isArray(node.items))return node.items.map(item=>decode(item,depth+1));
  if(node.type==='object'&&Array.isArray(node.entries)){if(node.entries.some(pair=>!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'))throw Error('备份对象格式无效');return Object.fromEntries(node.entries.map(([key,item])=>[key,decode(item,depth+1)]));}
  throw Error('备份数据格式无效。');
 }
 async function capture(){
  const snapshot=await nativeSnapshot(),databases=[];
  for(const db of snapshot.databases){
   const stores=[];
   for(const store of db.stores){const entries=await Promise.all(store.entries.map(async([key,value])=>[await encode(key),await encode(value)]));stores.push({...store,entries});}
   databases.push({...db,stores});
  }
  return {format,version:1,createdAt:new Date().toISOString(),local:snapshot.local,databases};
 }
 function validate(bundle){
  if(bundle?.format!==format||bundle.version!==1||!Array.isArray(bundle.local)||!Array.isArray(bundle.databases)||bundle.databases.length!==schemas.length)throw Error('不支持的备份格式，请选择本产品下载的完整备份。');
  const keys=new Set();for(const pair of bundle.local){if(!Array.isArray(pair)||pair.length!==2||!productKey(pair[0])||typeof pair[1]!=='string'||keys.has(pair[0]))throw Error('备份的本机记录无效。');keys.add(pair[0]);}
  for(const [key,raw]of bundle.local){
   if(['framein-site-v4','cimora-script-studio-v1','cimora-comic-studio-v1','cimora-tool-studio-v1','cimora-studio-library-v1','cimora-generation-tasks-v1'].includes(key)){
    let value;try{value=key==='framein-site-v4'?SiteStateCodec.parse(raw):JSON.parse(raw);}catch{throw Error('备份中的'+key+'记录格式无效。');}
    if(!value||typeof value!=='object')throw Error('备份记录格式无效。');
    if(['framein-site-v4','cimora-script-studio-v1','cimora-comic-studio-v1'].includes(key)&&!Array.isArray(value.projects))throw Error('备份缺少工程列表。');
    if(key==='framein-site-v4'&&(!value.prefs||!Array.isArray(value.assets)))throw Error('备份缺少工作室信息。');
    if(key==='cimora-tool-studio-v1'&&(value.version!==1||!value.drafts||!Array.isArray(value.results)))throw Error('工具备份格式无效。');
    if(key==='cimora-studio-library-v1'&&(value.version!==1||!value.projects||!value.assets||!Array.isArray(value.personal)))throw Error('管理记录备份格式无效。');
   }
  }
  const databases=schemas.map(schema=>{const matches=bundle.databases.filter(db=>db.name===schema.name),db=matches[0];if(matches.length!==1||db.version!==1||!Array.isArray(db.stores)||db.stores.length!==schema.stores.length)throw Error('备份缺少完整的数据库记录。');return {...schema,version:1,stores:schema.stores.map(([name,keyPath])=>{const matches=db.stores.filter(store=>store.name===name),store=matches[0];if(matches.length!==1||store.keyPath!==keyPath||!Array.isArray(store.entries))throw Error('备份数据库结构无效。');const entries=store.entries.map(pair=>{if(!Array.isArray(pair)||pair.length!==2)throw Error('备份记录格式无效。');const key=decode(pair[0]),value=decode(pair[1]);try{indexedDB.cmp(key,key);}catch{throw Error('备份记录键无效');}if(keyPath&&(!value||value[keyPath]!==key))throw Error('备份记录与索引不一致');return [key,value];});for(let index=0;index<entries.length;index++)if(entries.slice(0,index).some(([key])=>indexedDB.cmp(key,entries[index][0])===0))throw Error('备份含重复记录');return {name,keyPath,entries};})};});
  const management=databases.find(db=>db.name==='cimora-studio-management-v1').stores[0].entries;
  for(const [key,raw]of management){if(key!=='cimora-studio-library-v1'||typeof raw!=='string')throw Error('管理数据库备份格式无效');let value;try{value=JSON.parse(raw);}catch{throw Error('管理数据库备份无法解读');}if(value?.version!==1||!value.projects||!value.assets||!Array.isArray(value.personal))throw Error('管理数据库备份格式无效');}
  return {local:bundle.local,databases};
 }
 async function apply(snapshot){
  for(const data of snapshot.databases){const schema=schemas.find(item=>item.name===data.name),db=await open(schema);try{await transaction(db,data.stores.map(store=>store.name),'readwrite',tx=>{for(const store of data.stores){const object=tx.objectStore(store.name);object.clear();for(const [key,value]of store.entries)store.keyPath?object.put(value):object.put(value,key);}});}finally{db.close();}}
  for(const key of Object.keys(localStorage).filter(productKey))localStorage.removeItem(key);
  for(const [key,value]of snapshot.local)localStorage.setItem(key,value);
 }
 async function journal(value){const db=await open({name:journalName,stores:[['pending',null]]});try{return await transaction(db,['pending'],value===undefined?'readonly':'readwrite',tx=>{const store=tx.objectStore('pending');if(value===undefined){const result={value:null},request=store.get('restore');request.onsuccess=()=>{result.value=request.result;};return result;}if(value===null)store.delete('restore');else store.put(value,'restore');});}finally{db.close();}}
 async function replace(snapshot){
  if(busy)throw Error('数据操作正在进行，请稍候。');busy=true;
  const run=async()=>{const before=await nativeSnapshot();await journal(before);try{await apply(snapshot);await journal(null);}catch(error){try{await apply(before);await journal(null);}catch{throw Error('恢复未完成，原记录回滚快照已保留。请重新打开本页恢复原记录。');}throw Error('数据写入失败，已恢复操作前的记录，请重试。');}};
  try{await (navigator.locks?.request?navigator.locks.request('cimora-studio-management-v1',run):run());}finally{busy=false;}
 }
 async function restore(bundle){return replace(validate(bundle));}
 async function reset(){return replace({local:[],databases:schemas.map(schema=>({name:schema.name,version:1,stores:schema.stores.map(([name,keyPath])=>({name,keyPath,entries:[]}))}))});}
 async function start(next){try{const saved=await journal();if(saved.value){await apply(saved.value);await journal(null);location.reload();return;}next();}catch(error){document.getElementById('site').innerHTML=`<main class="sa-page"><h1>本机数据暂时无法载入</h1><p>${E(error.message)}</p><p>原记录与恢复快照保留，请重新打开页面重试。</p><button type="button" onclick="location.reload()">重新读取</button></main>`;}}
 function summary(bundle){return `备份时间：${new Date(bundle.createdAt).toLocaleString('zh-CN')}\n本机记录：${bundle.local.length} 项\n数据库记录：${bundle.databases.reduce((total,db)=>total+db.stores.reduce((sum,store)=>sum+store.entries.length,0),0)} 项\n覆盖：项目、资产、工具、发布作品、订单、导出文件及使用偏好。`;}
 const button=(label,action)=>`<button type="button" class="cm-button primary" data-sd="${action}">${label}</button>`;
 document.addEventListener('change',async event=>{if(event.target.id!=='sd-restore-file')return;const status=document.getElementById('sd-status');try{const file=event.target.files[0];if(!file)return;const bundle=JSON.parse(await file.text());validate(bundle);pending=bundle;S.modal('从备份恢复',`<p class="sa-data-summary">${E(summary(bundle))}</p><p>恢复会替换当前本机创作记录。建议先下载当前备份，并关闭其他创作标签页。</p><label class="sa-check"><input type="checkbox" id="sd-confirm">我确认用此备份替换当前本机创作记录</label><p id="sd-error" role="alert"></p>`,button('确认恢复','confirm-restore')+'<button type="button" class="cm-button ghost" data-act="close">取消</button>',true);}catch(error){pending=null;status.textContent='备份格式无效：'+error.message;}finally{event.target.value='';}});
 document.addEventListener('click',async event=>{
  const target=event.target.closest('[data-sd]');if(!target)return;if(busy)return;const action=target.dataset.sd;
  const status=document.getElementById('sd-error')||document.getElementById('sd-status');target.disabled=true;
  try{
   if(action==='backup'){if(status)status.textContent='正在整理完整备份…';S.download(await capture(),'Cimora-完整本机备份-'+new Date().toISOString().slice(0,10)+'.json');if(status)status.textContent='完整备份已发起下载。';}
   else if(action==='reset')S.modal('清除本机创作数据',`<p>清除故事、漫画、视频工程、个人资产、工具成果、发布作品、订单、导出文件和设置。内置示例可重新体验。</p><p>电脑原文件不会删除；清除前建议下载完整备份。请先关闭其他创作标签页。</p><label class="sa-check"><input type="checkbox" id="sd-confirm">我确认清除本产品在当前浏览器的创作记录</label><p id="sd-error" role="alert"></p>`,button('确认清除','confirm-reset')+'<button type="button" class="cm-button ghost" data-act="close">取消</button>');
   else{if(!document.getElementById('sd-confirm')?.checked)throw Error('请先勾选确认。');if(action==='confirm-restore'){if(!pending)throw Error('请重新选择备份。');await restore(pending);}else if(action==='confirm-reset')await reset();S.close();location.hash='/app/settings?tab=profile';location.reload();}
  }catch(error){if(status)status.textContent=error.message;else S.toast(error.message);}finally{if(target.isConnected)target.disabled=false;}
 });
 window.StudioData={capture,validate,restore,reset,start};
})();
