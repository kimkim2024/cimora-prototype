/* 产品壳、路由与公共界面组件。旧 M0 编辑器保留独立演示数据。 */
window.Cimora=(()=>{
  const S=Site,M=createCimoraDirectionModel(createCimoraImportModel(createCimoraComicModel(createCimoraAdaptationModel(createCimoraProductionModel(createCimoraModel(S),S),S),S),S),S),E=S.esc;
  function creditGauge(balance){const allowance=1000;return {allowance,percent:Math.max(0,Math.min(100,balance/allowance*100))};}
  const ui={assetScope:'chapter',assetType:'All',assetSearch:'',marketType:'All',galleryType:'All',selectedBoard:0,storyCandidate:null,newDraft:null,canvasLink:null,toolContext:false};
  /* Sidebar artwork: @hugeicons/core-free-icons 4.4.0
MIT License

Copyright (c) 2025 Hugeicons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
  */
  const sidebarMobile = matchMedia('(max-width:700px)');
  const sidebarIcon = '☰';
  function syncSidebar(){
    const shell = document.querySelector('.cm-shell');
    if (!shell) return;
    if (!sidebarMobile.matches) shell.classList.remove('menu-open');
    const open = shell.classList.contains('menu-open');
    const button = shell.querySelector('[data-cm="mobile-menu"]');
    if (button) {
      button.hidden = !sidebarMobile.matches;
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
  }
  function toggleSidebar(){
    if (!sidebarMobile.matches) return;
    document.querySelector('.cm-shell')?.classList.toggle('menu-open');
    syncSidebar();
  }
  sidebarMobile.addEventListener('change',syncSidebar);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.cm-shell.menu-open')){toggleSidebar();document.querySelector('[data-cm="mobile-menu"]')?.focus();}});
  const icons={home:'<svg data-hugeicon="DashboardSquare01" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M13.6903 19.4567C13.5 18.9973 13.5 18.4149 13.5 17.25C13.5 16.0851 13.5 15.5027 13.6903 15.0433C13.944 14.4307 14.4307 13.944 15.0433 13.6903C15.5027 13.5 16.0851 13.5 17.25 13.5C18.4149 13.5 18.9973 13.5 19.4567 13.6903C20.0693 13.944 20.556 14.4307 20.8097 15.0433C21 15.5027 21 16.0851 21 17.25C21 18.4149 21 18.9973 20.8097 19.4567C20.556 20.0693 20.0693 20.556 19.4567 20.8097C18.9973 21 18.4149 21 17.25 21C16.0851 21 15.5027 21 15.0433 20.8097C14.4307 20.556 13.944 20.0693 13.6903 19.4567Z" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="1.5"/><path d="M13.6903 8.95671C13.5 8.49728 13.5 7.91485 13.5 6.75C13.5 5.58515 13.5 5.00272 13.6903 4.54329C13.944 3.93072 14.4307 3.44404 15.0433 3.1903C15.5027 3 16.0851 3 17.25 3C18.4149 3 18.9973 3 19.4567 3.1903C20.0693 3.44404 20.556 3.93072 20.8097 4.54329C21 5.00272 21 5.58515 21 6.75C21 7.91485 21 8.49728 20.8097 8.95671C20.556 9.56928 20.0693 10.056 19.4567 10.3097C18.9973 10.5 18.4149 10.5 17.25 10.5C16.0851 10.5 15.5027 10.5 15.0433 10.3097C14.4307 10.056 13.944 9.56928 13.6903 8.95671Z" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="1.5"/><path d="M3.1903 19.4567C3 18.9973 3 18.4149 3 17.25C3 16.0851 3 15.5027 3.1903 15.0433C3.44404 14.4307 3.93072 13.944 4.54329 13.6903C5.00272 13.5 5.58515 13.5 6.75 13.5C7.91485 13.5 8.49728 13.5 8.95671 13.6903C9.56928 13.944 10.056 14.4307 10.3097 15.0433C10.5 15.5027 10.5 16.0851 10.5 17.25C10.5 18.4149 10.5 18.9973 10.3097 19.4567C10.056 20.0693 9.56928 20.556 8.95671 20.8097C8.49728 21 7.91485 21 6.75 21C5.58515 21 5.00272 21 4.54329 20.8097C3.93072 20.556 3.44404 20.0693 3.1903 19.4567Z" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="1.5"/><path d="M3.1903 8.95671C3 8.49728 3 7.91485 3 6.75C3 5.58515 3 5.00272 3.1903 4.54329C3.44404 3.93072 3.93072 3.44404 4.54329 3.1903C5.00272 3 5.58515 3 6.75 3C7.91485 3 8.49728 3 8.95671 3.1903C9.56928 3.44404 10.056 3.93072 10.3097 4.54329C10.5 5.00272 10.5 5.58515 10.5 6.75C10.5 7.91485 10.5 8.49728 10.3097 8.95671C10.056 9.56928 9.56928 10.056 8.95671 10.3097C8.49728 10.5 7.91485 10.5 6.75 10.5C5.58515 10.5 5.00272 10.5 4.54329 10.3097C3.93072 10.056 3.44404 9.56928 3.1903 8.95671Z" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="1.5"/></svg>',projects:'<svg data-hugeicon="Folder02" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M11 4L16 4C18.8284 4 20.2426 4 21.1213 4.87868C21.7619 5.51922 21.9355 6.44435 21.9825 7.99446C22 8.57076 22 9.23344 22 10V14M22 14V15C22 17.8284 22 19.2426 21.1213 20.1213C20.2426 21 18.8284 21 16 21L8 21C5.17157 21 3.75736 21 2.87868 20.1213C2 19.2426 2 17.8284 2 15V9C2 6.17157 2 4.75736 2.87868 3.87868C3.75736 3 5.17157 3 8 3H8.3076C9.13435 3 9.54772 3 9.89081 3.19355C10.2339 3.3871 10.4477 3.7409 10.8753 4.44849L12.1427 6.54596C12.5702 7.25356 12.784 7.60736 13.1271 7.80091C13.4702 7.99446 13.8836 7.99446 14.7103 7.99446H16C18.8284 7.99446 20.2426 7.99446 21.1213 8.87314C22 9.75182 22 11.1679 22 14Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',assets:'<svg data-hugeicon="Layers01" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M8.64298 3.14559L6.93816 3.93362C4.31272 5.14719 3 5.75397 3 6.75C3 7.74603 4.31272 8.35281 6.93817 9.56638L8.64298 10.3544C10.2952 11.1181 11.1214 11.5 12 11.5C12.8786 11.5 13.7048 11.1181 15.357 10.3544L17.0618 9.56638C19.6873 8.35281 21 7.74603 21 6.75C21 5.75397 19.6873 5.14719 17.0618 3.93362L15.357 3.14559C13.7048 2.38186 12.8786 2 12 2C11.1214 2 10.2952 2.38186 8.64298 3.14559Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M20.788 11.0972C20.9293 11.2959 21 11.5031 21 11.7309C21 12.7127 19.6873 13.3109 17.0618 14.5072L15.357 15.284C13.7048 16.0368 12.8786 16.4133 12 16.4133C11.1214 16.4133 10.2952 16.0368 8.64298 15.284L6.93817 14.5072C4.31272 13.3109 3 12.7127 3 11.7309C3 11.5031 3.07067 11.2959 3.212 11.0972" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M20.3767 16.2661C20.7922 16.5971 21 16.927 21 17.3176C21 18.2995 19.6873 18.8976 17.0618 20.0939L15.357 20.8707C13.7048 21.6236 12.8786 22 12 22C11.1214 22 10.2952 21.6236 8.64298 20.8707L6.93817 20.0939C4.31272 18.8976 3 18.2995 3 17.3176C3 16.927 3.20778 16.5971 3.62334 16.2661" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',tasks:'<svg data-hugeicon="Task01" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M14.4961 2.00027H9.49609C8.66767 2.00027 7.99609 2.67185 7.99609 3.50027C7.99609 4.3287 8.66767 5.00027 9.49609 5.00027H14.4961C15.3245 5.00027 15.9961 4.3287 15.9961 3.50027C15.9961 2.67185 15.3245 2.00027 14.4961 2.00027Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M7.99609 15.0003H11.4247M7.99609 11.0003H15.9961" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M15.9961 3.50027C17.5496 3.54709 18.4761 3.72035 19.1174 4.36164C19.9961 5.24032 19.9961 6.65451 19.9961 9.4829L19.9961 15.9997C19.9961 18.8282 19.9961 20.2424 19.1174 21.1211C18.2387 21.9997 16.8245 21.9997 13.9961 21.9997L9.99609 21.9997C7.16767 21.9997 5.75346 21.9997 4.87478 21.1211C3.9961 20.2424 3.9961 18.8282 3.99609 15.9998L3.99611 9.48296C3.9961 6.65453 3.9961 5.24031 4.87478 4.36163C5.51606 3.72034 6.44261 3.54708 7.99599 3.50027" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',tools:'<svg data-hugeicon="PaintBrush01" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M3.89089 20.8727L3 21L3.12727 20.1091C3.32086 18.754 3.41765 18.0764 3.71832 17.4751C4.01899 16.8738 4.50296 16.3898 5.47091 15.4218L16.9827 3.91009C17.4062 3.48654 17.618 3.27476 17.8464 3.16155C18.2811 2.94615 18.7914 2.94615 19.2261 3.16155C19.4546 3.27476 19.6663 3.48654 20.0899 3.91009C20.5135 4.33365 20.7252 4.54543 20.8385 4.77389C21.0539 5.20856 21.0539 5.71889 20.8385 6.15356C20.7252 6.38201 20.5135 6.59379 20.0899 7.01735L8.57816 18.5291C7.61022 19.497 7.12625 19.981 6.52491 20.2817C5.92357 20.5823 5.246 20.6791 3.89089 20.8727Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M6 15L9 18M8.5 12.5L11.5 15.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',exports:'<svg data-hugeicon="PackageDelivered" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M21 7V12M3 7C3 10.0645 3 16.7742 3 17.1613C3 18.5438 4.94564 19.3657 8.83693 21.0095C10.4002 21.6698 11.1818 22 12 22L12 11.3548" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M15 19C15 19 15.875 19 16.75 21C16.75 21 19.5294 16 22 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M8.32592 9.69138L5.40472 8.27785C3.80157 7.5021 3 7.11423 3 6.5C3 5.88577 3.80157 5.4979 5.40472 4.72215L8.32592 3.30862C10.1288 2.43621 11.0303 2 12 2C12.9697 2 13.8712 2.4362 15.6741 3.30862L18.5953 4.72215C20.1984 5.4979 21 5.88577 21 6.5C21 7.11423 20.1984 7.5021 18.5953 8.27785L15.6741 9.69138C13.8712 10.5638 12.9697 11 12 11C11.0303 11 10.1288 10.5638 8.32592 9.69138Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M6 12L8 13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M17 4L7 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',market:'<svg data-hugeicon="Store01" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M3.50002 10V15C3.50002 17.8284 3.50002 19.2426 4.37869 20.1213C5.25737 21 6.67159 21 9.50002 21H14.5C17.3284 21 18.7427 21 19.6213 20.1213C20.5 19.2426 20.5 17.8284 20.5 15V10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M17 7.50184C17 8.88255 15.8807 9.99997 14.5 9.99997C13.1193 9.99997 12 8.88068 12 7.49997C12 8.88068 10.8807 9.99997 9.50002 9.99997C8.1193 9.99997 7.00002 8.88068 7.00002 7.49997C7.00002 8.88068 5.82655 9.99997 4.37901 9.99997C3.59984 9.99997 2.90008 9.67567 2.42 9.16087C1.59462 8.2758 2.12561 6.97403 2.81448 5.98842L3.20202 5.45851C4.08386 4.2527 4.52478 3.6498 5.16493 3.32494C5.80508 3.00008 6.55201 3.00018 8.04587 3.00038L15.9551 3.00143C17.4485 3.00163 18.1952 3.00173 18.8351 3.32658C19.475 3.65143 19.9158 4.25414 20.7974 5.45957L21.1855 5.99029C21.8744 6.97589 22.4054 8.27766 21.58 9.16273C21.0999 9.67754 20.4002 10.0018 19.621 10.0018C18.1734 10.0018 17 8.88255 17 7.50184Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M14.9971 17C14.3133 17.6072 13.2247 18 11.9985 18C10.7723 18 9.68376 17.6072 9 17" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',community:'<svg data-hugeicon="Image02" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',canvas:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M10 10v9.5"/></svg>',flow:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/><path d="M10.5 7.25h4.75V13.5"/></svg>'};
  const btn=(text,action,cls='cm-button',extra='')=>`<button type="button" class="${cls}" data-cm="${action}" ${extra}>${text}</button>`;
  const link=(text,path,cls='cm-button')=>`<a href="#${path}" class="${cls}">${text}</a>`;
  const money=v=>'$'+Number(v||0).toFixed(2);
  const seconds=e=>e.boards.reduce((sum,b)=>sum+(Number(b.duration)||5),0);
  const timecode=v=>Math.floor(v/60).toString().padStart(2,'0')+':'+Math.floor(v%60).toString().padStart(2,'0');
  const art=(n=0,alt='',cls='')=>S.art(n,alt,cls);
  const statusMap={done:'Generated',idle:'Not started',queued:'Waiting on dependency',running:'Generating',failed:'Failed, retryable',stale:'Source updated',blocked:'Waiting for input',paused:'Paused'};
  const badge=(s,text)=>`<span class="cm-status ${s}"><i></i>${E(text||statusMap[s]||s)}</span>`;
  const ctx=()=>M.context();
  const path=(c,stage='story',view)=>`/app/create/${c.p.id}/${c.c.id}?stage=${stage}${view?'&view='+view:''}`;
  const meta=(a,b)=>`<div class="cm-section-head"><div><span class="cm-kicker">${a}</span><h2>${b}</h2></div></div>`;
  function logo(to='/app'){return `<a href="#${to}" class="cm-logo" aria-label="Cimora home"><img src="assets/studio-cimora-logo.png" alt="Studio Cimora" width="1672" height="941"></a>`;}
  function scopePicker(c=ctx(),prefix='cm-global'){
    if(!c)return '';
    return `<div class="cm-scope"><label><span>Project</span><select id="${prefix}-project" data-cm-change="scope-project">${S.state.projects.filter(p=>!p.archived).map(p=>`<option value="${p.id}" ${c.p.id===p.id?'selected':''}>${E(p.name)}</option>`).join('')}</select></label><i>/</i><label><span>Chapter / Episode</span><select id="${prefix}-chapter" data-cm-change="scope-chapter">${[...c.p.chapters,...(c.p.episodes||[])].map((ch,i)=>`<option value="${ch.id}" ${ch.id===c.c.id?'selected':''}>${ch.kind==='episode'?'Video':'Comic'} · ${E(ch.title)}</option>`).join('')}</select></label></div>`;
  }
  function shell(content,context){
    const p=context.path,creation=p.startsWith('/app/create/')||p.startsWith('/app/canvas/');
    const items=[['home','Creation Space','/app'],['projects','My Projects','/app/projects'],['assets','Asset Library','/app/assets'],['tasks','Tasks & Orchestration','/app/tasks'],['tools','Creative Tools','/app/tools'],['exports','Export & Delivery','/app/exports']];
    const discover=[['community','Showcase','/app/community'],['market','Market','/app/market']];
    const nav=items=>items.map(([ic,t,to])=>link(`<span class="cm-nav-icon" aria-hidden="true">${icons[ic]}</span><span class="cm-nav-text">${t}</span>`,to,'cm-nav-item '+(p===to||to!=='/app'&&p.startsWith(to+'/')?'active':'')).replace('<a ',`<a aria-label="${E(t)}" title="${E(t)}" `)).join('');
    const defaultTopActions=`${/^\/app\/(projects|video|comic|script|canvas|create)(\/|$)/.test(p)?'':'<span class="cm-saved"><i></i> Saved to this device</span>'}${link('◷','/app/tasks','cm-icon-button')}${link('✦ '+M.db.wallet,'/app/wallet','cm-credit-pill')}<span class="cm-avatar small">M</span>`;
    const topActions=p==='/app/projects'?(C.projectLibrary?.tools()??defaultTopActions)
      :p==='/app/assets'?(window.StudioLibrary?.topActions(context)??defaultTopActions):defaultTopActions;
    const walletValue=Number(M.db.wallet)||0,{allowance:creditAllowance,percent:gaugePct}=creditGauge(walletValue),creditPct=Math.round(gaugePct),accountName=S.state.user?.name||'My Creative Universe',accountPlan=S.state.plan||'Free';
    const gaugeAngle=Math.PI*(1-gaugePct/100),gaugeX=100+70*Math.cos(gaugeAngle),gaugeY=98-70*Math.sin(gaugeAngle);
    const accountProfile=`<a class="cm-account-profile" href="#/app/settings" aria-label="Account settings for ${E(accountName)}">
        <img class="cm-account-avatar" src="assets/avatar-1-sq.png" alt="">
        <span class="cm-account-name" title="${E(accountName)}">${E(accountName)}</span>
        <span class="cm-account-plan" title="${E(accountPlan)}">${E(accountPlan)}</span>
        <svg class="cm-account-chevron" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 3 6 7-6 7"/></svg>
      </a>`;
    const accountCard=`<section class="cm-user-card" data-low="${gaugePct<30}" aria-label="Account and credits">
      <div class="cm-credit-gauge">
        <a class="cm-account-icon cm-account-settings" href="#/app/settings" aria-label="Workspace settings" title="Workspace settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></svg></a>
        <span class="cm-gauge-label">Credits</span>
        <a class="cm-account-icon cm-account-wallet" href="#/app/wallet" data-pw="topup" aria-haspopup="dialog" aria-label="Top up credits" title="Top up credits"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 2 4 14h7l-1 8 10-13h-7z"/></svg></a>
        <svg class="cm-gauge-arc" viewBox="0 0 200 115" role="progressbar" aria-label="Credits remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${gaugePct}" aria-valuetext="${creditPct}% remaining, ${walletValue.toLocaleString('en-US')} of ${creditAllowance.toLocaleString('en-US')} credits">
          <defs><linearGradient id="cm-credit-gradient" x1="0" x2="1" y1="0" y2="0"><stop class="cm-gauge-start" offset="0"/><stop class="cm-gauge-end" offset="1"/></linearGradient></defs>
          <path class="cm-gauge-track" d="M30 98 A70 70 0 0 1 170 98" pathLength="100"/>
          <path class="cm-gauge-fill" d="M30 98 A70 70 0 0 1 170 98" pathLength="100" stroke-dasharray="${gaugePct} 100" opacity="${gaugePct>0?1:0}"/>
          <circle class="cm-gauge-dot" cx="${gaugeX}" cy="${gaugeY}" r="5" opacity="${gaugePct>0?1:0}"/>
        </svg>
        <strong class="cm-user-card-pct">${creditPct}%</strong>
      </div>

    </section>`;
    return `<div class="cm-shell ${creation?'cm-creating':''}"><aside class="cm-sidebar" id="cm-product-sidebar">${accountProfile}<nav aria-label="Cimora product navigation">${nav(items)}</nav><small class="cm-nav-label">DISCOVER & CREATE</small><nav>${nav(discover)}</nav><div class="cm-sidebar-bottom">${accountCard}<button type="button" data-act="logout" class="cm-nav-item cm-logout"><span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" aria-hidden="true"><path d="M11 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6V4Z" fill="#ffd4c3" stroke="#ae5238"/><path d="M8 12h13m-5-5 5 5-5 5" stroke="#c04b30"/></svg></span>Log out</button><span class="cm-local"><i></i> Local interactive prototype · task simulation</span></div></aside><div class="cm-app-main"><header class="cm-topbar">${btn(sidebarIcon,'mobile-menu','cm-icon-button cm-mobile-menu','aria-label="Toggle navigation" aria-controls="cm-product-sidebar"')}<div class="cm-breadcrumb">${link('Creation Space','/app','')}<span>/</span><strong>${E(pageTitle(context))}</strong></div><div class="cm-top-actions">${topActions}</div></header><main class="cm-main">${content}</main></div></div>`;
  }
  function pageTitle(c){return ({new:c.params.get('output')==='motion'?'Video creation':'Create work',projects:'My Projects',assets:'Asset Library',tools:'Creative Tools',tasks:'Tasks & Orchestration',market:'Market',community:'Showcase',wallet:'Credits and resources',creator:'Creator Center',create:ctx()?.p.name,canvas:ctx()?.p.name,runs:'Pipeline orchestration'})[c.parts[1]]||'My Creative Universe';}
  function route(context){
    if(context.parts[0]!=='app')return null;
    const k=context.parts[1];
    if(k==='editor')return null;
    if(k==='create'||k==='canvas'){
      const c=M.activate(context.parts[2],context.parts[3]);
      if(!c)return S.empty('Project does not exist','Back to the workspace to keep creating');
      if(context.params.get('view'))c.e.view=context.params.get('view');
      c.e.stage=context.params.get('stage')||c.e.stage||'story';
      if(k==='canvas')c.e.view='canvas';
      M.remember(c);
      M.save();return C.studio(c);
    }
    if(k==='runs')return C.runs(M.activate(context.parts[2],context.parts[3]));
    if(k==='tools'){const html=S.tools.render({parts:['tools',context.parts[2]]});return `<div class="cm-tool-context">${scopePicker()}<p>Tool results keep their source and can be saved to the current chapter.${link('Back to creating →',path(ctx(),ctx().e.stage),'cm-text-link')}${ui.toolContext&&context.parts[2]?btn('Bring result into the selected panel','apply-tool-result','cm-button ghost small',`data-id="${context.parts[2]}"`):''}</p></div>`+html;}
    if(C.pages?.[k||'home'])return C.pages[k||'home'](context);
    if(k==='projects'&&context.parts[2])return C.project(S.project(context.parts[2]));
    return null;
  }
  function afterRender(context){
    const isApp=context.parts[0]==='app';
    document.body.classList.toggle('cimora-app',isApp);
    document.body.classList.toggle('cimora-home-app',context.path==='/app');
    const workspaceLanding = isApp && context.parts.length === 2 && ['projects','assets','tasks','tools','exports','community','market'].includes(context.parts[1]);
    document.body.classList.toggle('cimora-workspace-landing',workspaceLanding);
    document.body.classList.toggle('cimora-home-public',context.path==='/');
    if(isApp){
      S.$$('a[href^="#/tools"]').forEach(a=>{a.href='#/app'+a.getAttribute('href').slice(1);});
      S.$$('a[href^="#/app/editor/"]').forEach(a=>{if(a.dataset.legacy)return;const url=a.getAttribute('href').replace('/editor/','/create/').replace('step=script','stage=story').replace('step=assets','stage=assets').replace('step=motion','stage=motion').replace('step=comic','stage=boards');a.href=url;});
      if(context.parts[1]==='tools'){S.$$('a[href="#/product"]').forEach(a=>a.href='#/app');S.$$('a[href^="#/templates"]').forEach(a=>a.href='#/app/market');}
    }
    syncSidebar();C.bindCanvas?.();C.bindTimeline?.();window.CimoraAppearance?.refresh();
  }
  const originalToolCard=S.public.toolCard;S.public.toolCard=t=>{const html=originalToolCard(t);return S.context.path.startsWith('/app')?html.replaceAll('href="#/tools/','href="#/app/tools/'):html;};
  const C={S,M,E,ui,btn,link,money,seconds,timecode,art,badge,ctx,path,meta,logo,scopePicker,shell,route,afterRender,pageTitle,toggleSidebar,creditGauge};return C;
})();


