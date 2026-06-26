export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function parseNumber(text: string): number {
  const cleaned = text.replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
