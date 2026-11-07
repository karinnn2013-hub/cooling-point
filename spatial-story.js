(() => {
  const story = document.querySelector('#spatial-bridge.spatial-story');
  const sticky = story?.querySelector('.spatial-story-sticky');
  const stage = story?.querySelector('.spatial-story-stage');
  if (!story || !sticky || !stage) return;

  const workers = [...story.querySelectorAll('.spatial-worker')];
  const routes = [...story.querySelectorAll('[data-work-route]')];
  if (!workers.length || !routes.length) return;

  const header = document.querySelector('.topbar');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let needsMeasure = true;
  let stickyTop = 12;
  let travel = 1;
  let previousProgress = null;
  let staticFlow = null;
  let reduced = null;
  let shortViewport = null;

  const isShortViewport = () => window.innerHeight < 560;
  const needsStaticFlow = () => reducedMotion.matches || isShortViewport();

  const clamp = value => Math.min(1, Math.max(0, value));
  const ramp = (value, start, end) => {
    const fraction = clamp((value - start) / (end - start));
    return fraction * fraction * (3 - 2 * fraction);
  };
  const setNumber = (element, property, value, unit = '') => {
    const next = `${value.toFixed(4)}${unit}`;
    if (element.style.getPropertyValue(property) !== next) {
      element.style.setProperty(property, next);
    }
  };

  const render = progress => {
    if (previousProgress !== null && Math.abs(previousProgress - progress) < 0.0001) return;
    previousProgress = progress;

    workers.forEach((worker, position) => {
      const declaredIndex = Number(worker.dataset.workerIndex);
      const index = Number.isFinite(declaredIndex) ? declaredIndex : position;
      const offset = clamp(index / Math.max(1, workers.length - 1)) * 0.072;
      const opacity = ramp(progress, 0.02 + offset, 0.12 + offset);
      setNumber(worker, '--worker-opacity', opacity);
      setNumber(worker, '--worker-y', (1 - opacity) * 6, 'px');
    });

    routes.forEach((route, position) => {
      const offset = position / Math.max(1, routes.length - 1) * 0.025;
      const drawn = ramp(progress, 0.22 + offset, 0.405 + offset);
      const next = (1 - drawn).toFixed(4);
      if (route.style.strokeDashoffset !== next) route.style.strokeDashoffset = next;
    });

    const relief = ramp(progress, 0.48, 0.60);
    setNumber(story, '--spatial-route-opacity', ramp(progress, 0.22, 0.25));
    setNumber(story, '--spatial-relief-opacity', relief);
    setNumber(story, '--spatial-relief-y', (1 - relief) * 12, 'px');
    setNumber(story, '--spatial-map-opacity', ramp(progress, 0.64, 0.82));
    setNumber(story, '--spatial-highlight-opacity', ramp(progress, 0.84, 0.94));

    const phase = progress < 0.02 ? 'waiting'
      : progress < 0.22 ? 'workers'
        : progress < 0.48 ? 'routes'
          : progress < 0.64 ? 'relief'
            : progress < 0.84 ? 'map'
              : progress < 0.94 ? 'highlight' : 'complete';
    story.dataset.spatialPhase = phase;
    story.dataset.spatialProgress = progress.toFixed(3);
  };

  const measure = () => {
    needsMeasure = false;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    stickyTop = Math.round(headerHeight + 12);
    const nextTop = `${stickyTop}px`;
    if (story.style.getPropertyValue('--spatial-sticky-top') !== nextTop) {
      story.style.setProperty('--spatial-sticky-top', nextTop);
    }
    travel = Math.max(1, story.offsetHeight - sticky.offsetHeight);
  };

  const update = () => {
    frame = 0;
    if (needsStaticFlow() !== staticFlow || reducedMotion.matches !== reduced
      || isShortViewport() !== shortViewport) {
      setMotionMode();
      return;
    }
    if (needsMeasure) measure();
    const bounds = story.getBoundingClientRect();
    story.dataset.spatialVisible = String(!document.hidden
      && bounds.bottom > stickyTop && bounds.top < window.innerHeight);
    if (staticFlow) {
      render(1);
      return;
    }
    const progress = clamp((stickyTop - bounds.top) / travel);
    render(progress);
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const scheduleMeasure = () => {
    needsMeasure = true;
    schedule();
  };

  const setMotionMode = () => {
    staticFlow = needsStaticFlow();
    reduced = reducedMotion.matches;
    shortViewport = isShortViewport();
    previousProgress = null;
    if (reduced) story.classList.add('is-reduced');
    else story.classList.remove('is-reduced');
    if (shortViewport) story.classList.add('is-static');
    else story.classList.remove('is-static');
    if (staticFlow) {
      story.classList.remove('is-enhanced');
      needsMeasure = true;
      update();
      return;
    }
    // Set the first frame before enabling the long sticky track. The initial
    // update then measures that enhanced track before the browser paints.
    render(0);
    measure();
    story.classList.add('is-enhanced');
    needsMeasure = true;
    previousProgress = null;
    update();
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('pageshow', scheduleMeasure);
  window.addEventListener('hashchange', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure, { once: true });
  window.visualViewport?.addEventListener('resize', scheduleMeasure, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) story.dataset.spatialVisible = 'false';
    else scheduleMeasure();
  });
  reducedMotion.addEventListener?.('change', setMotionMode);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(stage);
    if (header) resizeObserver.observe(header);
  }
  document.fonts?.ready.then(scheduleMeasure).catch(() => {});
  setMotionMode();
})();
