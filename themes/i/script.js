
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  function isMobileNav() {
    return window.matchMedia('(max-width:760px)').matches;
  }
  function closeMobileNav() {
    if (!links) return;
    links.classList.remove('show');
    if (burger) {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
    Array.prototype.forEach.call(links.querySelectorAll('.nav-item.open'), function (it) {
      it.classList.remove('open');
      var p = it.querySelector('.nav-parent');
      if (p) p.setAttribute('aria-expanded', 'false');
    });
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('show');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeMobileNav();
    });
    links.addEventListener('click', function (e) {
      var parent = e.target.closest('.nav-parent');

      if (parent && isMobileNav()) {
        e.preventDefault();
        var item = parent.closest('.nav-item');
        if (item) {
          var open = item.classList.toggle('open');
          parent.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        return;
      }

      if (e.target.closest('a')) closeMobileNav();
    });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  function formatNum(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);

      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  var nums = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    nums.forEach(function (el) {
      el.textContent = formatNum(parseInt(el.getAttribute('data-count'), 10) || 0) + (el.getAttribute('data-suffix') || '');
    });
  } else if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io2.observe(el); });
  } else {
    nums.forEach(countUp);
  }

  (function () {
    var carousel = document.getElementById('heroCarousel');
    var dotsWrap = document.getElementById('heroDots');
    if (!carousel || !dotsWrap) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    if (slides.length <= 1) return;

    var idx = 0, timer = null;
    var INTERVAL = 6000;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 篇精選文章');
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }
    function next() { go(idx + 1); }
    function start() {
      if (reduceMotion) return;
      timer = window.setInterval(next, INTERVAL);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    go(0);
    start();
  })();

})();
