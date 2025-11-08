const USE_MOCK = true;          // flip to false to call backend
const API_BASE = "/api";

let gaugeChart = null;
let donutChart = null;
const sparkCharts = {};

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function scoreToLabel(s){ return s>65?'BUY':(s<35?'SELL':'HOLD'); }
function scoreToColor(s){
  const cs = getComputedStyle(document.documentElement);
  if(s>65) return cs.getPropertyValue('--green')||'#76B900';
  if(s<35) return cs.getPropertyValue('--red')||'#E05252';
  return cs.getPropertyValue('--amber')||'#FFC857';
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); }

window.addEventListener('DOMContentLoaded', ()=>{
  $('#runBtn').addEventListener('click', run);
  $('#pdfBtn').addEventListener('click', ()=>window.print());
  primeSkeletons();
  run();
});

function inputs(){
  return {
    budget: Number($('#budget').value||0),
    risk: $('#risk').value,
    horizon: $('#horizon').value,
    assets: $$('.asset-pills input:checked').map(x=>x.value)
  };
}

function primeSkeletons(){
  $('#heatstripList').classList.add('skeleton');
  $('#assetGrid').innerHTML='';
}

async function run(){
  $('#runBtn').disabled = true;
  try{
    const inp = inputs();
    const data = USE_MOCK ? await mockData(inp) : await fetch(`${API_BASE}/run?assets=${inp.assets.join(',')}&budget=${inp.budget}&risk=${inp.risk}&horizon=${inp.horizon}`).then(r=>{
      if(!r.ok) throw new Error('Backend failed'); return r.json();
    });
    renderAll(inp, data);
    $('#runTime').textContent = `Last run: ${dayjs().format('MMM D, HH:mm')}`;
    toast('Analysis complete');
  }catch(e){
    console.error(e);
    toast('API error — showing mock');
    renderAll(inputs(), await mockData(inputs()));
  }finally{
    $('#runBtn').disabled = false;
  }
}

function renderAll(inp, bundle){
  renderHeatstrip(bundle);
  renderGauge(bundle);
  renderDonut(bundle);
  renderAssetCards(bundle);
}

function renderHeatstrip(bundle){
  const el = $('#heatstripList'); el.classList.remove('skeleton'); el.innerHTML='';
  bundle.assets.forEach(a=>{
    const c = document.createElement('div'); c.className='chip';
    const clr = scoreToColor(a.score);
    c.innerHTML = `<div><strong>${a.ticker}</strong></div>
      <div class="score" style="background:${clr}22;border:1px solid ${clr}55;color:${clr}">${a.score}</div>`;
    c.addEventListener('click', ()=>document.getElementById(`card-${a.ticker}`).scrollIntoView({behavior:'smooth',block:'center'}));
    el.appendChild(c);
  });
}

function renderGauge(bundle){
  const score = bundle.market.composite_score ?? 50;
  const badge = $('#marketBadge');
  const bars = {
    sentiment: $('#barSentiment'),
    momentum:  $('#barMomentum'),
    volatility: $('#barVolatility'),
    liquidity: $('#barLiquidity'),
  };
  bars.sentiment.style.width = `${(bundle.market.sentiment*100)|0}%`;
  bars.momentum.style.width  = `${(bundle.market.momentum*100)|0}%`;
  bars.volatility.style.width= `${(bundle.market.volatility*100)|0}%`;
  bars.liquidity.style.width = `${(bundle.market.liquidity*100)|0}%`;

  const label = scoreToLabel(score), color = scoreToColor(score);
  badge.textContent = `${label} • ${score}`;
  badge.style.color = color; badge.style.borderColor = `${color}66`; badge.style.background = `${color}11`;

  const ctx = document.getElementById('gaugeCanvas');
  const data = { labels:['Score','Remainder'], datasets:[{ data:[score,100-score], borderWidth:0, backgroundColor:[color,'#0c120f'], cutout:'75%', circumference:180, rotation:270 }] };
  const opt = { plugins:{legend:{display:false}}, animation:{duration:500}, responsive:true, maintainAspectRatio:false };
  if(gaugeChart) gaugeChart.destroy(); gaugeChart = new Chart(ctx,{type:'doughnut',data,options:opt});
}

function renderDonut(bundle){
  const ctx = document.getElementById('donutCanvas');
  const alloc = bundle.plan.allocation;
  const labels = alloc.map(x=>x.asset);
  const values = alloc.map(x=>x.percent);
  const colors = alloc.map(x=>scoreToColor((bundle.assets.find(a=>a.ticker===x.asset)||{}).score||50));
  if(donutChart) donutChart.destroy();
  donutChart = new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:0}]},options:{plugins:{legend:{display:false}},cutout:'65%',animation:{duration:500},responsive:true,maintainAspectRatio:false}});
  const leg = $('#donutLegend'); leg.innerHTML='';
  alloc.forEach((x,i)=>{ const d=document.createElement('div'); d.className='leg'; d.innerHTML=`<span class="dot" style="background:${colors[i]}"></span>${x.asset} • ${x.percent}%`; leg.appendChild(d); });
}

function renderAssetCards(bundle){
  const grid = $('#assetGrid'); grid.innerHTML='';
  bundle.assets.forEach(a=>{
    const clr = scoreToColor(a.score), label = scoreToLabel(a.score);
    const rsi = a.indicators?.rsi ?? 50;
    const macd = (a.indicators?.macd_hist ?? 0).toFixed(3);
    const atr = (a.indicators?.atr_pct ?? 2).toFixed(2)+'%';
    const chg = (a.indicators?.chg7d_pct ?? 0).toFixed(2)+'%';

    const card = document.createElement('div'); card.className='card'; card.id=`card-${a.ticker}`;
    card.innerHTML = `
      <div class="card-head">
        <div class="left">
          <div class="ticker">${a.ticker}</div>
          <div class="status" style="border-color:${clr}66;color:${clr};background:${clr}11">${label}</div>
        </div>
        <div class="score" style="color:${clr};font-weight:700">${a.score}</div>
      </div>
      <div class="spark-wrap"><canvas id="spark-${a.ticker}"></canvas></div>
      <div class="kpis">
        <div class="kpi">RSI ${rsi}</div>
        <div class="kpi">MACD ${macd}</div>
        <div class="kpi">ATR ${atr}</div>
        <div class="kpi">7d ${chg}</div>
      </div>
      <div class="tldr">${a.narrative?.tldr ?? 'Narrative pending.'}</div>
      <div class="risk-chips">${(a.narrative?.risks||[]).slice(0,2).map(x=>`<div class="risk-chip">${x}</div>`).join('')}</div>
      <div class="sl-tp">
        <div class="band">SL ${bundle.plan?.risk_controls?.[a.ticker]?.stop_loss_pct ?? '-'}%</div>
        <div class="band">TP ${bundle.plan?.risk_controls?.[a.ticker]?.take_profit_pct ?? '-'}%</div>
      </div>
      <div class="citations">
        <details>
          <summary>Headlines used</summary>
          <ul>${(a.citations||[]).slice(0,3).map(h=>`<li><a href="${h.url}" target="_blank" rel="noopener">${h.title}</a></li>`).join('')}</ul>
        </details>
      </div>`;
    grid.appendChild(card);
    drawSpark(`spark-${a.ticker}`, a.price.spark);
  });
}

function drawSpark(id, series){
  const ctx = document.getElementById(id); if(!ctx) return;
  if(sparkCharts[id]) sparkCharts[id].destroy();
  sparkCharts[id] = new Chart(ctx,{type:'line',data:{labels:series.map((_,i)=>i),datasets:[{data:series,fill:false,tension:.25,borderWidth:2,pointRadius:0}]},options:{plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}},elements:{line:{borderColor:'#9ad08f'}},responsive:true,maintainAspectRatio:false}});
}

/* Mock bundle for instant demo */
async function mockData({assets,horizon}){
  const use = (assets.length?assets:['BTC','ETH','SOL','AI']).slice(0,4);
  const spark = () => { let v=100, out=[]; for(let i=0;i<40;i++){ v=Math.max(1, v+(Math.random()-0.5)*2.2); out.push(+v.toFixed(2)); } return out; };
  const items = use.map(t=>{
    const score = Math.floor(42+Math.random()*36);
    return {
      ticker:t, name:t==='AI'?'AI Basket':t, score,
      price:{spark:spark()},
      indicators:{rsi:Math.floor(45+Math.random()*20),macd_hist:+(Math.random()*0.01-0.002).toFixed(4),atr_pct:+(1.5+Math.random()*2).toFixed(2),chg7d_pct:+(Math.random()*12-2).toFixed(2)},
      narrative:{tldr:`${t} showing ${score>65?'constructive':'mixed'} signals; watch flows.`,risks:['ETF flows decelerating','Volatility cluster risk']},
      citations:[{title:`${t} headline 1`,url:'#'},{title:`${t} headline 2`,url:'#'}]
    };
  });
  const rc = {}; items.forEach(a=>rc[a.ticker]={stop_loss_pct:6+Math.floor(Math.random()*3),take_profit_pct:10+Math.floor(Math.random()*6)});
  return {
    market:{composite_score:Math.floor(50+Math.random()*18),sentiment:Math.random()*0.6+0.2,momentum:Math.random()*0.6+0.2,volatility:Math.random()*0.6+0.2,liquidity:Math.random()*0.6+0.2},
    assets:items,
    plan:{allocation:items.map(a=>({asset:a.ticker,percent:+(100/items.length).toFixed(1)})),dca:{enabled:horizon!=='short',cadence:horizon==='long'?'monthly':'weekly',percent_per_cycle:20},risk_controls:rc}
  };
}

