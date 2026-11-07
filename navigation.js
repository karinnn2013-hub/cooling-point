(() => {
  const header = document.querySelector('.topbar');
  const menuButton = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!header || !menuButton || !nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  })).filter(item => item.section);

  const setMenuOpen = open => {
    header.classList.toggle('nav-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  };

  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  links.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 701px)').addEventListener?.('change', () => setMenuOpen(false));

  let queued = false;
  const updateCurrent = () => {
    queued = false;
    const boundary = header.getBoundingClientRect().height + 28;
    let current = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= boundary) current = item.link;
    }
    links.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const scheduleUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateCurrent);
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  updateCurrent();
})();
