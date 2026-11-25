/* Presentation-only helpers shared by the creative tool workbenches. */
(()=>{
  'use strict';
  const states=new Map();
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
      label.dataset.twUpload='true';label.classList.add('tw-upload');
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
    page.querySelectorAll(':scope > p:not([role]):not([id])').forEach((note,index)=>{
      if(/演示|Demo|本机/.test(note.textContent))fold(note,'演示说明 · 未接入 AI','demo-'+index);
    });
    fold(page.querySelector('.oc-profile'),'人物介绍与设定','profile');
    fold(page.querySelector('.oc-profile-dialogue'),'调整人物介绍','profile-edit');
    fold(page.querySelector('.oc-outfit'),'更换服饰与配饰','outfit');
    fold(page.querySelector('.tr-scope'),'修改范围与保留项','scope');
    fold(page.querySelector('.tc-plan'),'本次处理要求','color-plan');
    page.querySelectorAll('.tc-compare,.opt-comparison,.tl-compare').forEach(comparison);
    page.querySelectorAll('.oc-base-board').forEach(characterGallery);
    uploads(page);
    // Keep a single sample action for each operation; the input-side action stays available after generation.
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
    mediaWorkspace(page);emptyCanvas(page);
  }
  window.ToolDetailLayout={enhance};
})();
