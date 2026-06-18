/* =========================================================
   哈Net — G 版型互動
   導覽列捲動變化 / 漢堡選單 / 捲動淡入 / 數據 count-up / 查址示意
   純 vanilla，無外部依賴
   ========================================================= */
(function () {
  'use strict';

  /* ---------- ① 導覽列捲動變化 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 手機漢堡選單 ---------- */
  var burger = document.getElementById('burger');
  function closeMenu() {
    nav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    // 收合所有展開的子站圖
    document.querySelectorAll('.nav__item.has-sub.open').forEach(function (item) {
      item.classList.remove('open');
      var t = item.querySelector('.nav__link');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // 手機：點父項展開子站圖（桌機交給 CSS :hover）
  var MOBILE_NAV = '(max-width:760px)';
  document.querySelectorAll('.nav__item.has-sub > .nav__link').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      if (!window.matchMedia(MOBILE_NAV).matches) return; // 桌機不攔截
      e.preventDefault();
      var item = toggle.parentElement;
      var open = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // 點實際連結（子項 / 單一主項 / CTA） / 遮罩後關閉選單
  document.querySelectorAll('.nav__sub a, .nav__menu > a.nav__link, .nav__cta a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  nav.addEventListener('click', function (e) {
    // 點到遮罩（::after 涵蓋整個 nav 但選單在上層）時關閉
    if (e.target === nav) closeMenu();
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- ③ 捲動淡入（IntersectionObserver） ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('in'); }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- ④ 數據 count-up ---------- */
  function formatNum(n) { return n.toLocaleString('en-US'); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target);
    }
    requestAnimationFrame(step);
  }
  var statsSection = document.getElementById('stats');
  if (statsSection) {
    var counted = false;
    if ('IntersectionObserver' in window) {
      var statIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            statsSection.querySelectorAll('[data-count]').forEach(animateCount);
          }
        });
      }, { threshold: 0.35 });
      statIo.observe(statsSection);
    } else {
      statsSection.querySelectorAll('[data-count]').forEach(animateCount);
    }
  }

  /* ---------- ② 查址互動（純前端示意） ---------- */
  var form = document.getElementById('lookupForm');
  var input = document.getElementById('lookupInput');
  var btn = document.getElementById('lookupBtn');
  var btnLabel = btn ? btn.querySelector('.lookup__btnlabel') : null;
  var result = document.getElementById('lookupResult');
  var resultMsg = document.getElementById('resultMsg');
  var resultFill = document.getElementById('resultFill');
  var resultPlans = document.getElementById('resultPlans');

  // 依輸入內容生成「穩定」的假結果（同地址查兩次結果一致）
  var SCENARIOS = [
    {
      speed: '最高 1G',
      msg: '您家可裝 <b>最高 1G</b>！光纖已全面覆蓋。',
      fill: 100,
      plans: [
        { name: '輕速 300M', price: '$499', best: false },
        { name: '標準 500M', price: '$699', best: false },
        { name: '極速 1G', price: '$999', best: true }
      ]
    },
    {
      speed: '最高 500M',
      msg: '您家可裝 <b>最高 500M</b>！光纖到府沒問題。',
      fill: 72,
      plans: [
        { name: '輕速 300M', price: '$499', best: false },
        { name: '標準 500M', price: '$699', best: true }
      ]
    },
    {
      speed: '最高 300M',
      msg: '您家可裝 <b>最高 300M</b>！立即享光纖上網。',
      fill: 48,
      plans: [
        { name: '輕速 300M', price: '$499', best: true }
      ]
    }
  ];

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  function renderResult(scn) {
    resultMsg.innerHTML = scn.msg;
    resultPlans.innerHTML = '';
    scn.plans.forEach(function (p) {
      var chip = document.createElement('div');
      chip.className = 'result__chip' + (p.best ? ' is-best' : '');
      chip.innerHTML = (p.best ? '推薦 ' : '') + p.name + '<b>' + p.price + '/月起</b>';
      resultPlans.appendChild(chip);
    });
    result.hidden = false;
    // 重觸發進場動畫
    result.style.animation = 'none';
    // eslint-disable-next-line no-unused-expressions
    result.offsetHeight;
    result.style.animation = '';
    // 速率條動畫
    resultFill.style.width = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { resultFill.style.width = scn.fill + '%'; });
    });
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = (input.value || '').trim();
      if (!val) {
        input.focus();
        input.style.borderColor = '#E0524F';
        input.placeholder = '請先輸入地址或電話，我們幫你查 →';
        setTimeout(function () { input.style.borderColor = ''; }, 1400);
        return;
      }
      // 假查詢：loading 0.9s → 出結果
      btn.disabled = true;
      var oldLabel = btnLabel ? btnLabel.textContent : '';
      if (btnLabel) btnLabel.textContent = '查詢中…';
      btn.style.opacity = '.8';
      setTimeout(function () {
        var scn = SCENARIOS[hashStr(val) % SCENARIOS.length];
        renderResult(scn);
        btn.disabled = false;
        btn.style.opacity = '';
        if (btnLabel) btnLabel.textContent = oldLabel || '重新查詢';
      }, 900);
    });
  }

  /* ---------- 年份自動帶（保險，若日後改用） ---------- */
  // 目前頁面已寫死 2026，此處保留掛點不動作。

})();
