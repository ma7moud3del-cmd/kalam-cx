/* 01 Overview: a one-screen visual plan with very little text.
   Built only from IMS data. Replaces the long overview renderer. */
(function () {
  const { esc, projStatus } = UI;
  const P = IMS.projects, G = IMS.program, plan = IMS.plan;
  const m = id => IMS.metrics.find(x => x.id === id);
  const pilotOf = p => [...new Set(p.initiatives.map(i => ((i[3] || "").match(/^Pilot [A-Z]/) || [])[0]).filter(Boolean))];
  const pilots = [...new Set(P.flatMap(pilotOf))].sort();
  const DOT = { progress: ["est", "Started"], approval: ["dec", "Pilot ready"], planned: ["cur", "Planned"] };

  function render() {
    const hero = `<header class="ov-hero"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="ov-tag"><img src="assets/mark.png" alt="Kalam"><span>${esc(G.org)} · 2027</span></div>
      <h1>Grow <em>20%</em><br>with the same team.</h1>
      <p class="ov-sub">IMS Enterprise Operations Transformation 2027</p>
      <div class="ov-stats">
        <div><b>${P.length}</b><span>projects</span></div>
        <div><b>${pilots.length}</b><span>pilots ready</span></div>
        <div><b>${G.months}</b><span>months</span></div>
        <div><b>${plan.length}</b><span>phases</span></div>
      </div>
      <button class="ov-cta" data-scroll="plan">See the plan ↓</button>
    </div></header>`;

    const timeline = `<section class="sec ov-sec" id="plan"><div class="wrap">
      <div class="ov-h"><span>The plan</span><h2>5 steps. 13 months.</h2></div>
      <ol class="ov-road">${plan.map((s, i) => `<li class="${i === 0 ? "now" : ""}">
        <div class="ov-node">${i + 1}</div>
        <div class="ov-when">${esc(s.when)}</div>
        <h3>${esc(s.step)}</h3>
        <p>${esc(s.what)}</p>
        <div class="ov-gate">${esc(s.gate)}</div>
        ${i === 0 ? `<div class="ov-here">We are here</div>` : ""}
      </li>`).join("")}</ol>
      <div class="ov-more"><a href="#/delivery">Full roadmap →</a></div>
    </div></section>`;

    const tiles = `<section class="sec ov-sec" id="projects"><div class="wrap">
      <div class="ov-h"><span>The portfolio</span><h2>8 projects. One platform.</h2></div>
      <div class="ov-tiles">${P.map(p => { const s = DOT[projStatus(p).key]; const pl = pilotOf(p);
        return `<a class="ov-tile" href="#/portfolio/${p.id}">
          <div class="ov-tn">${p.id.slice(1)}</div>
          <h3>${esc(p.short)}</h3>
          <p>${esc(IMS.wins[p.id] || "")}</p>
          <div class="ov-ts"><i class="d-${s[0]}"></i>${s[1]}${pl.length ? ` · ${pl.join(", ")}` : ""}</div>
        </a>`; }).join("")}</div>
    </div></section>`;

    const now = `<section class="ov-dark" id="now"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="ov-h light"><span>Where we stand</span><h2>Proof, not promises.</h2></div>
      <div class="ov-proof">
        <div><b>${esc(m("M-01").value)}</b><span>MasterWord applicants submitted</span><em class="ok">Measured</em></div>
        <div><b>${esc(m("M-02").value)} <small>min</small></b><span>per applicant, was ${esc(m("M-03").value)} min</span><em class="est">Old time estimated</em></div>
        <div><b>2</b><span>tools live: MasterWord, Kalam Learning</span><em class="est">Personally operated</em></div>
        <div><b>${esc(m("M-11").value)} h · ${esc(m("M-12").value)}</b><span>verified hours · confirmed savings</span><em class="cur">Discovery measures this</em></div>
      </div>
      <div class="ov-more light"><a href="#/results">All results →</a></div>
    </div></section>`;

    const why = `<section class="sec ov-sec" id="why"><div class="wrap ov-why">
      <div class="ov-h"><span>Why</span><h2>Same people. More capacity.</h2></div>
      <div class="ov-goals">${IMS.objectives.map((o, i) => `<div><b>${String(i + 1).padStart(2, "0")}</b>${esc(o[0])}</div>`).join("")}</div>
      <div class="ov-more"><a href="#/case">Business case →</a></div>
    </div></section>`;

    const top5 = IMS.decisions.slice(0, 5);
    const ask = `<section class="sec ov-sec" id="ask"><div class="wrap">
      <div class="ov-h"><span>What we need</span><h2>5 decisions to start.</h2></div>
      <div class="ov-asks">${top5.map((d, i) => `<div><b>${i + 1}</b><span>${esc(d[1])}</span><small>${esc(d[4])}</small></div>`).join("")}</div>
      <div class="ov-more"><a href="#/decisions">All ${IMS.decisions.length} decisions →</a></div>
    </div></section>`;

    return hero + timeline + tiles + now + why + ask;
  }

  const ov = window.CHAPTERS[0];
  ov.render = render;
  ov.sections = [["plan", "Plan"], ["projects", "Projects"], ["now", "Where we stand"], ["why", "Why"], ["ask", "Decisions"]];
})();
