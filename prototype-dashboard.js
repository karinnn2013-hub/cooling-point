(() => {
  const frame = document.querySelector('.energy-card iframe');
  const thermalImage = document.querySelector('.thermal-image-wrap img');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && thermalImage) {
    thermalImage.src = 'assets/solaris-thermal-poster.webp';
  }
  if (!frame) return;
  const syncLanguage = () => {
    frame.contentWindow?.postMessage({
      type: 'dashboard:set-language',
      lang: document.body.classList.contains('zh') ? 'zh' : 'en'
    }, window.location.origin);
  };
  const fitEnergyFrame = () => {
    const panel = frame.contentDocument?.querySelector('.charts .panel:nth-child(2)');
    if (!panel) return;
    const height = Math.ceil(panel.getBoundingClientRect().bottom + 8);
    if (Number.isFinite(height) && height > 0) frame.style.height = `${height}px`;
  };
  frame.addEventListener('load', () => {
    syncLanguage();
    const panel = frame.contentDocument?.querySelector('.charts .panel:nth-child(2)');
    if (panel) new ResizeObserver(fitEnergyFrame).observe(panel);
    fitEnergyFrame();
  });
  window.addEventListener('resize', fitEnergyFrame);
  new MutationObserver(syncLanguage).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
