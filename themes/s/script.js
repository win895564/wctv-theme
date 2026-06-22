
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
  var drawer = document.getElementById('mobileDrawer');
  if (bt) bt.addEventListener('click', function () {
    bt.classList.toggle('open');
    var exp = bt.classList.contains('open');
    bt.setAttribute('aria-expanded', exp ? 'true' : 'false');
    if (drawer) drawer.classList.toggle('open');
    if (mn) { mn.classList.toggle('open'); mn.classList.toggle('is-open'); mn.classList.toggle('active'); }
  });

  document.querySelectorAll('.m-parent').forEach(function (p) {
    p.addEventListener('click', function () {
      var sub = p.nextElementSibling;
      var open = p.getAttribute('aria-expanded') === 'true';
      p.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (sub) sub.classList.toggle('open', !open);
    });
  });

  var track = document.getElementById('slides');
  var slidesEls = track ? track.querySelectorAll('.slide') : [];
  if (track && slidesEls.length > 1) {
    var idx = 0, total = slidesEls.length, timer;
    var dotsWrap = document.getElementById('carDots');
    var dots = [];
    if (dotsWrap) {
      for (var d = 0; d < total; d++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', '第 ' + (d + 1) + ' 張');
        (function (n) { b.addEventListener('click', function () { go(n); reset(); }); })(d);
        dotsWrap.appendChild(b);
        dots.push(b);
      }
    }
    function render() {
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (dot, n) { dot.classList.toggle('on', n === idx); });
    }
    function go(n) { idx = (n + total) % total; render(); }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 4500); }
    var pn = document.getElementById('carPrev');
    var nx = document.getElementById('carNext');
    if (pn) pn.addEventListener('click', function () { prev(); reset(); });
    if (nx) nx.addEventListener('click', function () { next(); reset(); });
    render();
    reset();
  }
})();
