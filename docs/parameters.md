# Launch Parameters — Doğrulama Notu

**Kaynak:** https://www.standardreserve.xyz/whitepaper/
**Kontrol tarihi:** 2026-09-01

## Sonuç: sayılar yayınlanmamış (render sorunu değil)

Sayfa bir Vite/React SPA (`assets/whitepaper-*.js`). Sayfayı headless browser ile
(gstack `browse`, Chromium tabanlı) tam render ettim, `networkidle` bekledim ve
JS bundle'ının kaynağını da indirip inceledim.

Bulgu: whitepaper'daki her sayısal parametre `wp-redact` adlı bir bileşenle
sarılı:

```js
function p0({w:r,i:e}){
  return o.jsx("span",{
    className:"wp-redact",
    role:"img",
    "aria-label":"Redacted until launch",
    style:{width:`${r}...`}
  })
}
```

Yani bu alanlar gerçek bir sayı içermiyor — sadece bir placeholder genişliği
(`w:`) render ediliyor ve `aria-label="Redacted until launch"` diyor. Sayfa 51
adet bu tür redaksiyon içeriyor. Bu, tarayıcı/JS render gecikmesi değil, sitenin
**kasıtlı tasarım kararı**: parametreler lansmana kadar gizleniyor. Sayfanın
kendisi de bunu söylüyor: "Final parameters will be announced closer to launch."
(Bölüm 14 sonu).

Bu yüzden aşağıdaki tüm tablolarda değer sütunu **"not rendered / redacted until
launch"** olarak işaretlendi. Tahmini sayı yazılmadı.

---

## Bölüm 05 — Monetary policy

| Parametre | Değer |
|---|---|
| Base issuance (per day) | not rendered / redacted until launch |
| Multiplier m — floor | not rendered / redacted until launch |
| Multiplier m — ceiling | not rendered / redacted until launch |
| Multiplier m — launch value | not rendered / redacted until launch |
| Epoch length | not rendered / redacted until launch |
| Rate cut (per epoch) | not rendered / redacted until launch |
| Rate raise (per epoch) | not rendered / redacted until launch |

Metinden (sayısız) doğrulanan kurallar:
- Formül: `I_n = base × d × m_n` (issuance = base rate × epoch gün sayısı × çarpan).
- Çarpan güncellemesi her epoch'ta bir kurala göre yapılıyor (formül 5.2, sayısal katsayılar gizli).
- Asimetri kasıtlı: **rate cut anında**, **rate raise kazanılmalı** (immediate cut, earned raise).
- İki rejim: **Expansion** (net flow pozitif) → issuance artabilir, fee'ler expansion vault'a (hard reserve), lisanslar pahalanır, çıkış ucuz (floor). **Contraction** (net flow negatif/sıfır) → issuance anında kesilir, fee'ler contraction vault'a (buyback & burn), lisanslar ucuzlar, çıkış piyasa tarafından fiyatlanır (ceiling'e kadar).

## Bölüm 07 — Branches & expansion licenses

| Parametre | Değer |
|---|---|
| Branches per charter (max) | **10** (metinde açık yazıyor, redakte değil) |
| Licenses per day | not rendered / redacted until launch |
| Per-charter limit (lisans/gün) | not rendered / redacted until launch (Bölüm 08'de "en fazla 3 lisans/gün" yazıyor, bu satır ile aynı olabilir) |
| Payment | **$STANDARD, %100 burn edilir** (redakte değil) |
| Start price | not rendered / redacted until launch |
| License floor price | not rendered / redacted until launch (metin: "yaklaşık iki günlük bir branch'in getirisi" kadar) |
| Decay | formül var (7.1), üstel decay, 24 saatte start→floor; sayısal parametreler gizli |

## Bölüm 09 — Earning & withdrawing (Resolution fee tablosu)

Formül (9.1): `P = W / max(D + W, [redacted])`, `fee = quadratic(P)`, floor…ceiling arası, `[redacted]%`'lik bir eşikte saturize oluyor.

| Durum | Exit pressure (7 günlük) | Fee |
|---|---|---|
| Quiet | not rendered / redacted until launch | not rendered / redacted until launch |
| Elevated | not rendered / redacted until launch | not rendered / redacted until launch |
| Heavy | not rendered / redacted until launch | not rendered / redacted until launch |
| Bank run | not rendered / redacted until launch | not rendered / redacted until launch |

Doğrulanan kurallar (sayısız):
- Fee quadratic bir eğri, floor'dan ceiling'e.
- Fee'nin yarısı burn edilir, yarısı kalan (retire etmeyen) bankerlara dağıtılır.
- Exit pressure denominatöründeki saturation eşiği de redakte ("saturating when [redacted]% of the bank tries to leave in a week").

## Bölüm 14 — Launch parameters (özet tablo)

Bu bölümdeki satırların tamamı (Hard cap hariç — o Bölüm 03'te açık yazıyor: 1,000,000,000 $STANDARD, 18 decimal, 100,000,000 genesis POL, 900,000,000 issuance budget) redakte:

| Parametre | Değer |
|---|---|
| Hard cap | 1,000,000,000 $STANDARD (Bölüm 03'ten, redakte değil) |
| Genesis liquidity | 100,000,000 $STANDARD, POL (Bölüm 03'ten, redakte değil) |
| Base issuance | not rendered / redacted until launch |
| Multiplier m | not rendered / redacted until launch |
| Epoch | not rendered / redacted until launch |
| Founding Charters | 1,000 (Bölüm 06'dan, redakte değil) |
| Charter auctions | not rendered / redacted until launch (sayı/gün policy-controlled, başlangıçta 0) |
| Branches per charter | 10 (Bölüm 07'den, redakte değil) |
| Expansion licenses | not rendered / redacted until launch (Bölüm 08 metninde "initially 100/day" yazıyor — bu muhtemelen gerçek değer, redakte değil) |
| License floor | not rendered / redacted until launch |
| Trading fee | not rendered / redacted until launch |
| Fee split | 70% active vault / 15% POL / 15% team (Bölüm 11'den, redakte değil) |
| Resolution fee | not rendered / redacted until launch (floor..ceiling, quadratic) |
| Dormancy | 30 gün inaktiflik → report edilebilir; %2 bounty (100,000 token cap); %70 revocation fee (Bölüm 10'dan, redakte değil) |
| Buyback execution | `spend_tick = min(0.10×V, 0.002×R)`, günlük havuz derinliğinin ~%5'i (Bölüm 11'den, redakte değil — sayılar metinde açık) |

---

## Metinde açık olan (redakte olmayan) diğer sayılar — referans

Bunlar tablo dışı ama açıkça yazılı, whitepaper.md'ye zaten işlendi:

- Hard cap: 1,000,000,000 $STANDARD, 18 decimal
- Genesis: 100,000,000 (POL, full-range, geri çekilemez)
- Issuance budget: 900,000,000
- Founding Charters: 1,000 (allowlist + public, cüzdan başına 1)
- Branches per charter: max 10
- License auction: günde başlangıçta 100 lisans, charter başına günde en fazla 3 lisans
- Charter auction açılışı: önceki günün kapanışının 3×'i (satılmadıysa floor'un 3×'i)
- License auction açılışı: önceki günün kapanışının 2×'i (satılmadıysa floor'un 2×'i)
- Fee split: %70 active vault, %15 POL, %15 team
- Buyback tick: `min(0.10×V, 0.002×R)`, saatlik, havuz derinliğinin günde ~%5'i
- Dormancy: 30 gün, bounty %2 (cap 100,000 token), revocation fee %70 (yarısı burn, yarısı kalanlara)

## Sonraki adım

Bu değerler yayınlandığında (whitepaper "Final parameters will be announced closer
to launch" diyor), sayfa yeniden kontrol edilip bu dosya ve `docs/whitepaper.md`
güncellenmeli. O ana kadar `[TODO]` işaretleri whitepaper.md içinde korunmalı.
