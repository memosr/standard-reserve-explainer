// Whitepaper §02 "Flows" (1..6) + §11 fee routing (fees, pol, buyback).
// kind: eth | standard | burn | reserve  → renk ve animasyon tipi
// regime: "both" | "expansion" | "contraction"
// label: ok etiketi (düzen dosyası satırlara böler). detail: etiket üzerine hover tooltip.
export const FLOWS = [
  { id: "buys",     from: "traders", to: "pool",    kind: "eth",      regime: "both",        label: "buys, ETH in" },
  { id: "sells",    from: "pool",    to: "traders", kind: "eth",      regime: "both",        label: "sells, ETH out" },
  { id: "netflow",  from: "pool",    to: "bank",    kind: "eth",      regime: "both",        label: "net flow + fee ETH",
    detail: "Net flow = ETH in from buys minus ETH out from sells." },
  { id: "issuance", from: "bank",    to: "bankers", kind: "standard", regime: "both",        label: "issuance, pro rata" },
  { id: "license",  from: "bankers", to: "bank",    kind: "burn",     regime: "both",        label: "expansion license, 100% burned",
    detail: "Paid in $STANDARD, burned on receipt. Max 3 per charter per day." },
  { id: "retire",   from: "bankers", to: "pool",    kind: "standard", regime: "both",        label: "retire branch: mint to wallet, minus resolution fee",
    detail: "Half of the resolution fee is burned, half is paid to bankers who stayed. Exits sell here." },
  { id: "charter",  from: "auction", to: "bank",    kind: "eth",      regime: "both",        label: "auction ETH" },
  { id: "fees",     from: "bank",    to: "vaults",  kind: "eth",      regime: "both",        label: "70% of protocol ETH to active vault",
    detail: "All protocol ETH: trading fees + charter auctions. 70% vault, 15% POL, 15% team." },
  { id: "pol",      from: "bank",    to: "pool",    kind: "eth",      regime: "both",        label: "15% to POL, added forever" },
  { id: "buyback",  from: "vaults",  to: "pool",    kind: "burn",     regime: "contraction", label: "buyback + burn",
    detail: "Contraction vault buys $STANDARD on the open market and burns it, in rate-limited hourly steps." },
];
