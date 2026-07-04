import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';

type Zona = 'VERDE' | 'AMARELA' | 'VERMELHA';

interface Props {
  custoTotal: number;
  valorFrete: number;
  margemInicial: number;
  pisoANTT: number;
  margemDesejada: number;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
}

function getZona(valorFrete: number, sliderMargem: number, pisoANTT: number, margemDesejada: number): Zona {
  if (valorFrete < pisoANTT) return 'VERMELHA';
  if (sliderMargem < margemDesejada) return 'AMARELA';
  return 'VERDE';
}

const COR_ZONA: Record<Zona, string> = {
  VERDE: colors.success,
  AMARELA: colors.warning,
  VERMELHA: colors.danger,
};

const BG_ZONA: Record<Zona, string> = {
  VERDE: colors.successBg,
  AMARELA: colors.warningBg,
  VERMELHA: colors.dangerBg,
};

export function SliderMargem({ custoTotal, valorFrete, margemInicial, pisoANTT, margemDesejada, onSlidingStart, onSlidingComplete }: Props) {
  const [margem, setMargem] = useState(Math.min(100, Math.max(0, Math.round(margemDesejada))));

  const freteNecessario = margem <= 0 ? custoTotal : (margem < 100 ? custoTotal / (1 - margem / 100) : Infinity);
  const lucroAbsoluto = margem <= 0 ? 0 : freteNecessario - custoTotal;
  const diferenca = freteNecessario - valorFrete;
  const diferencaPositiva = diferenca > 0.005;
  const diferencaNegativa = diferenca < -0.005;

  const zona = getZona(valorFrete, margem, pisoANTT, margemDesejada);
  const cor = COR_ZONA[zona];
  const bg = BG_ZONA[zona];

  const mensagemZona =
    zona === 'VERDE' ? '✓ Dentro da sua margem e acima do mínimo legal'
    : zona === 'AMARELA' ? '⚠ Abaixo da sua margem desejada, mas ainda legal'
    : `🚨 Abaixo do mínimo legal da ANTT (${formatCurrency(pisoANTT)})`;

  function handleChange(v: number) {
    setMargem(Math.round(v));
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Explorador de Margem</Text>
        <View style={[styles.margemBadge, { backgroundColor: bg, borderColor: cor }]}>
          <Text style={[styles.margemValor, { color: cor }]}>{margem}%</Text>
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={margem}
          onChange={(e: any) => handleChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: 40,
            cursor: 'pointer',
            accentColor: cor,
            marginTop: 4,
            marginBottom: 0,
            display: 'block',
          } as any}
        />
      ) : (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={margem}
          onValueChange={handleChange}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor={cor}
          maximumTrackTintColor={colors.border}
          thumbTintColor={cor}
        />
      )}

      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelTexto}>0%</Text>
        <Text style={styles.sliderLabelTexto}>100%</Text>
      </View>

      <View style={[styles.zonaRow, { backgroundColor: bg, borderColor: cor }]}>
        <Text style={[styles.zonaTexto, { color: cor }]}>{mensagemZona}</Text>
      </View>

      <View style={styles.resultados}>
        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Frete mínimo para {margem}%</Text>
          <Text style={[styles.resultadoValor, { color: cor }]}>
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
            { color: diferencaPositiva ? colors.danger : diferencaNegativa ? colors.success : colors.textSecondary },
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  margemBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  margemValor: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 4,
  },
  sliderLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sliderLabelTexto: {
    color: colors.textMuted,
    fontSize: 11,
  },
  zonaRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  zonaTexto: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  resultados: {
    gap: 8,
  },
  resultadoRow: {
    flexDirection: 'row' as const,
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
    fontWeight: '700' as const,
  },
});
