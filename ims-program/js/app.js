/* Router and interactions. Routes: #/<chapter> and #/portfolio/<project id> */
(function () {
  const { $, $$, esc } = UI;
  const CH = window.CHAPTERS;
  const nav = $("#chapnav"), drawer = $("#drawer nav"), main = $("#main");

  nav.innerHTML = CH.map(c => `<a href="#/${c.id}" data-ch="${c.id}"><span>${c.no}</span>${esc(c.nav)}</a>`).join("");
  drawer.innerHTML = CH.map(c => `<a href="#/${c.id}" data-ch="${c.id}"><span>${c.no}</span>${esc(c.title)}</a>`).join("");

  const subnav = (c) => `<div class="subnav" role="navigation" aria-label="Sections in this chapter">${c.sections.map((s, i) => `<button data-sec="${s[0]}" class="${i ? "" : "on"}">${esc(s[1])}</button>`).join("")}</div>`;

  function render() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    let c = CH.find(x => x.id === parts[0]) || CH[0];
    let html = "", title = c.title;
    const proj = c.id === "portfolio" && parts[1] ? IMS.projects.find(p => p.id === parts[1].toUpperCase()) : null;
    if (proj) {
      const v = c.project(proj); html = v.head + v.body; title = proj.id + " " + proj.name;
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
    const goto = sessionStorage.getItem("goto"); if (goto) { sessionStorage.removeItem("goto"); const t = document.getElementById(goto); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  }

  function wire(c) {
    /* section sub-navigation: scroll, and highlight the section in view */
    const btns = $$(".subnav [data-sec]");
    btns.forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.sec); if (t) t.scrollIntoView({ behavior: "smooth" }); }));
    if (btns.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) btns.forEach(b => b.classList.toggle("on", b.dataset.sec === e.target.id)); }), { rootMargin: "-130px 0px -60% 0px" });
      btns.forEach(b => { const t = document.getElementById(b.dataset.sec); if (t) io.observe(t); });
    }
    /* links to a section inside another chapter */
    $$("[data-goto]").forEach(a => a.addEventListener("click", () => sessionStorage.setItem("goto", a.dataset.goto)));

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
    $$("#kfilters .fbtn").forEach(b => b.addEventListener("click", () => { $$("#kfilters .fbtn").forEach(x => x.classList.toggle("on", x === b)); const cat = b.dataset.c; $$(".risktbl tbody tr").forEach(r => r.classList.toggle("hidden", cat !== "all" && r.children[1].textContent !== cat)); }));
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
