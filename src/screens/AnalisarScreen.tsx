import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
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
import type { ResultadoFrete } from '../types';

interface Props {
  onCalcular: (resultado: ResultadoFrete) => void;
}

const CUSTOS_PADRAO = {
  dieselKmPorLt: '3.5',
  dieselPrecoPorLitro: '6.50',
  arlaKmPorLt: '70',
  arlaPrecoPorLitro: '4.50',
  pedagio: '150',
  alimentacao: '60',
  pernoite: '80',
  manutencaoPorKm: '0.15',
  pneusPorKm: '0.10',
  depreciacaoPorKm: '0.20',
};

export function AnalisarScreen({ onCalcular }: Props) {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [distancia, setDistancia] = useState('');
  const [valorFrete, setValorFrete] = useState('');
  const [voltaVazia, setVoltaVazia] = useState(false);
  const [margem, setMargem] = useState('15');
  const [custosAberto, setCustosAberto] = useState(false);
  const [custos, setCustos] = useState(CUSTOS_PADRAO);

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
      voltaVazia,
      margemDesejada: parseNumber(margem),
      custos: {
        dieselKmPorLt: parseNumber(custos.dieselKmPorLt),
        dieselPrecoPorLitro: parseNumber(custos.dieselPrecoPorLitro),
        arlaKmPorLt: parseNumber(custos.arlaKmPorLt),
        arlaPrecoPorLitro: parseNumber(custos.arlaPrecoPorLitro),
        pedagio: parseNumber(custos.pedagio),
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
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Volta Vazia</Text>
                <Text style={styles.switchHint}>Retorno sem carga</Text>
              </View>
              <Switch
                value={voltaVazia}
                onValueChange={setVoltaVazia}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={voltaVazia ? colors.primary : colors.textSecondary}
              />
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  switchHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
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
