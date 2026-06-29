/* =====================================================================
   TOASTER STUDIOS — shared site script
   Injects the nav + footer (single source of truth), wires the
   light/dark toggle (DARK is the default), and runs every page
   behavior. All lookups are guarded so this file is safe on any page.
   ===================================================================== */
(function () {
  'use strict';

  var MODE_KEY = 'ts-mode';

  /* ---- Shared nav links. Add a page here and it shows up everywhere. ---- */
  var NAV_LINKS = [
    { key: 'mods',     href: '/mods/',     label: 'Mods' },
    { key: 'studio',   href: '/studio/',   label: 'Studio' },
    { key: 'services', href: '/#services', label: 'Services' },
    { key: 'process',  href: '/#process',  label: 'Process' },
    { key: 'contact',  href: '/contact/',  label: 'Contact' }
  ];

  var page = document.body.getAttribute('data-page') || '';

  /* ---------- inject NAV ---------- */
  function buildNav() {
    var links = NAV_LINKS.map(function (l) {
      var active = l.key === page ? ' aria-current="page"' : '';
      // On the home page, in-page anchors scroll smoothly instead of reloading.
      var href = (page === 'home' && l.href.indexOf('/#') === 0) ? l.href.slice(1) : l.href;
      return '<li><a class="navlink" href="' + href + '"' + active + '>' + l.label + '</a></li>';
    }).join('');

    var isDark = document.documentElement.getAttribute('data-palette') === 'ember';

    var nav = document.createElement('nav');
    nav.className = 'top';
    nav.innerHTML =
      '<div class="wrap">' +
        '<div class="nav-left">' +
          '<a class="brand" href="/">' +
            '<span class="pip" aria-hidden="true"></span>' +
            '<span class="wordmark">Toaster <em>Studios</em></span>' +
          '</a>' +
          '<div class="status" aria-live="polite">' +
            '<span class="dot"></span>' +
            '<span><span id="statusVerb">Toasting</span><span class="status-rest"> · two games · taking requests</span></span>' +
          '</div>' +
        '</div>' +
        '<ul>' + links + '</ul>' +
        '<div class="nav-right">' +
          '<button class="mode-toggle" id="modeToggle" type="button" aria-label="Toggle light or dark mode" aria-pressed="' + (isDark ? 'true' : 'false') + '">' +
            '<span class="mt-knob" aria-hidden="true"></span>' +
            '<span class="mt-label mt-light">Light</span>' +
            '<span class="mt-label mt-dark">Dark</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ---------- inject FOOTER ---------- */
  function buildFooter() {
    var footer = document.createElement('footer');
    footer.innerHTML =
      '<div class="wrap">' +
        '<div class="col left mono">© 2026 Toaster Studios · not affiliated with Mojang or anyone who made The Stanley Parable' +
          '<span class="legal-links"><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/faq/">FAQ</a></span>' +
        '</div>' +
        '<div class="col center mono">Made with butter, Fabric, and a narrator</div>' +
        '<div class="col right mono">' +
          '<a href="https://modrinth.com/user/ToasterStudios" target="_blank" rel="noopener">Modrinth</a> · ' +
          '<a href="https://github.com/ToasterStudiosMods" target="_blank" rel="noopener">GitHub</a> · ' +
          '<a href="https://www.youtube.com/@ToasterStudiosMods" target="_blank" rel="noopener">YouTube</a> · ' +
          '<a href="mailto:toasterstudiosmods+requests@gmail.com">Email</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(footer);
  }

  /* ---------- light / dark toggle (DARK default, persisted) ---------- */
  function wireModeToggle() {
    var btn = document.getElementById('modeToggle');
    if (!btn) return;
    var root = document.documentElement;
    btn.addEventListener('click', function () {
      var nowDark = root.getAttribute('data-palette') !== 'ember';
      root.setAttribute('data-palette', nowDark ? 'ember' : 'toast');
      btn.setAttribute('aria-pressed', nowDark ? 'true' : 'false');
      try { localStorage.setItem(MODE_KEY, nowDark ? 'dark' : 'light'); } catch (e) {}
    });
  }

  /* ---------- random status verb (rare 0.5% KABOOM) ---------- */
  function rollStatusVerb() {
    var el = document.getElementById('statusVerb');
    if (!el) return;
    var verbs = ['Toasting', 'Kibbling', 'Sleeping', 'Chasing that toy', 'Stepping on keyboard', 'Causing errors'];
    if (Math.random() < 0.005) {
      el.textContent = 'Toaster goes KABOOM';
      el.classList.add('kaboom');
    } else {
      el.textContent = verbs[Math.floor(Math.random() * verbs.length)];
    }
  }

  /* ---------- reveal on scroll ---------- */
  function wireReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var revealAll = function () { els.forEach(function (el) { el.classList.add('in'); }); };
    if (!('IntersectionObserver' in window)) { revealAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
    // Failsafe: content must never stay invisible if the observer never
    // fires (e.g. a zero-size viewport). Reveal anything still hidden.
    setTimeout(function () {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  }

  /* ---------- eye-glow follows cursor (home hero) ---------- */
  function wireEyeGlow() {
    var stage = document.getElementById('stage');
    var glow = document.getElementById('eyeglow');
    if (!stage || !glow) return;
    stage.addEventListener('mousemove', function (ev) {
      var r = stage.getBoundingClientRect();
      var cx = r.left + r.width * 0.38;
      var cy = r.top + r.height * 0.42;
      var dx = (ev.clientX - cx) / r.width;
      var dy = (ev.clientY - cy) / r.height;
      var tx = Math.max(-1, Math.min(1, dx)) * 8;
      var ty = Math.max(-1, Math.min(1, dy)) * 6;
      glow.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + (1 + Math.abs(dx) * 0.05) + ')';
    });
    stage.addEventListener('mouseleave', function () { glow.style.transform = ''; });
  }

  /* ---------- crumbs around the cat ---------- */
  function scatterCrumbs() {
    var c = document.getElementById('crumbs');
    if (!c) return;
    for (var i = 0; i < 16; i++) {
      var d = document.createElement('div');
      d.className = 'crumb';
      var r = 2 + Math.random() * 5;
      d.style.left = (Math.random() * 100) + '%';
      d.style.top = (55 + Math.random() * 45) + '%';
      d.style.width = r + 'px';
      d.style.height = (r * 0.6) + 'px';
      d.style.background = 'hsl(' + (30 + Math.random() * 15) + ', ' + (40 + Math.random() * 20) + '%, ' + (30 + Math.random() * 25) + '%)';
      d.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      d.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);
      c.appendChild(d);
    }
  }

  /* ---------- marquee: duplicate content for a seamless loop ---------- */
  function loopMarquee() {
    var m = document.getElementById('marquee');
    if (!m) return;
    m.innerHTML = m.innerHTML + m.innerHTML;
  }

  /* ---------- slot machine (home headline) ---------- */
  function wireSlot() {
    var slot = document.getElementById('slot');
    var track = document.getElementById('slot-track');
    if (!slot || !track) return;
    var words = Array.prototype.slice.call(track.children);
    if (!words.length) return;

    var measure = function () {
      var widths = words.map(function (w) { return w.getBoundingClientRect().width; });
      return Math.ceil(Math.max.apply(null, widths));
    };
    var maxW = measure();
    var idx = 0;
    var setTo = function (i) {
      slot.style.width = maxW + 'px';
      track.style.transform = 'translateY(' + (-i * 0.92) + 'em)';
    };
    setTo(0);

    var rAF;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(function () { maxW = measure(); setTo(idx); });
    });

    setTimeout(function () {
      setInterval(function () {
        idx = (idx + 1) % words.length;
        setTo(idx);
      }, 2200);
    }, 1400);
  }

  /* ---------- smooth scroll for same-page anchors ---------- */
  function wireSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
      });
    });
  }

  /* ---------- count-up animation ---------- */
  function countUp(el, target, duration) {
    if (!el) return;
    var start = parseInt(el.textContent, 10) || 0;
    if (start === target) return;
    if (el._cuRaf) cancelAnimationFrame(el._cuRaf); // cancel any in-flight count
    var dur = duration || Math.max(500, Math.min(1800, Math.abs(target - start) * 28));
    var startTime = performance.now();
    var tick = function (now) {
      var t = Math.min(1, (now - startTime) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (t < 1) el._cuRaf = requestAnimationFrame(tick);
      else { el.textContent = target; el._cuRaf = null; }
    };
    el._cuRaf = requestAnimationFrame(tick);
  }

  function wireCounters() {
    var counts = document.querySelectorAll('.count');
    if (!counts.length) return;
    var run = function (el) { el.dataset.counted = '1'; countUp(el, parseInt(el.dataset.countTo, 10) || 0); };
    if (!('IntersectionObserver' in window)) { counts.forEach(run); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    counts.forEach(function (el) { obs.observe(el); });
    // Failsafe: a number must never stay stuck at 0 if the observer never
    // fires. countUp() is a no-op for any counter already at its target.
    setTimeout(function () {
      counts.forEach(function (el) { obs.unobserve(el); run(el); });
    }, 2500);
  }

  /* ---------- relative "joined" date (never goes stale) ----------
     Renders the studio's real Modrinth join date as "X months ago" into
     every .js-joined element. Falls back to a baked-in date if the API is
     unreachable, so it's still roughly right offline. */
  var JOINED_FALLBACK = '2026-02-25T00:06:12Z';
  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    var days = Math.floor((Date.now() - then) / 86400000);
    if (days < 0) return null;
    if (days < 10) return days <= 1 ? 'this week' : days + ' days ago';
    if (days < 56) return Math.round(days / 7) + ' weeks ago';
    var months = Math.round(days / 30.44);
    if (months < 18) return Math.max(1, months) + (months === 1 ? ' month ago' : ' months ago');
    var years = Math.floor(days / 365.25);
    return years + (years === 1 ? ' year ago' : ' years ago');
  }
  function setJoined(iso) {
    var txt = timeAgo(iso);
    if (!txt) return;
    document.querySelectorAll('.js-joined').forEach(function (el) { el.textContent = txt; });
  }
  function wireJoined() {
    if (!document.querySelector('.js-joined')) return;
    setJoined(JOINED_FALLBACK); // paint immediately from the baked-in date
    fetch('https://api.modrinth.com/v2/user/ToasterStudios', { headers: { 'Accept': 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('http ' + res.status); return res.json(); })
      .then(function (u) { if (u && u.created) setJoined(u.created); })
      .catch(function () { /* silent — fallback text stands */ });
  }

  /* ---------- live Modrinth stats ----------
     Totals + the live mod count are mirrored into EVERY matching element
     (.js-dl-total, .js-modcount) so the stat bar, the game tiles, and the
     studio block all stay in sync. Per-mod counts use their ids. */
  function wireModrinth() {
    var totalEls = document.querySelectorAll('.js-dl-total');
    var modCountEls = document.querySelectorAll('.js-modcount');
    var jengaDlEl = document.getElementById('jengaDownloads');
    var offgridDlEl = document.getElementById('offgridDownloads');
    var steveDlEl = document.getElementById('steveDownloads');
    if (!totalEls.length && !modCountEls.length && !jengaDlEl && !offgridDlEl && !steveDlEl) return;

    var last = { total: null, jenga: null, offgrid: null, steve: null, mods: null };

    function bumpOne(el, value, changed) {
      el.dataset.countTo = String(value);       // becomes the count-up target
      // If the number is already on screen (scroll count-up ran), repaint it
      // to the live value now. Otherwise leave it for the observer to count up.
      if (el.dataset.counted === '1') {
        countUp(el, value, changed ? 700 : null);
        if (changed) {
          el.classList.add('bumping');
          setTimeout(function () { el.classList.remove('bumping'); }, 900);
        }
      }
    }
    function bump(els, value, key) {
      if (!els || (els.length === 0 && !els.dataset)) return;
      if (last[key] === value) return;          // unchanged since we last set it
      var changed = last[key] !== null;         // a real change during polling
      last[key] = value;
      if (els.dataset) { bumpOne(els, value, changed); return; }   // single element
      els.forEach(function (el) { bumpOne(el, value, changed); }); // NodeList
    }

    function fetchStats() {
      fetch('https://api.modrinth.com/v2/user/ToasterStudios/projects', { headers: { 'Accept': 'application/json' } })
        .then(function (res) { if (!res.ok) throw new Error('http ' + res.status); return res.json(); })
        .then(function (projects) {
          var total = projects.reduce(function (s, p) { return s + (p.downloads || 0); }, 0);
          bump(totalEls, total, 'total');
          bump(modCountEls, projects.length, 'mods');
          var jenga = projects.find(function (p) { return /jenga/i.test(p.slug || p.title || ''); });
          if (jenga && jengaDlEl) bump(jengaDlEl, jenga.downloads || 0, 'jenga');
          var offgrid = projects.find(function (p) { return /off.?da.?grid|grid.?blocks/i.test(p.slug || p.title || ''); });
          if (offgrid && offgridDlEl) bump(offgridDlEl, offgrid.downloads || 0, 'offgrid');
          var steve = projects.find(function (p) { return /steve.?parable/i.test(p.slug || p.title || ''); });
          if (steve && steveDlEl) bump(steveDlEl, steve.downloads || 0, 'steve');
        })
        .catch(function () { /* silent — markup numbers stand */ });
    }

    fetchStats();
    setInterval(function () { if (document.visibilityState === 'visible') fetchStats(); }, 30000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') fetchStats();
    });
  }

  /* ---------- Tawk.to live chat (site-wide) ---------- */
  function loadTawk() {
    // Allow disabling the chat widget for screenshots / automated testing.
    if (/[?&]nochat\b/.test(location.search)) return;
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    var s1 = document.createElement('script');
    var s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/697a0d47324aa2197d409594/1jg2c7o0t';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  }

  /* ---------- boot ---------- */
  buildNav();
  buildFooter();
  wireModeToggle();
  rollStatusVerb();
  wireReveal();
  wireEyeGlow();
  scatterCrumbs();
  loopMarquee();
  wireSlot();
  wireSmoothScroll();
  wireCounters();
  wireJoined();
  wireModrinth();
  loadTawk();
})();
