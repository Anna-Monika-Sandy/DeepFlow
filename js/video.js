// Initialization of the underwater video: autoplay handling + playback speed.
function initVideo() {
  window.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('#underwater-video');
    if (!video) return;

    // Speed for meditation: 0.3–0.5, 1 = normal, 0.5 = half speed
    video.playbackRate = 0.4;

    const tryPlay = () => {
      if (video.paused) {
        video.play().catch(err => console.warn('video play blocked:', err));
      }
    };

    tryPlay();
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, tryPlay);
    });
  });
}
