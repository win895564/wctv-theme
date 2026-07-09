/* 哈Net 光纖 × 智慧防盜家 — 捲動揭示 + 數字遞增 + 門開→警報示範（克制、無發光） */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) 捲動揭示 */
  var rev = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    [].forEach.call(rev, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(rev, function (el) { io.observe(el); });
  }

  /* 2) 速率數字遞增（進場時 0 → 目標） */
  var nums = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1100;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var no = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); no.unobserve(e.target); } });
    }, { threshold: 0.6 });
    [].forEach.call(nums, function (el) { no.observe(el); });
  } else { [].forEach.call(nums, function (el) { el.textContent = el.getAttribute('data-count'); }); }

  /* 3) 門開 → 訊號 → 手機通知 */
  var scene = document.getElementById('scene');
  var replay = document.getElementById('sceneReplay');
  if (scene) {
    var timers = [];
    var reset = function () { timers.forEach(clearTimeout); timers = []; scene.classList.remove('s-open', 's-run', 's-alert'); };
    var play = function () {
      reset();
      if (reduce) { scene.classList.add('s-open', 's-alert'); return; }
      void scene.offsetWidth;
      timers.push(setTimeout(function () { scene.classList.add('s-open'); }, 220));
      timers.push(setTimeout(function () { scene.classList.add('s-run'); }, 680));
      timers.push(setTimeout(function () { scene.classList.add('s-alert'); }, 1520));
    };
    if (reduce) {
      scene.classList.add('s-open', 's-alert');
    } else if ('IntersectionObserver' in window) {
      var once = false;
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !once) { once = true; play(); } });
      }, { threshold: 0.4 });
      so.observe(scene);
    } else { play(); }
    if (replay) replay.addEventListener('click', play);
  }
})();
