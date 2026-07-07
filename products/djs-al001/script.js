/* DJS AL001 產品頁 — 互動：招牌警報場景 + 捲動揭示 + 產品游標微傾 */

/* 1) 招牌「開門→警報」釘住場景 */
(function () {
  'use strict';
  var scene = document.querySelector('.alarm-scene');
  var stage = document.getElementById('alarmStage');
  if (!scene || !stage) return;

  var FIRE = 0.45, ticking = false, alarmed = false;
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = scene.getBoundingClientRect();
    var span = scene.offsetHeight - vh;
    var p = span > 0 ? clamp(-rect.top / span, 0, 1) : 0;
    stage.style.setProperty('--p', p.toFixed(4));
    var should = p > FIRE && p < 0.985;
    if (should !== alarmed) { alarmed = should; stage.classList.toggle('alarmed', alarmed); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

/* 2) 捲動揭示（進場淡入上浮，grid 漸進延遲） */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  ['.step-grid', '.feat-grid', '.place-grid', '.spec-list', '.app-phones'].forEach(function (sel) {
    var c = document.querySelector(sel); if (!c) return;
    [].forEach.call(c.children, function (ch, i) { ch.style.transitionDelay = (Math.min(i, 6) * 0.06) + 's'; });
  });
  var targets = document.querySelectorAll(
    '.steps .sec-eyebrow,.steps .sec-title,.step-grid>li,' +
    '.app-copy,.app-phones .hp-frame,' +
    '.feats .sec-eyebrow,.feats .sec-title,.feat-grid>li,' +
    '.places .sec-eyebrow,.places .sec-title,.place-grid>li,.place-note,' +
    '.specs .specs-head,.spec-list>div,.cta-in>*'
  );
  if (reduce || !('IntersectionObserver' in window)) {
    [].forEach.call(targets, function (t) { t.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  [].forEach.call(targets, function (t) { io.observe(t); });
})();

/* 3) 產品跟游標微傾（桌機、非 reduced-motion） */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  var stage = document.querySelector('.hero-stage');
  var tilt = document.querySelector('.hero-tilt');
  if (!stage || !tilt || reduce || !fine) return;
  var raf = false, nx = 0, ny = 0;
  stage.addEventListener('mousemove', function (e) {
    var r = stage.getBoundingClientRect();
    nx = (e.clientX - r.left) / r.width - 0.5;
    ny = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) {
      raf = true;
      requestAnimationFrame(function () {
        raf = false;
        tilt.style.setProperty('--ry', (nx * 8).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (ny * -6).toFixed(2) + 'deg');
      });
    }
  }, { passive: true });
  stage.addEventListener('mouseleave', function () {
    tilt.style.setProperty('--rx', '0deg');
    tilt.style.setProperty('--ry', '0deg');
  });
})();
