/* Explicitly triggered local planning demo. Production snapshots remain independent. */
(function(root){
'use strict';
const S=typeof module!=='undefined'?require('./comic-page-script.js'):root.ComicPageScript;
const N=typeof module!=='undefined'?require('./narrative-content.js'):root.StoryNarrative;
function pageContent(pg){return N.merge(pg?.text,pg?.direction?.dialogue);}
function setPageContent(pg,text){if(text===pageContent(pg))return false;pg.direction??={};if(pg.direction.dialogue&&!pg.contentBeforeMerge)pg.contentBeforeMerge={text:pg.text,dialogue:pg.direction.dialogue};pg.text=text;pg.direction.dialogue='';pg.edited=true;return true;}
const clone=x=>JSON.parse(JSON.stringify(x)),uid=()=> 'ca-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
function chapter(q,id){const e=q.storyPlan.episodes.find(x=>x.id===id);if(!e)throw Error('This chapter could not be found.');q.bodyPagination??={episodes:{}};return q.bodyPagination.episodes[id]??={text:q.source.scripts[id]?.fullText||e.text||'',origin:'故事章节正文',sourceId:id,pages:[],archives:[],selected:'',bodyHistory:[]};}
function archive(d){if(d.pages.length)d.archives.push({at:new Date().toISOString(),pages:clone(d.pages),body:d.text});}
function page(q,id,text,start=0){const names=q.assets.filter(a=>a.name&&text.includes(a.name));const summary=text.trim().split(/[。！？\n]/)[0].slice(0,70)||'待填写本页情节';return {id:uid(),text,mapping:{sourceEpisodeId:id,start,end:start+text.length,sourceText:text},refs:names.map(a=>({assetId:a.id,versionId:a.adoptedVisualId||'',via:'name-rule'})),direction:{title:summary,visual:text.trim()?'围绕本页情节安排画面，先交代人物与环境，再表现主要行动；关键对白处突出人物反应。':'',dialogue:'',ending:'',characterNames:names.map(a=>a.name)}};}
function generate(q,ids){if(!ids.length)throw Error('Select chapters to plan.');const drafts=ids.map(id=>({id,d:chapter(q,id)}));if(drafts.some(x=>!x.d.text.trim()))throw Error('Write the selected chapters before planning pages.');for(const {id,d} of drafts){archive(d);const paragraphs=d.text.match(/[^\n]+(?:\n+|$)|\n+/g)||[d.text];const group=Math.max(2,Math.ceil(paragraphs.length/30));let start=0;d.pages=[];for(let i=0;i<paragraphs.length;i+=group){const text=paragraphs.slice(i,i+group).join('');const pg=page(q,id,text,start);S.adopt(pg,q.assets);start+=text.length;d.pages.push(pg);}d.selected='';d.paginatedBody=d.text;d.plannedBy='agent-demo';d.plannedAt=new Date().toISOString();}q.activeEpisodeId=ids[0];return q;}
function restore(q,id,index){const d=chapter(q,id),old=d.archives[index];if(!old)throw Error('This saved layout could not be found.');const pages=clone(old.pages);archive(d);d.pages=pages;d.selected='';}
const api={chapter,archive,page,generate,restore,pageContent,setPageContent};if(typeof module!=='undefined')module.exports=api;else root.ComicArrangement=api;
})(globalThis);
