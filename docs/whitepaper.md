# The Standard Reserve: Whitepaper v0.1 (temiz kopya)

> Kaynak: https://www.standardreserve.xyz/whitepaper/
> Not: Sitedeki sayısal parametreler JS render sorunu değil, kasıtlı olarak gizli. Sitenin kendi kaynak kodunda
> (`assets/whitepaper-*.js`) bu değerler `wp-redact` bileşeniyle sarılı ve `aria-label="Redacted until launch"`
> etiketi taşıyor — yani rakamlar lansmana kadar resmi olarak yayınlanmıyor, sadece bir placeholder genişliği
> (`w:`) render ediliyor, gerçek sayı yok. Playwright/headless browser ile sayfa tam render edilse bile bu
> alanlar boş kalır. Bunlar `[TODO]` olarak işaretli kalmalı; tahmini değer yazılmadı. Detay için
> `docs/parameters.md` içindeki not bölümüne bak.
> Resmi uyarı: Bu bir tasarım özeti, implementasyon spesifikasyonu değil. Tek kanonik deployment standardreserve.xyz.

---

## 01. Introduction

STANDARD is a closed monetary economy with:
- **one currency**: $STANDARD
- **one market**: ETH <> $STANDARD pool on Uniswap v4
- **one signal**: net ETH flow through that market
- **one authority**: the central bank, ~4,000 lines of immutable code

Bankers hold charters, charters operate branches, branches earn the currency issued by the central bank.

- Capital flowing **in** → loosens policy, increases issuance, stacks hard reserves (tokenized gold).
- Capital flowing **out** → tightens policy, triggers buybacks and burns, prices the exits.

Every path through the economy either burns $STANDARD or brings the central bank hard assets.

---

## 02. The entities

| Entity | What it is | TLDR |
|---|---|---|
| $STANDARD | ERC-20, 1B hard cap | Minted only at withdrawal. Burned constantly. |
| The pool | ETH <> $STANDARD, hooked Uniswap v4 pool | Every swap feeds the bank ETH. Net flow measured here. |
| The central bank | Issuing authority | Reads net flow, sets issuance rate, routes fees. |
| A charter | Initially soulbound NFT. One charter = one bank, 1 to 10 branches | 1,000 at genesis. New ones only via daily ETH auction. |
| A branch | Yield accrual vehicle inside a charter. Pro-rata share of daily issuance | Open by burning $STANDARD. Cash out by retiring branches. |
| The vaults | Where fees land | Expansion vault stacks reserves. Contraction vault buys back and burns. |

**Mental model:** charter = company, branches = its stores. Company earns through stores, reinvests to open more, pays owner by closing stores. Closing the last store dissolves the company.

### Flows
1. **Traders ⇄ pool**: anyone can trade, no charter needed. Every swap pays a trading fee in ETH.
2. **Pool → central bank**: v4 hook reports net flow (ETH in from buys minus ETH out from sells). Only input.
3. **Central bank → branches**: each epoch, issuance to all branches pro rata. Share = your branches / total branches.
4. **Bankers → bank**: spend earned $STANDARD on expansion licenses. 100% burned.
5. **Bankers → pool**: retire a branch → its share of balance is minted to wallet minus resolution fee.
6. **New bankers → central bank**: charters bought at daily ETH auction. ETH enters fee engine.

---

## 03. The currency

- **Hard cap**: 1,000,000,000 $STANDARD, 18 decimals
- **Genesis**: 100,000,000 as protocol-owned liquidity (POL), full-range, locked in v4 pool forever. Only pre-mint.
- **Issuance budget**: 900,000,000. When exhausted, base issuance stops permanently; economy runs closed-loop on recycled fees.

Issuance is a ledger entry. Real tokens mint only on withdrawal.

Burns: expansion licenses (100%), open market buybacks (100%), resolution fees (50%).

```
S_circ(t) = 100,000,000 + M(t) - B(t)        (3.1)
  M(t) = cumulative withdrawal mints
  B(t) = cumulative burns

S_max(t) = 1,000,000,000 - B(t)              (3.2)   (strictly non-increasing)
```

"Circulating supply is a receipt."

---

## 04. The net flow signal

Hook counts per epoch: gross ETH in (buys) and gross ETH out (sells).

```
F_n      = ETH_in_n - ETH_out_n               (net flow, epoch n)
signal_n = F_(n-1) + F_(n-2)                  (4.1)  trailing two completed epochs
```

- **Issuance rate** moves on `signal_n` (slow lever, 2 epochs).
- **Fee routing** moves on `sign(F_n)` of current epoch (fast lever).

Properties: measured at the canonical pool only, denominated in ETH (real capital), manipulation-resistant via trailing window.

---

## 05. Monetary policy

Base issuance `[TODO] $STANDARD/day`, scaled by policy multiplier `m`.

```
I_n = base × d × m_n                          (5.1)   d = epoch length in days
single branch daily yield = base × m / N      N = total branches
m_(n+1) = f(signal_n)                         (5.2)   rate cut if negative, raise if positive
```

| Parameter | Value |
|---|---|
| Multiplier range | [TODO] floor .. [TODO] ceiling |
| Launch value | [TODO] |
| Epoch length | [TODO] |
| Rate cut | [TODO] per epoch |
| Rate raise | [TODO] per epoch |

**Asymmetry**: cuts are immediate, raises must be earned. "The bank turns defensive faster than it turns generous."

### Two regimes

| | Expansion (net flow > 0) | Contraction (net flow ≤ 0) |
|---|---|---|
| Issuance | climbing (if sustained) | cut immediately |
| Fee routing | expansion vault: hard reserves | contraction vault: buyback + burn |
| Licenses | cost more (floor scales with rate) | cost less |
| Exits | cheap, floor fee | priced by the crowd, up to ceiling |
| Rational move | expand; every new branch burns supply | stay; exit fees pay those who remain |

---

## 06. Charters

- Initially soulbound NFT. Holding one = banker.
- **Genesis**: 1,000 Founding Charters, **free**. Allowlist portion + public portion, one per wallet. No sale, no proceeds. Team seeds genesis liquidity.
- **After genesis**: daily Dutch auctions in ETH. Proceeds → fee engine.
- **Lifecycle**: charter lives until last branch retired, then NFT burns. Only way back is a new auction charter. No revolving doors.

---

## 07. Branches and expansion licenses

Every charter opens with 1 branch, max 10. Each branch = one share of every epoch's issue.

Additional branches need an expansion license (daily Dutch auction):

| Parameter | Value |
|---|---|
| Licenses per day | 100 (initially) |
| Per-charter limit | 3 per day |
| Payment | $STANDARD, 100% burned |
| Start price | 2 × P_last |
| Floor price | [TODO] (≈ two days of one branch's yield) |
| Decay | exponential over 24h |

```
P(t) = P_start × (P_floor / P_start)^(t / 24h)     (7.1)
P_start = 2 × P_last
```

A branch earns from the second it opens (continuous streaming).

Expansion flywheel: the most rational move (growing your bank) permanently shrinks the float.

---

## 08. How the auctions work

One mechanism: daily falling-price Dutch auction. Opens high, decays to floor over 24h, instant purchase at current price, first come first served. No bids, no escrow, no refunds.

| | License auction | Charter auction |
|---|---|---|
| Paid in | $STANDARD (burned) | ETH (fee engine) |
| Daily count | 100 initially | starts at 0, policy-controlled |
| Open | 2 × yesterday's last sale (or 2 × floor) | 3 × yesterday's last sale (or 3 × floor, admin-set reserve) |
| Decay | exponential to floor over 24h | same |
| Purchase | max 3 per charter per day | charter mints in same tx, first branch included |
| Close | 100 sold or 24h. Unsold do not roll over. Last sale = tomorrow's P_last | count sold or 24h. Unsold never minted. |

Consequences:
- **Buyers set the price**, not the protocol. Early = premium for certainty, late = cheaper but risk sellout.
- **Asymmetric repricing**: in downturns price hits floor fast (expansion is cheapest in contractions). In upturns opens can rise at most 2×/day (licenses) or 3×/day (charters). A demand spike can push ~100× in a week for licenses.

---

## 09. Earning and withdrawing

Issuance accrues continuously. To take profit, retire branches.

- Retiring 1 of 10 branches liquidates 1/10 of the balance.
- Retiring all 10 liquidates everything and burns the charter.
- Released amount minted to wallet **minus resolution fee**.
- You cannot extract value and keep the vehicle that produced it.

### Resolution fee (congestion pricing on the exit)

```
W = tokens withdrawn system-wide, trailing 7 days
D = everything still held at the bank

P   = W / max(D + W, [TODO])                  (9.1)   exit pressure
fee = quadratic(P), floor [TODO]% .. ceiling [TODO]%
      saturates when [TODO]% of the bank tries to leave in a week
```

| Exit pressure | Fee |
|---|---|
| Quiet | [TODO] floor |
| Elevated | [TODO] |
| Heavy | [TODO] |
| Bank run | [TODO] ceiling |

- Your fee rate locks the moment you commit.
- **50% of every fee burned. 50% paid to every banker who stayed.**
- Withdrawals never paused or queued. Cost of leaving is the only control.

This inverts the bank run: mass exits transfer value from the impatient to the patient.

---

## 10. Dormant bankers

1. **Report**: wallet inactive 30 days can be reported by anyone.
2. **Bounty**: informant gets 2% of dormant balance, capped at 100,000 tokens.
3. **Revocation**: ghost pays 70% revocation fee (worse than worst-case resolution fee). Half burned, half to active bankers.
4. **Shutdown**: branches shuttered, charter burns, remaining 30% sent to wallet.

Staying active is free: any interaction resets the clock; zero-cost check-in exists.

---

## 11. Fees, reserves, defense

All protocol ETH (trading fees + charter auctions) routes each epoch:

| Share | Destination |
|---|---|
| 70% | active vault (expansion or contraction, by that epoch's net flow) |
| 15% | protocol-owned liquidity (half swapped to $STANDARD, paired, added forever) |
| 15% | team |

- **Expansion vault**: accumulates ETH, buys hard reserve assets (tokenized gold etc). Held by the bank.
- **Contraction vault**: buys $STANDARD on open market and burns all. Rate-limited hourly ticks:

```
spend_tick = min(0.10 × V, 0.002 × R)         (11.1)
  V = vault balance, R = pool reserves
  ≈ 5% of pool depth per day at launch settings
```

Unspent rolls forward. Vault can never sell. POL only grows. Trading fees earned in $STANDARD are always burned.

---

## 12. Transferable charters (future)

Launch soulbound. One-way switch enables transfers later. Selling a charter = second exit path with zero sell pressure on $STANDARD (seat moves whole, branches + balance included).

---

## 13. Flywheels

1. **Adoption**: new charters sold for ETH → same engine (reserves, POL, buybacks). Daily issuance is capped, so a new banker changes how it's divided, not how much exists.
2. **Expansion**: highest EV action (adding branches) is also the largest supply sink. No lockups needed.
3. **Fee flow**: direction-agnostic. Buys and sells both pay ETH. Volatility converts into balance sheet either way.
4. **Monetary policy**: on exit, three defenses compound at once: issuance cut, fee routing flips to buybacks, resolution fee rises (half burned, half to stayers).

---

## 14. Launch parameters

| Parameter | Launch value |
|---|---|
| Hard cap | 1,000,000,000 |
| Genesis liquidity | 100,000,000 (POL) |
| Base issuance | [TODO] |
| Multiplier m | [TODO] |
| Epoch | [TODO] |
| Founding Charters | 1,000 free |
| Charter auctions | 0/day initially, policy-controlled |
| Branches per charter | 1 to 10 |
| Expansion licenses | 100/day, 3 per charter/day |
| License floor | [TODO] |
| Trading fee | [TODO] |
| Fee split | 70 / 15 / 15 |
| Resolution fee | [TODO] floor .. [TODO] ceiling, quadratic |
| Dormancy | 30 days, 2% bounty (cap 100k), 70% revocation |
| Buyback execution | min(10% vault, 0.2% pool) per hour |

Final parameters to be announced closer to launch.

---

## 15. Disclaimer

Experimental onchain protocol. Not a bank, holds no customer funds, not regulated. Not investment advice.

---

## Ek notlar (bizim için)

- **Site flow diyagramındaki 6 kutu**: Traders, Pool, Bankers, Vaults, Charter Auction, Central Bank. Hafta 1 animasyonunun iskeleti bu.
- **Simülatör için gereken formüller**: 5.1, 7.1, 9.1, 11.1. Boş parametreler için varsayılan değer koyup "assumed" etiketi göstereceğiz.
- **Tutarsızlık**: Bölüm 8, license açılışını 2×, charter açılışını 3× olarak veriyor. Doğru, bilinçli fark.
