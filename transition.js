/**
 * Duramax — Page Transition
 * Injects a full-screen logo overlay that sweeps in/out between pages.
 * Place <script src="transition.js"></script> as the first tag inside <body>.
 */
(function () {
  /* ── 1. Inject CSS ── */
  var style = document.createElement('style');
  style.textContent = [
    '#pt-overlay{',
      'position:fixed;inset:0;z-index:9999;',
      'background:#0a0a0a;',
      'display:flex;align-items:center;justify-content:center;',
      'pointer-events:all;',
      'will-change:transform;',
    '}',
    '.pt-inner{',
      'display:flex;flex-direction:column;align-items:center;gap:22px;',
      'text-align:center;',
    '}',
    '.pt-logo-wrap{',
      'position:relative;display:inline-flex;',
      'align-items:center;justify-content:center;',
    '}',
    '.pt-logo-wrap::before,.pt-logo-wrap::after{',
      'content:"";position:absolute;border-radius:50%;',
      'border:1px solid rgba(204,0,0,0.28);',
      'animation:pt-ring 2.6s ease-in-out infinite;',
    '}',
    '.pt-logo-wrap::before{inset:-14px;}',
    '.pt-logo-wrap::after{',
      'inset:-30px;',
      'border-color:rgba(204,0,0,0.12);',
      'animation-delay:.55s;',
    '}',
    '@keyframes pt-ring{',
      '0%,100%{opacity:.45;transform:scale(1);}',
      '50%{opacity:1;transform:scale(1.05);}',
    '}',
    '.pt-logo-img{',
      'width:90px;height:90px;border-radius:50%;',
      'object-fit:cover;display:block;',
      'box-shadow:0 0 48px rgba(204,0,0,0.3),0 0 0 2px rgba(204,0,0,0.18);',
    '}',
    '.pt-wordmark strong{',
      'display:block;',
      'font-family:"Bebas Neue",sans-serif;',
      'font-size:48px;color:#fff;letter-spacing:6px;line-height:1;',
    '}',
    '.pt-wordmark span{',
      'display:block;',
      'font-family:"Barlow Condensed",sans-serif;',
      'font-size:11px;font-weight:700;',
      'color:#CC0000;letter-spacing:7px;text-transform:uppercase;',
      'margin-top:6px;',
    '}',
    '.pt-rule{',
      'width:0;height:1px;',
      'background:#CC0000;',
      'box-shadow:0 0 12px rgba(204,0,0,0.7);',
      'transition:width .0s;',
    '}',
    '.pt-rule.grow{',
      'animation:pt-rule-grow .75s .25s cubic-bezier(.25,.46,.45,.94) forwards;',
    '}',
    '@keyframes pt-rule-grow{to{width:60px;}}',
  ].join('');
  document.head.appendChild(style);

  /* ── 2. Inject overlay HTML ── */
  var overlay = document.createElement('div');
  overlay.id = 'pt-overlay';
  overlay.innerHTML =
    '<div class="pt-inner">' +
      '<div class="pt-logo-wrap">' +
        '<img class="pt-logo-img" src="logo-1777475435311.webp" alt="Duramax">' +
      '</div>' +
      '<div class="pt-wordmark">' +
        '<strong>DURAMAX</strong>' +
        '<span>Body Shop</span>' +
      '</div>' +
      '<div class="pt-rule grow" id="pt-rule"></div>' +
    '</div>';

  // Insert as very first element in <body> so it covers content immediately
  if (document.body) {
    document.body.insertBefore(overlay, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(overlay, document.body.firstChild);
    });
  }

  /* ── 3. Exit animation on page load ── */
  function slideOut() {
    overlay.style.transition = 'transform .6s cubic-bezier(.76,0,.24,1)';
    overlay.style.transform  = 'translateY(-100%)';
    overlay.addEventListener('transitionend', function () {
      overlay.style.pointerEvents = 'none';
    }, { once: true });
  }

  // Hold briefly so the logo is visible, then reveal page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(slideOut, 360);
    });
  } else {
    setTimeout(slideOut, 360);
  }

  /* ── 4. Enter animation on link click ── */
  function slideIn(dest) {
    // Snap overlay to below viewport (no transition)
    overlay.style.transition = 'none';
    overlay.style.transform  = 'translateY(100%)';
    overlay.style.pointerEvents = 'all';

    // Replay the red rule grow animation
    var rule = document.getElementById('pt-rule');
    if (rule) {
      rule.classList.remove('grow');
      rule.style.width = '0';
      rule.offsetHeight; // force reflow
      rule.classList.add('grow');
    }

    // Force reflow, then animate in
    overlay.offsetHeight;
    overlay.style.transition = 'transform .46s cubic-bezier(.76,0,.24,1)';
    overlay.style.transform  = 'translateY(0)';

    // Navigate once overlay fully covers the screen
    setTimeout(function () { window.location.href = dest; }, 650);
  }

  // Use event delegation so dynamically injected links also work
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    // Skip external, anchor, tel, mailto links
    if (!href || /^(tel:|mailto:|https?:|#|javascript)/i.test(href)) return;
    e.preventDefault();
    slideIn(href);
  });
})();
