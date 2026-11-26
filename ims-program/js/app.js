/* Router and interactions. Routes: #/<chapter> and #/portfolio/<project id> */
(function () {
  const { $, $$, esc } = UI;
  const CH = window.CHAPTERS;
  const nav = $("#chapnav"), drawer = $("#drawer nav"), main = $("#main");

  nav.innerHTML = CH.map(c => `<a href="#/${c.id}" data-ch="${c.id}"><span>${c.no}</span>${esc(c.nav)}</a>`).join("");
  drawer.innerHTML = CH.map(c => `<a href="#/${c.id}" data-ch="${c.id}"><span>${c.no}</span>${esc(c.title)}</a>`).join("");

  const subnav = (c) => `<div class="subnav" role="navigation" aria-label="Sections in this chapter">${c.sections.map((s, i) => `<button data-sec="${s[0]}" class="${i ? "" : "on"}">${esc(s[1])}</button>`).join("")}</div>`;

  function render() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const found = !parts[0] || CH.some(x => x.id === parts[0]);
    let c = CH.find(x => x.id === parts[0]) || CH[0];
    let html = "", title = c.title;
    const sub = c.id === "portfolio" && parts[1] ? parts[1].toUpperCase() : null;
    const proj = sub ? IMS.projects.find(p => p.id === sub) : null;
    const cap = sub && !proj ? IMS.capabilities.find(x => x.id === sub) : null;
    if (!found || (sub && !proj && !cap) || parts.length > 2) {
      html = `<div class="chead"><div class="wrap"><div class="eyebrow">Page not found</div><h1>This page does not exist</h1><p>The link <b>${esc(location.hash)}</b> does not match a chapter, project or capability.</p></div></div><section class="sec"><div class="wrap"><div class="card pad"><p>Go to <a href="#/overview">the program cockpit</a> or <a href="#/portfolio">the portfolio</a>.</p></div></div></section>`;
      title = "Page not found"; c = { id: "", sections: [] };
      main.innerHTML = html; document.title = title + " · IMS Transformation 2027";
      $$("[data-ch]").forEach(a => a.classList.remove("on")); window.scrollTo(0, 0); return;
    } else if (proj || cap) {
      const v = proj ? c.project(proj) : c.capability(cap); html = v.head + v.body; title = proj ? proj.id + " " + proj.name : cap.id + " " + cap.name;
    } else if (c.hero) {
      html = c.render().replace("</header>", `</header><div class="subbar"><div class="wrap">${subnav(c)}</div></div>`);
    } else {
      html = `<div class="chead"><div class="wrap"><div class="eyebrow">Chapter ${c.no} of 08</div><h1>${esc(c.title)}</h1><p>${esc(c.intro)}</p></div></div><div class="subbar"><div class="wrap">${subnav(c)}</div></div>` + c.render();
    }
    const i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
    html += `<div class="wrap"><div class="chfoot">${prev ? `<a href="#/${prev.id}"><span>← Previous chapter</span><b>${prev.no} ${esc(prev.title)}</b></a>` : ""}${next ? `<a class="nx" href="#/${next.id}"><span>Next chapter →</span><b>${next.no} ${esc(next.title)}</b></a>` : ""}</div></div>`;
    main.innerHTML = html;
    document.title = title + " · IMS Transformation 2027";
    $$("[data-ch]").forEach(a => a.classList.toggle("on", a.dataset.ch === c.id));
    document.body.classList.remove("menu-open");
    $("#menubtn").setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    wire(c);
    if (c.wire && !proj && !cap) c.wire();
    let goto = null; try { goto = sessionStorage.getItem("goto"); sessionStorage.removeItem("goto"); } catch (e) { }
    if (goto) { const t = document.getElementById(goto); if (t) { const tb = t.closest("table"); if (tb) tb.classList.add("unfold"); const tr = t.closest("tr"); if (tr) tr.classList.add("flash"); setTimeout(() => t.scrollIntoView({ block: "center" }), 50); } }
  }

  function wire(c) {
    /* section sub-navigation: scroll, and highlight the section in view */
    const btns = $$(".subnav [data-sec]");
    btns.forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.sec); if (t) t.scrollIntoView({ behavior: "smooth" }); }));
    if (btns.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) btns.forEach(b => b.classList.toggle("on", b.dataset.sec === e.target.id)); }), { rootMargin: "-130px 0px -60% 0px" });
      btns.forEach(b => { const t = document.getElementById(b.dataset.sec); if (t) io.observe(t); });
    }
    $$("[data-scroll]").forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth" }); }));
    /* long tables: show the first rows, the rest behind a button */
    $$("main table").forEach(t => {
      if (t.closest(".raci,.gm") || t.classList.contains("pm-table")) return;
      const rows = [...t.querySelectorAll(":scope > tbody > tr")];
      if (rows.length <= 6) return;
      rows.slice(5).forEach(r => r.classList.add("folded"));
      const b = document.createElement("button"); b.className = "showall"; b.textContent = `Show all ${rows.length} rows`;
      b.addEventListener("click", () => { const open = t.classList.toggle("unfold"); b.textContent = open ? "Show fewer" : `Show all ${rows.length} rows`; });
      (t.parentElement.scrollWidth > t.parentElement.clientWidth || getComputedStyle(t.parentElement).overflowX !== "visible" ? t.parentElement : t).insertAdjacentElement("afterend", b);
    });
    /* links to a section inside another chapter */
    $$("[data-goto]").forEach(a => a.addEventListener("click", () => { try { sessionStorage.setItem("goto", a.dataset.goto); } catch (e) { } if (a.getAttribute("href") === location.hash) render(); }));
    /* decisions chapter: filter by status */
    $$("#decf [data-dk]").forEach(b => b.addEventListener("click", () => { $$("#decf .fbtn").forEach(x => x.classList.toggle("on", x === b)); let n = 0; $$(".dcard[data-dk]").forEach(d => { const ok = b.dataset.dk === "all" || d.dataset.dk === b.dataset.dk; d.classList.toggle("hidden", !ok); if (ok) n++; }); $("#decnone").classList.toggle("hidden", n > 0); }));
    /* project page section index highlights the section in view */
    const toc = $$(".pj-toc [data-scroll]");
    if (toc.length && "IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) toc.forEach(b => b.classList.toggle("on", b.dataset.scroll === e.target.id)); }), { rootMargin: "-120px 0px -65% 0px" }); toc.forEach(b => { const t = document.getElementById(b.dataset.scroll); if (t) io.observe(t); }); }

    /* portfolio filters */
    const pf = $("#pfilters");
    if (pf) {
      let st = "all", dp = "all";
      const apply = () => { let n = 0; $$("#pgrid .pcard").forEach(card => { const ok = (st === "all" || card.dataset.status === st) && (dp === "all" || card.dataset.depts.split("|").includes(dp)); card.classList.toggle("hidden", !ok); if (ok) n++; }); $("#pnone").classList.toggle("hidden", n > 0); };
      $$("#pfilters .fbtn").forEach(b => b.addEventListener("click", () => { st = b.dataset.f; $$("#pfilters .fbtn").forEach(x => x.classList.toggle("on", x === b)); apply(); }));
      $("#pdept").addEventListener("change", e => { dp = e.target.value; apply(); });
    }
    /* project tabs */
    $$(".tabs [data-tab]").forEach(b => b.addEventListener("click", () => { $$(".tabs [data-tab]").forEach(x => x.classList.toggle("on", x === b)); $$(".tabpane").forEach(p => p.classList.toggle("on", p.dataset.pane === b.dataset.tab)); }));
    /* journeys and process library */
    const tabset = (btnSel, attr, paneSel, pattr) => $$(btnSel).forEach(b => b.addEventListener("click", () => { $$(btnSel).forEach(x => x.classList.toggle("on", x === b)); $$(paneSel).forEach(p => p.classList.toggle("hidden", p.dataset[pattr] !== b.dataset[attr])); }));
    tabset("#jtabs .fbtn", "j", ".jpane", "jp");
    tabset("#ftabs .fbtn", "fl", ".fpane", "fp");
    /* roadmap filter */
    $$("#rfilters .fbtn").forEach(b => b.addEventListener("click", () => { $$("#rfilters .fbtn").forEach(x => x.classList.toggle("on", x === b)); const k = b.dataset.k; $$("#rfilters + .card .gr").forEach(r => r.classList.toggle("hidden", k !== "all" && r.dataset.kind !== k)); }));
    /* risk filter */
    $$("#kfilters .fbtn").forEach(b => b.addEventListener("click", () => { $$("#kfilters .fbtn").forEach(x => x.classList.toggle("on", x === b)); const cat = b.dataset.c; $$(".risktbl").forEach(t => t.classList.toggle("unfold", cat !== "all"));$$(".risktbl tbody tr").forEach(r => r.classList.toggle("hidden", cat !== "all" && r.children[1].textContent !== cat)); }));
    /* payment toggle */
    $$("#paytoggle button").forEach(b => b.addEventListener("click", () => { $$("#paytoggle button").forEach(x => x.classList.toggle("on", x === b)); $("#pay-today").classList.toggle("hidden", b.dataset.v !== "today"); $("#pay-prop").classList.toggle("hidden", b.dataset.v !== "prop"); }));
    /* evidence lightbox */
    $$("[data-img]").forEach(b => b.addEventListener("click", () => { $("#lightbox img").src = b.dataset.img; $("#lightbox").classList.add("on"); }));
  }

  $("#lightbox").addEventListener("click", () => $("#lightbox").classList.remove("on"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { $("#lightbox").classList.remove("on"); document.body.classList.remove("menu-open"); } });
  $("#menubtn").addEventListener("click", () => { const open = document.body.classList.toggle("menu-open"); $("#menubtn").setAttribute("aria-expanded", String(open)); });
  $("#drawer").addEventListener("click", e => { if (e.target.id === "drawer") document.body.classList.remove("menu-open"); });
  const top = $("#totop");
  window.addEventListener("scroll", () => top.classList.toggle("on", scrollY > 900), { passive: true });
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("hashchange", render);
  render();
})();
