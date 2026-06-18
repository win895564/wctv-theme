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
    if (e.target.closest('a')) closeMenu();
  });

  /* ---------- 子選單折疊（手機點擊展開；桌機交給 CSS :hover） ---------- */
  var navGroups = Array.prototype.slice.call(navMenu.querySelectorAll('.nav-group'));
  var MOBILE_NAV = '(max-width:760px)';
  navGroups.forEach(function (group) {
    var toggle = group.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      if (!window.matchMedia(MOBILE_NAV).matches) return;
      var open = group.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // 手風琴：同時只開一個
      navGroups.forEach(function (g) {
        if (g !== group) {
          g.classList.remove('open');
          var t = g.querySelector('.nav-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
  // 關閉手機選單時一併收起所有子選單
  var _closeMenu = closeMenu;
  closeMenu = function () {
    _closeMenu();
    navGroups.forEach(function (g) {
      g.classList.remove('open');
      var t = g.querySelector('.nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  };

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

  /* ---------- Hero 輪播（固定模板＝精選文章） ---------- */
  (function () {
    var carousel = document.getElementById('heroCarousel');
    var track = document.getElementById('heroTrack');
    if (!carousel || !track) return;
    var slides = Array.prototype.slice.call(track.children);
    if (slides.length === 0) return;

    var dotsWrap = document.getElementById('heroDots');
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    var index = 0;
    var timer = null;
    var DELAY = 6000;

    // 建立指示點
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', '第 ' + (i + 1) + ' 篇');
        b.addEventListener('click', function () { go(i); restart(); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function render() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }
    function go(i) {
      index = (i + slides.length) % slides.length;
      render();
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() {
      if (slides.length < 2) return;
      stop();
      timer = setInterval(next, DELAY);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    render();
    if (!reduce) start();
  })();

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
