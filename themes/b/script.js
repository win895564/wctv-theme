/* =========================================================
   哈Net — Theme B「科技俐落」  vanilla JS
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Header 捲動縮高 + 陰影 ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 漢堡選單 ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const toggleMenu = (force) => {
    const open = force !== undefined ? force : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  hamburger.addEventListener('click', () => toggleMenu());
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- 2b. 行動選單子分類折疊 ---------- */
  mobileMenu.querySelectorAll('.m-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.closest('.m-sub');
      const open = sub.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 3. Hero 自動輪播 ---------- */
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('#heroDots button'));
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const heroEl = document.getElementById('hero');
  let current = 0;
  let timer = null;
  const INTERVAL = 5000;

  const goTo = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const start = () => { stop(); timer = setInterval(next, INTERVAL); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  if (slides.length) {
    nextBtn.addEventListener('click', () => { next(); start(); });
    prevBtn.addEventListener('click', () => { prev(); start(); });
    dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.go); start(); }));

    // 滑入暫停
    heroEl.addEventListener('mouseenter', stop);
    heroEl.addEventListener('mouseleave', start);

    // 鍵盤左右
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { next(); start(); }
      if (e.key === 'ArrowLeft') { prev(); start(); }
    });

    // 分頁切走時暫停
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // 觸控滑動
    let tx = 0;
    heroEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stop(); }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
      start();
    }, { passive: true });

    start();
  }

  /* ---------- 4. 捲動淡入 (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- 5. 數據 count-up ---------- */
  const fmt = (n) => n.toLocaleString('en-US');
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const val = Math.round(target * ease(p));
      el.textContent = fmt(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    };
    requestAnimationFrame(step);
  };

  const statEls = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window && statEls.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          animateCount(en.target);
          so.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => so.observe(el));
  } else {
    statEls.forEach(el => { el.textContent = fmt(+el.dataset.count) + (el.dataset.suffix || ''); });
  }

  /* ---------- 6. 年份 ---------- */
  // (頁尾年份已寫死 2026，依需求保留)

})();
