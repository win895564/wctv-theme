
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var header = document.getElementById('siteHeader');
    function onScroll() {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      menu.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menu.querySelectorAll('.nav-item.open').forEach(function (it) {
        it.classList.remove('open');
        var b = it.querySelector('.nav-sub-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    var mqMobile = window.matchMedia('(max-width:860px)');
    menu.querySelectorAll('.nav-item.has-sub > .nav-sub-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!mqMobile.matches) return;          // 桌機由 CSS hover 處理
        e.preventDefault();
        var item = btn.parentElement;
        var willOpen = !item.classList.contains('open');
        menu.querySelectorAll('.nav-item.open').forEach(function (it) {
          if (it !== item) {
            it.classList.remove('open');
            var b = it.querySelector('.nav-sub-toggle');
            if (b) b.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    toggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    var navClose = document.getElementById('navClose');
    if (navClose) navClose.addEventListener('click', closeMenu);

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    mqMobile.addEventListener('change', function (e) { if (!e.matches) closeMenu(); });

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

    function start() { if (!timer && slides.length > 1) timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });

    // 手機沒有左右箭頭（會擋住文字），改用滑動切換
    var swipeX = null, swipeY = null;
    heroEl.addEventListener('touchstart', function (e) {
      swipeX = e.changedTouches[0].clientX;
      swipeY = e.changedTouches[0].clientY;
    }, { passive: true });
    heroEl.addEventListener('touchend', function (e) {
      if (swipeX === null) return;
      var dx = e.changedTouches[0].clientX - swipeX;
      var dy = e.changedTouches[0].clientY - swipeY;
      // 水平位移要夠大、且明顯大於垂直位移，才算滑動切換，否則會干擾正常的上下捲動
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next(); else prev();
        restart();
      }
      swipeX = swipeY = null;
    }, { passive: true });

    heroEl.addEventListener('mouseenter', stop);
    heroEl.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    start();

    var reveals = document.querySelectorAll('.reveal');

    document.querySelectorAll('.product-grid, .product-mini-grid, .news-grid, .quick-grid, .plan-grid, .stats')
      .forEach(function (grid) {
        var kids = grid.querySelectorAll('.reveal');
        kids.forEach(function (el, i) { el.setAttribute('data-d', String((i % 5) + 1)); });
      });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in'); io.unobserve(en.target);
            // 進場完成後移除 stagger 延遲，否則 hover 的過渡也會被延遲 0.05~0.37s（會覺得遲鈍）
            (function (el) { setTimeout(function () { el.removeAttribute('data-d'); }, 1200); })(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
      // 保底：若環境異常導致 observer 完全沒觸發（極少數瀏覽器／特殊視窗），3.5 秒後強制顯示，
      // 避免內容永久隱形。正常瀏覽器首屏一定已有 reveal 進場，不會誤觸發、不影響捲動動效。
      setTimeout(function () {
        if (!document.querySelector('.reveal.in')) reveals.forEach(function (el) { el.classList.add('in'); });
      }, 3500);
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }

    var statNums = document.querySelectorAll('.stat-num');
    var DURATION = 1900;

    function formatNum(n) { return n.toLocaleString('en-US'); }
    function runCount(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / DURATION, 1);
        var eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
        el.textContent = formatNum(Math.floor(eased * target)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNum(target) + suffix;
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && statNums.length) {
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); statIO.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      statNums.forEach(function (el) { statIO.observe(el); });
    } else {
      statNums.forEach(function (el) {
        el.textContent = formatNum(parseInt(el.getAttribute('data-target'), 10) || 0) + (el.getAttribute('data-suffix') || '');
      });
    }

    var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
    faqItems.forEach(function (item) {
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var willOpen = !item.classList.contains('open');

        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-a').style.maxHeight = null;
          }
        });
        item.classList.toggle('open', willOpen);
        q.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        a.style.maxHeight = willOpen ? (a.scrollHeight + 'px') : null;
      });
    });

    // 右下角社群懸浮框：點主按鈕展開/收合，點外面自動關
    var sfab = document.getElementById('socialFab');
    if (sfab) {
      var sbtn = document.getElementById('socialToggle');
      sbtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = sfab.classList.toggle('open');
        sbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!sfab.contains(e.target)) {
          sfab.classList.remove('open');
          sbtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 智能客服浮球：點擊在哈寶寶旁邊展開對話框
    var botFab = document.getElementById('botFab');
    if (botFab) {
      var botToggle = document.getElementById('botToggle');
      var botPanel = document.getElementById('botPanel');
      var botFrame = document.getElementById('botFrame');

      function setBot(open) {
        botFab.classList.toggle('open', open);
        botToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        botPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
        // 第一次打開才載入，避免每位訪客一進站就對客服主機發一次請求
        if (open && botFrame && !botFrame.src) botFrame.src = botFrame.getAttribute('data-src');
      }

      botToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        setBot(!botFab.classList.contains('open'));
      });
      document.getElementById('botClose').addEventListener('click', function () { setBot(false); });
      document.addEventListener('click', function (e) {
        if (!botFab.contains(e.target)) setBot(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setBot(false);
      });
    }

    // 線上申辦 modal：所有「立即申辦」按鈕點擊開啟；送出串接由後台處理（各台客服表單、分類固定「裝機」）
    var applyModal = document.getElementById('applyModal');
    if (applyModal) {
      var applyForm = document.getElementById('applyForm');
      var applyDialog = applyModal.querySelector('.apply-dialog');
      function openApply(e) { if (e) e.preventDefault(); applyModal.classList.add('open'); applyModal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
      function closeApply() {
        applyModal.classList.remove('open');
        applyModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // 關閉後還原成表單狀態，否則送出過一次之後再開啟會停在「已收到您的申辦」。
        // 等關閉動畫跑完再還原，避免使用者看到畫面在收起來的過程中閃回表單。
        setTimeout(function () {
          applyDialog.classList.remove('is-done');
          if (applyForm) applyForm.reset();
        }, 320);
      }
      document.querySelectorAll('.btn').forEach(function (b) {
        if (b.textContent.trim() === '立即申辦') b.addEventListener('click', openApply);
      });
      applyModal.querySelectorAll('[data-close-apply]').forEach(function (el) { el.addEventListener('click', closeApply); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeApply(); });
      if (applyForm) applyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // 串接點：實際送出到各台後台客服表單、分類固定「裝機」，由台基科串接
        applyDialog.classList.add('is-done');
      });
    }

  });
})();
