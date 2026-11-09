(() => {
  const figure = document.getElementById('adapt-figure');
  const video = document.getElementById('adapt-video');
  if (!figure || !video) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value) => Math.min(1, Math.max(0, value));
  let visible = false;
  let userPaused = false;

  const updateAirflow = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const time = video.currentTime;
    const start = Math.max(0, video.duration - 2.3);
    const end = Math.max(start + 0.1, video.duration - 1.2);
    figure.style.setProperty('--cooling-opacity', String(clamp((time - start) / (end - start))));
  };

  const playWhenVisible = () => {
    if (visible && !document.hidden && !reducedMotion.matches && !video.ended && !userPaused) {
      video.play().catch(() => {});
    } else if (!visible || document.hidden || reducedMotion.matches) {
      video.pause();
    }
  };

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    playWhenVisible();
  }, { threshold: 0.45 }).observe(figure);

  for (const event of ['loadedmetadata', 'timeupdate', 'seeking', 'seeked', 'ended']) {
    video.addEventListener(event, updateAirflow);
  }
  video.addEventListener('pause', () => {
    if (visible && !document.hidden && !reducedMotion.matches && !video.ended) userPaused = true;
  });
  video.addEventListener('play', () => { userPaused = false; });
  reducedMotion.addEventListener('change', playWhenVisible);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else playWhenVisible();
  });
})();
