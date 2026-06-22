/* ============================================================
   哈Net 首頁 — W「西海岸・側邊欄」  互動腳本 (vanilla JS)
   側邊欄子選單就地展開 / 手機抽屜 / Hero 輪播 / 捲動淡入 /
   count-up / FAQ 手風琴
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. 側邊欄子選單：就地展開 accordion ---------- */
    var sideToggles = document.querySelectorAll('.side-group > .side-toggle');
    sideToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.parentElement;
        var willOpen = !group.classList.contains('open');
        group.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    /* ---------- 2. 手機抽屜：開合側邊欄 ---------- */
    var sidebar = document.getElementById('sidebar');
    var hamburger = document.getElementById('hamburger');
    var scrim = document.getElementById('drawerScrim');

    function openDrawer() {
      sidebar.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      scrim.hidden = false;
      // 強制 reflow 讓過場生效
      void scrim.offsetWidth;
      scrim.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      sidebar.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      scrim.classList.remove('show');
      document.body.style.overflow = '';
      // 過場結束後隱藏遮罩
      window.setTimeout(function () {
        if (!sidebar.classList.contains('open')) scrim.hidden = true;
      }, 300);
    }

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        if (sidebar.classList.contains('open')) closeDrawer(); else openDrawer();
      });
    }
    if (scrim) scrim.addEventListener('click', closeDrawer);

    // 抽屜內點任一連結就關閉（手機）
    var mqMobile = window.matchMedia('(max-width:980px)');
    sidebar.querySelectorAll('.side-nav a, .side-foot a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (mqMobile.matches) closeDrawer();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
    // 切回桌機時重置抽屜狀態
    mqMobile.addEventListener('change', function (e) {
      if (!e.matches) closeDrawer();
    });

    /* ---------- 3. Hero 輪播 ---------- */
    var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    var heroEl = document.getElementById('hero');
    var current = 0;
    var timer = null;
    var INTERVAL = 5500;

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
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('active');
      if (userTriggered) restart();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function start() { if (slides.length > 1 && !timer) timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stop);
      heroEl.addEventListener('mouseleave', start);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();

    /* ---------- 4. 捲動淡入 (IntersectionObserver) ---------- */
    var reveals = document.querySelectorAll('.reveal');
    document.querySelectorAll('.prod-grid, .news-grid, .plan-grid, .quick-grid, .stats, .faq-list').forEach(function (grid) {
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

    function formatNum(n) { return n.toLocaleString('en-US'); }
    function runCount(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / DURATION, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNum(Math.floor(eased * target)) + suffix;
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

    /* ---------- 6. FAQ 手風琴 ---------- */
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      q.addEventListener('click', function () {
        var willOpen = !item.classList.contains('open');
        // 單開：先收合其他
        faqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            var ob = other.querySelector('.faq-q');
            var oa = other.querySelector('.faq-a');
            if (ob) ob.setAttribute('aria-expanded', 'false');
            if (oa) oa.style.maxHeight = null;
          }
        });
        item.classList.toggle('open', willOpen);
        q.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        a.style.maxHeight = willOpen ? (a.scrollHeight + 'px') : null;
      });
    });

  });
})();
