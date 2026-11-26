/* Shared helpers and components. No content lives here. */
window.UI = (function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* text formatter: [x] = placeholder to confirm, TBM = to be measured */
  const fmt = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">$1</span>').replace(/\bTBM\b/g, '<span class="tbm" title="To Be Measured">TBM</span>');

  const ALL_INITS = () => [
    ...IMS.projects.flatMap(p => p.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", parent: p.id, parentName: p.short }))),
    ...IMS.capabilities.flatMap(c => c.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", parent: c.id, parentName: c.name })))
  ];
  const STATUS_ORDER = ["live-company", "live-personal", "poc", "pilot", "dev", "prototype", "approval", "planned", "blocked"];
  const countBy = list => { const o = {}; list.forEach(i => o[i.status] = (o[i.status] || 0) + 1); return o; };

  /* Project-level status is calculated from its initiatives */
  function projStatus(p) {
    const s = p.initiatives.map(i => i[2]);
    const started = s.filter(x => IMS.STATUS[x].rank >= 3).length;
    const appr = s.filter(x => x === "approval").length;
    if (started) return { key: "progress", label: "In progress", tone: "future", detail: `${started} of ${s.length} initiatives started` };
    if (appr) return { key: "approval", label: "Awaiting approval", tone: "decision", detail: `${appr} of ${s.length} initiatives in a pilot awaiting approval` };
    return { key: "planned", label: "Planned", tone: "neutral", detail: `${s.length} initiatives planned` };
  }
  const badge = (key) => { const st = IMS.STATUS[key]; return `<span class="badge t-${st.tone}">${esc(st.label)}</span>`; };
  const pbadge = p => { const s = projStatus(p); return `<span class="badge t-${s.tone}">${s.label}</span>`; };
  const mtag = st => `<span class="mtag m-${st}">${st === "measured" ? "Measured" : st === "estimate" ? "Estimate" : st === "partial" ? "Partly validated" : "Not yet measured"}</span>`;
  const atype = t => `<span class="atype a-${t}" title="${esc(IMS.AUTOTYPE[t][1])}">${esc(IMS.AUTOTYPE[t][0])}</span>`;
  /* link to a project, capability or foundation page */
  const plink = id => {
    const p = IMS.projects.find(x => x.id === id); if (p) return `<a href="#/portfolio/${p.id}">${p.id} ${esc(p.short)}</a>`;
    const c = IMS.capabilities.find(x => x.id === id); if (c) return `<a href="#/portfolio/${c.id}">${c.id} ${esc(c.name)}</a>`;
    const f = (IMS.foundations || []).find(x => x.id === id); if (f) return `<a href="#/tech" data-goto="architecture" title="${esc(f.what)}">${esc(f.name)}</a>`;
    return `<span>${esc({ ALL: "Program" }[id] || id)}</span>`;
  };
  const parentName = id => (IMS.projects.find(x => x.id === id) || {}).short || (IMS.capabilities.find(x => x.id === id) || {}).name || id;
  /* dates: every timeline counts months from IMS.program.start */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const start = () => { const [y, m] = IMS.program.start.split("-").map(Number); return { y, m: m - 1 }; };
  const monthLabel = (off, withYear = true) => { const s = start(), t = s.m + Math.floor(off); const y = s.y + Math.floor(t / 12), m = ((t % 12) + 12) % 12; return MON[m] + (withYear ? " " + y : ""); };
  const monthOffset = d => { const s = start(); const dt = typeof d === "string" ? new Date(d + "T12:00:00") : d; const days = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate(); return (dt.getFullYear() - s.y) * 12 + dt.getMonth() - s.m + (dt.getDate() - 1) / days; };
  const fmtDate = d => { const dt = new Date(d + "T12:00:00"); return `${dt.getDate()} ${MON[dt.getMonth()]} ${dt.getFullYear()}`; };
  const span = (a, b) => { const x = monthLabel(a), y = monthLabel(Math.max(a, b - 0.01)); return x === y ? x : x.split(" ")[1] === y.split(" ")[1] ? `${x.split(" ")[0]} – ${y}` : `${x} – ${y}`; };
  /* risk severity from the actual ratings: H=3, M=2, L=1; score = impact × probability */
  const RV = { H: 3, M: 2, L: 1 };
  const riskScore = r => RV[r.impact] * RV[r.prob];
  const riskLevel = r => { const n = riskScore(r); return n === 9 ? ["crit", "Critical"] : n >= 6 ? ["high", "High"] : n >= 3 ? ["med", "Medium"] : ["low", "Low"]; };
  const tone = (t, label) => `<span class="pm-pill t-${t}"><i></i>${esc(label)}</span>`;
  const ownerText = o => !o || /to be (named|assigned)/i.test(o) ? `<a class="pm-tbn" href="#/decisions" data-goto="decisions" title="Owners are appointed under decision D-08">To be assigned</a>` : esc(o);
  const sbar = counts => { const tot = Object.values(counts).reduce((a, b) => a + b, 0) || 1; return `<div class="sbar" role="img" aria-label="Initiatives by status">${STATUS_ORDER.filter(k => counts[k]).map(k => `<i class="sb-${k}" style="width:${counts[k] / tot * 100}%" title="${IMS.STATUS[k].label}: ${counts[k]}"></i>`).join("")}</div>`; };
  const ticks = (arr, cls = "") => `<ul class="ticks ${cls}">${arr.map(x => `<li>${fmt(x)}</li>`).join("")}</ul>`;
  const flow = (steps, cls = "") => `<div class="flow ${cls}">${steps.map((s, i) => `<div class="s"><span class="n">${String(i + 1).padStart(2, "0")}</span>${fmt(s)}</div>`).join("")}</div>`;
  const sh = (eyebrow, title, text) => `<div class="sh"><div><div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2>${text ? `<p>${text}</p>` : ""}</div></div>`;
  /* every chart has: title, unit, period, source, optional legend */
  const chart = (o) => `<div class="card chart"><div class="ct"><div><h4>${esc(o.title)}</h4><div class="meta">Unit: ${esc(o.unit)} · Period: ${esc(o.period)}</div></div>${o.legend ? `<div class="legend">${o.legend}</div>` : ""}</div>${o.body}${o.text ? `<p class="note">${o.text}</p>` : ""}<div class="src">Source: ${esc(o.source)}</div></div>`;
  const key = (c, label, cls = "") => `<span><i class="${cls}" style="background:${c}"></i>${esc(label)}</span>`;
  const table = (heads, rows, cls = "") => `<div class="tbl"><table class="${cls}"><thead><tr>${heads.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  return { $, $$, esc, fmt, ALL_INITS, STATUS_ORDER, countBy, projStatus, badge, pbadge, mtag, atype, plink, parentName, sbar, ticks, flow, sh, chart, key, table, monthLabel, monthOffset, fmtDate, span, riskScore, riskLevel, tone, ownerText };
})();
