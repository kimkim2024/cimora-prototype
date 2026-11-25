/* Local preview workflow. No semantic model is connected. */
(function(root){
'use strict';
function create(p,scope,request){const chapters=scope==='chapters'?p.storyChapters:p.storyChapters.filter(c=>'chapter:'+c.id===scope);if(!chapters.length||!chapters.some(c=>c.body.trim()))throw Error('Add chapter text before requesting a revision.');return {request,scope,status:'impact',items:chapters.map(c=>({id:c.id,title:c.title,before:c.body,after:c.body})),demo:true};}
function preview(draft){for(const item of draft.items){item.after=item.before.split(/\n\s*\n/).map(paragraph=>{const sentences=paragraph.match(/[^。！？]+[。！？]?[”」]?/g)||[paragraph];return sentences.length>2?sentences[0]+sentences.at(-1):paragraph;}).join('\n\n');}draft.status='preview';return draft;}
function apply(p,draft,content){if(!draft||draft.status!=='preview')throw Error('Preview the revision before applying it.');for(const item of draft.items){const c=p.storyChapters.find(c=>c.id===item.id);if(!c||c.body!==item.before)throw Error('The chapter changed. Keep the current text and request a new revision.');}if(draft.items.some(x=>!x.after.trim()))throw Error('Suggested text is empty. Add text before applying it.');content.checkpoint(p,'chapters',true);for(const item of draft.items)content.set(p,'chapters',item.id,'body',item.after,false);draft.status='applied';}
const api={create,preview,apply};if(typeof module!=='undefined')module.exports=api;else root.ChapterRevision=api;
})(globalThis);
