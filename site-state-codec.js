/* Lossless storage for native engines; top-level project and asset metadata stays JSON. */
(function(root){
  'use strict';
  const codec=typeof module!=='undefined'?require('./tool-storage-codec.js'):root.ToolStorageCodec;
  const encoding='lzw-utf16-engines-v1';let cache=new Map();
  function stringify(state){
    if(!state.cimora?.projects)return JSON.stringify(state);
    const projects={},next=new Map();
    for(const [pid,chapters] of Object.entries(state.cimora.projects)){
      projects[pid]={};
      for(const [cid,engine] of Object.entries(chapters)){
        const text=JSON.stringify(engine),packed=cache.get(text)||codec.pack(engine);
        next.set(text,packed);projects[pid][cid]=packed;
      }
    }
    const raw=JSON.stringify({...state,cimora:{...state.cimora,projects},cimoraEngineEncoding:encoding});
    cache=next;return raw;
  }
  function parse(raw){
    const state=JSON.parse(raw);if(!state?.cimoraEngineEncoding)return state;
    if(state.cimoraEngineEncoding!==encoding||!state.cimora?.projects)throw Error('工程压缩格式无法读取，原记录已保留。');
    const next=new Map();
    for(const chapters of Object.values(state.cimora.projects))for(const [cid,packed] of Object.entries(chapters)){
      const engine=codec.unpack(packed);chapters[cid]=engine;next.set(JSON.stringify(engine),packed);
    }
    delete state.cimoraEngineEncoding;cache=next;return state;
  }
  const api={stringify,parse};if(typeof module!=='undefined')module.exports=api;else root.SiteStateCodec=api;
})(typeof window==='undefined'?globalThis:window);
