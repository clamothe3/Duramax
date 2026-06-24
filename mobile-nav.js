/**
 * Duramax — Mobile Navigation
 * Injects a hamburger toggle for .site-nav on small screens.
 */
(function () {
  var css = [
    '.nav-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;margin-left:6px;flex-shrink:0;}',
    '.nav-toggle span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;margin:5px 0;transition:transform 0.25s,opacity 0.25s;}',
    '.nav-toggle.active span:nth-child(1){transform:translateY(7px) rotate(45deg);}',
    '.nav-toggle.active span:nth-child(2){opacity:0;}',
    '.nav-toggle.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}',
    '@media (max-width: 860px) {',
      '.nav-toggle{display:block;}',
      '.nav-links{',
        'position:fixed;top:78px;left:50%;transform:translateX(-50%) translateY(-12px);',
        'width:min(380px, calc(100vw - 40px));',
        'background:rgba(10,10,10,0.97);backdrop-filter:blur(20px);',
        'border:1px solid rgba(255,255,255,0.08);border-radius:20px;',
        'flex-direction:column;align-items:stretch;gap:4px;padding:14px;',
        'opacity:0;pointer-events:none;visibility:hidden;',
        'transition:opacity 0.22s,transform 0.22s,visibility 0.22s;',
        'box-shadow:0 20px 60px rgba(0,0,0,0.5);',
        'max-height:calc(100vh - 100px);overflow-y:auto;',
      '}',
      '.nav-links.open{opacity:1;pointer-events:auto;visibility:visible;transform:translateX(-50%) translateY(0);}',
      '.nav-links a{padding:12px 16px;border-radius:12px;text-align:center;}',
      '.nav-links .nav-phone{order:10;margin-top:4px;text-align:center;padding:10px 16px;}',
      '.nav-links .nav-cta{order:11;text-align:center;margin-top:2px;}',
    '}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function init() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var links = nav.querySelector('.nav-links');
    if (!links) return;

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', 'Toggle menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(btn, links.nextSibling);

    btn.addEventListener('click', function () {
      links.classList.toggle('open');
      btn.classList.toggle('active');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        btn.classList.remove('active');
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        links.classList.remove('open');
        btn.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
