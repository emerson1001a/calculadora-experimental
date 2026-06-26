import type { EntradaFrete, ResultadoFrete, CustoDetalhado } from '../types';

// Referência: Resolução ANTT 5860/2019 e atualizações — valor base para carreta (5 eixos), carga geral
const ANTT_PISO_POR_KM = 3.2;

export function calcularFrete(entrada: EntradaFrete): ResultadoFrete {
  const { distanciaKm, valorFrete, voltaVazia, margemDesejada, custos } = entrada;

  // Na volta vazia os custos variáveis (km) dobram, pedágio também
  const fatorKm = voltaVazia ? 2 : 1;
  const distanciaTotal = distanciaKm * fatorKm;

  const diesel = custos.dieselLtPorKm * custos.dieselPrecoPorLitro * distanciaTotal;
  const pedagio = custos.pedagio * fatorKm;
  const alimentacao = custos.alimentacao;
  const pernoite = custos.pernoite;
  const manutencao = custos.manutencaoPorKm * distanciaTotal;
  const pneus = custos.pneusPorKm * distanciaTotal;
  const depreciacao = custos.depreciacaoPorKm * distanciaTotal;

  const custoDetalhado: CustoDetalhado = {
    diesel,
    pedagio,
    alimentacao,
    pernoite,
    manutencao,
    pneus,
    depreciacao,
  };

  const custoTotal = Object.values(custoDetalhado).reduce((acc, v) => acc + v, 0);
  const lucro = valorFrete - custoTotal;
  const margemReal = valorFrete > 0 ? (lucro / valorFrete) * 100 : 0;
  const pisoANTT = distanciaKm * ANTT_PISO_POR_KM;
  const abaixoPisoANTT = valorFrete < pisoANTT;

  let veredicto: ResultadoFrete['veredicto'];
  if (lucro <= 0 || abaixoPisoANTT) {
    veredicto = 'RUIM';
  } else if (margemReal >= margemDesejada) {
    veredicto = 'BOM';
  } else {
    veredicto = 'ACEITÁVEL';
  }

  return {
    entrada,
    custoTotal,
    custoDetalhado,
    lucro,
    margemReal,
    pisoANTT,
    abaixoPisoANTT,
    veredicto,
  };
}
