/* ── DURAMAX ANIMATIONS v1.0 ── */
(function () {
  'use strict';

  // ── 1. PAGE TRANSITIONS ──────────────────────────────────────────
  function initPageTransitions() {
    // Fade in on load
    window.addEventListener('pageshow', function (e) {
      document.body.classList.remove('page-out');
    });

    // Fade out on navigate
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('tel:') ||
          href.startsWith('mailto:') || href.startsWith('http') ||
          link.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('page-out');
      setTimeout(function () { window.location.href = href; }, 420);
    });
  }

  // ── 2. SCROLL REVEAL ─────────────────────────────────────────────
  var REVEAL_SELECTORS = [
    '.section-header > *',
    '.about-strip-content > *',
    '.about-strip-stats > div',
    '.cta-block > *',
    '.page-hero > *',
    '.about-intro-text > *',
    '.stats-row .stat-block',
  ];
  var CARD_SELECTORS = [
    '.service-card', '.value-card', '.team-card',
    '.svc-item', '.pkg-card', '.review-card',
  ];

  function initScrollReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    REVEAL_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.classList.contains('reveal-anim')) {
          el.classList.add('reveal-anim');
          observer.observe(el);
        }
      });
    });

    // Cards: stagger by index within their parent grid
    CARD_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (!el.classList.contains('reveal-anim')) {
          el.classList.add('reveal-anim', 'from-scale');
          el.style.transitionDelay = (i % 8) * 0.07 + 's';
          observer.observe(el);
        }
      });
    });

    // Any manually placed .reveal-anim elements
    document.querySelectorAll('.reveal-anim:not(.visible)').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── 3. ANIMATED COUNTERS ─────────────────────────────────────────
  function initCounters() {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.stat-num, .stat-big, .score-num').forEach(function (el) {
      var text = el.textContent.trim();
      // Match: optional prefix, number (with commas/dots), optional suffix
      var m = text.match(/^([^\d]*)(\d[\d,.]*)(\D*)$/);
      if (!m) return;
      el.dataset._pre = m[1];
      el.dataset._val = m[2].replace(/,/g, '');
      el.dataset._suf = m[3];
      counterObs.observe(el);
    });
  }

  function runCounter(el) {
    var target = parseFloat(el.dataset._val);
    var pre = el.dataset._pre || '';
    var suf = el.dataset._suf || '';
    if (isNaN(target)) return;
    var duration = 1800;
    var start = performance.now();
    var useCommas = el.dataset._val.includes(',') || target >= 1000;

    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = Math.round(eased * target);
      el.textContent = pre + (useCommas ? val.toLocaleString() : val) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── 4. RATING BAR ANIMATION (reviews page) ───────────────────────
  function initRatingBars() {
    var bars = document.querySelectorAll('.bar-fill');
    if (!bars.length) return;

    var barObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var w = el.style.width;
          el.style.setProperty('--bar-w', w);
          el.style.width = '0';
          // Force reflow
          el.getBoundingClientRect();
          el.classList.add('animated');
          barObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(function (b) { barObs.observe(b); });
  }

  // ── 5. 3D CARD TILT ──────────────────────────────────────────────
  function initTiltCards() {
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'perspective(700px) rotateX(' + (-y * 11) + 'deg) rotateY(' + (x * 11) + 'deg) translateY(-4px) scale(1.02)';
        card.style.transition = 'transform 0.08s ease, border-color 0.2s, box-shadow 0.2s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, box-shadow 0.2s';
      });
    });
  }

  // ── 6. HERO PARALLAX ─────────────────────────────────────────────
  function initParallax() {
    var heroBg = document.querySelector('.hero-video-bg');
    if (!heroBg) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          heroBg.style.transform = 'translateY(' + (window.scrollY * 0.32) + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── INIT ─────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initPageTransitions();
    initScrollReveal();
    initCounters();
    initRatingBars();
    initTiltCards();
    initParallax();
    // 3D car is handled by car3d.js (ES module) on the homepage
  });

}());
