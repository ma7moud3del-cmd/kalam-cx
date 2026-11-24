/* Kalam Learning moved from GitHub Pages (ma7moud3del-cmd.github.io/kalam-cx) to Cloudflare Pages on 2026-11-23.
   This plain script runs first, before the app, on both addresses (the same index.html is served by both).

   Old address: forward to the new one. Progress saved in this browser goes along in the # part of the link, which
   browsers never send to any server. Only the four Kalam keys are sent, each checked first, and only if it fits.
   New address: a #carry link is accepted only when ALL of these hold, otherwise it is ignored:
     - the visitor really came from the old address (document.referrer is its origin; another site can't fake that),
     - it is before UNTIL (after that date this part can be deleted: everyone who still uses the old link has moved),
     - each value has the shape the site saves (see progress/store.js), and is under MAX characters.
   It never overwrites: only keys this browser doesn't have yet are filled. Then the link is cleaned at once
   (history.replaceState), so the data doesn't stay in the address bar, history or a copied link.
   The ?v= on this file is the release version, so changes reach browsers that cached an older copy. */
(function () {
  var NEW = 'https://kalam-learning.pages.dev/', OLD = 'ma7moud3del-cmd.github.io';
  var UNTIL = Date.UTC(2027, 2, 1), MAX = 60000;   /* 1 March 2027; ~60 KB is far above real progress and safe for links */
  var obj = function (v) { var o = JSON.parse(v); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; };
  var CHECK = {
    'kalam.academy.v2': function (v) { var o = obj(v); return !!o && o.v === 2 && !!obj(JSON.stringify(o.courses || null)); },
    'kalamAcademy': function (v) { return !!obj(v); },
    'kalam.prefs': function (v) { var o = obj(v); return !!o && Object.keys(o).every(function (k) { return k === 'rate' && typeof o.rate === 'number' && o.rate >= 0.25 && o.rate <= 4; }); },
    'kalam.sidebar': function (v) { return v === 'open' || v === 'closed'; }
  };
  var KEYS = Object.keys(CHECK);
  var ok = function (k, v) { try { return typeof v === 'string' && v.length < MAX && CHECK[k](v); } catch (e) { return false; } };
  /* only page addresses are passed on (#/excel/learn/s1-v01, #/explore?q=…, or the first site's #session-2), never a #carry link */
  var route = function (h) { return /^#(\/[\w\-\/?=&%.+~]*|[\w-]+)?$/.test(h || '') ? h : ''; };
  var clean = function (to) { try { history.replaceState(null, '', location.pathname + location.search + to); } catch (e) {} };

  if (location.hostname === OLD) {
    var d = {}, n = 0;
    KEYS.forEach(function (k) { try { var v = localStorage.getItem(k); if (ok(k, v)) { d[k] = v; n++; } } catch (e) {} });
    var to = route(location.hash), pack = n ? encodeURIComponent(JSON.stringify(d)) : '';
    document.documentElement.style.display = 'none';
    location.replace(NEW + (pack && pack.length < MAX ? '#carry=' + pack + (to ? '&to=' + encodeURIComponent(to) : '') : to));
  } else if (location.hash.indexOf('#carry=') === 0) {
    var m = location.hash.match(/^#carry=([^&]*)(?:&to=(.*))?$/), dest = '';
    try { dest = route(decodeURIComponent((m && m[2]) || '')); } catch (e) { dest = ''; }
    var fromOld = (document.referrer || '').indexOf('https://' + OLD + '/') === 0;
    if (m && fromOld && Date.now() < UNTIL && m[1].length < MAX) {
      try {
        var data = obj(decodeURIComponent(m[1]));
        if (data) KEYS.forEach(function (k) { try { if (ok(k, data[k]) && !localStorage.getItem(k)) localStorage.setItem(k, data[k]); } catch (e) {} });
      } catch (e) { /* a broken link: ignore it */ }
    }
    clean(dest);
  }
})();
