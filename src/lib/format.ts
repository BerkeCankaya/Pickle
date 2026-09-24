const numberFormat = new Intl.NumberFormat("tr-TR");
const percentFormat = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 0 });

/** 1284 → "1.284" */
export function formatNumber(value: number) {
  return numberFormat.format(value);
}

/** Kazanma oranı = galibiyet / (galibiyet + mağlubiyet). Hiç maç yoksa 0. */
export function winRate(wins: number, losses: number) {
  const total = wins + losses;
  return total === 0 ? 0 : wins / total;
}

/** 0.634 → "%63" */
export function formatPercent(value: number) {
  return percentFormat.format(value);
}
