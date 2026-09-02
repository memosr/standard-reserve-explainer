// The Bank Is Code — static, non-interactive SVG visuals for sections 00, 01, 03, 04, 06, 07, 09.

const SVG_NS = 'http://www.w3.org/2000/svg';

function initOpeningCode() {
  const group = document.querySelector('[data-code-stream]');
  if (!group) return;

  const rowH = 20;
  const rows = 16;
  const widths = [180, 120, 220, 90, 160, 240, 100, 200, 140, 260, 110, 190, 150, 230, 130, 170];
  const indents = [20, 40, 60, 20, 80, 40, 20, 100, 60, 20, 40, 80, 20, 60, 40, 20];

  function buildRows(offsetY) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < rows; i++) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', indents[i % indents.length]);
      rect.setAttribute('y', offsetY + i * rowH);
      rect.setAttribute('width', widths[i % widths.length]);
      rect.setAttribute('height', 8);
      rect.setAttribute('rx', 3);
      rect.classList.add('code-row');
      if (i % 5 === 0) rect.classList.add('code-row-accent');
      frag.appendChild(rect);
    }
    return frag;
  }

  group.appendChild(buildRows(0));
  group.appendChild(buildRows(rows * rowH));
  group.style.setProperty('--code-scroll-distance', `${rows * rowH}px`);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeWedge(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function buildPieState(count, label) {
  const g = document.createElementNS(SVG_NS, 'g');
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', describeWedge(150, 150, 108, i * step, (i + 1) * step));
    path.classList.add('issuance-wedge');
    if (i === 0) path.classList.add('issuance-wedge-yours');
    g.appendChild(path);
  }
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', 150);
  text.setAttribute('y', 300);
  text.setAttribute('text-anchor', 'middle');
  text.classList.add('issuance-pie-caption');
  text.textContent = label;
  g.appendChild(text);
  return g;
}

function initIssuancePie() {
  const states = {
    a: document.querySelector('[data-pie-state="a"]'),
    b: document.querySelector('[data-pie-state="b"]'),
    c: document.querySelector('[data-pie-state="c"]'),
  };
  if (!states.a || !states.b || !states.c) return;

  states.a.appendChild(buildPieState(3, '3 branches, your slice 33%'));
  states.b.appendChild(buildPieState(30, '30 branches, your slice 3.3%'));
  states.c.appendChild(buildPieState(300, '300 branches, your slice 0.3%'));
}

function initRedactedParams() {
  const container = document.querySelector('[data-params-rows]');
  if (!container) return;

  const labels = [
    'Base issuance',
    'Epoch length',
    'Multiplier floor',
    'Multiplier ceiling',
    'Rate cut',
    'Rate raise',
    'Resolution fee floor',
    'Resolution fee ceiling',
    'License floor',
    'Trading fee',
  ];

  const rowStride = 34;
  const startY = 24;
  const boxHeight = 20;
  const boxX = 260;
  const boxWidth = 160;

  labels.forEach((label, i) => {
    const rowY = startY + i * rowStride;

    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', 20);
    text.setAttribute('y', rowY + boxHeight / 2 + 4);
    text.classList.add('params-row-label');
    text.textContent = label;
    container.appendChild(text);

    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add('params-redact');
    g.style.animationDelay = `${i * 0.15}s`;

    const base = document.createElementNS(SVG_NS, 'rect');
    base.setAttribute('x', boxX);
    base.setAttribute('y', rowY);
    base.setAttribute('width', boxWidth);
    base.setAttribute('height', boxHeight);
    base.setAttribute('rx', 4);
    base.classList.add('params-redact-base');
    g.appendChild(base);

    const hatch = document.createElementNS(SVG_NS, 'rect');
    hatch.setAttribute('x', boxX);
    hatch.setAttribute('y', rowY);
    hatch.setAttribute('width', boxWidth);
    hatch.setAttribute('height', boxHeight);
    hatch.setAttribute('rx', 4);
    hatch.setAttribute('fill', 'url(#redact-hatch)');
    g.appendChild(hatch);

    const outline = document.createElementNS(SVG_NS, 'rect');
    outline.setAttribute('x', boxX);
    outline.setAttribute('y', rowY);
    outline.setAttribute('width', boxWidth);
    outline.setAttribute('height', boxHeight);
    outline.setAttribute('rx', 4);
    outline.classList.add('params-redact-outline');
    g.appendChild(outline);

    container.appendChild(g);
  });
}

initOpeningCode();
initIssuancePie();
initRedactedParams();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  document.querySelectorAll('.story-visual-static svg').forEach((svg) => {
    if (typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
  });
}
