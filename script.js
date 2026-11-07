(() => {
  const modelStage = document.getElementById('model-stage');
  const modeButtons = document.querySelectorAll('[data-space-mode]');
  const status = {
    light: document.getElementById('sensor-light'),
    heat: document.getElementById('sensor-heat'),
    presence: document.getElementById('sensor-presence'),
    label: document.getElementById('model-mode-label'),
    response: document.getElementById('agent-response-copy'),
  };

  const modes = {
    everyday: {
      light: ['Balanced', '适中'],
      heat: ['Comfortable', '舒适'],
      presence: ['Shared use', '日常使用中'],
      label: ['EVERYDAY USE', '日常使用'],
      headline: ['Sense → interpret → adapt', '感知 → 判断 → 调整'],
      detail: [
        'With moderate light and comfortable conditions, the room remains in its everyday-use mode.',
        '光照适中、环境舒适时，空间保持日常使用模式。',
      ],
    },
    recovery: {
      light: ['Strong', '较强'],
      heat: ['Heat rising', '热环境升高'],
      presence: ['Person detected', '检测到人员'],
      label: ['HEAT RECOVERY MODE', '热恢复开放'],
      headline: ['Heat + presence → open recovery mode', '高温 + 有人 → 开启热恢复模式'],
      detail: [
        'With strong light, rising heat and a person detected, the scenario lowers the shade and prioritizes a cooler place to rest.',
        '当光照较强、热环境升高且检测到人员时，情境示意空间调整遮阳，并优先提供较舒适的休息环境。',
      ],
    },
  };

  const setBilingualText = (element, values) => {
    element.innerHTML = `<span data-en>${values[0]}</span><span data-zh>${values[1]}</span>`;
  };

  modeButtons.forEach((modeButton) => {
    modeButton.addEventListener('click', () => {
      const mode = modes[modeButton.dataset.spaceMode];
      if (!mode || !modelStage) return;
      modelStage.dataset.mode = modeButton.dataset.spaceMode;
      modeButtons.forEach((item) => {
        const active = item === modeButton;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      setBilingualText(status.light, mode.light);
      setBilingualText(status.heat, mode.heat);
      setBilingualText(status.presence, mode.presence);
      setBilingualText(status.label, mode.label);
      status.response.innerHTML = `<strong><span data-en>${mode.headline[0]}</span><span data-zh>${mode.headline[1]}</span></strong><span data-en>${mode.detail[0]}</span><span data-zh>${mode.detail[1]}</span>`;
    });
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('solar-house-model')?.removeAttribute('auto-rotate');
  }
})();
