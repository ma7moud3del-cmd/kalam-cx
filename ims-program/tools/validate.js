/* Data integrity check for the IMS program site.
   Run:  node tools/validate.js
   Fails (exit 1) when IDs, statuses or references in js/data/*.js disagree. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["program.js", "projects.js", "delivery.js"]) vm.runInContext(fs.readFileSync(path.join(root, "js/data", f), "utf8"), ctx, { filename: f });
const IMS = ctx.window.IMS;
const errs = [], warn = [];
const ids = new Set();
const uniq = (id, what) => { if (ids.has(id)) errs.push(`Duplicate id ${id} (${what})`); ids.add(id); };

const projIds = new Set(IMS.projects.map(p => p.id)), capIds = new Set(IMS.capabilities.map(c => c.id));
const riskIds = new Set(IMS.risks.map(r => r.id)), sysIds = new Set(IMS.systems.map(s => s.id));
const pillars = new Set(IMS.objectives.map(o => o[0]));
const extraDeps = new Set(["F-DATA", "IT"]);

for (const p of IMS.projects) {
  uniq(p.id, "project");
  for (const k of ["name", "pain", "objective", "outcome", "problem", "owner", "stage", "baseline"]) if (!p[k]) errs.push(`${p.id}: missing ${k}`);
  for (const k of ["depts", "pillars", "current", "future", "requirements", "automation", "systems", "controls", "deliverables", "deps", "risks", "kpis", "initiatives"]) if (!Array.isArray(p[k]) || !p[k].length) errs.push(`${p.id}: missing list ${k}`);
  p.pillars.forEach(x => pillars.has(x) || errs.push(`${p.id}: unknown pillar ${x}`));
  p.systems.forEach(x => sysIds.has(x) || errs.push(`${p.id}: unknown system ${x}`));
  p.risks.forEach(x => riskIds.has(x) || errs.push(`${p.id}: unknown risk ${x}`));
  p.deps.forEach(x => projIds.has(x) || capIds.has(x) || extraDeps.has(x) || errs.push(`${p.id}: unknown dependency ${x}`));
  p.automation.forEach(a => IMS.AUTOTYPE[a[1]] || errs.push(`${p.id}: unknown automation type ${a[1]}`));
  if (!IMS.flows[p.flow]) errs.push(`${p.id}: unknown flow ${p.flow}`);
  if (!IMS.gateProgress[p.id] || IMS.gateProgress[p.id].length !== IMS.gates.length - 1) errs.push(`${p.id}: gateProgress must have ${IMS.gates.length - 1} values`);
  p.initiatives.forEach(i => { uniq(i[0], "initiative"); if (!i[0].startsWith(p.id + ".")) errs.push(`${i[0]} not under ${p.id}`); if (!IMS.STATUS[i[2]]) errs.push(`${i[0]}: unknown status ${i[2]}`); });
  for (const k of ["volume", "cur", "next", "review", "impl", "recur", "hours", "capacity", "savings", "roi", "payback"]) if (!p.roi || p.roi[k] == null) errs.push(`${p.id}: ROI field ${k} missing`);
  if (/\$\s?\d/.test(p.roi.savings) && !/0/.test(p.roi.savings)) errs.push(`${p.id}: cash savings claimed without evidence`);
}
for (const c of IMS.capabilities) { uniq(c.id, "capability"); c.usedBy.forEach(x => projIds.has(x) || errs.push(`${c.id}: usedBy unknown ${x}`)); c.initiatives.forEach(i => { uniq(i[0], "initiative"); IMS.STATUS[i[2]] || errs.push(`${i[0]}: unknown status`); }); }
for (const r of IMS.risks) { uniq(r.id, "risk"); if (!"HML".includes(r.impact) || !"HML".includes(r.prob)) errs.push(`${r.id}: bad rating`); }
for (const r of IMS.roadmap) if (!(projIds.has(r[3]) || capIds.has(r[3]) || r[3] === "ALL")) errs.push(`Roadmap "${r[0]}": unknown project ${r[3]}`);
for (const m of IMS.metrics) { uniq(m.id, "metric"); if (!["measured", "estimate", "open"].includes(m.status)) errs.push(`${m.id}: bad status`); if (!m.source) errs.push(`${m.id}: no source`); }
for (const e of IMS.evidence) { uniq(e.id, "evidence"); if (e.img && !fs.existsSync(path.join(root, e.img))) errs.push(`${e.id}: image missing ${e.img}`); }
for (const d of IMS.decisions) { uniq(d[0], "decision"); if (d.length !== 7) errs.push(`${d[0]}: needs 7 fields`); }
for (const r of IMS.raci.rows) if (r.length !== IMS.raci.roles.length + 1) errs.push(`RACI row "${r[0]}" has ${r.length - 1} cells, expected ${IMS.raci.roles.length}`); else if (r.slice(1).filter(x => x === "A").length !== 1) errs.push(`RACI row "${r[0]}" must have exactly one A`);
for (const f of Object.values(IMS.flows)) if (!f.steps.length) errs.push(`Flow ${f.name} empty`);

const inits = [...IMS.projects.flatMap(p => p.initiatives), ...IMS.capabilities.flatMap(c => c.initiatives)];
const by = {}; inits.forEach(i => by[i[2]] = (by[i[2]] || 0) + 1);
console.log(`Projects ${IMS.projects.length} · capabilities ${IMS.capabilities.length} · initiatives ${inits.length}`);
console.log("Initiatives by status:", JSON.stringify(by));
console.log(`Risks ${IMS.risks.length} · issues ${IMS.issues.length} · decisions ${IMS.decisions.length} · metrics ${IMS.metrics.length} · systems ${IMS.systems.length}`);
warn.forEach(w => console.log("WARN", w));
if (errs.length) { errs.forEach(e => console.log("ERROR", e)); console.log(`${errs.length} error(s)`); process.exit(1); }
console.log("Data check passed");
