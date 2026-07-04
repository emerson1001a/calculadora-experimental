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
  if (!text) return 0;
  // Suporta formato pt-BR (1.500,00) e formato neutro (150.00 ou 150,00 simples)
  const cleaned = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Converte número para formato de exibição maquininha (ex: 150.5 → "150,50")
export function toMaquininha(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Aplica lógica maquininha: dígitos entram pela direita com 2 casas fixas.
// novoTexto = string que o TextInput reportou; valorAtual = estado anterior formatado.
export function aplicarMaquininha(novoTexto: string, valorAtual: string): string {
  const novosDigitos = novoTexto.replace(/\D/g, '');
  const digitosAtuais = valorAtual.replace(/\D/g, '');
  let digits: string;
  if (novosDigitos.length < digitosAtuais.length) {
    digits = digitosAtuais.slice(0, -1);
  } else {
    digits = novosDigitos.slice(0, 10);
  }
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
