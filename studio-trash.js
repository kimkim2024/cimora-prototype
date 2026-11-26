/* Visual trash. Reading and previewing never reopen or modify a workbench. */
(()=>{
  'use strict';
  const S=Site,C=Cimora,L=StudioLibrary,M=StudioLibraryModel,P=StudioProjects,E=S.esc;
  const names={story:'Story',comic:'Comic',video:'Video'},list=value=>Array.isArray(value)?value:[];
  const glyphs={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',down:'<path d="m7 10 5 5 5-5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',restore:'<path d="M4 10a8 8 0 1 1 1 9M4 4v6h6M12 8v5l3 2"/>',trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',story:'<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6"/>',comic:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 11h18M12 3v8M9 11v10"/>',video:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 6 4-6 4z"/>',audio:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',play:'<path d="m9 5 11 7-11 7z"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',check:'<path d="m5 12 4 4 10-10"/>'};
  const icon=name=>`<svg class="st-trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]||glyphs.image}</svg>`;
  const button=(text,action,key='',cls='ghost',extra='')=>`<button type="button" class="cm-button ${cls}" data-trash="${action}" data-key="${E(key)}" ${extra}>${text}</button>`;
  const title=item=>item.title||item.name||'Untitled item';
  const defaults=()=>({tab:'projects',search:'',types:[],tags:[]});
  let view=defaults(),selected=new Set(),selecting=false,active=false,floating=null,pending=null,notice=null,timer,scrollTop=0,focusAfter='';
  const collection=(index,tab=view.tab)=>index[tab].filter(item=>item.state==='trash');
  const category=item=>view.tab==='projects'?(names[item.kind]||'project'):M.categoryOf(item);
  function deletedAt(item,index,tab=view.tab){return index.meta[tab]?.[item.key]?.deletedAt||item.deletedAt||item.raw?.deletedAt||'';}
  function dateLabel(value){const date=new Date(value);return value&&Number.isFinite(+date)?new Intl.DateTimeFormat('en-US',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date):'Date unavailable';}
  function filterItems(index,state=view){
    const search=state.search.trim().toLocaleLowerCase();
    return collection(index,state.tab).filter(item=>{
      const type=state.tab==='projects'?item.kind:M.categoryOf(item);
      return (!state.types.length||state.types.includes(type))&&(!search||[title(item),item.description,item.ownerName].join(' ').toLocaleLowerCase().includes(search))&&(state.tab==='projects'||state.tags.every(id=>list(item.tags).includes(id)));
    }).sort((a,b)=>(Date.parse(deletedAt(b,index,state.tab))||0)-(Date.parse(deletedAt(a,index,state.tab))||0)||title(a).localeCompare(title(b),'zh-CN'));
  }
  function url(state=view){const p=new URLSearchParams();p.set('tab',state.tab);if(state.search)p.set('search',state.search);for(const type of state.types)p.append('type',type);for(const tag of state.tags)p.append('tag',tag);return '/app/trash?'+p;}
  function hydrate(ctx){
    const next={tab:ctx.params.get('tab')==='assets'?'assets':'projects',search:ctx.params.get('search')||'',types:[...new Set(ctx.params.getAll('type'))],tags:[...new Set(ctx.params.getAll('tag'))]};
    if(!active||JSON.stringify(next)!==JSON.stringify(view)){selected.clear();pending=null;notice=null;if(next.tab!==view.tab||!active)selecting=false;}
    view=next;active=true;
  }
  function change(next,focus=''){
    closePopover(false);clearTimeout(timer);selected.clear();pending=null;notice=null;view={...view,...next};
    scrollTop=window.scrollY||0;focusAfter=focus;history.replaceState(null,'',location.pathname+'#'+url());S.render();
  }
  function imageOf(asset){const images=asset.version?.images||{},comic=asset.owner?.startsWith('comic:');return M.imageOf(M.categoryOf(asset)==='角色'?(images.front||images.portrait||asset.image||images.main):(asset.image||images.main),comic);}
  function projectImage(item,index){const assets=index.assets.filter(a=>a.owner===item.key&&a.state!=='purged');return assets.map(imageOf).find(Boolean)||'';}
  function previewImage(src){return `<img src="${E(src)}" alt="" loading="lazy" data-trash-image>`;}
  function cardMedia(item,index){
    if(view.tab==='projects'){const image=projectImage(item,index);return {kind:image?'image':'compact',html:image?previewImage(image):`<span class="st-trash-project-symbol">${icon(item.kind)}<span>${E(names[item.kind]||'Creative')} project</span></span>`};}
    const preview=M.previewOf(item),image=imageOf(item),media=preview.media;
    if(preview.kind==='audio')return {kind:'audio',html:`<span class="st-trash-audio-symbol">${icon('audio')}</span><strong>${E(L.label(preview.label))}</strong><span class="st-trash-media-note">${media?'Listen to preview':'No audio file'}</span>`};
    if(image)return {kind:'image',html:previewImage(image)+(media?`<span class="st-trash-play">${icon('play')}</span>`:'')};
    if(media?.kind==='video')return {kind:'video',html:`<video src="${E(media.url)}#t=0.001" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1" data-trash-video></video><span class="st-trash-play">${icon('play')}</span>`};
    return {kind:'text',html:`<span class="st-trash-excerpt-label">${icon(preview.kind==='text'?'story':preview.kind==='video'?'video':'image')}${E(L.label(preview.label))}</span><span class="st-trash-excerpt">${E(preview.excerpt.slice(0,260))}</span>`};
  }
  function card(item,index){
    const key=item.key,media=cardMedia(item,index),label=title(item),chosen=selected.has(key),date=deletedAt(item,index);
    return `<article class="st-trash-card${chosen?' is-selected':''}" data-trash-card="${E(key)}"><header><span class="st-trash-kind">${E(L.label(category(item)))}</span>${selecting?`<label class="st-trash-select"><input type="checkbox" data-trash-select="${E(key)}" aria-label="Select ${E(label)}" ${chosen?'checked':''}></label>`:button(icon('more'),'menu',key,'st-trash-icon-button',`aria-label="${E(label)} actions" aria-haspopup="menu" aria-expanded="false"`)}</header>${button(media.html,'preview',key,`st-trash-card-media st-trash-media-${media.kind}`,`aria-label="Preview ${E(label)}"`)}<div class="st-trash-card-copy"><h2>${button(E(label),'preview',key,'st-trash-title',`title="${E(label)}"`)}</h2><footer><time ${date&&Number.isFinite(Date.parse(date))?`datetime="${E(date)}"`:''}>${dateLabel(date)}</time>${button(icon('restore')+'Restore','restore',key,'st-trash-restore',`aria-label="Restore ${E(label)}"`)}</footer></div></article>`;
  }
  function activeFilters(index){
    const chips=[...view.types.map(value=>({value,field:'types',name:view.tab==='projects'?names[value]||value:L.label(value)})),...view.tags.map(value=>({value,field:'tags',name:index.meta.tags?.find(t=>t.id===value)?.name||'Deleted tag'}))];
    return chips.length?`<div class="st-trash-filter-chips" aria-label="Active filters">${chips.map(chip=>button(E(chip.name)+icon('close'),'remove-filter',chip.value,'st-trash-filter-chip',`data-field="${chip.field}" aria-label="Remove ${E(chip.name)} filter"`)).join('')}${button('Clear filters','reset','','st-trash-text-button')}</div>`:'';
  }
  function bulkBar(items){return selecting?`<div class="st-trash-bulk" aria-label="Bulk actions"><strong id="st-trash-selected-count" role="status">${selected.size} selected</strong><label class="st-trash-select-all"><input type="checkbox" data-trash-all aria-label="Select all results" ${items.length&&selected.size===items.length?'checked':''} ${!items.length?'disabled':''}>Select all results</label><div>${button('Restore selected','restore-selected','','primary',`data-trash-needs-selection ${!selected.size?'disabled':''}`)}${button('Delete permanently','purge-selected','','st-trash-danger',`data-trash-needs-selection ${!selected.size?'disabled':''}`)}${button('Cancel','select-cancel')}</div></div>`:'';}
  function emptyState(index){const filtered=view.search||view.types.length||view.tags.length,asset=view.tab==='assets';return `<div class="sl-empty st-trash-empty">${icon(filtered?'search':'trash')}<h2>${filtered?'No matching items':asset?'No deleted assets':'No deleted projects'}</h2><p>${filtered?'Try a different keyword or clear the filters.':asset?'Deleted assets appear here.':'Deleted projects appear here.'}</p>${filtered?button('Clear filters','reset'):C.link(asset?'Back to Asset Library':'Back to My Projects',asset?'/app/assets':'/app/projects','cm-button ghost')}</div>`;}
  function noticeHTML(){return notice?`<div class="st-trash-notice${notice.error?' is-error':''}" role="${notice.error?'alert':'status'}"><span>${icon(notice.error?'trash':'check')}${E(notice.message)}</span>${notice.href?C.link(notice.label,notice.href,'st-trash-notice-link'):''}${button(icon('close'),'dismiss-notice','','st-trash-icon-button','aria-label="Dismiss notification"')}</div>`:'';}
  function render(ctx){
    hydrate(ctx);const index=L.load(),items=filterItems(index),allowed=new Set(items.map(i=>i.key));selected=new Set([...selected].filter(key=>allowed.has(key)));
    return `<div class="sl-page st-trash-page"><header class="sl-heading"><div><h1>Trash</h1><p>Restore or permanently delete items in Trash.</p></div></header><div class="st-trash-tabs cm-segment-group" role="tablist" aria-label="Trash contents">${[['projects','Projects'],['assets','Assets']].map(([key,name])=>button(`${name}<span>${collection(index,key).length}</span>`,'tab',key,'st-trash-tab',`role="tab" id="st-trash-tab-${key}" aria-controls="st-trash-results" aria-selected="${view.tab===key}" tabindex="${view.tab===key?'0':'-1'}"`)).join('')}</div><div id="st-trash-results" role="tabpanel" aria-labelledby="st-trash-tab-${view.tab}"><div class="st-trash-toolbar">${CimoraSearchField.render(`<input data-trash-search aria-label="Search deleted ${view.tab==='assets'?'assets':'projects'}" placeholder="Search ${view.tab==='assets'?'asset':'project'} by name or content" value="${E(view.search)}">`, "sl-search")}<div class="st-trash-filter-buttons">${button('Type'+(view.types.length?` <span>${view.types.length}</span>`:'')+icon('down'),'filter','types',`st-trash-filter-button${view.types.length?' is-active':''}`,'aria-haspopup="dialog" aria-expanded="false"')}${view.tab==='assets'?button('Tags'+(view.tags.length?` <span>${view.tags.length}</span>`:'')+icon('down'),'filter','tags',`st-trash-filter-button${view.tags.length?' is-active':''}`,'aria-haspopup="dialog" aria-expanded="false"'):''}</div>${!selecting?button('Select multiple','select-start','','ghost st-trash-batch-button',items.length?'':'disabled'):''}</div>${activeFilters(index)}${noticeHTML()}${bulkBar(items)}<div class="st-trash-results-meta"><span role="status">${items.length} ${view.tab==='assets'?'asset':'project'}${items.length===1?'':'s'}</span><span>Most recently deleted first</span></div><div class="st-trash-grid${view.tab==='projects'?' st-trash-project-grid':''}" aria-label="Deleted ${view.tab==='assets'?'assets':'projects'}">${items.map(item=>card(item,index)).join('')||emptyState(index)}</div></div></div>`;
  }
  function getItem(key,tab=view.tab){const index=L.load(),item=collection(index,tab).find(i=>i.key===key);if(!item)throw Error('This item is no longer in Trash. Refresh and try again.');return {index,item};}
  function paragraph(text){return `<div class="st-trash-preview-text">${E(text)}</div>`;}
  function projectText(item){
    const raw=item.raw||{},chapters=list(raw.storyChapters).length?raw.storyChapters:list(raw.chapters).length?raw.chapters:list(raw.episodes).length?raw.episodes:list(item.episodes);
    const texts=chapters.map((chapter,i)=>{
      const script=raw.scripts?.[chapter.id]||S.state.cimora.projects[item.id]?.[chapter.id]?.script;
      const text=window.StudioWorkspaceModel?.text?.(item,chapter.id)||chapter.body||chapter.text||(typeof script==='string'?script:M.body(script))||chapter.summary||'';
      return text?`<details class="st-trash-chapter" ${i===0?'open':''}><summary>${E(chapter.title||chapter.name||'Chapter '+(i+1))}</summary>${paragraph(text)}</details>`:'';
    }).filter(Boolean);
    return texts.join('')||paragraph(item.description||raw.story||raw.original||raw.synopsis||'No preview available. Restore the item to open it.');
  }
  function previewBody(item,index,tab=view.tab){
    let content='';
    if(tab==='projects'){const image=projectImage(item,index);content=(image?`<img class="st-trash-preview-image" src="${E(image)}" alt="${E(title(item))}" data-trash-image>`:'')+projectText(item);}
    else{
      const preview=M.previewOf(item),media=preview.media,comic=item.owner?.startsWith('comic:');
      const images=[...new Set([imageOf(item),item.image,...Object.values(item.version?.images||{}),...list(item.raw?.images).map(i=>typeof i==='string'?i:i.src)].map(src=>M.imageOf(src,comic)).filter(Boolean))];
      if(media)content=`<${media.kind} class="st-trash-preview-player" controls preload="metadata" ${media.kind==='video'?'playsinline':''} src="${E(media.url)}" data-trash-player></${media.kind}>`;
      else if(images.length)content=`<div class="st-trash-preview-images">${images.map((src,i)=>`<img class="st-trash-preview-image" src="${E(src)}" alt="${E(title(item))}${images.length>1?' · '+(i+1):''}" loading="lazy" data-trash-image>`).join('')}</div>`;
      if(preview.kind==='text'){
        const chapters=list(item.episodes),bodies=chapters.map((ep,i)=>{const script=item.raw?.scripts?.[ep.id],text=ep.body||ep.text||(typeof script==='string'?script:M.body(script));return text?`<details class="st-trash-chapter" ${i===0?'open':''}><summary>${E(ep.title||'Chapter '+(i+1))}</summary>${paragraph(text)}</details>`:'';}).join('');
        content+=bodies||paragraph(item.description||preview.excerpt);
      }else if(!content)content=paragraph(preview.excerpt)+(preview.kind==='audio'||preview.kind==='video'?'<p class="st-trash-preview-hint">'+E(preview.meta)+'</p>':'');
    }
    return `<div class="st-trash-preview"><p class="st-trash-preview-caption">Read-only preview<span>${E(tab==='projects'?names[item.kind]:L.label(M.categoryOf(item)))} · ${dateLabel(deletedAt(item,index,tab))}</span></p>${content}</div>`;
  }
  function showPreview(key){const {item,index}=getItem(key);closePopover(false);S.modal(title(item),previewBody(item,index),button('Close','close')+button(icon('restore')+(view.tab==='projects'?'Restore project':'Restore asset'),'restore',key,'primary'),true);document.querySelector('#site-modal .dialog')?.classList.add('st-trash-preview-dialog');}
  function closePopover(focus=true){if(!floating)return;const old=floating;floating=null;old.trigger?.setAttribute('aria-expanded','false');old.element.remove();if(focus&&old.trigger?.isConnected)old.trigger.focus();}
  function positionPopover(){if(!floating)return;const {trigger,element}=floating;if(!trigger.isConnected){closePopover(false);return;}const r=trigger.getBoundingClientRect();element.style.left=Math.max(12,Math.min(r.left,window.innerWidth-element.offsetWidth-12))+'px';element.style.top=Math.max(12,Math.min(r.bottom+8,window.innerHeight-element.offsetHeight-12))+'px';}
  function popover(trigger,label,html,field){
    if(floating?.trigger===trigger){closePopover();return;}closePopover(false);
    const element=document.createElement('div');element.className='st-trash-popover'+(field?' st-trash-filter-popover':' st-trash-menu');element.setAttribute('popover','auto');element.setAttribute('role',field?'dialog':'menu');element.setAttribute('aria-label',label);element.innerHTML=html;document.body.append(element);
    floating={element,trigger,field,draft:new Set(field?view[field]:[])};trigger.setAttribute('aria-expanded','true');element.addEventListener('toggle',event=>{if(event.newState==='closed'&&floating?.element===element)closePopover();});
    if(element.showPopover)element.showPopover();else element.classList.add('st-trash-popover-fallback');positionPopover();(element.querySelector('input')||element.querySelector('button'))?.focus();
  }
  function showFilter(trigger,field){
    const index=L.load(),items=collection(index),options=field==='types'?(view.tab==='projects'?Object.entries(names):M.categories.filter(x=>x!=='全部').map(x=>[x,L.label(x)])):list(index.meta.tags).map(t=>[t.id,t.name]);
    const label=field==='types'?'Filter by type':'Filter by tag';
    popover(trigger,label,`<header><strong>${label}</strong>${button(icon('close'),'close-popover','','st-trash-icon-button','aria-label="Close filters"')}</header>${field==='tags'?`${CimoraSearchField.render(`<input class="st-trash-option-search" data-trash-option-search placeholder="Search tags" aria-label="Search Trash tags">`, "st-trash-option-search")}`:''}<p class="st-trash-popover-hint">${field==='types'?'Show items that match any selected type.':'Show items that have every selected tag.'}</p><div class="st-trash-filter-options">${options.map(([key,name])=>{const on=view[field].includes(key),count=items.filter(item=>field==='types'?(view.tab==='projects'?item.kind:M.categoryOf(item))===key:list(item.tags).includes(key)).length;return button(`<span>${E(name)}</span><small>${count}</small><span class="st-trash-chip-close">${icon('close')}</span>`,'toggle-option',key,'st-trash-option',`aria-pressed="${on}" data-option-name="${E(name)}"`);}).join('')}</div><p class="st-trash-option-empty" ${options.length?'hidden':''}>${options.length?'No matching tags':'No tags yet'}</p><footer><span data-trash-option-count>${view[field].length} selected</span>${button('Clear','clear-draft')}${button('Apply','apply-filter','','primary')}</footer>`,field);
  }
  function updateDraft(){if(!floating?.field)return;for(const b of floating.element.querySelectorAll('[data-trash="toggle-option"]'))b.setAttribute('aria-pressed',floating.draft.has(b.dataset.key));floating.element.querySelector('[data-trash-option-count]').textContent=floating.draft.size+' selected';}
  function refreshSelection(){
    const items=filterItems(L.load()),allowed=new Set(items.map(i=>i.key));selected=new Set([...selected].filter(k=>allowed.has(k)));
    document.querySelectorAll('[data-trash-select]').forEach(input=>{input.checked=selected.has(input.dataset.trashSelect);input.closest('.st-trash-card').classList.toggle('is-selected',input.checked);});
    const count=document.getElementById('st-trash-selected-count');if(count)count.textContent=selected.size+' selected';
    const all=document.querySelector('[data-trash-all]');if(all){all.checked=items.length>0&&selected.size===items.length;all.indeterminate=selected.size>0&&selected.size<items.length;}
    document.querySelectorAll('[data-trash-needs-selection]').forEach(button=>button.disabled=!selected.size);
  }
  function currentSelection(){const allowed=new Set(filterItems(L.load()).map(i=>i.key));return [...selected].filter(k=>allowed.has(k));}
  function confirmPurge(keys){
    const index=L.load(),items=collection(index).filter(i=>keys.includes(i.key));if(!items.length)throw Error('Select items that are still in Trash.');
    closePopover(false);pending={tab:view.tab,keys:items.map(i=>i.key)};
    S.modal('Delete permanently'+(items.length===1?' this item?':` ${items.length} items?`),`<div class="st-trash-confirm"><p>This permanently deletes the selected ${view.tab==='projects'?'projects':'assets'} and cannot be undone.</p><ul>${items.map(i=>`<li>${E(title(i))}</li>`).join('')}</ul><p class="st-trash-preview-hint">${view.tab==='projects'?'Saved assets and linked projects are preserved.':'Versions already used in projects are preserved.'}</p></div>`,button('Cancel','close')+button('Delete permanently'+(items.length>1?' '+items.length+' selected':''),'confirm-purge','','st-trash-danger-solid'));
    document.querySelector('#site-modal .dialog')?.classList.add('st-trash-confirm-dialog');
    // Destructive dialogs open on Cancel, never on the irreversible action.
    requestAnimationFrame(()=>document.querySelector('#site-modal [data-trash="close"]')?.focus());
  }
  function operate(keys,operation,tab=view.tab){
    if(!keys.length)throw Error('Select an item first.');L.guard();const unique=[...new Set(keys)],success=[],failed=[],skipped=[];let firstError='';
    for(let i=0;i<unique.length;i++){
      const key=unique[i];try{
        const item=L.load()[tab].find(item=>item.key===key);if(!item||item.state!=='trash'){skipped.push(key);continue;}
        if(operation==='purge'){if(tab==='projects')P.purgeProject(key);else P.purgeAsset(key);}
        else if(tab==='projects')P.setState(key,'active');
        else L.changeMeta(meta=>{if(meta.assets[key]?.state!=='trash')throw Error('The asset status changed. Refresh and try again.');meta.assets[key]={...meta.assets[key],state:'active',deletedAt:null};});
        success.push({key,item});selected.delete(key);
      }catch(error){firstError=error.message;failed.push(...unique.slice(i));break;}
    }
    const verb=operation==='purge'?'Permanently deleted':'Restored',kind=tab==='projects'?'project':'asset';
    const message=[success.length?`${verb} ${success.length} ${kind}${success.length===1?'':'s'}`:'',skipped.length?`${skipped.length} items skipped because their status changed`:'',failed.length?`${failed.length} items could not be processed: ${firstError}`:''].filter(Boolean).join(' · ');
    notice={message,error:!!failed.length};
    if(success.length&&operation==='restore'){notice.label=success.length===1?'View '+kind:(tab==='projects'?'View My Projects':'View Asset Library');notice.href=success.length===1?(tab==='projects'?P.resume(success[0].item):'/app/assets?item='+encodeURIComponent(success[0].key)):(tab==='projects'?'/app/projects':'/app/assets');}
    pending=null;S.close();closePopover(false);scrollTop=window.scrollY||0;focusAfter='.st-trash-notice-link, .st-trash-notice button';S.render();S.toast(message);
    return {success:success.map(i=>i.key),failed,skipped};
  }
  function handle(action,key,trigger){
    if(action==='tab'){selecting=false;change({tab:key==='assets'?'assets':'projects',search:'',types:[],tags:[]},'#st-trash-tab-'+key);return;}
    if(action==='filter'){showFilter(trigger,key);return;}
    if(action==='toggle-option'){if(!floating?.field)return;floating.draft.has(key)?floating.draft.delete(key):floating.draft.add(key);updateDraft();return;}
    if(action==='clear-draft'){floating?.draft.clear();updateDraft();return;}
    if(action==='apply-filter'){if(!floating?.field)return;const field=floating.field,values=[...floating.draft];change({[field]:values},`[data-trash="filter"][data-key="${field}"]`);return;}
    if(action==='remove-filter'){const field=trigger.dataset.field;if(['types','tags'].includes(field))change({[field]:view[field].filter(value=>value!==key)},'[data-trash="filter"]');return;}
    if(action==='reset'){change({search:'',types:[],tags:[]},'[data-trash-search]');return;}
    if(action==='close-popover'){closePopover();return;}
    if(action==='menu'){getItem(key);popover(trigger,'Item actions',button('Read-only preview','preview',key,'st-trash-menu-item','role="menuitem"')+button('Delete permanently','purge',key,'st-trash-menu-item st-trash-danger','role="menuitem"'));return;}
    if(action==='preview'){showPreview(key);return;}
    if(action==='restore'){operate([key],'restore');return;}
    if(action==='purge'){confirmPurge([key]);return;}
    if(action==='restore-selected'){operate(currentSelection(),'restore');return;}
    if(action==='purge-selected'){confirmPurge(currentSelection());return;}
    if(action==='confirm-purge'){if(!pending||pending.tab!==view.tab)throw Error('Select items to delete again.');operate(pending.keys,'purge',pending.tab);return;}
    if(action==='close'){pending=null;S.close();return;}
    if(action==='select-start'||action==='select-cancel'){selecting=action==='select-start';selected.clear();scrollTop=window.scrollY||0;focusAfter=selecting?'[data-trash-all]':'[data-trash="select-start"]';S.render();return;}
    if(action==='dismiss-notice'){notice=null;document.querySelector('.st-trash-notice')?.remove();document.querySelector('[data-trash-search]')?.focus();}
  }
  const oldRoute=C.route;
  C.route=ctx=>{
    closePopover(false);clearTimeout(timer);
    if(ctx.parts[0]==='app'&&ctx.parts[1]==='assets'&&ctx.params.get('assetState')==='trash'&&!ctx.params.has('item')){
      const p=new URLSearchParams({tab:'assets'});if(ctx.params.get('assetSearch'))p.set('search',ctx.params.get('assetSearch'));for(const type of (ctx.params.get('assetType')||'').split(',').filter(x=>x&&x!=='全部'))p.append('type',M.normalizeCategory(type));for(const tag of (ctx.params.get('assetTags')||'').split(',').filter(Boolean))p.append('tag',tag);
      Object.assign(ctx,{path:'/app/trash',parts:['app','trash'],params:p});history.replaceState(null,'',location.pathname+'#/app/trash?'+p);
    }
    if(ctx.parts[0]==='app'&&ctx.parts[1]==='trash'){
      try{return render(ctx);}catch(error){return `<div class="sl-page st-trash-page"><h1>Trash could not be loaded</h1><p role="alert">${E(error.message)}</p>${button('Try again','retry')}</div>`;}
    }
    active=false;selected.clear();selecting=false;notice=null;pending=null;return oldRoute(ctx);
  };
  const oldAfter=C.afterRender;
  C.afterRender=ctx=>{oldAfter(ctx);if(ctx.parts[0]==='app'&&ctx.parts[1]==='trash'){document.body.classList.add('studio-library-page');refreshSelection();if(scrollTop){window.scrollTo(0,scrollTop);scrollTop=0;}if(focusAfter){document.querySelector(focusAfter)?.focus({preventScroll:true});focusAfter='';}}};
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-trash]');if(!trigger){if(floating&&!floating.element.contains(event.target))closePopover(false);return;}
    event.preventDefault();if(trigger.disabled)return;try{if(trigger.dataset.trash==='retry'){S.render();return;}handle(trigger.dataset.trash,trigger.dataset.key,trigger);}catch(error){S.toast(error.message);}
  });
  document.addEventListener('change',event=>{const input=event.target;if(input.matches('[data-trash-select]')){if(input.checked)selected.add(input.dataset.trashSelect);else selected.delete(input.dataset.trashSelect);refreshSelection();}else if(input.matches('[data-trash-all]')){selected=input.checked?new Set(filterItems(L.load()).map(i=>i.key)):new Set();refreshSelection();}});
  document.addEventListener('input',event=>{
    const input=event.target;if(input.matches('[data-trash-option-search]')&&floating){let count=0;for(const button of floating.element.querySelectorAll('[data-option-name]')){button.hidden=!button.dataset.optionName.toLocaleLowerCase().includes(input.value.trim().toLocaleLowerCase());if(!button.hidden)count++;}floating.element.querySelector('.st-trash-option-empty').hidden=count>0;positionPopover();return;}
    if(!input.matches('[data-trash-search]'))return;clearTimeout(timer);timer=setTimeout(()=>{if(!input.isConnected)return;const start=input.selectionStart,end=input.selectionEnd;change({search:input.value},'[data-trash-search]');document.querySelector('[data-trash-search]')?.setSelectionRange(start,end);},180);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&floating){event.preventDefault();closePopover();return;}
    const tab=event.target.closest('.st-trash-tab');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();handle('tab',event.key==='Home'?'projects':event.key==='End'?'assets':view.tab==='projects'?'assets':'projects');}
    if(floating&&!floating.field&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const buttons=[...floating.element.querySelectorAll('[role="menuitem"]')],i=buttons.indexOf(document.activeElement);if(i<0)return;event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
  });
  document.addEventListener('error',event=>{const target=event.target;if(target.matches?.('[data-trash-image],[data-trash-video]')){const fallback=document.createElement('span');fallback.className='st-trash-media-unavailable';fallback.textContent='Preview unavailable';target.replaceWith(fallback);}else if(target.matches?.('[data-trash-player]')){const hint=document.createElement('p');hint.className='st-trash-preview-hint';hint.setAttribute('role','alert');hint.textContent='Media could not be loaded. Restore the item to check it in the source workspace.';target.replaceWith(hint);}},true);
  window.addEventListener('resize',positionPopover);window.addEventListener('scroll',positionPopover,true);
  window.StudioTrash={render,filterItems,previewBody};
})();
