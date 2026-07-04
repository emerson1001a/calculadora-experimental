export type TipoRetorno = 'nenhum' | 'vazio' | 'comCarga';

export type TipoVeiculo =
  | 'Carreta' | 'Carreta LS' | 'Vanderléia' | 'Carreta 4º eixo'
  | 'Bitrem 7 eixos' | 'Bitrem 9 eixos' | 'Rodotrem'
  | 'Truck' | 'BiTruck'
  | 'Fiorino' | 'VLC' | '3/4' | 'Toco';

export type TipoCarroceria =
  | 'Graneleiro' | 'Grade baixa' | 'Prancha' | 'Caçamba' | 'Plataforma'
  | 'Sider' | 'Baú' | 'Baú Frigorífico' | 'Baú Refrigerado'
  | 'Silo' | 'Cegonheiro' | 'Gaiola' | 'Tanque' | 'Bug Porta Container'
  | 'Munk' | 'Apenas Cavalo' | 'Cavaqueira' | 'Hoper';

export type SimNao = 'Sim' | 'Não' | 'Ambos';

export interface PerfilCaminhao {
  marca: string;
  modelo: string;
  ano: string;
  dieselKmPorLt: number;
  arlaKmPorLt: number;
  depreciacaoPorKm: number;
  manutencaoPorKm: number;
  pneusPorKm: number;
  tipoCarroceria?: TipoCarroceria;
  tipoVeiculo?: TipoVeiculo;
  rastreador?: SimNao;
  agenciador?: SimNao;
  numeroEixos?: number;
  valorCaminhao?: number;
  kmPorAno?: number;
}

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
  distanciaEstimada?: boolean;
  numeroEixos?: number;
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
