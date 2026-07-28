
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

    // 頁尾手風琴（僅手機／平板生效：點「有子項」的欄標題展開／收合；桌機由 CSS 常態展開，這裡不動作）
    var footerMq = window.matchMedia('(max-width: 1080px)');
    document.querySelectorAll('.footer-col.has-list > .footer-head').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!footerMq.matches) return;
        var col = btn.parentElement;
        var open = col.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    // 從手機切回桌機時，清掉收合狀態，避免桌機殘留 aria-expanded=false
    footerMq.addEventListener('change', function (e) {
      if (!e.matches) document.querySelectorAll('.footer-col.has-list').forEach(function (col) {
        col.classList.remove('open');
        var b = col.querySelector('.footer-head');
        if (b) b.setAttribute('aria-expanded', 'false');
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

    // 線上申辦 modal：所有「立即申辦」按鈕點擊開啟
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
      // 自刻下拉：把原生 <select> 升級成可完整套用網站樣式的清單（原生 select 隱藏但保留、值照樣送出）
      var csWraps = [];
      function enhanceSelect(sel) {
        var wrap = document.createElement('div');
        wrap.className = 'cs';
        sel.parentNode.insertBefore(wrap, sel);
        wrap.appendChild(sel);
        sel.classList.add('cs-native');

        var ph = sel.querySelector('option[disabled]');
        var placeholder = ph ? ph.textContent : '請選擇';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cs-btn';
        btn.setAttribute('aria-haspopup', 'listbox');
        btn.setAttribute('aria-expanded', 'false');
        var label = document.createElement('span');
        var caret = document.createElement('span');
        caret.className = 'cs-caret';
        btn.appendChild(label);
        btn.appendChild(caret);

        var list = document.createElement('div');
        list.className = 'cs-list';
        list.setAttribute('role', 'listbox');

        function refresh() {
          var o = sel.options[sel.selectedIndex];
          if (o && o.value) { label.textContent = o.textContent; btn.classList.remove('placeholder'); }
          else { label.textContent = placeholder; btn.classList.add('placeholder'); }
        }

        [].forEach.call(sel.options, function (o) {
          if (o.disabled || o.value === '') return;
          var item = document.createElement('div');
          item.className = 'cs-opt';
          item.setAttribute('role', 'option');
          item.textContent = o.textContent;
          if (o.selected) item.classList.add('sel');
          item.addEventListener('click', function () {
            sel.value = o.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            list.querySelectorAll('.cs-opt').forEach(function (x) { x.classList.remove('sel'); });
            item.classList.add('sel');
            wrap.classList.remove('cs-error');
            refresh();
            closeCs();
          });
          list.appendChild(item);
        });

        function openCs() {
          csWraps.forEach(function (w) { if (w !== wrap) w._close(); });
          wrap.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
        function closeCs() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          wrap.classList.contains('open') ? closeCs() : openCs();
        });
        wrap.appendChild(btn);
        wrap.appendChild(list);
        refresh();
        wrap._close = closeCs;
        csWraps.push(wrap);
      }
      applyForm && applyForm.querySelectorAll('.apply-field select').forEach(enhanceSelect);
      document.addEventListener('click', function () { csWraps.forEach(function (w) { w._close(); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') csWraps.forEach(function (w) { w._close(); }); });

      if (applyForm) applyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var city = applyForm.querySelector('[name="city"]');
        var district = applyForm.querySelector('[name="district"]');
        var detail = document.getElementById('applyAddrDetail');
        var full = document.getElementById('applyAddrFull');
        // 行政區必選（原生 required 因 select 被隱藏而移除，改在這裡驗證）
        if (district && !district.value) {
          var w = district.closest('.cs');
          if (w) { w.classList.add('cs-error'); var b = w.querySelector('.cs-btn'); if (b) b.focus(); }
          return;
        }
        // 把「縣市 + 行政區 + 詳細地址」組成完整地址，寫進 hidden 的 address 欄位（後台收單一字串）
        if (city && district && detail && full) full.value = city.value + district.value + detail.value;
        applyDialog.classList.add('is-done');
      });
    }

  });
})();
