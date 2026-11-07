(() => {
  const story = document.getElementById('adapt-scroll-story');
  const study = document.getElementById('adapt');
  const figure = document.getElementById('adapt-figure');
  const base = document.getElementById('adapt-frame-base');
  if (!story || !study || !figure || !base) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const assetRoot = 'assets/renders/solarhouse-scroll/';
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let frames = [];
  let frontIndex = 16;
  let requestedFrame = false;
  let preloadStarted = false;
  const cache = new Map();
  const loaded = new Set();

  const requestPaint = () => {
    if (requestedFrame) return;
    requestedFrame = true;
    requestAnimationFrame(paint);
  };

  const loadFrame = (index) => {
    if (!cache.has(index)) {
      const image = new Image();
      const ready = new Promise((resolve) => {
        image.onload = () => {
          loaded.add(index);
          requestPaint();
          resolve(true);
        };
        image.onerror = () => resolve(false);
      });
      image.decoding = 'async';
      image.src = frames[index];
      cache.set(index, { image, ready });
    }
    return cache.get(index).ready;
  };

  const preload = async () => {
    if (preloadStarted || !frames.length) return;
    preloadStarted = true;
    const priorities = [...new Set([0, frontIndex, frames.length - 1,
      ...frames.map((_, index) => index)])];
    let cursor = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (cursor < priorities.length) await loadFrame(priorities[cursor++]);
    }));
  };

  const showFrame = (index) => {
    if (!frames.length || !loaded.size) return null;
    const target = Math.round(index);
    const nearest = loaded.has(target) ? target : [...loaded].reduce((a, b) =>
      Math.abs(b - index) < Math.abs(a - index) ? b : a);
    if (base.getAttribute('src') !== frames[nearest]) base.src = frames[nearest];
    if (!loaded.has(target)) loadFrame(target);
    return nearest;
  };

  function paint() {
    requestedFrame = false;
    const bounds = story.getBoundingClientRect();
    const headerHeight = story.querySelector('.dashboard-card-head').offsetHeight;
    const stickyTop = Number.parseFloat(getComputedStyle(study).top) || 84;
    const travel = Math.max(1, story.offsetHeight - study.offsetHeight - headerHeight);
    const progress = clamp((stickyTop - bounds.top - headerHeight) / travel);
    const camera = clamp((progress - 0.08) / 0.40);
    const opening = clamp((progress - 0.58) / 0.31);
    const phase = motion.matches
      ? progress < 0.30 ? 'roof' : progress < 0.74 ? 'front' : 'open'
      : progress < 0.48 ? 'roof' : progress < 0.58 ? 'front' : 'open';
    let frameIndex = camera * frontIndex + opening * (frames.length - 1 - frontIndex);
    if (motion.matches) frameIndex = progress < 0.30 ? 0 : progress < 0.74 ? frontIndex : frames.length - 1;
    const displayedIndex = showFrame(Math.max(0, frameIndex));
    const displayedOpening = displayedIndex === null ? 0
      : clamp((displayedIndex - frontIndex) / (frames.length - 1 - frontIndex));
    figure.dataset.phase = phase;
    figure.style.setProperty('--scroll-progress', String(progress));
    const coolingOpacity = motion.matches ? Number(displayedOpening === 1)
      : clamp((displayedOpening - 0.28) / 0.65);
    figure.style.setProperty('--cooling-opacity', String(coolingOpacity));
    base.alt = displayedOpening > 0.5
      ? 'Front axonometric view of the solar room with doors and windows opening; blue arrows illustrate cooling airflow'
      : camera >= 1 ? 'Front axonometric view of the solar room with closed doors and windows'
      : 'Turning from the roof plan showing 36 photovoltaic panels toward the front axonometric view';
  }

  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint, { passive: true });
  motion.addEventListener('change', requestPaint);
  new ResizeObserver(requestPaint).observe(study);
  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) preload();
  }, { rootMargin: '1400px 0px' }).observe(story);

  fetch(assetRoot + 'manifest.json?v=scroll-space-20261106')
    .then((response) => {
      if (!response.ok) throw new Error('Frame manifest unavailable');
      return response.json();
    })
    .then((manifest) => {
      frames = manifest.frames.map((frame) => assetRoot + (typeof frame === 'string' ? frame : frame.file));
      frontIndex = manifest.front_index;
      const bounds = story.getBoundingClientRect();
      if (bounds.top < window.innerHeight + 1400 && bounds.bottom > -1400) preload();
      requestPaint();
    })
    .catch(() => {
      frames = [assetRoot + 'frame-000.webp',
        assetRoot + 'frame-016.webp', assetRoot + 'frame-031.webp'];
      frontIndex = 1;
      preload();
      requestPaint();
    });
  requestPaint();
})();
