(()=>{
 'use strict';
 const S=Site,C=Cimora,E=S.esc,P=PointsModel;
 const amount=n=>Number(n).toLocaleString('zh-CN')+' 积分',kind=k=>({market:'资产包',unlock:'章节解锁',support:'读者支持',topup:'充值',income:'创作收益'}[k]||'积分变动');
 const button=(title,act,id='')=>`<button type="button" class="cm-button ghost" data-pw="${act}" data-id="${E(id)}">${title}</button>`;
 const link=(title,url)=>C.link(title,url,'cm-button ghost');
 function ensure(meta){if(!meta.points){meta.points=P.initial(C.M.db.wallet);meta.points.legacyBalance=C.M.db.wallet;}if(meta.points.version!==1)throw Error('积分钱包版本无法读取，请保留本机记录。');const s=meta.points, delta=C.M.db.wallet-(s.legacyBalance ?? P.balance(s));if(delta>=0)s.purchased+=delta;else{const n=Math.min(s.purchased,-delta);s.purchased-=n;s.earned=Math.max(0,s.earned-(-delta-n));}s.legacyBalance=C.M.db.wallet;return s;}
 function read(){return ensure(StudioLibrary.meta());}
 function change(fn){StudioLibrary.guard();const result=StudioLibrary.changeMeta(meta=>{const s=ensure(meta);fn(s,meta);s.legacyBalance=P.balance(s);});C.M.db.wallet=result.points.legacyBalance;S.save();return result;}
 const balance=()=>P.balance(read()),orders=()=>read().orders.filter(o=>o.status==='paid');
 function loadHistory(){const state=window.CommunityStudio?.status();if(state&&!state.loaded&&!state.loading&&!state.failure)void CommunityStudio.refresh().then(()=>{if(['settings','wallet'].includes(S.context?.parts[1]))S.render();});}
 const entitled=(workId,chapterId)=>orders().some(o=>o.kind==='unlock'&&o.workId===workId&&o.chapterId===chapterId);
 function target(o){return o.kind==='market'?'/app/market/'+encodeURIComponent(o.productId)+'?delivery=1':'/app/community/'+encodeURIComponent(o.workId)+'?chapter='+encodeURIComponent(o.chapterId||'');}
 function legacy(type='all'){loadHistory();const market=(window.MarketStudio?.read().orders||[]).filter(o=>o.currency!=='points'&&['all','market'].includes(type)),community=(window.CommunityStudio?.history?.()||[]).filter(o=>type==='all'||o.type===type);return `<details class="cm-panel sa-form pw-history"><summary>Purchase history · Original currencies</summary><p>旧订单保留原币种与权益，按当前购买分类展示。</p>${market.map(o=>`<article class="pw-row"><div><strong>${E(o.title)} · 旧市场订单</strong>${link('查看历史交付','/app/market/'+encodeURIComponent(o.productId))}</div><b>¥${Number(o.amount).toFixed(2)}</b></article>`).join('')}${community.map(o=>`<article class="pw-row"><div><strong>${E(o.title)} · ${kind(o.type)}</strong>${link('查看作品','/app/community/'+encodeURIComponent(o.workId)+'?chapter='+encodeURIComponent(o.chapterId||''))}</div><b>¥${(o.amount/100).toFixed(2)}</b></article>`).join('')}${!market.length&&!community.length?'<p>暂无旧人民币订单。</p>':''}<p>历史资源购买 ${C.M.db.purchases.length} 项；历史收支 ${C.M.db.ledger.length} 条。原有演示积分余额仅首次沿用，不重复发放。</p>${(type==='all'?C.M.db.ledger:[]).map(l=>`<article class="pw-row"><span>${E(l.title)} · 历史钱包收支</span><b>${l.delta>0?'+':''}${amount(l.delta)}</b></article>`).join('')}</details>`;}
 function purchases(){
  const type=S.context.params.get("type")||"all";
  const filters={all:"All",market:"Asset packs",unlock:"Chapter unlock",support:"Support"};
  const selected=Object.hasOwn(filters,type)?type:"all";
  const rows=read().orders.filter(order=>selected==="all"||order.kind===selected);
  return `<section class="cm-panel sa-form" id="pw-purchases" aria-labelledby="pw-purchases-title">
   <h2 id="pw-purchases-title">My purchases</h2>
   <nav class="sa-periods" aria-label="Purchase categories">${Object.entries(filters).map(([id,title])=>
    `<a href="#/app/settings?tab=purchases&type=${id}" aria-current="${selected===id?"page":"false"}">${title}</a>`).join("")}</nav>
   <div class="sa-ledger-wrap sa-usage-scroll" role="region" aria-label="Purchase records" tabindex="0">
    <table class="sa-ledger sa-usage-ledger">
     <thead><tr><th scope="col">Purchase / time</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Credit change</th></tr></thead>
     <tbody>${rows.length?rows.map(order=>{
      const paid=order.status==="paid",category=filters[order.kind]||"Purchase";
      const action=order.kind==="market"?"View delivery":order.kind==="unlock"?"Continue reading":"View work";
      const time=new Date(order.at).toLocaleString("en-CA",{timeZone:"Asia/Shanghai",hour12:false});
      return `<tr><td><strong>${E(order.title)}${order.chapterTitle?" · "+E(order.chapterTitle):""}</strong><small>${E(time)}</small><small class="sa-mobile-model">${category}</small></td>
       <td>${category}</td><td><span class="sa-ledger-status" data-status="${paid?"completed":"refunded"}">${paid?"Completed":"Refunded"}</span></td>
       <td class="sa-usage-credit" data-type="${paid?"debit":"refund"}"><span class="sa-usage-credit-amount">${paid?"−":"+"}${Number(order.amount).toLocaleString("en-US")} ${order.amount===1?"credit":"credits"}</span>
        ${paid?`<small>${C.link(action,target(order),"pw-order-link")}</small>`:""}</td></tr>`;
     }).join(""):`<tr><td class="pw-purchases-empty" colspan="4">No purchase records</td></tr>`}</tbody>
    </table>
   </div>
   <div class="sa-actions">${link("Browse market","/app/market")}${link("Explore showcase","/app/community")}</div>
  </section>${legacy(selected)}`;
 }
 let ledgerDemo=true;
 function ledgerExamples(){
  const today=AccountUsage.day();
  return [
   {at:today+'T09:00:00+08:00',title:'钱包充值',kind:'topup',delta:1000,status:'已到账'},
   {at:today+'T09:25:00+08:00',title:'都市角色参考包',kind:'market',delta:-180,status:'已支付'},
   {at:today+'T10:15:00+08:00',title:'《星海邮局》· 第3章解锁',kind:'unlock',delta:-20,status:'已支付'},
   {at:today+'T11:30:00+08:00',title:'支持《末班车录音》的作者',kind:'support',delta:-30,status:'已支付'},
   {at:today+'T13:10:00+08:00',title:'都市角色参考包 · 退款',kind:'refund',delta:180,status:'已退回'},
   {at:today+'T14:40:00+08:00',title:'创作收益转入钱包',kind:'income',delta:120,status:'已到账'}
  ].reverse();
 }
 function ledgerStatus(row){
  const label=row.status||(row.kind==='refund'?'已退回':'已记账');
  const tone={'已到账':'completed','已支付':'completed','已记账':'completed','已退回':'refunded','待处理':'generating','失败':'failed'}[label]||'';
  return `<span class="sa-ledger-status" data-status="${tone}">${E(label==='已记账'?'Posted':label)}</span>`;
 }
 function ledger(s){
  const rows=ledgerDemo?ledgerExamples():s.ledger,types={topup:'充值',market:'资产购买',unlock:'章节解锁',support:'支持作者',refund:'购买退款',income:'收益转入',withdraw:'收益冻结','cancel-withdraw':'收益解冻'};
  return `<section id="pw-ledger" class="cm-panel sa-form"><div class="sa-heading"><div><h2>钱包收支明细</h2><p>记录充值、购买、退款和收益转入；AI 创作消耗可在「订阅与用量」查看。</p></div>${button(ledgerDemo?'查看我的收支':'查看收支演示',ledgerDemo?'ledger-live':'ledger-demo')}</div>${rows.length?`<div class="sa-ledger-wrap"><table class="sa-ledger pw-ledger"><thead><tr><th scope="col">收支事项</th><th scope="col">类型</th><th scope="col">状态</th><th scope="col">积分变化</th></tr></thead><tbody>${rows.map(l=>`<tr><td><strong>${E(l.title)}</strong><small>${new Date(l.at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})}${l.example?' · 收益样例':''}</small></td><td>${E(types[l.kind]||'钱包变动')}</td><td>${ledgerStatus(l)}</td><td class="sa-usage-credit" data-type="${l.delta>0?'credit':l.delta<0?'debit':''}"><span class="sa-usage-credit-amount">${l.delta>0?'+':l.delta<0?'−':''}${amount(Math.abs(l.delta))}</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="sa-usage-empty">暂无钱包收支记录。充值、购买或退款后，可在这里查看积分变化。</div>'}</section>`;
 }
 function wallet(){
  const s=read();
  const balance=P.balance(s);
  const sources=[{label:"Top-ups & previous credits",credits:s.purchased},{label:"Transferred earnings",credits:s.earned}];
  return `<section id="pw-wallet" aria-labelledby="pw-wallet-title">
   <h2 id="pw-wallet-title">Credit wallet</h2>
   <div class="sa-points-grid">
    ${AccountUsage.balanceCard(balance,'Available balance')}
    ${sources.map(({label,credits},index)=>{
     const share=balance>0?credits/balance*100:0;
     return `<section class="sa-credit-stat ${index===0?'sa-credit-used':'sa-credit-pending'} pw-source-card">
      <div><h3>${E(label)}</h3><strong>${credits.toLocaleString('en-US')}<small>Credits</small></strong></div>
      <div class="sa-credit-chart pw-source-share" role="img" aria-label="${Math.round(share)}% of available balance">
       <span aria-hidden="true">${Math.round(share)}% of balance</span>
       <div class="pw-source-track" style="--pw-source-share:${share}%" aria-hidden="true"></div>
      </div>
     </section>`;
    }).join('')}
   </div>
  </section>${ledger(s)}`;
 }
 function income(){const s=read(),sum=P.incomeSummary(s),month=AccountUsage.day(new Date()).slice(0,7),net=s.incomes.filter(i=>i.status!=='refunded'&&AccountUsage.day(new Date(i.at)).slice(0,7)===month).reduce((n,i)=>n+i.net,0);return `<p class="sa-note">创作收益本机演示 · 自己的消费不会成为自己的收入。收益样例模拟其他买家的订单，均有明确标记；尚未接入真实结算与提现。</p><div class="pw-stats"><section><small>本月净收入（含样例）</small><strong>${amount(net)}</strong></section><section><small>待结算</small><strong>${amount(sum.pending)}</strong></section><section><small>已结算可用收益</small><strong>${amount(sum.withdrawable)}</strong><small>尚未转入钱包 ${amount(sum.settled)} · 已转入钱包 ${amount(s.earned)}</small></section><section><small>提现申请中</small><strong>${amount(sum.frozen)}</strong></section></div><section class="cm-panel sa-form"><div class="sa-heading"><div><h2>收益来源与结算</h2><p>章节解锁、读者支持与资产包交易统一以积分入账。平台费率和兑换比例待确定，样例服务费为 0。</p></div>${button('载入收益演示','income-demo')}</div><div class="sa-actions pw-income-actions">${sum.pending?button('模拟全部结算','settle-all'):''}${sum.settled?button('全部转入钱包','transfer-all'):''}${button('申请演示提现','withdraw')}${link('查看积分钱包','/app/settings?tab=wallet')}</div>${['unlock','support','market'].map(k=>`<p>${k==='market'?'资产包收入':'作品收入 · '+kind(k)}：${amount(s.incomes.filter(i=>i.kind===k&&i.status!=='refunded').reduce((n,i)=>n+i.net,0))}</p>`).join('')}${s.incomes.map(i=>`<article class="pw-row"><div><strong>${E(i.title)}${i.example?' · 收益样例':''}</strong><small>${kind(i.kind)} · 订单 ${E(i.id)}<br>收入 ${amount(i.gross)} − 服务费 ${amount(i.fee)} = 净收入 ${amount(i.net)}<br>${i.status==='pending'?'待结算':i.status==='refunded'?'已冲正':'已结算 · 尚未转入钱包 '+amount(i.available)}</small></div><b>${amount(i.net)}</b></article>`).join('')||'<p>暂无收入。发布作品或上架资产包不会自动生成收益。</p>'}<p class="sa-note">结算完成后可汇总转入钱包消费，或申请提现；转入钱包是同笔收益的位置变化，不会产生第二份收入。正式结算由后台按周期执行。申请将冻结收益，不能同时用于消费；充值积分不可提现。此处只演示积分申请，不计算法币金额。</p></section><section class="cm-panel sa-form"><h2>提现申请</h2>${s.withdrawals.map(w=>`<article class="pw-row"><div><strong>${amount(w.amount)} · ${w.status==='pending'?'申请中，已冻结':'已取消，已解冻'}</strong><small>${new Date(w.at).toLocaleString('zh-CN')} · 本机演示，没有真实到账</small></div>${w.status==='pending'?button('取消申请','cancel-withdraw',w.id):''}</article>`).join('')||'<p>暂无申请。</p>'}</section>`;}
 async function demo(){await change(s=>{for(const [id,k,title,n]of [['chapter','unlock','示例连载 · 章节解锁',40],['reader','support','示例连载 · 读者支持',50],['asset','market','都市角色包 · 资产销售',180]])P.addIncome(s,{id:'income-demo-'+id,kind:k,title,gross:n,example:true});});}
 const topupPacks=[500,1000,2000];
 const choosePackLabel=credits=>`Choose ${credits.toLocaleString('en-US')} credits`;
 function openTopup(){
  const dialog=AccountUsage.openPricingDialog('Top up credits','Add credits to your demo wallet. No payment is required.',`
   <ul class="sa-pricing-cards" aria-label="Credit packs" data-topup-request="${crypto.randomUUID()}">
    ${topupPacks.map(credits=>`<li class="sa-pricing-card" data-selected="false"${credits===1000?' data-topup-featured':''}>
     <h3 class="sa-pricing-price"><strong>${credits.toLocaleString('en-US')}</strong><span>Credits</span></h3>
     <button type="button" class="sa-pricing-choice" data-pw="topup-pack" data-id="${credits}">${choosePackLabel(credits)}</button>
    </li>`).join('')}
   </ul>
   <p class="sa-pricing-announcement" role="status"></p>
   <p id="pw-error" class="sa-pricing-error" role="alert"></p>`);
  requestAnimationFrame(()=>dialog.querySelector('.sa-pricing-choice')?.focus({preventScroll:true}));
 }
 let busy=false;
 document.addEventListener('click',async event=>{
  const node=event.target.closest('[data-pw]');if(!node)return;event.preventDefault();if(busy)return;const act=node.dataset.pw,id=node.dataset.id;
  try{
   if(act==='ledger-demo'||act==='ledger-live'){ledgerDemo=act==='ledger-demo';const target=document.getElementById('pw-ledger');if(target)target.outerHTML=ledger(read());return;}
   if(act==='topup'){openTopup();return;}
   if(act==='topup-pack'){
    const credits=Number(id),packs=node.closest('[data-topup-request]');
    if(!packs||!topupPacks.includes(credits))return;
    const card=node.closest('.sa-pricing-card');
    if(card.dataset.selected!=='true'){
     for(const choice of packs.querySelectorAll('.sa-pricing-choice')){
      const selected=choice===node;
      choice.closest('.sa-pricing-card').dataset.selected=String(selected);
      choice.textContent=selected?'Confirm top-up':choosePackLabel(Number(choice.dataset.id));
     }
     packs.nextElementSibling.textContent=`${credits.toLocaleString('en-US')} credits selected. Confirm top-up to add them.`;
     document.getElementById('pw-error').textContent='';
     return;
    }
    busy=true;node.disabled=true;
    await change(s=>P.topup(s,credits,packs.dataset.topupRequest));
    S.close();S.render();S.toast(`${credits.toLocaleString('en-US')} credits added to your demo wallet.`);
    return;
   }
   if(act==='withdraw'){
    S.modal('申请演示提现',`<form class="sa-form" id="pw-form"><p>仅可使用已结算创作收益；提交后冻结，取消后解冻。</p><label>申请积分<input id="pw-amount" type="number" min="1" step="1" required value="${Math.min(100,P.incomeSummary(read()).withdrawable)||1}"></label><p>本机模拟，不发生真实付款、到账或提现。正式兑换比例与费用尚未设定。</p><p id="pw-error" role="alert"></p></form>`,button('确认演示申请','confirm-withdraw',crypto.randomUUID()));
    return;
   }
   busy=true;node.disabled=true;
   if(act==='income-demo')await demo();
   else if(act==='settle')await change(s=>P.settle(s,id));
   else if(act==='settle-all')await change(s=>{for(const income of s.incomes)if(income.status==='pending')P.settle(s,income.id);});
   else if(act==='transfer-all')await change(s=>{for(const income of s.incomes)if(income.status==='settled'&&income.available)P.transfer(s,income.id);});
   else if(act==='transfer')await change(s=>P.transfer(s,id));
   else if(act==='cancel-withdraw')await change(s=>P.cancelWithdrawal(s,id));
   else if(act==='confirm-withdraw'){const form=document.getElementById('pw-form');if(!form.reportValidity())return;const n=Number(document.getElementById('pw-amount').value);await change(s=>P.withdraw(s,n,id));S.close();}
   S.render();S.toast('演示记录已保存');
  }catch(error){const out=document.getElementById('pw-error');if(out)out.textContent=error.message;else S.toast(error.message);}finally{busy=false;if(node.isConnected)node.disabled=false;}
 });
 window.addEventListener('storage',event=>{
  if(event.key!=='cimora-studio-library-v1')return;
  // The library shares a storage key with the wallet. A project visit does
  // not change any wallet data and must not replace the current page's DOM.
  try {
   const before=JSON.parse(event.oldValue);
   const after=JSON.parse(event.newValue);
   if(JSON.stringify(before?.points)===JSON.stringify(after?.points))return;
  } catch {
   return;
  }
  if(['video','script','comic','create','canvas'].includes(S.context?.parts[1])){
   // Other editor tabs remember their own resume URL. Rebuilding this editor
   // would write our URL back and trigger another round of storage events.
   return;
  }
  S.render();
 });
 
 window.PointsWallet={ensure,read,change,balance,orders,entitled,wallet,purchases,income,demo,loadHistory};
})();
