
(function () {
  'use strict';
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    burger.classList.toggle('is-open', open);
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'));
  });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  drawer.querySelectorAll('.drawer__parent').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = btn.nextElementSibling;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (sub) sub.style.maxHeight = open ? '' : (sub.scrollHeight + 'px');
    });
  });

  window.requestAnimationFrame(function () {
    window.setTimeout(function () {
      document.body.classList.add('is-revealed');

      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('is-in');
      });
    }, 80);
  });

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (rm || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
  }

  var slides = document.querySelectorAll('#heroSlider .slide');
  var features = document.querySelectorAll('#heroLead .feature');
  var slideNo = document.getElementById('slideNo');
  if (slides.length > 1 && !rm) {
    var cur = 0;
    window.setInterval(function () {
      slides[cur].classList.remove('is-active');
      if (features[cur]) features[cur].classList.remove('is-active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('is-active');
      if (features[cur]) features[cur].classList.add('is-active');
      if (slideNo) slideNo.textContent = ('0' + (cur + 1)).slice(-2);
    }, 4200);
  }

  function fmt(n) { return n.toLocaleString('en-US'); }
  function animateCount(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    var dur = 1600;
    if (rm) { el.textContent = fmt(to); return; }
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(Math.round(ease(p) * to));
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }
    window.requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            cio.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: rm ? 'auto' : 'smooth' });
    });
  });
})();
