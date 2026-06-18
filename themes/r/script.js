/* ============================================================
   台灣佳光電訊（哈Net）— R 新粗獷  互動腳本
   純 vanilla JS，無外部依賴
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 導覽列捲動變化 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 手機漢堡選單 ＋ 子選單折疊 ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('navMenu');
  function closeMenu() {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    // 收合所有展開的子選單
    menu.querySelectorAll('.nav__item--open').forEach(function (it) {
      it.classList.remove('nav__item--open');
      var t = it.querySelector('.nav__toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  function isMobile() { return window.matchMedia('(max-width:860px)').matches; }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeMenu();
    });

    // 有子選單的父項：手機點擊展開／收合（桌機交給 CSS :hover）
    menu.querySelectorAll('.nav__item--has > .nav__toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        if (!isMobile()) return; // 桌機不攔截，交給 hover
        e.preventDefault();
        var item = toggle.closest('.nav__item');
        var willOpen = !item.classList.contains('nav__item--open');
        // 同一層只展開一個
        menu.querySelectorAll('.nav__item--open').forEach(function (it) {
          if (it !== item) {
            it.classList.remove('nav__item--open');
            var t = it.querySelector('.nav__toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('nav__item--open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    // 點「葉子」連結後關閉整個選單（父項 toggle 不算）
    menu.querySelectorAll('a:not(.nav__toggle)').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- 主視覺輪播 ---------- */
  var slider = document.getElementById('heroSlider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var idx = 0, timer = null;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', '切換到第 ' + (i + 1) + ' 張');
      if (i === 0) b.classList.add('on');
      b.addEventListener('click', function () { go(i); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      slides[idx].classList.remove('is-active');
      dots[idx].classList.remove('on');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      dots[idx].classList.add('on');
    }
    function next() { go(idx + 1); }
    function start() { timer = setInterval(next, 3800); }
    function reset() { clearInterval(timer); start(); }
    start();
    // 滑鼠移入暫停
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', start);
  }

  /* ---------- 捲動淡入 (IntersectionObserver) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 數據 count-up ---------- */
  var counters = document.querySelectorAll('.count');
  function format(n) { return n.toLocaleString('en-US'); }
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-to'), 10) || 0;
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = format(parseInt(c.getAttribute('data-to'), 10) || 0); });
  }

})();
