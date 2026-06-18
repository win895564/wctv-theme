// 萬用補件:reveal 直接 inline 解除隱藏(繞過各主題 visible class 差異)+ count-up + nav 捲動 + 漢堡 + 輪播(best-effort)
(function () {
  // 1) 捲動淡入 — 直接設 inline,保證顯示
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

  // 2) 數字 count-up
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

  // 3) 導覽列捲動加 class
  var hd = document.querySelector('header') || document.querySelector('.nav');
  if (hd) addEventListener('scroll', function () { hd.classList.toggle('scrolled', scrollY > 10); }, { passive: true });

  // 4) 手機漢堡
  var bt = document.querySelector('.hamburger,.nav-toggle,.nav-burger');
  var mn = document.querySelector('.nav-menu');
  if (bt && mn) bt.addEventListener('click', function () {
    mn.classList.toggle('open'); mn.classList.toggle('is-open'); mn.classList.toggle('active');
  });

  // 5) 輪播自動切換(固定模板:每張一篇精選文章)+ 圓點同步
  var box = document.querySelector('.slides,.hero-slider,.hero-slides,.carousel');
  if (box) {
    var sl = box.querySelectorAll('.slide,.hero-slide');
    if (sl.length > 1) {
      var act = sl[0].classList.contains('active') && !sl[0].classList.contains('is-active') ? 'active' : 'is-active';
      var i = 0;
      var dotsWrap = document.getElementById('sliderDots');
      var dots = [];
      function show(n) {
        sl[i].classList.remove('is-active', 'active');
        if (dots[i]) dots[i].classList.remove('active');
        i = (n + sl.length) % sl.length;
        sl[i].classList.add(act);
        if (dots[i]) dots[i].classList.add('active');
      }
      if (dotsWrap) {
        sl.forEach(function (_, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', '切換到第 ' + (idx + 1) + ' 張');
          if (idx === 0) b.classList.add('active');
          b.addEventListener('click', function () { show(idx); restart(); });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
      }
      var timer;
      function restart() { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 4500); }
      restart();
    }
  }

  // 6) navbar 下拉:手機點父項展開折疊(桌機交給 CSS :hover)
  var parents = document.querySelectorAll('.nav-parent');
  parents.forEach(function (p) {
    p.addEventListener('click', function (ev) {
      if (window.innerWidth > 760) return; // 桌機由 hover 處理
      ev.preventDefault();
      var grp = p.closest('.nav-group');
      if (!grp) return;
      var willOpen = !grp.classList.contains('open');
      document.querySelectorAll('.nav-group.open').forEach(function (g) { if (g !== grp) g.classList.remove('open'); });
      grp.classList.toggle('open', willOpen);
      p.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
})();
