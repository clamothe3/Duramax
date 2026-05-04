// car3d.js — Video scroll scrub (replaces Three.js animation)

const section  = document.querySelector('.car3d-section');
const video    = document.getElementById('car-video');
const progress = document.getElementById('scrub-progress');

if (!section || !video) {
  console.warn('car3d: missing section or video element');
} else {
  // Don't let the browser autoplay — we control time manually
  video.pause();
  video.currentTime = 0;

  // How many pixels of scrolling = full video playback
  // Section height is set to 300vh in CSS, so ~2x viewport of scroll room
  function getScrubHeight() {
    return section.offsetHeight - window.innerHeight;
  }

  function onScroll() {
    const rect      = section.getBoundingClientRect();
    const scrolled  = -rect.top;                        // px scrolled into section
    const total     = getScrubHeight();
    const pct       = Math.max(0, Math.min(1, scrolled / total));

    if (video.duration) {
      video.currentTime = pct * video.duration;
    }

    // Update progress bar
    if (progress) progress.style.width = (pct * 100) + '%';

    // Fade text out as you scroll past 60%
    const textEl = section.querySelector('.car3d-text');
    if (textEl) {
      const fade = Math.max(0, 1 - (pct - 0.3) / 0.3);
      textEl.style.opacity = fade;
    }
  }

  // Wait for metadata so video.duration is available
  video.addEventListener('loadedmetadata', () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load in case page is already scrolled
  });

  // Fallback: if metadata already loaded
  if (video.readyState >= 1) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}