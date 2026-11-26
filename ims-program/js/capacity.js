/* Project 9 chapter: director's two-minute dashboard and the analytical design.
   Built only from js/data/capacity.js. No value is invented: missing data shows its status. */
(function () {
  const { $$, esc } = UI;
  const K = IMS.capacity;
  const ST = { m: ["ok", "Measured"], vr: ["dec", "Validation required"], na: ["risk", "Not available"], nm: ["cur", "Not measured"], desc: ["est", "As described"], human: ["fut", "People decide"] };
  const st = s => `<span class="cp-st s-${ST[s][0]}">${ST[s][1]}</span>`;
  const sysName = id => (IMS.systems.find(s => s.id === id) || { name: id }).name;
  const oppCount = stage => K.opportunities.filter(o => K.oppStages.indexOf(o.stage) >= K.oppStages.indexOf(stage)).length;

  function kpi(k) {
    const v = k[1] === "tracker" ? `<b class="cp-v">${oppCount(k[0])}</b><span class="cp-st s-ok">From tracker</span>` : k[1] === "m" ? `<b class="cp-v">${esc(k[5])}</b>${st("m")}` : `<b class="cp-v na">—</b>${st(k[1])}`;
    return `<details class="cp-k"><summary><span class="cp-l">${esc(k[0])}</span>${v}</summary>
      <dl><dt>Source</dt><dd>${esc(k[2])}</dd><dt>Definition</dt><dd>${esc(k[3])}</dd><dt>Period</dt><dd>${esc(k[4])}</dd><dt>Last update</dt><dd>${k[1] === "tracker" ? "26 Nov 2026" : k[1] === "m" ? esc(K.asof) : "Not available"}</dd></dl></details>`;
  }

  /* ---- Data graph: the designed flow from sources to decision makers.
     Structure only (sources, database, modules, views, reports, roles). No client or interpreter data is drawn. */
  const SRC = ["accountdb", "kalam", "zoho", "incorta", "clientrep", "schedules", "timedoctor", "transparent"];
  const LIVE = ["kalam", "incorta"];
  const graphTitle = `${SRC.length} sources · ${LIVE.length} in use (IMS dashboard prototype)`;
  const MOD_VIEWS = { A: [1, 4], B: [3, 5], C: [2, 6], D: [8, 9], E: [6, 7], F: [10] };
  const MOD_REPS = { A: [2], B: [1], C: [0, 1], D: [3], E: [4], F: [4] };
  function layout() {
    const N = [], E = [], cx = 590, cy = 330;
    const at = (r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180) * .82];
    const arc = (list, r, a0, a1) => list.map((x, i) => at(r, list.length === 1 ? (a0 + a1) / 2 : a0 + (a1 - a0) * i / (list.length - 1)));
    const add = (id, label, kind, p, sub) => N.push({ id, label, kind, x: p[0], y: p[1], sub: sub || "" });
    add("db", "Unified database", "db", [cx, cy], "Design · needs IT hosting");
    arc(SRC, 400, 145, 215).forEach((p, i) => add("s-" + SRC[i], sysName(SRC[i]), LIVE.includes(SRC[i]) ? "srcon" : "src", p, LIVE.includes(SRC[i]) ? "Feeding the IMS dashboard prototype" : "Not connected"));
    const mods = K.modules.map(m => m[0]);
    arc(mods, 150, -150, 150).forEach((p, i) => add("m-" + mods[i], "Module " + mods[i], "mod", p, K.modules[i][1]));
    arc(K.views, 305, -54, 48).forEach((p, i) => add("v-" + (i + 1), K.views[i][0], "view", p, "View " + (i + 1)));
    arc(K.reports, 325, 58, 134).forEach((p, i) => add("r-" + i, K.reports[i][0], "rep", p, K.reports[i][1] + " report"));
    arc(K.roles, 330, 228, 296).forEach((p, i) => add("p-" + K.roles[i].id, K.roles[i].name, "role", p, "Custom view"));
    add("x-ttg", "TTG", "gap", at(235, 198), "Client · 21,162 of 38,025 calls abandoned");
    add("x-ita", "Italian", "gap", at(225, 165), "Language · 231 of 325 TTG Italian calls abandoned");
    SRC.forEach(s => E.push(["s-" + s, "db", LIVE.includes(s) ? "on" : "off"]));
    mods.forEach(m => { E.push(["db", "m-" + m, "on"]); MOD_VIEWS[m].forEach(v => E.push(["m-" + m, "v-" + v, "on"])); MOD_REPS[m].forEach(r => E.push(["m-" + m, "r-" + r, "on"])); });
    K.roles.forEach(r => r.views.forEach(v => E.push(["v-" + v, "p-" + r.id, "on"])));
    E.push(["x-ttg", "x-ita", "gap"], ["x-ttg", "m-B", "gap"], ["x-ita", "m-C", "gap"]);
    return { N, E };
  }
  function graph() {
    const { N, E } = layout(), byId = Object.fromEntries(N.map(n => [n.id, n]));
    const edges = E.map(([a, b, k], i) => { const p = byId[a], q = byId[b]; const mx = (p.x + q.x) / 2 + (q.y - p.y) * .12, my = (p.y + q.y) / 2 - (q.x - p.x) * .12;
      return `<path class="cx-e e-${k}" data-a="${a}" data-b="${b}" d="M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}" style="animation-delay:${(i % 9) * -.4}s"/>`; }).join("");
    const size = { db: 28, mod: 22, src: 10, srcon: 12, view: 9, rep: 9, role: 12, gap: 12 };
    const nodes = N.map(n => { const s = size[n.kind]; const right = n.x >= 590, mid = n.kind === "db" || n.kind === "mod";
      return `<g class="cx-n n-${n.kind}" data-id="${n.id}" data-label="${esc(n.label)}" data-sub="${esc(n.sub)}" tabindex="0" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})">
        <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${n.kind === "db" ? 6 : 2}" transform="rotate(${n.kind === "db" ? 45 : 0})"/>
        ${n.kind === "db" ? `<circle r="38" class="cx-halo"/>` : ""}
        <text x="${mid ? 0 : right ? s / 2 + 6 : -s / 2 - 6}" y="${n.kind === "db" ? 46 : 4}" text-anchor="${mid ? "middle" : right ? "start" : "end"}">${esc(n.kind === "mod" ? n.label.slice(-1) : n.label)}</text></g>`; }).join("");
    return `<svg class="cx-svg" viewBox="0 0 1200 660" role="img" aria-label="Designed data flow: ${SRC.length} sources into one database, six modules, ten views, five reports and five role views">
      <defs><filter id="cxGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g class="cx-edges">${edges}</g><g class="cx-nodes" filter="url(#cxGlow)">${nodes}</g></svg>`;
  }
  function logLines() {
    return [
      ...K.opportunities.map(o => [o.id, `${o.stage.toLowerCase()} · ${o.client} ${o.language !== "All" ? o.language : ""} · confidence ${o.confidence.toLowerCase()}`, "y"]),
      ...SRC.map(s => ["src", `${sysName(s)} · ${LIVE.includes(s) ? "in use (prototype)" : "not connected"}`, LIVE.includes(s) ? "g" : "r"]),
      ["P09", "stage 1 data discovery · not started", "g"]
    ];
  }

  function render() {
    const hero = `<header class="up-hero cp-hero"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="up-draft"><b>P09</b>First real figures from the IMS dashboard · 1 Oct – 8 Nov 2026</div>
      <h1>${esc(K.question.replace("already has?", ""))}<em>already has?</em></h1>
      <div class="cp-pr">${K.principles.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}</div>
    </div></header>`;

    /* header strip: design counts only (real), plus live-KPI tiles per panel */
    const allK = K.panels.flatMap(p => p.kpis);
    const waiting = allK.filter(k => !["tracker", "m"].includes(k[1])).length, n = x => x.toLocaleString("en-US");
    const strip = [["Calls offered", n(K.real.total[0]), K.real.period], ["Abandoned", n(K.real.total[2]), Math.round(K.real.total[2] / K.real.total[0] * 100) + "%"], ["Ready but idle", n(K.real.hours.idle) + " h", "same period"], ["Opportunities", K.opportunities.length, "in tracker"], ["KPIs waiting", waiting, "for data"]];
    const tiles = K.panels.map(p => [p.id, p.kpis.filter(k => ["tracker", "m"].includes(k[1])).length, p.kpis.length]);
    const dash = `<section class="cp-console" id="dash"><div class="wrap">
      <div class="cx-top">
        <div class="cx-title"><b>DIRECTOR VIEW</b><span><i class="cx-rec"></i>${esc(K.updated)}</span></div>
        <div class="cx-strip">${strip.map(s => `<div><small>${esc(s[0])}</small><b>${s[1]}</b><em>${esc(s[2])}</em></div>`).join("")}</div>
      </div>
      <div class="cx-tiles">${tiles.map(t => `<div><span>${t[0]}</span><small>${t[1]}/${t[2]} with data</small><i>${Array.from({ length: t[2] }, (_, j) => `<u class="${j < t[1] ? "on" : ""}"></u>`).join("")}</i></div>`).join("")}<div class="cx-tf"><span>F</span><small>${K.attention.length} open</small><i>${K.attention.map(() => `<u class="r"></u>`).join("")}</i></div></div>
      <div class="cp-fil">${K.filters.map(f => `<label>${esc(f)}<select disabled><option>All</option></select></label>`).join("")}</div>
      <div class="cx-main">
        <div class="cx-graph"><div class="cx-gh"><span><i class="cx-rec"></i>DATA GRAPH · ${esc(graphTitle)}</span><span class="cx-leg"><i class="l-on"></i>designed flow <i class="l-off"></i>source not connected <i class="l-gap"></i>gap</span></div>${graph()}<div class="cx-tip" id="cxTip">Hover or tap a node</div></div>
        <div class="cx-side">${K.panels.map(p => `<div class="cx-p"><h3><i>${p.id}</i>${esc(p.name)}</h3>${p.kpis.map(kpi).join("")}</div>`).join("")}</div>
        <div class="cx-right">
          <div class="cx-p cx-att"><h3><i>F</i>Needs attention</h3><ol>${K.attention.map(a => `<li><span>${esc(a[0])}</span>${a[1].startsWith("OP") ? `<button class="mono" data-scroll="opp-${a[1]}">${a[1]}</button>` : `<a href="#/delivery" data-goto="risk-${a[1]}" class="mono">${a[1]}</a>`}</li>`).join("")}</ol></div>
          <div class="cx-log"><div class="cx-lh">signal log</div>${logLines().map(l => `<div><span>${esc(l[0])}</span> <b class="${l[2]}">${esc(l[1])}</b></div>`).join("")}</div>
        </div>
      </div>
      <p class="cx-note">Tap any figure for its source, definition, period and last update. Measured values come from the IMS dashboard prototype; the rest wait for their source.</p>
    </div></section>`;

    const ttg = `<section class="sec up-sec" id="ttg"><div class="wrap">
      <div class="up-head"><span>Worked example</span><h2>TTG · Italian</h2></div>
      <div class="cp-chain">${K.ttg.map((s, i) => `<div><span>${i + 1}</span>${s[2] ? `<strong>${esc(s[2])}</strong>` : ""}<b>${esc(s[0])}</b>${st(s[1])}</div>`).join("")}</div>
      <p class="up-note">Unassigned does not mean available: no move before eligibility, contract, schedule and commitments are checked.</p>
    </div></section>`;

    const mods = `<section class="sec up-sec" id="modules"><div class="wrap">
      <div class="up-head"><span>How it works</span><h2>Six modules</h2></div>
      <div class="cp-mods">${K.modules.map(m => `<div><i>${m[0]}</i><h4>${esc(m[1])}</h4><div class="up-chips c-fix">${m[2].map(x => `<em>${esc(x)}</em>`).join("")}</div></div>`).join("")}</div>
      <div class="cp-lists">
        <div><h4>A · 6 sources</h4><div class="up-chips c-today">${K.sources6.map(x => `<em>${esc(x)}</em>`).join("")}</div></div>
        <div><h4>D · 8 categories</h4><div class="up-chips c-today">${K.utilCats.map(x => `<em>${esc(x)}</em>`).join("")}</div></div>
        <div><h4>E · 6 opportunity classes</h4><div class="up-chips c-today">${K.oppClasses.map(x => `<em>${esc(x)}</em>`).join("")}</div></div>
      </div>
    </div></section>`;

    const views = `<section class="sec up-sec" id="views"><div class="wrap">
      <div class="up-head"><span>Reports</span><h2>Ten views</h2></div>
      <div class="cp-views">${K.views.map((v, i) => `<div><span class="mono">${String(i + 1).padStart(2, "0")}</span><h4>${esc(v[0])}</h4><p>${esc(v[1])}</p><div class="cp-f">${v[2].map(x => `<em>${esc(x)}</em>`).join("")}</div><small>${v[3].map(sysName).map(esc).join(" · ")}</small></div>`).join("")}</div>
    </div></section>`;

    const R = { now: ["ok", "Exists"], access: ["dec", "Needs access"], unknown: ["risk", "Source unknown"] };
    const counts = Object.keys(R).map(k => [k, K.discovery.filter(d => d[5] === k).length]);
    const data = `<section class="sec up-sec" id="data"><div class="wrap">
      <div class="up-head"><span>Stage 1</span><h2>Data discovery</h2></div>
      <div class="cp-dsum">${counts.map(c => `<div class="s-${R[c[0]][0]}"><b>${c[1]}</b><span>${R[c[0]][1]}</span></div>`).join("")}</div>
      <div class="tbl"><table class="cp-dt"><thead><tr><th>Metric</th><th>Source</th><th>Owner</th><th>Refresh</th><th>Method</th><th>Status</th></tr></thead><tbody>
      ${K.discovery.map(d => `<tr><td><b>${esc(d[0])}</b></td><td>${esc(d[1])}</td><td>${esc(d[2])}</td><td>${esc(d[3])}</td><td>${esc(d[4])}</td><td><span class="cp-st s-${R[d[5]][0]}">${R[d[5]][1]}</span></td></tr>`).join("")}
      </tbody></table></div>
    </div></section>`;

    const plan = `<section class="sec up-sec" id="stages"><div class="wrap">
      <div class="up-head"><span>Plan</span><h2>Five stages</h2></div>
      <div class="cp-stages">${K.stages.map((s, i) => `<div class="${i ? "" : "on"}"><span>${i + 1}</span><b>${esc(s[0])}</b><small>${esc(s[1])}</small></div>`).join("")}</div>
      <p class="up-note">Not started. Stage 1 needs an owner and data access (see <a href="#/portfolio/P09">P09</a>).</p>
    </div></section>`;

    const track = `<section class="sec up-sec" id="tracker"><div class="wrap">
      <div class="up-head"><span>Module F</span><h2>Opportunity tracker</h2></div>
      <div class="cp-pipe">${K.oppStages.map(s => `<div><b>${K.opportunities.filter(o => o.stage === s).length}</b><span>${s}</span></div>`).join("")}</div>
      <div class="cp-opps">${K.opportunities.map(o => `<details class="cp-o" id="opp-${o.id}"><summary><span class="mono">${o.id}</span><b>${esc(o.title)}</b><em>${esc(o.stage)}</em></summary>
        <dl>${[["Client", o.client], ["Language", o.language], ["Service line", o.line], ["Class", o.cls], ["Evidence", o.evidence], ["Source", o.source], ["Confidence", o.confidence], ["Impact", o.impact], ["Owner", o.owner], ["Next action", o.action], ["Due", o.due], ["Result", o.result]].map(x => `<dt>${x[0]}</dt><dd>${esc(x[1])}</dd>`).join("")}</dl></details>`).join("")}</div>
    </div></section>`;

    const srcIds = ["accountdb", "kalam", "zoho", "incorta", "clientrep", "schedules", "timedoctor", "transparent"];
    const U = K.unified;
    const platform = `<section class="sec up-sec" id="platform"><div class="wrap">
      <div class="up-head"><span>Foundation</span><h2>One database, automatic reports</h2></div>
      <div class="cp-flow">
        <div class="cp-fc"><h4>Sources</h4><div class="up-chips c-today">${srcIds.map(id => `<em>${esc(sysName(id))}</em>`).join("")}</div></div>
        <div class="cp-fa">→</div>
        <div class="cp-fc cp-db"><h4>Unified database</h4><div class="cp-tbls">${U.tables.map(t => `<span>${esc(t)}</span>`).join("")}</div><div class="cp-chk">${U.checks.map(c => `<small>✓ ${esc(c)}</small>`).join("")}</div></div>
        <div class="cp-fa">→</div>
        <div class="cp-fc"><h4>Automated reports</h4><ul class="cp-rep">${K.reports.map(r => `<li><b>${esc(r[0])}</b><span><i>${esc(r[1])}</i>${esc(r[2])} · ${esc(r[3])}</span></li>`).join("")}</ul></div>
      </div>
      <p class="up-note">Design only. Needs IT hosting and data access (<a href="#/portfolio/P09">P09</a>, <a href="#/portfolio/P02">P02</a>). Reports run from Stage 4.</p>
    </div></section>`;

    const builder = `<section class="sec up-sec" id="myview"><div class="wrap">
      <div class="up-head"><span>Custom views</span><h2>Each decision maker builds their own view</h2></div>
      <div class="cp-vb">
        <div class="cp-vctl">
          <h4>1 · Start from a role</h4><div class="cp-roles">${K.roles.map((r, i) => `<button data-role="${r.id}" class="${i ? "" : "on"}">${esc(r.name)}</button>`).join("")}</div>
          <h4>2 · Pick panels</h4><div class="cp-tg" id="vbPanels">${K.panels.map(p => `<button data-p="${p.id}"><i>${p.id}</i>${esc(p.name)}</button>`).join("")}<button data-p="F"><i>F</i>Needs attention</button></div>
          <h4>3 · Pick reports</h4><div class="cp-tg" id="vbViews">${K.views.map((v, i) => `<button data-v="${i + 1}"><i>${i + 1}</i>${esc(v[0])}</button>`).join("")}</div>
          <h4>4 · Default filter</h4><select id="vbFilter">${["All clients", "My clients", "My team", "All languages", "Active interpreters"].map(f => `<option>${f}</option>`).join("")}</select>
          <div class="cp-vact"><button class="pm-btn" id="vbSave">Save my view</button><button class="pm-btn" id="vbReset">Reset to role</button><span id="vbMsg"></span></div>
        </div>
        <div class="cp-vprev"><div class="cp-vph"><b id="vbTitle"></b><span id="vbSub"></span></div><div id="vbBody"></div></div>
      </div>
      <p class="up-note">Saved in this browser for now. In the company tool each person's view is saved to their account and shows only the clients they may see.</p>
    </div></section>`;


    const RD = K.real, mx = Math.max(...RD.clients.map(c => c[1])), mt = Math.max(...RD.ttgLangs.map(c => c[1]));
    const bars = (rows, m) => rows.map(r => `<div class="rb"><span>${esc(r[0])}</span><div class="rb-t"><i class="a" style="width:${(r[2] / m * 100).toFixed(1)}%"></i><i class="x" style="width:${(r[3] / m * 100).toFixed(1)}%"></i></div><b>${r[1].toLocaleString("en-US")}</b><em>${r[1] ? Math.round(r[3] / r[1] * 100) : 0}% lost</em></div>`).join("");
    const real = `<section class="sec up-sec" id="demand"><div class="wrap">
      <div class="up-head"><span>Real data · ${esc(RD.period)}</span><h2>Where demand is lost</h2></div>
      <div class="rd-kpis"><div><b>${RD.total[0].toLocaleString("en-US")}</b><span>calls offered</span></div><div><b>${RD.total[1].toLocaleString("en-US")}</b><span>answered</span></div><div class="bad"><b>${RD.total[2].toLocaleString("en-US")}</b><span>abandoned</span></div><div class="idle"><b>${RD.hours.idle.toLocaleString("en-US")} h</b><span>ready but idle</span></div><div><b>${RD.weekOcc[0]}</b><span>occupancy ${esc(RD.weekOcc[1])} · ${esc(RD.weekOcc[2])}</span></div></div>
      <div class="rd-cols">
        <div class="rd-card"><h4>By client</h4><div class="rd-key"><i class="a"></i>answered <i class="x"></i>abandoned</div>${bars(RD.clients, mx)}</div>
        <div class="rd-card"><h4>TTG by language</h4><div class="rd-key"><i class="a"></i>answered <i class="x"></i>abandoned</div>${bars(RD.ttgLangs, mt)}</div>
      </div>
      <p class="up-note">Source: ${esc(K.source)}, data built ${esc(K.asof)}. Abandoned = offered calls not answered, as the queue records them (includes very short calls). Idle hours and abandoned calls can be in different languages and hours: matching them is Module E.</p>
    </div></section>`;

    return hero + dash + real + builder + ttg + platform + mods + views + data + plan + track;
  }

  function wireGraph() {
    const svg = document.querySelector(".cx-svg"), tip = document.getElementById("cxTip"); if (!svg) return;
    const edges = [...svg.querySelectorAll(".cx-e")], nodes = [...svg.querySelectorAll(".cx-n")];
    const focus = g => {
      const id = g && g.dataset.id; svg.classList.toggle("focus", !!id);
      const near = new Set([id]);
      edges.forEach(e => { const on = id && (e.dataset.a === id || e.dataset.b === id); e.classList.toggle("hi", !!on); if (on) { near.add(e.dataset.a); near.add(e.dataset.b); } });
      nodes.forEach(n => n.classList.toggle("hi", !!id && near.has(n.dataset.id)));
      tip.innerHTML = id ? `<b>${esc(g.dataset.label)}</b> · ${esc(g.dataset.sub)} · ${near.size - 1} links` : "Hover or tap a node";
    };
    nodes.forEach(n => { n.addEventListener("mouseenter", () => focus(n)); n.addEventListener("focus", () => focus(n)); n.addEventListener("click", () => focus(n)); });
    svg.addEventListener("mouseleave", () => focus(null));
  }

  function wire() {
    wireGraph();
    const box = document.getElementById("myview"); if (!box) return;
    const key = "ims-p09-view"; let cur;
    const all = sel => [...document.querySelectorAll(sel)];
    const load = () => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } };
    const fromRole = r => ({ role: r.id, panels: [...r.panels], views: [...r.views], filter: r.filter });
    const paint = () => {
      all("#vbPanels button").forEach(b => b.classList.toggle("on", cur.panels.includes(b.dataset.p)));
      all("#vbViews button").forEach(b => b.classList.toggle("on", cur.views.includes(+b.dataset.v)));
      all(".cp-roles button").forEach(b => b.classList.toggle("on", b.dataset.role === cur.role));
      document.getElementById("vbFilter").value = cur.filter;
      const r = K.roles.find(x => x.id === cur.role);
      document.getElementById("vbTitle").textContent = r.name + " view";
      document.getElementById("vbSub").textContent = `${cur.panels.length} panels · ${cur.views.length} reports · ${cur.filter}`;
      const pn = K.panels.filter(p => cur.panels.includes(p.id)).map(p => `<div class="cp-mini"><b><i>${p.id}</i>${esc(p.name)}</b>${p.kpis.map(k => `<span>${esc(k[0])}<em>${k[1] === "tracker" ? oppCount(k[0]) : "—"}</em></span>`).join("")}</div>`);
      if (cur.panels.includes("F")) pn.push(`<div class="cp-mini"><b><i>F</i>Needs attention</b>${K.attention.slice(0, 3).map(a => `<span>${esc(a[0])}</span>`).join("")}</div>`);
      const vw = [...cur.views].sort((a, b) => a - b).map(n => `<span><i>${n}</i>${esc(K.views[n - 1][0])}</span>`).join("");
      document.getElementById("vbBody").innerHTML = (pn.length ? `<div class="cp-minis">${pn.join("")}</div>` : `<p class="up-note">No panels picked.</p>`) + (vw ? `<div class="cp-vlist">${vw}</div>` : "");
    };
    const saved = load(); cur = saved && K.roles.some(r => r.id === saved.role) && Array.isArray(saved.panels) ? saved : fromRole(K.roles[0]);
    all(".cp-roles button").forEach(b => b.addEventListener("click", () => { cur = fromRole(K.roles.find(r => r.id === b.dataset.role)); paint(); }));
    all("#vbPanels button").forEach(b => b.addEventListener("click", () => { const p = b.dataset.p; cur.panels = cur.panels.includes(p) ? cur.panels.filter(x => x !== p) : [...cur.panels, p]; paint(); }));
    all("#vbViews button").forEach(b => b.addEventListener("click", () => { const v = +b.dataset.v; cur.views = cur.views.includes(v) ? cur.views.filter(x => x !== v) : [...cur.views, v]; paint(); }));
    document.getElementById("vbFilter").addEventListener("change", e => { cur.filter = e.target.value; paint(); });
    document.getElementById("vbSave").addEventListener("click", () => { let ok = true; try { localStorage.setItem(key, JSON.stringify(cur)); } catch (e) { ok = false; } document.getElementById("vbMsg").textContent = ok ? "Saved" : "Could not save in this browser"; });
    document.getElementById("vbReset").addEventListener("click", () => { cur = fromRole(K.roles.find(r => r.id === cur.role)); paint(); document.getElementById("vbMsg").textContent = ""; });
    paint();
  }

  window.CHAPTERS.push({ id: "capacity", no: "09", title: "Demand vs Resources", nav: "Capacity", hero: true, render, wire, sections: [["dash", "Dashboard"], ["demand", "Real demand"], ["myview", "My view"], ["ttg", "TTG example"], ["platform", "Database & reports"], ["modules", "Modules"], ["views", "Views"], ["data", "Data"], ["stages", "Stages"], ["tracker", "Tracker"]] });
})();
