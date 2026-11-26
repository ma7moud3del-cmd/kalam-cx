/* Opening page: Weekly management update. Visual, short labels only.
   Built only from js/data/update.js. */
(function () {
  const { esc, fmtDate } = UI;
  const U = IMS.update, G = IMS.program;
  const TAG = { measured: ["ok", "Measured"], estimate: ["est", "Estimate"], described: ["cur", "As described"], tbc: ["dec", "To confirm"] };
  const tag = s => `<span class="up-tag t-${TAG[s][0]}">${TAG[s][1]}</span>`;
  const tbcCount = () => U.areas.filter(a => a.time[2] === "tbc").length + U.work.reduce((n, w) => n + (w.big[2] === "tbc") + w.small.filter(s => s[2] === "tbc").length, 0);

  function render() {
    const hero = `<header class="up-hero"><div class="ov-grid-bg"></div><div class="wrap">
      <div class="up-draft"><b>DRAFT</b>${esc(U.draft)}</div>
      <div class="pm-crumb">Weekly update · ${esc(G.org)} · ${fmtDate(G.reportDate)}</div>
      <h1>IMS operations: <em>where we are</em></h1>
      <ol class="up-agenda">${[["1", "Done & in progress", "work"], ["2", "Areas to improve", "areas"], ["3", "Asks", "ask"]].map(x => `<li><button data-scroll="${x[2]}"><b>${x[0]}</b>${x[1]}</button></li>`).join("")}</ol>
    </div></header>`;

    const work = `<section class="sec up-sec" id="work"><div class="wrap">
      <div class="up-head"><span>Part 1</span><h2>Done and in progress</h2></div>
      <div class="up-work4">${U.work.map(w => `<article class="up-wc st-${w.stage}">
        <span class="up-stage">${esc(w.stageLabel)}</span>
        <h3>${esc(w.name)}</h3>
        <div class="up-big"><b>${esc(w.big[0])}</b><span>${esc(w.big[1])}</span>${tag(w.big[2])}</div>
        <div class="up-small">${w.small.map(s => `<div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join("")}</div>
        <p class="up-nx">Next → ${esc(w.next)}</p></article>`).join("")}</div>
    </div></section>`;

    const areas = `<section class="sec up-sec" id="areas"><div class="wrap">
      <div class="up-head"><span>Part 2</span><h2>Areas to improve</h2></div>
      <div class="up-key"><i class="k-today"></i>Today <i class="k-pain"></i>Issue <i class="k-fix"></i>Direction (not a decision)</div>
      <div class="up-grid">${U.areas.map((a, i) => `<article class="up-ac" id="area-${a.id}">
        <div class="up-ach"><span>${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(a.name)}</h3><small>${esc(a.sub)}</small></div></div>
        <div class="up-chips c-today">${a.today.map(s => `<em>${esc(s)}</em>`).join("")}</div>
        <div class="up-chips c-pain">${a.pain.map(s => `<em>${esc(s)}</em>`).join("")}</div>
        <div class="up-tb"><b>${esc(a.time[0])}</b><span>${esc(a.time[1])}</span>${tag(a.time[2])}</div>
        <div class="up-chips c-fix">${a.fix.map(s => `<em>${esc(s)}</em>`).join("")}</div>
        ${a.link ? `<a class="up-go" href="${a.link}">Open dashboard →</a>` : ""}
      </article>`).join("")}</div>
    </div></section>`;

    const ask = `<section class="sec up-sec" id="ask"><div class="wrap">
      <div class="up-head"><span>Part 3</span><h2>Asks this week</h2></div>
      <div class="up-asks">${U.asks.map((a, i) => `<div><b>${i + 1}</b><h4>${esc(a[0])}</h4><p>${esc(a[1])}</p></div>`).join("")}</div>
      <p class="up-note">${tbcCount()} figures on this page are still "To confirm".</p>
      <div class="up-more"><a href="#/overview">Full program draft →</a></div>
    </div></section>`;
    return hero + work + areas + ask;
  }

  window.CHAPTERS.unshift({ id: "update", no: "★", title: "Weekly Management Update", nav: "Weekly update", hero: true, render, wire() {}, sections: [["work", "Done & in progress"], ["areas", "Areas to improve"], ["ask", "Asks"]] });
})();
