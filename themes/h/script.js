/* ============================================================
   哈Net — H 消息雜誌式首頁 互動腳本
   純 vanilla JS，無外部依賴
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 今日日期 ---------- */
  (function setDate() {
    var el = document.getElementById("todayDate");
    if (!el) return;
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    el.textContent = d.getFullYear() + "." + mm + "." + dd;
  })();

  /* ---------- 導覽列捲動變化 ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 16) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 手機漢堡選單 ---------- */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("navMenu");

  // 為行動版選單注入 CTA（桌機隱藏，行動版顯示在展開選單底部）
  if (menu && !menu.querySelector(".mobile-cta")) {
    var ctaWrap = document.createElement("div");
    ctaWrap.className = "mobile-cta";
    ctaWrap.innerHTML =
      '<a href="#" class="btn btn-ghost">線上繳費</a>' +
      '<a href="#" class="btn btn-primary">立即申辦</a>';
    menu.appendChild(ctaWrap);
  }

  /* ---------- 下拉子選單：桌機交給 CSS :hover；手機點父項展開 ---------- */
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
    // 點選單連結後自動收合（父項展開鈕除外）
    menu.querySelectorAll("a").forEach(function (a) {
      if (a.classList.contains("nav-parent")) return;
      a.addEventListener("click", closeMenu);
    });
    // 視窗放大回桌機尺寸時收合
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

  /* ---------- 捲動淡入 (IntersectionObserver) ---------- */
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
            // 同組元素輕微階梯延遲
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

  /* ---------- 數據 count-up ---------- */
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
      // easeOutCubic
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

  /* ---------- 平滑錨點（補強 file:// 下的偏移，避開固定導覽列） ---------- */
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
