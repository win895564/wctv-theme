
(function () {
  "use strict";

  (function setDate() {
    var el = document.getElementById("todayDate");
    if (!el) return;
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    el.textContent = d.getFullYear() + "." + mm + "." + dd;
  })();

  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 16) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("navMenu");

  if (menu && !menu.querySelector(".mobile-cta")) {
    var ctaWrap = document.createElement("div");
    ctaWrap.className = "mobile-cta";
    ctaWrap.innerHTML =
      '<a href="#" class="btn btn-ghost">線上繳費</a>' +
      '<a href="#" class="btn btn-primary">立即申辦</a>';
    menu.appendChild(ctaWrap);
  }

  document.querySelectorAll(".nav-parent").forEach(function (parent) {
    parent.addEventListener("click", function (e) {
      if (window.innerWidth > 860) return; // 桌機由 CSS hover 處理
      e.preventDefault();
      var group = parent.closest(".nav-group");
      if (!group) return;
      var open = group.classList.toggle("open");
      parent.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  function closeMenu() {
    if (!menu || !burger) return;
    menu.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "開啟選單");
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
    });

    menu.querySelectorAll("a").forEach(function (a) {
      if (a.classList.contains("nav-parent")) return;
      a.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) {
        closeMenu();
        document.querySelectorAll(".nav-group.open").forEach(function (g) {
          g.classList.remove("open");
          var p = g.querySelector(".nav-parent");
          if (p) p.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;

            var siblings = Array.prototype.slice.call(
              el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el]
            );
            var idx = siblings.indexOf(el);
            el.style.transitionDelay = (idx > 0 ? idx * 70 : 0) + "ms";
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600;
    var start = null;

    function fmt(n) {
      return n.toLocaleString("en-US");
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);

      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = fmt(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  var nums = document.querySelectorAll(".stat-num");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    nums.forEach(function (el) {
      var t = parseInt(el.getAttribute("data-count"), 10) || 0;
      el.textContent = t.toLocaleString("en-US") + (el.getAttribute("data-suffix") || "");
    });
  } else {
    var statsIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statsIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach(function (el) { statsIO.observe(el); });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 14;
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });
})();
