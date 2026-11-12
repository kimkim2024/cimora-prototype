'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const create=require('../cimora-project-library-model.js');
const iso=day=>`2026-05-${String(day).padStart(2,'0')}T12:00:00.000Z`;
const ids=items=>items.map(p=>p.id);
function fixture(projects){
  let now=Date.parse(iso(20)),stored,failed=false,sequence=0;
  const S={state:{projects:structuredClone(projects),assets:[],cimora:{projects:{}}},id(prefix){return prefix+'-test-'+(++sequence);},save(){if(failed)return false;model.sync();stored=JSON.stringify(this.state);return true;}};
  let model=create(S,()=>now);
  return {S,get model(){return model;},advance(){now+=60000;},fail(){failed=true;},reload(){S.state=JSON.parse(stored);model=create(S,()=>now);},stored(){return stored;}};
}
test('search is name-only, trimmed and case insensitive; archives are excluded',()=>{
  const f=fixture([{id:'a',name:'Alpha',desc:'ocean'},{id:'b',name:'Ocean 2'},{id:'c',name:'Ocean 3',archived:true}]);
  assert.deepEqual(ids(f.model.list({query:' OCEAN '})),['b']);
  assert.deepEqual(ids(f.model.list()),['a','b']);
  assert.equal(f.model.list()[0],f.S.state.projects[0]);
});
test('sorts edited and created descending, name naturally; leaves original order untouched',()=>{
  const f=fixture([{id:'a',name:'Project 10',createdAt:iso(2),updatedAt:iso(9)},{id:'b',name:'Project 2',createdAt:iso(6),updatedAt:iso(4)},{id:'c',name:'Project 1'}]);
  assert.deepEqual(ids(f.model.list()),['a','b','c']);
  assert.deepEqual(ids(f.model.list({sort:'created'})),['b','a','c']);
  assert.deepEqual(ids(f.model.list({sort:'name'})),['c','b','a']);
  assert.deepEqual(ids(f.S.state.projects),['a','b','c']);
});
test('favorites persist through serialization/reload and share the original project',()=>{
  const f=fixture([{id:'a',name:'A',updatedAt:iso(4)},{id:'b',name:'B'}]);
  assert.equal(f.model.toggleStar('a'),true);
  assert.equal(f.S.state.projects[0].updatedAt,iso(4));
  assert.equal(f.model.list({filter:'starred'})[0],f.S.state.projects[0]);
  f.reload();assert.deepEqual(ids(f.model.list({filter:'starred'})),['a']);
  f.model.toggleStar('a');f.reload();assert.deepEqual(f.model.list({filter:'starred'}),[]);
});
test('recent uses last-opened, not last-edited; limits to four and excludes archives',()=>{
  const projects=Array.from({length:6},(_,i)=>({id:String(i),name:'P'+i,lastOpenedAt:iso(i+1),updatedAt:iso(10-i)}));
  projects.push({id:'archived',archived:true,lastOpenedAt:iso(19)});
  const f=fixture(projects);assert.deepEqual(ids(f.model.recent()),['5','4','3','2']);
});
test('small collections avoid a duplicate full row; no history stays empty',()=>{
  const f=fixture([{id:'a',name:'A'},{id:'b',name:'B'}]);
  assert.deepEqual(f.model.recent(),[]);f.model.visit('a');f.model.visit('b');
  assert.equal(f.model.recent().length,1);
  f.S.state.projects.pop();assert.deepEqual(f.model.recent(),[]);
});
test('opening records only entry into a project, persists, and never updates edited time',()=>{
  const f=fixture([{id:'a',name:'A',updatedAt:iso(3)},{id:'b',name:'B'}]);
  f.model.visit('a');const first=f.S.state.projects[0].lastOpenedAt;
  f.advance();assert.equal(f.model.visit('a'),false);assert.equal(f.S.state.projects[0].lastOpenedAt,first);
  f.model.visit(null);f.model.visit('a');assert.notEqual(f.S.state.projects[0].lastOpenedAt,first);
  assert.equal(f.S.state.projects[0].updatedAt,iso(3));f.reload();assert.ok(f.S.state.projects[0].lastOpenedAt);
});
test('timestamps new projects and content edits without inventing legacy creation dates',()=>{
  const f=fixture([{id:'legacy',name:'Old',updated:'刚刚'}]);
  f.S.save();assert.equal(f.S.state.projects[0].createdAt,undefined);assert.equal(f.S.state.projects[0].updatedAt,undefined);
  f.S.state.projects.push({id:'new',name:'New'});f.S.save();
  const p=f.S.state.projects[1],created=p.createdAt;assert.equal(p.updatedAt,created);
  f.advance();p.name='Renamed';f.S.save();assert.equal(p.createdAt,created);assert.notEqual(p.updatedAt,created);
});
test('render initialization and navigation do not count as edits; saved canvas changes do',()=>{
  const f=fixture([{id:'a',name:'A',updatedAt:iso(3)}]);
  const p=f.S.state.projects[0];
  f.S.state.cimora.projects.a={ch1:{script:'story',view:'flow',stage:'story',graph:{viewport:{zoom:1}}}};
  f.model.sync(true);f.S.save();assert.equal(p.updatedAt,iso(3));
  const e=f.S.state.cimora.projects.a.ch1;e.view='canvas';e.stage='boards';e.graph.viewport.zoom=2;e.navigation={stage:'boards'};
  f.S.save();assert.equal(p.updatedAt,iso(3));
  f.advance();e.script='Changed story';f.S.save();assert.notEqual(p.updatedAt,iso(3));
  const edited=p.updatedAt;f.advance();e.creationCanvas={positions:{'panel:1':{x:30,y:60}}};f.S.save();assert.notEqual(p.updatedAt,edited);
});
test('failed persistence rolls back favorites and opened metadata',()=>{
  const f=fixture([{id:'a',name:'A',starred:false}]);f.fail();
  assert.equal(f.model.toggleStar('a'),false);assert.equal(f.S.state.projects[0].starred,false);
  assert.equal(f.model.visit('a'),false);assert.equal(f.S.state.projects[0].lastOpenedAt,undefined);
});
test('invalid or relative dates remain unknown, empty collections are safe',()=>{
  const f=fixture([]);for(const value of ['刚刚','yesterday','bad',null,undefined,-1,NaN])assert.equal(f.model.time(value),0);
  assert.deepEqual(f.model.list(),[]);assert.deepEqual(f.model.recent(),[]);assert.equal(f.model.toggleStar('missing'),false);assert.equal(f.model.visit('missing'),false);
});
test('rename validates, persists, and preserves project content',()=>{
  const f=fixture([{id:'a',name:'A',text:'Keep story',updatedAt:iso(3)}]);
  assert.equal(f.model.rename('a','   '),false);assert.equal(f.model.rename('a','x'.repeat(81)),false);
  assert.equal(f.model.rename('a','  New title  '),true);f.reload();
  assert.equal(f.S.state.projects[0].name,'New title');assert.equal(f.S.state.projects[0].text,'Keep story');
});
test('delete uses existing archive flag; restore preserves all editor data and favorites',()=>{
  const f=fixture([{id:'a',name:'A',starred:true},{id:'b',name:'B'}]);
  f.S.state.cimora.projects.a={ch1:{script:'Keep me'}};f.model.sync(true);
  assert.equal(f.model.archive('a'),true);f.reload();assert.deepEqual(ids(f.model.available()),['b']);
  assert.equal(f.model.archive('a',false),true);f.reload();assert.equal(f.model.byId('a').starred,true);
  assert.equal(f.S.state.cimora.projects.a.ch1.script,'Keep me');
});
test('duplicate makes independent editor and owned assets while keeping studio references',()=>{
  const f=fixture([{id:'a',name:'A',assetIds:['owned','shared'],chapters:[{id:'ch1',title:'Chapter'}],starred:true,lastOpenedAt:iso(4)}]);
  f.S.state.assets=[{id:'owned',projectId:'a',name:'Character'},{id:'shared',projectId:null,name:'Shared style'}];
  f.S.state.cimora.projects.a={ch1:{projectId:'a',script:'Original',bindings:{owned:2,shared:1},run:{status:'running'},graph:{nodes:[{status:'running'}]}}};
  f.model.sync(true);const copy=f.model.duplicate('a');assert.ok(copy);assert.notEqual(copy.id,'a');
  assert.equal(copy.starred,false);assert.equal(copy.lastOpenedAt,undefined);assert.ok(copy.createdAt);
  const owned=f.S.state.assets.find(a=>a.projectId===copy.id),editor=f.S.state.cimora.projects[copy.id].ch1;
  assert.ok(owned);assert.ok(copy.assetIds.includes(owned.id));assert.ok(copy.assetIds.includes('shared'));
  assert.equal(editor.projectId,copy.id);assert.equal(editor.bindings[owned.id],2);assert.equal(editor.bindings.shared,1);
  assert.equal(editor.run,null);assert.equal(editor.graph.nodes[0].status,'idle');
  editor.script='Changed copy';owned.name='Changed character';copy.chapters[0].title='New chapter';
  assert.equal(f.S.state.cimora.projects.a.ch1.script,'Original');assert.equal(f.S.state.assets[0].name,'Character');assert.equal(f.model.byId('a').chapters[0].title,'Chapter');
  const second=f.model.duplicate('a');assert.notEqual(second.name,copy.name);
});
test('rename, duplicate and archive roll back failed writes including editor/assets',()=>{
  const f=fixture([{id:'a',name:'A',assetIds:['owned'],updatedAt:iso(3)}]);
  f.S.state.assets=[{id:'owned',projectId:'a'}];f.S.state.cimora.projects.a={ch1:{script:'Original'}};f.model.sync(true);
  const before=JSON.stringify(f.S.state);
  f.S.save=()=>{f.model.sync();return false;};
  assert.equal(f.model.rename('a','Renamed'),false);assert.equal(JSON.stringify(f.S.state),before);
  assert.equal(f.model.archive('a'),false);assert.equal(JSON.stringify(f.S.state),before);
  assert.equal(f.model.duplicate('a'),null);assert.equal(JSON.stringify(f.S.state),before);
});
test('archived and missing projects cannot be renamed or copied',()=>{
  const f=fixture([{id:'a',name:'A',archived:true}]);
  assert.equal(f.model.rename('a','New'),false);assert.equal(f.model.duplicate('a'),null);
  assert.equal(f.model.rename('missing','New'),false);assert.equal(f.model.duplicate('missing'),null);assert.equal(f.model.archive('missing'),false);
});
