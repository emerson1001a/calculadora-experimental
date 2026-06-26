export interface Custos {
  dieselLtPorKm: number;
  dieselPrecoPorLitro: number;
  pedagio: number;
  alimentacao: number;
  pernoite: number;
  manutencaoPorKm: number;
  pneusPorKm: number;
  depreciacaoPorKm: number;
}

export interface EntradaFrete {
  origem: string;
  destino: string;
  distanciaKm: number;
  valorFrete: number;
  voltaVazia: boolean;
  margemDesejada: number;
  custos: Custos;
}

export interface CustoDetalhado {
  diesel: number;
  pedagio: number;
  alimentacao: number;
  pernoite: number;
  manutencao: number;
  pneus: number;
  depreciacao: number;
}

export interface ResultadoFrete {
  entrada: EntradaFrete;
  custoTotal: number;
  custoDetalhado: CustoDetalhado;
  lucro: number;
  margemReal: number;
  pisoANTT: number;
  abaixoPisoANTT: boolean;
  veredicto: 'BOM' | 'ACEITÁVEL' | 'RUIM';
}
