/**
 * Interactive labs ("Try it"): sliders on the left, live results on the right, a small chart and a hint.
 * A lab lesson is {type:"lab", lab:"queue"|"survey"|"staffing"|"pnl"|"ihour"|"ioccupancy"|"icontract", title, intro?, minutes?}.
 * The "i…" labs belong to the interpretation course: IMS October 2026 volumes with example prices and costs.
 * To add a lab, add an entry to LABS with inputs and a calc(v) → {outs, chart, tip}. Moving any slider counts as done.
 */
import { $, $$, esc } from '../core/dom.js?v=175c4d96';
import { actionBar, moduleFiles, complete } from './common.js?v=175c4d96';

const n0 = x => Math.round(x).toLocaleString('en-US');
const n1 = x => (Math.round(x * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = x => `${n1(x * 100)}%`;

/** Erlang C: probability a call waits, with traffic A (erlangs) and N agents. */
function erlangC(A, N) {
  if (N <= A) return 1;
  let B = 1;
  for (let k = 1; k <= N; k++) B = (A * B) / (k + A * B);
  return (N * B) / (N - A * (1 - B));
}
const slOf = (A, N, T, aht) => N <= A ? 0 : 1 - erlangC(A, N) * Math.exp(-(N - A) * T / aht);

/** Vertical bars with an optional target line; values 0..1. */
function barChart(items, target, label) {
  const W = 100 / items.length;
  const bars = items.map((it, i) => `<rect x="${i * W + W * .18}" y="${100 - it.v * 100}" width="${W * .64}" height="${it.v * 100}" rx="1.4" class="${it.on ? 'on' : ''}${it.v >= target ? ' hit' : ''}"/>`).join('');
  const t = target ? `<line x1="0" x2="100" y1="${100 - target * 100}" y2="${100 - target * 100}" class="tg"/>` : '';
  return `<svg class="lchart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Chart: ${esc(items.map(it => `${it.k}: ${pct(it.v)}`).join(', '))}">${t}${bars}</svg>
    <div class="lxl" aria-hidden="true">${items.map(it => `<span class="${it.on ? 'on' : ''}">${esc(it.k)}</span>`).join('')}</div>${target ? `<p class="lcap"><span class="lkey"></span> ${esc(label)}</p>` : ''}`;
}

/** One horizontal stacked bar; parts [{k, v, c}] in any units. */
function stackBar(parts) {
  const tot = parts.reduce((s, p) => s + Math.max(0, p.v), 0) || 1;
  return `<div class="lstack" role="img" aria-label="${esc(parts.map(p => `${p.k} ${pct(Math.max(0, p.v) / tot)}`).join(', '))}">${parts.map(p =>
    `<span class="${p.c}" style="width:${Math.max(0, p.v) / tot * 100}%"><b>${esc(p.k)}</b></span>`).join('')}</div>`;
}

const LABS = {
  queue: {
    inputs: [
      { id: 'calls', label: 'Calls in the hour', min: 50, max: 1000, step: 10, val: 504 },
      { id: 'aht', label: 'AHT (seconds)', min: 60, max: 600, step: 10, val: 180 },
      { id: 'agents', label: 'Agents on the phones', min: 1, max: 80, step: 1, val: 30 },
      { id: 'thr', label: 'Service level threshold (seconds)', min: 5, max: 60, step: 5, val: 20 }
    ],
    calc(v) {
      const A = v.calls * v.aht / 3600, N = v.agents;
      const sl = slOf(A, N, v.thr, v.aht), pw = erlangC(A, N), asa = N <= A ? Infinity : pw * v.aht / (N - A);
      let need = Math.floor(A) + 1; while (slOf(A, need, v.thr, v.aht) < 0.8 && need < 400) need++;
      const from = Math.max(1, Math.min(N, need) - 4), items = [];
      for (let k = from; k < from + 10; k++) items.push({ k: String(k), v: slOf(A, k, v.thr, v.aht), on: k === N });
      return {
        outs: [
          { l: 'Service level', v: N <= A ? '0%' : pct(sl), s: `answered within ${v.thr} s`, t: sl >= .8 ? 'good' : 'bad' },
          { l: 'ASA', v: asa === Infinity ? '∞' : `${n1(asa)} s`, s: 'average wait of answered calls', t: asa <= v.thr ? 'good' : 'bad' },
          { l: 'Occupancy', v: N <= A ? '100%' : pct(A / N), s: 'time agents spend on calls', t: A / N > .9 ? 'bad' : 'good' },
          { l: 'Workload', v: `${n1(A)}`, s: 'agents of pure talk + wrap (erlangs)' }
        ],
        chart: '<p class="lcap">Service level for each number of agents (yours is dark)</p>' + barChart(items, .8, 'Dotted line: 80% target'),
        tip: N <= A ? `With ${N} agents the queue never clears: you need more than ${n1(A)} agents just to keep up.`
          : sl >= .8 ? `On target. The fewest agents that reach 80/${v.thr} is ${need}.${N > need + 2 ? ` You have ${N - need} spare, so occupancy is only ${pct(A / N)}.` : ''}`
            : `Below target. You need ${need} agents for 80/${v.thr}, ${need - N} more than now.`
      };
    }
  },
  survey: {
    inputs: [
      { id: 'p', label: 'Promoters (score 9–10)', min: 0, max: 300, step: 1, val: 104 },
      { id: 'pa', label: 'Passives (score 7–8)', min: 0, max: 300, step: 1, val: 56 },
      { id: 'd', label: 'Detractors (score 0–6)', min: 0, max: 300, step: 1, val: 40 },
      { id: 's45', label: 'CSAT: customers who chose 4 or 5', min: 0, max: 300, step: 1, val: 150 },
      { id: 's3', label: 'CSAT: customers who chose 3', min: 0, max: 300, step: 1, val: 30 },
      { id: 's12', label: 'CSAT: customers who chose 1 or 2', min: 0, max: 300, step: 1, val: 20 }
    ],
    calc(v) {
      const t = v.p + v.pa + v.d, ct = v.s45 + v.s3 + v.s12;
      const nps = t ? (v.p - v.d) / t * 100 : 0, csat = ct ? v.s45 / ct : 0, dsat = ct ? v.s12 / ct : 0;
      return {
        outs: [
          { l: 'NPS', v: `${nps > 0 ? '+' : ''}${Math.round(nps)}`, s: `${n0(t)} answers · −100 to +100`, t: nps >= 30 ? 'good' : nps < 0 ? 'bad' : '' },
          { l: 'Promoters', v: t ? pct(v.p / t) : '0%', s: 'minus detractors = NPS' },
          { l: 'CSAT', v: pct(csat), s: `top-2 box of ${n0(ct)}`, t: csat >= .8 ? 'good' : csat < .7 ? 'bad' : '' },
          { l: 'DSAT', v: pct(dsat), s: 'bottom-2 box', t: dsat > .1 ? 'bad' : 'good' }
        ],
        chart: `<p class="lcap">NPS answers</p>${stackBar([{ k: 'Promoters', v: v.p, c: 'g' }, { k: 'Passives', v: v.pa, c: 'm' }, { k: 'Detractors', v: v.d, c: 'r' }])}
          <p class="lcap">CSAT answers</p>${stackBar([{ k: '4–5', v: v.s45, c: 'g' }, { k: '3', v: v.s3, c: 'm' }, { k: '1–2', v: v.s12, c: 'r' }])}`,
        tip: `Passives count in the total but not in the score. Move ten passives to promoters and NPS rises by ${t ? n1(1000 / t) : 0} points; move them to detractors and it falls by the same.`
      };
    }
  },
  staffing: {
    inputs: [
      { id: 'calls', label: 'Calls next month', min: 5000, max: 200000, step: 1000, val: 66000 },
      { id: 'aht', label: 'AHT (minutes)', min: 1, max: 12, step: .1, val: 4.5 },
      { id: 'days', label: 'Working days', min: 15, max: 30, step: 1, val: 22 },
      { id: 'hours', label: 'Productive hours per day (no breaks)', min: 4, max: 10, step: .5, val: 8 },
      { id: 'util', label: 'Utilization %', min: 50, max: 100, step: 1, val: 86 },
      { id: 'occ', label: 'Occupancy %', min: 50, max: 100, step: 1, val: 85 },
      { id: 'abs', label: 'Absenteeism %', min: 0, max: 30, step: 1, val: 6 }
    ],
    calc(v) {
      const work = v.calls * v.aht, sup1 = v.days * v.hours * 60 * v.util / 100 * v.occ / 100 * (1 - v.abs / 100);
      const raw = work / sup1, ag = Math.ceil(raw - 1e-9);
      const parts = [{ k: 'On calls', v: v.occ / 100 * v.util / 100 * (1 - v.abs / 100), c: 'g' }, { k: 'Not on calls', v: 1 - v.occ / 100 * v.util / 100 * (1 - v.abs / 100), c: 'r' }];
      return {
        outs: [
          { l: 'Agents', v: n0(ag), s: `${n1(raw)} rounded up`, t: 'good' },
          { l: 'Supervisors', v: n0(Math.ceil(ag / 15)), s: 'at 1 : 15' },
          { l: 'Quality analysts', v: n0(Math.ceil(ag / 35)), s: 'at 1 : 35' },
          { l: 'Workload', v: n0(work), s: 'minutes = calls × AHT' }
        ],
        chart: `<p class="lcap">One agent's month: ${n0(v.days * v.hours * 60)} minutes, of which ${n0(sup1)} on calls</p>${stackBar(parts)}`,
        tip: `Each extra point of absenteeism costs about ${n1(raw / (1 - v.abs / 100) * .01)} agents here. Try raising occupancy to 90% and see how many agents you save, then remember what it does to service level.`
      };
    }
  },
  ihour: {
    inputs: [
      { id: 'calls', label: 'Calls in the hour (Oct: day 5.8 · evening 1.5 · night 1.3)', min: .5, max: 40, step: .1, val: 5.8 },
      { id: 'aht', label: 'Handle time, minutes (example)', min: 3, max: 30, step: .05, val: 13.45 },
      { id: 'occ', label: 'Planned occupancy % (Kalam target 40.8)', min: 20, max: 90, step: .1, val: 40.8 },
      { id: 'shr', label: 'Shrinkage % (example)', min: 0, max: 40, step: .25, val: 18.75 },
      { id: 'min', label: 'Minimum cover per language', min: 1, max: 4, step: 1, val: 2 },
      { id: 'cost', label: 'Loaded cost per paid hour, $ (example)', min: 4, max: 30, step: .1, val: 8.4 }
    ],
    calc(v) {
      const A = v.calls * v.aht / 60, f = A / (v.occ / 100), byF = Math.max(1, Math.ceil(f - 1e-9)), li = Math.max(byF, v.min), sc = li / (1 - v.shr / 100);
      const busy = erlangC(A, li), items = [];
      for (let k = 1; k <= Math.max(6, li + 2); k++) items.push({ k: String(k), v: erlangC(A, k), on: k === li });
      return {
        outs: [
          { l: 'Schedule', v: n0(Math.ceil(sc - 1e-9)), s: `${n1(sc)} = logged in ÷ (1 − shrinkage)`, t: 'good' },
          { l: 'Logged in', v: n0(li), s: `formula ${n1(f)}, minimum ${v.min}` },
          { l: 'Callers finding all busy', v: pct(busy), s: 'Erlang C, random arrivals', t: busy > .3 ? 'bad' : busy < .15 ? 'good' : '' },
          { l: 'Cost of the hour', v: `$${n0(sc * v.cost)}`, s: 'scheduled × loaded cost' }
        ],
        chart: '<p class="lcap">Share of callers who find every interpreter busy, by interpreters logged in (yours is dark)</p>' + barChart(items, 0, ''),
        tip: li > byF ? `The formula alone says ${byF}. With that, ${pct(erlangC(A, byF))} of callers would find nobody free. Minimum cover is what protects small queues, like the night.`
          : `Here the formula sets the number. Real occupancy would be about ${pct(A / li)}. Plan higher occupancy and cost falls, but more callers wait.`
      };
    }
  },
  ioccupancy: {
    inputs: [
      { id: 'prod', label: 'Productive (talk) hours · Oct 404', min: 100, max: 1000, step: 1, val: 404 },
      { id: 'logged', label: 'Logged-in hours · Oct about 1,154', min: 150, max: 2500, step: 1, val: 1154 },
      { id: 'shr', label: 'Shrinkage % (example)', min: 0, max: 40, step: .25, val: 18.75 },
      { id: 'cost', label: 'Loaded cost per paid hour, $ (example)', min: 4, max: 30, step: .1, val: 8.4 },
      { id: 'price', label: 'Price per interpreted minute, $ (example)', min: .3, max: 3, step: .01, val: .9 }
    ],
    calc(v) {
      const lg = Math.max(v.logged, v.prod), occ = v.prod / lg, paid = lg / (1 - v.shr / 100), dc = paid * v.cost, rev = v.prod * 60 * v.price, gm = rev - dc;
      return {
        outs: [
          { l: 'Occupancy', v: pct(occ), s: 'productive ÷ logged in · target 40.8%', t: occ >= .408 ? 'good' : 'bad' },
          { l: 'Cost per productive hour', v: `$${n1(dc / v.prod)}`, s: `${n0(paid)} paid h × $${n1(v.cost)} ÷ ${n0(v.prod)} h` },
          { l: 'Revenue (per minute)', v: `$${n0(rev)}`, s: 'productive minutes × price' },
          { l: 'Gross margin', v: pct(rev ? gm / rev : 0), s: `$${n0(gm)}`, t: gm >= 0 ? 'good' : 'bad' }
        ],
        chart: `<p class="lcap">Logged-in time: interpreting vs available and waiting</p>${stackBar([{ k: 'Interpreting', v: v.prod, c: 'g' }, { k: 'Available', v: lg - v.prod, c: 'm' }])}`,
        tip: `At 40.8% the same work needs about ${n0(v.prod / .408)} logged-in hours. Take hours out of quiet day time, never out of the night, where callers already wait.`
      };
    }
  },
  icontract: {
    inputs: [
      { id: 'mins', label: 'Interpreted minutes · Oct 24,240', min: 5000, max: 60000, step: 10, val: 24240 },
      { id: 'calls', label: 'Answered calls · Oct 2,117', min: 500, max: 6000, step: 1, val: 2117 },
      { id: 'round', label: 'Rounding added per call, minutes (contract)', min: 0, max: 1, step: .05, val: .5 },
      { id: 'price', label: 'Price per billable minute, $ (example)', min: .3, max: 3, step: .01, val: .9 },
      { id: 'aban', label: 'Abandonment % · Oct 6.6 (2% credit above 5%)', min: 0, max: 20, step: .1, val: 6.6 },
      { id: 'dc', label: 'Direct interpreter cost, $ (example)', min: 2000, max: 40000, step: 10, val: 11928 },
      { id: 'oh', label: 'Overheads, $ (example)', min: 0, max: 20000, step: 50, val: 5000 }
    ],
    calc(v) {
      const bill = v.mins + v.calls * v.round, gross = bill * v.price, credit = v.aban > 5 ? gross * .02 : 0, rev = gross - credit, gm = rev - v.dc, op = gm - v.oh;
      return {
        outs: [
          { l: 'Amount due', v: `$${n0(rev)}`, s: `${n0(bill)} billable min − $${n0(credit)} credit` },
          { l: 'Gross margin', v: pct(rev ? gm / rev : 0), s: `$${n0(gm)}`, t: rev && gm / rev >= .4 ? 'good' : gm < 0 ? 'bad' : '' },
          { l: 'Operating profit', v: pct(rev ? op / rev : 0), s: `$${n0(op)}`, t: op >= 0 ? 'good' : 'bad' },
          { l: 'Revenue per productive hour', v: `$${n1(rev / (v.mins / 60))}`, s: 'amount due ÷ interpreted hours' }
        ],
        chart: `<p class="lcap">Where each dollar of the invoice goes</p>${stackBar([{ k: 'Interpreters', v: v.dc, c: 'm' }, { k: 'Overheads', v: v.oh, c: 'v' }, { k: 'Profit', v: Math.max(0, op), c: 'g' }])}`,
        tip: credit ? `The abandonment credit costs $${n0(credit)} this month. Bring abandonment to 5% or below and it disappears.` : `No service credit this month. Each extra 1,000 interpreted minutes adds about $${n0(1000 * v.price)} of revenue.`
      };
    }
  },
  pnl: {
    inputs: [
      { id: 'calls', label: 'Calls answered', min: 50000, max: 300000, step: 1000, val: 208000 },
      { id: 'price', label: 'Price per answered call ($)', min: .1, max: 1, step: .01, val: .4 },
      { id: 'pen', label: 'Calls charged a $0.25 penalty', min: 0, max: 40000, step: 1000, val: 12000 },
      { id: 'fx', label: '$1 in EGP', min: 30, max: 70, step: 1, val: 50 },
      { id: 'agents', label: 'Agents (EGP 12,000 each)', min: 50, max: 250, step: 1, val: 152 },
      { id: 'ot', label: 'Overtime hours (EGP 100 each)', min: 0, max: 4000, step: 10, val: 1310 },
      { id: 'lead', label: 'Supervisors, ACMs and support (EGP)', min: 100000, max: 800000, step: 1000, val: 378000 }
    ],
    calc(v) {
      const rev = (v.calls * v.price - v.pen * .25) * v.fx, ag = v.agents * 12000, ot = v.ot * 100, dc = ag + ot + v.lead;
      const gm = rev - dc, gmp = rev ? gm / rev : 0;
      return {
        outs: [
          { l: 'Revenue', v: `EGP ${n0(rev)}`, s: 'calls × price − penalties' },
          { l: 'Direct cost', v: `EGP ${n0(dc)}`, s: 'agents + overtime + leaders' },
          { l: 'Gross margin', v: `EGP ${n0(gm)}`, s: 'revenue − direct cost', t: gm >= 0 ? 'good' : 'bad' },
          { l: 'GM %', v: pct(gmp), s: 'gross margin ÷ revenue', t: gmp >= .4 ? 'good' : gmp < .25 ? 'bad' : '' }
        ],
        chart: `<p class="lcap">Where each pound of revenue goes</p>${stackBar([{ k: 'Agents', v: ag, c: 'm' }, { k: 'Overtime', v: ot, c: 'r' }, { k: 'Leaders & support', v: v.lead, c: 'v' }, { k: 'Margin', v: Math.max(0, gm), c: 'g' }])}`,
        tip: `Penalties cost EGP ${n0(v.pen * .25 * v.fx)} this month. Each 1,000 extra answered calls adds EGP ${n0(1000 * v.price * v.fx)} of revenue.`
      };
    }
  }
};

const fmtIn = (i, x) => i.step < 1 ? (+x).toFixed(i.step < .1 ? 2 : 1) : n0(+x);

export const labLesson = {
  render(ctx) {
    const { L } = ctx, lab = LABS[L.lab];
    if (!lab) return `<div class="card"><p>This lab isn't available yet.</p></div>${actionBar(ctx, 'Lab')}`;
    const ins = lab.inputs.map(i => `<div class="lin"><label for="lab-${i.id}"><span>${esc(i.label)}</span><output id="lab-${i.id}-o" for="lab-${i.id}">${fmtIn(i, i.val)}</output></label>
      <input type="range" id="lab-${i.id}" data-k="${i.id}" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.val}"></div>`).join('');
    return `${L.intro ? `<p class="body">${esc(L.intro)}</p>` : ''}
      <div class="lab"><div class="lpanel lins"><p class="eyebrow">Change the numbers</p>${ins}<button type="button" class="link btnlink" id="lab-reset">Reset to the example</button></div>
      <div class="lpanel lres"><div class="louts" id="lab-outs" role="status" aria-live="polite"></div><div id="lab-chart"></div><p class="ltip" id="lab-tip"></p></div></div>
      ${actionBar(ctx, `Interactive lab${L.minutes ? ` · about ${+L.minutes} min` : ''} · sample numbers`)}${moduleFiles(ctx)}`;
  },
  wire(ctx) {
    const lab = LABS[ctx.L.lab]; if (!lab) return;
    let touched = false;
    const draw = () => {
      const v = {};
      lab.inputs.forEach(i => { const el = $(`#lab-${i.id}`); v[i.id] = +el.value; $(`#lab-${i.id}-o`).textContent = fmtIn(i, el.value); });
      const r = lab.calc(v);
      $('#lab-outs').innerHTML = r.outs.map(o => `<div class="lout ${o.t || ''}"><span>${esc(o.l)}</span><b>${esc(o.v)}</b><small>${esc(o.s || '')}</small></div>`).join('');
      $('#lab-chart').innerHTML = r.chart; $('#lab-tip').textContent = r.tip || '';
    };
    $$('.lab input[type=range]').forEach(el => el.addEventListener('input', () => { draw(); if (!touched) { touched = true; complete(ctx); } }));
    $('#lab-reset').addEventListener('click', () => { lab.inputs.forEach(i => { $(`#lab-${i.id}`).value = i.val; }); draw(); });
    draw();
  }
};
