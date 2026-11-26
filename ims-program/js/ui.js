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
  const plink = id => {
    const p = IMS.projects.find(x => x.id === id); if (p) return `<a href="#/portfolio/${p.id}">${p.id} ${esc(p.short)}</a>`;
    const c = IMS.capabilities.find(x => x.id === id); if (c) return `<a href="#/portfolio" data-goto="caps">${c.id} ${esc(c.name)}</a>`;
    return `<span>${esc({ "F-DATA": "Data platform (IT)", IT: "IT hosting and sign-in", ALL: "Program" }[id] || id)}</span>`;
  };
  const sbar = counts => { const tot = Object.values(counts).reduce((a, b) => a + b, 0) || 1; return `<div class="sbar" role="img" aria-label="Initiatives by status">${STATUS_ORDER.filter(k => counts[k]).map(k => `<i class="sb-${k}" style="width:${counts[k] / tot * 100}%" title="${IMS.STATUS[k].label}: ${counts[k]}"></i>`).join("")}</div>`; };
  const ticks = (arr, cls = "") => `<ul class="ticks ${cls}">${arr.map(x => `<li>${fmt(x)}</li>`).join("")}</ul>`;
  const flow = (steps, cls = "") => `<div class="flow ${cls}">${steps.map((s, i) => `<div class="s"><span class="n">${String(i + 1).padStart(2, "0")}</span>${fmt(s)}</div>`).join("")}</div>`;
  const sh = (eyebrow, title, text) => `<div class="sh"><div><div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2>${text ? `<p>${text}</p>` : ""}</div></div>`;
  /* every chart has: title, unit, period, source, optional legend */
  const chart = (o) => `<div class="card chart"><div class="ct"><div><h4>${esc(o.title)}</h4><div class="meta">Unit: ${esc(o.unit)} · Period: ${esc(o.period)}</div></div>${o.legend ? `<div class="legend">${o.legend}</div>` : ""}</div>${o.body}${o.text ? `<p class="note">${o.text}</p>` : ""}<div class="src">Source: ${esc(o.source)}</div></div>`;
  const key = (c, label, cls = "") => `<span><i class="${cls}" style="background:${c}"></i>${esc(label)}</span>`;
  const table = (heads, rows, cls = "") => `<div class="tbl"><table class="${cls}"><thead><tr>${heads.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  return { $, $$, esc, fmt, ALL_INITS, STATUS_ORDER, countBy, projStatus, badge, pbadge, mtag, atype, plink, sbar, ticks, flow, sh, chart, key, table };
})();
