/* ============================================================
   哈Net — E 方案首頁互動
   導覽列捲動變化 · 手機選單 · 捲動淡入 · 數據 count-up
   純 vanilla JS，無外部相依
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 導覽列捲動變化 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 手機漢堡選單 ---------- */
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');
  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', function () {
    var open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navMenu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  /* ---------- 捲動淡入（IntersectionObserver） ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // 同一群組依序錯開進場
          var siblings = el.parentElement
            ? Array.prototype.indexOf.call(el.parentElement.children, el)
            : 0;
          el.style.transitionDelay = Math.min(siblings, 5) * 70 + 'ms';
          el.classList.add('in');
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 數據 count-up ---------- */
  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = formatNum(parseInt(el.getAttribute('data-count'), 10) || 0);
    });
  }

  /* ---------- 年份自動更新（footer） ---------- */
  // 保留 2026 文案，如需動態可在此擴充。
})();
