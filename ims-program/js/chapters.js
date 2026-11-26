/* Chapter renderers. Each returns HTML built only from IMS data. */
window.CHAPTERS = (function () {
  const { esc, fmt, ALL_INITS, STATUS_ORDER, countBy, projStatus, badge, pbadge, mtag, atype, plink, sbar, ticks, flow, sh, chart, key, table } = UI;
  const P = IMS.projects, CAP = IMS.capabilities;
  const metric = id => IMS.metrics.find(m => m.id === id);
  const sec = (id, html) => `<section class="sec" id="${id}"><div class="wrap">${html}</div></section>`;
  const statusLegend = () => `<div class="legend">${STATUS_ORDER.map(k => `<span><i class="sb-${k}"></i>${IMS.STATUS[k].label}</span>`).join("")}</div>`;
  const colorKey = `<div class="keybar legend">${key("var(--cur)", "Current state")}${key("var(--fut)", "Proposed future state")}${key("var(--ok)", "Verified / measured")}${key("var(--est)", "Estimate or personally operated")}${key("var(--risk)", "Risk")}${key("var(--dec)", "Pending decision")}</div>`;

  /* ============ 01 EXECUTIVE OVERVIEW ============ */
  function overview() {
    const G = IMS.program, inits = ALL_INITS(), byS = countBy(inits);
    const ps = P.map(p => projStatus(p).key);
    const pilots = [...new Set(inits.map(i => (i.note.match(/^Pilot [A-Z]/) || [])[0]).filter(Boolean))].sort();
    const depts = [...new Set(P.flatMap(p => p.depts))];
    const completed = inits.filter(i => IMS.STATUS[i.status].rank >= 6);
    const kpis = [
      [P.length, "Registered projects", `${inits.length} initiatives · ${CAP.length} shared capabilities`],
      [ps.filter(x => x === "progress").length, "Active projects", "At least one initiative started"],
      [completed.length, "Completed initiatives", `${completed.filter(i => i.status === "live-personal").length} live but personally operated · ${byS["live-company"] || 0} company-owned`],
      [pilots.length, "Pilots", `${pilots.join(", ")} · all awaiting approval`],
      [ps.filter(x => x === "approval").length, "Projects awaiting approval", "No work started; pilot ready"],
      [depts.length, "Departments involved", depts.slice(0, 4).join(", ") + "…"],
      [metric("M-10").value, "Processes assessed", "Recurring tasks reviewed with Lean"],
      [metric("M-11").value + " h", "Verified hours released", `${metric("M-04").value} h estimated (MasterWord); no baseline validated yet`],
      [metric("M-12").value, "Confirmed financial savings", "Nothing confirmed by Finance yet"],
      [G.months + " months", "Program duration", G.period]
    ];
    const hero = `<header class="hero"><div class="wrap"><div class="grid"><div>
      <div class="org"><img src="assets/mark.png" alt="Kalam"><span>${esc(G.org)}</span></div>
      <h1>IMS Enterprise Operations <em>Transformation 2027</em></h1>
      <p class="stmt">${esc(G.statement)}</p>
      <p class="msg">${esc(G.message)}</p>
      <div class="meta"><span class="chip"><span class="dot"></span>Status: <b>Awaiting approval</b></span><span class="chip">Period <b>${esc(G.period)}</b></span><span class="chip">Updated <b>${esc(G.updated)}</b></span></div>
      <div class="ctas"><a class="btn pri" href="#/portfolio">View the portfolio →</a><a class="btn ghost" href="#/case">Read the business case</a><a class="btn ghost" href="#/decisions">What we need</a></div>
    </div>
    <div class="growth"><div class="k">Company target</div><div class="v">${esc(G.growth.target)}</div><p>${esc(G.growth.logic)}</p><small>${esc(G.growth.source)}</small></div>
    </div></div></header>`;
    const glance = sec("glance", sh("Program at a glance", "Where the program stands today", "Every number below is calculated from the project register and the metrics register. Estimates are labelled.") +
      `<div class="kpis">${kpis.map(k => `<div class="kpi"><div class="v">${esc(k[0])}</div><div class="l">${esc(k[1])}</div><div class="s">${esc(k[2])}</div></div>`).join("")}</div>
      <p class="note">${esc(G.summary)}</p><div style="margin-top:16px"><div class="eyebrow" style="margin-bottom:8px">How to read colours on this site</div>${colorKey}</div>`);
    const vision = sec("vision", sh("Transformation vision", "From Kalam's vision to daily IMS work", "Every project traces back to the company vision and to the growth target.") +
      `<div class="grid g2"><div class="cascade">
        <div class="tier vis"><div class="k">Kalam CX<b>Company vision</b></div><div class="t">${esc(G.vision)}</div></div><div class="conn"></div>
        <div class="tier"><div class="k">Kalam CX<b>Mission</b></div><div class="t">${esc(G.mission)}</div></div><div class="conn"></div>
        <div class="tier"><div class="k">IMS<b>Program vision</b></div><div class="t">${esc(G.imsVision)}</div></div><div class="conn"></div>
        <div class="tier goal"><div class="k">Company target<b>Growth</b></div><div class="t">${esc(G.growth.target)}</div></div><div class="conn"></div>
        <div class="tier"><div class="k">What we deliver<b>${IMS.objectives.length} company goals</b></div><div class="t">${IMS.objectives.map(o => `<span class="pill">${esc(o[0])}</span>`).join("")}</div></div><div class="conn"></div>
        <div class="tier"><div class="k">How<b>${P.length} projects</b></div><div class="t">${P.map(p => `<a class="pill" style="text-decoration:none" href="#/portfolio/${p.id}">${p.id} ${esc(p.short)}</a>`).join("")}</div></div>
      </div>
      <div><h3 style="margin-bottom:12px">What changes</h3>${G.fromTo.map(r => `<div class="ft"><div class="f">${esc(r[0])}</div><div class="ar">→</div><div class="t">${esc(r[1])}</div></div>`).join("")}
      <h3 style="margin:22px 0 10px">How the program lives Kalam's values</h3><div class="grid g2">${G.values.map(v => `<div class="card pad" style="padding:14px 16px"><h4 style="color:var(--plum)">${esc(v[0])}</h4><p class="small muted">${esc(v[1])}</p></div>`).join("")}</div></div></div>`);
    const goals = sec("goals", sh("Strategic objectives", "The five company goals", "Original wording kept. Each goal lists the projects that lead it (bold) or support it, and how progress is proven.") +
      `<div class="grid g5">${IMS.objectives.map((o, i) => {
        const lead = P.filter(p => p.pillars[0] === o[0]), sup = P.filter(p => p.pillars.slice(1).includes(o[0]));
        return `<div class="card pad goal"><div class="n">GOAL ${String(i + 1).padStart(2, "0")}</div><h3>${esc(o[0])}</h3><p class="small muted">${esc(o[1])}</p>
        <div class="projs">${lead.map(p => `<a href="#/portfolio/${p.id}" style="font-weight:700">${p.id}</a>`).join("")}${sup.map(p => `<a href="#/portfolio/${p.id}" style="background:var(--curL);color:var(--soft)">${p.id}</a>`).join("")}</div>
        <div class="proof"><b>How we prove it:</b> ${esc(o[2])}</div></div>`; }).join("")}</div>`);
    const highRisks = IMS.risks.filter(r => r.impact === "H" && r.prob === "H");
    const hl = sec("highlights", sh("Executive highlights", "Achievements, pilots, risks and next milestones") +
      `<div class="grid g4">
      <div class="card pad hl"><h3><i style="background:var(--okL);color:var(--ok)">✓</i>Achieved</h3><ul>${["M-01", "M-02", "M-06", "M-08"].map(id => { const m = metric(id); return `<li><b>${esc(m.value)} ${esc(m.unit)}</b><span>${esc(m.name)} · ${mtag(m.status)}</span></li>`; }).join("")}</ul></div>
      <div class="card pad hl"><h3><i style="background:var(--decL);color:var(--dec)">◷</i>Pilots ready</h3><ul>${pilots.map(pl => { const its = inits.filter(i => i.note === pl); return `<li><b>${pl} · ${esc(its[0].parentName)}</b><span>${its.length} initiatives · awaiting approval</span></li>`; }).join("")}</ul></div>
      <div class="card pad hl"><h3><i style="background:var(--riskL);color:var(--risk)">!</i>Major risks</h3><ul>${highRisks.slice(0, 5).map(r => `<li><b>${r.id} · ${esc(r.cat)}</b><span>${esc(r.text)}</span></li>`).join("")}</ul></div>
      <div class="card pad hl"><h3><i style="background:var(--futL);color:var(--fut)">→</i>Next milestones</h3><ul>${IMS.gates.slice(0, 4).map(g => `<li><b>${g[0]} · ${esc(g[1])}</b><span>${esc(g[2])} · ${esc(g[3])}</span></li>`).join("")}</ul></div>
      </div>`);
    const rows = STATUS_ORDER.map(k => [k, byS[k] || 0]);
    const why = { "live-company": "Nothing is company-owned yet", "live-personal": "In real use, but on a personal PC and account", poc: "", pilot: "No pilot running yet", dev: "", prototype: "Built, not in production", approval: "Inside Pilots A, B and C", planned: "Defined; not started", blocked: "" };
    const started = inits.filter(i => i.status !== "planned");
    const status = sec("status", sh("Program status", "An honest view of every initiative", "A personally operated automation is never shown as company-owned. Progress percentages are not shown, because nothing has a measured baseline yet.") +
      `<div class="grid g2"><div class="card pad"><h3 style="margin-bottom:12px">${inits.length} initiatives by status</h3>${sbar(byS)}<div class="statlist" style="margin-top:16px">${rows.map(r => `<div class="statrow"><span>${badge(r[0])}</span><span class="n">${r[1]}</span><span class="why">${esc(why[r[0]] || "")}</span></div>`).join("")}</div></div>
      <div class="card pad"><h3 style="margin-bottom:10px">Everything that is not just "planned"</h3>${table(["ID", "Initiative", "Status"], started.map(i => [`<span class="mono small">${i.id}</span>`, `<b>${esc(i.name)}</b><br><span class="small">${esc(i.parentName)}${i.note ? " · " + esc(i.note) : ""}</span>`, badge(i.status)]))}</div></div>
      <h3 style="margin:26px 0 10px">Program health</h3><div class="health">${IMS.health.map(h => `<div><b>${esc(h[0])}<span class="rag ${h[1]}">${{ G: "ON TRACK", A: "WATCH", R: "AT RISK" }[h[1]]}</span></b>${esc(h[2])}</div>`).join("")}</div>`);
    return hero + glance + vision + goals + hl + status;
  }

  /* ============ 02 CURRENT STATE & BUSINESS CASE ============ */
  function caseCh() {
    const C = IMS.current, E = C.environment;
    const env = sec("environment", sh("Current operating environment", "Many clients, channels and systems, joined by people", "IMS work today is coordinated by hand between teams, files and chats.") +
      `<div class="envmap"><div class="envcol"><h4>Clients and channels</h4><p class="small muted" style="margin-bottom:10px">${esc(E[0][1])}</p><div class="it">${["Zoom", "Microsoft Teams", "Slack", "Email", "Client files"].map(x => `<span>${x}</span>`).join("")}</div></div>
      <div class="envcol mid"><h4>IMS teams, joined by manual coordination</h4><p class="small" style="margin-bottom:10px;color:var(--risk)">${esc(E[5][1])}</p><div class="it">${E[4][1].split(", ").map(x => `<span>${esc(x)}</span>`).join("")}</div></div>
      <div class="envcol"><h4>Systems and files</h4><p class="small muted" style="margin-bottom:10px">${esc(E[3][1])}</p><div class="it">${E[2][1].replace(", plus ", ", ").split(", ").map(x => `<span>${esc(x)}</span>`).join("")}</div></div></div>`);
    const pains = sec("pains", sh("Current pain points", "Problems by department", "Each group of pain points is addressed by one project.") +
      `<div class="grid g3">${C.pains.map(p => `<div class="card pad"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><h3>${esc(p[0])}</h3><a class="pill main" style="text-decoration:none" href="#/portfolio/${p[2]}">→ ${p[2]}</a></div>${ticks(p[1], "risk")}</div>`).join("")}</div>`);
    const maxW = Math.max(...C.waste.map(w => w[1]));
    const impact = sec("impact", sh("Business impact", "What these problems cost IMS", "No financial loss is claimed. Where impact is not measured it is marked TBM (To Be Measured).") +
      `<div class="grid g2"><div class="card pad">${table(["Consequence", "Known size"], C.impact.map(i => [`<b>${esc(i[0])}</b>`, fmt(i[1])]))}</div>
      ${chart({ title: "Lean waste found in 26 recurring IMS tasks", unit: "number of tasks showing each waste", period: "Review in Nov 2026", source: "Program Lean review (DOWNTIME classification); to confirm in Discovery", body: C.waste.map(w => `<div class="hbar"><span>${esc(w[0])}</span><div class="tr"><i style="width:${w[1] / maxW * 100}%;background:var(--cur)"></i></div><b>${w[1]}</b></div>`).join(""), text: "One task can show several wastes, so the bars do not add up to 26." })}</div>`);
    const vb = { partial: "Partly validated", open: "Not yet measured" };
    const base = sec("baseline", sh("Baseline and measurement strategy", "What we know, and what Discovery will measure", "Only two processes have any measured data. Discovery (6 weeks, gate G1) measures the rest before any target is set.") +
      `<div class="card">${table(["Process", "Current workflow", "Monthly volume", "Processing time", "People involved", "Error rate", "Turnaround", "Cost", "Evidence", "Status"], C.baseline.map(b => [`<b>${esc(b[0])}</b>`, esc(b[1]), fmt(b[2]), fmt(b[3]), esc(b[4]), fmt(b[5]), fmt(b[6]), fmt(b[7]), esc(b[8]), mtag(b[9])]))}</div>
      <h3 style="margin:24px 0 10px">How each project's baseline will be measured</h3><div class="card">${table(["Project", "Baseline method", "KPIs"], P.map(p => [plink(p.id), esc(p.baseline), `${p.kpis.length} KPIs`]))}</div>`);
    const bc = sec("case", sh("Business case", "Problem → solution → value", "Operational value and financial value are kept apart. Financial value stays TBM until Finance confirms it.") +
      `<div class="card pad" style="margin-bottom:16px;border-color:var(--yel2);background:#FFFBE6"><h3>${esc(IMS.program.growth.target)}</h3><p class="small" style="margin-top:6px">${esc(IMS.program.growth.logic)}</p><p class="small" style="margin-top:6px">${fmt(IMS.program.growth.needed)}</p></div>
      <div class="card">${table(["Project", "Problem", "Solution", "Operational value", "Financial value"], P.map(p => [plink(p.id), esc(p.pain), esc(p.objective), ticks(p.value.operational, "ok"), ticks(p.value.financial)]))}</div>`);
    return env + pains + impact + base + bc;
  }

  /* ============ 03 PORTFOLIO ============ */
  function portfolio() {
    const inits = ALL_INITS(), byS = countBy(inits);
    const depts = [...new Set(P.flatMap(p => p.depts))].sort();
    const sum = sec("summary", sh("Enterprise transformation portfolio", `${P.length} projects, ${CAP.length} shared capabilities, ${inits.length} initiatives`, "A project is a business outcome with one owner. Initiatives are the sub-projects inside it. Automation tasks inside an initiative are not counted separately.") +
      `<div class="card pad">${sbar(byS)}<div style="margin-top:12px">${statusLegend()}</div></div>`);
    const cards = P.map(p => {
      const s = projStatus(p), c = countBy(p.initiatives.map(i => ({ status: i[2] })));
      return `<a class="card pcard" href="#/portfolio/${p.id}" data-status="${s.key}" data-depts="${esc(p.depts.join("|"))}">
        <div class="top1"><span class="pid">${p.id}</span>${pbadge(p)}</div>
        <h3>${esc(p.name)}</h3><p class="obj">${esc(p.objective)}</p>
        <dl><dt>Department</dt><dd>${esc(p.depts.join(", "))}</dd><dt>Owner</dt><dd>${esc(p.owner)}</dd><dt>Stage</dt><dd>${esc(p.stage)}</dd><dt>Outcome</dt><dd>${esc(p.outcome)}</dd></dl>
        <div class="mini"><span class="lg">${p.initiatives.length} initiatives · ${esc(s.detail)}</span>${sbar(c)}</div>
        <span class="go">Open project details →</span></a>`;
    }).join("");
    const projects = sec("projects", sh("Projects", "Eight projects", "Filter by status or department. Progress is shown as initiative status, never as a percentage.") +
      `<div class="filters" id="pfilters"><span class="lab">Status</span>${[["all", "All"], ["progress", "In progress"], ["approval", "Awaiting approval"], ["planned", "Planned"]].map((f, i) => `<button class="fbtn${i ? "" : " on"}" data-f="${f[0]}">${f[1]}</button>`).join("")}
      <span class="lab" style="margin-left:10px">Department</span><select class="fsel" id="pdept" aria-label="Filter by department"><option value="all">All departments</option>${depts.map(d => `<option>${esc(d)}</option>`).join("")}</select></div>
      <div class="pgrid" id="pgrid">${cards}</div><p class="note hidden" id="pnone">No project matches these filters.</p>`);
    const caps = sec("caps", sh("Shared capabilities", "Seven platform modules used by several projects", "These are built once and shared, so the projects do not each build their own task list, alerts or knowledge base.") +
      `<div class="grid g3">${CAP.map(c => `<div class="card pad cap"><h4><span class="cid">${c.id}</span>${esc(c.name)}</h4><p>${esc(c.what)}</p><div class="small muted" style="margin-bottom:8px">Used by: ${c.usedBy.map(plink).join(", ")}</div>${c.initiatives.map(i => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:13px;padding:6px 0;border-top:1px solid var(--line)"><span>${esc(i[1])}${i[3] ? `<br><span class="muted small">${esc(i[3])}</span>` : ""}</span>${badge(i[2])}</div>`).join("")}</div>`).join("")}</div>`);
    return sum + projects + caps;
  }

  /* ============ PROJECT DETAIL ============ */
  function project(p) {
    const idx = P.indexOf(p), prev = P[idx - 1], next = P[idx + 1];
    const s = projStatus(p);
    const head = `<div class="chead"><div class="wrap"><div class="crumb"><a href="#/portfolio">03 Portfolio</a> / ${p.id}</div>
      <div class="eyebrow">Project ${p.id} · ${esc(p.lead)}</div><h1>${esc(p.name)}</h1><p>${esc(p.objective)}</p>
      <div class="pmeta"><span class="badge t-${s.tone}">${s.label}</span><span class="chip">Owner <b>${esc(p.owner)}</b></span><span class="chip">Stage <b>${esc(p.stage)}</b></span><span class="chip">Goals <b>${esc(p.pillars.join(" · "))}</b></span></div>
      <div class="subnav" style="margin-top:18px"></div></div></div>`;
    const tabs = [["overview", "Overview"], ["subs", `Sub-projects (${p.initiatives.length})`], ["req", "Requirements & automation"], ["sys", "Systems & controls"], ["delivery", "Delivery & risks"], ["measure", "KPIs, value & ROI"]];
    const gp = IMS.gateProgress[p.id];
    const lifecycle = p.lifecycle ? `<h3 style="margin:24px 0 10px">${p.id === "P05" ? "Payment lifecycle: amounts tracked separately at each status" : "Interpreter lifecycle (14 steps)"}</h3>${p.id === "P05" ? `<div class="cycle">${p.lifecycle.map((x, i) => `${i ? "<i>→</i>" : ""}<span>${esc(x)}</span>`).join("")}</div>` : `<div class="lifecycle">${p.lifecycle.map(x => `<div class="${/first login|first task/i.test(x) ? "pil" : ""}">${esc(x)}</div>`).join("")}</div><p class="note">Blue steps are in Pilot C (awaiting approval).</p>`}` : "";
    const cycle = p.cycle ? `<h3 style="margin:24px 0 10px">Continuous improvement cycle</h3><div class="cycle">${p.cycle.map((x, i) => `${i ? "<i>→</i>" : ""}<span>${esc(x)}</span>`).join("")}</div>` : "";
    const pane = {
      overview: `<div class="grid g2"><div class="card pad"><div class="eyebrow">Business problem</div><p style="margin-top:8px">${esc(p.problem)}</p></div><div class="card pad"><div class="eyebrow">Expected outcome</div><p style="margin-top:8px;font-weight:500">${esc(p.outcome)}</p><div style="margin-top:12px">${p.pillars.map((x, i) => `<span class="pill${i ? "" : " main"}">${esc(x)}</span>`).join("")}</div></div></div>
        <h3 style="margin:24px 0 10px">Current process</h3>${flow(p.current, "cur")}
        <h3 style="margin:22px 0 10px">Proposed future process</h3>${flow(p.future, "fut")}${lifecycle}${cycle}
        ${p.note ? `<p class="note" style="margin-top:18px">${esc(p.note)}</p>` : ""}`,
      subs: `<div class="card">${table(["ID", "Sub-project", "Status", "Note"], p.initiatives.map(i => [`<span class="mono small">${i[0]}</span>`, `<b>${esc(i[1])}</b>`, badge(i[2]), esc(i[3] || "")]))}</div>`,
      req: `<div class="grid g2"><div class="card pad"><h3 style="margin-bottom:10px">Functional requirements</h3>${ticks(p.requirements)}</div><div class="card pad"><h3 style="margin-bottom:10px">Automation opportunities</h3>${p.automation.map(a => `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${esc(a[0])}</span>${atype(a[1])}</div>`).join("")}<p class="note">Types are defined in chapter 05 (AI governance). A rule or a fixed check is never called AI.</p></div></div>`,
      sys: `<div class="grid g2"><div class="card pad"><h3 style="margin-bottom:10px">Systems involved</h3>${table(["System", "Integration status"], p.systems.map(id => { const sy = IMS.systems.find(x => x.id === id); return [`<b>${esc(sy.name)}</b><br><span class="small">${esc(sy.purpose)}</span>`, `<span class="mtag m-${sy.status === "verified" ? "measured" : sy.status === "partial" ? "estimate" : "open"}">${sy.status === "verified" ? "Verified" : sy.status === "partial" ? "Partly verified" : "Not verified"}</span>`]; }))}<p class="note"><a href="#/tech">Full integration register in chapter 05 →</a></p></div>
        <div><div class="card pad"><h3 style="margin-bottom:10px">Human approvals and controls</h3>${ticks(p.controls, "dec")}</div><div class="card pad" style="margin-top:16px"><h3 style="margin-bottom:10px">Dependencies</h3><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${p.deps.map(d => `<span class="pill">${plink(d)}</span>`).join("")}</div><p class="small muted">${esc(p.depText)}</p></div></div></div>`,
      delivery: `<div class="grid g2"><div class="card pad"><h3 style="margin-bottom:10px">Expected deliverables</h3>${ticks(p.deliverables)}</div><div class="card pad"><dl class="kv"><dt>Project owner</dt><dd>${esc(p.owner)}</dd><dt>Departments</dt><dd>${esc(p.depts.join(", "))}</dd><dt>Implementation stage</dt><dd>${esc(p.stage)}</dd><dt>Status</dt><dd>${s.label} · ${esc(s.detail)}</dd></dl></div></div>
        <h3 style="margin:24px 0 10px">Stage gates</h3><div class="card">${table(IMS.gates.slice(1).map(g => g[0]), [gp.map(v => `<span class="mtag ${v === 2 ? "m-measured" : v === 1 ? "m-estimate" : "m-open"}">${v === 2 ? "Passed" : v === 1 ? "Partly" : "Not yet"}</span>`)])}</div>${IMS.gateNotes[p.id] ? `<p class="note">${esc(IMS.gateNotes[p.id])}</p>` : ""}
        <h3 style="margin:24px 0 10px">Roadmap</h3><div class="card pad tbl">${gantt(IMS.roadmap.filter(r => r[3] === p.id))}</div>
        <h3 style="margin:24px 0 10px">Risks</h3><div class="card">${table(["ID", "Risk", "Impact", "Probability", "Mitigation"], p.risks.map(id => { const r = IMS.risks.find(x => x.id === id); return [`<span class="mono small">${r.id}</span>`, `<b>${esc(r.text)}</b><br><span class="small">${esc(r.cat)}</span>`, `<span class="rate ${r.impact}">${r.impact}</span>`, `<span class="rate ${r.prob}">${r.prob}</span>`, esc(r.mit)]; }))}</div>`,
      measure: `<div class="card">${table(["KPI", "Definition", "Baseline"], p.kpis.map(k => [`<b>${esc(k[0])}</b>`, esc(k[1]), fmt(k[2])]))}</div>
        <div class="grid g2" style="margin-top:16px"><div class="card pad"><h3 style="margin-bottom:8px">Baseline measurement</h3><p class="small">${esc(p.baseline)}</p><h3 style="margin:16px 0 8px">Operational value</h3>${ticks(p.value.operational, "ok")}<h3 style="margin:16px 0 8px">Financial value</h3>${ticks(p.value.financial)}</div>
        <div class="card pad"><h3 style="margin-bottom:8px">ROI measurement</h3><dl class="kv">${[["Monthly volume", "volume"], ["Current processing time", "cur"], ["Proposed processing time", "next"], ["Human review time", "review"], ["Implementation cost", "impl"], ["Recurring cost", "recur"], ["Hours saved", "hours"], ["Capacity released", "capacity"], ["Verified financial savings", "savings"], ["ROI", "roi"], ["Payback period", "payback"]].map(r => `<dt>${r[0]}</dt><dd>${fmt(p.roi[r[1]])}</dd>`).join("")}</dl></div></div>`
    };
    const body = `<section class="sec"><div class="wrap"><div class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" data-tab="${t[0]}" class="${i ? "" : "on"}">${t[1]}</button>`).join("")}</div>
      ${tabs.map((t, i) => `<div class="tabpane${i ? "" : " on"}" data-pane="${t[0]}">${pane[t[0]]}</div>`).join("")}
      <div class="pnav">${prev ? `<a class="btn lt" href="#/portfolio/${prev.id}">← ${prev.id} ${esc(prev.short)}</a>` : "<span></span>"}<a class="btn lt" href="#/portfolio">All projects</a>${next ? `<a class="btn lt" href="#/portfolio/${next.id}">${next.id} ${esc(next.short)} →</a>` : "<span></span>"}</div></div></section>`;
    return { head, body };
  }

  /* ============ 04 OPERATING MODEL ============ */
  function model() {
    const R = IMS.roles;
    const diagram = sec("model", sh("Future IMS operating model", "One platform between people, clients and systems", "Requests, data, tasks, alerts and approvals all pass through one company-owned platform. Each role works in its own workspace.") +
      `<div class="card pad"><div class="opmodel">
        <div class="opcol"><div class="h">Who and what feeds in</div>
          <div class="node"><b>Clients</b><span>Requests in their own channel: Zoom, Teams, Slack, email</span></div>
          <div class="node"><b>Interpreters</b><span>Sessions, logins, payment concerns, onboarding steps</span></div>
          <div class="node"><b>Existing systems</b><span>Kalam, Incorta, Zoho, Transparent, Time Doctor, files</span></div></div>
        <div class="core"><div class="h">IMS operating platform</div><h3>Company-owned, role-based</h3>
          <div class="ln"><b><i class="f-req"></i>Requests and tasks</b>Every request becomes a task with owner, due date and status (C1)</div>
          <div class="ln"><b><i class="f-data"></i>Data</b>Validated data in one model; reports and dashboards built from it (P02)</div>
          <div class="ln"><b><i class="f-alert"></i>Alerts</b>Rules raise reminders and escalations to the right role (C2)</div>
          <div class="ln"><b><i class="f-appr"></i>Approvals</b>People approve payments, exceptions, staffing and coaching</div></div>
        <div class="opcol"><div class="h">Role workspaces</div>${R.map(r => `<div class="node"><b>${esc(r.name)}</b><span>${esc(r.sees.slice(0, 4).join(", "))}…</span></div>`).join("")}</div>
      </div><div class="arrows">${[["f-req", "Requests and tasks"], ["f-data", "Data"], ["f-alert", "Alerts"], ["f-appr", "Approvals"]].map(a => `<span><i class="${a[0]}"></i>${a[1]}</span>`).join("")}</div></div>`);
    const journeys = sec("journeys", sh("How work moves", "Four everyday journeys across departments", "Choose a journey to see who does what and what the platform does automatically.") +
      `<div class="filters" id="jtabs">${IMS.journeys.map((j, i) => `<button class="fbtn${i ? "" : " on"}" data-j="${i}">${esc(j.name)}</button>`).join("")}</div>
      ${IMS.journeys.map((j, i) => `<div class="card pad jpane${i ? " hidden" : ""}" data-jp="${i}"><div class="flow fut">${j.steps.map((s, k) => `<div class="s ${s[0] === "Platform" ? "hi" : ""}"><span class="n">${String(k + 1).padStart(2, "0")} · ${esc(s[0]).toUpperCase()}</span>${esc(s[1])}</div>`).join("")}</div><p class="note">Yellow steps are done by the platform. Every other step is a person's decision or action.</p></div>`).join("")}`);
    const ws = sec("workspaces", sh("Role-based workspaces", "What each role sees", "Each workspace shows only what that role needs, fed by the projects listed.") +
      `<div class="grid g3">${R.map(r => `<div class="card pad"><h3 style="color:var(--plum)">${esc(r.name)} workspace</h3><div style="margin:10px 0">${r.sees.map(x => `<span class="pill">${esc(x)}</span>`).join("")}</div><div class="small muted">Fed by: ${r.fed.map(plink).join(", ")}</div></div>`).join("")}</div>`);
    const fl = IMS.flows, keys = Object.keys(fl);
    const procs = sec("processes", sh("Process library", "Seven core processes, future state", "Choose a process. Each one is detailed in its project page.") +
      `<div class="filters" id="ftabs">${keys.map((k, i) => `<button class="fbtn${i ? "" : " on"}" data-fl="${k}">${esc(fl[k].name)}</button>`).join("")}</div>${keys.map((k, i) => `<div class="card pad fpane${i ? " hidden" : ""}" data-fp="${k}">${flow(fl[k].steps, "fut")}<p class="note">Used by: ${P.filter(p => p.flow === k).map(p => plink(p.id)).join(", ")}</p></div>`).join("")}`);
    const cuts = sec("cuts", sh("Lean cuts", "Steps removed from three processes", "Value-stream review: red steps are removed (no value), amber steps are kept because the business needs them, green steps create value.") +
      `<div class="grid g3">${IMS.cuts.map(c => { const n = c.steps.filter(s => s[1] === "x").length; return `<div class="card pad cut"><div class="eyebrow">Value stream</div><h3 style="margin:4px 0 8px">${esc(c.name)}</h3><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px"><span class="n">−${n}</span><span class="small muted">${esc(c.label)}</span></div>${c.steps.map(s => `<div class="step ${s[1]}"><span>${esc(s[0])}</span><em>${s[1] === "x" ? "CUT" : s[1] === "va" ? "VALUE" : "KEEP"}</em></div>`).join("")}<p class="note">${esc(c.note)}</p></div>`; }).join("")}</div>`);
    return diagram + journeys + ws + procs + cuts;
  }

  /* ============ 05 TECHNOLOGY ============ */
  function tech() {
    const S = IMS.systems;
    const stTag = s => `<span class="mtag m-${s === "verified" ? "measured" : s === "partial" ? "estimate" : "open"}">${s === "verified" ? "Verified" : s === "partial" ? "Partly verified" : "Not verified"}</span>`;
    const sys = sec("systems", sh("Existing systems and integration requirements", `${S.length} systems and sources`, "No integration is claimed until IT verifies it. Only the client-portal browser automation is verified today, because it runs on real batches.") +
      `<div class="card">${table(["System", "Business purpose", "Data required", "Data owner", "Integration method", "API", "Authentication", "Risk / limitation", "Status"], S.map(s => [`<b>${esc(s.name)}</b>`, esc(s.purpose), esc(s.data), esc(s.owner), esc(s.method), esc(s.api), esc(s.auth), esc(s.risk), stTag(s.status)]))}</div>`);
    const L = IMS.layers, colors = ["", "var(--plum)", "var(--plum2)", "#2463A6", "#1F7A4D", "#46607F", "var(--cur)"];
    const arch = sec("architecture", sh("Proposed architecture", "Seven layers", "Read from the bottom up: existing systems feed an integration layer, then one data platform, then automation, intelligence and the workspaces people use. Security and governance cover every layer.") +
      `<div class="card pad"><div class="arch"><div class="stack">${L.slice(1).map((l, i) => `<div class="layer"><span class="no" style="background:${colors[i + 1]}">${7 - i - 1}</span><div><h4>${esc(l[0])}</h4><p>${esc(l[1])}</p>${i === L.length - 2 ? `<div class="sys">${S.filter(s => s.id !== "datadb").map(s => `<span>${esc(s.name)}</span>`).join("")}</div>` : ""}</div></div>`).join("")}</div>
      <div class="secbar"><h4>7 · ${esc(L[0][0])}</h4>${L[0][1].split(", ").map(x => `<span>${esc(x)}</span>`).join("")}</div></div></div>`);
    const T = IMS.tech;
    const dots = n => `<span class="dots">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
    const assess = sec("assessment", sh("Technology assessment", "Options compared on seven criteria", esc(T.note)) +
      `<div class="card">${table(["Option", ...T.criteria, "Comment"], T.options.map(o => [`<b>${esc(o[0])}</b>`, ...o[1].map(dots), `<span class="small">${esc(o[2])}</span>`]))}</div><p class="note">● ● ● strong · ● ● moderate · ● weak. "Low vendor dependency" scores higher when the company is less tied to one vendor.</p>`);
    const secu = sec("security", sh("Security and governance", "Controls that apply to every project") +
      `<div class="grid g5">${IMS.security.map(s => `<div class="card pad" style="padding:14px 16px"><h4 style="color:var(--plum)">${esc(s[0])}</h4><p class="small muted" style="margin-top:4px">${esc(s[1])}</p></div>`).join("")}</div>`);
    const A = IMS.aiGov;
    const ai = sec("ai", sh("AI governance", "Where AI adds value, and where it does not", "Five types of automation are kept separate across the whole site.") +
      `<div class="grid g5" style="margin-bottom:16px">${Object.keys(IMS.AUTOTYPE).map(k => `<div class="card pad" style="padding:14px 16px">${atype(k)}<p class="small muted" style="margin-top:8px">${esc(IMS.AUTOTYPE[k][1])}</p></div>`).join("")}</div>
      <div class="grid g2"><div class="card pad"><h3 style="margin-bottom:10px">Principles</h3>${ticks(A.principles, "dec")}</div><div class="card">${table(["Use", "Type", "How it works"], A.where.map(w => [`<b>${esc(w[0])}</b>`, atype(w[1]), esc(w[2])]))}</div></div>`);
    return sys + arch + assess + secu + ai;
  }

  /* ============ 06 ROADMAP & GOVERNANCE ============ */
  function gantt(rows, phase) {
    const M = IMS.months, todayPos = (0 + 0.85) / 13 * 100; /* 26 Nov 2026 sits just before Dec 2026 */
    return `<div class="gantt"><div class="gh"><span></span>${M.map(m => `<span>${m}</span>`).join("")}</div>${rows.map(r => {
      const [label, start, len] = r, kind = phase ? "phase" : r[4], note = phase ? (r[3] || "") : r[5];
      const s0 = Math.floor(start) + 2, e0 = Math.min(15, Math.ceil(start + len) + 2);
      return `<div class="gr" data-proj="${phase ? "" : r[3]}" data-kind="${kind}"><div class="gl">${esc(label)}${phase ? "" : `<small>${r[3] === "ALL" ? "Program" : esc(r[3])}</small>`}</div><div class="gb k-${kind}" style="grid-column:${s0}/${e0}" title="${esc(label)}">${esc(note || "")}</div></div>`;
    }).join("")}</div>`;
  }
  function delivery() {
    const road = sec("roadmap", sh("Program roadmap", "December 2026 to December 2027", "Durations start on approval. Each pilot is measured for at least 4 weeks before a go, change or stop decision.") +
      `<div class="card pad tbl">${gantt(IMS.phases, true)}</div><p class="note">Program phases. Enterprise expansion continues into 2028.</p>
      <div class="filters" id="rfilters" style="margin-top:22px"><span class="lab">Show</span>${[["all", "All workstreams"], ["pilot", "Pilots"], ["build", "Builds"], ["run", "Running now"], ["plan", "Planning"]].map((f, i) => `<button class="fbtn${i ? "" : " on"}" data-k="${f[0]}">${f[1]}</button>`).join("")}</div>
      <div class="card pad tbl">${gantt(IMS.roadmap)}</div><div class="legend" style="margin-top:10px">${key("var(--est)", "Running now (personally operated)")}${key("var(--fut)", "Pilot")}${key("var(--navy3)", "Build")}${key("#8A96AA", "Planning")}${key("var(--dec)", "Approval gate")}</div>`);
    const G = IMS.gates;
    const gates = sec("gates", sh("Stage gates", "Approval criteria for every project", "A project only moves on when the gate criteria are met and the steering committee records the decision.") +
      `<div class="gates">${G.map(g => `<div class="gate"><b>${g[0]}</b><h4>${esc(g[1])}</h4><span>${esc(g[2])}</span><p class="small muted" style="margin-top:4px">${esc(g[3])}</p></div>`).join("")}</div>
      <h3 style="margin:22px 0 10px">Where each project stands</h3><div class="card">${table(["Project", ...G.slice(1).map(g => g[0] + " " + g[1])], P.map(p => [plink(p.id), ...IMS.gateProgress[p.id].map(v => `<i class="p${v}" title="${v === 2 ? "Passed" : v === 1 ? "Partly" : "Not yet"}"></i>`)]), "gm")}</div>
      <div class="legend" style="margin-top:8px"><span><i style="background:var(--ok);border-radius:50%"></i>Passed</span><span><i style="background:var(--est);border-radius:50%"></i>Partly</span><span><i style="border:2px solid var(--line2);border-radius:50%;background:#fff"></i>Not yet</span></div>`);
    const deps = sec("dependencies", sh("Project dependencies", "What has to come first", "Projects share infrastructure and data. Reporting and management intelligence depend on data quality; payment control depends on task data and validation rules.") +
      `<div class="card pad deps">${P.map(p => `<div class="dep"><span class="fr">${plink(p.id)}</span><span class="muted">needs</span><div class="to">${p.deps.map(plink).join("")}</div></div>`).join("")}</div>`);
    const gov = sec("governance", sh("Governance", "Who decides, who delivers") +
      `<div class="card">${table(["Role", "Who", "Responsibility"], IMS.governance.map(g => [`<b>${esc(g[0])}</b>`, esc(g[1]), esc(g[2])]))}</div>
      <h3 style="margin:24px 0 10px">RACI</h3><div class="card">${table(["Activity", ...IMS.raci.roles], IMS.raci.rows.map(r => [`<b>${esc(r[0])}</b>`, ...r.slice(1).map(x => `<b class="${x}">${x}</b>`)]), "raci")}</div>
      <div class="legend" style="margin-top:8px"><span><b class="A" style="padding:1px 6px;border-radius:4px">A</b> Accountable</span><span><b class="R" style="padding:1px 6px;border-radius:4px">R</b> Responsible</span><span><b class="C" style="padding:1px 6px;border-radius:4px">C</b> Consulted</span><span><b class="I" style="padding:1px 6px;border-radius:4px">I</b> Informed</span></div>
      <h3 style="margin:24px 0 10px">Review rhythm</h3><div class="card">${table(["When", "Who", "What"], IMS.rhythm.map(r => [`<b>${esc(r[0])}</b>`, esc(r[1]), esc(r[2])]))}</div>`);
    const cats = [...new Set(IMS.risks.map(r => r.cat))];
    const risks = sec("risks", sh("Risk register", `${IMS.risks.length} risks · ${IMS.issues.length} open issues`, "Impact and probability are initial ratings by the program team, reviewed monthly by the steering committee.") +
      `<div class="filters" id="kfilters"><span class="lab">Category</span><button class="fbtn on" data-c="all">All</button>${cats.map(c => `<button class="fbtn" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="card">${table(["ID", "Category", "Risk", "Impact", "Prob.", "Owner", "Mitigation", "Issue"], IMS.risks.map(r => [`<span class="mono small">${r.id}</span>`, esc(r.cat), `<b>${esc(r.text)}</b>`, `<span class="rate ${r.impact}">${r.impact}</span>`, `<span class="rate ${r.prob}">${r.prob}</span>`, esc(r.owner), esc(r.mit), r.issue ? `<span class="mono small">${r.issue}</span>` : "—"]), "risktbl")}</div>
      <h3 style="margin:24px 0 10px">Open issues</h3><div class="card">${table(["ID", "Area", "Issue", "Impact", "Needed"], IMS.issues.map(i => [`<span class="mono small">${i[0]}</span>`, esc(i[1]), `<b>${esc(i[2])}</b>`, esc(i[3]), esc(i[4])]))}</div>`);
    const C = IMS.change;
    const change = sec("change", sh("Change management", "How people adopt the new way of working") +
      `<div class="grid g2"><div class="card">${table(["Group", "What changes", "Approach"], C.groups.map(g => [`<b>${esc(g[0])}</b>`, esc(g[1]), esc(g[2])]))}</div><div class="card pad"><h3 style="margin-bottom:12px">Adoption steps</h3>${C.steps.map((s, i) => `<div style="display:grid;grid-template-columns:34px 1fr;gap:10px;margin-bottom:10px"><span class="mono" style="font-weight:700;color:var(--plum2)">${String(i + 1).padStart(2, "0")}</span><div><b style="font-size:14px">${esc(s[0])}</b><div class="small muted">${esc(s[1])}</div></div></div>`).join("")}</div></div>`);
    return road + gates + deps + gov + risks + change;
  }

  /* ============ 07 RESULTS ============ */
  function results() {
    const R = IMS.results, mw = R.masterword, tot = mw.before.reduce((a, b) => a + b[2], 0);
    const segC = ["#3F4A5C", "#55617A", "#6B7894", "#8794AE", "#A4AFC4"];
    const mwHtml = sec("masterword", sh("Results · " + IMS.STATUS[mw.status].label, mw.title, esc(mw.summary)) +
      `<div class="grid g2">
      ${chart({ title: "Time per applicant, before and after", unit: "minutes per applicant", period: "Before: manual process before Nov 2026 · After: batch 2, 23 Nov 2026", source: "Before: team estimate (24–32 person-hours per batch of 16). After: file timestamps of batch 2.", legend: key("var(--cur)", "Before (estimate)", "hatch") + key("var(--ok)", "After (measured)"),
        body: `<div class="vsrow"><div class="lab"><span>Before · by hand</span><b style="color:var(--cur)">~${tot} min <span class="mtag m-estimate">Estimate</span></b></div><div class="stack1">${mw.before.map((b, i) => `<span class="hatch" style="width:${b[2] / tot * 100}%;background-color:${segC[i]}" title="${esc(b[0])}: ~${b[2]} min">${b[2]}m</span>`).join("")}</div><div class="legend small">${mw.before.map((b, i) => key(segC[i], `${b[0]} ~${b[2]}`)).join("")}</div></div>
        <div class="vsrow"><div class="lab"><span>After · automated</span><b style="color:var(--ok)">4.5 min <span class="mtag m-measured">Measured</span></b></div><div class="stack1"><span style="width:4.5%;background:var(--ok)"></span><span style="flex:1;background:var(--curL)"></span></div></div>`, text: esc(mw.note) })}
      ${chart({ title: "Person-hours for one batch of 16 applicants", unit: "person-hours", period: "Before: estimate range · After: 16 × 4.5 min measured rate", source: "Team estimate; batch 2 timestamps", legend: key("var(--cur)", "Before (estimate)", "hatch") + key("var(--ok)", "After"),
        body: `<div class="cols">${[["Low", 24], ["Mid", 27], ["High", 32]].map(g => `<div class="grp"><div class="c hatch" style="height:${g[1] / 32 * 100}%;background-color:var(--cur)"><b>${g[1]} h</b></div><div class="c" style="height:${1.2 / 32 * 100}%;background:var(--ok)"><b>1.2 h</b></div></div>`).join("")}</div><div class="clab"><span>Low estimate</span><span>Middle</span><span>High estimate</span></div>`, text: "After = 16 × 4.5 min ≈ 1.2 h machine time, plus a few minutes of human review." })}
      </div>
      <div class="grid g4" style="margin-top:16px">${["M-01", "M-04", "M-05", "M-06"].map(id => { const m = metric(id); return `<div class="kpi"><div class="v">${esc(m.value)}</div><div class="l">${esc(m.name)}</div><div class="s">${esc(m.period)}</div><div style="margin-top:8px">${mtag(m.status)}</div></div>`; }).join("")}</div>
      <div class="grid g2" style="margin-top:16px"><div class="card pad"><h3 style="margin-bottom:10px">Before · 5 manual steps</h3><div class="flow cur">${mw.before.map(b => `<div class="s ${/Fix/.test(b[0]) ? "bad" : ""}"><b>${esc(b[0])}</b>${esc(b[1])}<em>~${b[2]} MIN · ESTIMATE</em></div>`).join("")}</div></div>
      <div class="card pad"><h3 style="margin-bottom:10px">After · how it runs now</h3><div class="flow fut">${mw.after.map(a => `<div class="s ${/reviews/.test(a[0]) ? "hi" : ""}"><b>${esc(a[0])}</b>${esc(a[1])}<em>${esc(a[2]).toUpperCase()}</em></div>`).join("")}</div></div></div>
      <h3 style="margin:24px 0 10px">Evidence</h3><div class="grid g2">${IMS.evidence.filter(e => e.img).map(e => `<button class="card shot" data-img="${e.img}" aria-label="Enlarge ${esc(e.title)}" style="text-align:left;border:1px solid var(--line)"><img src="${e.img}" alt="${esc(e.title)}" loading="lazy"><h4>${esc(e.title)}</h4><div>${e.flags.map(f => `<span class="flag ${f[0]}">${esc(f[1])}</span>`).join("")}</div><p class="note">${esc(e.source)} · ${esc(e.verify)} · ${esc(e.date)}</p></button>`).join("")}</div>
      <p class="note"><b>Status:</b> live on real batches but operated on a personal PC and AI account. It becomes company-owned only after the handover in chapter 08.</p>`);
    const L = R.learning;
    const learn = sec("learning", sh("Results · " + IMS.STATUS[L.status].label, L.title, "Training that lived only in live Zoom sessions is now a self-paced site with tests.") +
      `<div class="grid g3"><div class="card pad"><h3 style="margin-bottom:10px">Before</h3>${ticks(L.before, "cur")}<h3 style="margin:16px 0 10px">After (live today)</h3>${ticks(L.after, "ok")}</div>
      <div class="card pad"><h3 style="margin-bottom:10px">Live today <span class="mtag m-measured">Measured</span></h3><div class="big">${L.live.map(x => `<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join("")}</div></div>
      <div class="card pad"><h3 style="margin-bottom:10px">Planned <span class="badge t-neutral">Not live</span></h3>${ticks(L.planned)}<p class="note">No sign-in or progress tracking exists yet. Results per learner cannot be reported until it does.</p></div></div>`);
    const PB = R.paymentPilot, sc = v => `<div class="tl ${v}">${PB[v === "today" ? "today" : "proposed"].map(t => `<div><b>${esc(t[0])}</b>${esc(t[1])}</div>`).join("")}</div>`;
    const pay = sec("payment", sh("Pilot · " + IMS.STATUS[PB.status].label, PB.title, "A pilot, not a production system. It runs read-only and never changes a payment.") +
      `<div class="grid g2"><div class="card pad"><div class="eyebrow">The problem</div><p style="margin:6px 0 14px">${esc(PB.problem)}</p><div class="eyebrow">Pilot design</div><div style="margin-top:8px">${ticks(PB.design)}</div></div>
      <div class="card pad"><dl class="kv"><dt>Measurement period</dt><dd>${esc(PB.period)}</dd><dt>Historical validation</dt><dd>${esc(PB.validation)}</dd></dl><h3 style="margin:16px 0 8px">Acceptance criteria</h3>${ticks(PB.criteria, "dec")}<h3 style="margin:16px 0 8px">Expected value</h3>${ticks(PB.value, "ok")}</div></div>
      <div class="card pad" style="margin-top:16px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h3>Payment cycle: today vs proposed</h3><div class="toggle" id="paytoggle"><button class="on" data-v="today">Today</button><button data-v="prop">Proposed</button></div></div><div id="pay-today">${sc("today")}</div><div id="pay-prop" class="hidden">${sc("prop")}</div></div>
      <div style="margin-top:16px">${chart({ title: "When is a payment error found?", unit: "days after month close", period: "Current cycle (described 26 Nov 2026) vs proposed day 7 check", source: "Process interview with the program lead; to validate with Invoicing", legend: key("var(--cur)", "Today") + key("var(--fut)", "Proposed"),
        body: `<div class="vsrow"><div class="lab"><span>Today: when money does not arrive or the interpreter complains</span><b style="color:var(--cur)">day 15 → up to ~120</b></div><div class="axis"><div class="tr"></div><div class="seg" style="left:12.5%;width:87.5%;background:linear-gradient(90deg,var(--cur),#C5CDD9)"></div><div class="pt" style="left:12.5%;background:var(--cur)"></div></div></div>
        <div class="vsrow"><div class="lab"><span>Proposed: day 7 upload check, before the interpreter accepts</span><b style="color:var(--fut)">day 7</b></div><div class="axis"><div class="tr"></div><div class="pt" style="left:5.8%;background:var(--fut)"></div></div></div>
        <div class="axticks">${[0, 7, 15, 30, 60, 90, 120].map(d => `<span style="left:${d / 120 * 100}%">${d}</span>`).join("")}</div>`, text: "3–4 months (about 120 days) is the longest case described, not an average. Averages are TBM from the last 3 cycles." })}</div>`);
    const others = sec("others", sh("Other projects", "Results by project", "No result is shown until it is measured against a baseline.") +
      `<div class="grid g4">${P.filter(p => !["P04", "P05"].includes(p.id)).map(p => { const st = projStatus(p); const proto = p.initiatives.filter(i => i[2] === "prototype"); return `<div class="card pad"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><span class="mono small" style="font-weight:700">${p.id}</span>${proto.length ? `<span class="mtag m-estimate">Prototype only</span>` : st.key === "approval" ? `<span class="mtag m-open">Baseline pending</span>` : `<span class="mtag m-open">Planned</span>`}</div><h4>${esc(p.short)}</h4><p class="small muted" style="margin-top:6px">${proto.length ? esc(proto[0][1] + ": " + (proto[0][3] || "")) + ". No measured result yet." : "Not yet measured."}</p><a class="small" href="#/portfolio/${p.id}">KPIs and baseline method →</a></div>`; }).join("")}</div>`);
    const ben = sec("benefits", sh("Enterprise benefits model", "Nine categories, never added together", "Capacity released is not cash. Cost avoided is not cash. Only Finance can confirm cash savings.") +
      `<div class="grid g3">${IMS.benefits.map((b, i) => `<div class="card pad"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><div class="eyebrow">${String(i + 1).padStart(2, "0")}</div><h3>${esc(b[0])}</h3></div>${mtag(b[3])}</div><p class="small muted" style="margin:6px 0 10px">${esc(b[1])}</p><p style="font-weight:600;font-size:14.5px">${fmt(b[2])}</p></div>`).join("")}</div>`);
    const roi = sec("roi", sh("ROI by project", "What is known, and what is still to be measured", "TBM values are filled from Discovery and pilots. Nothing is estimated to fill a gap.") +
      `<div class="card">${table(["Project", "Monthly volume", "Current time", "Proposed time", "Human review", "Implementation cost", "Recurring cost", "Hours saved", "Capacity released", "Verified savings", "ROI", "Payback"], P.map(p => [plink(p.id), ...["volume", "cur", "next", "review", "impl", "recur", "hours", "capacity", "savings", "roi", "payback"].map(k => fmt(p.roi[k]))]))}</div>`);
    const met = sec("metrics", sh("Metrics register", "Every number on this site, with its source", "If a number is not here, it is not claimed.") +
      `<div class="card">${table(["ID", "Metric", "Value", "Period", "Source", "Status", "Project"], IMS.metrics.map(m => [`<span class="mono small">${m.id}</span>`, `<b>${esc(m.name)}</b>`, `<b>${esc(m.value)}</b> ${esc(m.unit)}`, esc(m.period), esc(m.source), mtag(m.status), m.project === "ALL" ? "Program" : plink(m.project)]))}</div>`);
    return mwHtml + learn + pay + others + ben + roi + met;
  }

  /* ============ 08 DECISIONS ============ */
  function decisions() {
    const D = IMS.decisions, C = IMS.continuity;
    const dec = sec("decisions", sh("Management decisions", `${D.length} decisions needed`, "Each decision shows why it is needed, who takes it, by when, and what happens if it waits.") +
      `<div class="grid g2">${D.map(d => `<div class="card dcard"><div class="did">${d[0]}</div><div><h3>${esc(d[1])}</h3><dl><dt>Why</dt><dd>${esc(d[2])}</dd><dt>Decision-maker</dt><dd>${esc(d[3])}</dd><dt>Needed by</dt><dd>${esc(d[4])}</dd><dt>If delayed</dt><dd class="delay">${esc(d[5])}</dd></dl></div></div>`).join("")}</div>`);
    const next = sec("next", sh("Next steps", "The first 30 days after approval") +
      `<div class="card pad">${flow(["Sponsor and steering named (D-01)", "Discovery approved and started (D-02)", "Company AI account and budget (D-03)", "Data access requests sent (D-06)", "Process owners named for pilots (D-08)", "MasterWord handover begins (D-04)"], "fut")}</div>`);
    const cost = sec("cost", sh("What it will cost", "Cost model and today's costs", "Placeholders in brackets are confirmed with the vendor and IT before approval. Rows in red are paid personally today.") +
      `<div class="grid g4">${C.costModel.map(c => `<div class="card pad"><div class="eyebrow">${esc(c[0])}</div><h3 style="margin:6px 0">${esc(c[1])}</h3><p class="small muted">${esc(c[2])}</p><p style="margin-top:10px">${fmt(c[3])}</p></div>`).join("")}</div>
      <div class="card" style="margin-top:16px">${table(["Item", "Today", "Who pays today", "Needed"], C.costs.map(c => [`<b>${esc(c[0])}</b>`, fmt(c[1]), c[4] ? `<b style="color:var(--risk)">${esc(c[2])}</b>` : esc(c[2]), fmt(c[3])]))}</div>`);
    const cont = sec("continuity", sh("Continuity", "If the builder left tomorrow, nothing stops", "Today every automation runs on one person's computer and accounts. This plan makes each one company-owned, so anyone trained can run it.") +
      `<div class="card">${table(["Component", "Today", "Company-owned"], C.layers.map(l => [`<b>${esc(l[0])}</b>`, `<span style="color:var(--cur)">${esc(l[1])}</span>`, `<span style="color:var(--ok)">${esc(l[2])}</span>`]))}</div>
      <h3 style="margin:22px 0 10px">Handover in six steps</h3><div class="grid g3">${C.handover.map((h, i) => `<div class="card pad"><div class="eyebrow">${String(i + 1).padStart(2, "0")}</div><h4 style="margin:4px 0">${esc(h[0])}</h4><p class="small muted">${esc(h[1])}</p></div>`).join("")}</div>`);
    return dec + next + cost + cont;
  }

  return [
    { id: "overview", no: "01", title: "Executive Overview", nav: "Overview", hero: true, render: overview, sections: [["glance", "At a glance"], ["vision", "Vision"], ["goals", "Objectives"], ["highlights", "Highlights"], ["status", "Status"]] },
    { id: "case", no: "02", title: "Current State & Business Case", nav: "Business case", intro: "Why IMS needs to change: the current environment, its problems, their impact, what is measured, and the business case.", render: caseCh, sections: [["environment", "Environment"], ["pains", "Pain points"], ["impact", "Impact"], ["baseline", "Baseline"], ["case", "Business case"]] },
    { id: "portfolio", no: "03", title: "Enterprise Transformation Portfolio", nav: "Portfolio", intro: "Eight projects and seven shared capabilities. Open any project for its full detail.", render: portfolio, sections: [["summary", "Summary"], ["projects", "Projects"], ["caps", "Shared capabilities"]] },
    { id: "model", no: "04", title: "Future IMS Operating Model", nav: "Operating model", intro: "How IMS will work after the transformation: one platform, role-based workspaces, and the core processes.", render: model, sections: [["model", "Operating model"], ["journeys", "Journeys"], ["workspaces", "Workspaces"], ["processes", "Processes"], ["cuts", "Lean cuts"]] },
    { id: "tech", no: "05", title: "Technology & Enterprise Architecture", nav: "Technology", intro: "Existing systems, the proposed architecture, technology options, security and AI governance. Nothing is shown as integrated until verified.", render: tech, sections: [["systems", "Systems"], ["architecture", "Architecture"], ["assessment", "Options"], ["security", "Security"], ["ai", "AI governance"]] },
    { id: "delivery", no: "06", title: "Roadmap, Governance & Delivery", nav: "Roadmap", intro: "The 13-month plan, stage gates, dependencies, governance, risks and change management.", render: delivery, sections: [["roadmap", "Roadmap"], ["gates", "Stage gates"], ["dependencies", "Dependencies"], ["governance", "Governance"], ["risks", "Risks"], ["change", "Change"]] },
    { id: "results", no: "07", title: "Results, Evidence & Business Value", nav: "Results", intro: "What has been delivered so far, the evidence behind it, and how value is measured. Estimates and measured results are always labelled.", render: results, sections: [["masterword", "MasterWord"], ["learning", "Kalam Learning"], ["payment", "Payment pilot"], ["others", "Other projects"], ["benefits", "Benefits"], ["roi", "ROI"], ["metrics", "Metrics"]] },
    { id: "decisions", no: "08", title: "Management Decisions", nav: "Decisions", intro: "What management needs to approve or provide, what it will cost, and how the work becomes company-owned.", render: decisions, sections: [["decisions", "Decisions"], ["next", "Next steps"], ["cost", "Cost"], ["continuity", "Continuity"]] }
  ].map(c => Object.assign(c, { project, gantt, colorKey }));
})();
