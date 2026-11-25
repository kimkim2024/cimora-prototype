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
  const heading=(title,desc,actions='')=>`<header class="sl-heading"><div><h1${title==='资产库'?' class="cm-workspace-title"':''}>${title}</h1>${desc?`<p>${desc}</p>`:""}</div><div class="sl-actions">${actions}</div></header>`;
  const empty=(title,desc)=>`<div class="sl-empty"><span aria-hidden="true">◈</span><h2>${title}</h2><p>${desc}</p>${b('清除筛选','reset-filters')}</div>`;
  function read(key,fallback){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):copy(fallback);}
  function meta(){
    const value=read(KEY,{version:1,projects:{},assets:{},personal:[],tags:[]});
    if(value?.version!==1||!value.projects||typeof value.projects!=='object'||!value.assets||typeof value.assets!=='object'||!Array.isArray(value.personal)||value.tags&&!Array.isArray(value.tags))throw Error('管理记录格式异常，未覆盖原记录');
    return value;
  }
  function sourceDB(key){
    const value=read(key,{version:1,projects:[],assets:[]});
    if(value?.version!==1||!Array.isArray(value.projects)||key===STORY&&!Array.isArray(value.assets))throw Error('存储格式异常，已保留原记录');
    return value;
  }
  function load(){
    warnings=[];
    const safely=(name,fn,fallback)=>{try{return fn();}catch(error){warnings.push(name+'：'+error.message);return fallback;}};
    const management=safely('资产管理',meta,{version:1,projects:{},assets:{},personal:[],tags:[]});
    const stories=safely('故事库',()=>sourceDB(STORY),{projects:[],assets:[]});
    const comics=safely('漫画库',()=>sourceDB(COMIC),{projects:[]});
    const comicDrafts=safely('漫画草稿',()=>sourceDB('cimora-comic-story-v1'),{projects:[]});
    const videoDrafts=safely('视频草稿',()=>sourceDB('cimora-video-story-v1'),{projects:[]});
    const videoEntries=[];
    for(const project of S.state.projects){
      for(const [hostId,engine] of Object.entries(C.M.db.projects[project.id]||{})){
        if(engine.videoFlow?.workspace)videoEntries.push({projectId:project.id,hostId,workspace:engine.videoFlow.workspace,source:engine.videoFlow.source,shots:engine.productionShots||[],bindings:engine.bindings,createdAt:engine.videoFlow.createdAt,engine});
      }
    }
    const index=L.build({stories,comics,comicDrafts,videoDrafts,videos:S.state.projects,engines:C.M.db.projects,videoEntries,legacyAssets:S.state.assets,tools:safely('工具成果',()=>window.ToolStudio?.store?.list()||[],[]),meta:management});
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
  function guard(){load();if(warnings.length)throw Error('存在无法读取的记录，暂停写入以保留原数据');}
  function changeMeta(fn){guard();const value=meta();fn(value);try{localStorage.setItem(KEY,JSON.stringify(value));}catch{throw Error('本机空间不足，本次修改未保存');}return value;}
  const warning=()=>warnings.length?`<p class="sl-warning" role="alert">${warnings.map(E).join('<br>')}。原记录保持不变。</p>`:'';
  const findAsset=key=>load().assets.find(asset=>asset.key===key);
  const currentList=()=>{const params=new URLSearchParams(location.hash.split('?')[1]||'');return params.has('item')?safeBack(params.get('back')):location.hash.slice(1);};
  const safeBack=path=>typeof path==='string'&&/^\/app\/assets(?:\?|$)/.test(path)&&!new URLSearchParams(path.split('?')[1]||'').has('item')?path:'/app/assets';
  const assetURL=asset=>'/app/assets?item='+q(asset.key)+'&back='+q(currentList());
  const backLink=()=>a('← 返回资产库',safeBack(S.context.params.get('back')),'sl-back');
  function filterURL(){const params=new URLSearchParams();for(const [field,value] of Object.entries(view))if(value!==defaults[field])params.set(field,value);return '/app/assets'+(params.size?'?'+params:'');}
  function hydrateView(ctx){view={...defaults};for(const field of Object.keys(defaults))if(ctx.params.has(field))view[field]=ctx.params.get(field);}
  const imageLabel=slot=>({main:'主参考',sheet:'角色设定表',portrait:'头像',front:'正面',side:'侧面',back:'背面',clothing:'服装参考',accessories:'配饰',first:'首帧',last:'尾帧'})[slot]||'参考图';
  const sourceLabel=asset=>L.sourceLabels[L.creationSource(asset)];
  const icon=name=>`<svg class="sl-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',down:'<path d="m7 10 5 5 5-5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',filter:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--ap-surface,#fff)"/><circle cx="16" cy="17" r="2" fill="var(--ap-surface,#fff)"/>',audio:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',play:'<path d="m9 5 11 7-11 7z"/>'})[name]||''}</svg>`;
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
    const element=document.createElement('div');element.id='sl-popover';element.className='sl-popover'+(title==='筛选类型'||title==='筛选标签'?' sl-filter-popover':'');
    if(className)element.classList.add(className);
    element.setAttribute('popover','auto');element.setAttribute('role','dialog');element.setAttribute('aria-label',title);
    element.innerHTML=`<header><strong>${E(title)}</strong>${b(icon('close'),'close-popover','','sl-icon-button').replace('<button ','<button aria-label="关闭浮层" ')}</header>${body}${footer?`<footer>${footer}</footer>`:''}`;
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
    return values.length?`<div class="sl-tag-chips">${visible.map(tag=>`<span class="sl-user-tag" title="${E(tag.name)}">${E(tag.name)}</span>`).join('')}${compact&&values.length>2?b('+'+(values.length-2),'edit-tags',asset.key,'sl-tag-overflow').replace('<button ','<button aria-label="查看全部 '+values.length+' 个标签" '):''}</div>`:'';
  }
  function typeFilterPanel(trigger){
    const selected=view.assetType.split(',').filter(value=>value&&value!=='全部');
    const rows=types.filter(type=>type!=='全部').map(type=>{
      const [color,path]=categoryArt[type];
      return `<label class="plan-chip"><input type="checkbox" data-lib-type-filter="${E(type)}" ${selected.includes(type)?'checked':''}><span class="plan-chip-icon" aria-hidden="true" style="--chip-ink:${color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></span><span>${E(type)}</span></label>`;
    }).join('');
    togglePanel(trigger,'筛选类型',`<p class="sl-pop-hint">可多选，显示符合任一类型的资产。</p><div class="sl-filter-section"><span>选择类型</span><span data-filter-count>已选 ${selected.length} 项</span></div><div class="sl-option-list sl-filter-options">${rows}</div>`,`${b('清空选择','clear-type-draft')}${b('应用','apply-type-filter','','primary')}`);
  }
  function tagFilterPanel(trigger){
    const selected=view.assetTags.split(',').filter(Boolean),available=load().meta.tags||[];
    const row=(id,name)=>`<label class="sl-option" data-lib-option-name="${E(name.toLowerCase())}"><input type="checkbox" data-lib-tag-filter="${E(id)}" ${selected.includes(id)?'checked':''}><span>${E(name)}</span><span class="sl-filter-remove" aria-hidden="true">×</span></label>`;
    togglePanel(trigger,'筛选标签',`${CimoraSearchField.render(`<input class="sl-pop-search" data-lib-option-search placeholder="搜索标签" aria-label="搜索筛选标签">`, "sl-pop-search")}<p class="sl-pop-hint">可多选，显示同时包含所选标签的资产。</p><div class="sl-filter-section"><span>选择标签</span><span data-filter-count>已选 ${selected.length} 项</span></div><div class="sl-option-list sl-filter-options">${row('untagged','未添加标签')}${available.map(tag=>row(tag.id,tag.name)).join('')}</div><p class="sl-option-empty" hidden>没有匹配的标签</p>`,`${b('管理标签','manage-tags')}${b('应用','apply-tag-filter','','primary')}`);
  }
  function activeFilters(index){
    const chips=[];
    const chip=(label,key)=>b(E(label)+icon('close'),'remove-filter',key,'sl-filter-chip').replace('<button ','<button aria-label="移除筛选：'+E(label)+'" ');
    for(const type of view.assetType.split(',').filter(value=>value&&value!=='全部'))chips.push(chip(type,'type:'+type));
    if(view.assetSearch)chips.push(chip('搜索：'+view.assetSearch,'assetSearch'));
    if(view.assetSource!=='all')chips.push(chip('来源：'+(L.sourceLabels[view.assetSource]||'个人资产'),'assetSource'));
    if(view.assetProject!=='all')chips.push(chip('项目：'+(view.assetProject==='unlinked'?'未关联项目':index.projects.find(p=>p.key===view.assetProject)?.title||'原项目'),'assetProject'));
    for(const id of view.assetTags.split(',').filter(Boolean))chips.push(chip(id==='untagged'?'未添加标签':index.meta.tags.find(tag=>tag.id===id)?.name||id,'tag:'+id));
    return chips.length?`<div class="sl-active-filters" aria-label="已选筛选条件"><span>已选</span>${chips.join('')}${b('清空条件','reset-filters','','sl-text-button')}</div>`:'';
  }
  function bulkTagBar(){
    if(!selectingAssets)return '';
    const disabled=selectedAssets.size?'':'disabled ';
    return `<div class="sl-bulk-bar"><span id="sl-selected-count">已选择 ${selectedAssets.size} 项</span>${b('全选结果','select-visible')}${b('清空选择','clear-selection')}${b('添加标签','bulk-add-tags').replace('<button ','<button '+disabled)}${b('移除标签','bulk-remove-tags').replace('<button ','<button '+disabled)}</div>`;
  }
  function mutateTags(transform){guard();return changeMeta(value=>{const next=transform(value);Object.assign(value,next);});}
  function tagOptionList(){
    return tagEdit.options.map(tag=>`<label class="sl-option" data-lib-option-name="${E(tag.name.toLowerCase())}"><input type="checkbox" data-lib-tag-option="${E(tag.id)}" ${tagEdit.selected.has(tag.id)?'checked':''}><span>${E(tag.name)}</span>${tag.pending?'<small>新标签</small>':''}</label>`).join('');
  }
  function tagEditor(keys,mode,trigger){
    const index=load(),assets=keys.map(key=>index.assets.find(asset=>asset.key===key)).filter(Boolean);
    if(assets.length!==keys.length)throw Error('部分资产已不存在，请刷新后重试');
    const session={keys,mode,options:(index.meta.tags||[]).map(tag=>({...tag})),selected:new Set(mode==='replace'?assets[0].tags:[])};
    openPopover(trigger,mode==='replace'?'编辑资产标签':mode==='add'?'批量添加标签':'批量移除标签',`<p class="sl-pop-hint">${mode==='replace'?E(assets[0].name):`已选择 ${keys.length} 项，${mode==='add'?'追加所选标签':'仅移除所选标签'}。`}</p>${CimoraSearchField.render(`<input class="sl-pop-search" data-lib-tag-search maxlength="30" placeholder="${mode==='remove'?'搜索标签':'搜索或创建标签'}" aria-label="${mode==='remove'?'搜索标签':'搜索或创建标签'}">`, "sl-pop-search")}<div class="sl-option-list" id="sl-edit-options"></div><p class="sl-option-empty" hidden>没有匹配的标签</p>${mode!=='remove'?'<button type="button" class="sl-create-tag" data-lib="stage-tag" hidden></button>':''}`,b('取消','close-popover')+b('完成','save-tags','','primary'),mode==='replace'?'sl-tag-editor':'');
    tagEdit=session;document.getElementById('sl-edit-options').innerHTML=tagOptionList();filterTagOptions('');positionPopover();
  }
  function filterTagOptions(query){
    if(!floating)return;const text=query.trim().toLowerCase();let matches=0;
    for(const row of floating.element.querySelectorAll('[data-lib-option-name]')){row.hidden=!row.dataset.libOptionName.includes(text);if(!row.hidden)matches++;}
    const empty=floating.element.querySelector('.sl-option-empty');if(empty){empty.hidden=!!matches;empty.textContent=tagEdit&&!tagEdit.options.length?'还没有标签，输入名称即可创建。':'没有匹配的标签';}
    const create=floating.element.querySelector('[data-lib="stage-tag"]');
    if(create){const name=query.normalize('NFC').trim().replace(/\s+/g,' ');create.hidden=!name||tagEdit.options.some(tag=>tag.name.toLowerCase()===name.toLowerCase());create.dataset.key=name;create.textContent='创建并添加「'+name+'」';}
    const save=floating.element.querySelector('[data-lib="save-tags"]');
    if(save&&tagEdit)save.textContent=create&&!create.hidden?'创建并保存':'完成';
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
    if(!tagEdit)throw Error('请重新打开标签编辑');
    // The save button must not silently discard an uncommitted new tag name.
    const typed=(floating?.element.querySelector('[data-lib-tag-search]')?.value||'').normalize('NFC').trim().replace(/\s+/g,' ');
    if(tagEdit.mode!=='remove'&&typed&&!tagEdit.options.some(tag=>tag.name.toLowerCase()===typed.toLowerCase())){
      if(typed.length>30)throw Error('标签名称需要 1–30 个字符');
      const id='pending:'+S.id('tag');tagEdit.options.push({id,name:typed,pending:true});tagEdit.selected.add(id);
    }
    const {keys,mode,selected,options:choices}=tagEdit;
    if(mode!=='replace'&&!selected.size)throw Error('请先选择标签');
    mutateTags(value=>{
      let next=value;const ids=[];
      for(const id of selected){const item=choices.find(tag=>tag.id===id);if(!item)continue;
        if(item.pending){const existing=(next.tags||[]).find(tag=>tag.name.toLowerCase()===item.name.toLowerCase());const actual=existing?.id||S.id('tag');if(!existing)next=L.createTag(next,actual,item.name);ids.push(actual);}else ids.push(id);}
      return L.assignTags(next,keys,ids,mode);
    });
    const inList=!S.context.params.has('item'),hidden=inList?keys.filter(key=>!L.matchesAsset(findAsset(key),view)).length:0;
    rememberScroll();closePopover();S.render();
    const anchor=[...document.querySelectorAll('[data-lib="edit-tags"]')].find(button=>button.dataset.key===keys[0]);anchor?.focus({preventScroll:true});
    S.toast(hidden?`标签已更新；${hidden} 项资产不再符合当前筛选`:'标签已保存');
  }
  function tagManager(){
    const index=load(),tags=index.meta.tags||[];
    S.modal('管理我的标签',`<p>标签全资产库通用。改名、合并或删除标签都不会删除资产。</p><div class="sl-tag-management">${tags.map(tag=>`<div><strong>${E(tag.name)}</strong><small>${index.assets.filter(asset=>asset.tags.includes(tag.id)).length} 项资产</small><div>${b('改名','rename-tag',tag.id)}${tags.length>1?b('合并','merge-tag',tag.id):''}${b('删除','delete-tag',tag.id)}</div></div>`).join('')||'<p>还没有自定义标签。</p>'}</div><label>新标签<input id="sl-new-tag" maxlength="30" placeholder="输入标签名称"></label>`,b('创建标签','create-tag','','primary'));
  }
  function tagRename(id){const tag=(meta().tags||[]).find(tag=>tag.id===id);if(!tag)throw Error('标签不存在');S.modal('重命名标签',`<label>标签名称<input id="sl-tag-name" maxlength="30" value="${E(tag.name)}"></label>`,b('保存名称','confirm-rename-tag',id,'primary'));}
  function tagMerge(id){const tags=meta().tags||[],tag=tags.find(tag=>tag.id===id);if(!tag)throw Error('标签不存在');S.modal('合并标签',`<p>将「${E(tag.name)}」合并到另一个标签，原有资产标记会统一更新。</p><label>合并到<select id="sl-merge-target">${tags.filter(tag=>tag.id!==id).map(tag=>`<option value="${E(tag.id)}">${E(tag.name)}</option>`).join('')}</select></label>`,b('确认合并','confirm-merge-tag',id,'primary'));}
  function assetActionMenu(asset){
    return CimoraItemActionMenu.render({id:asset.key,name:asset.name,actions:[
      {id:'tags',label:'Edit tags',showLabel:true},
      {id:'details',label:'View details'},
      asset.state==='trash'?{id:'restore',label:'Restore asset'}:{id:'archive',label:'Move to Recycle Bin'},
    ]});
  }
  function cardPreview(asset){
    const preview=L.previewOf(asset),comic=asset.owner?.startsWith('comic:'),images=asset.version?.images||{};
    const main=L.imageOf(asset.image,comic),front=L.imageOf(images.front,comic),portrait=L.imageOf(images.portrait,comic);
    const cover=L.categoryOf(asset)==='角色'?(front||((portrait&&portrait!==main)?portrait:'')||main):main;
    const image=cover?`<img src="${E(cover)}" alt="${E(asset.name)}" loading="lazy" ${L.categoryOf(asset)==='角色'?'data-lib-character-cover':''}>`:'';
    const info=preview.meta?`<span class="sl-preview-meta">${E(preview.meta)}</span>`:'';
    let content;
    if(preview.kind==='text'||preview.kind==='setting')content=`<div class="sl-excerpt"><small>${E(preview.label)}</small><p>${E(preview.excerpt.slice(0,260))}</p>${info}</div>`;
    else if(preview.kind==='audio')content=`<div class="sl-audio-preview">${icon('audio')}<strong>${E(preview.label)}</strong><p>${E(preview.excerpt.slice(0,120))}</p>${info}</div>`;
    else if(image)content=image+info;
    else if(preview.kind==='video'&&preview.media)content=`<video class="sl-video-cover" src="${E(preview.media.url)}#t=0.001" preload="metadata" muted playsinline aria-hidden="true"></video>`+info;
    else content=`<div class="sl-excerpt"><small>${E(preview.label)}</small><p>${E(preview.excerpt.slice(0,200))}</p>${info}</div>`;
    const play=preview.media?b(icon('play')+(preview.media.kind==='audio'?'试听':'播放'),'play-media',asset.key,'sl-play-button').replace('<button ','<button aria-label="'+(preview.media.kind==='audio'?'试听':'播放')+E(asset.name)+'" '):'';
    const duration=preview.media?.duration;
    return `<div class="sl-asset-picture sl-preview-${preview.kind}"><a class="sl-preview-link" href="#${assetURL(asset)}" aria-label="查看${E(asset.name)}">${content}</a>${play}${duration?`<span class="sl-media-duration">${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}</span>`:''}</div>`;
  }
  function assetCard(asset,allTags){
    const category=L.categoryOf(asset),color=categoryArt[category]?.[0];
    return `<article class="sl-asset-card" data-asset-key="${E(asset.key)}"><header class="sl-card-top"><span class="sl-category-tag"${color?` style="--sl-category-color:${color}"`:''}>${E(category)}</span>${selectingAssets?`<label class="sl-card-select"><input type="checkbox" data-lib-select="${E(asset.key)}" aria-label="选择${E(asset.name)}" ${selectedAssets.has(asset.key)?'checked':''}></label>`:assetActionMenu(asset)}</header>${cardPreview(asset)}<section><h3><a href="#${assetURL(asset)}" title="${E(asset.name)}">${E(asset.name)}</a></h3><div class="sl-card-tag-row"><p class="sl-card-source" title="${E(sourceLabel(asset)+(asset.ownerName?' · '+asset.ownerName:''))}">${E(L.subcategoryOf(asset))} · ${E(sourceLabel(asset))}</p>${assetTagChips(asset,allTags,true)}${b(icon('plus'),'edit-tags',asset.key,'sl-quick-tag').replace('<button ','<button title="Edit tags" aria-label="编辑'+E(asset.name)+'的标签" ')}</div></section></article>`;
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
    return `<div class="sl-page">${heading(view.assetState==='trash'?'资产回收站':'资产库',view.assetState==='trash'?'恢复后，资产会重新出现在资产库中。':'',view.assetState==='trash'?a('返回资产库','/app/assets'):'')}${warning()}
      <div class="sl-toolbar sl-compact-toolbar">
        ${CimoraSearchField.render(`<input data-lib-search="assetSearch" aria-label="搜索资产" value="${E(view.assetSearch)}" placeholder="搜索资产名称、内容或项目">`, "sl-search")}
        ${b('类型'+(typeCount?' · '+typeCount:'')+icon('down'),'type-filter','','sl-filter-button'+(typeCount?' is-active':'')).replace('<button ','<button aria-label="资产类型" aria-haspopup="dialog" aria-expanded="false" ')}
        ${b('标签'+(tagCount?' · '+tagCount:'')+icon('down'),'tag-filter','','sl-filter-button'+(tagCount?' is-active':'')).replace('<button ','<button aria-haspopup="dialog" aria-expanded="false" ')}
        <span class="sl-result-count" role="status">${list.length} 项资产</span>
        ${b(`<span class="sl-bulk-label">${bulkLabel}</span><span class="sl-bulk-short" aria-hidden="true">${selectingAssets?'Cancel':'Bulk'}</span>`,'toggle-bulk','','sl-filter-button').replace('<button ',`<button aria-label="${bulkLabel}" aria-pressed="${selectingAssets}" `)}
      </div>
      ${activeFilters(index)}${bulkTagBar()}<div class="sl-asset-grid" aria-label="资产列表">${list.map(asset=>assetCard(asset,index.meta.tags||[])).join('')||empty('没有符合条件的资产','清空条件，或试试其他类型、标签与关键词。')}</div></div>`;
  }
  function profileText(value){if(!value)return '';const labels={identity:'身份',relation:'人物关系',state:'当前状态',intro:'人物介绍',traits:'性格特点',story:'角色经历',notes:'补充说明',role:'剧情角色',age:'年龄',gender:'性别',background:'经历背景',appearance:'外貌特征',personality:'性格',motivation:'人物动机'};const entries=Object.entries(value).filter(([key,item])=>labels[key]&&typeof item==='string'&&item.trim());return entries.length?`<dl class="sl-profile-grid">${entries.map(([key,item])=>`<div><dt>${E(labels[key])}</dt><dd>${E(item)}</dd></div>`).join('')}</dl>`:'';}

  function galleryOf(asset,version=asset.version){
    const entries=Object.entries(version?.images||{main:version?.image||(version===asset.version?asset.image:'')});
    return entries.map(([slot,src])=>({slot,src:L.imageOf(src,asset.owner?.startsWith('comic:'))})).filter((item,i,items)=>item.src&&items.findIndex(other=>other.src===item.src)===i);
  }
  function assetDetail(asset,index){
    if(!asset)return `<div class="sl-page">${backLink()}${empty('未找到这项资产','返回列表查找，或进入来源工作台查看。')}</div>`;
    const owner=index.projects.find(project=>project.key===asset.owner),legacy=asset.key.startsWith('legacy:');
    const isStory=asset.type==='故事文本',active=asset.state==='active',gallery=galleryOf(asset),media=L.mediaOf(asset);
    const usageEntries=[...asset.usages];
    if(owner&&!usageEntries.some(use=>use.projectKey===owner.key))usageEntries.unshift({projectKey:owner.key,label:owner.title,source:true});
    const sourceTool=asset.tool&&window.ToolCatalog?.find(asset.raw.toolId);
    const sourceAction=active&&sourceTool&&!sourceTool.retired&&!sourceTool.hidden?a(asset.raw.editorDraft?'返回工具继续编辑 ↗':'返回原工具 ↗',asset.url+'?fromAsset='+encodeURIComponent(asset.raw.id)):owner?a('进入来源工作台 ↗',owner.url):asset.raw.resultId?a('打开原工具',asset.url):'';
    const editActions=legacy&&active?C.btn('创建新版本','asset-revise','cm-button ghost',`data-id="${E(asset.id)}"`)+C.btn('引用到当前章节','bind-asset','cm-button primary',`data-id="${E(asset.id)}"`):'';
    const preview=media?`<${media.kind} class="sl-detail-media" controls preload="metadata" src="${E(media.url)}" ${media.kind==='video'&&asset.image?'poster="'+E(asset.image)+'"':''}></${media.kind}>`:asset.image?`<img class="sl-main-image" src="${E(asset.image)}" alt="${E(asset.name)}">`:!isStory?`<div class="sl-media-placeholder"><b aria-hidden="true">${asset.type==='声音'?'♫':'◈'}</b><p>${E(L.subcategoryOf(asset))}</p><small>暂无媒体预览</small></div>`:'';
    const profile=profileText(asset.profile);
    return `<div class="sl-page sl-detail-page">${backLink()}${heading(E(asset.name),E(L.subcategoryOf(asset)+' · '+sourceLabel(asset)),
      (active&&isStory?b('选用故事创作','use-story',asset.key,'primary'):'')+sourceAction+(active?b('更多'+icon('down'),'detail-menu',asset.key):b('恢复资产','restore-asset',asset.key,'primary')))}
      ${warning()}${!active?'<p class="sl-warning">这项资产已移入回收站，恢复后可继续使用。</p>':''}
      <section class="sl-detail-tags"><span>标签</span>${assetTagChips(asset)||'<small>未添加</small>'}${b('＋ 标签','edit-tags',asset.key)}</section>
      <div class="sl-detail-grid"><main class="sl-detail-main">
      ${!isStory?`<section class="sl-panel sl-detail-preview"><h2>内容预览</h2>${preview}${gallery.length>1?`<h3>参考图 <small>${gallery.length}</small></h3><div class="sl-gallery">${gallery.map(item=>`<figure><img src="${E(item.src)}" alt="${E(imageLabel(item.slot))}" loading="lazy"><figcaption>${E(imageLabel(item.slot))}</figcaption></figure>`).join('')}</div>`:''}</section>`:''}
      <section class="sl-panel sl-detail-content"><h2>${isStory?'故事与章节':'资产介绍'}</h2>${asset.description?`<p class="sl-description">${E(asset.description)}</p>`:''}
      ${isStory?asset.episodes.map(ep=>`<details><summary>${E(ep.title)}</summary><p>${E(ep.events||ep.outline||'')}</p><pre>${E(L.body(asset.raw.scripts?.[ep.id])||'本集尚无正文')}</pre></details>`).join(''):profile?`<details><summary>查看完整人物设定</summary>${profile}</details>`:''}
      ${editActions?`<div class="sl-actions">${editActions}</div>`:''}${isStory?`<div class="sl-actions">${b('导出故事 TXT','export-story-txt',asset.key)}${b('导出工程 JSON','export-story-json',asset.key)}</div>`:''}</section></main>
      <aside class="sl-detail-aside"><section class="sl-panel"><h2>资产信息</h2><div class="sl-detail-fact"><span>来源</span><strong>${E(sourceLabel(asset))}</strong></div>${owner?`<div class="sl-detail-fact"><span>来源项目</span>${a(E(owner.title),owner.url)}</div>`:''}
      <details class="sl-detail-disclosure"><summary>关联项目 <span>${usageEntries.length}</span></summary>${usageEntries.length?usageEntries.map(use=>{const project=index.projects.find(project=>project.key===use.projectKey);return `<div class="sl-usage">${project?a(E(use.label||project.title),project.url):E(use.label)}${use.source?'<small>来源项目</small>':use.candidate?'<small>待采用</small>':''}</div>`;}).join(''):'<p>未关联项目</p>'}</details>
      <details class="sl-detail-disclosure"><summary>版本与候选 <span>${asset.versions.length}</span></summary>${asset.versions.length?asset.versions.map((version,i)=>`<div class="sl-version"><div><strong>${E(version.label||'版本 '+(i+1))}</strong><small>${asset.version?.id===version.id?(legacy?(asset.raw.locked?'已锁定':'草稿'):isStory?'已保存':'当前采用'):'历史 / 候选'}</small></div>${b('预览','preview-version',asset.key+'|'+version.id)}</div>`).join(''):'<p>暂无参考版本</p>'}${legacy&&active?C.btn('查看版本变更影响','asset-impact','cm-button ghost',`data-id="${E(asset.id)}"`)+(!asset.raw.locked?C.btn('锁定当前版本','cm-lock-asset','cm-button ghost',`data-id="${E(asset.id)}"`):''):''}</details>
      ${asset.original?`<details class="sl-detail-disclosure"><summary>保留的原文</summary><pre>${E(asset.original)}</pre></details>`:''}</section></aside></div></div>`;
  }
  function storyDialog(asset){
    S.modal('选用故事开始创作',`<p>${E(asset.name)} · 复制已保存的故事快照，保留原文与人物设定。</p><label>使用范围<select id="sl-story-episode"><option value="">整部故事</option>${asset.episodes.map(ep=>`<option value="${E(ep.id)}">${E(ep.title)}${L.body(asset.raw.scripts?.[ep.id]).trim()?'':' · 尚无正文'}</option>`).join('')}</select></label><label>创作类型<select id="sl-story-kind"><option value="comic">漫画</option><option value="video">视频</option></select></label><p>新建独立工程，已有作品不会被覆盖。</p>`,b('创建关联作品','confirm-story',asset.key,'primary'));
  }
  const oldRoute=C.route;
  C.route=ctx=>{
    if(ctx.parts[0]!=='app'||ctx.parts[1]!=='assets'||ctx.params.has('legacy'))return oldRoute(ctx);
    clearTimeout(searchTimer);closePopover(false);
    try{
      const params=new URLSearchParams(ctx.params);
      if(ctx.parts[2])params.set('item','legacy:'+decodeURIComponent(ctx.parts[2]));
      return assets({...ctx,parts:['app','assets'],params});
    }catch(error){return `<div class="sl-page">${heading('资产库','整理并查找保存的创作成果。')}<p class="sl-warning" role="alert">${E(error.message)}。原始记录未修改，请保留浏览器数据。</p>${a('返回创作空间','/app')}</div>`;}
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
      case 'detail-menu':{const asset=findAsset(key);if(!asset)throw Error('资产不存在');togglePanel(trigger,'更多操作',b('移入回收站','trash-asset',key,'sl-menu-item'));break;}
      case 'play-media':{const asset=findAsset(key),media=L.mediaOf(asset);if(!media)throw Error('这项资产尚无可播放的媒体文件');closePopover();S.modal(asset.name,`<${media.kind} class="sl-media-player" controls autoplay preload="metadata" src="${E(media.url)}" ${media.kind==='video'&&asset.image?'poster="'+E(asset.image)+'"':''}></${media.kind}><p class="sl-footnote">${E(L.subcategoryOf(asset))}</p>`,'',true);break;}
      case 'filter-tag':{const selected=view.assetTags.split(',').filter(Boolean);view.assetTags=key==='all'?'':key==='untagged'?'untagged':(selected.includes(key)?selected.filter(id=>id!==key):[...selected.filter(id=>id!=='untagged'),key]).join(',');selectedAssets.clear();S.route(filterURL());break;}
      case 'toggle-bulk':rememberScroll();selectingAssets=!selectingAssets;selectedAssets.clear();S.render();break;
      case 'select-visible':rememberScroll();selectedAssets=new Set([...document.querySelectorAll('[data-lib-select]')].map(node=>node.dataset.libSelect));S.render();break;
      case 'clear-selection':rememberScroll();selectedAssets.clear();S.render();break;
      case 'edit-tags':tagEditor([key],'replace',trigger);break;
      case 'bulk-add-tags':case 'bulk-remove-tags':if(!selectedAssets.size)throw Error('请先选择资产');tagEditor([...selectedAssets],action==='bulk-add-tags'?'add':'remove',trigger);break;
      case 'save-tags':return saveTagEditor();
      case 'manage-tags':closePopover();tagManager();break;
      case 'create-tag':mutateTags(value=>L.createTag(value,S.id('tag'),document.getElementById('sl-new-tag').value));S.render();tagManager();break;
      case 'rename-tag':tagRename(key);break;
      case 'confirm-rename-tag':mutateTags(value=>L.renameTag(value,key,document.getElementById('sl-tag-name').value));S.render();tagManager();break;
      case 'merge-tag':tagMerge(key);break;
      case 'confirm-merge-tag':mutateTags(value=>L.mergeTag(value,key,document.getElementById('sl-merge-target').value));S.render();tagManager();break;
      case 'delete-tag':{const tag=meta().tags.find(tag=>tag.id===key);if(!tag)throw Error('标签不存在');S.modal('删除标签',`<p>删除「${E(tag.name)}」只移除分类标记，资产与项目引用保留。</p>`,b('确认删除标签','confirm-delete-tag',key,'primary'));break;}
      case 'confirm-delete-tag':mutateTags(value=>L.deleteTag(value,key));S.render();tagManager();break;
      case 'trash-asset':{closePopover();const asset=findAsset(key);if(!asset||asset.state!=='active')throw Error('资产已不在当前列表，请刷新后查看。');S.modal('删除资产',`<p>确定删除资产「${E(asset.name)}」吗？</p><p>删除后将移入回收站，可随时恢复。关联项目中的内容与已采用版本保持不变。</p>`,b('取消','cancel-trash-asset')+b('确认','confirm-trash-asset',key,'primary'));break;}
      case 'cancel-trash-asset':S.close();break;
      case 'confirm-trash-asset':case 'restore-asset':changeMeta(value=>{if(!findAsset(key))throw Error('资产不存在');value.assets[key]={...value.assets[key],state:action==='restore-asset'?'active':'trash',deletedAt:action==='restore-asset'?null:new Date().toISOString()};});S.close();S.render();S.toast(action==='restore-asset'?'资产已恢复':'已移入回收站，可随时恢复');break;
      case 'preview-version':{
        const split=key.lastIndexOf('|'),asset=findAsset(key.slice(0,split)),version=asset?.versions.find(version=>String(version.id)===key.slice(split+1));
        if(!version)throw Error('版本不存在');
        const gallery=galleryOf(asset,version);
        S.modal('版本预览 · '+asset.name,`<p>${E(version.label||'保存版本')}</p>${gallery.length?`<div class="sl-gallery">${gallery.map(item=>`<figure><img src="${E(item.src)}" alt="${E(imageLabel(item.slot))}"><figcaption>${E(imageLabel(item.slot))}</figcaption></figure>`).join('')}</div>`:''}<p>${E(version.description||asset.description)}</p><p class="sl-footnote">预览不改变当前采用版本。</p>`,'',true);break;
      }
      case 'use-story':storyDialog(findAsset(key));break;
      case 'confirm-story':{
        guard();const asset=findAsset(key),episodeId=document.getElementById('sl-story-episode').value,kind=document.getElementById('sl-story-kind').value;
        if(!asset||asset.state!=='active')throw Error('该故事当前不可用');
        const selected=asset.episodes.filter(ep=>!episodeId||ep.id===episodeId);
        if(!selected.length||selected.some(ep=>!L.body(asset.raw.scripts?.[ep.id]).trim()))throw Error('所选范围还没有完整正文，请先补充故事');
        C.storyAssetBridge.handoff(asset.raw,episodeId,kind);S.close();break;
      }
      case 'export-story-txt':case 'export-story-json':{
        const asset=findAsset(key);if(!asset)throw Error('故事不存在');
        const json=action.endsWith('json');S.download(json?ScriptStudio.exportJSON(asset.raw):ScriptStudio.exportText(asset.raw),asset.name+(json?'-故事工程.json':'-故事.txt'),json?'application/json':'text/plain;charset=utf-8');break;
      }
    }
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-lib]');if(!button)return;
    event.preventDefault();
    try{await handle(button.dataset.lib,button.dataset.key,button);}catch(error){S.toast(error.message);}
  });
  document.addEventListener('item-action',async event=>{
    if(!event.target.closest('.sl-asset-card'))return;
    const {id,action}=event.detail;
    const asset=findAsset(id);
    if(!asset)return;
    if(action==='details'){rememberScroll();S.route(assetURL(asset));return;}
    const assetAction={tags:'edit-tags',archive:'trash-asset',restore:'restore-asset'}[action];
    if(!assetAction)return;
    try{await handle(assetAction,id,event.target.querySelector('.cm-item-actions-trigger'));}catch(error){S.toast(error.message);}
  });
  function updateFilterCount(){const count=floating?.element.querySelector('[data-filter-count]');if(count)count.textContent='已选 '+floating.element.querySelectorAll('[data-lib-type-filter]:checked,[data-lib-tag-filter]:checked').length+' 项';}
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
      const counter=document.getElementById('sl-selected-count');if(counter)counter.textContent='已选择 '+selectedAssets.size+' 项';
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
  document.addEventListener('error',event=>{if(event.target.matches?.('.sl-media-player'))S.toast('媒体暂时无法加载，请在来源工作台检查文件');},true);
  window.StudioLibrary={load,findAsset,meta,changeMeta,guard,topActions};
})();
