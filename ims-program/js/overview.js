/* 01 Overview: the program cockpit, laid out like a project management tool.
   Built only from IMS data: status bar, KPIs, health, Gantt, project table,
   initiative board, milestones, decisions and risk heat map. */
(function () {
  const { esc, projStatus } = UI;
  const P = IMS.projects, CAP = IMS.capabilities, G = IMS.program, M = IMS.months, GATES = IMS.gates;
  const INITS = [...P.flatMap(p => p.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", proj: p.id }))),
                 ...CAP.flatMap(c => c.initiatives.map(i => ({ id: i[0], name: i[1], status: i[2], note: i[3] || "", proj: c.id })))];
  const rank = s => IMS.STATUS[s].rank;
  const pilotOf = list => [...new Set(list.map(i => ((i[3] || "").match(/^Pilot [A-Z]/) || [])[0]).filter(Boolean))].sort();
  /* month index of each gate on the Dec 2026 → Dec 2027 axis */
  const GATE_AT = { G0: 0, G1: 2, G2: 3, G3: 4, G4: 5, G5: 5.4, G6: 8, G7: 9, G8: 12 };
  const TODAY = 0.85 / 13 * 100; /* 26 Nov 2026, just before the Dec 2026 column */
  const pct = p => Math.round(IMS.gateProgress[p.id].reduce((a, b) => a + b, 0) / (IMS.gateProgress[p.id].length * 2) * 100);
  const nextGate = p => { const i = IMS.gateProgress[p.id].findIndex(v => v < 2); return i < 0 ? null : GATES[i + 1]; };
  const ST = { progress: ["est", "In progress"], approval: ["dec", "Awaiting approval"], planned: ["cur", "Planned"] };
  const pill = (tone, label) => `<span class="pm-pill t-${tone}"><i></i>${esc(label)}</span>`;
  const rag = { G: ["ok", "On track"], A: ["est", "At risk"], R: ["risk", "Off track"] };

  function render() {
    const started = INITS.filter(i => rank(i.status) >= 3).length;
    const gatesDone = P.reduce((a, p) => a + IMS.gateProgress[p.id].filter(v => v === 2).length, 0);
    const openDec = IMS.decisions.filter(d => d[6] !== "done" && d[6] !== "decided").length;
    const highRisk = IMS.risks.filter(r => r.impact === "H" && r.prob === "H").length;
    const pilots = pilotOf(P.flatMap(p => p.initiatives));

    /* compact program bar (replaces the big hero) */
    const head = `<header class="pm-head"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="pm-crumb">Program cockpit · ${esc(G.org)}</div>
      <div class="pm-title"><h1>IMS Transformation <em>2027</em></h1>
        <div class="pm-goal"><span>Target</span><b>${esc(G.growth.target)}</b></div></div>
      <div class="pm-meta">
        <div><span>Status</span><b class="dec">● Awaiting approval</b></div>
        <div><span>Current phase</span><b>Approve · G0</b></div>
        <div><span>Next milestone</span><b>${GATES[0][0]} ${esc(GATES[0][1])} · ${esc(GATES[0][2])}</b></div>
        <div><span>Period</span><b>${esc(G.period)}</b></div>
        <div><span>Updated</span><b>${esc(G.updated)}</b></div>
      </div></div></header>`;

    const kpis = [
      [P.length, "Projects", `${CAP.length} shared capabilities`],
      [INITS.length, "Initiatives", `${started} started · ${INITS.length - started} not started`],
      [`${gatesDone}/${P.length * (GATES.length - 1)}`, "Gates passed", "Across all projects"],
      [pilots.length, "Pilots ready", pilots.join(" · ") + " · awaiting approval"],
      [openDec, "Open decisions", "Management action needed"],
      [highRisk, "High risks", "High impact × high probability"]
    ];
    const board = `<section class="pm-sec" id="board"><div class="wrap">
      <div class="pm-kpis">${kpis.map(k => `<div class="pm-kpi"><b>${esc(k[0])}</b><span>${esc(k[1])}</span><small>${esc(k[2])}</small></div>`).join("")}</div>
      <div class="pm-card"><div class="pm-ch"><h2>Program health</h2><span class="pm-sub">Program team's reading, ${esc(G.updated)}</span></div>
        <div class="pm-health">${IMS.health.map(h => `<div class="h-${rag[h[1]][0]}"><span>${esc(h[0])}</span><b>${rag[h[1]][1]}</b><small>${esc(h[2])}</small></div>`).join("")}</div></div>
    </div></section>`;

    /* Gantt: one row per project, bars from the roadmap, gate diamonds on the program row */
    const bars = id => IMS.roadmap.filter(r => r[3] === id).map(r => `<div class="pm-bar k-${r[4]}" style="left:${r[1] / 13 * 100}%;width:${r[2] / 13 * 100}%" title="${esc(r[0])}${r[5] ? " · " + esc(r[5]) : ""}"><span>${esc(r[0].replace(/^Pilot [A-Z] · /, ""))}</span></div>`).join("");
    const lane = (label, sub, inner, cls = "") => `<div class="pm-row ${cls}"><div class="pm-rl"><b>${label}</b><small>${sub}</small></div><div class="pm-track">${inner}<i class="pm-today" style="left:${TODAY}%"></i></div></div>`;
    const phases = IMS.plan.map((s, i) => { const st = [0, 1, 3, 4.5, 9][i], en = [1, 3, 4.5, 9, 13][i]; return `<div class="pm-phase ph${i}" style="left:${st / 13 * 100}%;width:${(en - st) / 13 * 100}%"><span>${esc(s.step)}</span></div>`; }).join("");
    const diamonds = GATES.map(g => `<div class="pm-gate" style="left:${(GATE_AT[g[0]] + .5) / 13 * 100}%" title="${g[0]} ${esc(g[1])} · ${esc(g[2])}"><i></i><span>${g[0]}</span></div>`).join("");
    const timeline = `<section class="pm-sec" id="timeline"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Timeline</h2><div class="pm-legend"><span><i class="k-run"></i>Running now</span><span><i class="k-pilot"></i>Pilot</span><span><i class="k-build"></i>Build</span><span><i class="k-plan"></i>Planning</span><span><i class="pm-dia"></i>Stage gate</span><span><i class="pm-tl"></i>Today</span></div></div>
      <div class="pm-gantt"><div class="pm-gin">
        <div class="pm-row pm-months"><div class="pm-rl"></div><div class="pm-track">${M.map(m => `<span>${m}</span>`).join("")}</div></div>
        ${lane("Phases", "Program", phases, "pm-prow")}
        ${lane("Stage gates", "G0 – G8", diamonds, "pm-grow")}
        ${lane("Program-wide", "All projects", bars("ALL"))}
        ${P.map(p => lane(`<a href="#/portfolio/${p.id}">${p.id} ${esc(p.short)}</a>`, esc(p.lead), bars(p.id) || `<div class="pm-empty">Starts after Discovery</div>`)).join("")}
        ${lane("Shared capabilities", "C1 – C7", CAP.map(c => bars(c.id)).join(""))}
      </div></div>
      <div class="pm-foot"><a href="#/delivery">Full roadmap, gates and dependencies →</a></div></div></div></section>`;

    /* project table */
    const rows = P.map(p => {
      const s = projStatus(p), st = ST[s.key], n = p.initiatives.length, go = p.initiatives.filter(i => rank(i[2]) >= 3).length, ap = p.initiatives.filter(i => i[2] === "approval").length;
      const owner = /to be named/i.test(p.owner) ? `<span class="pm-tbn">To be named</span>` : esc(p.owner.split("·")[0].trim());
      const ng = nextGate(p), pl = pilotOf(p.initiatives);
      return `<tr>
        <td><a class="pm-pid" href="#/portfolio/${p.id}">${p.id}</a></td>
        <td><a class="pm-pn" href="#/portfolio/${p.id}">${esc(p.short)}</a><small>${esc(p.lead)}</small></td>
        <td>${owner}</td>
        <td>${pill(st[0], st[1])}</td>
        <td><div class="pm-prog"><div><i style="width:${Math.max(pct(p), 2)}%"></i></div><span>${pct(p)}%</span></div></td>
        <td><div class="pm-stack" title="${go} started · ${ap} awaiting approval · ${n - go - ap} planned"><i class="s-go" style="flex:${go}"></i><i class="s-ap" style="flex:${ap}"></i><i class="s-pl" style="flex:${n - go - ap}"></i></div><small>${go}/${n} started</small></td>
        <td>${ng ? `<b>${ng[0]}</b> ${esc(ng[1])}<small>${esc(ng[2])}</small>` : "All gates passed"}</td>
        <td>${pl.length ? pl.map(x => `<span class="pm-tag">${x}</span>`).join(" ") : `<span class="pm-dim">—</span>`}</td>
      </tr>`; }).join("");
    const projects = `<section class="pm-sec" id="projects"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Projects</h2><span class="pm-sub">Gate progress = share of the 8 stage gates passed (partly passed counts half)</span></div>
      <div class="pm-tw"><table class="pm-table"><thead><tr><th>ID</th><th>Project</th><th>Owner</th><th>Status</th><th>Gate progress</th><th>Initiatives</th><th>Next milestone</th><th>Pilot</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="pm-foot"><a href="#/portfolio">Open the portfolio →</a></div></div></div></section>`;

    /* initiative board (kanban) */
    const cols = [
      ["Planned", i => i.status === "planned", "cur"],
      ["Awaiting approval", i => i.status === "approval", "dec"],
      ["In build / prototype", i => ["prototype", "dev", "pilot", "poc"].includes(i.status), "fut"],
      ["Live", i => ["live-personal", "live-company"].includes(i.status), "est"]
    ];
    const card = i => `<a class="pm-kc" href="#/portfolio/${i.proj.startsWith("P") ? i.proj : ""}"><span>${esc(i.id)}</span><b>${esc(i.name)}</b>${i.status === "live-personal" ? `<em>Personally operated</em>` : i.note && /^Pilot/.test(i.note) ? `<em class="dec">${esc(i.note.match(/^Pilot [A-Z]/)[0])}</em>` : ""}</a>`;
    const kanban = `<section class="pm-sec" id="tasks"><div class="wrap"><div class="pm-card">
      <div class="pm-ch"><h2>Initiative board</h2><span class="pm-sub">${INITS.length} initiatives by status</span></div>
      <div class="pm-kanban">${cols.map(c => { const list = INITS.filter(c[1]); const show = list.slice(0, c[0] === "Planned" ? 4 : 8);
        return `<div class="pm-col c-${c[2]}"><div class="pm-colh"><b>${c[0]}</b><span>${list.length}</span></div>${show.map(card).join("")}${list.length > show.length ? `<a class="pm-more" href="#/portfolio">+ ${list.length - show.length} more</a>` : ""}</div>`; }).join("")}</div>
    </div></div></section>`;

    /* milestones, decisions, risks */
    const ms = GATES.map((g, i) => `<li class="${i === 0 ? "next" : ""}"><span class="pm-gd">${g[0]}</span><div><b>${esc(g[1])}</b><small>${esc(g[3])}</small></div><time>${esc(g[2])}</time></li>`).join("");
    const dec = IMS.decisions.slice(0, 7).map(d => `<tr><td><span class="pm-pid">${d[0]}</span></td><td><b>${esc(d[1])}</b></td><td>${esc(d[3])}</td><td class="pm-due">${esc(d[4])}</td><td>${pill("dec", "Open")}</td></tr>`).join("");
    const L = ["H", "M", "L"], cell = (im, pr) => IMS.risks.filter(r => r.impact === im && r.prob === pr).length;
    const heat = `<div class="pm-heat"><div class="pm-hy">Impact</div><div class="pm-hg">${L.map(im => `<span class="pm-hl">${im === "H" ? "High" : im === "M" ? "Med" : "Low"}</span>` + [...L].reverse().map(pr => { const n = cell(im, pr), sc = "HML".indexOf(im) + "HML".indexOf(pr); return `<div class="hm${sc <= 1 ? "r" : sc === 2 ? "a" : "g"}${n ? "" : " z"}">${n || ""}</div>`; }).join("")).join("")}<span></span><span class="pm-hl">Low</span><span class="pm-hl">Med</span><span class="pm-hl">High</span></div><div class="pm-hx">Probability</div></div>`;
    const top = IMS.risks.filter(r => r.impact === "H" && r.prob === "H").slice(0, 4).map(r => `<li><span class="pm-pid r">${r.id}</span>${esc(r.text)}</li>`).join("");
    const track = `<section class="pm-sec" id="milestones"><div class="wrap"><div class="pm-split">
      <div class="pm-card"><div class="pm-ch"><h2>Milestones</h2><span class="pm-sub">Stage gates</span></div><ol class="pm-ms">${ms}</ol></div>
      <div class="pm-stackcol">
        <div class="pm-card" id="decisions"><div class="pm-ch"><h2>Decisions needed</h2><span class="pm-sub">${openDec} open</span></div>
          <div class="pm-tw"><table class="pm-table pm-dec"><thead><tr><th>ID</th><th>Decision</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${dec}</tbody></table></div>
          <div class="pm-foot"><a href="#/decisions">All ${IMS.decisions.length} decisions →</a></div></div>
        <div class="pm-card"><div class="pm-ch"><h2>Risks</h2><span class="pm-sub">${IMS.risks.length} risks · ${IMS.issues.length} open issues</span></div>
          <div class="pm-risk">${heat}<div><div class="pm-rt">Top risks</div><ul class="pm-rl2">${top}</ul></div></div>
          <div class="pm-foot"><a href="#/delivery">Risk register →</a></div></div>
      </div></div></div></section>`;

    return head + board + timeline + projects + kanban + track;
  }

  const ov = window.CHAPTERS[0];
  ov.render = render;
  ov.sections = [["board", "Dashboard"], ["timeline", "Timeline"], ["projects", "Projects"], ["tasks", "Board"], ["milestones", "Milestones"], ["decisions", "Decisions"]];
})();
