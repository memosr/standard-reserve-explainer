// Be a Banker — saf simülasyon fonksiyonları. DOM'a hiç dokunmaz.
// Whitepaper referansları: §5.1 (issuance & multiplier), §7.1 (lisans decay),
// §9.1 (resolution fee / exit pressure). Protokol parametreleri launch'a kadar
// redakte (bkz. docs/parameters.md) — buradaki sayılar kullanıcının varsayımı,
// protokolün değil.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// §5.1'de rejim tanımı: "expansion (net flow positive) or contraction (net flow negative or zero)".
export function regimeFor(netFlowPerDay) {
  return netFlowPerDay > 0 ? "expansion" : "contraction";
}

// m_{n+1} kuralı (5.2) whitepaper'da redakte; burada whitepaper anlatısına
// sadık bir varsayım kullanıyoruz: contraction anında yüzdesel kesinti,
// expansion yüzdesel artış, floor/ceiling'e clamp. "cuts are immediate,
// raises must be earned" asimetrisi cut > raise oranıyla ifade edilir.
export function stepMultiplier(m, netFlowPerDay, params) {
  const { rateCut, rateRaise, multiplierFloor, multiplierCeiling } = params;
  const next =
    regimeFor(netFlowPerDay) === "expansion" ? m * (1 + rateRaise) : m * (1 - rateCut);
  return clamp(next, multiplierFloor, multiplierCeiling);
}

// Sabit yönlü net flow varsayımı altında (slider tek bir değer verir),
// epoch epoch m'yi günceller. Her epoch kendi m_n'i ile issuance üretir,
// sonraki epoch için m güncellenir (§5.1: I_n = base × d × m_n).
export function computeEpochs({ launchM, netFlowPerDay, epochLengthDays, days, params }) {
  const epochs = [];
  let m = launchM;
  let day = 0;
  let epoch = 1;
  while (day < days) {
    const endDay = Math.min(day + epochLengthDays, days);
    epochs.push({
      epoch,
      startDay: day,
      endDay,
      durationDays: endDay - day,
      m,
      regime: regimeFor(netFlowPerDay),
    });
    m = stepMultiplier(m, netFlowPerDay, params);
    day = endDay;
    epoch += 1;
  }
  return epochs;
}

// Tek bir branch'in günlük payı: base × m / N × yourBranches (§5.1).
export function dailyShare({ baseIssuance, m, totalBranches, yourBranches }) {
  return ((baseIssuance * m) / totalBranches) * yourBranches;
}

// epochs listesine, o epoch'un sonuna kadar birikmiş kümülatif bakiyeyi ekler.
// Multiplier grafiğinin ikinci çizgisi bunu kullanır: günlük payın aksine
// kümülatif bakiye m ile aynı eğriyi çizmez (hep artar, m platoya otursa bile),
// "bekledikçe ne oluyor" sorusuna görsel olarak cevap verir.
export function epochsWithBalance(epochs, { baseIssuance, totalBranches, yourBranches }) {
  let cumulativeBalance = 0;
  return epochs.map((e) => {
    cumulativeBalance += dailyShare({ baseIssuance, m: e.m, totalBranches, yourBranches }) * e.durationDays;
    return { ...e, cumulativeBalance };
  });
}

// epochs boyunca dailyShare × epoch süresi toplamı — "accrued balance" kartı.
export function sumAccrual(epochs, { baseIssuance, totalBranches, yourBranches }) {
  return epochs.reduce(
    (total, e) =>
      total + dailyShare({ baseIssuance, m: e.m, totalBranches, yourBranches }) * e.durationDays,
    0,
  );
}

export function accruedBalance({ launchM, netFlowPerDay, epochLengthDays, days, totalBranches, yourBranches, params }) {
  const epochs = computeEpochs({ launchM, netFlowPerDay, epochLengthDays, days, params });
  return sumAccrual(epochs, { baseIssuance: params.baseIssuance, totalBranches, yourBranches });
}

// Ham exit pressure formülü (§9.1): P = W / max(D + W, [redacted taban]).
// Simülatörde exit pressure doğrudan slider'dan geliyor; bu fonksiyon
// whitepaper'a sadakat için ayrı tutulan bir yardımcı, UI'da kullanılmıyor.
export function exitPressureFromFlow(withdrawn7d, heldAtBank, minDenominator = 0) {
  return withdrawn7d / Math.max(heldAtBank + withdrawn7d, minDenominator);
}

// Quadratic fee eğrisi, floor..ceiling arası, saturationPressure'da tavana çıkar (§9.1).
export function resolutionFeeRate(exitPressureValue, { resolutionFeeFloor, resolutionFeeCeiling, saturationPressure }) {
  const t = clamp(exitPressureValue / saturationPressure, 0, 1);
  return resolutionFeeFloor + (resolutionFeeCeiling - resolutionFeeFloor) * t * t;
}

// §11: protokol ETH'inin %70'i o epoch'un aktif vault'una gider — expansion'da
// hard reserve stack eder, contraction'da buyback+burn'e gider. Expansion'da
// vault yakmaz, rezerv toplar; bu yüzden basitleştirilmiş tahmin doğrudan net
// akışın %70'i (trading fee × hacim yerine).
const ACTIVE_VAULT_SHARE = 0.7;

export function reservesStackedFromFlow(netFlowPerDay) {
  return Math.max(netFlowPerDay, 0) * ACTIVE_VAULT_SHARE;
}

// Exit pressure saturation eşiğini geçtiyse fee zaten tavanda demektir.
export function isSaturated(exitPressureValue, { saturationPressure }) {
  return exitPressureValue >= saturationPressure;
}

// Bir branch'i retire etmek: fee'nin yarısı burn, yarısı kalanlara (§9.1).
export function retireBranch({ accruedForBranch, exitPressureValue, params }) {
  const feeRate = resolutionFeeRate(exitPressureValue, params);
  const fee = accruedForBranch * feeRate;
  return {
    feeRate,
    fee,
    netToWallet: accruedForBranch - fee,
    burned: fee / 2,
    toStayers: fee / 2,
    saturated: isSaturated(exitPressureValue, params),
  };
}

// Lisans fiyat decay eğrisi (§7.1): Pfloor'a üstel yaklaşım, 24 saatte start→floor.
// Simülatörün dört kartında kullanılmıyor (lisans satın alma slider'ı yok);
// whitepaper §7.1'e sadakat için saf fonksiyon olarak burada duruyor.
export function licensePrice({ pStart, pFloor, hoursElapsed }) {
  return pStart * Math.pow(pFloor / pStart, hoursElapsed / 24);
}

// "Exit now vs hold N more days": retire etmenin payı kalıcı düşürdüğünü gösterir.
export function compareExitVsHold({
  accruedNow,
  currentM,
  netFlowPerDay,
  epochLengthDays,
  totalBranches,
  yourBranches,
  exitPressureValue,
  params,
  holdDays = 90,
}) {
  const exitNow = retireBranch({ accruedForBranch: accruedNow, exitPressureValue, params });

  const holdEpochs = computeEpochs({
    launchM: currentM,
    netFlowPerDay,
    epochLengthDays,
    days: holdDays,
    params,
  });
  const additionalAccrual = sumAccrual(holdEpochs, {
    baseIssuance: params.baseIssuance,
    totalBranches,
    yourBranches,
  });
  const totalIfHeld = accruedNow + additionalAccrual;
  const exitAfterHold = retireBranch({ accruedForBranch: totalIfHeld, exitPressureValue, params });
  const mAfterHold = holdEpochs.length > 0 ? holdEpochs[holdEpochs.length - 1].m : currentM;

  // Bir branch'i şimdi retire etmenin kalıcı bedeli: o branch'in günlük payı sonsuza dek kaybolur.
  const dailyShareLostPerBranch = dailyShare({
    baseIssuance: params.baseIssuance,
    m: currentM,
    totalBranches,
    yourBranches: 1,
  });

  return {
    holdDays,
    exitNow,
    additionalAccrual,
    totalIfHeld,
    exitAfterHold,
    mAfterHold,
    dailyShareLostPerBranch,
  };
}

export const SCENARIOS = {
  conservative: {
    baseIssuance: 250_000,
    epochLengthDays: 1,
    multiplierFloor: 0.25,
    multiplierCeiling: 2.0,
    multiplierLaunch: 1.0,
    rateCut: 0.15,
    rateRaise: 0.05,
    resolutionFeeFloor: 0.10,
    resolutionFeeCeiling: 0.60,
    saturationPressure: 0.30,
    tradingFee: 0.01,
  },
  balanced: {
    baseIssuance: 500_000,
    epochLengthDays: 1,
    multiplierFloor: 0.25,
    multiplierCeiling: 2.0,
    multiplierLaunch: 1.0,
    rateCut: 0.25,
    rateRaise: 0.10,
    resolutionFeeFloor: 0.05,
    resolutionFeeCeiling: 0.50,
    saturationPressure: 0.40,
    tradingFee: 0.01,
  },
  aggressive: {
    baseIssuance: 1_000_000,
    epochLengthDays: 1,
    multiplierFloor: 0.25,
    multiplierCeiling: 2.0,
    multiplierLaunch: 1.0,
    rateCut: 0.40,
    rateRaise: 0.20,
    resolutionFeeFloor: 0.02,
    resolutionFeeCeiling: 0.40,
    saturationPressure: 0.50,
    tradingFee: 0.01,
  },
};

export const DEFAULT_INPUTS = {
  yourBranches: 1,
  totalBranches: 2000,
  netFlowPerDay: 50,
  daysHeld: 30,
  exitPressure: 0.05,
};

// Tüm simülasyonu tek çağrıda çalıştırır: sol sütun (inputs) + parametre
// paneli (params) -> sağ sütundaki 4 kart + iki grafik için gereken veri.
export function runSimulation(inputs, params) {
  const { yourBranches, totalBranches, netFlowPerDay, daysHeld, exitPressure } = inputs;

  const epochs = computeEpochs({
    launchM: params.multiplierLaunch,
    netFlowPerDay,
    epochLengthDays: params.epochLengthDays,
    days: daysHeld,
    params,
  });
  const currentEpoch = epochs[epochs.length - 1];
  const currentM = currentEpoch ? currentEpoch.m : params.multiplierLaunch;
  const regime = regimeFor(netFlowPerDay);

  // Kart 1 ikiye ayrılır: "now" son epoch'un m'sine göre, "average" dönem
  // boyunca m değiştiği için tek sayı yanıltıcı olurdu.
  const dailyShareNow = dailyShare({
    baseIssuance: params.baseIssuance,
    m: currentM,
    totalBranches,
    yourBranches,
  });

  const balance = sumAccrual(epochs, { baseIssuance: params.baseIssuance, totalBranches, yourBranches });
  const averageDailyShare = daysHeld > 0 ? balance / daysHeld : dailyShareNow;

  const exitNow = retireBranch({ accruedForBranch: balance, exitPressureValue: exitPressure, params });

  // "Bugün yakılan" için günlük payın bugün retire edilmiş gibi fee'sinin yarısı kullanılır.
  // Contraction'da anlamlı (§9.1 resolution fee burn'ü); expansion'da vault yakmaz,
  // onun yerine reservesStackedToday (§11, ETH) gösterilir.
  const tokensBurnedToday = retireBranch({
    accruedForBranch: dailyShareNow,
    exitPressureValue: exitPressure,
    params,
  }).burned;
  const reservesStackedToday = regime === "expansion" ? reservesStackedFromFlow(netFlowPerDay) : 0;

  const compare = compareExitVsHold({
    accruedNow: balance,
    currentM,
    netFlowPerDay,
    epochLengthDays: params.epochLengthDays,
    totalBranches,
    yourBranches,
    exitPressureValue: exitPressure,
    params,
    holdDays: 90,
  });

  return {
    // Her epoch'a kümülatif bakiye eklenir (chart'ın 2. çizgisi, sağ eksen).
    epochs: epochsWithBalance(epochs, { baseIssuance: params.baseIssuance, totalBranches, yourBranches }),
    dailyShareNow,
    averageDailyShare,
    accruedBalance: balance,
    exitNow,
    systemState: { regime, currentM, tokensBurnedToday, reservesStackedToday },
    compareExitVsHold: compare,
  };
}

function fmt(n) {
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(n);
}

function logScenario(label, inputs, params) {
  const result = runSimulation(inputs, params);
  console.log(`\n=== ${label} ===`);
  console.log("inputs:", inputs);
  console.log("params:", params);
  console.log(`regime: ${result.systemState.regime}, current m: ${fmt(result.systemState.currentM)}`);
  console.log(`daily share now: ${fmt(result.dailyShareNow)} $STANDARD/day`);
  console.log(`average daily share (period): ${fmt(result.averageDailyShare)} $STANDARD/day`);
  console.log(`accrued balance (${inputs.daysHeld}d): ${fmt(result.accruedBalance)} $STANDARD`);
  console.log(
    `exit now: fee rate ${fmt(result.exitNow.feeRate * 100)}%${result.exitNow.saturated ? " [saturated at ceiling]" : ""}, net ${fmt(result.exitNow.netToWallet)}, burned ${fmt(result.exitNow.burned)}, to stayers ${fmt(result.exitNow.toStayers)}`,
  );
  console.log(`tokens burned today (est.): ${fmt(result.systemState.tokensBurnedToday)}`);
  console.log(
    `exit now vs hold ${result.compareExitVsHold.holdDays}d: net now ${fmt(result.compareExitVsHold.exitNow.netToWallet)} vs net after hold ${fmt(result.compareExitVsHold.exitAfterHold.netToWallet)} (m after hold: ${fmt(result.compareExitVsHold.mAfterHold)})`,
  );
  console.log(
    `permanent daily share lost per retired branch: ${fmt(result.compareExitVsHold.dailyShareLostPerBranch)} $STANDARD/day`,
  );
  return result;
}

function runTests() {
  logScenario("Balanced, defaults", DEFAULT_INPUTS, SCENARIOS.balanced);

  logScenario(
    "Aggressive, sustained strong inflow, 90 days",
    { yourBranches: 3, totalBranches: 2000, netFlowPerDay: 500, daysHeld: 90, exitPressure: 0.05 },
    SCENARIOS.aggressive,
  );

  logScenario(
    "Conservative, sustained outflow, high exit pressure",
    { yourBranches: 1, totalBranches: 2000, netFlowPerDay: -200, daysHeld: 30, exitPressure: 0.4 },
    SCENARIOS.conservative,
  );

  logScenario(
    "Balanced, long horizon inflow — should clamp at ceiling",
    { yourBranches: 5, totalBranches: 2000, netFlowPerDay: 500, daysHeld: 365, exitPressure: 0.05 },
    SCENARIOS.balanced,
  );

  logScenario(
    "Balanced, long horizon outflow — should clamp at floor",
    { yourBranches: 5, totalBranches: 2000, netFlowPerDay: -500, daysHeld: 365, exitPressure: 0.6 },
    SCENARIOS.balanced,
  );

  logScenario(
    "Max concentration: 10 branches out of 1000, mild inflow",
    { yourBranches: 10, totalBranches: 1000, netFlowPerDay: 20, daysHeld: 30, exitPressure: 0.05 },
    SCENARIOS.aggressive,
  );

  // Sanity check: §7.1 lisans decay ve ham §9.1 exit pressure fonksiyonları bağımsız çalışıyor mu.
  console.log("\n=== §7.1 license price decay sanity check ===");
  console.log("t=0h:", fmt(licensePrice({ pStart: 100, pFloor: 10, hoursElapsed: 0 })));
  console.log("t=12h:", fmt(licensePrice({ pStart: 100, pFloor: 10, hoursElapsed: 12 })));
  console.log("t=24h:", fmt(licensePrice({ pStart: 100, pFloor: 10, hoursElapsed: 24 })));

  console.log("\n=== §9.1 raw exit pressure sanity check ===");
  console.log("W=100, D=900:", fmt(exitPressureFromFlow(100, 900)));
  console.log("W=100, D=0, minDenominator=50:", fmt(exitPressureFromFlow(100, 0, 50)));
}

const isMainModule =
  typeof process !== "undefined" &&
  process.argv[1] &&
  import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runTests();
}
