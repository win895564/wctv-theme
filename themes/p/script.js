
(function () {

  var rev = document.querySelectorAll('.reveal');
  if (rev.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('in', 'is-visible', 'show', 'visible', 'active', 'revealed');
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  }

  var cs = document.querySelectorAll('.count,[data-target]');
  if (cs.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var t = parseInt(el.getAttribute('data-target') || el.textContent, 10) || 0;
        var s = performance.now();
        (function tick(n) {
          var p = Math.min((n - s) / 1400, 1);
          el.textContent = Math.floor(t * (1 - Math.pow(1 - p, 3))).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    cs.forEach(function (el) { cio.observe(el); });
  }

  var hd = document.querySelector('header') || document.querySelector('.nav');
  if (hd) addEventListener('scroll', function () { hd.classList.toggle('scrolled', scrollY > 10); }, { passive: true });

  var bt = document.querySelector('.hamburger,.nav-toggle,.nav-burger');
  var mn = document.querySelector('.nav-menu');
  if (bt && mn) bt.addEventListener('click', function () {
    mn.classList.toggle('open'); mn.classList.toggle('is-open'); mn.classList.toggle('active');
  });

  var parents = document.querySelectorAll('.nav-item.has-sub .nav-parent');
  parents.forEach(function (p) {
    p.addEventListener('click', function (e) {
      if (window.innerWidth > 760) return; // 桌機不攔截
      e.preventDefault();
      var item = p.closest('.nav-item');
      var open = item.classList.toggle('open');
      p.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  var hero = document.querySelector('.hero');
  if (hero) {
    var bgs = hero.querySelectorAll('.hero-slide');
    var feats = hero.querySelectorAll('.hero-feature');
    var dots = hero.querySelectorAll('.hero-dots button');
    var n = Math.max(bgs.length, feats.length);
    if (n > 1) {
      var hi = 0;
      var show = function (k) {
        if (bgs[hi]) bgs[hi].classList.remove('is-active');
        if (feats[hi]) feats[hi].classList.remove('is-active');
        if (dots[hi]) dots[hi].classList.remove('is-active');
        hi = (k + n) % n;
        if (bgs[hi]) bgs[hi].classList.add('is-active');
        if (feats[hi]) feats[hi].classList.add('is-active');
        if (dots[hi]) dots[hi].classList.add('is-active');
      };
      var timer = setInterval(function () { show(hi + 1); }, 5500);
      dots.forEach(function (d, k) {
        d.addEventListener('click', function () {
          show(k);
          clearInterval(timer);
          timer = setInterval(function () { show(hi + 1); }, 5500);
        });
      });
    }
  }
})();
