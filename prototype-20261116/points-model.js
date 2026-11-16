/* 同一本积分账：消费积分与创作收益分别追踪。纯模型供浏览器与回归验证。 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PointsModel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const integer=(n,zero=false)=>{if(!Number.isSafeInteger(n)||n<(zero?0:1))throw Error('积分必须为'+(zero?'非负':'正')+'整数');return n;};
 const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
 const now=()=>new Date().toISOString();
 const initial=(amount=0)=>({version:1,purchased:integer(amount,true),earned:0,orders:[],incomes:[],ledger:[],withdrawals:[]});
 function balance(s){return integer(s.purchased+s.earned,true);}
 function entry(s,title,delta,extra={}){s.ledger.unshift({id:uid(),at:now(),title,delta,...extra});}
 function pay(s,order){
  const exists=s.orders.find(o=>o.id===order.id);if(exists)return exists;
  if(!order.id)throw Error('缺少订单编号');const amount=integer(order.amount,true);
  if(balance(s)<amount)throw Error('积分余额不足，请先到个人中心充值。');
  const purchased=Math.min(s.purchased,amount),earned=amount-purchased;
  const result={...order,at:order.at||now(),currency:'points',status:'paid',sources:{purchased,earned}};
  s.purchased-=purchased;s.earned-=earned;s.orders.unshift(result);entry(s,order.title,-amount,{orderId:order.id,kind:order.kind});return result;
 }
 function topup(s,amount,id=uid()){integer(amount);if(s.ledger.some(l=>l.id===id))return;
  integer(balance(s)+amount,true);s.purchased+=amount;entry(s,'演示充值',amount,{id,kind:'topup'});
 }
 function refund(s,id){const o=s.orders.find(o=>o.id===id);if(!o)throw Error('订单不存在');if(o.status==='refunded')return;
  integer(balance(s)+o.amount,true);s.purchased+=o.sources.purchased;s.earned+=o.sources.earned;o.status='refunded';entry(s,'退款 · '+o.title,o.amount,{orderId:id,kind:'refund'});
 }
 function addIncome(s,item){if(s.incomes.some(i=>i.id===item.id))return;const gross=integer(item.gross),fee=integer(item.fee||0,true);if(fee>gross)throw Error('服务费不能高于收入');
  if(!item.id)throw Error('缺少收入编号');integer(incomeSummary(s).withdrawable+incomeSummary(s).pending+gross,true);
  s.incomes.unshift({...item,at:item.at||now(),fee,net:gross-fee,status:'pending',available:0});
 }
 function income(s,id){const i=s.incomes.find(i=>i.id===id);if(!i)throw Error('收入记录不存在');return i;}
 function settle(s,id){const i=income(s,id);if(i.status==='settled')return;if(i.status!=='pending')throw Error('本笔收入无法结算');i.status='settled';i.available=i.net;i.settledAt=now();}
 function transfer(s,id){const i=income(s,id);if(i.status!=='settled')throw Error('请先完成收益结算');if(!i.available)return;
  integer(balance(s)+i.available,true);const n=i.available;s.earned+=n;i.available=0;entry(s,'创作收益转入 · '+i.title,n,{incomeId:id,kind:'income',example:!!i.example});
 }
 function incomeSummary(s){const valid=s.incomes.filter(i=>i.status!=='refunded');return {pending:valid.filter(i=>i.status==='pending').reduce((n,i)=>n+i.net,0),settled:valid.filter(i=>i.status==='settled').reduce((n,i)=>n+i.available,0),withdrawable:s.earned+valid.filter(i=>i.status==='settled').reduce((n,i)=>n+i.available,0),frozen:s.withdrawals.filter(i=>i.status==='pending').reduce((n,i)=>n+i.amount,0)};}
 function withdraw(s,amount,id=uid()){
  const exists=s.withdrawals.find(w=>w.id===id);if(exists)return exists;integer(amount);
  if(incomeSummary(s).withdrawable<amount)throw Error('可提现创作收益不足，充值积分不可提现');
  const earned=Math.min(s.earned,amount),sources=[];let left=amount-earned;
  for(const i of s.incomes){if(i.status!=='settled'||!left)continue;const n=Math.min(left,i.available);if(n){sources.push({id:i.id,amount:n});left-=n;}}
  s.earned-=earned;for(const v of sources)income(s,v.id).available-=v.amount;
  const result={id,amount,earned,sources,at:now(),status:'pending'};s.withdrawals.unshift(result);entry(s,'演示提现申请 · 收益冻结',-earned,{kind:'withdraw',withdrawalId:id,amount});return result;
 }
 function cancelWithdrawal(s,id){const w=s.withdrawals.find(w=>w.id===id);if(!w)throw Error('申请不存在');if(w.status==='cancelled')return;if(w.status!=='pending')throw Error('申请不能取消');
  s.earned+=w.earned;for(const v of w.sources)income(s,v.id).available+=v.amount;w.status='cancelled';entry(s,'取消提现 · 收益解冻',w.earned,{kind:'cancel-withdraw',withdrawalId:id});
 }
 function refundIncome(s,id){const i=income(s,id);if(i.status==='refunded')return;if(i.status!=='pending')throw Error('已结算收益需要后台冲正，不可直接退款');i.status='refunded';i.available=0;}
 return {initial,balance,pay,topup,refund,addIncome,settle,transfer,incomeSummary,withdraw,cancelWithdrawal,refundIncome};
});
