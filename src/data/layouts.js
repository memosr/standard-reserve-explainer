// İki düzen: masaüstü (3 sütun) ve mobil (tek sütun, dikey oklar).
// entities: kutu sol-üst köşesi. flows: path d + etiket.
// label.lines: satırlar; label.rotate: derece (mobil kenar etiketleri için).

export const DESKTOP = {
  id: "desktop",
  viewBox: "0 0 1000 640",
  box: { w: 220, h: 100 },
  entities: {
    traders: { x: 40,  y: 40 },
    pool:    { x: 390, y: 40 },
    vaults:  { x: 740, y: 40 },
    bank:    { x: 390, y: 270 },
    bankers: { x: 390, y: 500 },
    auction: { x: 740, y: 500 },
  },
  flows: {
    buys:     { d: "M260,78 L388,78",                          label: { x: 324, y: 66,  anchor: "middle", lines: ["buys, ETH in"] } },
    sells:    { d: "M390,104 L262,104",                        label: { x: 324, y: 123, anchor: "middle", lines: ["sells, ETH out"] } },
    netflow:  { d: "M540,140 L540,268",                        label: { x: 552, y: 208, anchor: "start",  lines: ["net flow", "+ fee ETH"] } },
    issuance: { d: "M470,370 L470,498",                        label: { x: 458, y: 392, anchor: "end",    lines: ["issuance,", "pro rata"] } },
    license:  { d: "M530,500 L530,372",                        label: { x: 542, y: 430, anchor: "start",  lines: ["expansion license", "<b>100%</b> burned"] } },
    retire:   { d: "M390,545 C 300,545 300,150 388,120",       label: { x: 314, y: 330, anchor: "end",    lines: ["retire branch:", "mint to wallet,", "minus resolution fee"] } },
    charter:  { d: "M740,545 C 660,545 680,345 612,345",       label: { x: 690, y: 452, anchor: "start",  lines: ["auction ETH"] } },
    fees:     { d: "M610,300 C 730,300 850,270 850,142",       label: { x: 655, y: 235, anchor: "start",  lines: ["<b>70%</b> of protocol ETH", "to active vault"] } },
    pol:      { d: "M390,285 C 430,285 470,230 470,142",       label: { x: 458, y: 200, anchor: "end",    lines: ["<b>15%</b> to POL,", "added forever"] } },
    buyback:  { d: "M740,90 L612,90",                          label: { x: 676, y: 78,  anchor: "middle", lines: ["buyback + burn"] } },
  },
};

export const MOBILE = {
  id: "mobile",
  viewBox: "0 0 440 1040",
  box: { w: 240, h: 90 },
  entities: {
    traders: { x: 100, y: 20 },
    pool:    { x: 100, y: 200 },
    vaults:  { x: 100, y: 380 },
    bank:    { x: 100, y: 560 },
    bankers: { x: 100, y: 740 },
    auction: { x: 100, y: 920 },
  },
  flows: {
    buys:     { d: "M180,110 L180,198",                        label: { x: 170, y: 158, anchor: "end",    lines: ["buys, ETH in"] } },
    sells:    { d: "M220,200 L220,112",                        label: { x: 230, y: 158, anchor: "start",  lines: ["sells, ETH out"] } },
    buyback:  { d: "M220,380 L220,292",                        label: { x: 230, y: 340, anchor: "start",  lines: ["buyback + burn"] } },
    fees:     { d: "M200,560 L200,472",                        label: { x: 210, y: 512, anchor: "start",    lines: ["<b>70%</b> of protocol ETH", "to active vault"] } },
    pol:      { d: "M100,580 C 60,580 60,290 140,290",          label: { x: 86,  y: 470, anchor: "middle", rotate: -90, lines: ["<b>15%</b> to POL, added forever"] } },
    netflow:  { d: "M340,255 C 420,255 420,590 342,590",       label: { x: 428, y: 422, anchor: "middle", rotate: -90, lines: ["net flow + fee ETH"] } },
    issuance: { d: "M180,650 L180,738",                        label: { x: 170, y: 698, anchor: "end",    lines: ["issuance,", "pro rata"] } },
    license:  { d: "M220,740 L220,652",                        label: { x: 230, y: 692, anchor: "start",  lines: ["expansion license", "<b>100%</b> burned"] } },
    retire:   { d: "M100,785 C 20,785 20,250 98,250",          label: { x: 14,  y: 517, anchor: "middle", rotate: -90, lines: ["retire branch: mint to wallet, minus resolution fee"] } },
    charter:  { d: "M340,965 C 420,965 420,620 342,620",       label: { x: 428, y: 792, anchor: "middle", rotate: -90, lines: ["auction ETH"] } },
  },
};

export const MOBILE_QUERY = "(max-width: 600px)";
