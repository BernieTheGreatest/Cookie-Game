'use strict';
const KEY = 'kevins-cookie-tycoon-v1';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n);
const events = [
 {title:'A lovely day for cookies',description:'Steady foot traffic. A good day to find your rhythm.',factor:1},
 {title:'Rain on the window',description:'A quieter street today. Plan a smaller batch.',factor:.75},
 {title:'The neighborhood is buzzing',description:'More people out and about means more cookie cravings.',factor:1.25},
 {title:'Market day on Main Street',description:'The local market brings a hungry crowd to your door.',factor:1.45},
 {title:'A slow and cozy afternoon',description:'Foot traffic is light. Keep an eye on your costs.',factor:.85}
];
const varieties = [
 {id:'classic',name:'Chocolate chip',icon:'🍪',cost:.50,price:2.50,share:.5},
 {id:'oatmeal',name:'Oatmeal raisin',icon:'🌾',cost:.35,price:2,share:.25},
 {id:'double',name:'Double chocolate',icon:'🍫',cost:.75,price:3.25,share:.25}
];
const variety = id => varieties.find(v=>v.id===id);
const batchCost = batches => Math.round(batches.reduce((sum,b)=>sum+b.quantity*variety(b.id).cost,0)*100)/100;
function batchesFor(r){return r.batches || [{id:'classic',quantity:r.quantity,price:r.price,sold:r.sold}];}
function menuFields(){return varieties.map((v,i)=>`<div class="variety-card"><div class="variety-heading"><strong>${v.icon} ${v.name}</strong><span>${money(v.cost)} to bake</span></div><div class="variety-inputs"><div class="field"><label for="quantity-${v.id}">Bake</label><div class="input-wrap"><input id="quantity-${v.id}" type="number" min="0" max="10000" step="1" value="${i===0?80:0}" required><span>cookies</span></div></div><div class="field"><label for="price-${v.id}">Price each</label><div class="input-wrap"><span>$</span><input id="price-${v.id}" type="number" min="0.25" max="20" step="0.25" value="${v.price.toFixed(2)}" required></div></div></div></div>`).join('');}
let state;
function fresh(){return {cash:100,history:[],event:0};}
function load(){
 try{
  const s=JSON.parse(localStorage.getItem(KEY));
  if(!s||!Number.isFinite(s.cash)||s.cash<0||!Array.isArray(s.history)||s.history.length>30||!Number.isInteger(s.event)||!events[s.event])return fresh();
  const validHistory=s.history.every(r=>r&&['sold','quantity','price','revenue','expenses','profit','cash','day','ads'].every(k=>Number.isFinite(r[k]))&&(!r.batches||(Array.isArray(r.batches)&&r.batches.length===varieties.length&&r.batches.every((b,i)=>b&&b.id===varieties[i].id&&Number.isInteger(b.quantity)&&b.quantity>=0&&b.quantity<=10000&&Number.isFinite(b.price)&&b.price>=.25&&b.price<=20&&Number.isInteger(b.sold)&&b.sold>=0&&b.sold<=b.quantity))));
  if(validHistory)return s;
 }catch{}
 return fresh();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
function inputs(){const batches=varieties.map(v=>({id:v.id,quantity:Number($(`quantity-${v.id}`).value),price:Number($(`price-${v.id}`).value)}));return {batches,quantity:batches.reduce((n,b)=>n+b.quantity,0),ads:Number($('advertising').value)};}
function valid(p){return p.batches.every(b=>Number.isInteger(b.quantity)&&b.quantity>=0&&b.quantity<=10000&&b.price>=.25&&b.price<=20&&Math.abs(b.price*4-Math.round(b.price*4))<1e-8)&&Number.isInteger(p.ads)&&p.ads>=0&&p.ads<=1000000;}
function costs(p){return Math.round((batchCost(p.batches)+p.ads+5)*100)/100;}
function finished(){return state.history.length>=30||state.cash<5;}
function updateBudget(){const p=inputs(),cost=costs(p);$('ingredients').textContent=money(batchCost(p.batches));$('ad-cost').textContent=money(p.ads);$('investment').textContent=money(cost);$('validation').textContent=finished()?'':!valid(p)?'Enter whole cookies, whole advertising dollars, and a price in $0.25 steps.':cost>state.cash?'This batch is over budget. Reduce baking or advertising.':'';$('bake').disabled=finished()||!valid(p)||cost>state.cash;}
function customerScene(r, animate){
 const count=Math.min(24,Math.ceil(r.sold/5));
 const colors=['#cc795b','#739886','#d5aa56','#8588ad','#b57691'];
 const people=Array.from({length:count},(_,i)=>{
  const cookies=Math.floor(r.sold/count)+(i<r.sold%count?1:0);
  return `<div class="customer" style="--delay:${(i*.22).toFixed(2)}s;--shirt:${colors[i%colors.length]};--skin:${['#e8b58e','#b97c56','#f0cfaa'][i%3]};--lane:${i%3*5}px"><div class="customer-body"><span class="customer-head"></span><span class="customer-shirt"></span><span class="customer-legs"></span><span class="cookie-bag">🍪<b>×${cookies}</b></span><span class="customer-thanks">♥</span></div></div>`;
 }).join('');
 return `<div class="shop-scene ${animate?'is-playing':'settled'}" aria-hidden="true"><div class="scene-sun">☀</div><div class="shop-building"><div class="shop-sign">KEVIN’S COOKIES</div><div class="shop-awning"></div><div class="shop-window">🍪 🍪 🍪</div><div class="shop-door"></div></div><div class="shop-path"></div><div class="customers">${people}</div>${!count?'<span class="quiet-shop">A quiet day at the shop…</span>':''}</div><p class="crowd-caption">${r.sold?`${count} animated customer${count===1?'':'s'} · ${r.sold} cookies sold${count?' · Each bag shows its cookie count.':''}`:'No sales today. Try a new price or a little advertising.'}</p>`;
}
function report(r, animate=false){$('empty-results').hidden=true;$('report').hidden=false;$('results-title').textContent=`Day ${r.day}, fresh from the oven.`;const sign=r.profit<0?'negative':'positive';$('report').innerHTML=customerScene(r,animate)+`<div class="report-hero"><p>TODAY’S PROFIT</p><strong class="${sign}">${money(r.profit)}</strong><span>${r.sold} happy cookie moments</span></div><div class="report-row"><span>Cookies sold</span><strong>${r.sold} / ${r.quantity}</strong></div>${batchesFor(r).map(b=>`<div class="report-row variety-result"><span>${variety(b.id).name}<small>${money(b.price)} each · ${money(variety(b.id).cost)} to bake</small></span><strong>${b.sold} / ${b.quantity} sold</strong></div>`).join('')}<div class="report-row"><span>Revenue</span><strong>${money(r.revenue)}</strong></div><div class="report-row"><span>Expenses</span><strong>${money(r.expenses)}</strong></div><div class="report-row"><span>Ingredients / advertising / shop</span><strong>${money(batchCost(batchesFor(r)))} / ${money(r.ads)} / $5.00</strong></div><div class="report-row"><span>Unsold cookies</span><strong>${r.quantity-r.sold}</strong></div><div class="report-row"><span>Remaining cash</span><strong>${money(r.cash)}</strong></div><p class="report-note">${r.sold===r.quantity&&r.quantity>0?'Sold out! A larger batch could help you capture more demand.':r.sold<r.quantity?'A few crumbs left behind. Try a smaller batch, a lower price, or a little more buzz.':'Even a quiet day costs $5 to keep the shop open.'}</p>`;}
function render(animate=false){const day=Math.min(state.history.length+1,30),total=state.history.reduce((n,r)=>n+r.profit,0);$('cash').textContent=money(state.cash);$('day').innerHTML=`Day ${day} <small>/ 30</small>`;$('total-profit').textContent=money(total);$('total-profit').className=total<0?'negative':'';$('total-sold').innerHTML=`${state.history.reduce((n,r)=>n+r.sold,0)} <small>and counting</small>`;$('day-pill').textContent=`DAY ${String(day).padStart(2,'0')}`;$('event-title').textContent=events[state.event].title;$('event-description').textContent=events[state.event].description;
$('ledger').innerHTML=state.history.length?[...state.history].reverse().map(r=>`<tr><td>${String(r.day).padStart(2,'0')}</td><td>${r.quantity} / ${r.sold}</td><td>${batchesFor(r).filter(b=>b.quantity>0).map(b=>`${variety(b.id).name}: ${money(b.price)}`).join('<br>') || 'No cookies baked'}</td><td>${money(r.revenue)}</td><td>${money(r.expenses)}</td><td class="${r.profit<0?'negative':'positive'}">${money(r.profit)}</td><td>${money(r.cash)}</td></tr>`).join(''):'<tr><td colspan="7" class="ledger-empty">Your story starts with the first batch.</td></tr>';
if(state.history.length)report(state.history.at(-1),animate);else{$('empty-results').hidden=false;$('report').hidden=true;$('results-title').textContent='Your day, at a glance.';}
const done=finished();$('ending').hidden=!done;$('plan-title').textContent=done?'The oven’s off.':'Let’s open up shop.';for(const id of [...varieties.flatMap(v=>[`quantity-${v.id}`,`price-${v.id}`]),'advertising'])$(id).disabled=done;
if(done){const complete=state.history.length===30;$('ending').innerHTML=`<h3>${complete?'Thirty days. One sweet journey.':'Time for a fresh start.'}</h3><p>${complete?`You finished with <strong>${money(state.cash)}</strong> and ${money(total)} in total profit. ${total>0?'You built a profitable neighborhood cookie shop!':'Every baker learns a little with each batch.'}`:'You have less than $5, so you can’t cover another day’s shop costs. Your ledger tells the story—try again with a smaller batch or a new price.'}</p><button class="primary" id="play-again">Bake a new beginning →</button>`;$('play-again').onclick=reset;}$('bake').innerHTML=done?'Shop closed':'Bake & open shop <span>→</span>';updateBudget();}
function reset(){state=fresh();save();$('variety-fields').innerHTML=menuFields();$('advertising').value=10;$('reset-dialog').close();render();}
$('plan-form').addEventListener('input',updateBudget);
$('plan-form').addEventListener('submit',e=>{e.preventDefault();const p=inputs();if(finished()||!valid(p)||costs(p)>state.cash)return;const day=state.history.length+1;const traffic=(58+Math.sqrt(p.ads)*11)*events[state.event].factor*(.88+Math.random()*.24);
// Only active recipes share the day's foot traffic; a larger menu cannot create free demand.
const activeShare=p.batches.reduce((n,b)=>n+(b.quantity>0?variety(b.id).share:0),0);
const batches=p.batches.map(b=>{const v=variety(b.id),demand=b.quantity>0?Math.max(0,Math.round(traffic*v.share/activeShare*Math.exp(-.65*(b.price-v.price)))):0;return {...b,sold:Math.min(b.quantity,demand)};});
const sold=batches.reduce((n,b)=>n+b.sold,0),revenue=Math.round(batches.reduce((n,b)=>n+b.sold*b.price,0)*100)/100,expenses=costs(p),profit=Math.round((revenue-expenses)*100)/100;
state.cash=Math.round((state.cash+profit)*100)/100;state.history.push({...p,batches,price:sold?revenue/sold:0,day,sold,revenue,expenses,profit,cash:state.cash});state.event=Math.floor(Math.random()*events.length);save();render(true);if(matchMedia('(max-width:600px)').matches)$('results-title').scrollIntoView({behavior:'smooth',block:'start'});});
$('restart').onclick=()=>$('reset-dialog').showModal();$('cancel-reset').onclick=()=>$('reset-dialog').close();$('confirm-reset').onclick=reset;
$('variety-fields').innerHTML=menuFields();
state=load();render();
