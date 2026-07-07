/* DJS AL001 產品頁 — 招牌「開門→警報」釘住場景的捲動驅動 */
(function () {
  'use strict';
  var scene = document.querySelector('.alarm-scene');
  var stage = document.getElementById('alarmStage');
  if (!scene || !stage) return;

  var FIRE = 0.45;          // 分離超過此進度 → 觸發警報
  var ticking = false;
  var alarmed = false;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var rect = scene.getBoundingClientRect();
    var span = scene.offsetHeight - vh;               // 可捲動距離
    var p = span > 0 ? clamp(-rect.top / span, 0, 1) : 0;
    stage.style.setProperty('--p', p.toFixed(4));

    var shouldAlarm = p > FIRE && p < 0.985;          // 尾端回歸平靜
    if (shouldAlarm !== alarmed) {
      alarmed = shouldAlarm;
      stage.classList.toggle('alarmed', alarmed);
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
