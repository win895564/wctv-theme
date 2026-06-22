
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 24) header.classList.add('shrink');
    else header.classList.remove('shrink');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  var subItems = Array.prototype.slice.call(menu.querySelectorAll('.nav-item.has-sub'));
  var MOBILE_NAV = '(max-width:860px)';

  function isMobileNav() {
    return window.matchMedia(MOBILE_NAV).matches;
  }
  function closeAllSubs() {
    subItems.forEach(function (it) {
      it.classList.remove('open');
      var p = it.querySelector('.nav-parent');
      if (p) p.setAttribute('aria-expanded', 'false');
    });
  }
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    closeAllSubs();
  }
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (!open) closeAllSubs();
  });

  subItems.forEach(function (it) {
    var parent = it.querySelector('.nav-parent');
    if (!parent) return;
    parent.addEventListener('click', function (e) {
      if (isMobileNav()) {
        e.preventDefault();
        var willOpen = !it.classList.contains('open');
        closeAllSubs();
        it.classList.toggle('open', willOpen);
        parent.setAttribute('aria-expanded', String(willOpen));
      }
    });
  });

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.classList.contains('nav-parent') && isMobileNav()) return;
      closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (!isMobileNav()) { menu.classList.remove('open'); toggle.classList.remove('open'); closeAllSubs(); }
  });

  var track = document.getElementById('heroTrack');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
  var dotsWrap = document.getElementById('heroDots');
  var idxEl = document.getElementById('heroIndex');
  var prevBtn = document.getElementById('heroPrev');
  var nextBtn = document.getElementById('heroNext');
  var current = 0;
  var timer = null;
  var INTERVAL = 5000;
  var pad = function (n) { return (n + 1 < 10 ? '0' : '') + (n + 1); };

  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', '第 ' + (i + 1) + ' 張');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', function () { go(i, true); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function go(n, manual) {
    current = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    if (idxEl) idxEl.textContent = pad(current);
    if (manual) restart();
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function start() { timer = window.setInterval(next, INTERVAL); }
  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  nextBtn.addEventListener('click', function () { next(); restart(); });
  prevBtn.addEventListener('click', function () { prev(); restart(); });

  var hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { next(); restart(); }
    else if (e.key === 'ArrowLeft') { prev(); restart(); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  if (slides.length > 1) start();

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  var statsWrap = document.getElementById('stats');
  var counted = false;
  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function runCount() {
    if (counted) return;
    counted = true;
    var nums = statsWrap.querySelectorAll('.stat-num');
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var dur = 1600;
      var t0 = null;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = formatNum(Math.floor(eased * target));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = formatNum(target);
      }
      requestAnimationFrame(tick);
    });
  }
  if (statsWrap) {
    if ('IntersectionObserver' in window) {
      var statObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(); statObs.disconnect(); }
        });
      }, { threshold: 0.4 });
      statObs.observe(statsWrap);
    } else {
      runCount();
    }
  }

})();
