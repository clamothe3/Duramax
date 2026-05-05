const section  = document.querySelector('.car3d-section');
const video    = document.getElementById('car-video');
const progress = document.getElementById('scrub-progress');

if (!section || !video) {
  console.warn('car3d: missing section or video element');
} else {
  video.pause();
  video.currentTime = 0;

  function getScrubHeight() {
    return section.offsetHeight - window.innerHeight;
  }

  function onScroll() {
    const rect     = section.getBoundingClientRect();
    const scrolled = -rect.top;
    const total    = getScrubHeight();
    const pct      = Math.max(0, Math.min(1, scrolled / total));
    if (video.duration) video.currentTime = pct * video.duration;
    if (progress) progress.style.width = (pct * 100) + '%';
  }

  video.addEventListener('loadedmetadata', () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });

  if (video.readyState >= 1) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}