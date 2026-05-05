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

  // ── 7. (3D car handled by car3d.js ES module) ────────────────────
  function init3DCar_REMOVED() {
    var container = document.getElementById('car-3d-canvas');
    if (!container || typeof THREE === 'undefined') return;

    var W = container.clientWidth || 600;
    var H = container.clientHeight || 500;

    // Scene
    var scene = new THREE.Scene();

    // Camera
    var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(6.5, 4.5, 9);
    camera.lookAt(0, 0.6, 0);

    // Renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0xCC0000, 1.1, 18);
    rimLight.position.set(-6, 3.5, -4);
    scene.add(rimLight);

    var fillLight = new THREE.PointLight(0x2244aa, 0.35, 22);
    fillLight.position.set(6, 2, 7);
    scene.add(fillLight);

    // Floor
    var floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    var grid = new THREE.GridHelper(16, 16, 0x2a2a2a, 0x1e1e1e);
    grid.position.y = 0.002;
    scene.add(grid);

    // Materials
    var M = {
      body:  new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.88, roughness: 0.22 }),
      red:   new THREE.MeshStandardMaterial({ color: 0xCC0000, metalness: 0.55, roughness: 0.45 }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.25, roughness: 0.90 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x0c1e30, metalness: 0.05, roughness: 0.0, transparent: true, opacity: 0.70 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.05 }),
      bed:   new THREE.MeshStandardMaterial({ color: 0x090909, metalness: 0.4, roughness: 0.75 }),
      glow:  new THREE.MeshStandardMaterial({ color: 0xfff5cc, emissive: 0xfff5cc, emissiveIntensity: 0.55, metalness: 0.1, roughness: 0.1 }),
    };

    // [name, geometry, material, [x,y,z], [rx,ry,rz]?]
    var DEFS = [
      ['chassis',      new THREE.BoxGeometry(2.05, 0.22, 4.85), M.body,   [0, 0.11, 0]],
      ['cab',          new THREE.BoxGeometry(2.02, 0.72, 2.45), M.body,   [0, 0.72, -0.95]],
      ['roof',         new THREE.BoxGeometry(1.87, 0.12, 2.12), M.body,   [0, 1.12, -0.95]],
      ['hood',         new THREE.BoxGeometry(1.90, 0.12, 1.38), M.body,   [0, 0.79, -2.24], [-0.05, 0, 0]],
      ['bed-floor',    new THREE.BoxGeometry(1.90, 0.10, 1.98), M.bed,    [0, 0.53, 1.02]],
      ['bed-left',     new THREE.BoxGeometry(0.08, 0.46, 1.98), M.body,   [-0.97, 0.75, 1.02]],
      ['bed-right',    new THREE.BoxGeometry(0.08, 0.46, 1.98), M.body,   [0.97, 0.75, 1.02]],
      ['tailgate',     new THREE.BoxGeometry(1.90, 0.45, 0.10), M.body,   [0, 0.75, 2.01]],
      ['front-bumper', new THREE.BoxGeometry(2.12, 0.34, 0.28), M.red,    [0, 0.29, -2.58]],
      ['rear-bumper',  new THREE.BoxGeometry(2.12, 0.28, 0.22), M.chrome, [0, 0.29, 2.57]],
      ['grille',       new THREE.BoxGeometry(1.58, 0.28, 0.08), M.red,    [0, 0.53, -2.47]],
      ['windshield',   new THREE.BoxGeometry(1.76, 0.64, 0.07), M.glass,  [0, 0.93, -2.01], [0.28, 0, 0]],
      ['rear-win',     new THREE.BoxGeometry(1.72, 0.50, 0.07), M.glass,  [0, 0.89, -0.12], [-0.14, 0, 0]],
      ['win-left',     new THREE.BoxGeometry(0.07, 0.47, 1.62), M.glass,  [-1.0, 0.89, -1.0]],
      ['win-right',    new THREE.BoxGeometry(0.07, 0.47, 1.62), M.glass,  [1.0, 0.89, -1.0]],
      ['wheel-fl',     new THREE.CylinderGeometry(0.40, 0.40, 0.28, 24), M.wheel, [-1.13, 0.41, -1.74], [0, 0, Math.PI / 2]],
      ['wheel-fr',     new THREE.CylinderGeometry(0.40, 0.40, 0.28, 24), M.wheel, [1.13, 0.41, -1.74],  [0, 0, Math.PI / 2]],
      ['wheel-rl',     new THREE.CylinderGeometry(0.40, 0.40, 0.28, 24), M.wheel, [-1.13, 0.41, 1.53],  [0, 0, Math.PI / 2]],
      ['wheel-rr',     new THREE.CylinderGeometry(0.40, 0.40, 0.28, 24), M.wheel, [1.13, 0.41, 1.53],   [0, 0, Math.PI / 2]],
      ['head-l',       new THREE.BoxGeometry(0.46, 0.18, 0.08), M.glow,   [-0.63, 0.61, -2.47]],
      ['head-r',       new THREE.BoxGeometry(0.46, 0.18, 0.08), M.glow,   [0.63, 0.61, -2.47]],
      ['step-l',       new THREE.BoxGeometry(0.12, 0.09, 1.70), M.chrome, [-1.03, 0.30, -0.85]],
      ['step-r',       new THREE.BoxGeometry(0.12, 0.09, 1.70), M.chrome, [1.03, 0.30, -0.85]],
    ];

    var carGroup = new THREE.Group();
    scene.add(carGroup);

    var rng = (function () {
      var s = 42;
      return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 4294967296;
      };
    }());

    var parts = DEFS.map(function (def) {
      var name = def[0], geo = def[1], mat = def[2], pos = def[3], rot = def[4];
      var mesh = new THREE.Mesh(geo, mat);
      mesh.name = name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      var ap = new THREE.Vector3(pos[0], pos[1], pos[2]);
      var ar = rot ? new THREE.Euler(rot[0], rot[1], rot[2]) : new THREE.Euler();
      mesh.position.copy(ap);
      mesh.rotation.copy(ar);
      carGroup.add(mesh);

      // Compute scatter position
      var center = new THREE.Vector3(0, 0.6, 0);
      var dir = ap.clone().sub(center);
      if (dir.length() < 0.18) dir.set(rng() - 0.5, 1.5, rng() - 0.5);
      dir.normalize();
      var dist = 7 + rng() * 5;
      var sp = ap.clone().add(dir.clone().multiplyScalar(dist));
      sp.y = Math.max(sp.y, 0.3);
      var sr = new THREE.Euler(
        (rng() - 0.5) * Math.PI * 1.2,
        (rng() - 0.5) * Math.PI * 1.5,
        (rng() - 0.5) * Math.PI * 0.8
      );

      return {
        mesh: mesh, ap: ap, ar: ar, sp: sp, sr: sr,
        delay: rng() * 0.5,
        explodeTarget: null, explodeTargetRot: null,
        reFrom: null, reFromRot: null,
      };
    });

    // Start at scatter positions
    parts.forEach(function (p) {
      p.mesh.position.copy(p.sp);
      p.mesh.rotation.copy(p.sr);
      p.mesh.scale.setScalar(0.04);
    });

    // ── EASING ──
    function easeOutBack(t) {
      var c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function lerp(a, b, t) { return a + (b - a) * t; }

    // ── COMPUTE EXPLODE TARGETS ──
    function computeExplodeTargets() {
      var center = new THREE.Vector3(0, 0.5, 0);
      parts.forEach(function (p) {
        var dir = p.ap.clone().sub(center);
        if (dir.length() < 0.2) dir.set(rng() - 0.5, 1.2, rng() - 0.5);
        dir.normalize();
        var dist = 4.2 + rng() * 2.8;
        p.explodeTarget = p.ap.clone().add(dir.clone().multiplyScalar(dist));
        p.explodeTargetRot = {
          x: p.ar.x + (rng() - 0.5) * Math.PI * 0.7,
          y: p.ar.y + (rng() - 0.5) * Math.PI,
          z: p.ar.z + (rng() - 0.5) * Math.PI * 0.5
        };
      });
    }

    // ── STATE MACHINE ──
    var S = { ASSEMBLING: 0, IDLE: 1, EXPLODING: 2, HOLDING: 3, REASSEMBLING: 4 };
    var state = S.ASSEMBLING;
    var clock = new THREE.Clock();
    var stateT = 0;
    var ASSEMBLE_DUR = 2.8;
    var EXPLODE_DUR  = 1.6;
    var HOLD_DUR     = 2.8;
    var REASSEMBLE_DUR = 2.5;
    var IDLE_EXPLODE_AFTER = 8;

    // Badge hint overlay
    var badge = document.createElement('div');
    badge.className = 'car3d-explode-badge';
    badge.textContent = 'CLICK TO EXPLODE';
    container.style.position = 'relative';
    container.appendChild(badge);

    renderer.domElement.addEventListener('click', function () {
      var now = clock.getElapsedTime();
      if (state === S.IDLE) {
        state = S.EXPLODING; stateT = now;
        computeExplodeTargets();
        badge.textContent = 'CLICK TO REASSEMBLE';
        badge.classList.add('active');
      } else if (state === S.EXPLODING || state === S.HOLDING) {
        state = S.REASSEMBLING; stateT = now;
        parts.forEach(function (p) {
          p.reFrom = p.mesh.position.clone();
          p.reFromRot = { x: p.mesh.rotation.x, y: p.mesh.rotation.y, z: p.mesh.rotation.z };
        });
        badge.textContent = 'CLICK TO EXPLODE';
        badge.classList.remove('active');
      }
    });

    // ── ANIMATION LOOP ──
    function animate() {
      requestAnimationFrame(animate);
      var now = clock.getElapsedTime();
      var t = now - stateT;

      if (state === S.ASSEMBLING) {
        var allDone = true;
        parts.forEach(function (p) {
          var pt = Math.max(0, t - p.delay);
          var prog = Math.min(1, pt / ASSEMBLE_DUR);
          if (prog < 1) allDone = false;
          var e = easeOutBack(Math.min(prog, 1));
          p.mesh.position.lerpVectors(p.sp, p.ap, prog);
          p.mesh.rotation.x = lerp(p.sr.x, p.ar.x, e);
          p.mesh.rotation.y = lerp(p.sr.y, p.ar.y, e);
          p.mesh.rotation.z = lerp(p.sr.z, p.ar.z, e);
          p.mesh.scale.setScalar(lerp(0.04, 1, Math.min(prog * 3, 1)));
        });
        if (allDone) {
          parts.forEach(function (p) {
            p.mesh.position.copy(p.ap);
            p.mesh.rotation.copy(p.ar);
            p.mesh.scale.setScalar(1);
          });
          state = S.IDLE; stateT = now;
        }

      } else if (state === S.IDLE) {
        // Gentle oscillation
        carGroup.rotation.y = Math.sin(now * 0.28) * 0.5;
        if (t > IDLE_EXPLODE_AFTER) {
          state = S.EXPLODING; stateT = now;
          computeExplodeTargets();
          badge.textContent = 'CLICK TO REASSEMBLE';
          badge.classList.add('active');
        }

      } else if (state === S.EXPLODING) {
        var prog = Math.min(1, t / EXPLODE_DUR);
        var e = easeInOut(prog);
        parts.forEach(function (p) {
          p.mesh.position.lerpVectors(p.ap, p.explodeTarget, e);
          p.mesh.rotation.x = lerp(p.ar.x, p.explodeTargetRot.x, e);
          p.mesh.rotation.y = lerp(p.ar.y, p.explodeTargetRot.y, e);
          p.mesh.rotation.z = lerp(p.ar.z, p.explodeTargetRot.z, e);
        });
        if (prog >= 1) { state = S.HOLDING; stateT = now; }

      } else if (state === S.HOLDING) {
        // Slow drift of exploded parts
        parts.forEach(function (p, i) {
          p.mesh.position.y = p.explodeTarget.y + Math.sin(now * 0.6 + i * 0.4) * 0.08;
          p.mesh.rotation.y = p.explodeTargetRot.y + Math.sin(now * 0.4 + i * 0.5) * 0.05;
        });
        if (t > HOLD_DUR) {
          state = S.REASSEMBLING; stateT = now;
          parts.forEach(function (p) {
            p.reFrom = p.mesh.position.clone();
            p.reFromRot = { x: p.mesh.rotation.x, y: p.mesh.rotation.y, z: p.mesh.rotation.z };
          });
          badge.textContent = 'CLICK TO EXPLODE';
          badge.classList.remove('active');
        }

      } else if (state === S.REASSEMBLING) {
        var prog = Math.min(1, t / REASSEMBLE_DUR);
        var e = easeOutBack(Math.min(prog, 1));
        parts.forEach(function (p) {
          p.mesh.position.lerpVectors(p.reFrom, p.ap, prog);
          p.mesh.rotation.x = lerp(p.reFromRot.x, p.ar.x, e);
          p.mesh.rotation.y = lerp(p.reFromRot.y, p.ar.y, e);
          p.mesh.rotation.z = lerp(p.reFromRot.z, p.ar.z, e);
        });
        if (prog >= 1) {
          parts.forEach(function (p) {
            p.mesh.position.copy(p.ap);
            p.mesh.rotation.copy(p.ar);
          });
          carGroup.rotation.y = 0;
          state = S.IDLE; stateT = now;
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── RESPONSIVE RESIZE ──
    var ro = new ResizeObserver(function () {
      var w = container.clientWidth;
      var h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);
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
