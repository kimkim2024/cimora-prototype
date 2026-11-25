/* 个人中心的套餐展示与用量演示；流水样本不写入任务、余额或计费记录。 */
(()=>{
 'use strict';
 const S=Site,C=Cimora,E=S.esc;
 const plans={
  Free:{monthly:0,yearly:0,description:'Try the studio with a demo workspace.',features:['Try demo tools anonymously','One demo workspace','Showcase and templates','Download local results']},
  Creator:{monthly:19,yearly:15,description:'For independent storytellers.',features:['Indie creator projects and assets','Comic and video creation','Local edits and version history','Budget and generation records']},
  Studio:{monthly:59,yearly:47,description:'For teams producing together.',features:['Studio projects and shared assets','Member and seat setup demo','Diff review and batch delivery','Quality, task and cost dashboard']},
 };
 const statusTones={'生成中':'generating','已返还':'refunded','生成失败':'failed','已完成':'completed'};
 let period='today',customStart='',customEnd='';
 function day(at=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);}
 function shiftDate(date,offset){const at=new Date(date+'T12:00:00+08:00');at.setUTCDate(at.getUTCDate()+offset);return day(at);}
 function examples(today=day()){
  const records=[
   {date:today,time:'09:12',title:'《离城之前》· 整理第1章正文',model:'GPT-4.1',type:'debit',amount:6,status:'已完成'},
   {date:today,time:'10:05',title:'《星海邮局》· 第1页整页生成',model:'GPT Image',type:'debit',amount:24,status:'已完成'},
   {date:today,time:'10:40',title:'角色配音 · 陆川声音试听',model:'MiniMax Speech',type:'debit',amount:18,status:'已完成'},
   {date:today,time:'11:02',title:'《雨停之前》· 第2镜生成',model:'Kling',type:'debit',amount:12,status:'生成失败'},
   {date:today,time:'11:03',title:'《雨停之前》· 第2镜失败返还',model:'Kling',type:'refund',amount:12,status:'已返还'},
   {date:today,time:'11:08',title:'《星海邮局》· 第2页整页生成',model:'GPT Image',type:'estimate',amount:6,status:'生成中'},
   {date:shiftDate(today,-1),time:'16:20',title:'《离城之前》· 第2章续写',model:'GPT-4.1',type:'debit',amount:8,status:'已完成'},
   {date:shiftDate(today,-3),time:'14:35',title:'《星海邮局》· 主角形象生成',model:'GPT Image',type:'debit',amount:20,status:'已完成'},
   {date:shiftDate(today,-6),time:'09:45',title:'《雨停之前》· 第1镜生成',model:'Kling',type:'debit',amount:36,status:'已完成'},
   {date:shiftDate(today,-7),time:'17:10',title:'场景设计 · 雨夜车站',model:'GPT Image',type:'debit',amount:16,status:'已完成'},
   {date:shiftDate(today,-29),time:'10:30',title:'《离城之前》· 故事大纲',model:'GPT-4.1',type:'debit',amount:4,status:'已完成'},
   {date:shiftDate(today,-30),time:'15:50',title:'角色配音 · 开场旁白',model:'MiniMax Speech',type:'debit',amount:10,status:'已完成'}
  ];
  // Stable illustrative history makes scrolling and date comparisons repeatable.
  const samples=[
   {title:'《离城之前》· 第{n}章对白润色',model:'GPT-4.1',amount:6},
   {title:'《星海邮局》· 第{n}页分镜生成',model:'GPT Image',amount:18},
   {title:'《雨停之前》· 第{n}镜动态画面',model:'Kling',amount:30},
   {title:'角色配音 · 第{n}段旁白试听',model:'MiniMax Speech',amount:8},
   {title:'《深海来信》· 第{n}幕环境与光影参考图',model:'GPT Image',amount:16},
   {title:'《末班车录音》· 第{n}场故事续写',model:'GPT-4.1',amount:4}
  ];
  for(let offset=0;offset<30;offset++){
   const count=offset===0?24:4;
   for(let index=0;index<count;index++){
    const sample=samples[(offset+index)%samples.length],minute=offset===0?420+index*5:540+index*125+offset;
    records.push({date:shiftDate(today,-offset),time:String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0'),title:sample.title.replace('{n}',String(offset*4+index+3)),model:sample.model,type:'debit',amount:sample.amount,status:'已完成'});
   }
  }
  return records;
 }
 function summarize(records,today=day()){
  const sum=(type,rows)=>rows.filter(row=>row.type===type).reduce((n,row)=>n+row.amount,0),daily=records.filter(row=>row.date===today);
  return {consumed:Math.max(0,sum('debit',daily)-sum('refund',daily)),estimated:sum('estimate',records)};
 }
 function usageBars(records,today){
  const charges=Array(12).fill(0);
  for(const row of records){if(row.date===today&&row.type==='debit')charges[Math.floor(Number(row.time.slice(0,2))/2)]+=row.amount;}
  const max=Math.max(...charges);
  if(!max)return '';
  const hour=n=>String(n).padStart(2,'0')+':00';
  const label=(amount,index)=>`${hour(index*2)}–${hour(index*2+2)}: ${amount} credits`;
  return `<div class="sa-credit-chart" role="img" aria-label="Today’s charges by two-hour period, Beijing time. ${E(charges.map(label).join('; '))}">
   <span>Charges by time</span><div class="sa-credit-bars" aria-hidden="true">${charges.map((amount,index)=>`<i title="${E(label(amount,index))}" style="--bar-fill:${amount/max*100}%"></i>`).join('')}</div>
  </div>`;
 }
 function balanceGauge(balance){
  const {allowance,percent}=C.creditGauge(balance),label=Math.round(percent)+'%';
  const track=percent===0?100:Math.max(0,90-percent);
  return `<div class="sa-balance-gauge" role="progressbar" aria-label="Credits remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${label} remaining, ${balance.toLocaleString('en-US')} of ${allowance.toLocaleString('en-US')} credits">
   <svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke-width="9" stroke-linecap="round">
    <g transform="rotate(-90 50 50)">
     ${track?`<circle class="sa-balance-gauge-track" cx="50" cy="50" r="45" pathLength="100" stroke-dasharray="${track} 100" stroke-dashoffset="${percent===0?0:-(percent+5)}"/>`:''}
     ${percent?`<circle class="sa-balance-gauge-fill" cx="50" cy="50" r="45" pathLength="100" style="--balance-percent:${percent}"/>`:''}
    </g>
   </svg><span aria-hidden="true">${label}</span>
  </div>`;
 }
 function balanceCard(balance,title='Remaining credits'){
  return `<section class="sa-credit-stat sa-credit-balance" aria-label="${E(title)}">
   <div class="sa-balance-summary"><h3>${E(title)}</h3><div><strong>${balance.toLocaleString('en-US')}<small>Credits</small></strong></div></div>
   ${balanceGauge(balance)}
  </section>`;
 }
 function dateRange(value,today=day(),start=customStart,end=customEnd){return value==='custom'?{start:start||today,end:end||today}:{start:shiftDate(today,value==='7'?-6:value==='30'?-29:0),end:today};}
 function filterRecords(records,range){return records.filter(row=>row.date>=range.start&&row.date<=range.end).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));}
 function rangeError(start,end,today=day()){
  const valid=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if(!valid(start)||!valid(end))return 'Enter valid dates in YYYY-MM-DD format.';
  if(start>end)return 'The start date must be on or before the end date.';
  if(end>today)return 'The end date must be on or before today.';
  return '';
 }
 function subscription(profile){
  return `<section id="sa-subscription" class="sa-subscription" aria-label="Your plan">
   <div class="sa-plan-card">
    <span class="sa-plan-status">Current plan</span>
    <div class="sa-plan-profile">
     <img src="${E(profile.avatar||'assets/avatar-1-sq.png')}" alt="" width="56" height="56">
     <div><h2>${E(profile.name)}</h2><p>Creator</p></div>
    </div>
    <div class="sa-plan-actions">
     <button type="button" class="sa-plan-action sa-plan-action-primary" data-su="plans">Switch plan</button>
     ${C.link('Plan details','/pricing','sa-plan-action')}
    </div>
   </div>
   <div class="sa-plan-accent" aria-hidden="true"></div>
  </section>`;
 }
 function usage(){
  const today=day(),records=examples(today),value=summarize(records,today),range=dateRange(period,today),rows=filterRecords(records,range),balance=PointsWallet.balance();
  const generating=records.some(row=>row.type==='estimate'&&row.status==='生成中');
  return `<div id="sa-usage">
   <div class="sa-points-grid">
    ${balanceCard(balance)}
    <section class="sa-credit-stat sa-credit-used"><div><h3>Net credits used today</h3><strong>${value.consumed.toLocaleString('en-US')}<small>Credits</small></strong></div>${usageBars(records,today)}</section>
    <section class="sa-credit-stat sa-credit-pending">
     <div><h3>Estimated pending usage</h3><strong>${value.estimated.toLocaleString('en-US')}<small>Credits</small></strong><p class="sa-credit-pending-note">${value.estimated?'Not yet charged':'No pending charges'}</p></div>
     ${value.estimated?`<span class="sa-credit-wave" data-running="${generating}" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i style="--wave-index:${i}"></i>`).join('')}</span>`:''}
    </section>
   </div>
   <section class="cm-panel sa-form" aria-labelledby="sa-usage-title">
   <h2 id="sa-usage-title">积分使用明细</h2>
   <div class="sa-periods" role="group" aria-label="明细时间范围">${[['today','今日'],['7','最近 7 天'],['30','最近 30 天'],['custom','自定义时间']].map(([id,label])=>`<button type="button" data-su-period="${id}" aria-pressed="${period===id}">${label}</button>`).join('')}</div>
   ${period==='custom'?`<form data-su-range class="sa-range-form"><div class="sa-range-fields">
    ${CimoraDatePicker.render({id:'sa-start-date',name:'start',label:'Start date',value:range.start,max:today})}
    ${CimoraDatePicker.render({id:'sa-end-date',name:'end',label:'End date',value:range.end,max:today})}
    <button type="submit" class="cm-button primary">Apply</button>
   </div><p id="sa-range-error" role="alert"></p></form>`:''}
   <p class="sa-note sa-range-summary" role="status">${range.start===range.end?E(range.start):E(range.start)+' 至 '+E(range.end)} · 共 ${rows.length} 条记录 · 北京时间</p>
   <div id="sa-usage-records">${rows.length?`<div class="sa-ledger-wrap sa-usage-scroll" role="region" aria-label="积分使用明细，可滚动" tabindex="0"><table class="sa-ledger sa-usage-ledger"><thead><tr><th scope="col">创作任务 / 时间</th><th scope="col">使用模型</th><th scope="col">状态</th><th scope="col">积分变化</th></tr></thead><tbody>${rows.map(row=>`<tr><td><strong>${E(row.title)}</strong><small>${E(row.date)} ${E(row.time)}</small><small class="sa-mobile-model">${E(row.model)}</small></td><td>${E(row.model)}</td><td><span class="sa-ledger-status" data-status="${statusTones[row.status]||''}">${E(row.status)}</span></td><td class="sa-usage-credit" data-type="${row.type}"><span class="sa-usage-credit-amount">${row.type==='estimate'?'Estimated ':row.type==='refund'?'+':'−'}${row.amount} ${row.amount===1?'credit':'credits'}</span>${row.type==='estimate'?'<small>Not yet charged</small>':''}</td></tr>`).join('')}</tbody></table></div>`:`<div class="sa-usage-empty">No usage records</div>`}</div>
   <p class="sa-note">${C.link('钱包收支明细','/app/settings?tab=wallet','')}</p></section></div>`;
 }
 function refresh(focus){const target=document.getElementById('sa-usage');if(target){target.outerHTML=usage();if(focus)document.querySelector(focus)?.focus({preventScroll:true});}}
 function isCurrentChoice(name,cycle){return name===S.state.plan&&(name==='Free'||cycle===S.state.cycle);}
 function updatePlanSelection(form){
  const cycle=form.elements.cycle.value,selected=form.elements.plan.value;
  for(const choice of form.querySelectorAll('.sa-pricing-choice')){
   const name=choice.dataset.saPlan,same=isCurrentChoice(name,cycle),chosen=name===selected&&!same;
   choice.closest('.sa-pricing-card').dataset.selected=String(chosen);
   choice.disabled=same;
   choice.textContent=same?'Current plan':chosen?'Confirm switch':name===S.state.plan?'Change billing':`Choose ${name}`;
  }
  form.querySelector('[role=status]').textContent=selected?`${selected} selected. Confirm switch to apply.`:`Showing ${cycle} prices.`;
 }
 function planPreview(form,animatePrices=false){
  const cycle=form.elements.cycle.value,yearly=cycle==='yearly';
  form.querySelector('.sa-pricing-cards').innerHTML=Object.entries(plans).map(([name,plan])=>{
   const price=plan[cycle],featured=name==='Creator';
   return `<li class="sa-pricing-card">
    <div class="sa-pricing-card-heading"><h3>${name}</h3>${featured?'<span class="sa-pricing-recommended">Recommended</span>':''}</div>
    <p class="sa-pricing-description">${plan.description}</p>
    <div class="sa-pricing-cost" ${animatePrices&&price?'data-price-change':''}>
     <div class="sa-pricing-price">${yearly&&price?`<del>$${plan.monthly}</del>`:''}<strong>$${price}</strong><span>/ month</span></div>
     <p class="sa-pricing-caption">${!price?'Free forever':yearly?`Billed $${price*12} yearly`:'Billed monthly'}</p>
    </div>
    <button type="button" class="sa-pricing-choice" data-sa-plan="${name}"></button>
    <ul class="sa-pricing-features">${plan.features.map(feature=>`<li>${feature}</li>`).join('')}</ul>
   </li>`;
  }).join('');
  updatePlanSelection(form);
 }
 function openPricingDialog(title,subtitle,content){
  S.modal(title,`<div class="sa-pricing-form">
   <div class="sa-pricing-heading">
    <h2 id="sa-pricing-title">${E(title)}</h2>
    <p id="sa-pricing-subtitle">${E(subtitle)}</p>
   </div>
   ${content}
  </div>`,'',true);
  const dialog=document.getElementById('sa-pricing-title').closest('.dialog');
  dialog.setAttribute('data-animate-close','');
  dialog.setAttribute('aria-labelledby','sa-pricing-title');
  dialog.setAttribute('aria-describedby','sa-pricing-subtitle');
  dialog.querySelector('header').remove();
  return dialog;
 }
 function choosePlan(initialPlan=S.state.plan,initialCycle=S.state.cycle){
  const selected=Object.hasOwn(plans,initialPlan)?initialPlan:'Free',cycle=initialCycle==='yearly'?'yearly':'monthly';
  const saving=Math.max(...Object.values(plans).map(plan=>plan.monthly?Math.round((1-plan.yearly/plan.monthly)*100):0));
  const dialog=openPricingDialog('Plans and Pricing','Find the right plan for your creative workspace and save with yearly billing.',`<form data-su-form="plan" id="sa-switch-plan">
   <fieldset class="sa-pricing-billing"><legend class="sa-pricing-announcement">Billing period</legend><div>
    <label><input name="cycle" type="radio" value="monthly" ${cycle==='monthly'?'checked':''}><span>Monthly</span></label>
    <label><input name="cycle" type="radio" value="yearly" ${cycle==='yearly'?'checked':''}><span>Yearly <small>Save up to ${saving}%</small></span></label>
   </div></fieldset>
   <input type="hidden" name="plan" value="">
   <ul class="sa-pricing-cards" aria-label="Available plans"></ul>
   <p class="sa-pricing-announcement" role="status" aria-live="polite"></p>
   <p id="sa-plan-message" role="alert"></p>
  </form>`);
  const form=dialog.querySelector('#sa-switch-plan');
  planPreview(form);
  if(!isCurrentChoice(selected,cycle)&&selected!==S.state.plan){
   requestAnimationFrame(()=>form.querySelector(`[data-sa-plan="${selected}"]`)?.focus());
  }
 }
 function savePlan(name,cycle){
  if(!Object.hasOwn(plans,name)||!['monthly','yearly'].includes(cycle))throw Error('Choose a valid plan and billing period.');
  const previous={plan:S.state.plan,cycle:S.state.cycle};Object.assign(S.state,{plan:name,cycle});
  if(!S.save()){Object.assign(S.state,previous);throw Error('Could not save your plan. Try again.');}
  S.close();S.route('/app/settings');S.render();S.toast('Demo plan updated. No payment was made.');
 }
 document.addEventListener('click',event=>{
  const choice=event.target.closest('[data-sa-plan]');
  if(choice){
   const form=choice.form,name=choice.dataset.saPlan,cycle=form.elements.cycle.value;
   if(isCurrentChoice(name,cycle))return;
   const message=form.querySelector('#sa-plan-message');
   if(form.elements.plan.value===name){
    try{savePlan(name,cycle);}catch(error){message.textContent=error.message;}
    return;
   }
   message.textContent='';
   form.elements.plan.value=name;
   updatePlanSelection(form);
   choice.focus({preventScroll:true});
   return;
  }
  const preset=event.target.closest('[data-su-period]');
  if(preset){const previous=dateRange(period);period=preset.dataset.suPeriod;if(period==='custom'&&!customStart){customStart=previous.start;customEnd=previous.end;}refresh('[data-su-period="'+period+'"]');return;}
  if(event.target.closest('[data-su="plans"]'))choosePlan();
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest('[data-su-range]');if(!form)return;event.preventDefault();
  const start=form.elements.start.value.trim(),end=form.elements.end.value.trim(),error=rangeError(start,end);
  form.querySelector('#sa-range-error').textContent=error;
  for(const field of [form.elements.start,form.elements.end])field.setAttribute('aria-invalid',String(!!error));
  if(error)return;customStart=start;customEnd=end;refresh('[data-su-range] button[type=submit]');
 });
 document.addEventListener('change',event=>{
  const form=event.target.form;
  if(event.target.name!=='cycle'||form?.id!=='sa-switch-plan')return;
  form.elements.plan.value='';
  form.querySelector('#sa-plan-message').textContent='';
  planPreview(form,true);
 });
 const original=S.workspace.onClick;S.workspace.onClick=(action,element,...args)=>{if(action==='confirm-plan'){try{savePlan(element.dataset.plan,element.dataset.cycle||S.ui.priceCycle||S.state.cycle);}catch(error){S.toast(error.message);}return true;}return original(action,element,...args);};
 const onPublic=S.public.onClick;S.public.onClick=(action,element,...args)=>{
  if(action==='price-cycle'){S.ui.priceCycle=element.dataset.value;S.render();return true;}
  if(action==='choose-plan'){
   const name=element.dataset.plan,cycle=S.ui.priceCycle||S.state.cycle;
   S.modal('体验 '+name+' 方案',`<p>将把本机演示账户切换为 ${E(name)}（${cycle==='yearly'?'按年':'按月'}）。这不是购买，不会扣款或创建真实订阅。</p>`,`<button class="button ghost" data-act="close">取消</button><button class="button primary" data-act="confirm-plan" data-plan="${E(name)}" data-cycle="${E(cycle)}">确认演示方案</button>`);return true;
  }
  return onPublic(action,element,...args);
 };
 window.AccountUsage={subscription,usage,balanceCard,openPricingDialog,day,examples,summarize,dateRange,filterRecords,rangeError};
 const start=S.start;S.start=()=>{start();const parameters=S.context.params,name=parameters.get('offer'),cycle=parameters.get('cycle');if(S.context.path!=='/app/settings'||!Object.hasOwn(plans,name)||!['monthly','yearly'].includes(cycle))return;choosePlan(name,cycle);parameters.delete('offer');parameters.delete('cycle');history.replaceState(null,'',location.pathname+location.search+'#'+S.context.path+(parameters.size?'?'+parameters:''));};
})();
