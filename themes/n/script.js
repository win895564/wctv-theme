
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('nav');
    function onScroll() {
      if (window.scrollY > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');

    if (navLinks && !navLinks.querySelector('.mobile-cta')) {
      var mob = document.createElement('div');
      mob.className = 'mobile-cta';
      mob.innerHTML =
        '<a href="#pay" class="btn btn-outline">線上繳費</a>' +
        '<a href="#apply" class="btn btn-glow">立即申辦</a>';
      navLinks.appendChild(mob);
    }

    var isMobileNav = function () {
      return window.matchMedia('(max-width: 860px)').matches;
    };

    if (burger && navLinks) {
      burger.addEventListener('click', function () {
        var open = navLinks.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      navLinks.addEventListener('click', function (e) {

        var parent = e.target.closest('.nav-parent');
        if (parent && isMobileNav()) {
          e.preventDefault();
          var item = parent.closest('.nav-item');
          var willOpen = !item.classList.contains('open');
          item.classList.toggle('open', willOpen);
          parent.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          return;
        }

        if (e.target.closest('a') && !parent) {
          navLinks.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var heroReveals = document.querySelectorAll('.hero .reveal');
    heroReveals.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, 120 + i * 110);
    });

    var slidesWrap = document.getElementById('slides');
    var dotsWrap = document.getElementById('sliderDots');
    if (slidesWrap && dotsWrap) {
      var slides = Array.prototype.slice.call(slidesWrap.querySelectorAll('.slide'));
      var idx = 0;
      var timer = null;
      var DELAY = 4200;

      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', '第 ' + (i + 1) + ' 個方案');
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
      function start() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = setInterval(next, DELAY);
      }
      function restart() { clearInterval(timer); start(); }

      var slider = document.getElementById('slider');
      slider.addEventListener('mouseenter', function () { clearInterval(timer); });
      slider.addEventListener('mouseleave', start);
      start();
    }

    var reveals = document.querySelectorAll('.reveal:not(.in)');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            obs.unobserve(en.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }

    var counters = document.querySelectorAll('.count');
    function formatNum(n, mode) {
      var s = Math.round(n).toLocaleString('en-US');
      return mode === 'plus' ? s + '+' : s;
    }
    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var mode = el.getAttribute('data-format');
      var dur = 1700;
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = formatNum(target * eased, mode);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNum(target, mode);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animate(en.target); obs.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(animate);
    }

    var hoverCards = document.querySelectorAll('.glow-card, .plan-card');
    hoverCards.forEach(function (card) {
      var aura = card.querySelector('.card-aura');
      if (!aura) return;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        aura.style.top = (e.clientY - r.top - 120) + 'px';
        aura.style.right = 'auto';
        aura.style.left = (e.clientX - r.left - 120) + 'px';
      });
    });

  });
})();
