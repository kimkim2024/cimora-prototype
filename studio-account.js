(()=>{
 'use strict';
 const S=Site,C=Cimora,E=S.esc;
 const ownId='local-creator',tabs=[['works','作品发布'],['assets','资产包上架'],['income','收益与结算']];
 let avatarDraft=null;
 function profile(){let value;try{value=StudioLibrary.meta().profile;}catch{}return {id:ownId,name:S.state.prefs.studio||'我的工作室',bio:'',avatar:'',...value};}
 function author(item){return item?.authorId===ownId||item?.local||item?.author==='我的工作室'?profile().name:item?.author||'创作者';}
 function avatar(value=profile(),cls=''){return `<span class="sa-avatar ${cls}">${value.avatar?`<img src="${E(value.avatar)}" alt="Creator avatar">`:E(Array.from(value.name)[0]||'C')}</span>`;}
 const link=(text,path,primary=false)=>C.link(text,path,'cm-button '+(primary?'primary':'ghost'));
 const flagStar='M0-1 .225-.309.951-.309.363.118.588.809 0 .382-.588.809-.363.118-.951-.309-.225-.309Z';
 const languages=[
  {label:'English',value:'English',icon:`<svg data-language-flag="gb" aria-hidden="true" viewBox="0 0 60 30">
   <path fill="#012169" d="M0 0h60v30H0z"/>
   <path stroke="#fff" stroke-width="6" d="m0 0 60 30M60 0 0 30"/>
   <path fill="#C8102E" d="M0 0h4.5L30 12.75V15zM60 0v2.25L34.5 15H30zM60 30h-4.5L30 17.25V15zM0 30v-2.25L25.5 15H30z"/>
   <path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"/>
   <path stroke="#C8102E" stroke-width="6" d="M30 0v30M0 15h60"/>
  </svg>`},
  {label:'Simplified Chinese',value:'Simplified Chinese',icon:`<svg data-language-flag="cn" aria-hidden="true" viewBox="0 0 30 20">
   <path fill="#EE1C25" d="M0 0h30v20H0z"/>
   <g fill="#FF0">
    <path d="${flagStar}" transform="translate(5 5) scale(3)"/>
    <path d="${flagStar}" transform="translate(10 2) rotate(-121)"/>
    <path d="${flagStar}" transform="translate(12 4) rotate(-98)"/>
    <path d="${flagStar}" transform="translate(12 7) rotate(-74)"/>
    <path d="${flagStar}" transform="translate(10 9) rotate(-51)"/>
   </g>
  </svg>`}
 ];
 function languageDropdown(){
  return CimoraActivityDropdown.render({label:'Preferred language',options:languages,value:S.state.prefs.language,action:'sa-language'});
 }
 function languageSettings(){
  return `<section class="cm-panel sa-form" aria-labelledby="sa-language-title"><h2 id="sa-language-title">Language</h2>
   ${languageDropdown()}<p id="sa-language-message" class="sa-note" role="status" hidden></p>
  </section>`;
 }
 function dataSettings(){
  return `<section class="cm-panel sa-form"><h2>Data management</h2>
   <p>Back up or restore your projects, assets, tool outputs, published work, purchases, and exports.</p>
   <p class="sa-note">Backups include media stored in this browser. Keep original files for externally linked media. Close other Cimora tabs before restoring or clearing data.</p>
   <div class="sa-actions"><button type="button" class="cm-button ghost" data-sd="backup">Download backup</button><label class="cm-button ghost">Restore from backup<input type="file" id="sd-restore-file" accept="application/json,.json" hidden></label></div>
   <p id="sd-status" role="status"></p><hr>
   <button type="button" class="cm-button ghost" data-sd="reset">Clear local creation data…</button>
   <small>This clears only Cimora data in this browser. Original files on your computer are kept.</small>
  </section>`;
 }
 function profileEditor(p){
  return `<form data-sa-form="profile" class="cm-panel sa-form sa-profile-card" aria-label="Creator profile">
   <div class="sa-profile-cover"><h2>Creator profile</h2></div>
   <div class="sa-profile-identity">
    <div class="sa-profile-avatar">
     <span id="sa-avatar-preview">${avatar({...p,avatar:p.avatar||'assets/avatar-1-sq.png'})}</span>
     <button type="button" class="sa-profile-avatar-edit" data-sa="change-avatar" aria-label="Change avatar" title="Change avatar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm10-10 4 4"/></svg>
     </button>
     <input id="sa-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" hidden>
    </div>
    <h3>${E(p.name)}</h3><p>Creator</p>
   </div>
   <div class="sa-profile-fields">
    <label>Public name<input name="name" maxlength="40" required value="${E(p.name)}"></label>
    <label>Creator bio<textarea name="bio" rows="3" maxlength="300" placeholder="Tell readers what you like to create.">${E(p.bio)}</textarea></label>
    <p class="sa-note">Your public name and avatar appear on your work and asset packs.</p>
    <p id="sa-profile-message" role="status"></p>
    <div class="sa-profile-save-actions">
     <button class="sa-profile-save" type="submit">Save profile</button>
     ${link('View public profile','/app/creator/profile')}
    </div>
   </div>
  </form>`;
 }
 function centerHeader(tab){const p=profile();return `<header class="sa-heading sa-creator-heading"><div><span class="cm-kicker">YOUR CREATOR SPACE</span><h1>创作者中心</h1><p>管理作品发布、资产包上架与创作收益。</p></div><div class="sa-creator-identity">${avatar(p)}<strong>${E(p.name)}</strong><div class="sa-actions">${link('编辑资料','/app/settings?tab=profile')}${link('公开主页','/app/creator/profile')}</div></div></header><nav class="sa-tabs" aria-label="创作者中心">${tabs.map(([id,label])=>`<a href="#/app/creator?tab=${id}" aria-current="${tab===id?'page':'false'}">${label}</a>`).join('')}</nav>`;}
 function settings(){const p=profile(),requested=S.context.params.get('tab'),tab=['account','wallet','purchases','profile'].includes(requested)?requested:'account';avatarDraft=null;return `<div class="sa-page"><header class="sa-heading"><div><h1>个人中心</h1></div>${link('进入创作者中心','/app/creator?tab=works')}</header><nav class="sa-tabs pw-personal-tabs" aria-label="个人中心">${[['account','订阅与用量'],['wallet','积分钱包'],['purchases','我的购买'],['profile','资料与设置']].map(([id,title])=>'<a href="#/app/settings?tab='+id+'" aria-current="'+(id===tab?'page':'false')+'">'+title+'</a>').join('')}</nav>${tab==='wallet'?PointsWallet.wallet():tab==='purchases'?PointsWallet.purchases():tab==='account'?AccountUsage.subscription(p)+AccountUsage.usage():''}${tab==='profile'?`<div class="sa-columns">${profileEditor(p)}<div class="sa-stack">${languageSettings()}${dataSettings()}</div></div>`:''}</div>`;}
 function communityReady(){const state=CommunityStudio.status();if(!state.loaded&&!state.loading&&!state.failure)void CommunityStudio.refresh();return state;}
 function works(){const state=communityReady(),rows=CommunityStudio.mine();return `<div class="sa-page">${centerHeader('works')}<section class="cm-panel sa-form"><div class="sa-heading"><div><h2>已发布的作品</h2><p>原稿在项目里继续创作，这里管理已保存的发布版本。</p></div><button type="button" class="cm-button primary" data-cg="publish">发布我的作品</button></div>${state.failure?`<p role="alert">${E(state.failure)}</p><button class="cm-button ghost" data-cg="reload">重新读取</button>`:''}${!state.loaded?'<p role="status">正在读取作品…</p>':rows.length?rows.map(w=>`<article class="sa-item"><div><h3>${E(w.title)}</h3><p>${E({story:'故事',comic:'漫画',video:'视频',tool:'图像与声音'}[w.kind])} · ${w.chapters?.length||1}集 · ${w.visibility==='private'?'仅自己可见':'广场展示'} · ${E(w.status||'已发布')}</p>${w.demoOnly?'<small>静态演示成品，不开放收费。</small>':''}</div><div class="sa-actions">${link('查看作品','/app/community/'+encodeURIComponent(w.id))}<button type="button" class="cm-button ghost" data-cg="settings" data-id="${E(w.id)}">修改展示设置</button>${w.sourceURL?link('继续创作',w.sourceURL):''}</div></article>`).join(''):'<div class="sa-empty"><h3>还没有发布作品</h3><p>完成故事正文、漫画成稿或视频演示成品后，可以在这里发布。</p>'+link('去我的项目','/app/projects')+'</div>'}</section></div>`;}
 function income(){communityReady();return '<div class="sa-page">'+centerHeader('income')+PointsWallet.income()+'</div>';}
 function publicProfile(){const state=communityReady(),p=profile(),works=CommunityStudio.mine().filter(w=>w.visibility==='square'),listings=MarketStudio.all().filter(item=>item.local);return `<div class="sa-page"><div class="sa-actions">${link('返回创作者中心','/app/creator?tab=works')}${link('编辑创作者资料','/app/settings?tab=profile')}</div><header class="sa-public">${avatar(p)}<h1>${E(p.name)}</h1><p>${E(p.bio||'这里记录着我的创作。')}</p><small>公开主页本机预览 · 仅展示公开作品与已上架资产包</small></header><section class="cm-panel sa-form"><h2>作品</h2>${!state.loaded?'<p role="status">正在读取作品…</p>':works.map(w=>`<article class="sa-item"><strong>${E(w.title)}</strong>${link('查看作品','/app/community/'+encodeURIComponent(w.id))}</article>`).join('')||'<p>暂未公开作品。</p>'}</section><section class="cm-panel sa-form"><h2>资产包</h2>${listings.map(item=>`<article class="sa-item"><strong>${E(item.title)}</strong>${link('查看商品','/app/market/'+encodeURIComponent(item.id))}</article>`).join('')||'<p>暂未上架资产包。</p>'}</section></div>`;}
 async function avatarImage(file){if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a PNG, JPG, or WebP image up to 10 MB.');const bitmap=await createImageBitmap(file);try{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;const size=Math.min(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,160,160);return canvas.toDataURL('image/webp',0.8);}finally{bitmap.close();}}
 document.addEventListener('change',async event=>{if(event.target.id!=='sa-avatar-file')return;try{avatarDraft=await avatarImage(event.target.files[0]);document.getElementById('sa-avatar-preview').innerHTML=avatar({...profile(),avatar:avatarDraft});}catch(error){document.getElementById('sa-profile-message').textContent=error.message;}});
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-sa="change-avatar"]'))document.getElementById('sa-avatar-file')?.click();
  const option=event.target.closest('[data-action="sa-language"]');
  if(!option||!languages.some(language=>language.value===option.dataset.id))return;
  const dropdown=option.closest('.cm-activity-dropdown'),message=document.getElementById('sa-language-message');
  const previous=S.state.prefs.language;
  S.state.prefs.language=option.dataset.id;
  if(!S.save()){
   S.state.prefs.language=previous;
   message.textContent='Could not save your language preference. Try again.';
   message.hidden=false;
   return;
  }
  message.hidden=true;
  dropdown.outerHTML=languageDropdown();
  message.previousElementSibling.querySelector('summary').focus({preventScroll:true});
 });
 document.addEventListener('submit',async event=>{
  const form=event.target.closest('[data-sa-form="profile"]');if(!form)return;event.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;
  const message=form.querySelector('[role=status]'),data=new FormData(form);
  try{
   const name=String(data.get('name')).trim(),bio=String(data.get('bio')).trim(),picture=avatarDraft;
   if(!name||name.length>40||bio.length>300)throw Error('Enter a public name of 1–40 characters and a bio of up to 300 characters.');
   await StudioLibrary.changeMeta(meta=>{meta.profile={...profile(),...meta.profile,id:ownId,name,bio,...(picture===null?{}:{avatar:picture})};});
   S.render();S.toast('Creator profile saved.');
  }catch(error){message.textContent=error.message;}finally{if(button.isConnected)button.disabled=false;}
 });
 const route=C.route;C.route=ctx=>{if(ctx.parts[0]==='app'){if(ctx.parts[1]==='community'&&ctx.params.get('view')==='earnings'){ctx.parts=['app','creator'];ctx.params=new URLSearchParams('tab=income');history.replaceState(null,'','#/app/creator?tab=income');}if(['settings','billing','wallet'].includes(ctx.parts[1])){S.pageTitle='个人中心';if(ctx.parts[1]==='wallet')ctx.params.set('tab','wallet');return settings();}}return route(ctx);};
 window.StudioAccount={profile,author,avatar,centerHeader};
})();
