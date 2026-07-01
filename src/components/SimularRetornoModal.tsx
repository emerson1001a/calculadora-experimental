import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { distancias, cidades } from '../data/distancias';
import { formatPercent, parseNumber } from '../utils/format';
import type { ResultadoFrete } from '../types';

type Etapa = 'pergunta' | 'voltaOrigem' | 'triangular' | 'resultado';
type Fluxo = 'origem' | 'triangular' | null;

interface CalcResult {
  freteVolta: number;
  custoVolta: number;
  lucroVolta: number;
  margemVolta: number;
  tipoCalculo: 'cheio' | 'delta';
  deltaKm?: number;
  freteTotal: number;
  custoTotal: number;
  lucroTotal: number;
  margemTotal: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  resultado: ResultadoFrete;
}

function normalizarCidade(input: string): string {
  return input.replace(/\s*[-–]\s*[A-Z]{2}$/, '').trim();
}

function buscarDistancia(cidadeA: string, cidadeB: string): number | null {
  return distancias[cidadeA]?.[cidadeB] ?? distancias[cidadeB]?.[cidadeA] ?? null;
}

// Moeda sem decimais para a tabela compacta
function fmtK(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function fmtPct(v: number): string {
  return v.toFixed(0) + '%';
}

interface LinhaProps {
  label: string;
  c1: string;
  c2: string;
  c3: string;
  isHeader?: boolean;
  destaqueCor?: string;
}

function LinhaTabela({ label, c1, c2, c3, isHeader, destaqueCor }: LinhaProps) {
  const labelStyle = isHeader ? styles.thLabel : styles.tdLabel;
  const celStyle = isHeader ? styles.thCel : styles.tdCel;
  const totalStyle = destaqueCor
    ? [styles.tdCelTotal, { color: destaqueCor }]
    : isHeader
    ? styles.thCel
    : styles.tdCel;
  return (
    <View style={[styles.tabelaLinha, isHeader && styles.tabelaLinhaHeader]}>
      <Text style={labelStyle} numberOfLines={1}>{label}</Text>
      <Text style={celStyle} numberOfLines={1}>{c1}</Text>
      <Text style={celStyle} numberOfLines={1}>{c2}</Text>
      <Text style={totalStyle as any} numberOfLines={1}>{c3}</Text>
    </View>
  );
}

export function SimularRetornoModal({ visible, onClose, resultado }: Props) {
  const { entrada } = resultado;
  const cidadeOrigem = normalizarCidade(entrada.origem);

  const [etapa, setEtapa] = useState<Etapa>('pergunta');
  const [fluxo, setFluxo] = useState<Fluxo>(null);
  const [valorFrete, setValorFrete] = useState('');
  const [busca, setBusca] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);
  const [distanciaStr, setDistanciaStr] = useState('');
  const [calc, setCalc] = useState<CalcResult | null>(null);

  const sugestoes = useMemo(() => {
    if (busca.length < 3 || cidadeSelecionada) return [];
    const q = busca.toLowerCase();
    return cidades.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [busca, cidadeSelecionada]);

  function selecionarCidade(cidade: string) {
    setCidadeSelecionada(cidade);
    setBusca(cidade);
    const dist = buscarDistancia(cidade, cidadeOrigem);
    setDistanciaStr(dist !== null ? String(dist) : '');
  }

  function irParaVoltaOrigem() {
    setFluxo('origem');
    setEtapa('voltaOrigem');
  }

  function irParaTriangular() {
    setFluxo('triangular');
    setEtapa('triangular');
  }

  function voltar() {
    if (etapa === 'voltaOrigem' || etapa === 'triangular') {
      setEtapa('pergunta');
    }
  }

  function calcularVoltaOrigem() {
    const freteVolta = parseNumber(valorFrete);
    const custoVolta = 0;
    const lucroVolta = freteVolta;
    const margemVolta = 100;

    const freteTotal = entrada.valorFrete + freteVolta;
    const custoTotalViagem = resultado.custoTotal + custoVolta;
    const lucroTotal = resultado.lucro + lucroVolta;
    const margemTotal = freteTotal > 0 ? (lucroTotal / freteTotal) * 100 : 0;

    setCalc({
      freteVolta,
      custoVolta,
      lucroVolta,
      margemVolta,
      tipoCalculo: 'cheio',
      freteTotal,
      custoTotal: custoTotalViagem,
      lucroTotal,
      margemTotal,
    });
    setEtapa('resultado');
  }

  function calcularTriangular() {
    const freteVolta = parseNumber(valorFrete);
    const distNova = parseNumber(distanciaStr);
    const distAbsorvida = entrada.distanciaKm;
    const c = entrada.custos;

    const custoPorKm =
      c.dieselPrecoPorLitro / c.dieselKmPorLt +
      c.arlaPrecoPorLitro / c.arlaKmPorLt +
      c.manutencaoPorKm +
      c.pneusPorKm +
      c.depreciacaoPorKm;

    let custoVolta = 0;
    let deltaKm: number | undefined;
    let tipoCalculo: 'cheio' | 'delta';

    if (distNova <= distAbsorvida) {
      tipoCalculo = 'cheio';
    } else {
      deltaKm = Math.round(distNova - distAbsorvida);
      custoVolta = deltaKm * custoPorKm;
      tipoCalculo = 'delta';
    }

    const lucroVolta = freteVolta - custoVolta;
    const margemVolta = freteVolta > 0 ? (lucroVolta / freteVolta) * 100 : 0;

    const freteTotal = entrada.valorFrete + freteVolta;
    const custoTotalViagem = resultado.custoTotal + custoVolta;
    const lucroTotal = resultado.lucro + lucroVolta;
    const margemTotal = freteTotal > 0 ? (lucroTotal / freteTotal) * 100 : 0;

    setCalc({
      freteVolta,
      custoVolta,
      lucroVolta,
      margemVolta,
      tipoCalculo,
      deltaKm,
      freteTotal,
      custoTotal: custoTotalViagem,
      lucroTotal,
      margemTotal,
    });
    setEtapa('resultado');
  }

  function fechar() {
    setEtapa('pergunta');
    setFluxo(null);
    setValorFrete('');
    setBusca('');
    setCidadeSelecionada(null);
    setDistanciaStr('');
    setCalc(null);
    onClose();
  }

  const podeProsseguirOrigem = valorFrete.length > 0 && parseNumber(valorFrete) > 0;
  const podeProsseguirTriangular = podeProsseguirOrigem && distanciaStr.length > 0;

  function fraseDContexto(c: CalcResult): string {
    const margemIda = resultado.margemReal;
    const ganho = c.margemTotal - margemIda;
    const custoAlto = c.tipoCalculo === 'delta' && c.custoVolta > c.freteVolta * 0.4;

    if (custoAlto) {
      return 'Esse frete de volta tem um trecho extra que reduz o ganho. Avalie bem.';
    }
    if (ganho > 5) {
      return `Pegando o frete de volta, sua margem sobe de ${formatPercent(margemIda)} para ${formatPercent(c.margemTotal)}. Vale muito a pena!`;
    }
    return 'O frete de volta ajuda, mas o ganho é pequeno. Você decide.';
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={fechar}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayDismiss} onPress={fechar} activeOpacity={1} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            {/* Cabeçalho */}
            <View style={styles.header}>
              {(etapa === 'voltaOrigem' || etapa === 'triangular') ? (
                <TouchableOpacity onPress={voltar} style={styles.headerBtn} activeOpacity={0.7}>
                  <Text style={styles.headerBtnTexto}>← Voltar</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerBtn} />
              )}
              <Text style={styles.headerTitulo}>Frete de volta</Text>
              <TouchableOpacity onPress={fechar} style={styles.headerBtn} activeOpacity={0.7}>
                <Text style={styles.headerBtnTexto}>Fechar ✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ETAPA 1: PERGUNTA */}
              {etapa === 'pergunta' && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Esse frete de volta te leva pra casa?</Text>
                  <View style={styles.cidadeChip}>
                    <Text style={styles.cidadeChipTexto}>{cidadeOrigem}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.opcaoBtn, styles.opcaoBtnPrimario]}
                    onPress={irParaVoltaOrigem}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.opcaoBtnTextoPrimario}>
                      Sim, esse frete me leva de volta pra {cidadeOrigem}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.opcaoBtn}
                    onPress={irParaTriangular}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.opcaoBtnTexto}>Não, vou para outra cidade</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ETAPA 2A: VOLTA PARA ORIGEM */}
              {etapa === 'voltaOrigem' && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Quanto vale esse frete?</Text>
                  <View style={styles.infoBanner}>
                    <Text style={styles.infoBannerTexto}>
                      Como a volta vazia já estava nos seus custos, esse dinheiro todo é lucro.
                    </Text>
                  </View>
                  <Text style={styles.fieldLabel}>Valor do frete de volta</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputPrefix}>R$</Text>
                    <TextInput
                      style={styles.inputValor}
                      value={valorFrete}
                      onChangeText={setValorFrete}
                      placeholder="0,00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      autoFocus
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.calcBtn, !podeProsseguirOrigem && styles.calcBtnDisabled]}
                    onPress={calcularVoltaOrigem}
                    disabled={!podeProsseguirOrigem}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.calcBtnTexto}>Ver quanto vou ganhar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ETAPA 2B: ROTA TRIANGULAR */}
              {etapa === 'triangular' && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Qual cidade esse frete vai te levar?</Text>

                  <Text style={styles.fieldLabel}>Cidade de destino do frete de volta</Text>
                  <TextInput
                    style={styles.inputBusca}
                    value={busca}
                    onChangeText={v => { setBusca(v); setCidadeSelecionada(null); setDistanciaStr(''); }}
                    placeholder="Digite 3 letras para buscar..."
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                  {sugestoes.length > 0 && (
                    <View style={styles.sugestoesBox}>
                      {sugestoes.map(cidade => (
                        <TouchableOpacity
                          key={cidade}
                          style={styles.sugestaoItem}
                          onPress={() => selecionarCidade(cidade)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.sugestaoTexto}>{cidade}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>
                    Distância de volta até {cidadeOrigem} (km)
                  </Text>
                  <TextInput
                    style={styles.inputBusca}
                    value={distanciaStr}
                    onChangeText={setDistanciaStr}
                    placeholder="km rodados até sua origem"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  {cidadeSelecionada && distanciaStr !== '' && (
                    <Text style={styles.distHint}>Distância automática da tabela de rodovias</Text>
                  )}
                  {cidadeSelecionada && distanciaStr === '' && (
                    <Text style={styles.distHintAviso}>
                      Rota não encontrada na tabela — informe a distância manualmente.
                    </Text>
                  )}

                  <Text style={styles.fieldLabel}>Valor do frete de volta</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputPrefix}>R$</Text>
                    <TextInput
                      style={styles.inputValor}
                      value={valorFrete}
                      onChangeText={setValorFrete}
                      placeholder="0,00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.calcBtn, !podeProsseguirTriangular && styles.calcBtnDisabled]}
                    onPress={calcularTriangular}
                    disabled={!podeProsseguirTriangular}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.calcBtnTexto}>Ver quanto vou ganhar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ETAPA 3: RESULTADO CONSOLIDADO */}
              {etapa === 'resultado' && calc !== null && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Viagem completa</Text>

                  <View style={styles.tabela}>
                    <LinhaTabela label="" c1="IDA" c2="VOLTA" c3="TOTAL" isHeader />
                    <LinhaTabela
                      label="Frete"
                      c1={fmtK(entrada.valorFrete)}
                      c2={fmtK(calc.freteVolta)}
                      c3={fmtK(calc.freteTotal)}
                    />
                    <LinhaTabela
                      label="Custo"
                      c1={fmtK(resultado.custoTotal)}
                      c2={fmtK(calc.custoVolta)}
                      c3={fmtK(calc.custoTotal)}
                    />
                    <LinhaTabela
                      label="Lucro"
                      c1={fmtK(resultado.lucro)}
                      c2={fmtK(calc.lucroVolta)}
                      c3={fmtK(calc.lucroTotal)}
                      destaqueCor={calc.lucroTotal >= 0 ? colors.success : colors.danger}
                    />
                    <LinhaTabela
                      label="Margem"
                      c1={fmtPct(resultado.margemReal)}
                      c2={fmtPct(calc.margemVolta)}
                      c3={fmtPct(calc.margemTotal)}
                      destaqueCor={calc.lucroTotal >= 0 ? colors.primary : colors.danger}
                    />
                  </View>

                  <View style={styles.fraseBox}>
                    <Text style={styles.fraseTexto}>{fraseDContexto(calc)}</Text>
                  </View>

                  <TouchableOpacity style={styles.calcBtn} onPress={fechar} activeOpacity={0.85}>
                    <Text style={styles.calcBtnTexto}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  overlayDismiss: {
    flex: 1,
  },
  kav: {
    flexShrink: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 680,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    minWidth: 70,
  },
  headerBtnTexto: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitulo: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },

  etapa: {
    gap: 14,
  },
  titulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  cidadeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  cidadeChipTexto: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  opcaoBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  opcaoBtnPrimario: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  opcaoBtnTexto: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  opcaoBtnTextoPrimario: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  infoBanner: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  infoBannerTexto: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 18,
  },

  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 50,
    gap: 6,
  },
  inputPrefix: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputValor: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  inputBusca: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    color: colors.text,
    fontSize: 15,
  },
  sugestoesBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: -8,
  },
  sugestaoItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sugestaoTexto: {
    color: colors.text,
    fontSize: 14,
  },
  distHint: {
    color: colors.success,
    fontSize: 12,
    marginTop: -6,
  },
  distHintAviso: {
    color: colors.warning,
    fontSize: 12,
    marginTop: -6,
  },

  calcBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  calcBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  calcBtnTexto: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Tabela comparativa
  tabela: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabelaLinhaHeader: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
  },
  thLabel: {
    width: 58,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  thCel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tdLabel: {
    width: 58,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tdCel: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  tdCelTotal: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Frase de contexto
  fraseBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fraseTexto: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});
