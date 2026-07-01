import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';

interface Props {
  custoTotal: number;
  valorFrete: number;
  margemInicial: number;
}

export function SliderMargem({ custoTotal, valorFrete, margemInicial }: Props) {
  const [margem, setMargem] = useState(Math.min(50, Math.max(0, Math.round(margemInicial))));

  // Frete mínimo para atingir a margem desejada: custo / (1 - m)
  const freteNecessario = margem < 100 ? custoTotal / (1 - margem / 100) : Infinity;
  const lucroAbsoluto = freteNecessario - custoTotal;
  const diferenca = freteNecessario - valorFrete;

  const diferencaPositiva = diferenca > 0.005;
  const diferencaNegativa = diferenca < -0.005;

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Explorador de Margem</Text>
        <View style={styles.margemBadge}>
          <Text style={styles.margemValor}>{margem}%</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={50}
        step={1}
        value={margem}
        onValueChange={v => setMargem(Math.round(v))}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelTexto}>0%</Text>
        <Text style={styles.sliderLabelTexto}>50%</Text>
      </View>

      <View style={styles.resultados}>
        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Frete mínimo para {margem}%</Text>
          <Text style={[styles.resultadoValor, { color: colors.primary }]}>
            {formatCurrency(freteNecessario)}
          </Text>
        </View>

        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Margem em R$</Text>
          <Text style={[styles.resultadoValor, { color: colors.success }]}>
            {formatCurrency(lucroAbsoluto)}
          </Text>
        </View>

        <View style={[styles.resultadoRow, styles.diferencaRow]}>
          <Text style={styles.resultadoLabel}>
            {diferencaPositiva
              ? 'Frete atual está abaixo por'
              : diferencaNegativa
              ? 'Frete atual já tem folga de'
              : 'Frete exato para essa margem'}
          </Text>
          <Text style={[
            styles.resultadoValor,
            { color: diferencaPositiva ? colors.danger : diferencaNegativa ? colors.success : colors.textSecondary }
          ]}>
            {Math.abs(diferenca) < 0.005 ? '—' : formatCurrency(Math.abs(diferenca))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  margemBadge: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  margemValor: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sliderLabelTexto: {
    color: colors.textMuted,
    fontSize: 11,
  },
  resultados: {
    gap: 8,
  },
  resultadoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diferencaRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultadoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
    paddingRight: 8,
  },
  resultadoValor: {
    fontSize: 15,
    fontWeight: '700',
  },
});
