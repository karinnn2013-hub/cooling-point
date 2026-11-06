(() => {
  const gallery = document.getElementById('interview-gallery');
  if (!gallery) return;
  const tabs = [...gallery.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const quoteStage = gallery.querySelector('.interview-quote-stage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotationMs = 3000;
  let activeIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  let rotationTimer;
  let inView = false;
  let readingQuote = false;

  const scheduleRotation = () => {
    window.clearTimeout(rotationTimer);
    const keyboardFocus = gallery.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (tabs.length < 2 || !inView || document.hidden || readingQuote || keyboardFocus || reducedMotion.matches) return;
    rotationTimer = window.setTimeout(() => select((activeIndex + 1) % tabs.length), rotationMs);
  };

  const select = (index, focus = false) => {
    activeIndex = index;
    tabs.forEach((tab, position) => {
      const active = position === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    });
    if (focus) tabs[index].focus();
    scheduleRotation();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });

  quoteStage.addEventListener('mouseenter', () => { readingQuote = true; scheduleRotation(); });
  quoteStage.addEventListener('mouseleave', () => { readingQuote = false; scheduleRotation(); });
  gallery.addEventListener('focusin', scheduleRotation);
  gallery.addEventListener('focusout', () => queueMicrotask(scheduleRotation));
  document.addEventListener('visibilitychange', scheduleRotation);
  reducedMotion.addEventListener?.('change', scheduleRotation);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.intersectionRatio >= .15);
      inView = visible;
      if (visible) {
        gallery.classList.add('is-visible');
      }
      scheduleRotation();
    }, { threshold: .15 });
    observer.observe(gallery);
  } else {
    gallery.classList.add('is-visible');
    inView = true;
    scheduleRotation();
  }
})();
