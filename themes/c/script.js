/* =========================================================
   哈Net — C 親切在地風格  互動腳本（vanilla JS）
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. 導覽列捲動縮高 + 陰影 ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 漢堡選單 ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('navOverlay');

  const closeMenu = () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    overlay.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    nav.querySelectorAll('.nav-item.sub-open').forEach((it) => {
      it.classList.remove('sub-open');
      const p = it.querySelector('.nav-parent');
      if (p) p.setAttribute('aria-expanded', 'false');
    });
  };
  const toggleMenu = () => {
    const open = nav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  /* ---------- 2b. 子選單折疊（手機點父項展開；桌機交給 CSS :hover）---------- */
  const isMobileNav = () => window.matchMedia('(max-width:860px)').matches;
  const navItems = Array.from(nav.querySelectorAll('.nav-item.has-sub'));

  navItems.forEach((item) => {
    const parent = item.querySelector('.nav-parent');
    if (!parent) return;
    parent.addEventListener('click', (e) => {
      if (!isMobileNav()) return;          // 桌機：純錨點 + CSS hover
      e.preventDefault();
      const willOpen = !item.classList.contains('sub-open');
      navItems.forEach((it) => {           // 手風琴：一次只開一個
        it.classList.toggle('sub-open', it === item && willOpen);
        const p = it.querySelector('.nav-parent');
        if (p) p.setAttribute('aria-expanded', String(it === item && willOpen));
      });
    });
  });

  // 點「子項連結」或「無子選單的主項」才關閉抽屜；父項只負責展開子選單
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      if (a.classList.contains('nav-parent') && isMobileNav()) return;
      closeMenu();
    });
  });

  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- 3. Hero 自動輪播 ---------- */
  const track = document.getElementById('heroTrack');
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const heroEl = document.getElementById('hero');
  const SLIDE_MS = 5000;
  let index = 0;
  let timer = null;

  // 建立圓點
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', '第 ' + (i + 1) + ' 張');
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-selected', String(i === index));
    });
  }
  function goTo(i, manual) {
    index = (i + slides.length) % slides.length;
    render();
    if (manual) restart();
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function start() { stop(); timer = setInterval(next, SLIDE_MS); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { start(); }

  nextBtn.addEventListener('click', () => goTo(index + 1, true));
  prevBtn.addEventListener('click', () => goTo(index - 1, true));

  // 滑入暫停 / 滑出續播
  heroEl.addEventListener('mouseenter', stop);
  heroEl.addEventListener('mouseleave', start);
  // 切到背景分頁時暫停
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  // 觸控滑動
  let touchX = null;
  heroEl.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
  heroEl.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
    touchX = null;
    start();
  }, { passive: true });

  render();
  start();

  /* ---------- 4. 捲動淡入 (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 5. 數據 count-up ---------- */
  const statsBox = document.getElementById('stats');
  let counted = false;

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString('en-US') + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString('en-US') + suffix;
    }
    requestAnimationFrame(frame);
  }

  if (statsBox && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !counted) {
          counted = true;
          statsBox.querySelectorAll('.stat-num').forEach(animateCount);
          so.disconnect();
        }
      });
    }, { threshold: 0.4 });
    so.observe(statsBox);
  } else if (statsBox) {
    statsBox.querySelectorAll('.stat-num').forEach((el) => {
      el.textContent = parseInt(el.dataset.target, 10).toLocaleString('en-US') + (el.dataset.suffix || '');
    });
  }

})();
