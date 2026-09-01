// İki eksenli çizgi grafik: multiplier m (sol eksen) ve kümülatif bakiye (sağ
// eksen), aynı x ekseninde (days). Sadece path/tick hesaplar, DOM'a dokunmaz —
// simulator.js path'i ve eksen etiketlerini SVG'ye yazar.

const WIDTH = 640;
const HEIGHT = 340;
const PAD = { top: 24, right: 58, bottom: 34, left: 50 };

function scaleLinear([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

function pathFor(points, xScale, yScale) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x).toFixed(2)},${yScale(p.y).toFixed(2)}`)
    .join(" ");
}

export function buildMultiplierChart(epochs) {
  if (epochs.length === 0) {
    return {
      width: WIDTH,
      height: HEIGHT,
      mPath: "",
      balancePath: "",
      mTicks: [0, 0],
      balanceTicks: [0, 0],
    };
  }

  const ms = epochs.map((e) => e.m);
  const xMax = epochs[epochs.length - 1].endDay;

  const xScale = scaleLinear([0, xMax], [PAD.left, WIDTH - PAD.right]);
  const yRange = [HEIGHT - PAD.bottom, PAD.top];

  const mDomain = [Math.min(...ms) * 0.95, Math.max(...ms) * 1.05];
  const mScale = scaleLinear(mDomain, yRange);
  const mPoints = epochs.map((e) => ({ x: e.startDay, y: e.m }));
  const last = epochs[epochs.length - 1];
  mPoints.push({ x: last.endDay, y: last.m });

  // Kümülatif bakiye 0'dan başlar ve hiç azalmaz; alt sınır 0'da sabit kalır.
  const finalBalance = last.cumulativeBalance;
  const balanceDomain = [0, Math.max(finalBalance, 1) * 1.05];
  const balanceScale = scaleLinear(balanceDomain, yRange);
  const balancePoints = [
    { x: 0, y: 0 },
    ...epochs.map((e) => ({ x: e.endDay, y: e.cumulativeBalance })),
  ];

  return {
    width: WIDTH,
    height: HEIGHT,
    mPath: pathFor(mPoints, xScale, mScale),
    balancePath: pathFor(balancePoints, xScale, balanceScale),
    mTicks: mDomain,
    balanceTicks: balanceDomain,
  };
}
