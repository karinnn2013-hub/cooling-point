/* The building is always the project's Blender render; figures are scenario cutouts. */
(() => {
  const root = document.querySelector('#behavior .behavior-grid');
  if (!root) return;
  const articles = [...root.querySelectorAll('.behavior-scene')];
  if (articles.length !== 6) return;

  const scenes = [
    {
      house: 'shading-closed.png',
      alt: 'A sanitation worker walks in strong sun near the closed solar house / 环卫人员在日晒中经过尚未开放的阳光房',
      figures: [['entourage-worker-walking.png', 'walking']],
      plants: [['entourage-tree-subtropical.png', 'tree-far-right']],
      marks: '<circle cx="116" cy="92" r="22" fill="#f4d1a1" opacity=".8"/><path d="M116 50v-12m0 108v-12M73 92H60m112 0h-13m-69-28-9-9m70 70-9-9m0-52 9-9m-70 70 9-9" stroke="#c89867" stroke-width="1.2" opacity=".8"/>'
    },
    {
      house: 'shading-open.png',
      alt: 'A worker reaches the visible open glass-door entrance / 工作者走近清晰可见的玻璃门入口',
      figures: [['entourage-worker-standing.png', 'standing']],
      plants: [['entourage-groundcover.png', 'grass-far-left'], ['entourage-shrub-cluster.png', 'shrub-far-right']],
      marks: '<path d="M105 370C150 346 176 322 211 306" fill="none" stroke="#789f8e" stroke-width="1.5" stroke-dasharray="3 6"/><path d="m205 302 9 2-5 8" fill="none" stroke="#789f8e" stroke-width="1.5"/><path d="M86 66h14m-7-7v14" stroke="#c89867" stroke-width="1.1" opacity=".65"/>'
    },
    {
      house: 'shading-open.png',
      alt: 'The real solar-house model with its upper shade extended and glass doors open / 真实阳光房模型的顶部遮阳帘展开、玻璃门开放',
      figures: [],
      plants: [['entourage-shrub-cluster.png', 'shrub-far-left']],
      marks: '<circle cx="324" cy="102" r="4" fill="#6c9ab4"/><circle cx="404" cy="113" r="4" fill="#6c9ab4"/><path d="M324 102v-21h52m28 32V91h-32" fill="none" stroke="#7ea4b5" stroke-width="1.2"/><path d="M254 278c20-14 39-14 60-3m-45 13c23-11 46-10 68 3" fill="none" stroke="#78aeb6" stroke-width="1.4" opacity=".62"/>'
    },
    {
      house: 'shading-open.png',
      alt: 'Two illustrative outdoor workers rest outside and inside the open solar house / 两名情境示意的户外工作者分别在室外和室内休息',
      figures: [['entourage-grounds-seated.png', 'inside-grounds'], ['entourage-worker-seated.png', 'outside-seated']],
      plants: [['entourage-groundcover.png', 'grass-far-left'], ['entourage-tree-subtropical.png', 'tree-far-right']],
      marks: '<path d="M260 282c17-11 37-10 55-1m-39 12c20-9 39-7 58 4M444 271c17-10 34-9 52 3" fill="none" stroke="#78aeb6" stroke-width="1.3" opacity=".58"/>'
    },
    {
      house: 'shading-closed.png',
      alt: 'The worker departs while the solar house returns to its closed everyday state / 工作者离开后阳光房回到关闭的日常状态',
      figures: [['entourage-worker-walking.png', 'departing']],
      plants: [['entourage-shrub-cluster.png', 'shrub-far-left']],
      marks: '<path d="M492 343c48 6 80 9 133 3" fill="none" stroke="#96aa9e" stroke-width="1.2" stroke-dasharray="3 6"/>'
    },
    {
      house: 'shading-closed.png',
      alt: 'Two illustrative everyday users read and talk inside the solar house / 两名情境示意的日常使用者在阳光房内阅读与交流',
      figures: [['entourage-everyday-pair.png', 'inside-pair']],
      plants: [['entourage-groundcover.png', 'grass-far-right']],
      marks: ''
    }
  ];

  const image = (file, className) =>
    `<img class="${className}" src="assets/${file}" alt="" aria-hidden="true" loading="lazy" decoding="async">`;

  articles.forEach((article, index) => {
    const oldVisual = article.querySelector(':scope > svg');
    if (!oldVisual) return;
    const scene = scenes[index];
    const figures = scene.figures.map(([file, pose]) => image(file, `behavior-art__figure behavior-art__figure--${pose}`)).join('');
    const plants = scene.plants.map(([file, position]) => image(file, `behavior-art__plant behavior-art__plant--${position}`)).join('');
    oldVisual.outerHTML = `<div class="behavior-art behavior-art--${index + 1}" role="img" aria-label="${scene.alt}">
      <span class="behavior-art__field" aria-hidden="true"></span>
      <span class="behavior-art__sunwash" aria-hidden="true"></span>
      <span class="behavior-art__ground-plane" aria-hidden="true"></span>
      <span class="behavior-art__ground-shadow" aria-hidden="true"></span>
      <span class="behavior-art__person-shadow" aria-hidden="true"></span>
      ${plants}
      ${figures}
      ${image(scene.house, 'behavior-art__house')}
      <svg class="behavior-art__marks" viewBox="0 0 720 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${scene.marks}</svg>
    </div>`;
  });

  // Departure precedes the return to ordinary daily use.
  const captions = [articles[4], articles[5]].map(article => article.querySelector('.behavior-caption > div'));
  if (captions[0] && captions[1]) {
    const first = captions[0].innerHTML;
    captions[0].innerHTML = captions[1].innerHTML;
    captions[1].innerHTML = first;
  }
})();
