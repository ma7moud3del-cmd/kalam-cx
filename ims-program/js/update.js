/* Opening page: Weekly management update.
   Part 1 = delivered and in progress. Part 2 = areas to improve.
   Built only from js/data/update.js (plus metric values for evidence). */
(function () {
  const { $, $$, esc, fmtDate } = UI;
  const U = IMS.update, G = IMS.program;
  const TAG = { measured: ["ok", "Measured"], estimate: ["est", "Estimate"], described: ["cur", "As described"], tbc: ["dec", "To confirm"] };
  const tag = s => `<span class="up-tag t-${TAG[s][0]}">${TAG[s][1]}</span>`;
  const tbcCount = () => U.areas.reduce((a, x) => a + (x.time || []).filter(t => t[2] === "tbc").length, 0) + U.work.reduce((a, w) => a + w.results.filter(r => r[2] === "tbc").length, 0);

  function areaBody(a) {
    if (a.practices) return `<p class="up-scope">${esc(a.scope)}</p>
      <div class="up-state"><b>Why look at this</b><p>${esc(a.statement)}</p></div>
      <div class="up-prac">${a.practices.map(p => `<div><h4>${esc(p[0])}</h4><p>${esc(p[1])}</p><span>→ ${esc(p[2])}</span></div>`).join("")}</div>
      <p class="up-note">Ideas for discussion. Each would be adapted to interpreting work and agreed with the team before any change.</p>`;
    if (a.id === "orgmap") { const O = U.org;
      return `<p class="up-scope">${esc(a.scope)}</p>
      <div class="up-org"><div class="up-orgtop"><b>${esc(O.top[0])}</b><span>${esc(O.top[1])}</span></div>
        <div class="up-orggrid">${O.groups.map(g => `<div class="up-orgg"><h4>${esc(g.name)}</h4>${g.lines.map(l => `<div><b>${esc(l[0])}</b><span>${esc(l[1])}</span></div>`).join("")}</div>`).join("")}</div></div>
      <p class="up-note"><b>Draft:</b> functions only, built from how the work is described today. Names, reporting lines and client allocation are to be confirmed.</p>
      <div class="up-cols"><div class="up-state"><b>Problem statement</b><p>${esc(a.statement)}</p></div>
      <div><h4 class="up-h">Questions to confirm</h4><ul class="up-list q">${O.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul><h4 class="up-h">Next</h4><ul class="up-list fix">${a.fix.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`; }
    return `<p class="up-scope"><b>Scope:</b> ${esc(a.scope)}</p>
      <h4 class="up-h">How it works today</h4><div class="up-flow">${a.today.map((s, i) => `<div><span>${i + 1}</span>${esc(s)}</div>`).join("")}</div>
      <div class="up-cols">
        <div><h4 class="up-h">Issues today</h4><ul class="up-list bad">${a.issues.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h4 class="up-h">Time and volume</h4><table class="up-time"><tbody>${a.time.map(t => `<tr><td><b>${esc(t[0])}</b></td><td>${esc(t[1])}</td><td>${tag(t[2])}</td></tr>`).join("")}</tbody></table></div>
      </div>
      <div class="up-state"><b>Problem statement</b><p>${esc(a.statement)}</p></div>
      <div class="up-cols">
        <div><h4 class="up-h">How we could fix it <small>direction, not a decision</small></h4><ul class="up-list fix">${a.fix.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="up-basis"><h4 class="up-h">What we already know</h4><p>${esc(a.evidence)}</p>${U.work.filter(w => w.area === a.id).map(w => `<p class="up-link">Related work: <b>${esc(w.name)}</b> · ${esc(w.stageLabel)}</p>`).join("")}</div>
      </div>`;
  }

  function render() {
    const hero = `<header class="up-hero"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="up-draft"><b>DRAFT</b>${esc(U.draft)}</div>
      <div class="pm-crumb">Weekly management update · ${esc(G.org)} · ${fmtDate(G.reportDate)}</div>
      <h1>IMS operations: <em>where we are</em> and where we can improve</h1>
      <ol class="up-agenda">${[["1", "Delivered and in progress", "work"], ["2", "Areas to improve", "areas"], ["3", "What we need this week", "ask"]].map(x => `<li><button data-scroll="${x[2]}"><b>${x[0]}</b>${x[1]}</button></li>`).join("")}</ol>
    </div></header>`;

    const work = `<section class="sec up-sec" id="work"><div class="wrap">
      <div class="up-head"><span>Part 1</span><h2>What we delivered and what we are working on</h2></div>
      <div class="up-work">${U.work.map(w => `<article class="up-card st-${w.stage}">
        <div class="up-top"><span class="up-stage">${esc(w.stageLabel)}</span><span class="mono small muted">${esc(w.initiative)}</span></div>
        <h3>${esc(w.name)}</h3><p class="up-what">${esc(w.what)}</p>
        <div class="up-res">${w.results.map(r => `<div><b>${esc(r[0])}</b><span>${esc(r[1])}</span>${tag(r[2])}</div>`).join("")}</div>
        <p class="up-next"><b>Next:</b> ${esc(w.next)}</p></article>`).join("")}</div>
      <p class="up-note">"Run personally" means it works on real tasks but still runs on one person's computer and account. Moving it to the company is part of the next step.</p>
    </div></section>`;

    const areas = `<section class="sec up-sec" id="areas"><div class="wrap">
      <div class="up-head"><span>Part 2</span><h2>Areas to improve</h2><p>For each area: how it works today, the issues, the time it takes, the problem statement and how we could fix it. Choose an area.</p></div>
      <div class="up-tiles" role="tablist">${U.areas.map((a, i) => `<button role="tab" class="up-tile${i ? "" : " on"}" data-area="${a.id}" aria-selected="${i ? "false" : "true"}"><span>${a.icon}</span><b>${esc(a.name)}</b><small>${esc(a.size)}</small></button>`).join("")}</div>
      ${U.areas.map((a, i) => `<div class="up-area card${i ? " hidden" : ""}" data-pane="${a.id}" role="tabpanel"><div class="up-ah"><span>${a.icon}</span><h3>${esc(a.name)}</h3></div>${areaBody(a)}</div>`).join("")}
      <div class="up-nav"><button class="pm-btn" data-step="-1">← Previous area</button><button class="pm-btn" data-step="1">Next area →</button></div>
    </div></section>`;

    const ask = `<section class="sec up-sec" id="ask"><div class="wrap">
      <div class="up-head"><span>Part 3</span><h2>What we need this week</h2></div>
      <div class="up-asks">
        <div><b>1</b><h4>Agree which areas to look at first</h4><p>Choose the 2 or 3 areas with the biggest effect on time and quality.</p></div>
        <div><b>2</b><h4>Confirm the missing figures</h4><p>${tbcCount()} figures are marked "To confirm". A short check with each team gives us the real time spent.</p></div>
        <div><b>3</b><h4>Name a contact per area</h4><p>One person from each team to confirm today's process and test the fixes.</p></div>
        <div><b>4</b><h4>Move live tools to the company</h4><p>Company account and machine for MasterWord and Kalam Learning, so they do not depend on one person.</p></div>
      </div>
      <div class="up-more"><a href="#/overview">See the full program draft (timeline, projects, risks) →</a></div>
    </div></section>`;
    return hero + work + areas + ask;
  }

  function wire() {
    const tiles = $$(".up-tile"), panes = $$(".up-area");
    const show = id => { tiles.forEach(t => { const on = t.dataset.area === id; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); }); panes.forEach(p => p.classList.toggle("hidden", p.dataset.pane !== id)); };
    tiles.forEach(t => t.addEventListener("click", () => show(t.dataset.area)));
    $$(".up-nav [data-step]").forEach(b => b.addEventListener("click", () => { const i = tiles.findIndex(t => t.classList.contains("on")); const n = (i + +b.dataset.step + tiles.length) % tiles.length; show(tiles[n].dataset.area); document.getElementById("areas").scrollIntoView({ behavior: "smooth" }); }));
  }

  window.CHAPTERS.unshift({ id: "update", no: "★", title: "Weekly Management Update", nav: "Weekly update", hero: true, render, wire, sections: [["work", "Delivered and in progress"], ["areas", "Areas to improve"], ["ask", "What we need"]] });
})();
