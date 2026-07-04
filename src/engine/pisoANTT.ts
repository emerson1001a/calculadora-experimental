// Portaria SUROC Nº 4/2026 — Tabela A: Carga Geral
// Fórmula: Piso = (distanciaKm × CCD) + CC

export const ANTT_CARGA_GERAL: Record<number, { ccd: number; cc: number }> = {
  2: { ccd: 4.0031, cc: 436.39 },
  3: { ccd: 5.1295, cc: 523.33 },
  4: { ccd: 5.8178, cc: 568.72 },
  5: { ccd: 6.7126, cc: 635.08 },
  6: { ccd: 7.4124, cc: 648.95 },
  7: { ccd: 8.1252, cc: 803.22 },
  9: { ccd: 9.2466, cc: 872.44 },
};

const EIXOS_ORDENADOS = Object.keys(ANTT_CARGA_GERAL).map(Number).sort((a, b) => a - b);

// Res. ANTT 6.076/2026 Art. 5º §5º: se eixos não constar na tabela, usa o imediatamente inferior.
// Fallback padrão: 5 eixos (carreta).
export function calcularPisoANTT(distanciaKm: number, numeroEixos?: number): number {
  const eixos = numeroEixos ?? 5;
  let eixosRef = EIXOS_ORDENADOS[0];
  for (const e of EIXOS_ORDENADOS) {
    if (e <= eixos) eixosRef = e;
  }
  const { ccd, cc } = ANTT_CARGA_GERAL[eixosRef];
  return distanciaKm * ccd + cc;
}
