(()=>{
  'use strict';
  const M=ToolOCModel,E=Site.esc;
  const labels={main:'主形象',reference:'上传主参考',sheet:'图文设定表',front:'正面',side:'侧面',back:'背面',portrait:'头像',clothing:'服装与配饰',expression:'表情'};
  const baseRoles=['front','side','back','portrait'];
  const samplePrompt='陆川，黑色短发，海军蓝夹克、白色内搭、黑色长裤，随身背黑色斜挎包。都市爱情故事中的青年，外表平静，内心敏感。';
  let H,busy=false;
  const button=(text,action,primary=false,extra='')=>`<button type="button" class="cm-button ${primary?'primary':'ghost'}" data-oc="${action}" ${extra}>${text}</button>`;
  const file=(role,text)=>`<label class="oc-file">${text}<input type="file" data-oc-upload="${role}" accept="image/png,image/jpeg,image/webp"></label>`;
  function currentProfile(value){return value.profile||M.profileFromNotes(value.prompt,{sample:value.oc?.main.source==='sample'&&value.prompt===samplePrompt});}
  function profileCard(value){
    const profile=currentProfile(value),exists=!!value.profile||!!value.oc;
    const fields=items=>items.map(([key,label])=>`<div><dt>${label}</dt><dd data-oc-profile="${key}">${E(profile[key]||'尚未设定，可在左侧补充。')}</dd></div>`).join('');
    return `<section class="oc-profile" aria-label="人物介绍"><div class="oc-profile-heading"><h2>人物介绍</h2>${exists?button('编辑介绍','profile-edit'):''}</div>${exists?`<dl>${fields([['intro','人物简介'],['traits','性格与特点']])}</dl><details class="oc-more" data-oc-disclosure="background" ${value.openSections?.background?'open':''}><summary>背景与补充设定 <span>按需完善</span></summary><dl>${fields([['story','背景经历'],['notes','补充设定']])}</dl>${button('补充 / 编辑设定','profile-edit')}</details>`:'<p>从左侧描述开始，整理角色的身份、性格和故事。</p>'}</section>`;
  }
  function profileDialogue(value){return `<section class="oc-profile-dialogue"><h2>打磨人物介绍</h2><p>调整身份、性格或经历，已有角色图片继续沿用。</p><div class="oc-profile-chats" aria-live="polite">${(value.profileChats||[]).slice(-4).map(chat=>`<p class="${chat.role==='user'?'is-user':''}"><b>${chat.role==='user'?'你':'整理示例'}</b>${E(chat.text)}</p>`).join('')}</div><label>人物设定想怎么调整？<textarea data-oc-field="profileRequest" rows="3" placeholder="例如：他更开朗一点。也可以写「角色小故事：…」">${E(value.profileRequest||'')}</textarea></label><div class="ts-actions">${button(value.profile?'按创意重新整理':'整理人物介绍','profile-generate')}${button('发送介绍修改','profile-send',true)}</div><small>本机文字整理示例；更多自由对话待接入 AI，可直接编辑右侧介绍。</small></section>`;}
  function render(value){
    return `<main class="ts-page oc-page"><header class="ts-heading"><div>${Site.link('← 创作工具','/app/tools','cm-text-link')}<h1>OC 角色设定表</h1><p>让角色既有自己的样子，也有性格与故事。</p></div>${Site.link('我的工具成果','/app/tool-results','cm-button ghost')}</header><p class="ts-note">本机交互演示 · 预置角色用于体验整套输出；AI 生图、改图与自由对话待接入。</p>
      <div class="oc-workbench"><section class="ts-panel oc-input"><h2>描述你的角色</h2>
        <label>角色名字（可选）<input data-oc-field="name" value="${E(value.name||'')}" placeholder="给 TA 起个名字"></label>
        <label>外貌与初始创意<textarea rows="5" data-oc-field="prompt" placeholder="说说 TA 的样子、性格，或一段经历…">${E(value.prompt)}</textarea></label>
        <div class="oc-reference">${file('main','＋ 上传已有 OC 参考图')}${value.inputs.main?.src?`<img src="${E(value.inputs.main.src)}" alt="上传的角色参考"><small>${E(value.inputs.main.name)}</small>${button('移除参考','remove')}`:'<p>有图就沿用角色；没图可以先体验预置示例。</p>'}</div>
        <label>画风方向<select data-oc-field="option">${['日漫角色设定','清新韩漫','赛璐璐动画'].map(s=>`<option ${value.option===s?'selected':''}>${s}</option>`).join('')}</select></label>
        <p class="ts-note">一次生成角色主设定：正面、侧面、背面与头像，无需逐张操作。</p>
        <div class="ts-actions">${button('体验预置角色','sample')}${button(value.inputs.main?.src?'根据参考生成主设定':'生成角色主设定','main',true)}</div>
        <p id="ts-message" role="status"></p>
        ${profileDialogue(value)}
      </section><section class="ts-panel oc-output" id="oc-output">${output(value)}</section></div></main>`;
  }
  function controls(value,confirmed){return `<div class="oc-confirm"><p>${value.dirty?'描述或参考已变化，请重新生成角色主设定。':confirmed?'✓ 角色主设定已确认，可以保存或用于作品。':'确认这一套角色形象后，即可保存、下载或用于作品。'}</p>${button(confirmed?'✓ 已确认角色主设定':'确认角色主设定','confirm',!confirmed,(!value.oc?.main||value.dirty||confirmed?'disabled':''))}</div>`;}
  function outfitCard(value,confirmed){
    const outfit=value.oc?.outfit,request=value.outfitRequest||'';
    return `<section class="oc-outfit oc-more" aria-label="服饰配饰"><h2>服饰配饰</h2><p>保留角色外貌，调整服饰配饰。生成结果在上方主设定区比较，采用后才用于作品。</p><label>换装要求<textarea data-oc-field="outfitRequest" rows="3" placeholder="例如：换成米色风衣和白色运动鞋，去掉斜挎包，增加银色耳钉。">${E(request)}</textarea></label>${file('outfit','＋ 添加服饰配饰参考（可选）')}${value.inputs.outfit?.src?`<img class="oc-outfit-ref" src="${E(value.inputs.outfit.src)}" alt="服饰配饰参考">${button('移除服饰参考','outfit-remove')}`:''}<div class="ts-actions">${button('生成服饰配饰','outfit',true,confirmed?'':'disabled')}${value.oc.main.source==='sample'?button('体验换装示例','outfit-example',false,confirmed?'':'disabled'):''}</div>${outfit?.status==='pending-model'?`<div class="oc-outfit-status" role="status"><b>换装要求已记录 · 待接入生图</b><p>${E(outfit.request)}</p><small>这条要求尚未改图；保存和用于作品继续使用已确认的造型。可用「体验换装示例」试用上方的比较与采用流程。</small></div>`:''}</section>`;
  }
  function lookPreview(oc){
    const candidate=oc.outfitCandidate,comparing=!!(candidate||oc.originalLook),isNew=comparing&&oc.lookView==='new';
    const bundle=isNew?(candidate?.bundle||oc.bundle):(comparing?oc.originalLook.bundle:oc.bundle),complete=baseRoles.every(role=>bundle?.[role]);
    const note=candidate?'新造型尚未采用。保存、下载和用于作品继续使用当前已确认的造型。':oc.activeOutfit?'已采用新造型。切换原造型仅用于比较，保存和用于作品始终使用已采用的新造型。':'四项设定一起生成、一起确认；修改人物文字不需要重新生图。';
    return `${comparing?`<div class="oc-look-tabs" aria-label="造型比较">${button('原造型','look-original',false,`aria-pressed="${!isNew}"`)}${button(candidate?'新造型 · 待采用':'新造型 · 已采用','look-new',false,`aria-pressed="${isNew}"`)}</div>`:''}
      ${complete?`<div class="oc-base-board" aria-label="三视图与头像">${baseRoles.map(role=>`<figure><img src="${E(bundle[role].src)}" alt="角色${labels[role]}" data-oc-base="${role}"><figcaption>${labels[role]}</figcaption></figure>`).join('')}</div>`:`<div class="oc-preview"><img src="${E(oc.main.src)}" alt="角色原参考" data-oc-preview></div>`}
      ${comparing?`<div class="oc-look-info" role="status"><b>${E(isNew?(candidate?.description||oc.activeOutfit?.description):oc.originalLook.description)}</b>${isNew&&(candidate?.demo||oc.activeOutfit?.demo)?'<small>本地夹克配色示例 · 非 AI 换装，不代表下方自定义要求的生成结果。</small>':''}<p>${note}</p></div>`:`<p class="ts-note">${complete?note:oc.main.source==='upload'?'已保留上传原图。补齐三视图与头像需接入生图模型，本机不会用示例角色冒充你的角色。':'点击左侧「生成角色主设定」体验三视图＋头像。'}</p>`}
      ${candidate&&isNew?`<div class="oc-look-actions ts-actions">${button('采用这套造型','outfit-adopt',true)}${button(candidate.demo?'重新生成示例':'重新生成','outfit-regenerate')}</div>`:''}`;
  }
  function output(value){
    const oc=value.oc,confirmed=!value.dirty&&oc?.main&&oc.confirmedMainId===oc.main.id;
    const actions=confirmed?`${H.action('保存角色','save','',true)}${H.action('下载设定表','download')}${H.action('用于作品','bring')}`:'<p class="ts-note">确认主形象后，即可保存、下载或用于作品。</p>';
    return `${profileCard(value)}<div class="oc-visual-heading"><h2>角色主设定</h2><small>三视图 ＋ 头像</small></div>${oc?.main?`
      <div class="oc-result-title"><h2>${E(value.name||'未命名角色')}</h2><span>${oc.main.source==='sample'?'预置角色示例':'你的 OC 参考'}</span></div>
      ${lookPreview(oc)}
      <div id="oc-controls">${controls(value,confirmed)}</div>
      <div class="oc-result-actions ts-actions">${actions}</div>
      ${outfitCard(value,confirmed)}
      ${oc.tasks?.length?`<details class="oc-tasks"><summary>已记录的图片要求 · ${oc.tasks.length}</summary>${oc.tasks.map(task=>`<p><b>待接入改图：</b>${E(task.request)}<br><small>当前图像尚未变化</small></p>`).join('')}</details>`:''}`:'<div class="oc-empty"><span>✧</span><h2>一次建立角色的完整形象</h2><p>在左侧描述角色或上传参考。<br>生成后，这里一起展示三视图与头像。</p></div>'}`;
  }
  function sync(){document.getElementById('oc-output').innerHTML=output(H.value());}
  async function load(src){const image=new Image();image.src=src;await image.decode();return image;}
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function trimSample(c){const ctx=c.getContext('2d'),pixels=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,right=0;for(let x=0;x<c.width;x++){let count=0;for(let y=0;y<c.height;y++){const p=(y*c.width+x)*4;if(Math.min(pixels[p],pixels[p+1],pixels[p+2])<190)count++;}if(count>c.height*.025){left=Math.min(left,x);right=x;}}if(left>=right)return c;left=Math.max(0,left-8);right=Math.min(c.width,right+9);const cropped=canvas(right-left,c.height);cropped.getContext('2d').drawImage(c,left,0,right-left,c.height,0,0,right-left,c.height);return cropped;}
  async function compact(src,max=900){const image=await load(src),scale=Math.min(1,max/Math.max(image.width,image.height)),c=canvas(Math.round(image.width*scale),Math.round(image.height*scale));c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c.toDataURL('image/webp',.85);}
  function fit(ctx,image,x,y,w,h){const s=Math.min(w/image.width,h/image.height);ctx.drawImage(image,x+(w-image.width*s)/2,y+(h-image.height*s)/2,image.width*s,image.height*s);}
  function textLines(ctx,text,width){const lines=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of paragraph){if(ctx.measureText(line+char).width>width){lines.push(line);line='';}line+=char;}lines.push(line);}return lines;}
  async function compose(bundle,name,source,prompt='',profile=M.profileFromNotes(prompt),outfitDescription=''){
    const views=baseRoles.filter(role=>bundle[role]);
    if(views.length){const main=canvas(300*views.length,500),m=main.getContext('2d');m.fillStyle='#fff';m.fillRect(0,0,main.width,main.height);m.font='18px sans-serif';for(const [i,role]of views.entries()){fit(m,await load(bundle[role].src),i*300+8,8,284,450);m.fillStyle='#59616e';m.textAlign='center';m.fillText(labels[role],i*300+150,482);}bundle.main={src:main.toDataURL('image/webp',.85)};}
    else if(bundle.reference)bundle.main={...bundle.reference};
    if(!bundle.main?.src)throw Error('请先准备角色主形象。');
    const sheet=canvas(1000,1),ctx=sheet.getContext('2d');ctx.font='18px sans-serif';
    const blocks=[['人物简介',profile.intro],['性格与特点',profile.traits],['服饰与配饰',outfitDescription],['背景经历',profile.story],['补充设定',profile.notes]].filter(([,text])=>text).map(([title,text])=>({title,lines:textLines(ctx,text,920)}));
    const mainImage=await load(bundle.main.src),visualHeight=Math.min(580,940*mainImage.height/mainImage.width),extrasTop=106+visualHeight+24;
    const extras=['clothing','expression'].filter(role=>bundle[role]),textStart=extrasTop+30+Math.ceil(extras.length/2)*330;
    sheet.height=textStart+45+blocks.reduce((sum,block)=>sum+42+block.lines.length*26,0);
    ctx.fillStyle='#f7f6f2';ctx.fillRect(0,0,1000,sheet.height);ctx.fillStyle='#252c38';ctx.font='bold 30px sans-serif';ctx.fillText((name||'未命名角色').slice(0,16)+' / CHARACTER SHEET',35,53);ctx.font='17px sans-serif';ctx.fillStyle='#6c727b';ctx.fillText(source==='sample'?'预置角色 · 同一角色视觉参考':'原创角色 · 已有视觉参考',35,86);fit(ctx,mainImage,30,106,940,visualHeight);
    for(const [i,role]of extras.entries()){const x=35+(i%2)*480,y=extrasTop+Math.floor(i/2)*330;ctx.fillStyle='#fff';ctx.fillRect(x,y,450,280);fit(ctx,await load(bundle[role].src),x+10,y+10,430,260);ctx.fillStyle='#59616e';ctx.font='19px sans-serif';ctx.fillText(labels[role],x,y+307);}
    let row=textStart;for(const block of blocks){ctx.fillStyle='#313746';ctx.font='bold 18px sans-serif';ctx.fillText(block.title,35,row);row+=28;ctx.fillStyle='#59616e';ctx.font='18px sans-serif';for(const line of block.lines){ctx.fillText(line,35,row);row+=26;}row+=14;}
    ctx.font='14px sans-serif';ctx.fillStyle='#7a7e86';ctx.fillText('Cimora · 人物文字与视觉设定 / 本机演示 / AI 生图与改图未接入',35,sheet.height-18);bundle.sheet={src:sheet.toDataURL('image/png')};return bundle;
  }
  async function exampleBundle(name,prompt=samplePrompt,profile=M.profileFromNotes(prompt,{sample:prompt===samplePrompt})){const base='comic-studio/examples/romance-two/assets/luchuan-',main=await load(base+'main.jpg'),bundle={};for(const [i,role]of ['front','side','back'].entries()){const c=canvas(330,main.height);c.getContext('2d').drawImage(main,i*main.width/3,0,main.width/3,main.height,0,0,330,main.height);bundle[role]={src:trimSample(c).toDataURL('image/webp',.88),source:'sample'};}bundle.portrait={src:await compact(base+'portrait.jpg',650),source:'sample'};return compose(bundle,name,'sample',prompt,profile);}
  async function outfitExample(value){
    M.assertConfirmed(value);if(value.oc.main.source!=='sample')throw Error('换装示例仅用于预置角色，上传角色等待接入改图。');
    const variant=value.oc.outfitCandidate?.variant==='burgundy'?'green':'burgundy',bundle={};
    const source=await exampleBundle(value.name,value.prompt,currentProfile(value));
    for(const role of baseRoles){const image=await load(source[role].src),c=canvas(image.width,image.height),ctx=c.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;for(let p=0;p<d.length;p+=4){const r=d[p],g=d[p+1],b=d[p+2];if(b>r*1.12&&b>g*1.04&&b-r>7){d[p]=variant==='burgundy'?Math.min(255,b*1.12):g*.8;d[p+1]=variant==='burgundy'?r*.88:Math.min(255,b*1.05);d[p+2]=variant==='burgundy'?g*.95:r*.9;}}ctx.putImageData(pixels,0,0);bundle[role]={src:c.toDataURL('image/webp',.88),source:'local-color-demo'};}
    const candidate={id:Site.id('outfit-demo'),mainId:value.oc.main.id,bundle,description:(variant==='burgundy'?'酒红色':'墨绿色')+'夹克；保留白色内搭、深色长裤和黑色斜挎包。',demo:true,variant};
    H.write({oc:M.stageOutfit(value,candidate)});sync();document.querySelector('.oc-look-tabs')?.scrollIntoView({behavior:'smooth',block:'center'});
  }
  async function updateProfile(value,profile,extra={}){
    const patch=M.profilePatch(value,profile);
    if(value.oc?.bundle)patch.oc={...value.oc,bundle:await compose({...value.oc.bundle},value.name,value.oc.main.source,value.prompt,patch.profile,value.oc.activeOutfit?.description)};
    H.write({...patch,sheetDirty:false,...extra,generatedAt:new Date().toISOString()});
  }
  async function run(action,node){
    let value=H.value();
    if(action==='sample'){H.write({prompt:samplePrompt,name:'陆川',option:'日漫角色设定',inputs:{},oc:null,ready:false,dirty:false,editRequest:'',outfitRequest:'',profile:M.profileFromNotes(samplePrompt,{sample:true}),profileRequest:'',profileChats:[],openSections:{}});H.render();return;}
    if(action==='remove'){H.write(M.invalidate(value,{inputs:{}}));H.render();return;}
    if(action==='main'){if(!value.prompt.trim()&&!value.inputs.main?.src)throw Error('请描述角色，或上传已有 OC。');const source=M.sourceKind(value),profile=value.profile||M.profileFromNotes(value.prompt,{sample:source==='sample'&&value.prompt===samplePrompt}),bundle=source==='sample'?await exampleBundle(value.name,value.prompt,profile):await compose({reference:{src:value.inputs.main.src,source:'upload'}},value.name,source,value.prompt,profile);const oc={...M.main(value,{src:bundle.main.src,source},Site.id('oc-main')),bundle};if(source==='upload')oc.tasks.push({target:'main',request:'根据上传角色参考，一次生成正面、侧面、背面与头像，保留角色外貌和原有服饰。',scopes:baseRoles,status:'pending-model',at:new Date().toISOString()});H.write({oc,profile,ready:false,dirty:false,generatedAt:new Date().toISOString()});H.render();return;}
    if(action==='confirm'){H.write({oc:M.confirm(value),ready:true,generatedAt:new Date().toISOString()});sync();return;}
    if(action==='outfit'){M.assertConfirmed(value);if(!value.outfitRequest?.trim()&&!value.inputs.outfit?.src)throw Error('请描述想换的服饰配饰，或添加服饰参考。');const outfit={request:value.outfitRequest?.trim()||'按服饰参考为当前角色换装。',status:'pending-model',mainId:value.oc.main.id,sourcePrompt:value.oc.main.prompt,sourceStyle:value.oc.main.style,reference:value.inputs.outfit||null,outputRoles:baseRoles,at:new Date().toISOString()};H.write({oc:{...value.oc,outfit}});sync();return;}
    if(action==='outfit-example'||action==='outfit-regenerate'){if(action==='outfit-regenerate'&&!value.oc?.outfitCandidate?.demo){await run('outfit');return;}await outfitExample(value);return;}
    if(action==='look-original'||action==='look-new'){H.write({oc:{...value.oc,lookView:action==='look-original'?'original':'new'}});sync();return;}
    if(action==='outfit-adopt'){const oc=M.adoptOutfit(value);oc.bundle=await compose(oc.bundle,value.name,oc.main.source,value.prompt,currentProfile(value),oc.activeOutfit.description);oc.main={...oc.main,src:oc.bundle.main.src};H.write({oc,generatedAt:new Date().toISOString()});sync();return;}
    if(action==='outfit-remove'){const inputs={...value.inputs};delete inputs.outfit;H.write({inputs});H.render();return;}
    if(action==='profile-generate'){if(!value.prompt.trim())throw Error('请先写下角色创意。');const profile=M.profileFromNotes(value.prompt,{sample:!value.inputs.main?.src&&value.prompt===samplePrompt});await updateProfile(value,profile,{profileChats:[...(value.profileChats||[]),{role:'assistant',text:'已按当前创意整理人物介绍，未提供的设定留待补充。'}]});H.render();return;}
    if(action==='profile-send'){if(!value.profileRequest?.trim())throw Error('请写下人物介绍的调整方向。');const result=M.profileReply(currentProfile(value),value.profileRequest);const chats=[...(value.profileChats||[]),{role:'user',text:value.profileRequest},{role:'assistant',text:result.reply,pending:!result.applied}];if(result.applied)await updateProfile(value,result.profile,{profileChats:chats,profileRequest:''});else H.write({profileChats:chats,profileRequest:''});H.render();return;}
    if(action==='profile-edit'){const profile=currentProfile(value);Site.modal('编辑人物介绍',`<div class="oc-profile-form">${[['intro','人物简介',600],['traits','性格与特点',360]].map(([key,label,max])=>`<label>${label}<textarea id="oc-profile-${key}" rows="3" maxlength="${max}">${E(profile[key]||'')}</textarea></label>`).join('')}<details class="oc-more" ${value.openSections?.background?'open':''}><summary>背景与补充设定 <span>选填</span></summary><label>背景经历<textarea id="oc-profile-story" rows="4" maxlength="1000">${E(profile.story||'')}</textarea></label><label>补充设定<textarea id="oc-profile-notes" rows="4" maxlength="1800" placeholder="喜好、口头禅、秘密、能力……按自己的想法补充">${E(profile.notes||'')}</textarea></label></details><p>只更新人物文字设定，已有角色图片继续沿用。</p></div>`,button('保存人物介绍','profile-save',true));return;}
    if(action==='profile-save'){const profile={source:'edited'};for(const key of ['intro','traits','story','notes'])profile[key]=document.getElementById('oc-profile-'+key).value;await updateProfile(value,profile);Site.close();H.render();return;}
  }
  async function snapshot(value){M.assertConfirmed(value);const profile=currentProfile(value),outfit=value.oc.activeOutfit||null,bundle=await compose({...value.oc.bundle},value.name,value.oc.main.source,value.prompt,profile,outfit?.description);return {toolId:'oc-sheet',title:(value.name||'OC')+' · 角色设定表',kind:'image',prototype:true,character:{name:value.name||'未命名角色',profile:JSON.parse(JSON.stringify(profile)),outfit},prompt:outfit?[profile.intro,'服饰与配饰：'+outfit.description].filter(Boolean).join('\n'):value.prompt,params:{option:value.option,source:value.oc.main.source,mainId:value.oc.main.id,layout:'three-views-and-portrait',activeOutfitId:outfit?.id||null},inputs:{},images:['sheet','main','portrait','clothing','expression','front','side','back','reference'].filter(role=>bundle[role]).map(role=>({role,src:bundle[role].src,source:bundle[role].source||'composed'})),edits:{tasks:value.oc.tasks||[],profileChats:value.profileChats||[],outfit:value.oc.outfit||null},notice:outfit?.demo?'已采用本地夹克配色示例，非实时AI换装；自定义换装要求尚未执行。':value.oc.main.source==='sample'?'预置同角色素材演示，非实时AI生成；待执行换装尚未改变图像。':'沿用上传参考整理设定表；空缺视图待补充，未调用AI生图。',createdAt:value.generatedAt};}
  function init(helpers){H=helpers;
    document.addEventListener('toggle',event=>{const node=event.target,key=node.dataset?.ocDisclosure;if(!key)return;try{const value=H.value();if(!!value.openSections?.[key]!==node.open)H.write({openSections:{...value.openSections,[key]:node.open}});}catch(error){H.notice(error);}},true);
    document.addEventListener('click',async event=>{const node=event.target.closest('[data-oc]');if(!node)return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;busy=true;node.disabled=true;try{await run(node.dataset.oc,node);}catch(error){H.notice(error);}finally{busy=false;if(node.isConnected)node.disabled=false;}},true);
    document.addEventListener('input',event=>{const node=event.target;if(!node.dataset.ocField||node.tagName==='SELECT')return;event.stopImmediatePropagation();try{const value=H.value(),field=node.dataset.ocField,textOnly=['profileRequest','outfitRequest'].includes(field),patch=textOnly||field==='name'?{[field]:node.value}:M.invalidate(value,{[field]:node.value});if(field==='prompt'&&value.profile?.source!=='edited')patch.profile=null;H.write(patch);if(!textOnly)sync();}catch(error){H.notice(error);}},true);
    document.addEventListener('change',async event=>{const node=event.target;if(!node.dataset.ocUpload&&!node.dataset.ocField)return;event.stopImmediatePropagation();if(node.dataset.ocField&&node.tagName!=='SELECT')return;try{let value=H.value();if(node.dataset.ocField){H.write(M.invalidate(value,{[node.dataset.ocField]:node.value}));sync();return;}const f=node.files[0];if(!f)return;if(!/^image\/(png|jpeg|webp)$/.test(f.type)||f.size>1500000)throw Error('请选择 1.5 MB 以内的 PNG、JPG 或 WebP 图片。');const raw=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('文件读取失败'));reader.readAsDataURL(f);});const src=await compact(raw),role=node.dataset.ocUpload;value=H.value();if(role==='main')H.write(M.invalidate(value,{inputs:{...value.inputs,main:{name:f.name,type:f.type,src}}}));else if(role==='outfit'){H.write({inputs:{...value.inputs,outfit:{name:f.name,type:f.type,src}}});}H.render();}catch(error){node.value='';H.notice(error);}},true);
  }
  window.ToolOC={render,snapshot,init,samplePrompt};
})();
