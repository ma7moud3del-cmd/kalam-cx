/* Browser check for every route, on desktop and phone.
   Run from the repo root:  node ims-program/tools/e2e.js [outdir]
   Checks: console and page errors, horizontal overflow, broken images,
   internal links point to real routes, every button can be clicked. */
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
(async () => {
  await new Promise(r => server.listen(8765, r));
  const base = "http://localhost:8765/ims-program/";
  const chapters = ["overview", "case", "portfolio", "model", "tech", "delivery", "results", "decisions"];
  const projects = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"];
  const routes = [...chapters.map(c => "#/" + c), ...projects.map(p => "#/portfolio/" + p)];
  const b = await chromium.launch();
  let problems = 0, clicks = 0;
  for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
    const page = await b.newPage({ viewport: vp });
    const errs = []; page.on("pageerror", e => errs.push("pageerror " + e.message)); page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text())) errs.push("console " + m.text()); });
    for (const r of routes) {
      await page.goto(base + r); await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" }); await page.waitForTimeout(250);
      const info = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth, vw = window.innerWidth;
        const badImg = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map(i => i.getAttribute("src"));
        const links = [...document.querySelectorAll('a[href^="#/"]')].map(a => a.getAttribute("href"));
        const wide = sw > vw ? [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && !e.closest(".tbl,.subnav,.tabs") && getComputedStyle(e).position !== "fixed"; }).slice(0, 5).map(e => e.className || e.tagName) : [];
        return { sw, vw, badImg, links, wide, h1: (document.querySelector("h1") || {}).textContent };
      });
      const valid = info.links.filter(l => { const [c, p] = l.slice(2).split("/"); return !chapters.includes(c) || (p && !projects.includes(p)); });
      if (info.sw > info.vw) { problems++; console.log(`[${name}] ${r} horizontal overflow ${info.sw}>${info.vw}`, info.wide); }
      if (info.badImg.length) { problems++; console.log(`[${name}] ${r} broken images`, info.badImg); }
      if (valid.length) { problems++; console.log(`[${name}] ${r} bad links`, valid); }
      if (!info.h1) { problems++; console.log(`[${name}] ${r} no h1`); }
      /* click every in-page button */
      const btns = await page.$$("main button");
      for (const bt of btns) { if (await bt.isVisible()) { const label = (await bt.textContent()).trim().slice(0, 40); await bt.click({ timeout: 2000 }).catch(e => { problems++; console.log(`[${name}] ${r} click failed on "${label}"`, e.message.split("\n").filter(l=>/intercept|not stable|visible/.test(l)).slice(-2).join(" | ")); }); clicks++; await page.evaluate(() => { const l = document.getElementById("lightbox"); if (l.classList.contains("on")) { window.__lb = (window.__lb || 0) + 1; l.classList.remove("on"); } }); } }
      await page.evaluate(() => document.getElementById("lightbox").classList.remove("on"));
      const sel = await page.$("#pdept"); if (sel) { await sel.selectOption({ index: 1 }); clicks++; }
      if (out && name === "desktop") { await page.goto(base + r); await page.waitForTimeout(200); await page.screenshot({ path: path.join(out, `d_${r.replace(/[#/]/g, "_")}.png`), fullPage: true }); }
      if (out && name === "phone" && (r === "#/overview" || r === "#/portfolio/P05" || r === "#/delivery")) { await page.goto(base + r); await page.waitForTimeout(200); await page.screenshot({ path: path.join(out, `m_${r.replace(/[#/]/g, "_")}.png`), fullPage: true }); }
    }
    /* mobile menu */
    if (name === "phone") { await page.goto(base + "#/overview"); await page.click("#menubtn"); const vis = await page.isVisible("#drawer nav a[data-ch=tech]"); if (!vis) { problems++; console.log("phone menu did not open"); } else { await page.click("#drawer nav a[data-ch=tech]"); await page.waitForTimeout(200); if (!(await page.url()).endsWith("#/tech")) { problems++; console.log("menu link failed"); } } }
    errs.forEach(e => { problems++; console.log(`[${name}]`, e); });
    await page.close();
  }
  await b.close(); server.close();
  console.log(`Routes ${routes.length} × 2 viewports · buttons clicked ${clicks} · problems ${problems}`);
  process.exit(problems ? 1 : 0);
})();
