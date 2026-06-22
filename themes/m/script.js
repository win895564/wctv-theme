
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('navMenu');
  var MOBILE = '(max-width: 760px)';

  function closeMenu() {
    if (!burger || !menu) return;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    menu.querySelectorAll('.nav-item.open').forEach(function (it) {
      it.classList.remove('open');
      var p = it.querySelector('.nav-parent');
      if (p) p.setAttribute('aria-expanded', 'false');
    });
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeMenu();
    });

    menu.querySelectorAll('.nav-parent').forEach(function (p) {
      p.addEventListener('click', function (e) {
        if (!matchMedia(MOBILE).matches) return;
        e.preventDefault();
        var item = p.closest('.nav-item');
        if (!item) return;
        var open = item.classList.toggle('open');
        p.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    menu.querySelectorAll('a').forEach(function (a) {
      if (a.classList.contains('nav-parent')) return;
      a.addEventListener('click', closeMenu);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dotsWrap = document.getElementById('dots');
  var idx = 0, timer = null, DELAY = 4500;

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 張');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    }
    function next() { go(idx + 1); }
    function start() { timer = setInterval(next, DELAY); }
    function restart() { clearInterval(timer); start(); }

    var stage = document.getElementById('heroCard');
    if (stage) {
      stage.addEventListener('mouseenter', function () { clearInterval(timer); });
      stage.addEventListener('mouseleave', start);
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  function format(n) { return n.toLocaleString('en-US'); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var dur = 1600, t0 = null;
    function ease(p) { return 1 - Math.pow(1 - p, 3); }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = format(Math.floor(ease(p) * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (c) { cio.observe(c); });
  } else {
    counts.forEach(animateCount);
  }
})();
