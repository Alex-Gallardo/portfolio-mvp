export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es").format(n);
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}
