// The Bank Is Code — interactive SVG widgets for sections 02, 05, 08.

function initScaleWidget(root) {
  const slider = root.querySelector('[data-scale-slider]');
  const beam = root.querySelector('[data-scale-beam]');
  const valueOut = root.querySelector('[data-scale-value]');
  const regimeOut = root.querySelector('[data-scale-regime]');
  const MAX_ANGLE = 16;

  function render() {
    const value = Number(slider.value);
    const angle = -(value / 100) * MAX_ANGLE;
    beam.style.transform = `rotate(${angle}deg)`;
    valueOut.textContent = value > 0 ? `+${value}` : `${value}`;
    const regime = value > 0 ? 'expansion' : 'contraction';
    regimeOut.textContent = regime;
    regimeOut.dataset.regime = regime;
  }

  slider.addEventListener('input', render);
  render();
}

function initBranchesWidget(root) {
  const MAX_BRANCHES = 10;

  const slots = Array.from(root.querySelectorAll('[data-slot]'));
  const openBtn = root.querySelector('[data-branches-open]');
  const resetBtn = root.querySelector('[data-branches-reset]');
  const shareOut = root.querySelector('[data-branches-share]');
  const burnBarFill = root.querySelector('[data-branches-burn-bar]');
  const burnBarEl = burnBarFill.closest('.burn-bar');

  let branches = 1;

  function render() {
    slots.forEach((slot) => {
      slot.classList.toggle('is-open', Number(slot.dataset.slot) <= branches);
    });
    shareOut.textContent = `${branches}×`;
    const burned = branches - 1;
    burnBarFill.style.width = `${(burned / (MAX_BRANCHES - 1)) * 100}%`;
    burnBarEl.setAttribute('aria-label', `${burned} of ${MAX_BRANCHES - 1} licenses burned, relative scale`);
    const atMax = branches >= MAX_BRANCHES;
    openBtn.disabled = atMax;
    openBtn.textContent = atMax ? 'Maximum reached' : 'Open a branch';
  }

  openBtn.addEventListener('click', () => {
    if (branches >= MAX_BRANCHES) return;
    branches += 1;
    render();
  });

  resetBtn.addEventListener('click', () => {
    branches = 1;
    render();
  });

  render();
}

function initExitWidget(root) {
  const TOTAL = 20;
  const ZONE_COLS = 5;
  const DX = 26;
  const DY = 32;
  const LEAVER_ORIGIN = { x: 40, y: 60 };
  const STAYER_ORIGIN = { x: 300, y: 60 };

  const slider = root.querySelector('[data-exit-slider]');
  const dotsGroup = root.querySelector('[data-exit-dots]');
  const runningOut = root.querySelector('[data-exit-running]');
  const feeOut = root.querySelector('[data-exit-fee]');
  const gainOut = root.querySelector('[data-exit-gain]');

  function slotPosition(origin, index) {
    const col = index % ZONE_COLS;
    const row = Math.floor(index / ZONE_COLS);
    return { x: origin.x + col * DX, y: origin.y + row * DY };
  }

  const dots = Array.from({ length: TOTAL }, () => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '8');
    circle.classList.add('exit-dot');
    dotsGroup.appendChild(circle);
    return circle;
  });

  function feePctFor(runningPct) {
    return 5 + 30 * (runningPct / 60) ** 2;
  }

  function render() {
    const runningPct = Number(slider.value);
    const leaverCount = Math.round(TOTAL * (runningPct / 100));
    const stayerCount = TOTAL - leaverCount;
    const feePct = feePctFor(runningPct);
    const gainPct = stayerCount > 0 ? ((leaverCount * (feePct / 100) * 0.5) / stayerCount) * 100 : 0;

    let leaverIdx = 0;
    let stayerIdx = 0;
    dots.forEach((dot, i) => {
      const isLeaving = i < leaverCount;
      const pos = isLeaving ? slotPosition(LEAVER_ORIGIN, leaverIdx++) : slotPosition(STAYER_ORIGIN, stayerIdx++);
      dot.setAttribute('cx', pos.x);
      dot.setAttribute('cy', pos.y);
      dot.classList.toggle('exit-dot-leaving', isLeaving);
      dot.classList.toggle('exit-dot-staying', !isLeaving);
      dot.style.filter = isLeaving
        ? 'none'
        : `drop-shadow(0 0 ${(4 + Math.min(gainPct, 30) * 0.6).toFixed(1)}px var(--color-reserve))`;
    });

    runningOut.textContent = `${runningPct}%`;
    feeOut.textContent = `exit fee ${feePct.toFixed(1)}%`;
    gainOut.textContent = `+${gainPct.toFixed(1)}% received`;
  }

  slider.addEventListener('input', render);
  render();
}

const scaleRoot = document.querySelector('[data-widget="scale"]');
if (scaleRoot) initScaleWidget(scaleRoot);

const branchesRoot = document.querySelector('[data-widget="branches"]');
if (branchesRoot) initBranchesWidget(branchesRoot);

const exitRoot = document.querySelector('[data-widget="exit"]');
if (exitRoot) initExitWidget(exitRoot);
