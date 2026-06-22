
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('burger');
  var menu = document.getElementById('navMenu');
  function closeMenu() {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');

    menu.querySelectorAll('.nav__item--open').forEach(function (it) {
      it.classList.remove('nav__item--open');
      var t = it.querySelector('.nav__toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  function isMobile() { return window.matchMedia('(max-width:860px)').matches; }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeMenu();
    });

    menu.querySelectorAll('.nav__item--has > .nav__toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        if (!isMobile()) return; // 桌機不攔截，交給 hover
        e.preventDefault();
        var item = toggle.closest('.nav__item');
        var willOpen = !item.classList.contains('nav__item--open');

        menu.querySelectorAll('.nav__item--open').forEach(function (it) {
          if (it !== item) {
            it.classList.remove('nav__item--open');
            var t = it.querySelector('.nav__toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('nav__item--open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    menu.querySelectorAll('a:not(.nav__toggle)').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  var slider = document.getElementById('heroSlider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var idx = 0, timer = null;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', '切換到第 ' + (i + 1) + ' 張');
      if (i === 0) b.classList.add('on');
      b.addEventListener('click', function () { go(i); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      slides[idx].classList.remove('is-active');
      dots[idx].classList.remove('on');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      dots[idx].classList.add('on');
    }
    function next() { go(idx + 1); }
    function start() { timer = setInterval(next, 3800); }
    function reset() { clearInterval(timer); start(); }
    start();

    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', start);
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
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  var counters = document.querySelectorAll('.count');
  function format(n) { return n.toLocaleString('en-US'); }
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-to'), 10) || 0;
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);

      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          runCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = format(parseInt(c.getAttribute('data-to'), 10) || 0); });
  }

})();
