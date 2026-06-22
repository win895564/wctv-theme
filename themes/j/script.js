
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  onScrollNav();

  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var backdrop = null;
  if (drawer) {
    backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function toggleDrawer() {
    if (!drawer) return;
    var open = drawer.classList.toggle('is-open');
    if (backdrop) backdrop.classList.toggle('is-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger) burger.addEventListener('click', toggleDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  if (drawer) {
    drawer.querySelectorAll('.drawer__parent').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = btn.nextElementSibling;
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (sub) sub.classList.toggle('is-open', !open);
      });
    });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReduced) { el.textContent = formatNum(target) + suffix; return; }
    var dur = 1700;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); } // easeOutCubic
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = Math.round(ease(p) * target);
      el.textContent = formatNum(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCount);
  } else {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          cntObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cntObs.observe(el); });
  }

  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      var rect = el.parentElement.getBoundingClientRect();

      var offset = (rect.top + rect.height / 2) - vh / 2;
      var shift = -offset * speed;
      el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  function requestParallax() {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }

  function onScroll() {
    onScrollNav();
    if (!prefersReduced) requestParallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    if (!prefersReduced) requestParallax();
  }, { passive: true });

  if (!prefersReduced) updateParallax();
})();
