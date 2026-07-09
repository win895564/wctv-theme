/* 哈Net 光纖 × 智慧防盜家 — 捲動揭示 + 招牌互動（門開→光沿線跑→手機警報） */
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

  /* 2) 招牌場景：窗開 → 訊號沿光纖跑 → 手機跳警報 */
  var scene = document.getElementById('scene');
  var replay = document.getElementById('sceneReplay');
  if (scene) {
    var timers = [];
    var reset = function () { timers.forEach(clearTimeout); timers = []; scene.classList.remove('s-open', 's-run', 's-alert'); };
    var play = function () {
      reset();
      if (reduce) { scene.classList.add('s-open', 's-alert'); return; }
      void scene.offsetWidth; // 強制回流 → 可重播
      timers.push(setTimeout(function () { scene.classList.add('s-open'); }, 200));
      timers.push(setTimeout(function () { scene.classList.add('s-run'); }, 650));
      timers.push(setTimeout(function () { scene.classList.add('s-alert'); }, 1500));
    };
    if (reduce) {
      scene.classList.add('s-open', 's-alert'); // 減少動態：直接顯示結果
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
