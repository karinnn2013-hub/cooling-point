(() => {
  const svg = document.getElementById('arrival-projection-svg');
  if (!svg) return;

  const arrivals = [
    10.3333, 10.5, 10.7702, 11.0617, 11.2586, 11.4153, 11.5, 11.5922,
    11.6667, 11.727, 11.8942, 12, 12.0338, 12.1667, 12.1739, 12.2401,
    12.3545, 12.4742, 12.5, 12.5519, 12.6105, 12.7046, 12.7719, 12.8642,
    12.9484, 13.026, 13.1671, 13.2698, 13.3509, 13.4568, 13.5, 13.6298,
    13.8831, 14.1497, 14.3789, 14.7321, 15.2596, 15.7595, 16.2677, 17.259
  ];
  const ns = 'http://www.w3.org/2000/svg';
  const left = 50;
  const right = 970;
  const top = 34;
  const bottom = 250;
  const x = hour => left + (hour - 8) / 10 * (right - left);
  const density = hour => arrivals.reduce((sum, arrival) =>
    sum + Math.exp(-0.5 * ((hour - arrival) / 0.45) ** 2), 0);
  const hours = Array.from({ length: 201 }, (_, i) => 8 + i * 0.05);
  const values = hours.map(density);
  const maximum = Math.max(...values);
  const y = value => bottom - value / maximum * 172;

  const add = (tag, attributes, parent = svg, value) => {
    if (typeof parent === 'string') {
      value = parent;
      parent = svg;
    }
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, val]) => element.setAttribute(key, String(val)));
    if (value !== undefined) element.textContent = value;
    parent.appendChild(element);
    return element;
  };

  const defs = add('defs', {});
  const gradient = add('linearGradient', { id: 'arrival-area-gradient', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  add('stop', { offset: '0%', 'stop-color': '#63a875', 'stop-opacity': '0.25' }, gradient);
  add('stop', { offset: '100%', 'stop-color': '#63a875', 'stop-opacity': '0.025' }, gradient);

  add('rect', { x: x(11), y: top, width: x(15) - x(11), height: bottom - top, class: 'arrival-band' });
  [11, 15].forEach(hour => add('line', {
    x1: x(hour), x2: x(hour), y1: top, y2: bottom, class: 'arrival-band-edge'
  }));
  [0, 0.25, 0.5, 0.75, 1].forEach(fraction => add('line', {
    x1: left, x2: right, y1: bottom - fraction * (bottom - top),
    y2: bottom - fraction * (bottom - top), class: 'arrival-grid'
  }));
  add('text', { x: x(11) + 12, y: top + 18, class: 'arrival-band-label', 'data-en': '' },
    '11:00–15:00 / DAYTIME OVERLAP');
  add('text', { x: x(11) + 12, y: top + 18, class: 'arrival-band-label', 'data-zh': '' },
    '11:00–15:00 / 日间重叠时段');

  const points = hours.map((hour, index) => [x(hour), y(values[index])]);
  const path = points.map(([px, py], index) => `${index ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)}`).join(' ');
  add('path', {
    d: `${path} L ${right} ${bottom} L ${left} ${bottom} Z`,
    class: 'arrival-area'
  });
  add('path', { d: path, class: 'arrival-curve', pathLength: 1 });

  [8, 10, 12, 14, 16, 18].forEach(hour => {
    add('line', { x1: x(hour), x2: x(hour), y1: bottom, y2: bottom + 7, class: 'arrival-axis-tick' });
    add('text', {
      x: x(hour), y: bottom + 24, 'text-anchor': 'middle', class: 'arrival-axis-label'
    }, `${String(hour).padStart(2, '0')}:00`);
  });
  add('text', { x: left, y: 304, class: 'arrival-rug-label', 'data-en': '' },
    '40 PLOTTED ENTRY TIMES');
  add('text', { x: left, y: 304, class: 'arrival-rug-label', 'data-zh': '' },
    '40 个图示进入时间点');
  add('line', { x1: left, x2: right, y1: 331, y2: 331, class: 'arrival-rug-baseline' });
  arrivals.forEach(hour => add('line', {
    x1: x(hour), x2: x(hour), y1: 313, y2: 336,
    class: 'arrival-rug-tick'
  }));
})();
