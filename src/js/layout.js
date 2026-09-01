// Düzeni SVG'ye uygular: kutu konumları, path d'leri, etiketler.
const SVG_NS = "http://www.w3.org/2000/svg";
const LABEL_LINE_HEIGHT = 15;

const setBox = (group, pos, box) => {
  group.setAttribute("transform", `translate(${pos.x},${pos.y})`);
  const rect = group.querySelector("rect");
  rect.setAttribute("width", box.w);
  rect.setAttribute("height", box.h);
  group.querySelectorAll(".vault-indicator").forEach((el) => {
    el.setAttribute("transform", `translate(${box.w - 16},14)`);
  });
};

const buildLabelLine = (line, x, y, anchor, rotate) => {
  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("class", "flow-label");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("text-anchor", anchor);
  if (rotate) text.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
  // "<b>70%</b>" → vurgulu tspan. Sadece kendi veri dosyamızdan gelir.
  line.split(/(<b>.*?<\/b>)/).forEach((part) => {
    if (!part) return;
    const bold = part.match(/^<b>(.*)<\/b>$/);
    const node = document.createElementNS(SVG_NS, "tspan");
    if (bold) node.setAttribute("class", "num");
    node.textContent = bold ? bold[1] : part;
    text.appendChild(node);
  });
  return text;
};

const setFlow = (group, spec) => {
  group.querySelector("path").setAttribute("d", spec.d);
  group.querySelectorAll(".flow-label").forEach((el) => el.remove());
  const { x, y, anchor, rotate, lines } = spec.label;
  const dots = group.querySelector(".flow-dots");
  lines.forEach((line, i) => {
    const offset = rotate ? { x: x + i * LABEL_LINE_HEIGHT, y } : { x, y: y + i * LABEL_LINE_HEIGHT };
    const text = buildLabelLine(line, offset.x, offset.y, anchor, rotate);
    group.insertBefore(text, dots);
  });
};

export const applyLayout = (svg, layout) => {
  svg.setAttribute("viewBox", layout.viewBox);
  svg.dataset.layout = layout.id;
  Object.entries(layout.entities).forEach(([id, pos]) => {
    const group = svg.querySelector(`.entity[data-entity="${id}"]`);
    if (group) setBox(group, pos, layout.box);
  });
  Object.entries(layout.flows).forEach(([id, spec]) => {
    const group = svg.querySelector(`.flow[data-flow="${id}"]`);
    if (group) setFlow(group, spec);
  });
};
