(() => {
  const root = document.getElementById('architecture');
  if (!root) return;

  const buttons = [...root.querySelectorAll('[data-concept-node]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    root.dataset.selected = button.dataset.conceptNode;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
})();
