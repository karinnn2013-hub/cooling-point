(() => {
  const study = document.getElementById('adapt');
  const figure = document.getElementById('adapt-figure');
  const toggle = document.getElementById('shading-note-toggle');
  const playToggle = document.getElementById('adapt-play-toggle');
  const overlay = document.getElementById('shading-annotation');
  const copy = document.getElementById('shading-note-copy');
  if (!study || !figure || !toggle || !playToggle || !overlay || !copy) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modeButtons = [...study.querySelectorAll('[data-adapt-mode]')];
  const viewButtons = [...study.querySelectorAll('[data-adapt-view]')];
  const closedModel = document.getElementById('adapt-model-closed');
  const openModel = document.getElementById('adapt-model-open');
  const workerImages = [...study.querySelectorAll('.adapt-workers')];
  if (!closedModel || !openModel) return;

  const renderCache = new Map();
  let annotationVisible = false;
  let pendingJumpReveal = false;
  let jumpObserver;
  let revealGeneration = 0;
  let renderGeneration = 0;
  let playing = false;
  let playGeneration = 0;
  let playbackTimers = [];
  let autoPlayed = false;
  let currentView = 'front';
  let displayedView = 'front';

  const renderPath = (view, state) =>
    `assets/renders/solarhouse-${view === 'roof' ? 'top' : 'front'}-${state}.png?v=pv-layout-20261106`;

  // Decode offscreen first, keeping the current view visible while another loads.
  const loadRender = (path) => {
    if (!renderCache.has(path)) {
      const image = new Image();
      const loaded = new Promise((resolve) => {
        image.addEventListener('load', () => resolve(true), { once: true });
        image.addEventListener('error', () => resolve(false), { once: true });
      });
      image.decoding = 'async';
      image.src = path;
      const ready = image.complete
        ? Promise.resolve(image.naturalWidth > 0)
        : loaded;
      renderCache.set(path, ready.then(async (ok) => {
        if (!ok) {
          renderCache.delete(path);
          return false;
        }
        try { await image.decode(); } catch { /* A loaded image can still display. */ }
        return image.naturalWidth > 0;
      }));
    }
    return renderCache.get(path);
  };

  const updateWorkers = () => {
    workerImages.forEach((image) => {
      image.classList.remove('is-active');
      image.setAttribute('aria-hidden', 'true');
    });
  };

  const setAnnotation = (show) => {
    revealGeneration += 1;
    annotationVisible = show && currentView === 'front' && displayedView === 'front';
    toggle.setAttribute('aria-expanded', String(annotationVisible));
    copy.setAttribute('aria-hidden', String(!annotationVisible));
    overlay.setAttribute('aria-hidden', String(!annotationVisible));
    figure.classList.toggle('is-annotated', annotationVisible);
  };

  const setView = async (view) => {
    if (!['front', 'roof'].includes(view)) return false;
    const generation = ++renderGeneration;
    currentView = view;
    figure.dataset.view = view;
    viewButtons.forEach((button) => {
      const selected = button.dataset.adaptView === view;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (view === 'roof' && annotationVisible) setAnnotation(false);
    updateWorkers();
    figure.setAttribute('aria-busy', 'true');
    const occupied = view === 'front' && figure.dataset.useMode === 'occupied';
    const paths = [renderPath(view, 'closed'), renderPath(view, occupied ? 'occupied' : 'open')];
    const loaded = await Promise.all(paths.map(loadRender));
    if (generation !== renderGeneration) return false;
    figure.setAttribute('aria-busy', 'false');
    if (!loaded.every(Boolean)) {
      currentView = displayedView;
      figure.dataset.view = displayedView;
      viewButtons.forEach((button) => {
        const selected = button.dataset.adaptView === displayedView;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      updateWorkers();
      return false;
    }
    [closedModel, openModel].forEach((image, index) => {
      image.src = paths[index];
      const state = index === 0 ? 'closed doors' : occupied ? 'open doors and seated workers' : 'open doors';
      image.alt = `${view === 'roof' ? 'Top view showing rooftop photovoltaic arrays' : 'Front axonometric view of the solar house'}, with ${state}`;
    });
    displayedView = view;
    updateWorkers();
    return true;
  };

  const setMode = (mode, view = currentView) => {
    if (!['everyday', 'recovery', 'occupied'].includes(mode)) return Promise.resolve(false);
    const previousMode = figure.dataset.useMode;
    const open = mode !== 'everyday';
    figure.dataset.useMode = mode;
    modeButtons.forEach((button) => {
      const selected = button.dataset.adaptMode === mode;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    closedModel.classList.toggle('is-active', !open);
    openModel.classList.toggle('is-active', open);
    closedModel.setAttribute('aria-hidden', String(open));
    openModel.setAttribute('aria-hidden', String(!open));
    if (!open && annotationVisible) setAnnotation(false);
    // Each state change starts a new render generation, invalidating any older
    // view request that might otherwise restore the wrong occupied variant.
    const targetView = mode === 'occupied' && previousMode !== 'occupied' && view === 'roof'
      ? 'front' : view;
    return setView(targetView);
  };

  const stopPlayback = (mode = 'recovery') => {
    playGeneration += 1;
    playbackTimers.forEach(window.clearTimeout);
    playbackTimers = [];
    playing = false;
    playToggle.setAttribute('aria-pressed', 'false');
    setMode(mode);
  };

  const startPlayback = async () => {
    const generation = ++playGeneration;
    playbackTimers.forEach(window.clearTimeout);
    playbackTimers = [];
    playing = true;
    autoPlayed = true;
    pendingJumpReveal = false;
    jumpObserver?.disconnect();
    setAnnotation(false);
    playToggle.setAttribute('aria-pressed', 'true');
    const ready = await setMode('everyday', 'front');
    if (!playing || generation !== playGeneration) return;
    if (!ready) {
      stopPlayback('everyday');
      return;
    }
    // Keep the reference axonometric angle fixed while the space opens for use.
    playbackTimers.push(window.setTimeout(() => {
      if (playing && generation === playGeneration) setMode('recovery');
    }, 1650));
    playbackTimers.push(window.setTimeout(() => {
      if (playing && generation === playGeneration) setMode('occupied');
    }, 3300));
    playbackTimers.push(window.setTimeout(() => {
      if (generation !== playGeneration) return;
      playing = false;
      playbackTimers = [];
      playToggle.setAttribute('aria-pressed', 'false');
    }, 5300));
  };

  const revealAfterJump = () => {
    const generation = ++revealGeneration;
    pendingJumpReveal = true;
    jumpObserver?.disconnect();
    const renderReady = setMode('recovery', 'front');
    const reveal = async () => {
      if (!pendingJumpReveal || generation !== revealGeneration) return;
      pendingJumpReveal = false;
      jumpObserver?.disconnect();
      const ready = await renderReady;
      if (!ready || generation !== revealGeneration) return;
      requestAnimationFrame(() => {
        if (generation === revealGeneration) setAnnotation(true);
      });
    };
    if ('IntersectionObserver' in window) {
      jumpObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
      }, { rootMargin: '-82px 0px -12% 0px', threshold: 0.12 });
      jumpObserver.observe(figure);
    } else {
      window.setTimeout(reveal, reducedMotion.matches ? 0 : 450);
    }
  };

  modeButtons.forEach((button) => button.addEventListener('click', () => {
    autoPlayed = true;
    pendingJumpReveal = false;
    revealGeneration += 1;
    jumpObserver?.disconnect();
    if (playing) stopPlayback(button.dataset.adaptMode);
    else setMode(button.dataset.adaptMode);
  }));
  viewButtons.forEach((button) => button.addEventListener('click', () => {
    autoPlayed = true;
    pendingJumpReveal = false;
    revealGeneration += 1;
    jumpObserver?.disconnect();
    if (playing) stopPlayback(figure.dataset.useMode);
    setView(button.dataset.adaptView);
  }));
  playToggle.addEventListener('click', () => {
    if (playing) stopPlayback();
    else startPlayback();
  });
  toggle.addEventListener('click', async () => {
    autoPlayed = true;
    if (playing) stopPlayback();
    pendingJumpReveal = false;
    jumpObserver?.disconnect();
    if (annotationVisible) {
      setAnnotation(false);
      return;
    }
    const generation = ++revealGeneration;
    const mode = figure.dataset.useMode === 'everyday' ? 'recovery' : figure.dataset.useMode;
    const ready = await setMode(mode, 'front');
    if (ready && generation === revealGeneration) setAnnotation(true);
  });

  document.querySelectorAll('[data-reveal-shading]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      autoPlayed = true;
      if (playing) stopPlayback();
      setAnnotation(false);
      if (window.location.hash !== '#adapt') history.pushState(null, '', '#adapt');
      study.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      document.getElementById('adapt-study-title')?.focus({ preventScroll: true });
      revealAfterJump();
    });
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#adapt') {
      autoPlayed = true;
      if (playing) stopPlayback();
      setAnnotation(false);
      revealAfterJump();
    }
  });

  [closedModel, openModel].forEach((image) => {
    image.draggable = false;
    image.removeAttribute('tabindex');
  });
  setMode(figure.dataset.useMode || 'everyday');

  if (window.location.hash === '#adapt') {
    autoPlayed = true;
    requestAnimationFrame(() => {
      study.scrollIntoView({ behavior: 'instant', block: 'start' });
      revealAfterJump();
    });
  }
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const autoObserver = new IntersectionObserver((entries) => {
      if (!autoPlayed && !playing && entries.some((entry) => entry.isIntersecting)) startPlayback();
      if (autoPlayed) autoObserver.disconnect();
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.12 });
    autoObserver.observe(figure);
  }
})();
