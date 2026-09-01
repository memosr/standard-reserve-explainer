// Be a Banker — UI. Tüm hesaplama model.js'te; burada sadece DOM okuma/yazma var.
import { runSimulation, SCENARIOS, DEFAULT_INPUTS } from "./model.js";
import { buildMultiplierChart } from "./chart.js";

const PARAM_FIELDS = [
  { key: "baseIssuance", label: "Base issuance", unit: "$STANDARD/day", kind: "number", step: 10000, min: 0 },
  { key: "epochLengthDays", label: "Epoch length", unit: "day(s)", kind: "number", step: 1, min: 1 },
  { key: "multiplierFloor", label: "Multiplier floor", unit: "×", kind: "number", step: 0.05, min: 0 },
  { key: "multiplierCeiling", label: "Multiplier ceiling", unit: "×", kind: "number", step: 0.05, min: 0 },
  { key: "multiplierLaunch", label: "Multiplier launch value", unit: "×", kind: "number", step: 0.05, min: 0 },
  { key: "rateCut", label: "Rate cut", unit: "%/epoch", kind: "percent", step: 1, min: 0, max: 100 },
  { key: "rateRaise", label: "Rate raise", unit: "%/epoch", kind: "percent", step: 1, min: 0, max: 100 },
  { key: "resolutionFeeFloor", label: "Resolution fee floor", unit: "%", kind: "percent", step: 1, min: 0, max: 100 },
  { key: "resolutionFeeCeiling", label: "Resolution fee ceiling", unit: "%", kind: "percent", step: 1, min: 0, max: 100 },
  { key: "saturationPressure", label: "Saturation (exit pressure)", unit: "%", kind: "percent", step: 1, min: 0, max: 100 },
  { key: "tradingFee", label: "Trading fee", unit: "%", kind: "percent", step: 0.1, min: 0, max: 100 },
];

const paramGrid = document.querySelector("[data-param-grid]");
const scenarioButtons = [...document.querySelectorAll("[data-scenario-btn]")];
const resetButton = document.querySelector("[data-reset-btn]");

if (!paramGrid || scenarioButtons.length === 0 || !resetButton) {
  throw new Error("Be a Banker: required parameter panel elements missing");
}

const state = {
  scenarioKey: "balanced",
  params: { ...SCENARIOS.balanced },
  inputs: { ...DEFAULT_INPUTS },
};

function round(n, decimals) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function toDisplayValue(field, rawValue) {
  return field.kind === "percent" ? round(rawValue * 100, 4) : rawValue;
}

function fromDisplayValue(field, displayValue) {
  const n = Number(displayValue);
  return field.kind === "percent" ? n / 100 : n;
}

function updateBadge(key) {
  const badge = paramGrid.querySelector(`[data-badge-for="${key}"]`);
  if (!badge) return;
  const scenarioValue = SCENARIOS[state.scenarioKey][key];
  const isDefault = Math.abs(state.params[key] - scenarioValue) < 1e-9;
  badge.textContent = isDefault ? "redacted" : "custom";
  badge.classList.toggle("is-custom", !isDefault);
}

function refreshAllBadges() {
  for (const field of PARAM_FIELDS) updateBadge(field.key);
}

function renderParamGrid() {
  paramGrid.innerHTML = "";
  for (const field of PARAM_FIELDS) {
    const row = document.createElement("div");
    row.className = "param-row";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.htmlFor = `param-${field.key}`;

    const inputWrap = document.createElement("div");
    inputWrap.className = "param-input-wrap";

    const input = document.createElement("input");
    input.type = "number";
    input.id = `param-${field.key}`;
    input.step = String(field.step);
    input.min = String(field.min);
    if (field.max !== undefined) input.max = String(field.max);
    input.value = String(toDisplayValue(field, state.params[field.key]));
    input.dataset.paramKey = field.key;

    const unit = document.createElement("span");
    unit.className = "param-unit";
    unit.textContent = field.unit;

    inputWrap.append(input, unit);

    const badge = document.createElement("span");
    badge.className = "param-badge";
    badge.dataset.badgeFor = field.key;

    row.append(label, inputWrap, badge);
    paramGrid.append(row);

    input.addEventListener("input", () => {
      state.params[field.key] = fromDisplayValue(field, input.value);
      updateBadge(field.key);
      recompute();
    });
  }
  refreshAllBadges();
}

function applyScenario(key) {
  state.scenarioKey = key;
  state.params = { ...SCENARIOS[key] };
  renderParamGrid();
  scenarioButtons.forEach((btn) => {
    btn.setAttribute("aria-checked", String(btn.dataset.scenarioBtn === key));
  });
  recompute();
}

scenarioButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyScenario(btn.dataset.scenarioBtn));
});
resetButton.addEventListener("click", () => applyScenario("balanced"));

function bindSlider(key, { transform = (v) => v, format = (v) => String(v) } = {}) {
  const input = document.querySelector(`[data-input="${key}"]`);
  const output = document.querySelector(`[data-output="${key}"]`);
  if (!input || !output) return;
  const update = () => {
    const raw = Number(input.value);
    state.inputs[key] = transform(raw);
    output.textContent = format(raw);
    recompute();
  };
  input.addEventListener("input", update);
  update();
}

const out = {};
for (const name of [
  "dailyShareNow",
  "averageDailyShare",
  "accruedBalance",
  "exitFeeRate",
  "exitSaturatedBadge",
  "exitNet",
  "exitBurned",
  "exitStayers",
  "regime",
  "currentM",
  "burnedRowLabel",
  "burnedRowValue",
  "compareExitNet",
  "compareHoldNet",
  "compareShareLost",
  "compareHoldDays",
]) {
  out[name] = document.querySelector(`[data-out="${name}"]`);
}

const regimeDot = document.querySelector("[data-regime-dot]");
const mChartPath = document.querySelector('[data-chart="m-path"]');
const balanceChartPath = document.querySelector('[data-chart="balance-path"]');
const chartAxis = {
  mMin: document.querySelector('[data-axis="m-min"]'),
  mMax: document.querySelector('[data-axis="m-max"]'),
  balanceMin: document.querySelector('[data-axis="balance-min"]'),
  balanceMax: document.querySelector('[data-axis="balance-max"]'),
  xMax: document.querySelector('[data-axis="x-max"]'),
};

function fmt(n, opts = {}) {
  return Number.isFinite(n)
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2, ...opts })
    : "—";
}

function fmtPercent(n) {
  return `${(n * 100).toFixed(1)}%`;
}

// Eksen etiketleri az yer kaplamalı (SVG viewBox dışına taşmasın) — kompakt gösterim.
function fmtCompact(n) {
  return Number.isFinite(n)
    ? n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })
    : "—";
}

function recompute() {
  const result = runSimulation(state.inputs, state.params);

  if (out.dailyShareNow) out.dailyShareNow.textContent = `${fmt(result.dailyShareNow)} $STANDARD/day`;
  if (out.averageDailyShare) out.averageDailyShare.textContent = `${fmt(result.averageDailyShare)} $STANDARD/day`;
  if (out.accruedBalance) out.accruedBalance.textContent = `${fmt(result.accruedBalance)} $STANDARD`;

  if (out.exitFeeRate) out.exitFeeRate.textContent = fmtPercent(result.exitNow.feeRate);
  if (out.exitSaturatedBadge) out.exitSaturatedBadge.hidden = !result.exitNow.saturated;
  if (out.exitNet) out.exitNet.textContent = `${fmt(result.exitNow.netToWallet)} $STANDARD`;
  if (out.exitBurned) out.exitBurned.textContent = `${fmt(result.exitNow.burned)} $STANDARD`;
  if (out.exitStayers) out.exitStayers.textContent = `${fmt(result.exitNow.toStayers)} $STANDARD`;

  if (out.regime) out.regime.textContent = result.systemState.regime;
  if (regimeDot) regimeDot.dataset.regime = result.systemState.regime;
  if (out.currentM) out.currentM.textContent = `${fmt(result.systemState.currentM, { maximumFractionDigits: 3 })}×`;

  // §11: expansion'da vault yakmaz, rezerv toplar (ETH). Contraction'da resolution
  // fee burn'ü ($STANDARD) anlamlı kalır — satır rejime göre etiket ve birim değiştirir.
  if (out.burnedRowLabel && out.burnedRowValue) {
    if (result.systemState.regime === "expansion") {
      out.burnedRowLabel.textContent = "Reserves stacked (est.)";
      out.burnedRowValue.textContent = `${fmt(result.systemState.reservesStackedToday)} ETH`;
    } else {
      out.burnedRowLabel.textContent = "Burned today (est.)";
      out.burnedRowValue.textContent = `${fmt(result.systemState.tokensBurnedToday)} $STANDARD`;
    }
  }

  const cmp = result.compareExitVsHold;
  if (out.compareExitNet) out.compareExitNet.textContent = `${fmt(cmp.exitNow.netToWallet)} $STANDARD`;
  if (out.compareHoldNet) out.compareHoldNet.textContent = `${fmt(cmp.exitAfterHold.netToWallet)} $STANDARD`;
  if (out.compareShareLost) out.compareShareLost.textContent = `${fmt(cmp.dailyShareLostPerBranch)} $STANDARD/day`;
  if (out.compareHoldDays) out.compareHoldDays.textContent = String(cmp.holdDays);

  const chart = buildMultiplierChart(result.epochs);
  if (mChartPath) mChartPath.setAttribute("d", chart.mPath);
  if (balanceChartPath) balanceChartPath.setAttribute("d", chart.balancePath);
  if (chartAxis.mMin) chartAxis.mMin.textContent = fmt(chart.mTicks[0], { maximumFractionDigits: 2 });
  if (chartAxis.mMax) chartAxis.mMax.textContent = fmt(chart.mTicks[1], { maximumFractionDigits: 2 });
  if (chartAxis.balanceMin) chartAxis.balanceMin.textContent = fmtCompact(chart.balanceTicks[0]);
  if (chartAxis.balanceMax) chartAxis.balanceMax.textContent = fmtCompact(chart.balanceTicks[1]);
  if (chartAxis.xMax) chartAxis.xMax.textContent = String(state.inputs.daysHeld);
}

applyScenario("balanced");

bindSlider("yourBranches", { format: (v) => `${v} branch${v === 1 ? "" : "es"}` });
bindSlider("totalBranches", { format: (v) => v.toLocaleString("en-US") });
bindSlider("netFlowPerDay", { format: (v) => `${v > 0 ? "+" : ""}${v} ETH/day` });
bindSlider("daysHeld", { format: (v) => `${v} day${v === 1 ? "" : "s"}` });
bindSlider("exitPressure", { transform: (v) => v / 100, format: (v) => `${v}%` });
