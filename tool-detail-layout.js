/* Presentation-only helpers shared by the creative tool workbenches. */
(()=>{
  'use strict';
  const states=new Map();
  const slotMedia=new Map(); // page hash + slot index -> object URL
  const state=()=>{const key=location.hash.split('?')[0];if(!states.has(key))states.set(key,{});return states.get(key);};
  const summary=(text)=>{const node=document.createElement('summary');node.textContent=text;return node;};
  function fold(node,label,key){
    if(!node||node.parentElement?.classList.contains('tw-disclosure'))return;
    const details=document.createElement('details');details.className='tw-disclosure';details.dataset.twDisclosure=key;
    const viewState=state();details.open=!!viewState[key];details.append(summary(label));node.before(details);details.append(node);
    details.addEventListener('toggle',()=>{viewState[key]=details.open;});
  }
  function comparison(host){
    if(host.dataset.twReady)return;host.dataset.twReady='true';
    const figures=[...host.children].filter(node=>node.tagName==='FIGURE');if(figures.length!==2)return;
    const key=host.classList.contains('tc-compare')?'colorView':host.classList.contains('tl-compare')?'letteringView':'optimizeView';
    const bar=document.createElement('div');bar.className='tw-view-switch';bar.setAttribute('role','group');bar.setAttribute('aria-label','预览方式');
    const buttons=['原图','处理结果','并排对比'].map((label,index)=>{
      const button=document.createElement('button');button.type='button';button.className='cm-button ghost';button.textContent=label;
      button.addEventListener('click',()=>select(index));bar.append(button);return button;
    });
    function select(index){state()[key]=index;host.dataset.twView=index===2?'compare':'single';figures.forEach((figure,i)=>{figure.hidden=index!==2&&index!==i;});buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));}
    host.before(bar);select(state()[key]??(figures[1].querySelector('img')?1:0));
  }
  function characterGallery(host){
    if(host.dataset.twReady)return;host.dataset.twReady='true';
    const figures=[...host.querySelectorAll('figure')];if(!figures.length)return;
    const stage=document.createElement('figure');stage.className='tw-character-stage';
    const image=document.createElement('img'),caption=document.createElement('figcaption');stage.append(image,caption);host.before(stage);
    host.setAttribute('role','group');host.setAttribute('aria-label','角色视图');
    const buttons=figures.map((figure,index)=>{
      const button=document.createElement('button');button.type='button';button.className='tw-character-thumb';
      const source=figure.querySelector('img');button.setAttribute('aria-label','查看'+source.alt);button.append(source.cloneNode());
      const text=document.createElement('span');text.textContent=figure.querySelector('figcaption')?.textContent||source.alt;button.append(text);figure.replaceWith(button);
      button.addEventListener('click',()=>select(index));return button;
    });
    function select(index){const thumb=buttons[index].querySelector('img');image.src=thumb.src;image.alt=thumb.alt;caption.textContent=buttons[index].textContent;state().characterView=index;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));}
    select(Math.min(state().characterView||0,buttons.length-1));
  }
  function uploads(page){
    page.querySelectorAll('input[type=file]').forEach(input=>{
      const label=input.closest('label');if(!label||label.dataset.twUpload)return;
      label.dataset.twUpload='true';label.classList.add('tw-upload');if(!label.classList.contains('tm-upload'))label.classList.add('tw-dropzone');
      const hint=document.createElement('span');hint.className='tw-upload-hint';hint.textContent='点击选择或拖入文件';label.append(hint);
      label.addEventListener('dragover',event=>{if(input.disabled)return;event.preventDefault();label.classList.add('is-dragging');});
      label.addEventListener('dragleave',()=>label.classList.remove('is-dragging'));
      label.addEventListener('drop',event=>{
        event.preventDefault();label.classList.remove('is-dragging');if(input.disabled||!event.dataTransfer?.files.length)return;
        const transfer=new DataTransfer();[...event.dataTransfer.files].slice(0,input.multiple?undefined:1).forEach(file=>transfer.items.add(file));
        input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
      });
      input.addEventListener('change',()=>{hint.textContent=input.files?.length?[...input.files].map(file=>file.name).join('、'):'点击选择或拖入文件';});
    });
  }
  function lettering(page){
    const task=page.querySelector('.tl-task'),region=task?.querySelector('.tl-region'),output=page.querySelector('.tw-output'),result=page.querySelector('#ts-result');
    if(!task||!region||!output||!result||!page.querySelector('#tl-target'))return;
    page.classList.add('tw-lettering');
    const section=document.createElement('section');section.className='tw-lettering-canvas';section.setAttribute('aria-label','原图选区');
    const hint=document.createElement('p');hint.className='tw-canvas-hint';hint.textContent='在原图上拖动，框选要替换的文字区域。';section.append(hint,region);
    const controls=document.createElement('div');controls.className='tw-canvas-controls';
    const reset=task.querySelector('[data-ts="region-reset"]'),status=task.querySelector('[data-tl-region-status]');
    if(reset)controls.append(reset);if(status)controls.append(status);section.append(controls);
    result.before(section);
    const nav=document.createElement('div');nav.className='tw-view-switch';nav.setAttribute('role','group');nav.setAttribute('aria-label','排字工作区');
    const ready=!!result.querySelector('.tl-compare'),viewState=state(),resultImage=result.querySelector('.tl-compare figure:last-child img')?.getAttribute('src');
    const newResult=!!resultImage&&resultImage!==viewState.letteringResult;viewState.letteringResult=resultImage;
    const buttons=['原图选区','排字结果'].map((label,index)=>{const button=document.createElement('button');button.type='button';button.className='cm-button ghost';button.textContent=label;button.disabled=index===1&&!ready;button.addEventListener('click',()=>select(index));nav.append(button);return button;});
    section.before(nav);
    function select(index){viewState.letteringMode=index;section.hidden=index===1;result.hidden=index===0;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));}
    select(newResult?1:ready?(viewState.letteringMode??1):0);
    task.querySelectorAll(':scope>p').forEach((node,index)=>{if(index<2)node.remove();});
    const title=output.querySelector('h2');if(title)title.textContent='画面与排字';
  }
  function contentLayout(page){
    // Identify result placeholders without changing the dimensions of actual media.
    const output=page.querySelector('.tw-output');
    const empty=output?.querySelector('.td-empty,.tc-empty,.pn-empty,.perf-empty,.stk-empty,.tm-empty,.tr-empty,.cut-empty,.opt-empty,.vo-empty,.bgm-empty,.ts-empty');
    if(output){output.classList.toggle('tw-awaiting',!!empty);empty?.classList.add('tw-result-empty');}
    page.querySelectorAll('.tm-slot-empty').forEach(node=>{node.hidden=true;});
    page.querySelectorAll('.tw-input>label[for]').forEach(label=>{
      const input=page.querySelector('#'+label.htmlFor);
      if(!input||input.parentElement!==label.parentElement||input.previousElementSibling!==label||label.contains(input))return;
      const group=document.createElement('div');group.className='tw-field';label.before(group);group.append(label,input);
    });
    const note=page.querySelector('.tl-task>p:last-child');if(note)fold(note,'排字说明','lettering-help');
    const flow=page.querySelector('.bgm-flow');if(flow)fold(flow,'配乐制作步骤','music-steps');
    const staleInfo=page.querySelector('.td-caption');if(staleInfo)fold(staleInfo,'本版生成描述','draw-prompt');
    const motionInfo=page.querySelector('.tm-caption');if(motionInfo)fold(motionInfo,'本版动作描述','motion-prompt');
    // Remove an illustrative image from the sticker empty state; actual results retain their canvas.
    page.querySelectorAll('.stk-empty>img,.stk-empty>.stk-chips').forEach(node=>node.remove());
  }
  function emptyCanvas(page){
    const output=page.querySelector('.tw-output');
    const empty=output?.querySelector('.td-empty,.tc-empty,.oc-empty,.pn-empty,.perf-empty,.stk-empty,.tm-empty,.tr-empty,.cut-empty,.opt-empty');
    if(!empty)return;
    let stage=empty.parentElement;
    if(!stage.classList.contains('tw-empty-stage')){
      stage=document.createElement('div');stage.className='tw-empty-stage';empty.before(stage);stage.append(empty);
    }
    empty.classList.add('tw-empty-canvas');
    const video=page.matches('.tm-page,.tr-page');
    const source=page.querySelector('.tw-input .tm-slot img,.tw-input video,.tw-input .tc-current img,.tw-input .cut-source-frame img,.tw-input .oc-reference img,.tw-input .td-ref-list img');
    function size(){
      const w=source?.videoWidth||source?.naturalWidth,h=source?.videoHeight||source?.naturalHeight;
      const ratio=w&&h?w/h:video?16/9:1;
      empty.style.setProperty('--tw-empty-ratio',ratio);
      empty.dataset.ratioKnown=String(!!(w&&h));
    }
    source?.addEventListener(source.tagName==='VIDEO'?'loadedmetadata':'load',size);size();
  }
  function mediaWorkspace(page){
    const output=page.querySelector('.tw-output');
    const preview=output?.querySelector(':scope>.td-preview,:scope>video.tm-video,:scope>.tr-screen,:scope>.tl-motion');
    if(!preview||preview.closest('.tw-media-layout'))return;
    const media=preview.matches('video')?preview:preview.querySelector('img,video');if(!media)return;
    const layout=document.createElement('div'),stage=document.createElement('div'),aside=document.createElement('div');
    layout.className='tw-media-layout';stage.className='tw-media-main';aside.className='tw-media-aside';
    // Only result controls move: input fields, headers and pending requests retain their location.
    const controls=[];for(let next=preview.nextElementSibling;next;next=next.nextElementSibling)controls.push(next);
    preview.before(layout);stage.append(preview);aside.append(...controls);layout.append(stage,aside);
    function classify(){
      const width=media.videoWidth||media.naturalWidth,height=media.videoHeight||media.naturalHeight;
      if(!width||!height)return;
      layout.dataset.mediaShape=width/height<.9?'portrait':width/height>1.1?'landscape':'square';
    }
    media.addEventListener(media.tagName==='VIDEO'?'loadedmetadata':'load',classify);classify();
  }
  function enhance(page=document.querySelector('.ts-page')){
    const detail=!!page?.querySelector('.ts-heading a[href="#/app/tools"]');
    document.body.classList.toggle('tool-detail-page',detail);if(!detail)return;
    page.classList.add('tw-detail');
    const workbench=page.querySelector('[class$="-workbench"]');if(workbench){workbench.classList.add('tw-workbench');workbench.children[0]?.classList.add('tw-input');workbench.children[1]?.classList.add('tw-output');}
    lettering(page);contentLayout(page);
    page.querySelectorAll('.tw-input,.tw-output').forEach(panel=>{panel.querySelector('h2')?.classList.add('tw-panel-title');});
    const isMotion=page.classList.contains('tm-page');
    page.querySelectorAll(':scope > p:not([role]):not([id])').forEach((note,index)=>{
      if(!/演示|Demo|本机/.test(note.textContent))return;
      // The demo notice folds away on Image to Motion and is dropped elsewhere.
      if(isMotion)fold(note,'演示说明 · 未接入 AI','demo-'+index);else note.remove();
    });
    // Shared header component: every other tool page reuses Image to Motion's link.
    if(!isMotion){
      const heading=page.querySelector('.ts-heading');
      const current=heading&&[...heading.querySelectorAll('a')].find(a=>/assets/.test(a.getAttribute('href')||''));
      if(current&&!current.classList.contains('tw-asset-link'))current.outerHTML=assetLibraryLink();
    }
    fold(page.querySelector('.oc-profile'),'人物介绍与设定','profile');
    fold(page.querySelector('.oc-profile-dialogue'),'调整人物介绍','profile-edit');
    fold(page.querySelector('.oc-outfit'),'更换服饰与配饰','outfit');
    fold(page.querySelector('.tr-scope'),'修改范围与保留项','scope');
    fold(page.querySelector('.tc-plan'),'本次处理要求','color-plan');
    page.querySelectorAll('.tc-compare,.opt-comparison,.tl-compare').forEach(comparison);
    page.querySelectorAll('.oc-base-board').forEach(characterGallery);
    uploads(page);
    // Sticker opens on a ready character, so its extra sample trigger is redundant.
    // PNGTuber keeps its sample: the slot moves it under the empty panel.
    page.querySelectorAll('[data-sticker="sample"]').forEach(button=>button.remove());
    const samples=new Map();
    page.querySelectorAll('button').forEach(button=>{
      const entry=Object.entries(button.dataset).find(([key,value])=>['draw','tm','tr','sticker','cut','vo','opt'].includes(key)&&['sample','sample-text'].includes(value));
      if(!entry)return;const key=entry.join(':');button.hidden=samples.has(key);if(!button.hidden)samples.set(key,button);
    });
    // Delivery actions remain adjacent to the preview and never replace generate/keep actions.
    page.querySelectorAll('.tw-output button').forEach(button=>{
      if(button.textContent.trim()==='保存到资产库'){
        [...button.parentElement.children].filter(node=>node!==button&&node.tagName==='BUTTON'&&node.textContent.includes('下载')).forEach(node=>{node.classList.remove('primary');node.classList.add('ghost');});
        button.classList.remove('ghost');button.classList.add('primary');button.parentElement.classList.add('tw-delivery-actions');}
    });
    slots(page);
    // Once a slot hosts the sample trigger, the stray one in the header is redundant.
    page.querySelectorAll('[data-png="sample"]').forEach(button=>{if(!button.closest('.tw-slot'))button.remove();});
    menus(page);
    ocPanels(page);
    inkButtons(page);
    backControl(page);
    segmented(page);
    mediaWorkspace(page);emptyCanvas(page);
  }
  /* Buttons that are already ink on white keep their fill on hover; only the
     lift animation changes, so no accent tint creeps in. */
  /* Image to Motion's floating Go Back trigger duplicates the header link, so it
     is removed; every page keeps the original text link plus a small arrow. */
  function backControl(page){
    page.querySelectorAll('.tm-back-button,[data-tm="back"]').forEach(node=>node.remove());
    const link=page.querySelector('.ts-heading a[href="#/app/tools"]');
    if(!link||link.classList.contains('tw-back-link'))return;
    link.classList.add('tw-back-link');
    const icon=svgIcon('<path d="m14 5-7 7 7 7M7 12h14"/>');
    icon.setAttribute('class','tw-back-arrow');
    link.prepend(icon);
  }
  /* Mutual-exclusive option rows adopt Image to Motion's segmented control.
     Content grids (thumbnails, presets, action rows) keep their own layout. */
  const SEGMENTED_SKIP='.oc-base-board,.pn-states,.pn-actions,.pn-background,.perf-presets,.perf-cards,.tr-suggestions,'+
    '.tr-operations,.stk-presets,.stk-card-grid,.vo-examples,.bgm-examples,.pn-suggestions,.tm-page';
  function segmented(page){
    page.querySelectorAll('[aria-pressed]').forEach(button=>{
      const box=button.parentElement;
      if(!box||box.classList.contains('tw-segmented'))return;
      if(box.closest(SEGMENTED_SKIP)||box.closest('.tm-page'))return;
      const kids=[...box.children].filter(child=>child.matches?.('button,[role="button"],[aria-pressed]'));
      if(kids.length<2||kids.length>3)return;
      if(kids.some(child=>child.querySelector('img,video,canvas')))return;
      if(kids.some(child=>!child.hasAttribute('aria-pressed')))return;
      box.classList.add('tw-segmented');
    });
  }
  function inkButtons(page){
    page.querySelectorAll('button,a.cm-button,[role="tab"]').forEach(element=>{
      if(element.classList.contains('tw-menu-button'))return;
      const value=getComputedStyle(element).backgroundColor||'';
      const parts=value.match(/[\d.]+/g);
      if(!parts||parts.length<3)return;
      const alpha=parts.length>3?Number(parts[3]):1;
      if(alpha<0.5)return;
      const [r,g,b]=parts.map(Number);
      const luminance=(0.299*r+0.587*g+0.114*b)/255;
      if(luminance<0.3)element.setAttribute('data-tw-ink','');
      else element.removeAttribute('data-tw-ink');
    });
  }

  /* Upload slot: Image to Motion's empty panel + action row + hover Remove. */
  const ICON_UPLOAD='<path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5"/>';
  const ICON_LIBRARY='<path d="m12 3-9 4.5 9 4.5 9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>';
  const ICON_DOTS='<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>';
  function svgIcon(paths){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.setAttribute('class','tw-slot-icon');
    svg.innerHTML=paths;return svg;
  }
  const slotKey=slot=>location.hash.split('?')[0]+'#'+(slot.dataset.twIndex||'0');
  function paintSlot(slot){
    const refs=slot.tw;if(!refs)return;
    const url=slotMedia.get(slotKey(slot));
    // Compare before writing: idempotent so the observer never sees phantom edits.
    const hide=(node,value)=>{if(node&&node.hidden!==value)node.hidden=value;};
    hide(refs.sample,!!url);
    if(url){
      if(refs.image.getAttribute('src')!==url)refs.image.src=url;
      hide(refs.image,false);hide(refs.media,false);hide(refs.empty,true);
    }else{
      if(refs.image.hasAttribute('src'))refs.image.removeAttribute('src');
      hide(refs.image,true);hide(refs.media,true);hide(refs.empty,false);
    }
  }
  /* Saved images available in the Asset Library, flattened to one entry per frame. */
  function assetSources(){
    const result=[],seen=new Set(),L=window.StudioLibraryModel;
    let assets=[];
    try{assets=window.StudioLibrary?.load()?.assets||[];}catch{assets=[];}
    for(const asset of assets){
      if(asset.state&&asset.state!=='active')continue;
      if(L?.categoryOf&&!['角色','场景','道具','图片与漫画'].includes(L.categoryOf(asset)))continue;
      const frames=Object.entries(asset.version?.images||{});
      if(asset.image)frames.unshift(['image',asset.image]);
      for(const [part,value] of frames){
        const src=L?.imageOf?L.imageOf(value,asset.owner?.startsWith('comic:')):value;
        if(!src||typeof src!=='string'||seen.has(src))continue;
        seen.add(src);result.push({key:asset.key+':'+part,name:asset.name||'Untitled image',src});
      }
    }
    return result;
  }
  let libraryPicker=null;
  function openLibrary(slot){
    const site=window.Site;
    if(!site?.modal)return;
    const entries=assetSources();
    const esc=value=>String(value).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
    site.modal('Asset Library',
      entries.length
        ? `<div class="tw-picker"><div class="tw-picker-grid">${entries.map((entry,index)=>`<button type="button" class="tw-picker-choice" data-tw-asset="${index}"><img src="${esc(entry.src)}" alt="" loading="lazy"><span>${esc(entry.name)}</span></button>`).join('')}</div></div>`
        : '<div class="tw-picker"><p class="tw-picker-empty">No image assets yet. Save an image to the Asset Library first.</p></div>',
      '<button type="button" class="cm-button ghost" data-tw-asset="cancel">Cancel</button>',true);
    libraryPicker={slot,entries};
  }
  document.addEventListener('click',async event=>{
    const node=event.target.closest?.('[data-tw-asset]');
    if(!node)return;
    event.preventDefault();event.stopImmediatePropagation();
    const picker=libraryPicker;
    if(node.dataset.twAsset==='cancel'){libraryPicker=null;window.Site?.close?.();return;}
    const entry=picker?.entries[Number(node.dataset.twAsset)];
    if(!picker||!entry)return;
    libraryPicker=null;
    window.Site?.close?.();
    const slot=picker.slot;
    slotMedia.set(slotKey(slot),entry.src);
    paintSlot(slot);
    // Feed the page the same way a local upload would, when the bytes are reachable.
    const input=slot.querySelector('input[type=file]');
    if(!input)return;
    try{
      const file=await pngFile(entry.src,entry.name);
      if(file){
        const transfer=new DataTransfer();
        transfer.items.add(file);
        input.files=transfer.files;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }catch{/* Preview already shows the asset; the page keeps its own state. */}
  },true);
  /* Assets may be WebP or JPEG; the pages validate PNG, so re-encode before handing over. */
  async function pngFile(src,name){
    const image=await new Promise((resolve,reject)=>{
      const node=new Image();
      node.onload=()=>resolve(node);
      node.onerror=()=>reject(new Error('load'));
      node.src=src;
    });
    let scale=Math.min(1,1400/Math.max(image.naturalWidth||1,image.naturalHeight||1));
    for(let attempt=0;attempt<5;attempt++){
      const width=Math.max(1,Math.round((image.naturalWidth||1)*scale));
      const height=Math.max(1,Math.round((image.naturalHeight||1)*scale));
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      canvas.getContext('2d').drawImage(image,0,0,width,height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      if(blob&&blob.size<=2.8*1024*1024)return new File([blob],(name||'asset').replace(/\.[a-z0-9]+$/i,'')+'.png',{type:'image/png'});
      scale*=0.7;
    }
    return null;
  }
  function clearSlot(slot){
    slotMedia.delete(slotKey(slot));
    const input=slot.querySelector('input[type=file]');
    if(input)input.value='';
    paintSlot(slot);
    input?.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function buildSlot(label,index,sample){
    const slot=document.createElement('section');slot.className='tw-slot';slot.dataset.twIndex=String(index);
    const preview=document.createElement('div');preview.className='tw-slot-preview';
    const empty=document.createElement('p');empty.className='tw-slot-empty';
    const media=document.createElement('div');media.className='tw-slot-media';media.hidden=true;
    const image=document.createElement('img');image.alt='';image.hidden=true;
    const remove=document.createElement('button');remove.type='button';remove.className='cm-button tw-remove';remove.textContent='Remove';
    media.append(image,remove);preview.append(empty,media);
    const actions=document.createElement('div');actions.className='tw-slot-actions';
    label.before(slot);slot.append(preview);actions.append(label);
    // Asset Library opens a picker of saved images instead of leaving the page.
    const library=document.createElement('button');
    library.type='button';
    library.className='cm-button ghost tw-library-button';
    library.setAttribute('aria-label','Asset Library');
    library.append(svgIcon(ICON_LIBRARY));
    const libText=document.createElement('span');libText.textContent='Asset Library';library.append(libText);
    library.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openLibrary(slot);});
    actions.append(library);
    // Only the image's own hover control removes it; no duplicate row button.
    slot.append(actions);
    slot.tw={preview,empty,media,image,remove,sample:null};
    if(sample&&!sample.closest('.tw-slot')){preview.append(sample);slot.tw.sample=sample;}
    remove.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();clearSlot(slot);});
    // Delegated in the capture phase: the tool pages stop `change` at the document
    // level, so the earlier `input` event keeps the slot in sync after a pick.
    const picked=event=>{
      const input=event.target;
      if(!input||input.type!=='file')return;
      const file=input.files&&input.files[0];
      if(!file){slotMedia.delete(slotKey(slot));paintSlot(slot);return;}
      slotMedia.set(slotKey(slot),URL.createObjectURL(file));
      paintSlot(slot);
    };
    slot.addEventListener('input',picked,true);
    slot.addEventListener('change',picked,true);
    return slot;
  }
  function decorate(label,index){
    const input=label.querySelector(':scope>input[type=file]');
    if(!input)return;
    if(label.classList.contains('tw-upload-button')&&label.querySelector(':scope>span')&&label.querySelector(':scope>.tw-slot-icon'))return;
    const captionText=index===0?'Upload Image':'Upload Reference';
    [...label.childNodes].forEach(node=>{if(node!==input)node.remove();});
    label.classList.remove('tw-dropzone');
    label.classList.add('tw-upload','tw-upload-button');
    label.prepend(svgIcon(ICON_UPLOAD));
    const caption=document.createElement('span');caption.textContent=captionText;
    label.insertBefore(caption,input);
    input.setAttribute('aria-label',captionText);
  }
  function slots(page){
    if(page.classList.contains('tm-page'))return;
    const labels=[...page.querySelectorAll('label')].filter(label=>label.querySelector(':scope>input[type=file]'));
    if(!labels.length)return;
    const sample=[...page.querySelectorAll('button')].find(button=>{
      if(button.closest('.tw-slot'))return false;
      const flags=Object.entries(button.dataset).map(([key,value])=>key+'='+value).join(' ');
      return /sample/.test(flags)||/^(试用|使用)示例/.test(button.textContent.trim());
    });
    labels.forEach((label,index)=>{
      const slot=label.closest('.tw-slot')||buildSlot(label,index,index===0?sample:null);
      const index$=String(index);
      if(slot.dataset.twIndex!==index$)slot.dataset.twIndex=index$;
      // Adopt the page's own thumbnail once, then let the slot own the preview.
      const thumb=label.querySelector('img[src]');
      if(thumb&&!slotMedia.get(slotKey(slot))){
        const src=thumb.getAttribute('src');
        if(src)slotMedia.set(slotKey(slot),src);
      }
      decorate(label,index);
      const empty=slot.querySelector('.tw-slot-empty');
      const emptyText=index===0?'No image added yet.':'No reference added yet.';
      if(empty&&empty.textContent!==emptyText)empty.textContent=emptyText;
      paintSlot(slot);
    });
    observe();
  }
  let slotObserver=null,slotTimer=0;
  function observe(){
    if(slotObserver)return;
    slotObserver=new MutationObserver(()=>{
      clearTimeout(slotTimer);
      slotTimer=setTimeout(()=>{
        const page=document.querySelector('.ts-page');
        if(page&&page.classList.contains('tw-detail'))slots(page);
      },80);
    });
    slotObserver.observe(document.body,{childList:true,subtree:true});
  }
  /* Collapsible notes become the same three-dot menu used by Image to Motion. */
  function menus(page){
    if(page.classList.contains('tm-page'))return;
    page.querySelectorAll('details.tw-disclosure, .ts-panel details').forEach(details=>{
      if(details.dataset.twMenu)return;
      // The upload slot and the Motion page own their own menus.
      if(details.classList.contains('tw-frame-menu')||details.closest('.tw-slot'))return;
      const summary=details.querySelector(':scope>summary');
      if(!summary)return;
      details.dataset.twMenu='true';
      details.classList.add('tw-menu');
      const label=(summary.textContent||'').trim()||'More options';
      const panel=document.createElement('div');panel.className='tw-menu-panel';
      [...details.children].forEach(node=>{if(node!==summary&&node.tagName!=='SUMMARY')panel.append(node);});
      details.append(panel);
      summary.textContent='';
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
      svg.setAttribute('class','tw-menu-dots');
      [5,12,19].forEach(x=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',String(x));dot.setAttribute('cy','12');dot.setAttribute('r','1.6');svg.append(dot);});
      summary.append(svg);
      summary.classList.add('cm-button','ghost','tw-menu-button');
      summary.setAttribute('aria-label',label);
      summary.setAttribute('data-tooltip',label);
    });
    if(!page.dataset.twMenuClose){
      page.dataset.twMenuClose='true';
      document.addEventListener('click',event=>{if(event.target.closest('.tw-menu'))return;page.querySelectorAll('.tw-menu[open]').forEach(node=>{node.open=false;});},true);
      document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;page.querySelectorAll('.tw-menu[open]').forEach(node=>{node.open=false;});},true);
    }
    mergeMenus(page);
  }
  /* OC sheet: Outfit and Character Intro are peers, so they sit side by side
     on their own tinted surfaces instead of nesting in each other's menu. */
  function ocPanels(page){
    if(!page.classList.contains('oc-page'))return;
    // The page's own reference card duplicates the upload slot and its remove action.
    page.querySelectorAll('.oc-outfit-ref,[data-oc="outfit-remove"]').forEach(node=>node.remove());
    const output=page.querySelector('.oc-output')||page;
    const menus=[...output.querySelectorAll('.tw-menu')].filter(menu=>menu.querySelector('.oc-outfit,.oc-profile'));
    if(!menus.length)return;
    menus.forEach(menu=>{
      if(!menu.open)menu.open=true;
      const summary=menu.querySelector(':scope>summary');
      if(summary&&!summary.hidden)summary.hidden=true;
    });
    let pair=output.querySelector(':scope>.tw-oc-pair');
    if(!pair){pair=document.createElement('div');pair.className='tw-oc-pair';menus[0].before(pair);}
    menus.forEach(menu=>{if(menu.parentElement!==pair)pair.append(menu);});
  }
  /* Two stacked ⋯ triggers become one: the second panel moves inside the first
     and the options sit side by side instead of doubling the button. */
  function mergeMenus(page){
    const menus=[...page.querySelectorAll('.tw-menu')];
    const absorbed=new Set();
    menus.forEach((menu,index)=>{
      if(absorbed.has(menu))return;
      const next=menus[index+1];
      if(!next||absorbed.has(next))return;
      // The OC peers stay separate so they can sit in parallel columns.
      if(menu.querySelector('.oc-outfit,.oc-profile')||next.querySelector('.oc-outfit,.oc-profile'))return;
      const box=menu.getBoundingClientRect(),nextBox=next.getBoundingClientRect();
      if(!box.height||!nextBox.height)return;
      if(Math.abs(box.left-nextBox.left)>6)return;
      if(nextBox.top-box.bottom>90)return;
      const target=[...menu.children].find(node=>node.classList?.contains('tw-menu-panel'));
      const source=[...next.children].find(node=>node.classList?.contains('tw-menu-panel'));
      if(!target||!source)return;
      const item=document.createElement('div');item.className='tw-menu-item';
      [...source.children].forEach(node=>item.append(node));
      if(!item.querySelector('label,h2,h3')){
        const caption=document.createElement('small');caption.className='tw-menu-caption';
        caption.textContent=next.querySelector(':scope>summary')?.getAttribute('aria-label')||'';
        if(caption.textContent)item.prepend(caption);
      }
      target.append(item);
      absorbed.add(next);
      next.remove();
    });
  }
  /* Shared header component: the Asset Library link used by the .tw-v2 pages.
     Keeps the .tm-asset-link class so Image to Motion's existing icon motion
     still applies while generic pages pick up the shared sizing. */
  function assetLibraryLink(){
    return '<a class="cm-button ghost tw-asset-link tm-asset-link" href="#/app/assets?assetSource=tools">'
      + '<svg class="tm-asset-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" focusable="false">'
      + '<path d="M8.64298 3.14559L6.93816 3.93362C4.31272 5.14719 3 5.75397 3 6.75C3 7.74603 4.31272 8.35281 6.93817 9.56638L8.64298 10.3544C10.2952 11.1181 11.1214 11.5 12 11.5C12.8786 11.5 13.7048 11.1181 15.357 10.3544L17.0618 9.56638C19.6873 8.35281 21 7.74603 21 6.75C21 5.75397 19.6873 5.14719 17.0618 3.93362L15.357 3.14559C13.7048 2.38186 12.8786 2 12 2C11.1214 2 10.2952 2.38186 8.64298 3.14559Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>'
      + '<path d="M20.788 11.0972C20.9293 11.2959 21 11.5031 21 11.7309C21 12.7127 19.6873 13.3109 17.0618 14.5072L15.357 15.284C13.7048 16.0368 12.8786 16.4133 12 16.4133C11.1214 16.4133 10.2952 16.0368 8.64298 15.284L6.93817 14.5072C4.31272 13.3109 3 12.7127 3 11.7309C3 11.5031 3.07067 11.2959 3.212 11.0972" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>'
      + '<path d="M20.3767 16.2661C20.7922 16.5971 21 16.927 21 17.3176C21 18.2995 19.6873 18.8976 17.0618 20.0939L15.357 20.8707C13.7048 21.6236 12.8786 22 12 22C11.1214 22 10.2952 21.6236 8.64298 20.8707L6.93817 20.0939C4.31272 18.8976 3 18.2995 3 17.3176C3 16.927 3.20778 16.5971 3.62334 16.2661" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>'
      + '</svg><span>Asset Library</span></a>';
  }
  window.ToolDetailLayout={enhance,assetLibraryLink};
})();
