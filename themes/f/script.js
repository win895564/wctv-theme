
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

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

    navMenu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link.classList.contains('nav__sub-toggle') && window.innerWidth <= 760) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

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

  if (navMenu) {
    var subToggles = navMenu.querySelectorAll('.nav__has-sub > .nav__sub-toggle');
    Array.prototype.forEach.call(subToggles, function (toggle) {
      toggle.addEventListener('click', function (e) {

        if (window.innerWidth > 760) return;
        e.preventDefault();
        var li = toggle.parentNode;
        var willOpen = !li.classList.contains('is-open');
        li.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  }

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

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    startAuto();
  }

  var sizeBtns = document.querySelectorAll('.fontsize-btn');
  if (sizeBtns.length) {

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

  var reveals = document.querySelectorAll('.reveal');

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

})();
