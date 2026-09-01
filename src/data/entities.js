// Whitepaper §02 + site akış diyagramındaki 6 kutu.
// tldr: hover/tap tooltip metni (whitepaper TLDR sütunu).
// section: tooltip başlığındaki whitepaper bölümü.
export const ENTITIES = [
  { id: "traders",  name: "Traders",         sub: "anyone, no charter",         section: "§02 Flows",              tldr: "Anyone can trade. Every swap pays a trading fee in ETH." },
  { id: "pool",     name: "Pool",            sub: "ETH <> $STANDARD, v4 hook",  section: "§04 Net flow signal",    tldr: "Every swap feeds the bank ETH. Net flow is measured here." },
  { id: "vaults",   name: "Vaults",          sub: "expansion / contraction",    section: "§11 Fees and reserves",  tldr: "Expansion vault stacks reserves. Contraction vault buys back and burns." },
  { id: "bank",     name: "Central Bank",    sub: "~4,000 lines, immutable",    section: "§05 Monetary policy",    tldr: "Reads net flow, sets issuance rate, routes fees." },
  { id: "auction",  name: "Charter Auction", sub: "daily Dutch auction, ETH",   section: "§06 Charters",           tldr: "1,000 charters at genesis. New ones only via daily ETH auction." },
  { id: "bankers",  name: "Bankers",         sub: "charters + branches",        section: "§07 Branches",           tldr: "One charter = one bank, 1 to 10 branches. Open by burning $STANDARD, cash out by retiring branches." },
];
