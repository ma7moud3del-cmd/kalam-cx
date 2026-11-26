/* 01 Overview: the program cockpit.
   Every number, status and date here is calculated from js/data/*.js.
   Sections: status bar · KPIs · health · timeline · project register ·
   initiative board · milestones · decisions · risks. */
(function () {
  const { $, $$, esc, projStatus, plink, parentName, monthLabel, monthOffset, fmtDate, span, riskScore, riskLevel, tone, ownerText } = UI;
  const P = IMS.projects, CAP = IMS.capabilities, G = IMS.program, GATES = IMS.gates, AT = IMS.gateAt;
  const N = G.months;
  const REPORT = monthOffset(G.reportDate);
  const pos = m => Math.max(0, Math.min(100, m / N * 100));
  const INITS = [...P.flatMap(p => p.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", parent: p.id, owner: p.owner, deps: p.deps }))),
                 ...CAP.flatMap(c => c.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", parent: c.id, owner: c.owner, deps: [] })))];
  const rank = s => IMS.STATUS[s].rank;
  const pilotTag = note => (note.match(/^Pilot [A-Z]/) || [])[0];
  const pilotRow = pl => IMS.roadmap.find(r => r[0].startsWith(pl + " "));
  const isOwnerSet = o => o && !/to be (named|assigned)|to confirm/i.test(o);
  const projOwned = p => p.ownerStatus === "named";
  const gateSum = p => IMS.gateProgress[p.id].reduce((a, b) => a + b, 0);
  const pct = p => Math.round(gateSum(p) / (IMS.gateProgress[p.id].length * 2) * 100);
  const nextGate = p => { const i = IMS.gateProgress[p.id].findIndex(v => v < 2); return i < 0 ? null : GATES[i + 1]; };
  const PST = { progress: ["est", "In progress"], approval: ["dec", "Awaiting approval"], planned: ["cur", "Planned"] };
  const rowState = r => r[6] === "done" ? "done" : r[6] === "running" ? "running" : r[1] < Math.floor(REPORT) ? "delayed" : "proposed";
  const needsAction = d => IMS.DSTATUS[d[6]][2];

  function render() {
    /* ---------- derived figures ---------- */
    const byStatus = {}; INITS.forEach(i => byStatus[i.status] = (byStatus[i.status] || 0) + 1);
    const gateTotal = P.length * (GATES.length - 1);
    const gatesPassed = P.reduce((a, p) => a + IMS.gateProgress[p.id].filter(v => v === 2).length, 0);
    const gatesPartly = P.reduce((a, p) => a + IMS.gateProgress[p.id].filter(v => v === 1).length, 0);
    const openDec = IMS.decisions.filter(needsAction);
    const pilots = [...new Set(INITS.map(i => pilotTag(i.note)).filter(Boolean))].sort();
    const pilotsWaiting = pilots.filter(pl => INITS.filter(i => pilotTag(i.note) === pl).every(i => i.status === "approval"));
    const lv = IMS.risks.map(riskLevel);
    const crit = lv.filter(l => l[0] === "crit").length, high = lv.filter(l => l[0] === "high").length;
    const phase = IMS.plan.find(s => REPORT >= s.from && REPORT < s.to) || (REPORT < 0 ? null : IMS.plan[IMS.plan.length - 1]);
    const nextG = GATES.find(g => AT[g[0]] >= Math.floor(REPORT)) || GATES[GATES.length - 1];
    const today = new Date(), todayOff = monthOffset(today);
    const m11 = IMS.metrics.find(m => m.id === "M-11"), m12 = IMS.metrics.find(m => m.id === "M-12");

    /* ---------- status bar ---------- */
    const head = `<header class="pm-head"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="pm-crumb"><span class="up-draftmini">DRAFT · NOT APPROVED</span> Program cockpit · ${esc(G.org)}</div>
      <div class="pm-title"><h1>IMS Transformation <em>2027</em></h1>
        <div class="pm-goal"><span>Company target</span><b>${esc(G.growth.target)}</b></div></div>
      <div class="pm-meta">
        <div><span>Program status</span><b class="dec">● ${openDec.some(d => d[4].includes("G0")) ? "Awaiting approval (G0)" : "In delivery"}</b></div>
        <div><span>Current phase</span><b>${phase ? `${esc(phase.step)} · ${phase.gates.join(", ")}` : `Before start · ${esc(IMS.plan[0].step)} next`}</b></div>
        <div><span>Next milestone</span><b>${nextG[0]} ${esc(nextG[1])} · ${monthLabel(AT[nextG[0]])}</b></div>
        <div><span>Period</span><b>${monthLabel(0)} – ${monthLabel(N - 1)}</b></div>
        <div><span>Status as of</span><b>${fmtDate(G.reportDate)}</b></div>
      </div></div></header>`;

    /* ---------- KPIs ---------- */
    const order = ["planned", "approval", "prototype", "dev", "pilot", "poc", "live-personal", "live-company", "blocked"];
    const breakdown = `<div class="pm-sbar">${order.filter(k => byStatus[k]).map(k => `<i class="sb-${k}" style="flex:${byStatus[k]}" title="${IMS.STATUS[k].label}: ${byStatus[k]}"></i>`).join("")}</div>
      <div class="pm-sleg">${order.filter(k => byStatus[k]).map(k => `<span><i class="sb-${k}"></i>${byStatus[k]} ${esc(IMS.STATUS[k].label.toLowerCase())}</span>`).join("")}</div>`;
    const kpi = (v, l, s, def, extra = "", cls = "") => `<div class="pm-kpi ${cls}" title="${esc(def)}"><b>${v}</b><span>${esc(l)}</span><small>${s}</small>${extra}</div>`;
    const kpis = `<div class="pm-kpis">
      ${kpi(P.length, "Projects", `${P.filter(p => projStatus(p).key === "progress").length} in progress · ${P.filter(p => projStatus(p).key === "approval").length} awaiting approval · ${P.filter(p => projStatus(p).key === "planned").length} planned`, "Business outcomes, each with one accountable owner")}
      ${kpi(CAP.length, "Shared capabilities", `Used by ${new Set(CAP.flatMap(c => c.usedBy)).size} projects`, "Platform modules built once and shared by several projects")}
      ${kpi(INITS.length, "Initiatives", "By status:", "Sub-projects inside the projects and capabilities", breakdown, "wide")}
      ${kpi(`${gatesPassed}<small>/${gateTotal}</small>`, "Stage gates passed", `${gatesPartly} partly passed · ${IMS.gates.length - 1} gates × ${IMS.projects.length} projects`, "A gate counts only when its criteria are met and the steering committee records it")}
      ${kpi(openDec.length, "Decisions needing action", `of ${IMS.decisions.length} · earliest ${esc(openDec[0] ? openDec[0][4] : "—")}`, "Open, awaiting approval or deferred decisions", "", "dec")}
      ${kpi(pilotsWaiting.length, "Pilots awaiting approval", esc(pilotsWaiting.join(" · ")) || "None", "Pilots whose initiatives are all awaiting approval")}
      ${kpi(crit + high, "High and critical risks", `${crit} critical · ${high} high, of ${IMS.risks.length}`, "Critical = high impact × high probability. High = score 6 (H×M or M×H)", "", "risk")}
      ${kpi(`${esc(m11.value)} h · ${esc(m12.value)}`, "Verified benefits", "No baseline validated yet", "Hours released against a validated baseline, and cash savings confirmed by Finance")}
    </div>`;

    /* ---------- health ---------- */
    const health = `<div class="pm-card"><div class="pm-ch"><h2>Program health</h2><div class="pm-legend">${Object.values(IMS.HEALTH).map(h => `<span><i class="hd-${h[0]}"></i>${h[1]}</span>`).join("")}</div></div>
      <div class="pm-health">${IMS.health.map(h => { const r = IMS.HEALTH[h.rating]; return `<div class="h-${r[0]}"><span>${esc(h.area)}</span><b>${r[1]}</b><p>${esc(h.why)}</p><small><em>Source</em> ${esc(h.source)}</small><small><em>Owner</em> ${esc(h.owner)} · ${esc(h.updated)}</small></div>`; }).join("")}</div></div>`;

    /* ---------- timeline ---------- */
    const bar = r => { const st = rowState(r); return `<div class="pm-bar k-${r[4]} s-${st}" style="left:${pos(r[1])}%;width:${r[2] / N * 100}%" title="${esc(r[0])} · ${span(r[1], r[1] + r[2])} · ${st === "running" ? "running now" : st === "delayed" ? "start date passed, not started" : st === "done" ? "completed" : "proposed dates"}${r[5] ? " · " + esc(r[5]) : ""}"><span>${esc(r[0].replace(/^Pilot ([A-Z]) · /, "Pilot $1: "))}</span></div>`; };
    const bars = id => IMS.roadmap.filter(r => r[3] === id).map(bar).join("");
    const lane = (label, sub, inner, cls = "", deps = "") => `<div class="pm-row ${cls}"><div class="pm-rl"><b>${label}</b><small>${sub}</small>${deps}</div><div class="pm-track">${inner}<i class="pm-today" style="left:${pos(todayOff)}%"></i></div></div>`;
    const months = Array.from({ length: N }, (_, i) => `<span>${monthLabel(i, i === 0 || monthLabel(i, false) === "Jan")}</span>`).join("");
    const phases = IMS.plan.map((s, i) => `<div class="pm-phase ph${i}" style="left:${pos(s.from)}%;width:${(s.to - s.from) / N * 100}%" title="${esc(s.step)} · ${span(s.from, s.to)} · ${esc(s.what)}"><span>${esc(s.step)}</span></div>`).join("");
    const diamonds = GATES.map(g => `<div class="pm-gate" style="left:${pos(AT[g[0]] + .5)}%" title="${g[0]} ${esc(g[1])} · ${monthLabel(AT[g[0]])} (proposed) · ${esc(g[3])}"><i></i><span>${g[0]}</span></div>`).join("");
    const depLine = deps => `<div class="pm-deps">Needs: ${deps.map(plink).join(", ")}</div>`;
    const todayTxt = todayOff < 0 ? `Today (${fmtDate(today.toISOString().slice(0, 10))}) is before the program start` : `Today: ${fmtDate(today.toISOString().slice(0, 10))}`;
    const timeline = `<section class="pm-sec" id="timeline"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Timeline</h2><div class="pm-tools"><button class="pm-btn" id="depbtn" aria-pressed="false">Show dependencies</button></div></div>
      <div class="pm-legend" style="margin-bottom:10px"><span><i class="k-run"></i>Running now</span><span><i class="lg-prop"></i>Proposed dates (not committed until G0)</span><span><i class="lg-delay"></i>Start date passed, not started</span><span><i class="lg-done"></i>Completed</span><span><i class="pm-dia"></i>Stage gate</span><span><i class="pm-tl"></i>${esc(todayTxt)}</span></div>
      <div class="pm-gantt" id="gantt"><div class="pm-gin">
        <div class="pm-row pm-months"><div class="pm-rl"></div><div class="pm-track">${months}</div></div>
        ${lane("Phases", "Program", phases, "pm-prow")}
        ${lane("Stage gates", "G0 – G8", diamonds, "pm-grow")}
        ${lane("Program-wide", "All projects", bars("ALL"))}
        ${P.map(p => lane(`<a href="#/portfolio/${p.id}">${p.id} ${esc(p.short)}</a>`, esc(p.lead), bars(p.id) || `<div class="pm-empty">Scheduled after Discovery (TBC)</div>`, "", depLine(p.deps))).join("")}
        ${CAP.filter(c => IMS.roadmap.some(r => r[3] === c.id)).map(c => lane(`<a href="#/portfolio/${c.id}">${c.id} ${esc(c.name)}</a>`, "Shared capability", bars(c.id))).join("")}
      </div></div>
      <div class="pm-foot">Bars are taken from the roadmap register. Dates are offsets from ${monthLabel(0)} and become commitments only when gate G0 is approved. <a href="#/delivery">Full roadmap and gate criteria →</a></div></div></div></section>`;

    /* ---------- project register ---------- */
    const risksOf = p => p.risks.map(id => IMS.risks.find(r => r.id === id)).sort((a, b) => riskScore(b) - riskScore(a));
    const prow = p => {
      const s = projStatus(p), st = PST[s.key], n = p.initiatives.length;
      const go = p.initiatives.filter(i => rank(i[2]) >= 3).length, ap = p.initiatives.filter(i => i[2] === "approval").length, bl = p.initiatives.filter(i => i[2] === "blocked").length;
      const ng = nextGate(p), pls = [...new Set(p.initiatives.map(i => pilotTag(i[3] || "")).filter(Boolean))];
      const rs = risksOf(p);
      return `<tr class="pm-prow2" data-id="${p.id}" data-name="${esc(p.short)}" data-status="${s.key}" data-pct="${pct(p)}" data-owner="${projOwned(p) ? 1 : 0}" data-next="${ng ? ng[0] : "Z"}" data-risk="${rs.length ? riskScore(rs[0]) : 0}" data-text="${esc((p.id + " " + p.name + " " + p.lead + " " + p.owner).toLowerCase())}">
        <td><a class="pm-pid" href="#/portfolio/${p.id}">${p.id}</a></td>
        <td><a class="pm-pn" href="#/portfolio/${p.id}">${esc(p.short)}</a><small>${esc(p.lead)}</small></td>
        <td>${projOwned(p) ? esc(p.owner) : ownerText("")}${!projOwned(p) && /builder/.test(p.owner) ? `<small>Prototype built by the program manager</small>` : !projOwned(p) && p.ownerStatus === "to-confirm" ? `<small>Proposed: ${esc(p.owner.replace(/ \(to confirm\)/, ""))}</small>` : ""}</td>
        <td>${tone(st[0], st[1])}</td>
        <td><div class="pm-prog" title="${gateSum(p)} of ${IMS.gateProgress[p.id].length * 2} gate points"><div><i style="width:${Math.max(pct(p), 2)}%"></i></div><span>${pct(p)}%</span></div></td>
        <td><div class="pm-stack" title="${go} started · ${ap} awaiting approval · ${bl} blocked · ${n - go - ap - bl} planned"><i class="s-go" style="flex:${go}"></i><i class="s-ap" style="flex:${ap}"></i><i class="s-bl" style="flex:${bl}"></i><i class="s-pl" style="flex:${n - go - ap - bl}"></i></div><small>${go} started · ${ap} awaiting · ${n - go - ap - bl} planned</small></td>
        <td>${ng ? `<b>${ng[0]}</b> ${esc(ng[1])}<small>${monthLabel(AT[ng[0]])} · proposed</small>` : "All gates passed"}</td>
        <td>${pls.length ? pls.map(x => `<span class="pm-tag">${x}</span>`).join(" ") + `<small>Awaiting approval</small>` : `<span class="pm-dim">No pilot</span>`}</td>
        <td>${rs.slice(0, 2).map(r => `<span class="pm-rk lv-${riskLevel(r)[0]}" title="${esc(r.text)}">${r.id}</span>`).join(" ")}${rs.length > 2 ? `<small>+${rs.length - 2} more</small>` : ""}</td>
        <td><button class="pm-exp" data-exp="${p.id}" aria-expanded="false" aria-label="Show details for ${p.id}">Details</button></td>
      </tr>
      <tr class="pm-detail hidden" data-for="${p.id}"><td colspan="10"><div class="pm-dgrid">
        <div><em>Objective</em><p>${esc(p.objective)}</p><em>Current stage</em><p>${esc(p.stage)}</p></div>
        <div><em>Depends on</em><p>${p.deps.map(plink).join(", ")}</p><em>Accountable owner</em><p>${esc(p.owner)}</p></div>
        <div><em>Key risks</em>${rs.slice(0, 3).map(r => `<p><span class="pm-rk lv-${riskLevel(r)[0]}">${r.id}</span> ${esc(r.text)} <span class="pm-dim">· ${esc(IMS.MSTATUS[r.mstatus][1])}</span></p>`).join("")}<p><a href="#/portfolio/${p.id}">Open the full project page →</a></p></div>
      </div></td></tr>`;
    };
    const register = `<section class="pm-sec" id="projects"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Project register</h2><div class="pm-tools"><input class="pm-search" id="psearch" type="search" placeholder="Search projects" aria-label="Search projects"><select class="pm-sel" id="pstatus" aria-label="Filter by status"><option value="all">All statuses</option><option value="progress">In progress</option><option value="approval">Awaiting approval</option><option value="planned">Planned</option></select></div></div>
      <div class="pm-tw"><table class="pm-table sortable" id="ptable"><thead><tr><th data-sort="id" aria-sort="ascending">ID</th><th data-sort="name">Project</th><th data-sort="owner">Accountable owner</th><th data-sort="status">Status</th><th data-sort="pct">Gate progress</th><th>Initiatives</th><th data-sort="next">Next milestone</th><th>Pilot</th><th data-sort="risk">Key risks</th><th><span class="sr">Details</span></th></tr></thead><tbody>${P.map(prow).join("")}</tbody></table></div>
      <p class="pm-none hidden" id="pnone2">No project matches.</p>
      <div class="pm-foot">Gate progress = gate points earned ÷ 16 (8 gates, 2 points if passed, 1 if partly). Owners show <b>To be assigned</b> until named under decision D-08. Click a column heading to sort.</div></div></div></section>`;

    /* ---------- initiative board ---------- */
    const target = i => { const pl = pilotTag(i.note); if (pl) { const r = pilotRow(pl); return r ? `${span(r[1], r[1] + r[2])} (proposed)` : "TBC"; } if (rank(i.status) >= 7) return "Live now"; return "TBC"; };
    const keyDep = i => { const extra = i.note && !pilotTag(i.note) ? i.note : ""; return [extra, i.deps.length ? `Needs ${i.deps.slice(0, 2).join(", ")}` : ""].filter(Boolean).join(" · ") || "None recorded"; };
    const card = i => `<details class="pm-kc" data-parent="${i.parent}" data-text="${esc((i.id + " " + i.name + " " + parentName(i.parent)).toLowerCase())}">
      <summary><span>${esc(i.id)} · ${esc(parentName(i.parent))}</span><b>${esc(i.name)}</b>${i.status === "live-personal" ? `<em>Personally operated</em>` : pilotTag(i.note) ? `<em class="dec">${pilotTag(i.note)}</em>` : ""}</summary>
      <dl><dt>Status</dt><dd>${esc(IMS.STATUS[i.status].label)}</dd><dt>${i.parent.startsWith("P") ? "Project" : "Capability"}</dt><dd>${plink(i.parent)}</dd><dt>Owner</dt><dd>${isOwnerSet(i.owner) ? esc(i.owner) : "To be assigned"}</dd><dt>Target</dt><dd>${esc(target(i))}</dd><dt>Key dependency</dt><dd>${esc(keyDep(i))}</dd></dl></details>`;
    const colCount = {}; IMS.BOARD.forEach(c => colCount[c.id] = INITS.filter(i => c.statuses.includes(i.status)).length);
    const placed = Object.values(colCount).reduce((a, b) => a + b, 0);
    const parents = [...P.map(p => [p.id, p.id + " " + p.short]), ...CAP.map(c => [c.id, c.id + " " + c.name])];
    const board = `<section class="pm-sec" id="tasks"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Initiative board</h2><div class="pm-tools"><input class="pm-search" id="ksearch" type="search" placeholder="Search initiatives" aria-label="Search initiatives"><select class="pm-sel" id="kparent" aria-label="Filter by project or capability"><option value="all">All projects and capabilities</option>${parents.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join("")}</select></div></div>
      <div class="pm-recon ${placed === INITS.length ? "ok" : "bad"}">${IMS.BOARD.map(c => `${c.label} ${colCount[c.id]}`).join(" + ")} = <b>${placed}</b> ${placed === INITS.length ? `✓ matches the ${INITS.length} initiatives in the register` : `✗ the register has ${INITS.length}: ${INITS.length - placed} not placed`}</div>
      <div class="pm-kanban">${IMS.BOARD.map(c => { const list = INITS.filter(i => c.statuses.includes(i.status)).sort((a, b) => rank(b.status) - rank(a.status));
        return `<div class="pm-col c-${c.tone}" data-col="${c.id}"><div class="pm-colh"><b>${esc(c.label)}</b><span data-count>${list.length}</span></div>
          <div class="pm-cards${list.length > 6 ? " clip" : ""}">${list.map(card).join("") || `<p class="pm-emptycol">No initiatives</p>`}</div>
          ${list.length > 6 ? `<button class="pm-more" data-more aria-expanded="false">Show all ${list.length}</button>` : ""}</div>`; }).join("")}</div>
      <p class="pm-sub" style="margin-top:10px">Open a card for its owner, target date and dependency. Targets are shown only where a pilot window exists; otherwise TBC.</p>
    </div></div></section>`;

    /* ---------- milestones ---------- */
    const ms = GATES.map(g => { const k = GATES.indexOf(g); const passed = k ? P.filter(p => IMS.gateProgress[p.id][k - 1] === 2).length : 0, partly = k ? P.filter(p => IMS.gateProgress[p.id][k - 1] === 1).length : 0;
      return `<li class="${g === nextG ? "next" : ""}"><span class="pm-gd">${g[0]}</span><div><b>${esc(g[1])}</b><small>${esc(g[3])}</small>${k ? `<small class="pm-gp">${passed} passed · ${partly} partly · ${P.length - passed - partly} not yet</small>` : `<small class="pm-gp">Program-level gate · decisions D-01 to D-03</small>`}</div><time>${monthLabel(AT[g[0]])}<small>proposed</small></time></li>`; }).join("");

    /* ---------- decisions ---------- */
    const drow = d => { const s = IMS.DSTATUS[d[6]]; return `<tr data-dstat="${d[6]}" data-act="${s[2] ? 1 : 0}"><td><span class="pm-pid">${d[0]}</span></td><td><b>${esc(d[1])}</b></td><td>${esc(d[3])}</td><td class="pm-due">${esc(d[4])}</td><td>${tone(s[0], s[1])}</td><td><button class="pm-exp" data-dexp="${d[0]}" aria-expanded="false" aria-label="Details for ${d[0]}">Details</button></td></tr>
      <tr class="pm-detail hidden" data-dfor="${d[0]}"><td colspan="6"><div class="pm-dgrid two"><div><em>Why it matters</em><p>${esc(d[2])}</p></div><div><em>Impact if delayed</em><p class="pm-delay">${esc(d[5])}</p></div></div></td></tr>`; };
    const dstats = Object.keys(IMS.DSTATUS).filter(k => IMS.decisions.some(d => d[6] === k));
    const decisions = `<div class="pm-card" id="decisions"><div class="pm-ch"><h2>Management decisions</h2><div class="pm-tools" id="dfilter"><button class="pm-btn on" data-df="act">Needs action (${openDec.length})</button><button class="pm-btn" data-df="all">All (${IMS.decisions.length})</button></div></div>
      ${openDec.length ? `<div class="pm-action"><b>Management action required:</b> ${openDec.length} decisions are waiting. The first ${openDec.filter(d => /G0|Before G0/.test(d[4])).length} are needed for gate G0 (${monthLabel(AT.G0)}): ${openDec.filter(d => /G0/.test(d[4])).map(d => d[0]).join(", ")}.</div>` : ""}
      <div class="pm-tw"><table class="pm-table pm-dec" id="dtable"><thead><tr><th>ID</th><th>Decision required</th><th>Decision owner</th><th>Required by</th><th>Status</th><th><span class="sr">Details</span></th></tr></thead><tbody>${IMS.decisions.map(drow).join("")}</tbody></table></div>
      <div class="pm-foot">Statuses used: ${Object.values(IMS.DSTATUS).map(s => s[1]).join(" · ")}. In the register today: ${dstats.map(k => `${IMS.decisions.filter(d => d[6] === k).length} ${IMS.DSTATUS[k][1].toLowerCase()}`).join(", ")}. <a href="#/decisions">Decision chapter →</a></div></div>`;

    /* ---------- risks ---------- */
    const L = ["H", "M", "L"], nm = { H: "High", M: "Medium", L: "Low" };
    const cell = (im, pr) => IMS.risks.filter(r => r.impact === im && r.prob === pr);
    const heat = `<div class="pm-heat"><div class="pm-hy">Impact</div><div class="pm-hg">${L.map(im => `<span class="pm-hl">${nm[im]}</span>` + ["L", "M", "H"].map(pr => { const list = cell(im, pr), lvl = riskLevel({ impact: im, prob: pr })[0]; return `<button class="hm-${lvl}${list.length ? "" : " z"}" data-cell="${im}${pr}" ${list.length ? "" : "disabled"} aria-label="${list.length} risks with ${nm[im].toLowerCase()} impact and ${nm[pr].toLowerCase()} probability">${list.length || ""}</button>`; }).join("")).join("")}<span></span><span class="pm-hl">Low</span><span class="pm-hl">Medium</span><span class="pm-hl">High</span></div><div class="pm-hx">Probability</div></div>`;
    const rrow = r => { const l = riskLevel(r), m = IMS.MSTATUS[r.mstatus]; return `<li data-cell="${r.impact}${r.prob}" data-lvl="${l[0]}"><details><summary><span class="pm-rk lv-${l[0]}">${r.id}</span><span class="pm-rtx"><b>${esc(r.text)}</b><small>${esc(l[1])} · ${esc(r.cat)} · Owner: ${esc(r.owner)}</small></span>${tone(m[0], m[1])}</summary>
      <dl><dt>Impact / probability</dt><dd>${nm[r.impact]} / ${nm[r.prob]}</dd><dt>Mitigation</dt><dd>${esc(r.mit)}</dd><dt>Mitigation status</dt><dd>${esc(m[1])}: ${esc(r.mnote)}</dd><dt>Last reviewed</dt><dd>${esc(IMS.riskReview.last)}</dd><dt>Next review</dt><dd>${esc(r.review)}</dd>${r.issue ? `<dt>Linked issue</dt><dd>${r.issue}</dd>` : ""}</dl>
      <a href="#/delivery" data-goto="risk-${r.id}">Full risk record →</a></details></li>`; };
    const sorted = [...IMS.risks].sort((a, b) => riskScore(b) - riskScore(a));
    const risks = `<div class="pm-card" id="risks"><div class="pm-ch"><h2>Risks</h2><span class="pm-sub">${IMS.risks.length} risks · ${IMS.issues.length} open issues · reviewed ${esc(IMS.riskReview.cadence.toLowerCase())}</span></div>
      <div class="pm-risk">${heat}<div><div class="pm-rt" id="rtitle">Critical and high risks</div><ul class="pm-rlist" id="rlist">${sorted.map(rrow).join("")}</ul><button class="pm-btn" id="rall">Show all ${IMS.risks.length} risks</button></div></div>
      <div class="pm-foot">Select a square to list its risks. Score = impact × probability (High 3, Medium 2, Low 1). <a href="#/delivery" data-goto="risks">Risk register →</a></div></div>`;

    const lower = `<section class="pm-sec" id="milestones"><div class="wrap"><div class="pm-split">
      <div class="pm-card"><div class="pm-ch"><h2>Milestones</h2><span class="pm-sub">Stage gates · proposed dates</span></div><ol class="pm-ms">${ms}</ol></div>
      <div class="pm-stackcol">${decisions}${risks}</div></div></div></section>`;

    return head + `<section class="pm-sec" id="board"><div class="wrap">${kpis}${health}</div></section>` + timeline + register + board + lower;
  }

  /* ---------- interactions ---------- */
  function wire() {
    /* dependencies on the timeline */
    const db = $("#depbtn"); if (db) db.addEventListener("click", () => { const on = $("#gantt").classList.toggle("deps"); db.setAttribute("aria-pressed", on); db.textContent = on ? "Hide dependencies" : "Show dependencies"; });
    /* project register: search, status filter, sort, details */
    const tb = $("#ptable tbody");
    if (tb) {
      const apply = () => { const q = $("#psearch").value.trim().toLowerCase(), st = $("#pstatus").value; let n = 0;
        $$("tr.pm-prow2", tb).forEach(r => { const ok = (!q || r.dataset.text.includes(q)) && (st === "all" || r.dataset.status === st); r.classList.toggle("hidden", !ok); const d = $(`tr[data-for="${r.dataset.id}"]`, tb); if (!ok) d.classList.add("hidden"); else if (r.querySelector(".pm-exp").getAttribute("aria-expanded") === "true") d.classList.remove("hidden"); if (ok) n++; });
        $("#pnone2").classList.toggle("hidden", n > 0); };
      $("#psearch").addEventListener("input", apply); $("#pstatus").addEventListener("change", apply);
      const ordS = { progress: 0, approval: 1, planned: 2 };
      $$("#ptable th[data-sort]").forEach(th => th.addEventListener("click", () => {
        const k = th.dataset.sort, dir = th.getAttribute("aria-sort") === "ascending" ? -1 : 1;
        $$("#ptable th[data-sort]").forEach(x => x.removeAttribute("aria-sort")); th.setAttribute("aria-sort", dir === 1 ? "ascending" : "descending");
        const val = r => k === "pct" || k === "risk" || k === "owner" ? +r.dataset[k] : k === "status" ? ordS[r.dataset.status] : r.dataset[k];
        $$("tr.pm-prow2", tb).sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * dir).forEach(r => { tb.appendChild(r); tb.appendChild($(`tr[data-for="${r.dataset.id}"]`, tb)); });
      }));
      $$("[data-exp]", tb).forEach(b => b.addEventListener("click", () => { const d = $(`tr[data-for="${b.dataset.exp}"]`, tb), open = d.classList.toggle("hidden") === false; b.setAttribute("aria-expanded", open); b.textContent = open ? "Hide" : "Details"; }));
    }
    /* initiative board: search, parent filter, show all */
    const kb = $(".pm-kanban");
    if (kb) {
      const apply = () => { const q = $("#ksearch").value.trim().toLowerCase(), pa = $("#kparent").value;
        $$(".pm-col", kb).forEach(col => { let n = 0; $$(".pm-kc", col).forEach(c => { const ok = (!q || c.dataset.text.includes(q)) && (pa === "all" || c.dataset.parent === pa); c.classList.toggle("hidden", !ok); if (ok) n++; }); $("[data-count]", col).textContent = n; col.classList.toggle("filtered", !!q || pa !== "all"); }); };
      $("#ksearch").addEventListener("input", apply); $("#kparent").addEventListener("change", apply);
      $$("[data-more]", kb).forEach(b => b.addEventListener("click", () => { const c = b.previousElementSibling, open = c.classList.toggle("clip") === false; b.setAttribute("aria-expanded", open); b.textContent = open ? "Show fewer" : `Show all ${$$(".pm-kc", c).length}`; }));
    }
    /* decisions: filter and details */
    const dt = $("#dtable tbody");
    if (dt) {
      const show = f => $$("tr[data-dstat]", dt).forEach(r => { const ok = f === "all" || r.dataset.act === "1"; r.classList.toggle("hidden", !ok); if (!ok) r.nextElementSibling.classList.add("hidden"); });
      $$("#dfilter [data-df]").forEach(b => b.addEventListener("click", () => { $$("#dfilter [data-df]").forEach(x => x.classList.toggle("on", x === b)); show(b.dataset.df); }));
      show("act");
      $$("[data-dexp]", dt).forEach(b => b.addEventListener("click", () => { const d = b.closest("tr").nextElementSibling, open = d.classList.toggle("hidden") === false; b.setAttribute("aria-expanded", open); b.textContent = open ? "Hide" : "Details"; }));
    }
    /* risks: heat map filters the list */
    const rl = $("#rlist");
    if (rl) {
      const nm = { H: "high", M: "medium", L: "low" };
      const show = (fn, title) => { $$("li", rl).forEach(li => li.classList.toggle("hidden", !fn(li))); $("#rtitle").textContent = title; };
      const def = () => show(li => li.dataset.lvl === "crit" || li.dataset.lvl === "high", "Critical and high risks");
      def();
      $$(".pm-hg button[data-cell]").forEach(b => b.addEventListener("click", () => { const on = !b.classList.contains("on"); $$(".pm-hg button").forEach(x => x.classList.remove("on")); if (on) { b.classList.add("on"); const c = b.dataset.cell; show(li => li.dataset.cell === c, `Impact ${nm[c[0]]} · probability ${nm[c[1]]}`); } else def(); }));
      $("#rall").addEventListener("click", () => { $$(".pm-hg button").forEach(x => x.classList.remove("on")); show(() => true, `All ${IMS.risks.length} risks, highest first`); });
    }
  }

  const ov = window.CHAPTERS[0];
  ov.title = "Program Draft"; ov.nav = "Program draft";
  ov.render = render;
  ov.wire = wire;
  ov.sections = [["board", "Dashboard"], ["timeline", "Timeline"], ["projects", "Projects"], ["tasks", "Initiatives"], ["milestones", "Milestones"], ["decisions", "Decisions"], ["risks", "Risks"]];
})();
