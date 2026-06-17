/* ============================================================
   K — 極簡單色 / 台灣佳光電訊 哈Net
   vanilla JS：導覽列捲動、進場、輪播、捲動淡入、count-up、漢堡
   ============================================================ */
(function () {
  'use strict';
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 導覽列捲動變化 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 漢堡 / 抽屜 ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    burger.classList.toggle('is-open', open);
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'));
  });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  /* ---------- 3. 主視覺進場 ---------- */
  window.requestAnimationFrame(function () {
    window.setTimeout(function () {
      document.body.classList.add('is-revealed');
      // hero 內的 reveal 立即觸發
      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 80);
  });

  /* ---------- 4. 捲動淡入 (IntersectionObserver) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (rm || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
  }

  /* ---------- 5. Hero 輪播 ---------- */
  var slides = document.querySelectorAll('#heroSlider .slide');
  var slideNo = document.getElementById('slideNo');
  if (slides.length > 1 && !rm) {
    var cur = 0;
    window.setInterval(function () {
      slides[cur].classList.remove('is-active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('is-active');
      if (slideNo) slideNo.textContent = ('0' + (cur + 1)).slice(-2);
    }, 4200);
  }

  /* ---------- 6. 數據 count-up ---------- */
  function fmt(n) { return n.toLocaleString('en-US'); }
  function animateCount(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    var dur = 1600;
    if (rm) { el.textContent = fmt(to); return; }
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(Math.round(ease(p) * to));
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }
    window.requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            cio.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- 7. 平滑捲動補正 (固定導覽列偏移) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: rm ? 'auto' : 'smooth' });
    });
  });
})();
