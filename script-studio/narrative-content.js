/* Read legacy split dialogue without rewriting saved projects or generation snapshots. */
(function(root){
'use strict';
const normalize=value=>String(value??'').replace(/\r\n?/g,'\n').trim();
const unquote=value=>value.replace(/^[“「]([\s\S]*)[”」]$/,'$1');
function merge(main,dialogue){
 const body=String(main??''),legacy=String(dialogue??'');
 if(!legacy.trim())return body;
 if(!body.trim())return legacy;
 const quoted=[...body.matchAll(/“([^”]+)”|「([^」]+)」/g)].map(m=>normalize(m[1]??m[2]));
 const lines=new Set(normalize(body).split('\n').map(normalize));
 // Only exact quoted speech or complete lines count as duplicates. A substring
 // match could discard a short spoken line or a manually supplied speaker cue.
 const included=line=>lines.has(normalize(line))||quoted.includes(normalize(unquote(normalize(line))));
 if(normalize(body)===normalize(legacy)||included(legacy))return body;
 const remainder=legacy.replace(/\r\n?/g,'\n').split('\n').filter(line=>!line.trim()||!included(line)).join('\n');
 return remainder.trim()?body+'\n\n对白与旁白：\n'+remainder:body;
}
const api={merge};
if(typeof module!=='undefined')module.exports=api;else root.StoryNarrative=api;
})(globalThis);
