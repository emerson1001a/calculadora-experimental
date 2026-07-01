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
import { formatCurrency, parseNumber } from '../utils/format';
import type { ResultadoFrete } from '../types';

type Etapa = 'pergunta' | 'voltaOrigem' | 'triangular' | 'resultado';
type Fluxo = 'origem' | 'triangular' | null;

interface CalcResult {
  lucroExtra: number;
  tipoCalculo: 'cheio' | 'delta';
  deltaKm?: number;
  custoDelta?: number;
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
    const valor = parseNumber(valorFrete);
    setCalc({ lucroExtra: valor, tipoCalculo: 'cheio' });
    setEtapa('resultado');
  }

  function calcularTriangular() {
    const valor = parseNumber(valorFrete);
    const distNova = parseNumber(distanciaStr);
    const distAbsorvida = entrada.distanciaKm;
    const c = entrada.custos;

    const custoPorKm =
      c.dieselPrecoPorLitro / c.dieselKmPorLt +
      c.arlaPrecoPorLitro / c.arlaKmPorLt +
      c.manutencaoPorKm +
      c.pneusPorKm +
      c.depreciacaoPorKm;

    if (distNova <= distAbsorvida) {
      setCalc({ lucroExtra: valor, tipoCalculo: 'cheio' });
    } else {
      const deltaKm = Math.round(distNova - distAbsorvida);
      const custoDelta = deltaKm * custoPorKm;
      setCalc({ lucroExtra: valor - custoDelta, tipoCalculo: 'delta', deltaKm, custoDelta });
    }
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
                    <Text style={styles.opcaoBtnTexto}>
                      Não, vou para outra cidade
                    </Text>
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
                    <Text style={styles.distHint}>
                      Distância automática da tabela de rodovias
                    </Text>
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

              {/* ETAPA 3: RESULTADO */}
              {etapa === 'resultado' && calc !== null && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Lucro extra com o frete de volta</Text>

                  <View style={[
                    styles.resultCard,
                    { borderColor: calc.lucroExtra >= 0 ? colors.success : colors.danger }
                  ]}>
                    <Text style={styles.resultLabel}>
                      {calc.lucroExtra >= 0 ? 'Lucro extra' : 'Prejuízo'}
                    </Text>
                    <Text style={[
                      styles.resultValor,
                      { color: calc.lucroExtra >= 0 ? colors.success : colors.danger }
                    ]}>
                      {formatCurrency(calc.lucroExtra)}
                    </Text>
                  </View>

                  {calc.tipoCalculo === 'cheio' && (
                    <View style={styles.explicacaoBox}>
                      <Text style={styles.explicacaoTexto}>
                        A volta já estava paga nos custos do frete de ida. Esse valor entra direto no bolso — é 100% lucro.
                      </Text>
                    </View>
                  )}

                  {calc.tipoCalculo === 'delta' && calc.deltaKm !== undefined && calc.custoDelta !== undefined && (
                    <View style={styles.explicacaoBox}>
                      <Text style={styles.explicacaoTexto}>
                        A volta já estava paga no frete de ida, mas você vai rodar{' '}
                        <Text style={{ color: colors.warning, fontWeight: '700' }}>
                          {calc.deltaKm} km a mais
                        </Text>{' '}
                        do que cobriu. Isso custou{' '}
                        <Text style={{ color: colors.danger, fontWeight: '700' }}>
                          {formatCurrency(calc.custoDelta)}
                        </Text>{' '}
                        extra (diesel, manutenção, pneus e depreciação).
                      </Text>
                    </View>
                  )}

                  {calc.lucroExtra < 0 && (
                    <View style={[styles.explicacaoBox, { borderColor: colors.danger }]}>
                      <Text style={[styles.explicacaoTexto, { color: colors.danger }]}>
                        O custo extra da rota seria maior que o valor do frete. Esse frete de volta não compensa.
                      </Text>
                    </View>
                  )}

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

  resultCard: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  resultLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  resultValor: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  explicacaoBox: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  explicacaoTexto: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
