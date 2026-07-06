import React, { useState } from 'react';
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
import { formatCurrency, parseNumber } from '../utils/format';
import type { ResultadoFrete } from '../types';
import { calcularPisoANTT } from '../engine/pisoANTT';

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

interface Props {
  visible: boolean;
  onClose: () => void;
  resultado: ResultadoFrete;
}

interface CalcResult {
  freteRetorno: number;
  freteTotal: number;
  lucroTotal: number;
  margemTotal: number;
}

export function SimularRetornoModal({ visible, onClose, resultado }: Props) {
  const { entrada } = resultado;
  const [valorFrete, setValorFrete] = useState('');
  const [calc, setCalc] = useState<CalcResult | null>(null);

  function calcular() {
    const freteRetorno = parseNumber(valorFrete);
    const freteTotal = entrada.valorFrete + freteRetorno;
    // custo do retorno = 0 — já absorvido no frete de ida com volta vazia
    const lucroTotal = resultado.lucro + freteRetorno;
    const margemTotal = freteTotal > 0 ? (lucroTotal / freteTotal) * 100 : 0;
    setCalc({ freteRetorno, freteTotal, lucroTotal, margemTotal });
  }

  function fechar() {
    setValorFrete('');
    setCalc(null);
    onClose();
  }

  const podeProsseguir = parseNumber(valorFrete) > 0;
  const distTotal = entrada.distanciaKm * 2;
  const pisoRetorno = calcularPisoANTT(entrada.distanciaKm, entrada.numeroEixos);
  const pisoTotal = pisoRetorno * 2;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={fechar}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayDismiss} onPress={fechar} activeOpacity={1} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              {calc !== null ? (
                <TouchableOpacity onPress={() => setCalc(null)} style={styles.headerBtn} activeOpacity={0.7}>
                  <Text style={styles.headerBtnTexto}>← Voltar</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerBtn} />
              )}
              <Text style={styles.headerTitulo}>Frete de retorno</Text>
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
              {/* TELA 1: INPUT */}
              {calc === null && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Quanto vale o frete de retorno?</Text>

                  <Text style={styles.fieldLabel}>Valor do frete de retorno (R$)</Text>
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
                    style={[styles.calcBtn, !podeProsseguir && styles.calcBtnDisabled]}
                    onPress={calcular}
                    disabled={!podeProsseguir}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.calcBtnTexto}>Calcular</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* TELA 2: RESULTADO */}
              {calc !== null && (
                <View style={styles.etapa}>
                  <Text style={styles.titulo}>Viagem completa</Text>

                  <View style={styles.tabela}>
                    <LinhaTabela label="" c1="IDA" c2="RETORNO" c3="TOTAL" isHeader />
                    <LinhaTabela
                      label="Frete"
                      c1={fmtK(entrada.valorFrete)}
                      c2={fmtK(calc.freteRetorno)}
                      c3={fmtK(calc.freteTotal)}
                    />
                    <LinhaTabela
                      label="Custo"
                      c1={fmtK(resultado.custoTotal)}
                      c2={fmtK(0)}
                      c3={fmtK(resultado.custoTotal)}
                    />
                    <LinhaTabela
                      label="Lucro"
                      c1={fmtK(resultado.lucro)}
                      c2={fmtK(calc.freteRetorno)}
                      c3={fmtK(calc.lucroTotal)}
                      destaqueCor={calc.lucroTotal >= 0 ? colors.success : colors.danger}
                    />
                    <LinhaTabela
                      label="Margem"
                      c1={fmtPct(resultado.margemReal)}
                      c2="100%"
                      c3={fmtPct(calc.margemTotal)}
                      destaqueCor={calc.lucroTotal >= 0 ? colors.primary : colors.danger}
                    />
                  </View>

                  <View style={styles.observacaoBox}>
                    <Text style={styles.observacaoTexto}>
                      💡 Os custos do retorno estão zerados porque você já os incluiu no cálculo do frete de ida com volta vazia. Qualquer valor que você receber nesse frete de retorno é lucro direto no bolso.
                    </Text>
                  </View>

                  {/* Piso ANTT do trecho de retorno */}
                  <View style={styles.pisoRetornoCard}>
                    <View style={styles.pisoRetornoLucroRow}>
                      <Text style={styles.pisoRetornoLucroLabel}>💰 Lucro extra</Text>
                      <Text style={styles.pisoRetornoLucroValor}>{formatCurrency(calc.freteRetorno)}</Text>
                    </View>
                    <Text style={styles.pisoRetornoDesc}>
                      Você já pagou essa volta no frete de ida. Esse valor é lucro direto no bolso.
                    </Text>

                    <View style={styles.pisoRetornoSeparador} />

                    <Text style={styles.pisoRetornoAnttLabel}>⚖️ Piso mínimo ANTT para esse trecho</Text>
                    <Text style={styles.pisoRetornoAnttValor}>{formatCurrency(pisoRetorno)}</Text>
                    <Text style={styles.pisoRetornoDesc}>
                      O embarcador é obrigado por lei a pagar pelo menos esse valor. Você tem direito a negociar acima do piso.
                    </Text>

                    {calc.freteRetorno < pisoRetorno ? (
                      <View style={styles.pisoAlertaDanger}>
                        <Text style={styles.pisoAlertaDangerTexto}>
                          ⚠️ O valor informado está abaixo do piso mínimo legal ({formatCurrency(pisoRetorno)}). Você pode exigir pelo menos esse valor.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.pisoAlertaSuccess}>
                        <Text style={styles.pisoAlertaSuccessTexto}>
                          ✅ Valor acima do piso mínimo legal.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.pisoDisclaimer}>
                      Ref: Portaria SUROC Nº 4/2026 — O piso é referência regulatória, não aconselhamento jurídico.
                    </Text>
                  </View>

                  {/* Veredicto: margem vs desejada */}
                  {(() => {
                    const ok = calc.margemTotal >= entrada.margemDesejada;
                    const neutro = calc.margemTotal > 0 && !ok;
                    const s = ok ? styles.veredictoSucesso : neutro ? styles.veredictoWarning : styles.veredictoDanger;
                    const icone = ok ? '✓' : neutro ? '~' : '✗';
                    const msg = ok
                      ? `Margem total ${fmtPct(calc.margemTotal)} — acima da sua meta de ${fmtPct(entrada.margemDesejada)}`
                      : neutro
                      ? `Margem total ${fmtPct(calc.margemTotal)} — abaixo da meta de ${fmtPct(entrada.margemDesejada)}`
                      : `Margem negativa (${fmtPct(calc.margemTotal)}) — viagem dá prejuízo`;
                    return (
                      <View style={[styles.veredictoItem, s]}>
                        <Text style={[styles.veredictoIcone, s]}>{icone}</Text>
                        <Text style={[styles.veredictoTexto, s]}>{msg}</Text>
                      </View>
                    );
                  })()}

                  {/* Veredicto: piso ANTT viagem completa */}
                  {(() => {
                    const acima = calc.freteTotal >= pisoTotal;
                    const s = acima ? styles.veredictoSucesso : styles.veredictoWarning;
                    const icone = acima ? '✓' : '⚠';
                    const msg = acima
                      ? `Frete total acima do piso ANTT (${formatCurrency(pisoTotal)} p/ ${distTotal} km)`
                      : `Frete total ${formatCurrency(calc.freteTotal)} abaixo do piso ANTT de ${formatCurrency(pisoTotal)}`;
                    return (
                      <View style={[styles.veredictoItem, s]}>
                        <Text style={[styles.veredictoIcone, s]}>{icone}</Text>
                        <Text style={[styles.veredictoTexto, s]}>{msg}</Text>
                      </View>
                    );
                  })()}

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
  observacaoBox: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success,
  },
  observacaoTexto: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 20,
  },
  veredictoItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
  },
  veredictoSucesso: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    color: colors.success,
  },
  veredictoWarning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
    color: colors.warning,
  },
  veredictoDanger: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    color: colors.danger,
  },
  veredictoIcone: {
    fontSize: 16,
    fontWeight: '900' as const,
    width: 18,
    textAlign: 'center' as const,
  },
  veredictoTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },

  // Bloco piso ANTT retorno
  pisoRetornoCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  pisoRetornoLucroRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  pisoRetornoLucroLabel: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  pisoRetornoLucroValor: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '800' as const,
  },
  pisoRetornoDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  pisoRetornoSeparador: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  pisoRetornoAnttLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  pisoRetornoAnttValor: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800' as const,
  },
  pisoAlertaDanger: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 10,
  },
  pisoAlertaDangerTexto: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600' as const,
  },
  pisoAlertaSuccess: {
    backgroundColor: colors.successBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 10,
  },
  pisoAlertaSuccessTexto: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  pisoDisclaimer: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic' as const,
    marginTop: 2,
  },
});
