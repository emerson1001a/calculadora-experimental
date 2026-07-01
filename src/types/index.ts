export type TipoRetorno = 'nenhum' | 'vazio' | 'comCarga';

export interface Custos {
  dieselKmPorLt: number;
  dieselPrecoPorLitro: number;
  arlaKmPorLt: number;
  arlaPrecoPorLitro: number;
  pedagio: number;
  pedagioVolta: number;
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
  tipoRetorno: TipoRetorno;
  margemDesejada: number;
  custos: Custos;
}

export interface CustoDetalhado {
  diesel: number;
  arla: number;
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
