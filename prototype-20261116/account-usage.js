/* 个人中心的套餐展示与用量演示；流水样本不写入任务、余额或计费记录。 */
(()=>{
 'use strict';
 const S=Site,C=Cimora,E=S.esc;
 const plans={Free:{monthly:0,yearly:0,quota:100},Creator:{monthly:19,yearly:15,quota:1000},Studio:{monthly:59,yearly:47,quota:3000}};
 let demo=false,selectedDate='';
 function day(at=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);}
 function examples(today=day()){
  return [
   {date:today,time:'09:12',title:'故事创作 · 整理第1集正文',source:'故事创作',type:'debit',amount:6,status:'已完成'},
   {date:today,time:'10:05',title:'漫画创作 · 第1页整页生成',source:'漫画创作',type:'debit',amount:24,status:'已完成'},
   {date:today,time:'10:40',title:'角色配音 · 声音试听',source:'创作工具',type:'debit',amount:18,status:'已完成'},
   {date:today,time:'11:02',title:'视频创作 · 第2镜生成',source:'视频创作',type:'debit',amount:12,status:'生成失败'},
   {date:today,time:'11:03',title:'第2镜生成失败 · 退还额度',source:'视频创作',type:'refund',amount:12,status:'已退还'},
   {date:today,time:'11:08',title:'漫画创作 · 第2页整页生成',source:'漫画创作',type:'reserve',amount:6,status:'生成中 · 预占'}
  ];
 }
 function summarize(records,date,quota){
  const rows=records.filter(row=>row.date===date),total=type=>rows.filter(row=>row.type===type).reduce((sum,row)=>sum+row.amount,0);
  const consumed=Math.max(0,total('debit')-total('refund')),reserved=total('reserve');
  return {consumed,reserved,remaining:Math.max(0,quota-consumed-reserved),refunded:total('refund')};
 }
 function subscription(){
  const name=Object.hasOwn(plans,S.state.plan)?S.state.plan:'Free',p=plans[name],yearly=S.state.cycle==='yearly';
  return `<section id="sa-subscription" class="cm-panel sa-form sa-subscription"><div><span class="cm-kicker">YOUR PLAN</span><h2>${E(name)} <span class="sa-demo-badge">当前演示套餐</span></h2><p>${name==='Free'?'免费体验':yearly?'按年 · $'+p.yearly+'/月，$'+p.yearly*12+'/年':'按月 · $'+p.monthly+'/月'}</p><small>未开通真实订阅；沿用现有套餐定价。模型调用费用另计，生成前确认。</small></div><div class="sa-actions"><button type="button" class="cm-button primary" data-su="plans">切换套餐</button>${C.link('套餐详情','/pricing','cm-button ghost')}</div></section>`;
 }
 function usage(){
  const today=day(),date=selectedDate||today,p=plans[S.state.plan]||plans.Free,rows=demo?examples(today).filter(row=>row.date===date):[],value=summarize(rows,date,p.quota);
  return `<section id="sa-usage" class="cm-panel sa-form"><div class="sa-heading"><div><h2>每日生成额度 ${demo?'<span class="sa-demo-badge">用量演示</span>':''}</h2><p>${demo?'示例配额与流水，仅用于体验，不是套餐承诺或实际扣费。':'额度与用量账本待接入，当前本机体验不产生模型扣费。'}</p></div><button type="button" class="cm-button ghost" data-su="${demo?'live':'demo'}">${demo?'回到我的用量':'查看用量演示'}</button></div><div class="sa-quota-grid"><div><span>每日额度</span><strong>${demo?p.quota.toLocaleString():'—'}<small>${demo?'点 / 日':'待接入'}</small></strong></div><div><span>${date===today?'今日':'当日'}已消耗</span><strong>${demo?value.consumed:'—'}<small>${demo?'点 · 已扣除返还':'待接入'}</small></strong></div><div><span>生成中预占</span><strong>${demo?value.reserved:'—'}<small>${demo?'点':'待接入'}</small></strong></div><div><span>${date===today?'今日':'当日'}剩余额度</span><strong>${demo?value.remaining.toLocaleString():'—'}<small>${demo?'点':'待接入'}</small></strong></div></div>${demo?`<div class="sa-quota-bar" role="img" aria-label="已消耗 ${value.consumed} 点，预占 ${value.reserved} 点，剩余 ${value.remaining} 点"><i style="width:${Math.min(100,value.consumed/p.quota*100)}%"></i><b style="width:${Math.min(100-Math.min(100,value.consumed/p.quota*100),value.reserved/p.quota*100)}%"></b></div><p class="sa-note">示例规则：每日 00:00（北京时间）刷新，未用额度不结转；失败退还，生成中预占单列。</p>`:''}<div class="sa-heading sa-usage-heading"><h3>消耗明细</h3><label class="sa-date">查看日期<input type="date" aria-label="用量日期" data-su-date value="${E(date)}" max="${today}"></label></div><div id="sa-usage-records">${rows.length?`<div class="sa-ledger-wrap"><table class="sa-ledger"><thead><tr><th>任务</th><th>来源</th><th>状态</th><th>额度变化</th></tr></thead><tbody>${[...rows].reverse().map(row=>`<tr><td><strong>${E(row.title)}</strong><small>${E(row.date)} ${E(row.time)} · 示例</small></td><td>${E(row.source)}</td><td>${E(row.status)}</td><td class="${row.type==='refund'?'sa-refund':''}">${row.type==='reserve'?'预占 ':row.type==='refund'?'+':'−'}${row.amount} 点</td></tr>`).join('')}</tbody></table></div>`:`<div class="sa-usage-empty">${demo?'该日期暂无演示流水。':'暂无计费用量记录。故事、漫画、视频与小工具的正式生成消耗将在这里统一汇总。'}</div>`}</div><p class="sa-note">生成额度与${C.link('站内积分钱包','/app/settings?tab=wallet','')}、${C.link('创作者收益','/app/creator?tab=income','')}分开管理。</p></section>`;
 }
 function refresh(){const target=document.getElementById('sa-usage');if(target)target.outerHTML=usage();}
 function planPreview(){const form=document.querySelector('[data-su-form=plan]');if(!form)return;const p=plans[form.elements.plan.value],yearly=form.elements.cycle.value==='yearly';form.querySelector('#sa-plan-preview').textContent=yearly?'$'+p.yearly+'/月 · $'+p.yearly*12+'/年（演示）':'$'+p.monthly+'/月（演示）';}
 function choosePlan(){
  S.modal('切换订阅套餐',`<form data-su-form="plan"><p>体验不同套餐的展示，不扣款、不建立真实订阅。</p><label>订阅套餐<select name="plan" aria-label="订阅套餐">${Object.keys(plans).map(name=>`<option ${S.state.plan===name?'selected':''}>${name}</option>`).join('')}</select></label><label>计费周期<select name="cycle" aria-label="计费周期"><option value="monthly">按月</option><option value="yearly" ${S.state.cycle==='yearly'?'selected':''}>按年</option></select></label><p id="sa-plan-preview"></p><p id="sa-plan-message" role="status"></p><div class="sa-actions"><button type="button" class="button ghost" data-act="close">取消</button><button type="submit" class="button primary">确认演示方案</button></div></form>`);planPreview();
 }
 function savePlan(name,cycle){
  if(!Object.hasOwn(plans,name)||!['monthly','yearly'].includes(cycle))throw Error('请选择有效的套餐与周期。');
  const previous={plan:S.state.plan,cycle:S.state.cycle};Object.assign(S.state,{plan:name,cycle});
  if(!S.save()){Object.assign(S.state,previous);throw Error('套餐未能保存，请重试。');}
  S.close();S.route('/app/settings');S.render();S.toast('演示套餐已切换，未扣款或创建真实订阅。');
 }
 document.addEventListener('click',event=>{const button=event.target.closest('[data-su]');if(!button)return;if(button.dataset.su==='plans')choosePlan();else{demo=button.dataset.su==='demo';refresh();}});
 document.addEventListener('change',event=>{if(event.target.matches('[data-su-date]')){selectedDate=event.target.value||day();refresh();}if(event.target.closest('[data-su-form=plan]'))planPreview();});
 document.addEventListener('submit',event=>{const form=event.target.closest('[data-su-form=plan]');if(!form)return;event.preventDefault();try{savePlan(form.elements.plan.value,form.elements.cycle.value);}catch(error){form.querySelector('#sa-plan-message').textContent=error.message;}});
 const original=S.workspace.onClick;S.workspace.onClick=(action,element,...args)=>{if(action==='confirm-plan'){try{savePlan(element.dataset.plan,element.dataset.cycle||S.ui.priceCycle||S.state.cycle);}catch(error){S.toast(error.message);}return true;}return original(action,element,...args);};
 const onPublic=S.public.onClick;S.public.onClick=(action,element,...args)=>{
  if(action==='price-cycle'){S.ui.priceCycle=element.dataset.value;S.render();return true;}
  if(action==='choose-plan'){
   const name=element.dataset.plan,cycle=S.ui.priceCycle||S.state.cycle;
   S.modal('体验 '+name+' 方案',`<p>将把本机演示账户切换为 ${E(name)}（${cycle==='yearly'?'按年':'按月'}）。这不是购买，不会扣款或创建真实订阅。</p>`,`<button class="button ghost" data-act="close">取消</button><button class="button primary" data-act="confirm-plan" data-plan="${E(name)}" data-cycle="${E(cycle)}">确认演示方案</button>`);return true;
  }
  return onPublic(action,element,...args);
 };
 window.AccountUsage={subscription,usage,day,examples,summarize};
 const start=S.start;S.start=()=>{start();const parameters=S.context.params,name=parameters.get('offer'),cycle=parameters.get('cycle');if(S.context.path!=='/app/settings'||!Object.hasOwn(plans,name)||!['monthly','yearly'].includes(cycle))return;choosePlan();const form=document.querySelector('[data-su-form=plan]');form.elements.plan.value=name;form.elements.cycle.value=cycle;planPreview();parameters.delete('offer');parameters.delete('cycle');history.replaceState(null,'',location.pathname+location.search+'#'+S.context.path+(parameters.size?'?'+parameters:''));};
})();
