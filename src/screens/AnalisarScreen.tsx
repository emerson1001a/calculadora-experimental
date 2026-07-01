import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../components/InputField';
import { CustoRow } from '../components/CustoRow';
import { calcularFrete } from '../engine/calcularFrete';
import { colors } from '../theme/colors';
import { parseNumber } from '../utils/format';
import type { EntradaFrete, ResultadoFrete, TipoRetorno } from '../types';

interface Props {
  onCalcular: (resultado: ResultadoFrete) => void;
  initialValues?: EntradaFrete | null;
}

const CUSTOS_PADRAO = {
  dieselKmPorLt: '3.5',
  dieselPrecoPorLitro: '6.50',
  arlaKmPorLt: '70',
  arlaPrecoPorLitro: '4.50',
  pedagio: '150',
  pedagioVolta: '150',
  alimentacao: '60',
  pernoite: '80',
  manutencaoPorKm: '0.15',
  pneusPorKm: '0.10',
  depreciacaoPorKm: '0.20',
};

export function AnalisarScreen({ onCalcular, initialValues: iv }: Props) {
  const [origem, setOrigem] = useState(iv?.origem ?? '');
  const [destino, setDestino] = useState(iv?.destino ?? '');
  const [distancia, setDistancia] = useState(iv ? String(iv.distanciaKm) : '');
  const [valorFrete, setValorFrete] = useState('');
  const [tipoRetorno, setTipoRetorno] = useState<TipoRetorno>(iv?.tipoRetorno ?? 'nenhum');
  const [margem, setMargem] = useState(iv ? String(iv.margemDesejada) : '15');
  const [custosAberto, setCustosAberto] = useState(!!iv);
  const [custos, setCustos] = useState(iv ? {
    dieselKmPorLt: String(iv.custos.dieselKmPorLt),
    dieselPrecoPorLitro: String(iv.custos.dieselPrecoPorLitro),
    arlaKmPorLt: String(iv.custos.arlaKmPorLt),
    arlaPrecoPorLitro: String(iv.custos.arlaPrecoPorLitro),
    pedagio: String(iv.custos.pedagio),
    pedagioVolta: String(iv.custos.pedagio),
    alimentacao: String(iv.custos.alimentacao),
    pernoite: String(iv.custos.pernoite),
    manutencaoPorKm: String(iv.custos.manutencaoPorKm),
    pneusPorKm: String(iv.custos.pneusPorKm),
    depreciacaoPorKm: String(iv.custos.depreciacaoPorKm),
  } : CUSTOS_PADRAO);

  function setCusto(campo: keyof typeof CUSTOS_PADRAO, valor: string) {
    setCustos(prev => ({ ...prev, [campo]: valor }));
  }

  function handleCalcular() {
    const dist = parseNumber(distancia);
    const valor = parseNumber(valorFrete);

    if (dist <= 0) {
      Alert.alert('Campo obrigatório', 'Informe a distância em km.');
      return;
    }
    if (valor <= 0) {
      Alert.alert('Campo obrigatório', 'Informe o valor do frete.');
      return;
    }

    const resultado = calcularFrete({
      origem: origem.trim() || 'Origem',
      destino: destino.trim() || 'Destino',
      distanciaKm: dist,
      valorFrete: valor,
      tipoRetorno,
      margemDesejada: parseNumber(margem),
      custos: {
        dieselKmPorLt: parseNumber(custos.dieselKmPorLt),
        dieselPrecoPorLitro: parseNumber(custos.dieselPrecoPorLitro),
        arlaKmPorLt: parseNumber(custos.arlaKmPorLt),
        arlaPrecoPorLitro: parseNumber(custos.arlaPrecoPorLitro),
        pedagio: parseNumber(custos.pedagio),
        pedagioVolta: parseNumber(custos.pedagioVolta),
        alimentacao: parseNumber(custos.alimentacao),
        pernoite: parseNumber(custos.pernoite),
        manutencaoPorKm: parseNumber(custos.manutencaoPorKm),
        pneusPorKm: parseNumber(custos.pneusPorKm),
        depreciacaoPorKm: parseNumber(custos.depreciacaoPorKm),
      },
    });

    onCalcular(resultado);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Rode com Lucro</Text>
          <Text style={styles.appSubtitle}>Calculadora de Frete</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {iv && (
            <View style={styles.simulacaoBanner}>
              <Text style={styles.simulacaoTexto}>
                Dados da ida mantidos. Informe o valor do frete de volta e confira o pedágio da volta.
              </Text>
            </View>
          )}
          {/* ROTA */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rota</Text>
            <InputField
              label="Origem"
              value={origem}
              onChangeText={setOrigem}
              placeholder="Ex: São Paulo - SP"
            />
            <InputField
              label="Destino"
              value={destino}
              onChangeText={setDestino}
              placeholder="Ex: Curitiba - PR"
            />
            <InputField
              label="Distância (km)"
              value={distancia}
              onChangeText={setDistancia}
              placeholder="0"
              keyboardType="numeric"
              suffix="km"
            />
          </View>

          {/* FRETE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Frete</Text>
            <InputField
              label="Valor do Frete"
              value={valorFrete}
              onChangeText={setValorFrete}
              placeholder="0,00"
              keyboardType="decimal-pad"
              prefix="R$"
            />
            <InputField
              label="Margem Desejada"
              value={margem}
              onChangeText={setMargem}
              placeholder="15"
              keyboardType="decimal-pad"
              suffix="%"
            />
            <View style={styles.retornoRow}>
              <Text style={styles.retornoLabel}>Tipo de viagem</Text>
              <View style={styles.retornoSegment}>
                {(['nenhum', 'vazio', 'comCarga'] as TipoRetorno[]).map((opcao) => {
                  const labels: Record<TipoRetorno, string> = {
                    nenhum: 'Só ida',
                    vazio: 'Volta vazia',
                    comCarga: 'Com retorno',
                  };
                  const ativo = tipoRetorno === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[styles.retornoOpcao, ativo && styles.retornoOpcaoAtiva]}
                      onPress={() => setTipoRetorno(opcao)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.retornoOpcaoTexto, ativo && styles.retornoOpcaoTextoAtivo]}>
                        {labels[opcao]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* CUSTOS */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardTitleRow}
              onPress={() => setCustosAberto(!custosAberto)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>Custos Operacionais</Text>
              <Text style={styles.expandIcon}>{custosAberto ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <Text style={styles.custosHint}>
              Valores padrão para carreta 5 eixos. Toque para editar.
            </Text>

            {custosAberto && (
              <View style={styles.custosGrid}>
                <Text style={styles.custosSectionLabel}>Diesel</Text>
                <CustoRow
                  label="Consumo do diesel"
                  value={custos.dieselKmPorLt}
                  onChangeText={v => setCusto('dieselKmPorLt', v)}
                  unit="Km/L"
                />
                <CustoRow
                  label="Preço do diesel"
                  value={custos.dieselPrecoPorLitro}
                  onChangeText={v => setCusto('dieselPrecoPorLitro', v)}
                  unit="R$/L"
                />
                <Text style={styles.custosSectionLabel}>Arla 32</Text>
                <CustoRow
                  label="Consumo do Arla 32"
                  value={custos.arlaKmPorLt}
                  onChangeText={v => setCusto('arlaKmPorLt', v)}
                  unit="Km/L"
                />
                <CustoRow
                  label="Preço do Arla 32"
                  value={custos.arlaPrecoPorLitro}
                  onChangeText={v => setCusto('arlaPrecoPorLitro', v)}
                  unit="R$/L"
                />
                <Text style={styles.custosSectionLabel}>Viagem</Text>
                <CustoRow
                  label="Pedágio (ida)"
                  value={custos.pedagio}
                  onChangeText={v => setCusto('pedagio', v)}
                  unit="R$"
                />
                {tipoRetorno === 'comCarga' && (
                  <CustoRow
                    label="Pedágio (volta)"
                    value={custos.pedagioVolta}
                    onChangeText={v => setCusto('pedagioVolta', v)}
                    unit="R$"
                  />
                )}
                <CustoRow
                  label="Alimentação"
                  value={custos.alimentacao}
                  onChangeText={v => setCusto('alimentacao', v)}
                  unit="R$"
                />
                <CustoRow
                  label="Pernoite"
                  value={custos.pernoite}
                  onChangeText={v => setCusto('pernoite', v)}
                  unit="R$"
                />
                <Text style={styles.custosSectionLabel}>Por Quilômetro</Text>
                <CustoRow
                  label="Manutenção"
                  value={custos.manutencaoPorKm}
                  onChangeText={v => setCusto('manutencaoPorKm', v)}
                  unit="R$/km"
                />
                <CustoRow
                  label="Pneus"
                  value={custos.pneusPorKm}
                  onChangeText={v => setCusto('pneusPorKm', v)}
                  unit="R$/km"
                />
                <CustoRow
                  label="Depreciação"
                  value={custos.depreciacaoPorKm}
                  onChangeText={v => setCusto('depreciacaoPorKm', v)}
                  unit="R$/km"
                />
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.btnCalcular} onPress={handleCalcular} activeOpacity={0.85}>
            <Text style={styles.btnCalcularText}>CALCULAR FRETE</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandIcon: {
    color: colors.primary,
    fontSize: 12,
  },
  simulacaoBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  simulacaoTexto: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  custosHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
  },
  custosGrid: {
    marginTop: 4,
  },
  custosSectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  retornoRow: {
    marginTop: 8,
  },
  retornoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  retornoSegment: {
    flexDirection: 'row',
    gap: 6,
  },
  retornoOpcao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  retornoOpcaoAtiva: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  retornoOpcaoTexto: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  retornoOpcaoTextoAtivo: {
    color: colors.white,
  },
  btnCalcular: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnCalcularText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
