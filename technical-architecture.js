(() => {
  const section = document.getElementById('architecture');
  if (!section) return;
  const copy = document.getElementById('arch-scenario-copy');
  const scenarios = {
    approach: [
      'An approach cue triggers a readiness check. If the space is permitted and suitable, the system prepares shade and appropriate cooling and updates its open status; entry or a request confirms actual use.',
      '靠近信号触发服务准备判断；当空间获准开放且条件适宜时，系统准备遮阳和适当降温，并更新开放状态；再由进入或使用请求确认实际使用。'
    ],
    use: [
      'Presence and environmental readings guide ongoing adjustment. The system coordinates compatible ventilation or air treatment with cooling intensity, and updates availability as capacity changes.',
      '人员存在与环境读数指导持续调节；系统协调适配的通风或空气处理设备及制冷强度，并在容量变化时更新可用状态。'
    ],
    leave: [
      'After vacancy is confirmed over a configured delay, the system reduces unnecessary active cooling and returns to the appropriate everyday mode, while preserving host rules and manual control.',
      '在设定延时内确认空间无人后，系统减少不必要的主动制冷，恢复适当的日常模式，并保留场地方规则及人工控制。'
    ]
  };
  const buttons = [...section.querySelectorAll('[data-arch-scenario]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.archScenario;
    section.dataset.scenario = key;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    copy.querySelector('[data-en]').textContent = scenarios[key][0];
    copy.querySelector('[data-zh]').textContent = scenarios[key][1];
  }));
})();
