// 共用模板互動 — 純 vanilla,無相依

// 1) navbar 捲動縮起
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

// 2) 手機選單
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger?.addEventListener('click', () => menu.classList.toggle('open'));

// 3) Hero 輪播
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  if (!slides.length) return;
  const dotsWrap = document.getElementById('heroDots');
  let i = 0, timer;
  slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.onclick = () => go(n, true);
    dotsWrap.append(b);
  });
  const dots = [...dotsWrap.children];
  const go = (n, manual) => {
    slides[i].classList.remove('is-active');
    dots[i].classList.remove('on');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    dots[i].classList.add('on');
    if (manual) restart();
  };
  const next = () => go(i + 1);
  const restart = () => { clearInterval(timer); timer = setInterval(next, 5000); };
  document.getElementById('heroNext').onclick = () => go(i + 1, true);
  document.getElementById('heroPrev').onclick = () => go(i - 1, true);
  const hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);
  dots[0].classList.add('on');
  restart();
})();

// 4) 捲動淡入
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
    el.classList.add('in');
    io.unobserve(el);
  });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 5) 數字跳動
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1400, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('.count').forEach(el => cio.observe(el));
