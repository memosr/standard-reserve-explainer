// Ok etiketi üzerine hover / tap: flows.js "detail" metnini küçük tooltip'te gösterir.
const TIP_GAP = 8;

export const createFlowTips = ({ engine, svg, tip, flows }) => {
  const detailById = new Map(flows.filter((f) => f.detail).map((f) => [f.id, f.detail]));
  let openId = null;

  svg.querySelectorAll(".flow").forEach((g) => {
    if (detailById.has(g.dataset.flow)) g.dataset.detail = "";
  });

  const labelOf = (target) => target.closest?.(".flow[data-detail] .flow-label");

  const show = (label) => {
    const id = label.closest(".flow").dataset.flow;
    tip.textContent = detailById.get(id);
    tip.hidden = false;
    const r = label.getBoundingClientRect();
    const host = engine.getBoundingClientRect();
    const left = Math.min(r.left - host.left, host.width - tip.offsetWidth - TIP_GAP);
    tip.style.left = `${Math.max(TIP_GAP, left)}px`;
    tip.style.top = `${r.bottom - host.top + TIP_GAP}px`;
    openId = id;
  };

  const hide = () => { tip.hidden = true; openId = null; };

  svg.addEventListener("pointerover", (e) => {
    const label = labelOf(e.target);
    if (label && e.pointerType === "mouse") show(label);
  });
  svg.addEventListener("pointerout", (e) => {
    if (labelOf(e.target) && e.pointerType === "mouse") hide();
  });
  svg.addEventListener("click", (e) => {
    const label = labelOf(e.target);
    if (!label) return;
    e.stopPropagation();
    const id = label.closest(".flow").dataset.flow;
    openId === id ? hide() : show(label);
  });
  document.addEventListener("click", hide);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });

  return { hide };
};
