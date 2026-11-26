/* Browser check for every route, on desktop and phone.
   Run:  node tools/e2e.js [screenshot-dir]      (from ims-program/)
   Checks: console and page errors, horizontal overflow, broken images,
   internal links resolve, every button can be clicked, direct links,
   refresh, back/forward, unknown routes, menus, filters, search, sorting,
   board reconciliation, heat map, decision and risk details. */
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const out = process.argv[2] || null;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p.replace(/^\/ims-program/, ""));
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});
const results = [];
let problems = 0;
const check = (name, ok, detail = "") => { results.push([name, ok]); if (!ok) { problems++; console.log("FAIL", name, detail); } };

(async () => {
  await new Promise(r => server.listen(8765, r));
  const base = "http://localhost:8765/ims-program/";
  const chapters = ["overview", "case", "portfolio", "model", "tech", "delivery", "results", "decisions"];
  const projects = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"];
  const caps = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"];
  const routes = [...chapters.map(c => "#/" + c), ...projects.map(p => "#/portfolio/" + p), ...caps.map(c => "#/portfolio/" + c)];
  const b = await chromium.launch();
  let clicks = 0;
  for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
    const page = await b.newPage({ viewport: vp });
    const errs = []; page.on("pageerror", e => errs.push("pageerror " + e.message)); page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) errs.push("console " + m.text()); });
    for (const r of routes) {
      await page.goto(base + r); await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" }); await page.waitForTimeout(200);
      const info = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth, vw = window.innerWidth;
        const badImg = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map(i => i.getAttribute("src"));
        const links = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute("href"));
        const wide = sw > vw ? [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && !e.closest(".tbl,.subnav,.tabs,.pm-tw,.pm-gantt,.pj-toc") && getComputedStyle(e).position !== "fixed"; }).slice(0, 5).map(e => e.className || e.tagName) : [];
        return { sw, vw, badImg, links, wide, h1: (document.querySelector("h1") || {}).textContent, notFound: /does not exist/.test(document.body.textContent) };
      });
      const bad = info.links.filter(l => { if (!l.startsWith("#/")) return true; const [c, p, x] = l.slice(2).split("/"); return !chapters.includes(c) || (p && !(c === "portfolio" && (projects.includes(p) || caps.includes(p)))) || x !== undefined; });
      check(`[${name}] ${r} no horizontal overflow`, info.sw <= info.vw, `${info.sw}>${info.vw} ${JSON.stringify(info.wide)}`);
      check(`[${name}] ${r} images load`, !info.badImg.length, JSON.stringify(info.badImg));
      check(`[${name}] ${r} internal links valid`, !bad.length, JSON.stringify(bad));
      check(`[${name}] ${r} renders a page`, !!info.h1 && !info.notFound);
      /* click every visible in-page button */
      const btns = await page.$$("main button");
      for (const bt of btns) { if (await bt.isVisible() && await bt.isEnabled()) { const label = (await bt.textContent()).trim().slice(0, 40); await bt.click({ timeout: 2000 }).catch(e => check(`[${name}] ${r} click "${label}"`, false, e.message.split("\n")[0])); clicks++; await page.evaluate(() => document.getElementById("lightbox").classList.remove("on")); } }
      /* open every summary (details) */
      const sums = await page.$$("main summary"); for (const s of sums.slice(0, 40)) if (await s.isVisible()) { await s.click({ timeout: 2000 }).catch(() => check(`[${name}] ${r} open details`, false)); clicks++; }
      const sel = await page.$("#pdept"); if (sel) { await sel.selectOption({ index: 1 }); clicks++; }
    }

    /* ---------- functional checks ---------- */
    const go = async h => { await page.goto(base + h); await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" }); await page.waitForTimeout(200); };
    const h1 = () => page.$eval("h1", e => e.textContent);
    await go("#/overview");
    /* KPI and board reconciliation */
    const recon = await page.evaluate(() => { const counts = [...document.querySelectorAll(".pm-col [data-count]")].map(e => +e.textContent); const total = +[...document.querySelectorAll(".pm-kpi")].find(k => /Initiatives/.test(k.textContent)).querySelector("b").textContent; return { sum: counts.reduce((a, b) => a + b, 0), total, ok: document.querySelector(".pm-recon").classList.contains("ok"), cols: counts.length, cards: document.querySelectorAll(".pm-kc").length }; });
    check(`[${name}] board columns add up to the initiative KPI`, recon.sum === recon.total && recon.ok && recon.cards === recon.total, JSON.stringify(recon));
    check(`[${name}] board has a Blocked column`, await page.$('.pm-col[data-col="blocked"]') !== null);
    /* register search and sort */
    await page.fill("#psearch", "payment"); await page.waitForTimeout(50);
    const vis = await page.$$eval("tr.pm-prow2:not(.hidden)", rs => rs.map(r => r.dataset.id));
    check(`[${name}] register search`, vis.length === 1 && vis[0] === "P05", JSON.stringify(vis));
    await page.fill("#psearch", ""); await page.dispatchEvent("#psearch", "input");
    await page.selectOption("#pstatus", "approval");
    const st = await page.$$eval("tr.pm-prow2:not(.hidden)", rs => rs.map(r => r.dataset.status));
    check(`[${name}] register status filter`, st.length > 0 && st.every(s => s === "approval"), JSON.stringify(st));
    await page.selectOption("#pstatus", "all");
    await page.click('#ptable th[data-sort="pct"]'); await page.click('#ptable th[data-sort="pct"]');
    const pcts = await page.$$eval("tr.pm-prow2", rs => rs.map(r => +r.dataset.pct));
    check(`[${name}] register sort by gate progress`, pcts.every((v, i) => !i || pcts[i - 1] >= v), JSON.stringify(pcts));
    await page.click('[data-exp="P05"]');
    check(`[${name}] register row details open`, await page.isVisible('tr[data-for="P05"]'));
    /* board filter and capability link */
    await page.selectOption("#kparent", "C4");
    const c4 = await page.$$eval(".pm-kc:not(.hidden)", cs => cs.map(c => c.dataset.parent));
    check(`[${name}] board filter by capability`, c4.length === 2 && c4.every(x => x === "C4"), JSON.stringify(c4));
    await page.click('.pm-kc[data-parent="C4"] summary');
    await page.click('.pm-kc[data-parent="C4"][open] a[href="#/portfolio/C4"]'); await page.waitForTimeout(200);
    check(`[${name}] capability link opens the capability page`, (await h1()).includes("Knowledge Management"), await h1());
    /* back / forward */
    await page.goBack(); await page.waitForTimeout(200);
    check(`[${name}] browser back`, page.url().endsWith("#/overview") && (await h1()).includes("IMS Transformation"), page.url());
    await page.goForward(); await page.waitForTimeout(200);
    check(`[${name}] browser forward`, page.url().endsWith("#/portfolio/C4"), page.url());
    /* refresh on a deep link */
    await go("#/portfolio/P05"); await page.reload(); await page.waitForTimeout(250);
    check(`[${name}] refresh keeps the deep link`, (await h1()).includes("Payment"), await h1());
    check(`[${name}] project page has 20 sections`, (await page.$$(".pj-sec")).length === 20);
    /* unknown routes */
    for (const bad of ["#/nothing", "#/portfolio/P99", "#/portfolio/P01/extra"]) { await go(bad); check(`[${name}] unknown route ${bad} shows "not found"`, (await h1()).includes("does not exist")); }
    /* heat map and decisions */
    await go("#/overview");
    const cellOk = await page.evaluate(() => { const b = document.querySelector('.pm-hg button[data-cell="HH"]'); b.click(); const n = [...document.querySelectorAll("#rlist li")].filter(l => !l.classList.contains("hidden")).length; return { n, want: +b.textContent }; });
    check(`[${name}] heat map cell lists its risks`, cellOk.n === cellOk.want && cellOk.n > 0, JSON.stringify(cellOk));
    const decOk = await page.evaluate(() => { const act = document.querySelectorAll("#dtable tr[data-act='1']:not(.hidden)").length, all = IMS.decisions.filter(d => IMS.DSTATUS[d[6]][2]).length; return { act, all }; });
    check(`[${name}] decisions needing action match the data`, decOk.act === decOk.all, JSON.stringify(decOk));
    await page.click('[data-dexp="D-01"]');
    check(`[${name}] decision details open`, await page.isVisible('tr[data-dfor="D-01"]'));
    /* risk link to the full record */
    await page.evaluate(() => { document.querySelector("#rall").click(); document.querySelector('#rlist details').open = true; });
    await page.click('#rlist details[open] a[data-goto^="risk-"]'); await page.waitForTimeout(300);
    check(`[${name}] risk link opens the risk register at that risk`, page.url().endsWith("#/delivery") && await page.isVisible("#risk-R-01"), page.url());
    /* menus */
    if (name === "phone") { await go("#/overview"); await page.click("#menubtn"); const v = await page.isVisible("#drawer nav a[data-ch=tech]"); check("[phone] mobile menu opens", v); if (v) { await page.click("#drawer nav a[data-ch=tech]"); await page.waitForTimeout(200); check("[phone] mobile menu link", page.url().endsWith("#/tech")); } }
    else { await go("#/overview"); await page.click("#chapnav a[data-ch=decisions]"); await page.waitForTimeout(200); check("[desktop] chapter menu link", page.url().endsWith("#/decisions")); await page.click('#decf [data-dk="open"]'); check("[desktop] decision status filter", (await page.$$(".dcard:not(.hidden)")).length === (await page.evaluate(() => IMS.decisions.filter(d => d[6] === "open").length))); }

    /* screenshots */
    if (out) {
      const shot = async (h, file, sel, full) => { await go(h); await page.waitForTimeout(250); if (sel) { const el = await page.$(sel); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: path.join(out, file) }); } else await page.screenshot({ path: path.join(out, file), fullPage: !!full }); };
      if (name === "desktop") {
        await shot("#/overview", "01-overview-cockpit.png", null, false);
        await shot("#/overview", "01b-overview-full-page.png", null, true);
        await shot("#/overview", "02-project-register.png", "#projects .pm-card");
        await shot("#/overview", "03-initiative-board.png", "#tasks .pm-card");
        await shot("#/overview", "04-gantt-timeline.png", "#timeline .pm-card");
        await shot("#/portfolio/P05", "05-project-page-P05.png", null, true);
        await shot("#/tech", "06-technology-architecture.png", "#architecture");
        await shot("#/decisions", "07-management-decisions.png", "#decisions");
        await shot("#/delivery", "09-production-readiness.png", "#readiness");
      } else await shot("#/overview", "08-mobile-overview.png", null, true);
    }
    errs.forEach(e => check(`[${name}] no console errors`, false, e));
    await page.close();
  }
  await b.close(); server.close();
  const passed = results.filter(r => r[1]).length;
  console.log(`Routes ${routes.length} × 2 viewports · buttons and details clicked ${clicks} · checks ${passed}/${results.length} passed · problems ${problems}`);
  process.exit(problems ? 1 : 0);
})();
