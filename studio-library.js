/* Asset-library view for the original prototype. Sources remain in their own workbenches. */
(()=>{
  'use strict';
  const C=Cimora,S=Site,L=StudioLibraryModel,E=S.esc;
  const KEY='cimora-studio-library-v1',STORY='cimora-script-studio-v1',COMIC='cimora-comic-studio-v1';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const defaults={assetType:'全部',assetSource:'all',assetProject:'all',assetTags:'',assetSearch:'',assetState:'active'};
  let view={...defaults},warnings=[],selectingAssets=false,selectedAssets=new Set(),searchTimer;
  const types=L.categories,q=encodeURIComponent;
  const categoryArt={
    故事文本:['#417ab0','M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4zM12 6v15'],
    角色:['#a467a8','M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-3a7 7 0 0 1 14 0v3'],
    场景:['#329992','M4 5h16v14H4zM8 9h8m-8 4h5'],
    道具:['#ac7939','m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9'],
    图片与漫画:['#8662bb','M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M16 9h.01'],
    视频与动态:['#c65c82','M3 5h18v14H3zM10 9l5 3-5 3z'],
    声音:['#527ec3','M9 18V6l11-2v12M9 10l11-2M9 18a3 2 0 1 1-6 0 3 2 0 1 1 6 0Zm11-2a3 2 0 1 1-6 0 3 2 0 1 1 6 0Z'],
    角色模型:['#588f53','M8 4h8l4 4v8l-4 4H8l-4-4V8zM12 8v8M8 12h8'],
  };
  const a=(text,url,cls='ghost')=>C.link(text,url,'cm-button '+cls);
  const b=(text,act,key='',cls='ghost')=>`<button type="button" class="cm-button ${cls}" data-lib="${act}" data-key="${E(key)}">${text}</button>`;
  const tags=value=>`<span class="sl-tag">${E(value)}</span>`;
  const heading=(title,desc,actions='')=>`<header class="sl-heading"><div><h1${title==='Asset Library'?' class="cm-workspace-title"':''}>${title}</h1>${desc?`<p>${desc}</p>`:""}</div><div class="sl-actions">${actions}</div></header>`;
  const empty=(title,desc)=>`<div class="sl-empty"><span aria-hidden="true">◈</span><h2>${title}</h2><p>${desc}</p>${b('Clear filters','reset-filters')}</div>`;
  function read(key,fallback){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):copy(fallback);}
  function meta(){
    const value=read(KEY,{version:1,projects:{},assets:{},personal:[],tags:[]});
    if(value?.version!==1||!value.projects||typeof value.projects!=='object'||!value.assets||typeof value.assets!=='object'||!Array.isArray(value.personal)||value.tags&&!Array.isArray(value.tags))throw Error('Asset management records could not be read.');
    return value;
  }
  function sourceDB(key){
    const value=read(key,{version:1,projects:[],assets:[]});
    if(value?.version!==1||!Array.isArray(value.projects)||key===STORY&&!Array.isArray(value.assets))throw Error('Saved records could not be read.');
    return value;
  }
  function load(){
    warnings=[];
    const safely=(name,fn,fallback)=>{try{return fn();}catch(error){warnings.push(name+': '+libraryLabel(error.message));return fallback;}};
    const management=safely('Asset management',meta,{version:1,projects:{},assets:{},personal:[],tags:[]});
    const stories=safely('Story library',()=>sourceDB(STORY),{projects:[],assets:[]});
    const comics=safely('Comic library',()=>sourceDB(COMIC),{projects:[]});
    const comicDrafts=safely('Comic drafts',()=>sourceDB('cimora-comic-story-v1'),{projects:[]});
    const videoDrafts=safely('Video drafts',()=>sourceDB('cimora-video-story-v1'),{projects:[]});
    const videoEntries=[];
    for(const project of S.state.projects){
      for(const [hostId,engine] of Object.entries(C.M.db.projects[project.id]||{})){
        if(engine.videoFlow?.workspace)videoEntries.push({projectId:project.id,hostId,workspace:engine.videoFlow.workspace,source:engine.videoFlow.source,shots:engine.productionShots||[],bindings:engine.bindings,createdAt:engine.videoFlow.createdAt,engine});
      }
    }
    const index=L.build({stories,comics,comicDrafts,videoDrafts,videos:S.state.projects,engines:C.M.db.projects,videoEntries,legacyAssets:S.state.assets,tools:safely('Tool outputs',()=>window.ToolStudio?.store?.list()||[],[]),meta:management});
    for(const project of index.projects)if(project.store==='videoDraft'&&project.raw.workspaceNativeId)project.entries=videoEntries.filter(entry=>entry.projectId===project.raw.workspaceNativeId);
    for(const saved of management.personal){if(!index.assets.some(asset=>asset.key===saved.key))index.assets.push({...saved,state:management.assets[saved.key]?.state||'active',usages:saved.usages||[]});}
    index.projects=index.projects.filter(project=>project.state!=='purged');
    if(window.StudioWorkspaceModel){for(const project of index.projects)project.url=StudioWorkspaceModel.url(project);for(const asset of index.assets){const owner=index.projects.find(p=>p.key===asset.owner);if(owner&&!asset.url?.startsWith('/app/tools'))asset.url=owner.url;}}
    index.assets=index.assets.filter(asset=>asset.state!=='purged');
    for(const asset of index.assets){
      if(asset.key.startsWith('legacy:')){
        if(!['声音','角色模型'].includes(asset.type)&&asset.raw.art!==undefined)asset.image=asset.raw.image||Art.url(asset.raw.art);
        const current=asset.version;
        asset.versions=[...(asset.raw.history||[]).map(version=>({id:String(version.version),label:'v'+version.version,description:version.desc})),{...current,description:asset.description,image:asset.image}];
        asset.version=asset.versions.at(-1);
        if(asset.raw.type==='人物音色'||asset.raw.type==='角色音色')asset.subtype='角色音色';
        if(asset.raw.resultId){
          const tool=FrameData.tools.find(tool=>tool.id===asset.raw.resultId);
          if(tool){asset.url='/app/tools/'+tool.id;asset.origin='创作工具 · '+tool.title;
            if(tool.kind==='motion'){asset.type='视频';asset.subtype='动态方案';}
            if(['puppet','rig'].includes(tool.kind)){asset.type='角色模型';asset.subtype=tool.kind==='puppet'?'PNGTuber':'Live2D';}
          }
        }
      }
      asset.tags=(management.assets[asset.key]?.tags||[]).filter(id=>(management.tags||[]).some(tag=>tag.id===id));
    }
    index.meta=management;
    return index;
  }
  function guard(){load();if(warnings.length)throw Error('Some records could not be read. Saving is paused to protect your data.');}
  function changeMeta(fn){guard();const value=meta();fn(value);try{localStorage.setItem(KEY,JSON.stringify(value));}catch{throw Error('Local storage is full. Your changes were not saved.');}return value;}
  const warning=()=>warnings.length?`<p class="sl-warning" role="alert">${warnings.map(E).join('<br>')} Your original records are intact.</p>`:'';
  const findAsset=key=>load().assets.find(asset=>asset.key===key);
  const currentList=()=>{const params=new URLSearchParams(location.hash.split('?')[1]||'');return params.has('item')?safeBack(params.get('back')):location.hash.slice(1);};
  const safeBack=path=>typeof path==='string'&&/^\/app\/assets(?:\?|$)/.test(path)&&!new URLSearchParams(path.split('?')[1]||'').has('item')?path:'/app/assets';
  const assetURL=asset=>'/app/assets?item='+q(asset.key)+'&back='+q(currentList());
  const backLink=()=>a(icon('back'),safeBack(S.context.params.get('back')),'ghost sl-back')
    .replace('<a ','<a aria-label="Back to Asset Library" title="Back to Asset Library" ');
  function filterURL(){const params=new URLSearchParams();for(const [field,value] of Object.entries(view))if(value!==defaults[field])params.set(field,value);return '/app/assets'+(params.size?'?'+params:'');}
  function hydrateView(ctx){view={...defaults};for(const field of Object.keys(defaults))if(ctx.params.has(field))view[field]=ctx.params.get(field);}
  const imageLabel=slot=>({main:'Main reference',sheet:'Character sheet',portrait:'Portrait',front:'Front',side:'Side',back:'Back',clothing:'Outfit reference',accessories:'Accessories',first:'First frame',last:'Last frame'})[slot]||'Reference images';
  const libraryLabels={
    故事文本:'Story text',角色:'Character',场景:'Scene',道具:'Prop',图片与漫画:'Images and comics',
    视频与动态:'Video and motion',声音:'Audio',角色模型:'Character model',
    故事设定:'Story outline',剧本:'Script',角色设定:'Character profile',表情与姿势:'Expressions and poses',
    场景设定:'Scene design',道具设定:'Prop design',插画与图片:'Illustration',漫画成稿:'Finished comic',表情包:'Stickers',
    视频片段:'Video clip',GIF动图:'Animated GIF','GIF 动图':'Animated GIF',动态方案:'Motion plan',
    角色音色:'Character voice',配音片段:'Voiceover clip',背景音乐:'Background music',环境音效:'Sound effects',声音片段:'Audio clip',
    创作市场:'Market',创作工具:'Creative Tools',故事创作:'Story creation',漫画创作:'Comic creation',视频创作:'Video creation',
    '个人保存 / 其他':'Personal collection',音色设定:'Voice profile',声音方案:'Audio plan',
    '同名标签已存在':'A tag with that name already exists.',
    '标签标识已存在':'This tag already exists.',
    '标签不存在，请重新选择':'Tag not found. Select a tag again.',
    '标签操作无效':'Invalid tag action.',
    '请选择另一个已有标签':'Select a different existing tag.',
    '标签名称需要 1–30 个字符':'Tag names must be 1–30 characters long.',
  };
  const libraryLabel=value=>Object.hasOwn(libraryLabels,value)?libraryLabels[value]:value;
  const sourceLabel=asset=>libraryLabel(L.sourceLabels[L.creationSource(asset)]);
  const icon=name=>`<svg class="sl-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({back:'<path d="M19 12H5m7-7-7 7 7 7"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',down:'<path d="m7 10 5 5 5-5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',filter:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--ap-surface,#fff)"/><circle cx="16" cy="17" r="2" fill="var(--ap-surface,#fff)"/>',audio:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',play:'<path d="m9 5 11 7-11 7z"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5"/>',external:'<path d="M13 5h6v6m0-6-8 8m-2-8H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>'})[name]||''}</svg>`;
  const options=(items,selected)=>items.map(([key,label])=>`<option value="${E(key)}" ${selected===key?'selected':''}>${E(label)}</option>`).join('');
  let floating=null,tagEdit=null;
  function rememberScroll(){scrollPositions.set(location.hash,window.scrollY||0);}
  function closePopover(restore=true){
    if(!floating)return;
    const previous=floating;floating=null;tagEdit=null;
    previous.trigger?.setAttribute?.('aria-expanded','false');
    previous.element.remove();
    if(restore&&previous.trigger?.isConnected)previous.trigger.focus();
  }
  function positionPopover(){
    if(!floating||floating.element.classList.contains('sl-tag-editor'))return;
    const {element,trigger}=floating,rect=trigger?.getBoundingClientRect?.();if(!rect)return;
    const w=element.offsetWidth,h=element.offsetHeight,vw=window.innerWidth,vh=window.innerHeight;
    element.style.left=Math.max(12,Math.min(rect.left,vw-w-12))+'px';
    element.style.top=Math.max(12,Math.min(rect.bottom+8,vh-h-12))+'px';
  }
  function openPopover(trigger,title,body,footer='',className=''){
    if(floating?.element.contains?.(trigger))trigger=floating.trigger;
    closePopover(false);
    const element=document.createElement('div');element.id='sl-popover';element.className='sl-popover'+(title==='Filter by type'||title==='Filter by tag'?' sl-filter-popover':'');
    if(className)element.classList.add(className);
    element.setAttribute('popover','auto');element.setAttribute('role','dialog');element.setAttribute('aria-label',title);
    element.innerHTML=`<header><strong>${E(title)}</strong>${b(icon('close'),'close-popover','','sl-icon-button').replace('<button ','<button aria-label="Close panel" ')}</header>${body}${footer?`<footer>${footer}</footer>`:''}`;
    document.body.append(element);floating={element,trigger};
    trigger?.setAttribute?.('aria-expanded','true');
    element.addEventListener('toggle',event=>{if(event.newState==='closed'&&floating?.element===element)closePopover();});
    if(element.showPopover)element.showPopover();else element.classList.add('sl-popover-fallback');
    positionPopover();(element.querySelector('input,select')||element.querySelector('button[data-lib]'))?.focus();
  }
  function togglePanel(trigger,title,body,footer){
    if(floating?.trigger===trigger){closePopover();return;}
    openPopover(trigger,title,body,footer);
  }
  function assetTagChips(asset,allTags=meta().tags||[],compact=false){
    const values=(asset.tags||[]).map(id=>allTags.find(tag=>tag.id===id)).filter(Boolean);
    const visible=compact?values.slice(0,2):values;
    return values.length?`<div class="sl-tag-chips">${visible.map(tag=>`<span class="sl-user-tag" title="${E(tag.name)}">${E(tag.name)}</span>`).join('')}${compact&&values.length>2?b('+'+(values.length-2),'edit-tags',asset.key,'sl-tag-overflow').replace('<button ','<button aria-label="View all '+values.length+' tags" '):''}</div>`:'';
  }
  function typeFilterPanel(trigger){
    const selected=view.assetType.split(',').filter(value=>value&&value!=='全部');
    const rows=types.filter(type=>type!=='全部').map(type=>{
      const [color,path]=categoryArt[type];
      return `<label class="plan-chip"><input type="checkbox" data-lib-type-filter="${E(type)}" ${selected.includes(type)?'checked':''}><span class="plan-chip-icon" aria-hidden="true" style="--chip-ink:${color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></span><span>${E(libraryLabel(type))}</span></label>`;
    }).join('');
    togglePanel(trigger,'Filter by type',`<p class="sl-pop-hint">Select any types to show assets that match at least one.</p><div class="sl-filter-section"><span>Select types</span><span data-filter-count>${selected.length} selected</span></div><div class="sl-option-list sl-filter-options">${rows}</div>`,`${b('Clear selection','clear-type-draft')}${b('Apply','apply-type-filter','','primary')}`);
  }
  function tagFilterPanel(trigger){
    const selected=view.assetTags.split(',').filter(Boolean),available=load().meta.tags||[];
    const row=(id,name)=>`<label class="sl-option" data-lib-option-name="${E(name.toLowerCase())}"><input type="checkbox" data-lib-tag-filter="${E(id)}" ${selected.includes(id)?'checked':''}><span>${E(name)}</span><span class="sl-filter-remove" aria-hidden="true">×</span></label>`;
    togglePanel(trigger,'Filter by tag',`${CimoraSearchField.render(`<input class="sl-pop-search" data-lib-option-search placeholder="Search tags" aria-label="Search tag filters">`, "sl-pop-search")}<p class="sl-pop-hint">Show assets that have every selected tag.</p><div class="sl-filter-section"><span>Select tags</span><span data-filter-count>${selected.length} selected</span></div><div class="sl-option-list sl-filter-options">${row('untagged','Untagged')}${available.map(tag=>row(tag.id,tag.name)).join('')}</div><p class="sl-option-empty" hidden>No matching tags</p>`,`${b('Manage tags','manage-tags')}${b('Apply','apply-tag-filter','','primary')}`);
  }
  function activeFilters(index){
    const chips=[];
    const chip=(label,key)=>b(E(label)+icon('close'),'remove-filter',key,'sl-filter-chip').replace('<button ','<button aria-label="Remove filter: '+E(label)+'" ');
    for(const type of view.assetType.split(',').filter(value=>value&&value!=='全部'))chips.push(chip(libraryLabel(type),'type:'+type));
    if(view.assetSearch)chips.push(chip('Search: '+view.assetSearch,'assetSearch'));
    if(view.assetSource!=='all')chips.push(chip('Source: '+(libraryLabel(L.sourceLabels[view.assetSource])||'Personal assets'),'assetSource'));
    if(view.assetProject!=='all')chips.push(chip('Project: '+(view.assetProject==='unlinked'?'No linked projects':index.projects.find(p=>p.key===view.assetProject)?.title||'Original project'),'assetProject'));
    for(const id of view.assetTags.split(',').filter(Boolean))chips.push(chip(id==='untagged'?'Untagged':index.meta.tags.find(tag=>tag.id===id)?.name||id,'tag:'+id));
    return chips.length?`<div class="sl-active-filters" aria-label="Active filters"><span>Selected</span>${chips.join('')}${b('Clear filters','reset-filters','','sl-text-button')}</div>`:'';
  }
  function bulkTagBar(){
    if(!selectingAssets)return '';
    const disabled=selectedAssets.size?'':'disabled ';
    return `<div class="sl-bulk-bar"><span id="sl-selected-count">${selectedAssets.size} selected</span>${b('Select all results','select-visible')}${b('Clear selection','clear-selection')}${b('Add tags','bulk-add-tags').replace('<button ','<button '+disabled)}${b('Remove tags','bulk-remove-tags').replace('<button ','<button '+disabled)}</div>`;
  }
  function mutateTags(transform){guard();return changeMeta(value=>{const next=transform(value);Object.assign(value,next);});}
  function tagOptionList(){
    return tagEdit.options.map(tag=>`<label class="sl-option" data-lib-option-name="${E(tag.name.toLowerCase())}"><input type="checkbox" data-lib-tag-option="${E(tag.id)}" ${tagEdit.selected.has(tag.id)?'checked':''}><span>${E(tag.name)}</span>${tag.pending?'<small>New tag</small>':''}</label>`).join('');
  }
  function tagEditor(keys,mode,trigger){
    const index=load(),assets=keys.map(key=>index.assets.find(asset=>asset.key===key)).filter(Boolean);
    if(assets.length!==keys.length)throw Error('Some assets are missing. Refresh and try again.');
    const session={keys,mode,options:(index.meta.tags||[]).map(tag=>({...tag})),selected:new Set(mode==='replace'?assets[0].tags:[])};
    openPopover(trigger,mode==='replace'?'Edit asset tags':mode==='add'?'Add tags in bulk':'Remove tags in bulk',`<p class="sl-pop-hint">${mode==='replace'?E(assets[0].name):`${keys.length} assets selected. ${mode==='add'?'Add the selected tags':'Remove only the selected tags'}.`}</p>${CimoraSearchField.render(`<input class="sl-pop-search" data-lib-tag-search maxlength="30" placeholder="${mode==='remove'?'Search tags':'Search or create tags'}" aria-label="${mode==='remove'?'Search tags':'Search or create tags'}">`, "sl-pop-search")}<div class="sl-option-list" id="sl-edit-options"></div><p class="sl-option-empty" hidden>No matching tags</p>${mode!=='remove'?'<button type="button" class="sl-create-tag" data-lib="stage-tag" hidden></button>':''}`,b('Cancel','close-popover')+b('Done','save-tags','','primary'),mode==='replace'?'sl-tag-editor':'');
    tagEdit=session;document.getElementById('sl-edit-options').innerHTML=tagOptionList();filterTagOptions('');positionPopover();
  }
  function filterTagOptions(query){
    if(!floating)return;const text=query.trim().toLowerCase();let matches=0;
    for(const row of floating.element.querySelectorAll('[data-lib-option-name]')){row.hidden=!row.dataset.libOptionName.includes(text);if(!row.hidden)matches++;}
    const empty=floating.element.querySelector('.sl-option-empty');if(empty){empty.hidden=!!matches;empty.textContent=tagEdit&&!tagEdit.options.length?'No tags yet. Enter a name to create one.':'No matching tags';}
    const create=floating.element.querySelector('[data-lib="stage-tag"]');
    if(create){const name=query.normalize('NFC').trim().replace(/\s+/g,' ');create.hidden=!name||tagEdit.options.some(tag=>tag.name.toLowerCase()===name.toLowerCase());create.dataset.key=name;create.textContent='Create and add “'+name+'”';}
    const save=floating.element.querySelector('[data-lib="save-tags"]');
    if(save&&tagEdit)save.textContent=create&&!create.hidden?'Create and save':'Done';
  }
  function stageTag(name){
    if(!tagEdit||tagEdit.mode==='remove'||!name||name.length>30)return;
    const existing=tagEdit.options.find(tag=>tag.name.toLowerCase()===name.toLowerCase());
    const id=existing?.id||'pending:'+S.id('tag');
    if(!existing)tagEdit.options.push({id,name,pending:true});tagEdit.selected.add(id);
    document.getElementById('sl-edit-options').innerHTML=tagOptionList();
    const input=floating.element.querySelector('[data-lib-tag-search]');input.value='';filterTagOptions('');positionPopover();input.focus();
  }
  async function saveTagEditor(){
    if(!tagEdit)throw Error('Reopen the tag editor and try again.');
    // The save button must not silently discard an uncommitted new tag name.
    const typed=(floating?.element.querySelector('[data-lib-tag-search]')?.value||'').normalize('NFC').trim().replace(/\s+/g,' ');
    if(tagEdit.mode!=='remove'&&typed&&!tagEdit.options.some(tag=>tag.name.toLowerCase()===typed.toLowerCase())){
      if(typed.length>30)throw Error('Tag names must be 1–30 characters long');
      const id='pending:'+S.id('tag');tagEdit.options.push({id,name:typed,pending:true});tagEdit.selected.add(id);
    }
    const {keys,mode,selected,options:choices}=tagEdit;
    if(mode!=='replace'&&!selected.size)throw Error('Select a tag first.');
    mutateTags(value=>{
      let next=value;const ids=[];
      for(const id of selected){const item=choices.find(tag=>tag.id===id);if(!item)continue;
        if(item.pending){const existing=(next.tags||[]).find(tag=>tag.name.toLowerCase()===item.name.toLowerCase());const actual=existing?.id||S.id('tag');if(!existing)next=L.createTag(next,actual,item.name);ids.push(actual);}else ids.push(id);}
      return L.assignTags(next,keys,ids,mode);
    });
    const inList=!S.context.params.has('item'),hidden=inList?keys.filter(key=>!L.matchesAsset(findAsset(key),view)).length:0;
    rememberScroll();closePopover();S.render();
    const anchor=[...document.querySelectorAll('[data-lib="edit-tags"]')].find(button=>button.dataset.key===keys[0]);anchor?.focus({preventScroll:true});
    S.toast(hidden?`Tags updated. ${hidden} assets no longer match the current filters.`:'Tags saved');
  }
  function tagManager(){
    const index=load(),tags=index.meta.tags||[];
    S.modal('Manage tags',`<p>Tags are shared across the asset library. Renaming, merging, or deleting tags keeps your assets intact.</p><div class="sl-tag-management">${tags.map(tag=>`<div><strong>${E(tag.name)}</strong><small>${index.assets.filter(asset=>asset.tags.includes(tag.id)).length} assets</small><div>${b('Rename','rename-tag',tag.id)}${tags.length>1?b('Merge','merge-tag',tag.id):''}${b('Delete','delete-tag',tag.id)}</div></div>`).join('')||'<p>No custom tags yet.</p>'}</div><label>New tag<input id="sl-new-tag" maxlength="30" placeholder="Enter a tag name"></label>`,b('Create tag','create-tag','','primary'));
  }
  function tagRename(id){const tag=(meta().tags||[]).find(tag=>tag.id===id);if(!tag)throw Error('Tag not found');S.modal('Rename tag',`<label>Tag name<input id="sl-tag-name" maxlength="30" value="${E(tag.name)}"></label>`,b('Save name','confirm-rename-tag',id,'primary'));}
  function tagMerge(id){const tags=meta().tags||[],tag=tags.find(tag=>tag.id===id);if(!tag)throw Error('Tag not found');S.modal('Merge tags',`<p>Merge “${E(tag.name)}” into another tag. Tagged assets will be updated automatically.</p><label>Merge into<select id="sl-merge-target">${tags.filter(tag=>tag.id!==id).map(tag=>`<option value="${E(tag.id)}">${E(tag.name)}</option>`).join('')}</select></label>`,b('Confirm merge','confirm-merge-tag',id,'primary'));}
  function assetActionMenu(asset){
    return CimoraItemActionMenu.render({id:asset.key,name:asset.name,actions:[
      {id:'tags',label:'Edit tags',showLabel:true},
      {id:'details',label:'View details'},
      asset.state==='trash'?{id:'restore',label:'Restore asset'}:{id:'archive',label:'Move to Trash'},
    ]});
  }
  function cardPreview(asset){
    const preview=L.previewOf(asset),comic=asset.owner?.startsWith('comic:'),images=asset.version?.images||{};
    const main=L.imageOf(asset.image,comic),front=L.imageOf(images.front,comic),portrait=L.imageOf(images.portrait,comic);
    const cover=L.categoryOf(asset)==='角色'?(front||((portrait&&portrait!==main)?portrait:'')||main):main;
    const image=cover?`<img src="${E(cover)}" alt="${E(asset.name)}" loading="lazy" ${L.categoryOf(asset)==='角色'?'data-lib-character-cover':''}>`:'';
    const info=preview.meta?`<span class="sl-preview-meta">${E(preview.meta)}</span>`:'';
    let content;
    if(preview.kind==='text'||preview.kind==='setting')content=`<div class="sl-excerpt"><small>${E(libraryLabel(preview.label))}</small><p>${E(preview.excerpt.slice(0,260))}</p>${info}</div>`;
    else if(preview.kind==='audio')content=`<div class="sl-audio-preview">${icon('audio')}<strong>${E(libraryLabel(preview.label))}</strong><p>${E(preview.excerpt.slice(0,120))}</p>${info}</div>`;
    else if(image)content=image+info;
    else if(preview.kind==='video'&&preview.media)content=`<video class="sl-video-cover" src="${E(preview.media.url)}#t=0.001" preload="metadata" muted playsinline aria-hidden="true"></video>`+info;
    else content=`<div class="sl-excerpt"><small>${E(libraryLabel(preview.label))}</small><p>${E(preview.excerpt.slice(0,200))}</p>${info}</div>`;
    const play=preview.media?b(icon('play')+(preview.media.kind==='audio'?'Listen':'Play'),'play-media',asset.key,'sl-play-button').replace('<button ','<button aria-label="'+(preview.media.kind==='audio'?'Listen to ':'Play ')+E(asset.name)+'" '):'';
    const duration=preview.media?.duration;
    return `<div class="sl-asset-picture sl-preview-${preview.kind}"><a class="sl-preview-link" href="#${assetURL(asset)}" aria-label="View ${E(asset.name)}">${content}</a>${play}${duration?`<span class="sl-media-duration">${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}</span>`:''}</div>`;
  }
  function assetCard(asset,allTags){
    const category=L.categoryOf(asset),color=categoryArt[category]?.[0];
    const quickTag=b(icon('plus'),'edit-tags',asset.key,'sl-quick-tag')
      .replace('<button ',`<button title="Edit tags" aria-label="Edit tags for ${E(asset.name)}" `);
    return `<article class="sl-asset-card" data-asset-key="${E(asset.key)}"><header class="sl-card-top"><span class="sl-category-tag"${color?` style="--sl-category-color:${color}"`:''}>${E(libraryLabel(category))}</span>${selectingAssets?`<label class="sl-card-select"><input type="checkbox" data-lib-select="${E(asset.key)}" aria-label="Select ${E(asset.name)}" ${selectedAssets.has(asset.key)?'checked':''}></label>`:assetActionMenu(asset)}</header>${cardPreview(asset)}<section><h3><a href="#${assetURL(asset)}" title="${E(asset.name)}">${E(asset.name)}</a></h3><div class="sl-card-tag-row"><p class="sl-card-source" title="${E(sourceLabel(asset)+(asset.ownerName?' · '+asset.ownerName:''))}">${E(libraryLabel(L.subcategoryOf(asset)))} · ${E(sourceLabel(asset))}</p>${assetTagChips(asset,allTags,true)}${quickTag}</div></section></article>`;
  }
  function topActions({params}){
    if(params.has('legacy')||params.get('item')||params.get('assetState')==='trash')return null;
    return `<div class="cm-project-tools sl-top-actions" role="group" aria-label="Asset actions">${a('Creative tools','/app/tools','ghost small')}${C.btn(icon('plus')+'<span class="cm-project-tooltip" aria-hidden="true">Create asset</span>','new-asset','cm-project-action','aria-label="Create asset"')}</div>`;
  }
  function assets(ctx){const index=load(),key=ctx.params.get('item');if(key)return assetDetail(index.assets.find(asset=>asset.key===key),index);
    hydrateView(ctx);
    if(ctx.params.has('project'))view.assetProject=ctx.params.get('project');if(ctx.params.has('source'))view.assetSource=ctx.params.get('source');if(ctx.params.get('type')==='scripts')view.assetType='故事文本';
    view.assetType=[...new Set(view.assetType.split(',').map(L.normalizeCategory).filter(type=>type!=='全部'&&types.includes(type)))].join(',')||'全部';
    if(!['active','trash'].includes(view.assetState))view.assetState='active';
    const knownTags=new Set((index.meta.tags||[]).map(tag=>tag.id));
    view.assetTags=view.assetTags.split(',').filter(id=>id==='untagged'||knownTags.has(id)).join(',');
    const list=index.assets.filter(asset=>L.matchesAsset(asset,view)),tagCount=view.assetTags.split(',').filter(Boolean).length,typeCount=view.assetType==='全部'?0:view.assetType.split(',').length;
    selectedAssets=new Set([...selectedAssets].filter(key=>list.some(asset=>asset.key===key)));
    const bulkLabel=selectingAssets?'Cancel selection':'Bulk organize';
    return `<div class="sl-page">${heading(view.assetState==='trash'?'Asset Trash':'Asset Library',view.assetState==='trash'?'Restored assets reappear in the Asset Library.':'',view.assetState==='trash'?a('Back to Asset Library','/app/assets'):'')}${warning()}
      <div class="sl-toolbar sl-compact-toolbar">
        ${CimoraSearchField.render(`<input data-lib-search="assetSearch" aria-label="Search assets" value="${E(view.assetSearch)}" placeholder="Search by asset name, content, or project">`, "sl-search")}
        ${b('Type'+(typeCount?' · '+typeCount:'')+icon('down'),'type-filter','','sl-filter-button'+(typeCount?' is-active':'')).replace('<button ','<button aria-label="Asset type" aria-haspopup="dialog" aria-expanded="false" ')}
        ${b('Tags'+(tagCount?' · '+tagCount:'')+icon('down'),'tag-filter','','sl-filter-button'+(tagCount?' is-active':'')).replace('<button ','<button aria-haspopup="dialog" aria-expanded="false" ')}
        ${b(`<span class="sl-bulk-label">${bulkLabel}</span><span class="sl-bulk-short" aria-hidden="true">${selectingAssets?'Cancel':'Bulk'}</span>`,'toggle-bulk','','sl-filter-button').replace('<button ',`<button aria-label="${bulkLabel}" aria-pressed="${selectingAssets}" `)}
        <span class="sl-result-count" role="status">${list.length} ${list.length===1?'asset':'assets'}</span>
      </div>
      ${activeFilters(index)}${bulkTagBar()}<div class="sl-asset-grid" aria-label="Asset list">${list.map(asset=>assetCard(asset,index.meta.tags||[])).join('')||empty('No matching assets','Clear filters or try a different type, tag, or keyword.')}</div></div>`;
  }
  function profileText(value){if(!value)return '';const labels={identity:'Identity',relation:'Relationships',state:'Current status',intro:'Character overview',traits:'Traits',story:'Backstory',notes:'Notes',role:'Story role',age:'Age',gender:'Gender',background:'Background',appearance:'Appearance',personality:'Personality',motivation:'Motivation'};const entries=Object.entries(value).filter(([key,item])=>labels[key]&&typeof item==='string'&&item.trim());return entries.length?`<dl class="sl-profile-grid">${entries.map(([key,item])=>`<div><dt>${E(labels[key])}</dt><dd>${E(item)}</dd></div>`).join('')}</dl>`:'';}

  function galleryOf(asset,version=asset.version){
    const entries=Object.entries(version?.images||{main:version?.image||(version===asset.version?asset.image:'')});
    return entries.map(([slot,src])=>({slot,src:L.imageOf(src,asset.owner?.startsWith('comic:'))})).filter((item,i,items)=>item.src&&items.findIndex(other=>other.src===item.src)===i);
  }
  function assetDetail(asset,index){
    if(!asset)return `<div class="sl-page">${backLink()}${empty('Asset not found','Go back to the list or check the source workspace.')}</div>`;
    const owner=index.projects.find(project=>project.key===asset.owner),legacy=asset.key.startsWith('legacy:');
    const isStory=asset.type==='故事文本',active=asset.state==='active',gallery=galleryOf(asset),media=L.mediaOf(asset);
    const usageEntries=[...asset.usages];
    if(owner&&!usageEntries.some(use=>use.projectKey===owner.key))usageEntries.unshift({projectKey:owner.key,label:owner.title,source:true});
    const sourceTool=asset.tool&&window.ToolCatalog?.find(asset.raw.toolId);
    const sourceLink=(label,url)=>a(icon('external'),url,'ghost sl-detail-icon')
      .replace('<a ',`<a aria-label="${E(label)}" title="${E(label)}" `);
    const sourceAction=active&&sourceTool&&!sourceTool.retired&&!sourceTool.hidden
      ?sourceLink(asset.raw.editorDraft?'Continue editing in the tool':'Return to the original tool',asset.url+'?fromAsset='+encodeURIComponent(asset.raw.id))
      :owner?sourceLink('Open source workspace',owner.url):asset.raw.resultId?sourceLink('Open original tool',asset.url):'';
    const trashAction=b(icon('trash'),'trash-asset',asset.key,'ghost sl-detail-icon')
      .replace('<button ','<button aria-label="Move to Trash" title="Move to Trash" ');
    const editActions=legacy&&active?C.btn('Create new version','asset-revise','cm-button ghost',`data-id="${E(asset.id)}"`)+C.btn('Reference in current chapter','bind-asset','cm-button primary',`data-id="${E(asset.id)}"`):'';
    const preview=media?`<${media.kind} class="sl-detail-media" controls preload="metadata" src="${E(media.url)}" ${media.kind==='video'&&asset.image?'poster="'+E(asset.image)+'"':''}></${media.kind}>`:asset.image?`<img class="sl-main-image" src="${E(asset.image)}" alt="${E(asset.name)}">`:!isStory?`<div class="sl-media-placeholder"><b aria-hidden="true">${asset.type==='声音'?'♫':'◈'}</b><p>${E(libraryLabel(L.subcategoryOf(asset)))}</p><small>No media preview available</small></div>`:'';
    const profile=profileText(asset.profile);
    const content=`<section class="sl-panel sl-detail-content"><h2>${isStory?'Story and chapters':'Asset description'}</h2>${asset.description?`<p class="sl-description">${E(asset.description)}</p>`:''}
      ${isStory?asset.episodes.map(ep=>`<details><summary>${E(ep.title)}</summary><p>${E(ep.events||ep.outline||'')}</p><pre>${E(L.body(asset.raw.scripts?.[ep.id])||'This chapter has no script yet')}</pre></details>`).join(''):profile?`<details><summary>View full character profile</summary>${profile}</details>`:''}
      ${editActions?`<div class="sl-actions">${editActions}</div>`:''}${isStory?`<div class="sl-actions">${b('Export story TXT','export-story-txt',asset.key)}${b('Export project JSON','export-story-json',asset.key)}</div>`:''}</section>`;
    return `<div class="sl-page sl-detail-page">${backLink()}${heading(E(asset.name),E(libraryLabel(L.subcategoryOf(asset))+' · '+sourceLabel(asset)),
      (active&&isStory?b('Create from story','use-story',asset.key,'primary'):'')+sourceAction+(active?trashAction:b('Restore asset','restore-asset',asset.key,'primary')))}
      ${warning()}${!active?'<p class="sl-warning">Restore this asset from Trash to use it again.</p>':''}
      <div class="sl-detail-grid"><main class="sl-detail-main">
      ${!isStory?`<section class="sl-panel sl-detail-preview"><h2>Preview</h2>${preview}${gallery.length>1?`<h3>Reference images <small>${gallery.length}</small></h3><div class="sl-gallery">${gallery.map(item=>`<figure><img src="${E(item.src)}" alt="${E(imageLabel(item.slot))}" loading="lazy"><figcaption>${E(imageLabel(item.slot))}</figcaption></figure>`).join('')}</div>`:''}</section>`:''}
      ${isStory?content:''}</main>
      <aside class="sl-detail-aside"><section class="sl-panel"><h2>Asset information</h2><div class="sl-detail-fact"><span>Source</span><strong>${E(sourceLabel(asset))}</strong></div>${owner?`<div class="sl-detail-fact"><span>Source project</span>${a(E(owner.title),owner.url)}</div>`:''}
      <details class="sl-detail-disclosure"><summary>Linked projects <span>${usageEntries.length}</span></summary>${usageEntries.length?usageEntries.map(use=>{const project=index.projects.find(project=>project.key===use.projectKey);return `<div class="sl-usage">${project?a(E(use.label||project.title),project.url):E(use.label)}${use.source?'<small>Source project</small>':use.candidate?'<small>Pending adoption</small>':''}</div>`;}).join(''):'<p>No linked projects</p>'}</details>
      <details class="sl-detail-disclosure"><summary>Versions and candidates <span>${asset.versions.length}</span></summary>${asset.versions.length?asset.versions.map((version,i)=>`<div class="sl-version"><div><strong>${E(version.label||'Version '+(i+1))}</strong><small>${asset.version?.id===version.id?(legacy?(asset.raw.locked?'Locked':'Draft'):isStory?'Saved':'In use'):'History / Candidate'}</small></div>${b('Preview','preview-version',asset.key+'|'+version.id)}</div>`).join(''):'<p>No versions available</p>'}${legacy&&active?C.btn('View version impact','asset-impact','cm-button ghost',`data-id="${E(asset.id)}"`)+(!asset.raw.locked?C.btn('Lock current version','cm-lock-asset','cm-button ghost',`data-id="${E(asset.id)}"`):''):''}</details>
      ${asset.original?`<details class="sl-detail-disclosure"><summary>Original text</summary><pre>${E(asset.original)}</pre></details>`:''}
      <div class="sl-detail-tags"><span>Tags</span>${assetTagChips(asset)||'<small>No tags</small>'}${b('+ Tag','edit-tags',asset.key)}</div>
      </section>${isStory?'':content}</aside></div></div>`;
  }
  function storyDialog(asset){
    S.modal('Create from story',`<p>${E(asset.name)} · Copy the saved story, including the original text and character profiles.</p><label>Scope<select id="sl-story-episode"><option value="">Entire story</option>${asset.episodes.map(ep=>`<option value="${E(ep.id)}">${E(ep.title)}${L.body(asset.raw.scripts?.[ep.id]).trim()?'':' · No script yet'}</option>`).join('')}</select></label><label>Project type<select id="sl-story-kind"><option value="comic">Comic</option><option value="video">Video</option></select></label><p>This creates a separate project and preserves existing work.</p>`,b('Create linked project','confirm-story',asset.key,'primary'));
  }
  const oldRoute=C.route;
  C.route=ctx=>{
    if(ctx.parts[0]!=='app'||ctx.parts[1]!=='assets'||ctx.params.has('legacy'))return oldRoute(ctx);
    clearTimeout(searchTimer);closePopover(false);
    try{
      const params=new URLSearchParams(ctx.params);
      if(ctx.parts[2])params.set('item','legacy:'+decodeURIComponent(ctx.parts[2]));
      return assets({...ctx,parts:['app','assets'],params});
    }catch(error){return `<div class="sl-page">${heading('Asset Library','Organize and find your saved assets.')}<p class="sl-warning" role="alert">${E(libraryLabel(error.message))} Your original records are intact. Keep your browser data.</p>${a('Back to Creation Space','/app')}</div>`;}
  };
  const scrollPositions=new Map();
  document.addEventListener('click',event=>{
    if(event.target.closest('.sl-page a[href]'))scrollPositions.set(location.hash,window.scrollY);
  },true);
  const oldAfter=C.afterRender;
  C.afterRender=ctx=>{
    oldAfter(ctx);
    const managing=ctx.parts[1]==='assets'&&!ctx.params.has('legacy');
    document.body.classList.toggle('studio-library-page',managing);
    if(!managing)closePopover(false);
    if(managing)requestAnimationFrame(()=>window.scrollTo(0,scrollPositions.get(location.hash)||0));
  };
  function handle(action,key,trigger){
    switch(action){
      case 'asset-type': view.assetType=key;selectedAssets.clear();S.route(filterURL());break;
      case 'reset-filters': view={...defaults,assetState:view.assetState};selectedAssets.clear();S.route(filterURL());break;
      case 'remove-filter':if(key.startsWith('type:'))view.assetType=view.assetType.split(',').filter(type=>type!==key.slice(5)).join(',')||'全部';else if(key.startsWith('tag:'))view.assetTags=view.assetTags.split(',').filter(id=>id!==key.slice(4)).join(',');else if(key in defaults)view[key]=defaults[key];selectedAssets.clear();S.route(filterURL());break;
      case 'type-filter':typeFilterPanel(trigger);break;
      case 'clear-type-draft':for(const node of document.querySelectorAll('[data-lib-type-filter]'))node.checked=false;updateFilterCount();break;
      case 'apply-type-filter':view.assetType=[...document.querySelectorAll('[data-lib-type-filter]:checked')].map(node=>node.dataset.libTypeFilter).join(',')||'全部';selectedAssets.clear();S.route(filterURL());break;
      case 'tag-filter':tagFilterPanel(trigger);break;
      case 'close-popover':closePopover();break;
      case 'stage-tag':stageTag(key);break;
      case 'apply-tag-filter':view.assetTags=[...document.querySelectorAll('[data-lib-tag-filter]:checked')].map(node=>node.dataset.libTagFilter).join(',');selectedAssets.clear();S.route(filterURL());break;
      case 'play-media':{const asset=findAsset(key),media=L.mediaOf(asset);if(!media)throw Error('No playable media is available for this asset.');closePopover();S.modal(asset.name,`<${media.kind} class="sl-media-player" controls autoplay preload="metadata" src="${E(media.url)}" ${media.kind==='video'&&asset.image?'poster="'+E(asset.image)+'"':''}></${media.kind}><p class="sl-footnote">${E(libraryLabel(L.subcategoryOf(asset)))}</p>`,'',true);break;}
      case 'filter-tag':{const selected=view.assetTags.split(',').filter(Boolean);view.assetTags=key==='all'?'':key==='untagged'?'untagged':(selected.includes(key)?selected.filter(id=>id!==key):[...selected.filter(id=>id!=='untagged'),key]).join(',');selectedAssets.clear();S.route(filterURL());break;}
      case 'toggle-bulk':rememberScroll();selectingAssets=!selectingAssets;selectedAssets.clear();S.render();break;
      case 'select-visible':rememberScroll();selectedAssets=new Set([...document.querySelectorAll('[data-lib-select]')].map(node=>node.dataset.libSelect));S.render();break;
      case 'clear-selection':rememberScroll();selectedAssets.clear();S.render();break;
      case 'edit-tags':tagEditor([key],'replace',trigger);break;
      case 'bulk-add-tags':case 'bulk-remove-tags':if(!selectedAssets.size)throw Error('Select an asset first.');tagEditor([...selectedAssets],action==='bulk-add-tags'?'add':'remove',trigger);break;
      case 'save-tags':return saveTagEditor();
      case 'manage-tags':closePopover();tagManager();break;
      case 'create-tag':mutateTags(value=>L.createTag(value,S.id('tag'),document.getElementById('sl-new-tag').value));S.render();tagManager();break;
      case 'rename-tag':tagRename(key);break;
      case 'confirm-rename-tag':mutateTags(value=>L.renameTag(value,key,document.getElementById('sl-tag-name').value));S.render();tagManager();break;
      case 'merge-tag':tagMerge(key);break;
      case 'confirm-merge-tag':mutateTags(value=>L.mergeTag(value,key,document.getElementById('sl-merge-target').value));S.render();tagManager();break;
      case 'delete-tag':{const tag=meta().tags.find(tag=>tag.id===key);if(!tag)throw Error('Tag not found');S.modal('Delete tag',`<p>Deleting “${E(tag.name)}” removes the tag. Assets and project references are preserved.</p>`,b('Confirm tag deletion','confirm-delete-tag',key,'primary'));break;}
      case 'confirm-delete-tag':mutateTags(value=>L.deleteTag(value,key));S.render();tagManager();break;
      case 'trash-asset':{closePopover();const asset=findAsset(key);if(!asset||asset.state!=='active')throw Error('This asset is no longer in the current list. Refresh and try again.');S.modal('Move asset to Trash',`<p>Move “${E(asset.name)}” to Trash?</p><p>You can restore the asset from Trash. Linked project content and active versions are preserved.</p>`,b('Cancel','cancel-trash-asset')+b('Confirm','confirm-trash-asset',key,'primary'));break;}
      case 'cancel-trash-asset':S.close();break;
      case 'confirm-trash-asset':case 'restore-asset':changeMeta(value=>{if(!findAsset(key))throw Error('Asset not found');value.assets[key]={...value.assets[key],state:action==='restore-asset'?'active':'trash',deletedAt:action==='restore-asset'?null:new Date().toISOString()};});S.close();S.render();S.toast(action==='restore-asset'?'Asset restored':'Moved to Trash. You can restore it any time.');break;
      case 'preview-version':{
        const split=key.lastIndexOf('|'),asset=findAsset(key.slice(0,split)),version=asset?.versions.find(version=>String(version.id)===key.slice(split+1));
        if(!version)throw Error('Version not found');
        const gallery=galleryOf(asset,version);
        S.modal('Version preview · '+asset.name,`<p>${E(version.label||'Saved version')}</p>${gallery.length?`<div class="sl-gallery">${gallery.map(item=>`<figure><img src="${E(item.src)}" alt="${E(imageLabel(item.slot))}"><figcaption>${E(imageLabel(item.slot))}</figcaption></figure>`).join('')}</div>`:''}<p>${E(version.description||asset.description)}</p><p class="sl-footnote">Previewing keeps the current version in use.</p>`,'',true);break;
      }
      case 'use-story':storyDialog(findAsset(key));break;
      case 'confirm-story':{
        guard();const asset=findAsset(key),episodeId=document.getElementById('sl-story-episode').value,kind=document.getElementById('sl-story-kind').value;
        if(!asset||asset.state!=='active')throw Error('This story is currently unavailable.');
        const selected=asset.episodes.filter(ep=>!episodeId||ep.id===episodeId);
        if(!selected.length||selected.some(ep=>!L.body(asset.raw.scripts?.[ep.id]).trim()))throw Error('Finish the scripts for the selected chapters before continuing.');
        C.storyAssetBridge.handoff(asset.raw,episodeId,kind);S.close();break;
      }
      case 'export-story-txt':case 'export-story-json':{
        const asset=findAsset(key);if(!asset)throw Error('Story not found');
        const json=action.endsWith('json');S.download(json?ScriptStudio.exportJSON(asset.raw):ScriptStudio.exportText(asset.raw),asset.name+(json?'-story-project.json':'-story.txt'),json?'application/json':'text/plain;charset=utf-8');break;
      }
    }
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-lib]');if(!button)return;
    event.preventDefault();
    try{await handle(button.dataset.lib,button.dataset.key,button);}catch(error){S.toast(libraryLabel(error.message));}
  });
  document.addEventListener('item-action',async event=>{
    if(!event.target.closest('.sl-asset-card'))return;
    const {id,action}=event.detail;
    const asset=findAsset(id);
    if(!asset)return;
    if(action==='details'){rememberScroll();S.route(assetURL(asset));return;}
    const assetAction={tags:'edit-tags',archive:'trash-asset',restore:'restore-asset'}[action];
    if(!assetAction)return;
    try{await handle(assetAction,id,event.target.querySelector('.cm-item-actions-trigger'));}catch(error){S.toast(libraryLabel(error.message));}
  });
  function updateFilterCount(){const count=floating?.element.querySelector('[data-filter-count]');if(count)count.textContent=floating.element.querySelectorAll('[data-lib-type-filter]:checked,[data-lib-tag-filter]:checked').length+' selected';}
  document.addEventListener('load',event=>{const image=event.target;if(image.matches?.('[data-lib-character-cover]')&&image.naturalWidth>=image.naturalHeight*2.4)image.classList.add('sl-wide-character-cover');},true);
  document.addEventListener('change',event=>{
    const element=event.target;
    if(element.dataset.libTagOption&&tagEdit){
      if(element.checked)tagEdit.selected.add(element.dataset.libTagOption);else tagEdit.selected.delete(element.dataset.libTagOption);
    }else if(element.dataset.libTagFilter){
      for(const other of document.querySelectorAll('[data-lib-tag-filter]'))if(other!==element&&element.checked&&(element.dataset.libTagFilter==='untagged'||other.dataset.libTagFilter==='untagged'))other.checked=false;
      updateFilterCount();
    }else if(element.dataset.libTypeFilter){updateFilterCount();
    }else if(element.dataset.libSelect){
      if(element.checked)selectedAssets.add(element.dataset.libSelect);else selectedAssets.delete(element.dataset.libSelect);
      const counter=document.getElementById('sl-selected-count');if(counter)counter.textContent=selectedAssets.size+' selected';
      for(const button of document.querySelectorAll('[data-lib=bulk-add-tags],[data-lib=bulk-remove-tags]'))button.disabled=!selectedAssets.size;
    }else if(element.dataset.libFilter){clearTimeout(searchTimer);view[element.dataset.libFilter]=element.value;selectedAssets.clear();S.route(filterURL());}
  });
  document.addEventListener('input',event=>{
    const input=event.target;if('libTagSearch' in input.dataset||'libOptionSearch' in input.dataset){filterTagOptions(input.value);return;}if(input.dataset.libSearch!=='assetSearch')return;
    clearTimeout(searchTimer);const value=input.value,position=input.selectionStart;
    searchTimer=setTimeout(()=>{
      if(!input.isConnected)return;
      view.assetSearch=value;selectedAssets.clear();
      history.replaceState(null,'','#'+filterURL());S.render();
      const next=document.querySelector('[data-lib-search="assetSearch"]');next?.focus();next?.setSelectionRange(position,position);
    },180);
  });
  window.addEventListener?.('resize',positionPopover);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closePopover();if(event.key==='Enter'&&event.target.matches?.('[data-lib-tag-search]')){event.preventDefault();const create=floating?.element.querySelector('[data-lib="stage-tag"]');if(create&&!create.hidden)stageTag(create.dataset.key);}});
  document.addEventListener('error',event=>{if(event.target.matches?.('.sl-media-player'))S.toast('Media could not be loaded. Check the file in the source workspace.');},true);
  window.StudioLibrary={load,findAsset,meta,changeMeta,guard,topActions,label:libraryLabel};
})();
