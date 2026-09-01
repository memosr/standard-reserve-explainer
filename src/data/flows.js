// Whitepaper §02 "Flows" (1..6) + §11 fee routing (7, 8).
// kind: eth | standard | burn | reserve  → renk ve animasyon tipi
// regime: "both" | "expansion" | "contraction"
export const FLOWS = [
  { id: "buys",      from: "traders", to: "pool",    kind: "eth",      regime: "both",        label: "buys, ETH in" },
  { id: "sells",     from: "pool",    to: "traders", kind: "eth",      regime: "both",        label: "sells, ETH out" },
  { id: "netflow",   from: "pool",    to: "bank",    kind: "eth",      regime: "both",        label: "net flow + trading fees" },
  { id: "issuance",  from: "bank",    to: "bankers", kind: "standard", regime: "both",        label: "issuance, pro rata per branch" },
  { id: "license",   from: "bankers", to: "bank",    kind: "burn",     regime: "both",        label: "expansion license, 100% burned" },
  { id: "retire",    from: "bankers", to: "pool",    kind: "standard", regime: "both",        label: "retire branch, mint minus fee" },
  { id: "charter",   from: "auction", to: "bank",    kind: "eth",      regime: "both",        label: "charter sale, ETH" },
  { id: "fees",      from: "bank",    to: "vaults",  kind: "eth",      regime: "both",        label: "70% fees to active vault" },
  { id: "buyback",   from: "vaults",  to: "pool",    kind: "burn",     regime: "contraction", label: "buyback + burn" },
];
