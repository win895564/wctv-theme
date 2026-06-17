/* ============================================================
   哈Net 首頁 — A 沉穩專業  互動腳本 (vanilla JS)
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. 導覽列：捲動縮高 + 陰影 ---------- */
    var header = document.getElementById('siteHeader');
    function onScroll() {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 2. 漢堡選單 ---------- */
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    // 動態建立遮罩
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      menu.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* ---------- 3. Hero 輪播 ---------- */
    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    var heroEl = document.getElementById('hero');
    var current = 0;
    var timer = null;
    var INTERVAL = 5000;

    // 建立圓點
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 張');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function () { goTo(i, true); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(idx, userTriggered) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('active');
      if (userTriggered) restart();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function start() { timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    nextBtn.addEventListener('click', function () { next(); restart(); });
    prevBtn.addEventListener('click', function () { prev(); restart(); });

    // 滑入暫停
    heroEl.addEventListener('mouseenter', stop);
    heroEl.addEventListener('mouseleave', start);

    // 分頁切走時暫停，避免堆積
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if (slides.length > 1) start();

    /* ---------- 4. 捲動淡入 (IntersectionObserver) ---------- */
    var reveals = document.querySelectorAll('.reveal');

    // 為同一容器內的卡片加上漸進延遲
    document.querySelectorAll('.service-grid, .news-grid, .feature-grid, .quick-grid, .stats').forEach(function (grid) {
      var kids = grid.querySelectorAll('.reveal');
      kids.forEach(function (el, i) { el.setAttribute('data-d', String((i % 4) + 1)); });
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- 5. 數據 count-up ---------- */
    var statNums = document.querySelectorAll('.stat-num');
    var DURATION = 1800;

    function formatNum(n) {
      return n.toLocaleString('en-US');
    }
    function runCount(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / DURATION, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.floor(eased * target);
        el.textContent = formatNum(val) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNum(target) + suffix;
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && statNums.length) {
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            runCount(en.target);
            statIO.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      statNums.forEach(function (el) { statIO.observe(el); });
    } else {
      statNums.forEach(function (el) {
        el.textContent = formatNum(parseInt(el.getAttribute('data-target'), 10) || 0) + (el.getAttribute('data-suffix') || '');
      });
    }

  });
})();
