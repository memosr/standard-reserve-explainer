// Flow Engine: düzen (masaüstü / mobil), regime toggle, auto play, odak + tooltip.
import { ENTITIES } from "../data/entities.js";
import { DESKTOP, MOBILE, MOBILE_QUERY } from "../data/layouts.js";
import { applyLayout } from "./layout.js";
import { createFocusController } from "./tooltip.js";

const REGIMES = ["expansion", "contraction"];
const AUTO_INTERVAL_MS = 10_000;

const engine = document.querySelector(".flow-engine");
const svg = engine?.querySelector("svg");
const tooltip = engine?.querySelector(".tooltip");
const regimeButtons = [...document.querySelectorAll("[data-regime-btn]")];
const autoButton = document.querySelector("[data-auto-btn]");

if (!engine || !svg || !tooltip || regimeButtons.length === 0 || !autoButton) {
  throw new Error("Flow Engine: required elements missing");
}

/* ---- layout ---- */
const mobileQuery = window.matchMedia(MOBILE_QUERY);
const currentLayout = () => (mobileQuery.matches ? MOBILE : DESKTOP);

/* ---- regime ---- */
const getRegime = () => engine.dataset.regime;

const setRegime = (regime) => {
  if (!REGIMES.includes(regime)) return;
  engine.dataset.regime = regime;
  regimeButtons.forEach((btn) => {
    btn.setAttribute("aria-checked", String(btn.dataset.regimeBtn === regime));
  });
};

const nextRegime = () => REGIMES[(REGIMES.indexOf(getRegime()) + 1) % REGIMES.length];

let autoTimer = null;

const stopAuto = () => {
  if (autoTimer !== null) clearInterval(autoTimer);
  autoTimer = null;
  autoButton.setAttribute("aria-pressed", "false");
};

const startAuto = () => {
  stopAuto();
  autoTimer = setInterval(() => setRegime(nextRegime()), AUTO_INTERVAL_MS);
  autoButton.setAttribute("aria-pressed", "true");
};

regimeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    stopAuto();
    setRegime(btn.dataset.regimeBtn);
  });
});

autoButton.addEventListener("click", () => (autoTimer === null ? startAuto() : stopAuto()));

/* ---- boot ---- */
applyLayout(svg, currentLayout());
setRegime(getRegime() || REGIMES[0]);

const focus = createFocusController({ engine, svg, tooltip, entities: ENTITIES });

mobileQuery.addEventListener("change", () => {
  focus.clear();
  applyLayout(svg, currentLayout());
});
window.addEventListener("resize", () => focus.reposition());
