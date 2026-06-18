/* ============================================================
   哈Net — F 自助入口式版型 互動
   vanilla JS，無相依。
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 導覽列捲動變化 ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) {
      if (y > 480) toTop.hidden = false;
      else toTop.hidden = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 回到頂端 ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 3. 手機漢堡選單 ---------- */
  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '開啟選單');
  }
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    });
    // 點選單項目後自動收合（父項展開鈕除外，讓它只負責折疊子選單）
    navMenu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link.classList.contains('nav__sub-toggle') && window.innerWidth <= 760) return;
      closeMenu();
    });
    // Esc 關閉
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    // 桌機寬度時確保收合
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) {
        closeMenu();
        var opened = navMenu.querySelectorAll('.nav__has-sub.is-open');
        Array.prototype.forEach.call(opened, function (li) {
          li.classList.remove('is-open');
          var t = li.querySelector('.nav__sub-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* ---------- 3b. 手機子選單折疊（桌機交給 CSS :hover） ---------- */
  if (navMenu) {
    var subToggles = navMenu.querySelectorAll('.nav__has-sub > .nav__sub-toggle');
    Array.prototype.forEach.call(subToggles, function (toggle) {
      toggle.addEventListener('click', function (e) {
        // 僅在手機（漢堡顯示）攔截，桌機讓 hover 處理、連結維持可點
        if (window.innerWidth > 760) return;
        e.preventDefault();
        var li = toggle.parentNode;
        var willOpen = !li.classList.contains('is-open');
        li.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  }

  /* ---------- 3c. Hero 輪播（固定模板，每張＝一篇精選文章） ---------- */
  var carousel = document.getElementById('heroCarousel');
  if (carousel) {
    var slides = carousel.querySelectorAll('.hero__slide');
    var dots = document.querySelectorAll('#heroDots .hero__dot');
    var cur = 0;
    var timer = null;
    var DELAY = 6000;

    function showSlide(idx) {
      idx = (idx + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, i) {
        var on = i === idx;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('hidden');
        else s.setAttribute('hidden', '');
      });
      Array.prototype.forEach.call(dots, function (d, i) {
        var on = i === idx;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      cur = idx;
    }

    function next() { showSlide(cur + 1); }

    function startAuto() {
      if (prefersReduced || slides.length < 2) return;
      stopAuto();
      timer = window.setInterval(next, DELAY);
    }
    function stopAuto() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startAuto();
      });
    });

    // 滑入暫停、離開續播（年長友善：給足閱讀時間）
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    startAuto();
  }

  /* ---------- 4. 字級切換（年長友善 / 無障礙） ---------- */
  var sizeBtns = document.querySelectorAll('.fontsize-btn');
  if (sizeBtns.length) {
    // 記住上次選擇
    var saved = null;
    try { saved = localStorage.getItem('hanet-fontsize'); } catch (e) {}
    if (saved) applySize(saved);

    Array.prototype.forEach.call(sizeBtns, function (btn) {
      btn.addEventListener('click', function () {
        applySize(btn.getAttribute('data-size'));
      });
    });
  }
  function applySize(size) {
    if (size === 'normal') document.body.removeAttribute('data-fontsize');
    else document.body.setAttribute('data-fontsize', size);
    Array.prototype.forEach.call(sizeBtns, function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-size') === size);
    });
    try { localStorage.setItem('hanet-fontsize', size); } catch (e) {}
  }

  /* ---------- 5. 捲動淡入 (IntersectionObserver) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  // 同群組內加階梯延遲，進場更有層次
  groupDelay('.self-grid', '.self-card');
  groupDelay('.plan-grid', '.plan');
  groupDelay('.features', '.feature');
  groupDelay('.stats__grid', '.stat');
  groupDelay('.svc-row', '.svc-card');
  groupDelay('.news-list', '.news-item');

  function groupDelay(parentSel, childSel) {
    document.querySelectorAll(parentSel).forEach(function (parent) {
      var kids = parent.querySelectorAll(childSel);
      Array.prototype.forEach.call(kids, function (k, i) {
        k.setAttribute('data-d', String((i % 3) + 1));
      });
    });
  }

  if (prefersReduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- 6. 數據 count-up ---------- */
  var nums = document.querySelectorAll('.stat__num');

  function formatNum(v) {
    return v >= 1000 ? v.toLocaleString('en-US') : String(v);
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReduced) { el.textContent = formatNum(target) + suffix; return; }
    var dur = 1500;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  if (nums.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nums, countUp);
    } else {
      var ioNum = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            countUp(en.target);
            ioNum.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(nums, function (el) { ioNum.observe(el); });
    }
  }

  /* ---------- 7. 公告橫幅：滑入動畫（純裝飾，可略） ---------- */
  // ticker 內容靜態水平排列，視覺上由 reveal 帶進場，這裡不做無限捲動以維持可讀性（年長友善）。

})();
