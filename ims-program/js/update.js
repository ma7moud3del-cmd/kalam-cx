/* Opening page: Weekly management update. Futuristic live-map header, then short cards.
   Built only from js/data/update.js. */
(function () {
  const { esc, fmtDate } = UI;
  const U = IMS.update, G = IMS.program;
  const TAG = { measured: ["ok", "Measured"], estimate: ["est", "Estimate"], described: ["cur", "As described"], tbc: ["dec", "To confirm"] };
  const tag = s => `<span class="up-tag t-${TAG[s][0]}">${TAG[s][1]}</span>`;
  const tbcCount = () => U.areas.filter(a => a.time[2] === "tbc").length + U.work.reduce((n, w) => n + (w.big[2] === "tbc") + w.small.filter(s => s[2] === "tbc").length, 0);

  /* which area each piece of work serves (for the map) */
  const WORK_AREAS = [["onboarding"], ["onboarding", "operations"], ["presched"], ["reports", "utilization"]];

  function map() {
    const cx = 380, cy = 300, N = [], E = [];
    const at = (r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
    N.push({ id: "core", kind: "core", label: "IMS operations", sub: `${U.areas.length} areas · ${U.work.length} pieces of work`, p: [cx, cy] });
    U.areas.forEach((a, i) => {
      const deg = -90 + i * 360 / U.areas.length, p = at(175, deg);
      N.push({ id: "a-" + a.id, kind: "area", label: a.name, sub: `${a.sub} · ${a.time[0]} ${a.time[1]}`, p, deg, go: "area-" + a.id });
      E.push(["core", "a-" + a.id, "on"]);
      a.pain.forEach((x, j) => { const q = at(262, deg + (j - (a.pain.length - 1) / 2) * 11); N.push({ id: `x-${a.id}-${j}`, kind: "pain", label: x, sub: "Issue · " + a.name, p: q, go: "area-" + a.id }); E.push(["a-" + a.id, `x-${a.id}-${j}`, "pain"]); });
    });
    U.work.forEach((w, i) => {
      const ids = WORK_AREAS[i] || [], ang = ids.map(id => N.find(n => n.id === "a-" + id).deg);
      const deg = ang.reduce((s, x) => s + x, 0) / ang.length + (ids.length > 1 ? 0 : 18), p = at(108, deg);
      N.push({ id: "w-" + i, kind: w.stage, label: w.name, sub: `${w.stageLabel} · ${w.big[0]} ${w.big[1]}`, p, go: "work-" + i });
      ids.forEach(id => E.push(["w-" + i, "a-" + id, w.stage]));
    });
    const by = Object.fromEntries(N.map(n => [n.id, n]));
    const edges = E.map(([a, b, k], i) => { const p = by[a].p, q = by[b].p, mx = (p[0] + q[0]) / 2 + (q[1] - p[1]) * .1, my = (p[1] + q[1]) / 2 - (q[0] - p[0]) * .1;
      return `<path class="hm-e e-${k}" data-a="${a}" data-b="${b}" style="animation-delay:${(i % 7) * -.5}s" d="M${p[0].toFixed(1)},${p[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${q[0].toFixed(1)},${q[1].toFixed(1)}"/>`; }).join("");
    const size = { core: 30, area: 16, live: 14, build: 12, pain: 7 };
    const nodes = N.map(n => { const s = size[n.kind], [x, y] = n.p;
      const lab = n.kind === "pain" ? "" : n.kind === "core" ? `<text y="48" text-anchor="middle">${esc(n.label)}</text>`
        : n.kind === "area" ? `<text y="${y < cy - 5 ? -16 : 26}" text-anchor="middle">${esc(n.label)}</text>`
        : "";
      return `<g class="hm-n n-${n.kind}" data-id="${n.id}" data-label="${esc(n.label)}" data-sub="${esc(n.sub)}" ${n.go ? `data-go="${n.go}"` : ""} tabindex="0" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        ${n.kind === "core" ? `<circle r="20" class="hm-halo"/><circle r="20" class="hm-halo h2"/>` : ""}
        <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${n.kind === "core" ? 8 : n.kind === "pain" ? 1 : 3}" ${n.kind === "core" || n.kind === "area" ? 'transform="rotate(45)"' : ""}/>${lab}</g>`; }).join("");
    return `<svg class="hm-svg" viewBox="0 0 760 600" role="img" aria-label="Map of the ${U.areas.length} IMS areas, their issues and the work in progress">
      <defs><filter id="hmGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g>${edges}</g><g filter="url(#hmGlow)">${nodes}</g></svg>`;
  }


  function detailHtml(w) {
    const d = w.detail;
    return `<div class="ud-head"><div><span class="up-stage">${esc(w.stageLabel)}</span><h3>${esc(w.name)}</h3></div><button class="pm-btn" data-close>Close ✕</button></div>
      <div class="ud-ba"><div class="ud-b"><h4>Before</h4><ul>${d.before.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="ud-arrow">→</div><div class="ud-a"><h4>${w.stage === "live" ? "Now" : "Target"}</h4><ul>${d.after.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
      <div class="ud-res">${d.results.map(r => `<div><b>${esc(r[0])}</b><span>${esc(r[1])}</span>${tag(r[2])}</div>`).join("")}</div>
      <div class="ud-low">${d.img ? `<figure><img src="${d.img}" alt="Screenshot of ${esc(w.name)}" loading="lazy"><figcaption>${esc(w.name)}${w.name === "IMS Intelligence" ? " · faces blurred" : ""}</figcaption></figure>` : `<p class="ud-noimg">${esc(d.imgNote || "")}</p>`}
        <div class="ud-next"><h4>Next steps</h4><ol>${d.nextSteps.map(x => `<li>${esc(x)}</li>`).join("")}</ol>${d.link ? `<a class="up-go" href="${d.link[0]}" target="_blank" rel="noopener">${esc(d.link[1])} ↗</a>` : ""}</div></div>`;
  }

  function render() {
    const R = IMS.capacity && IMS.capacity.real, nf = x => x.toLocaleString("en-US");
    const figs = [...U.work.filter(w => w.big[2] === "measured").map(w => [w.big[0], w.big[1], "measured", w.name]), ...(R ? [[nf(R.total[2]), `calls abandoned (${R.period})`, "measured", "Capacity · real data"]] : [])];
    const pains = U.areas.reduce((n, a) => n + a.pain.length, 0);
    const hero = `<header class="up-hero hm-hero"><div class="ov-grid-bg"></div><div class="wrap hm-wrap">
      <div class="hm-left">
        <div class="hm-bar"><i class="cx-rec"></i>WEEKLY UPDATE · ${esc(G.org)} · ${fmtDate(G.reportDate)}</div>
        <h1>IMS operations: <em>where we are</em></h1>
        <div class="hm-strip">${figs.slice(0, 4).map(f => `<div><small>${esc(f[3])}</small><b>${esc(f[0])}</b><span>${esc(f[1])}</span><em class="hs-${f[2]}">${TAG[f[2]][1]}</em></div>`).join("")}</div>
        <div class="hm-tiles">${U.work.map(w => `<div class="t-${w.stage}"><span>${esc(w.name)}</span><small>${esc(w.stage === "live" ? "Live" : "In progress")}</small><i><u></u><u></u><u></u><u></u></i></div>`).join("")}</div>
        <ol class="up-agenda">${[["1", "Done & in progress", "work"], ["2", `${U.areas.length} areas to improve`, "areas"], ["3", "Asks", "ask"]].map(x => `<li><button data-scroll="${x[2]}"><b>${x[0]}</b>${x[1]}</button></li>`).join("")}</ol>
      </div>
      <div class="hm-map">
        <div class="hm-mh"><span><i class="cx-rec"></i>OPERATIONS MAP · ${U.areas.length} AREAS · ${pains} ISSUES</span><span class="hm-leg"><i class="l-live"></i>live <i class="l-build"></i>in progress <i class="l-pain"></i>issue</span></div>
        ${map()}
        <div class="hm-tip" id="hmTip">Hover or tap a node · tap an area to open it</div>
      </div>
    </div></header>`;

    const work = `<section class="sec up-sec" id="work"><div class="wrap">
      <div class="up-head"><span>Part 1</span><h2>Done and in progress</h2></div>
      <div class="up-work4">${U.work.map((w, i) => `<article class="up-wc st-${w.stage}" id="work-${i}">
        <span class="up-stage">${esc(w.stageLabel)}</span>
        <h3>${esc(w.name)}</h3>
        <div class="up-big"><b>${esc(w.big[0])}</b><span>${esc(w.big[1])}</span>${tag(w.big[2])}</div>
        <div class="up-small">${w.small.map(s => `<div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join("")}</div>
        <p class="up-nx">Next → ${esc(w.next)}</p>
        <button class="up-open" data-work="${i}" aria-expanded="false">See details</button></article>`).join("")}</div>
      <div class="up-det hidden" id="workDetail" role="region" aria-live="polite"></div>
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
      <div class="up-more"><a href="#/overview">Program cockpit →</a></div>
    </div></section>`;
    return hero + work + areas + ask;
  }

  function wire() {
    const panel = document.getElementById("workDetail");
    const btns = [...document.querySelectorAll(".up-open")];
    const close = () => { panel.classList.add("hidden"); panel.innerHTML = ""; btns.forEach(b => { b.setAttribute("aria-expanded", "false"); b.textContent = "See details"; b.closest(".up-wc").classList.remove("sel"); }); };
    btns.forEach(b => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true"; close(); if (open) return;
      panel.innerHTML = detailHtml(U.work[+b.dataset.work]); panel.classList.remove("hidden");
      b.setAttribute("aria-expanded", "true"); b.textContent = "Hide details"; b.closest(".up-wc").classList.add("sel");
      panel.querySelector("[data-close]").addEventListener("click", close);
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
    const svg = document.querySelector(".hm-svg"), tip = document.getElementById("hmTip"); if (!svg) return;
    const edges = [...svg.querySelectorAll(".hm-e")], nodes = [...svg.querySelectorAll(".hm-n")];
    const focus = g => {
      const id = g && g.dataset.id, near = new Set([id]); svg.classList.toggle("focus", !!id);
      edges.forEach(e => { const on = id && (e.dataset.a === id || e.dataset.b === id); e.classList.toggle("hi", !!on); if (on) { near.add(e.dataset.a); near.add(e.dataset.b); } });
      nodes.forEach(n => n.classList.toggle("hi", !!id && near.has(n.dataset.id)));
      tip.innerHTML = id ? `<b>${esc(g.dataset.label)}</b> · ${esc(g.dataset.sub)}` : "Hover or tap a node · tap an area to open it";
    };
    nodes.forEach(n => {
      n.addEventListener("mouseenter", () => focus(n)); n.addEventListener("focus", () => focus(n));
      n.addEventListener("click", () => { focus(n); const t = n.dataset.go && document.getElementById(n.dataset.go); if (t && n.dataset.id !== "core") setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "center" }), 250); });
    });
    svg.addEventListener("mouseleave", () => focus(null));
  }

  window.CHAPTERS.unshift({ id: "update", no: "★", title: "Weekly Management Update", nav: "Weekly update", hero: true, render, wire, sections: [["work", "Done & in progress"], ["areas", "Areas to improve"], ["ask", "Asks"]] });
})();
