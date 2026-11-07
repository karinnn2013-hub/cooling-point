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
  frame.addEventListener('load', syncLanguage);
  new MutationObserver(syncLanguage).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
