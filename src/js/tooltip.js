// Kutu odağı: bağlı akışları öne çıkarır, tooltip gösterir.
// Hover geçici, tap / Enter kalıcı (pinned). Dış tap veya Escape kapatır.
const TOOLTIP_GAP = 12;

export const createFocusController = ({ engine, svg, tooltip, entities }) => {
  const byId = new Map(entities.map((e) => [e.id, e]));
  const entityGroups = [...svg.querySelectorAll(".entity")];
  const flowGroups = [...svg.querySelectorAll(".flow")];
  let pinnedId = null;

  const positionTooltip = (group) => {
    const rect = group.querySelector("rect").getBoundingClientRect();
    const host = engine.getBoundingClientRect();
    const isMobile = svg.dataset.layout === "mobile";
    const fitsRight = rect.right + TOOLTIP_GAP + tooltip.offsetWidth < host.right;
    const left = !isMobile && fitsRight ? rect.right + TOOLTIP_GAP : rect.left;
    const top = !isMobile && fitsRight ? rect.top : rect.bottom + TOOLTIP_GAP;
    tooltip.style.left = `${left - host.left}px`;
    tooltip.style.top = `${top - host.top}px`;
  };

  const show = (id) => {
    const entity = byId.get(id);
    const group = svg.querySelector(`.entity[data-entity="${id}"]`);
    if (!entity || !group) return;
    engine.dataset.focus = id;
    entityGroups.forEach((g) => g.classList.toggle("is-active", g.dataset.entity === id));
    flowGroups.forEach((g) => g.classList.toggle("is-linked", g.dataset.from === id || g.dataset.to === id));
    tooltip.querySelector(".tooltip-section").textContent = entity.section;
    tooltip.querySelector(".tooltip-name").textContent = entity.name;
    tooltip.querySelector(".tooltip-tldr").textContent = entity.tldr;
    tooltip.hidden = false;
    positionTooltip(group);
  };

  const clear = () => {
    pinnedId = null;
    delete engine.dataset.focus;
    entityGroups.forEach((g) => g.classList.remove("is-active"));
    flowGroups.forEach((g) => g.classList.remove("is-linked"));
    tooltip.hidden = true;
  };

  const pin = (id) => {
    if (pinnedId === id) { clear(); return; }
    pinnedId = id;
    show(id);
  };

  entityGroups.forEach((group) => {
    const id = group.dataset.entity;
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${byId.get(id)?.name ?? id}, show details`);

    group.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !pinnedId) show(id); });
    group.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !pinnedId) clear(); });
    group.addEventListener("click", (e) => { e.stopPropagation(); pin(id); });
    group.addEventListener("focus", () => { if (!pinnedId) show(id); });
    group.addEventListener("blur", () => { if (!pinnedId) clear(); });
    group.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pin(id); }
      if (e.key === "Escape") clear();
    });
  });

  document.addEventListener("click", (e) => {
    if (pinnedId && !tooltip.contains(e.target)) clear();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") clear(); });

  return {
    clear,
    reposition: () => {
      const id = engine.dataset.focus;
      if (id) positionTooltip(svg.querySelector(`.entity[data-entity="${id}"]`));
    },
  };
};
