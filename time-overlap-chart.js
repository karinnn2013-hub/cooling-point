(() => {
  const figure = document.querySelector('.time-overlap-chart');
  if (!figure) return;
  const plot = figure.querySelector('.time-overlap-chart-plot');
  const svg = figure.querySelector('#time-overlap-curves');
  const layer = figure.querySelector('#time-overlap-curves-layer');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let drawnWidth = 0;
  let drawnLanguage = '';
  let chartData;

  const labels = {
    en: {
      pv: 'SOLAR IRRADIANCE / PV PROXY · RELATIVE',
      temperature: 'OUTDOOR AIR TEMPERATURE · °C',
      pvShort: 'SUNLIGHT · RELATIVE',
      temperatureShort: 'AIR · °C',
      time: 'LOCAL TIME',
      solarPeak: 'Sunlight peak',
      temperaturePeak: 'Air temperature peak',
      title: 'Five-day paired solar irradiance and outdoor air temperature, 31 October to 4 November 2026',
      description: 'Each point starts from the equal-weight average of paired outdoor air temperature and solar irradiance in the same half-hour across five days; a short moving average smooths the displayed trend. Solar irradiance is relative to its five-day peak and indicates PV potential, not measured PV output. The shaded interval marks 11:00 to 15:00.'
    },
    zh: {
      pv: '太阳辐射 / 光伏潜力参考 · 相对值',
      temperature: '室外空气温度 · °C',
      pvShort: '日照 · 相对值',
      temperatureShort: '气温 · °C',
      time: '本地时间',
      solarPeak: '日照峰值',
      temperaturePeak: '气温峰值',
      title: '2026 年 10 月 31 日至 11 月 4 日太阳辐射与室外气温的同期五日均值',
      description: '每个点以五天相同半小时内成对的室外气温与太阳辐射数据的等权均值为基础，再用短时移动均值平滑展示。太阳辐射相对于这五天的峰值显示，用作光伏潜力参考，并非实测光伏发电量。浅色带表示 11:00 至 15:00。'
    }
  };

  const make = (tag, attributes = {}, content = '') => {
    const element = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (content) element.textContent = content;
    return element;
  };
  // Monotone cubic curves pass through every data point without creating
  // artificial overshoots between adjacent half-hour readings.
  const curvedSegments = points => {
    const intervals = [];
    const slopes = [];
    for (let index = 0; index < points.length - 1; index++) {
      const interval = points[index + 1][0] - points[index][0];
      intervals.push(interval);
      slopes.push((points[index + 1][1] - points[index][1]) / interval);
    }
    const tangents = points.map((_, index) => {
      if (index === 0) return slopes[0];
      if (index === points.length - 1) return slopes.at(-1);
      const before = slopes[index - 1];
      const after = slopes[index];
      if (before * after <= 0) return 0;
      const weightBefore = 2 * intervals[index] + intervals[index - 1];
      const weightAfter = intervals[index] + 2 * intervals[index - 1];
      return (weightBefore + weightAfter) / (weightBefore / before + weightAfter / after);
    });
    return slopes.map((_, index) => {
      const interval = intervals[index];
      return {
        start: points[index],
        control1: [points[index][0] + interval / 3, points[index][1] + tangents[index] * interval / 3],
        control2: [points[index + 1][0] - interval / 3, points[index + 1][1] - tangents[index + 1] * interval / 3],
        end: points[index + 1]
      };
    });
  };
  const coordinates = point => `${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
  const curveCommand = segment => `C ${coordinates(segment.control1)}, ${coordinates(segment.control2)}, ${coordinates(segment.end)}`;
  const smoothPath = points => `M ${coordinates(points[0])} ${curvedSegments(points).map(curveCommand).join(' ')}`;
  const smoothSeries = values => values.map((_, index) => {
    const weights = [1, 4, 6, 4, 1];
    return weights.reduce((sum, weight, offset) => sum + weight * values[Math.min(values.length - 1, Math.max(0, index + offset - 2))], 0) / 16;
  });

  const draw = () => {
    if (!chartData) return;
    const width = Math.max(290, Math.round(plot.clientWidth));
    const languageKey = document.body.classList.contains('zh') ? 'zh' : 'en';
    if (width === drawnWidth && languageKey === drawnLanguage) return;
    drawnWidth = width;
    drawnLanguage = languageKey;
    const height = 307;
    const left = 46;
    const right = width - 43;
    const top = 39;
    const bottom = 258;
    const x = hour => left + (right - left) * (hour - 8) / 10;
    const yPv = value => bottom - (bottom - top) * value;
    const yTemperature = value => bottom - (bottom - top) * (value - 24) / 8;
    const add = (tag, attributes, content) => layer.appendChild(make(tag, attributes, content));
    const language = labels[languageKey];
    const mobile = width < 550;
    const paired = chartData.coupledWeather;
    const solarTrend = smoothSeries(paired.map(point => point.solarWm2));
    const temperatureTrend = smoothSeries(paired.map(point => point.outdoorC));
    const maxRadiation = Math.max(...solarTrend);

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.querySelector('title').textContent = language.title;
    svg.querySelector('desc').textContent = language.description;
    layer.replaceChildren();

    const defs = make('defs');
    [
      ['pv-area-gradient', '#63a875', '.20'],
      ['temperature-area-gradient', '#729ba2', '.17']
    ].forEach(([id, color, opacity]) => {
      const gradient = make('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: top, x2: 0, y2: bottom });
      gradient.append(make('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': opacity }));
      gradient.append(make('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0' }));
      defs.append(gradient);
    });
    layer.append(defs);

    add('rect', { x: x(11), y: top, width: x(15) - x(11), height: bottom - top, class: 'chart-band' });
    [11, 15].forEach(hour => add('line', { x1: x(hour), y1: top, x2: x(hour), y2: bottom, class: 'chart-band-edge' }));
    add('text', { x: left, y: 21, class: 'chart-panel-title' }, mobile ? language.pvShort : language.pv);
    add('text', { x: right, y: 21, 'text-anchor': 'end', class: 'chart-panel-title chart-panel-title-right' }, mobile ? language.temperatureShort : language.temperature);
    [0, .5, 1].forEach(value => {
      const y = yPv(value);
      add('line', { x1: left, y1: y, x2: right, y2: y, class: 'chart-grid' });
      add('text', { x: left - 9, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' }, value === .5 ? '.5' : String(value));
    });
    [24, 28, 32].forEach(value => {
      const y = yTemperature(value);
      add('line', { x1: right, y1: y, x2: right + 5, y2: y, class: 'chart-axis-tick' });
      add('text', { x: right + 9, y: y + 4, class: 'chart-tick' }, String(value));
    });
    [8, 10, 12, 14, 16, 18].forEach(hour => {
      const horizontal = x(hour);
      add('line', { x1: horizontal, y1: top, x2: horizontal, y2: bottom, class: 'chart-vertical' });
      add('text', { x: horizontal, y: bottom + 21, 'text-anchor': hour === 8 ? 'start' : hour === 18 ? 'end' : 'middle', class: 'chart-tick' }, `${String(hour).padStart(2, '0')}:00`);
    });
    add('text', { x: (left + right) / 2, y: height - 5, 'text-anchor': 'middle', class: 'chart-tick' }, language.time);

    const clockHour = point => Number(point.time.slice(0, 2)) + Number(point.time.slice(3)) / 60;
    const pvPoints = paired.map((point, index) => [x(clockHour(point)), yPv(solarTrend[index] / maxRadiation)]);
    const temperaturePoints = paired.map((point, index) => [x(clockHour(point)), yTemperature(temperatureTrend[index])]);
    const pvLine = smoothPath(pvPoints);
    const temperatureLine = smoothPath(temperaturePoints);
    add('path', { d: `${temperatureLine} L ${temperaturePoints.at(-1)[0]} ${bottom} L ${temperaturePoints[0][0]} ${bottom} Z`, class: 'chart-area-temperature' });
    add('path', { d: `${pvLine} L ${pvPoints.at(-1)[0]} ${bottom} L ${pvPoints[0][0]} ${bottom} Z`, class: 'chart-area-pv' });
    add('path', { d: pvLine, class: 'chart-pv', pathLength: 1 });
    add('path', { d: temperatureLine, class: 'chart-temperature', pathLength: 1 });

    const pvPeak = pvPoints[solarTrend.indexOf(maxRadiation)];
    const temperaturePeak = temperaturePoints[temperatureTrend.indexOf(Math.max(...temperatureTrend))];
    add('circle', { cx: pvPeak[0], cy: pvPeak[1], r: 4.5, class: 'chart-point-pv' });
    add('circle', { cx: temperaturePeak[0], cy: temperaturePeak[1], r: 4.5, class: 'chart-point-temperature' });
    if (!mobile) {
      add('text', { x: pvPeak[0] - 9, y: pvPeak[1] + 17, 'text-anchor': 'end', class: 'chart-annotation' }, language.solarPeak);
      add('text', { x: temperaturePeak[0] + 10, y: temperaturePeak[1] - 10, class: 'chart-annotation' }, language.temperaturePeak);
    }
  };

  const animateOnView = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window;
  if (animateOnView) figure.classList.add('motion-ready');
  new ResizeObserver(draw).observe(plot);
  new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (animateOnView) {
    const chartObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) figure.classList.remove('is-visible');
        else if (entry.intersectionRatio >= 0.12) figure.classList.add('is-visible');
      });
    }, { threshold: [0, 0.12] });
    chartObserver.observe(plot);

    const visits = document.querySelector('.visit-timing');
    if (visits) {
      visits.classList.add('motion-ready');
      const visitObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) visits.classList.remove('is-visible');
          else if (entry.intersectionRatio >= 0.16) visits.classList.add('is-visible');
        });
      }, { threshold: [0, 0.16] });
      visitObserver.observe(visits.querySelector('.arrival-projection'));
    }
  }

  fetch('assets/five-day-climate-data.json?v=20261104-weather-smooth')
    .then(response => {
      if (!response.ok) throw new Error(`Chart data returned ${response.status}`);
      return response.json();
    })
    .then(data => { chartData = data; draw(); })
    .catch(() => { figure.classList.add('chart-data-unavailable'); });
})();
