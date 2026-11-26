/* Data integrity check for the IMS program site.
   Run:  node tools/validate.js      (from ims-program/)
   Reports every problem it finds and exits 1 if there is any error.
   It never corrects data: fix the data files and run it again. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["program.js", "projects.js", "delivery.js"]) vm.runInContext(fs.readFileSync(path.join(root, "js/data", f), "utf8"), ctx, { filename: f });
const IMS = ctx.window.IMS;
const errs = [], warn = [];
const E = m => errs.push(m), W = m => warn.push(m);
const ids = new Set();
const uniq = (id, what) => { if (ids.has(id)) E(`Duplicate id ${id} (${what})`); ids.add(id); };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------- program dates ---------- */
const G = IMS.program;
if (!/^\d{4}-\d{2}-\d{2}$/.test(G.reportDate || "")) E("program.reportDate missing or not YYYY-MM-DD");
if (!/^\d{4}-\d{2}-01$/.test(G.start || "")) E("program.start missing or not the first of a month");
const [sy, sm] = (G.start || "2026-12-01").split("-").map(Number);
const label = off => { const t = sm - 1 + off; return `${MON[t % 12]} ${sy + Math.floor(t / 12)}`; };

const projIds = new Set(IMS.projects.map(p => p.id)), capIds = new Set(IMS.capabilities.map(c => c.id));
const riskIds = new Set(IMS.risks.map(r => r.id)), sysIds = new Set(IMS.systems.map(s => s.id));
const fndIds = new Set((IMS.foundations || []).map(f => f.id));
const pillars = new Set(IMS.objectives.map(o => o[0]));

/* ---------- projects ---------- */
for (const p of IMS.projects) {
  uniq(p.id, "project");
  for (const k of ["name", "short", "pain", "objective", "outcome", "problem", "owner", "lead", "stage", "baseline", "depText"]) if (!p[k]) E(`${p.id}: missing ${k}`);
  if (!["named", "to-name", "to-confirm"].includes(p.ownerStatus)) E(`${p.id}: ownerStatus must be "named", "to-name" or "to-confirm"`);
  if (p.ownerStatus === "named" && /to be (named|assigned)/i.test(p.owner)) E(`${p.id}: ownerStatus "named" but owner says to be named`);
  if (p.ownerStatus !== "named") W(`${p.id}: accountable owner not appointed (shown as "To be assigned")`);
  for (const k of ["depts", "pillars", "current", "future", "requirements", "automation", "systems", "controls", "deliverables", "deps", "risks", "kpis", "initiatives", "scopeIn", "scopeOut", "data", "stakeholders", "kpiSrc"]) if (!Array.isArray(p[k]) || !p[k].length) E(`${p.id}: missing list ${k}`);
  p.pillars.forEach(x => pillars.has(x) || E(`${p.id}: unknown company goal ${x}`));
  p.systems.forEach(x => sysIds.has(x) || E(`${p.id}: unknown system ${x}`));
  p.risks.forEach(x => riskIds.has(x) || E(`${p.id}: unknown risk ${x}`));
  p.deps.forEach(x => projIds.has(x) || capIds.has(x) || fndIds.has(x) || E(`${p.id}: unknown dependency ${x}`));
  if (p.deps.includes(p.id)) E(`${p.id}: depends on itself`);
  p.automation.forEach(a => IMS.AUTOTYPE[a[1]] || E(`${p.id}: unknown automation type ${a[1]}`));
  if (!IMS.flows[p.flow]) E(`${p.id}: unknown flow ${p.flow}`);
  p.kpis.forEach((k, i) => { if (!k[0] || !k[1]) E(`${p.id}: KPI ${i + 1} needs a name and a definition`); if (!k[2]) E(`${p.id}: KPI "${k[0]}" has no baseline (use TBM)`); if (!(p.kpiSrc || [])[i]) E(`${p.id}: KPI "${k[0]}" has no data source`); });
  if ((p.kpiSrc || []).length !== p.kpis.length) E(`${p.id}: kpiSrc has ${(p.kpiSrc || []).length} entries for ${p.kpis.length} KPIs`);
  p.initiatives.forEach(i => { uniq(i[0], "initiative"); if (!i[0].startsWith(p.id + ".")) E(`${i[0]} is listed under ${p.id} but its ID says otherwise`); if (!IMS.STATUS[i[2]]) E(`${i[0]}: unknown status ${i[2]}`); });
  for (const k of ["volume", "cur", "next", "review", "impl", "recur", "hours", "capacity", "savings", "roi", "payback"]) if (!p.roi || p.roi[k] == null) E(`${p.id}: ROI field ${k} missing`);
  if (p.roi && /\$\s?[1-9]/.test(p.roi.savings)) E(`${p.id}: cash savings claimed; needs Finance confirmation in the metrics register`);
  /* gate progress: 8 values of 0/1/2; a passed gate needs every earlier gate passed */
  const gp = IMS.gateProgress[p.id];
  if (!gp || gp.length !== IMS.gates.length - 1) E(`${p.id}: gateProgress must have ${IMS.gates.length - 1} values`);
  else {
    gp.forEach((v, k) => { if (![0, 1, 2].includes(v)) E(`${p.id}: gate ${IMS.gates[k + 1][0]} value ${v} must be 0, 1 or 2`); if (v === 2 && gp.slice(0, k).some(x => x !== 2)) E(`${p.id}: gate ${IMS.gates[k + 1][0]} passed before an earlier gate`); });
    const built = p.initiatives.some(i => IMS.STATUS[i[2]].rank >= 3);
    if (gp[3] > 0 && !built) E(`${p.id}: G4 prototype progress recorded but no initiative is prototype or later`);
    if (built && gp[3] === 0) W(`${p.id}: has a prototype or live initiative but G4 shows no progress`);
  }
}

/* ---------- capabilities and foundations ---------- */
for (const c of IMS.capabilities) { uniq(c.id, "capability"); if (!c.owner) E(`${c.id}: missing owner (use "To be assigned")`); c.usedBy.forEach(x => projIds.has(x) || E(`${c.id}: usedBy unknown ${x}`)); c.initiatives.forEach(i => { uniq(i[0], "initiative"); if (!i[0].startsWith(c.id + ".")) E(`${i[0]} is listed under ${c.id} but its ID says otherwise`); IMS.STATUS[i[2]] || E(`${i[0]}: unknown status ${i[2]}`); }); }
for (const f of IMS.foundations || []) { uniq(f.id, "foundation"); if (!f.owner || !f.name) E(`${f.id}: needs name and owner`); }

/* ---------- risks ---------- */
for (const r of IMS.risks) {
  uniq(r.id, "risk");
  if (!"HML".includes(r.impact) || !"HML".includes(r.prob) || r.impact.length !== 1 || r.prob.length !== 1) E(`${r.id}: impact and probability must be H, M or L`);
  if (!r.owner) E(`${r.id}: missing risk owner`);
  if (!r.mit) E(`${r.id}: missing mitigation`);
  if (!IMS.MSTATUS[r.mstatus]) E(`${r.id}: missing or unknown mitigation status`);
  if (!r.mnote) E(`${r.id}: mitigation status has no explanation`);
  if (!r.review) E(`${r.id}: missing review date`);
  if (r.issue && !IMS.issues.some(i => i[0] === r.issue)) E(`${r.id}: linked issue ${r.issue} does not exist`);
}
IMS.issues.forEach(i => uniq(i[0], "issue"));

/* ---------- roadmap, gates, plan ---------- */
const N = G.months;
for (const r of IMS.roadmap) {
  if (!(projIds.has(r[3]) || capIds.has(r[3]) || r[3] === "ALL")) E(`Roadmap "${r[0]}": unknown project ${r[3]}`);
  if (typeof r[1] !== "number" || typeof r[2] !== "number" || r[1] < 0 || r[2] <= 0 || r[1] + r[2] > N) E(`Roadmap "${r[0]}": start/length outside the ${N}-month program`);
  if (!["run", "pilot", "build", "plan", "gate"].includes(r[4])) E(`Roadmap "${r[0]}": unknown kind ${r[4]}`);
  if (r[6] && !["running", "done", "proposed"].includes(r[6])) E(`Roadmap "${r[0]}": unknown state ${r[6]}`);
  if (r[6] === "running" && r[4] !== "run") E(`Roadmap "${r[0]}": running but not of kind run`);
}
for (const g of IMS.gates) { uniq(g[0], "gate"); if (IMS.gateAt[g[0]] == null) E(`${g[0]}: no month offset in gateAt`); else if (label(IMS.gateAt[g[0]]) !== g[2]) E(`${g[0]}: date text "${g[2]}" does not match offset (${label(IMS.gateAt[g[0]])})`); }
for (let k = 1; k < IMS.gates.length; k++) if (IMS.gateAt[IMS.gates[k][0]] < IMS.gateAt[IMS.gates[k - 1][0]]) E(`${IMS.gates[k][0]} is dated before ${IMS.gates[k - 1][0]}`);
IMS.plan.forEach((s, i) => { if (s.from >= s.to) E(`Phase ${s.step}: from must be before to`); if (i && s.from !== IMS.plan[i - 1].to) E(`Phase ${s.step} does not start where ${IMS.plan[i - 1].step} ends`); s.gates.forEach(g => IMS.gateAt[g] == null && E(`Phase ${s.step}: unknown gate ${g}`)); });
if (IMS.plan[IMS.plan.length - 1].to !== N) E(`Phases end at month ${IMS.plan[IMS.plan.length - 1].to}, program has ${N}`);
const pilotRows = IMS.roadmap.filter(r => /^Pilot [A-Z] /.test(r[0])).map(r => r[0].slice(0, 7));
const pilotTags = [...new Set([...IMS.projects, ...IMS.capabilities].flatMap(x => x.initiatives).map(i => ((i[3] || "").match(/^Pilot [A-Z]/) || [])[0]).filter(Boolean))];
pilotTags.forEach(t => pilotRows.includes(t) || E(`${t}: initiatives reference it but the roadmap has no "${t} · ..." row`));

/* ---------- health ---------- */
for (const h of IMS.health) {
  if (!IMS.HEALTH[h.rating]) E(`Health "${h.area}": rating must be G, A, R or N`);
  for (const k of ["area", "why", "source", "owner", "updated"]) if (!h[k]) E(`Health "${h.area}": missing ${k}`);
  if (h.rating === "G" && !/M-\d\d|measured|report/i.test(h.source + h.why)) E(`Health "${h.area}": green rating without measured evidence`);
}

/* ---------- metrics, evidence ---------- */
for (const m of IMS.metrics) { uniq(m.id, "metric"); if (!["measured", "estimate", "open"].includes(m.status)) E(`${m.id}: bad status`); if (!m.source) E(`${m.id}: no source`); if (!m.period) E(`${m.id}: no period`); }
for (const e of IMS.evidence) { uniq(e.id, "evidence"); if (e.img && !fs.existsSync(path.join(root, e.img))) E(`${e.id}: image missing ${e.img}`); }
/* evidence that must not drift */
const val = id => (IMS.metrics.find(m => m.id === id) || {}).value;
[["M-01", "28 / 28"], ["M-02", "4.5"], ["M-03", "~100"], ["M-04", "~50"], ["M-05", "Same day"], ["M-11", "0"], ["M-12", "$0"]].forEach(([id, v]) => { if (val(id) !== v) E(`${id}: evidence value changed to "${val(id)}" (was "${v}")`); });
if ((IMS.metrics.find(m => m.id === "M-03") || {}).status !== "estimate") E("M-03 manual time must stay labelled as an estimate");
if ((IMS.metrics.find(m => m.id === "M-04") || {}).status !== "estimate") E("M-04 capacity released must stay labelled as an estimate");

/* ---------- decisions ---------- */
for (const d of IMS.decisions) {
  uniq(d[0], "decision");
  if (d.length !== 7) E(`${d[0]}: needs 7 fields`);
  if (!IMS.DSTATUS[d[6]]) E(`${d[0]}: status "${d[6]}" is not one of ${Object.keys(IMS.DSTATUS).join(", ")}`);
  if (!d[4]) E(`${d[0]}: missing required-by date`); else if (!/(G\d|20\d\d)/.test(d[4])) E(`${d[0]}: required-by "${d[4]}" has no gate or date`);
  if (!d[3]) E(`${d[0]}: missing decision owner`);
  if (!d[2] || !d[5]) E(`${d[0]}: needs why and impact of delay`);
}

/* ---------- governance ---------- */
for (const r of IMS.raci.rows) if (r.length !== IMS.raci.roles.length + 1) E(`RACI row "${r[0]}" has ${r.length - 1} cells, expected ${IMS.raci.roles.length}`); else if (r.slice(1).filter(x => x === "A").length !== 1) E(`RACI row "${r[0]}" must have exactly one A`);
for (const f of Object.values(IMS.flows)) if (!f.steps.length) E(`Flow ${f.name} empty`);
const allInitIds = new Set([...IMS.projects, ...IMS.capabilities].flatMap(x => x.initiatives.map(i => i[0])));
for (const a of IMS.readiness) { if (!allInitIds.has(a.id)) E(`Readiness: ${a.id} is not an initiative`); IMS.READY.forEach(r => ["yes", "partial", "no"].includes(a[r[0]]) || E(`Readiness ${a.id}: ${r[0]} must be yes, partial or no`)); if (a.status.startsWith("live-company") && IMS.READY.some(r => a[r[0]] !== "yes")) E(`Readiness ${a.id}: company-live but not all criteria met`); }
[...IMS.projects, ...IMS.capabilities].flatMap(x => x.initiatives).filter(i => /^live|prototype/.test(i[2])).forEach(i => IMS.readiness.some(a => a.id === i[0]) || E(`${i[0]} is ${i[2]} but has no production-readiness record`));

/* ---------- initiative board covers every status exactly once ---------- */
const seen = {}; IMS.BOARD.forEach(c => c.statuses.forEach(s => { if (seen[s]) E(`Board: status ${s} is in two columns`); seen[s] = c.id; if (!IMS.STATUS[s]) E(`Board: unknown status ${s}`); }));
Object.keys(IMS.STATUS).forEach(s => seen[s] || E(`Board: status ${s} has no column, so its initiatives would be hidden`));

/* ---------- summary ---------- */
const inits = [...IMS.projects.flatMap(p => p.initiatives), ...IMS.capabilities.flatMap(c => c.initiatives)];
const by = {}; inits.forEach(i => by[i[2]] = (by[i[2]] || 0) + 1);
const board = IMS.BOARD.map(c => [c.label, inits.filter(i => c.statuses.includes(i[2])).length]);
console.log(`Projects ${IMS.projects.length} · capabilities ${IMS.capabilities.length} · initiatives ${inits.length}`);
console.log("Initiatives by status:", JSON.stringify(by));
console.log("Board columns:", board.map(b => b.join(" ")).join(" · "), "=", board.reduce((a, b) => a + b[1], 0));
console.log(`Risks ${IMS.risks.length} · issues ${IMS.issues.length} · decisions ${IMS.decisions.length} · metrics ${IMS.metrics.length} · systems ${IMS.systems.length} · gates ${IMS.gates.length}`);
warn.forEach(w => console.log("NOTE ", w));
if (errs.length) { errs.forEach(e => console.log("ERROR", e)); console.log(`${errs.length} error(s)`); process.exit(1); }
console.log(`Data check passed (${warn.length} notes)`);
