(()=>{
 'use strict';
 const KEY='cimora-studio-library-v1',DB='cimora-studio-management-v1';
 let databasePromise,stored,failure='',initialized=false,queue=Promise.resolve();
 function database(){
  if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{
   const request=indexedDB.open(DB,1);
   request.onupgradeneeded=()=>request.result.createObjectStore('metadata');
   request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();databasePromise=null;};resolve(db);};
   request.onerror=()=>reject(Error('管理记录数据库无法打开，原记录保留。'));
   request.onblocked=()=>reject(Error('管理记录数据库被旧窗口占用，请关闭旧窗口后重试。'));
  }).catch(error=>{databasePromise=null;throw error;});
  return databasePromise;
 }
 async function refresh(){
   const db=await database();
   const latest=await new Promise((resolve,reject)=>{
    const request=db.transaction('metadata').objectStore('metadata').get(KEY);
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
   });
   if(latest!==undefined&&(typeof latest!=='string'||!JSON.parse(latest)))throw Error('管理记录格式异常');
   stored=latest;
 }
 const ready=(async()=>{
  try{await refresh();
  }catch{failure='管理记录无法读取，已保留原数据；请重新打开页面后重试。';}
  finally{initialized=true;}
 })();
 function read(){
  if(!initialized)throw Error('管理记录正在载入，请稍候。');
  if(failure)throw Error(failure);
  return stored===undefined?localStorage.getItem(KEY):stored;
 }
 function write(value){
  read();const raw=JSON.stringify(value);
  if(stored===undefined){
   try{localStorage.setItem(KEY,raw);return;}
   catch(error){if(!['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name))throw Error('本机空间不足，未保存本次修改。');}
  }
  return (async()=>{
   try{
    const db=await database();
    await new Promise((resolve,reject)=>{
     const tx=db.transaction('metadata','readwrite');
     tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);tx.onerror=()=>{};
     const object=tx.objectStore('metadata'),expected=stored,request=object.get(KEY);
     request.onsuccess=()=>{
      if(request.result!==expected){tx.abort();reject(Error('管理记录已在其他窗口更新，请重试。'));return;}
      try{object.put(raw,KEY);}catch(error){tx.abort();reject(error);}
     };
    });
    stored=raw;
   }catch{throw Error('本机存储写入失败，本次未保存；原记录和当前输入保留，请重试。');}
  })();
 }
 function change(transform){
  const run=async()=>{
   await ready;if(failure)throw Error(failure);
   await refresh();
   const raw=read(),value=raw?JSON.parse(raw):{version:1,projects:{},assets:{},personal:[],examples:null};
   transform(value);await write(value);
  };
  const pending=queue.then(()=>navigator.locks?.request?navigator.locks.request(DB,run):run());queue=pending.catch(()=>{});return pending;
 }
 window.StudioManagementStorage={ready,read,write,change,reload:refresh};
})();
