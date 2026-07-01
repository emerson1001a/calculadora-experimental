import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { CustoDetalhado } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';
import { colors } from '../theme/colors';

interface Props {
  custoDetalhado: CustoDetalhado;
  lucro: number;
  valorFrete: number;
}

const ITENS = [
  { chave: 'diesel',       label: 'Diesel',       cor: '#F59B3A' },
  { chave: 'pedagio',      label: 'Pedágio',      cor: '#4FC3F7' },
  { chave: 'alimentacao',  label: 'Alimentação',  cor: '#81C784' },
  { chave: 'pernoite',     label: 'Pernoite',     cor: '#CE93D8' },
  { chave: 'manutencao',   label: 'Manutenção',   cor: '#FFD54F' },
  { chave: 'pneus',        label: 'Pneus',        cor: '#EF9A9A' },
  { chave: 'depreciacao',  label: 'Depreciação',  cor: '#90A4AE' },
];

function polarParaCartesiano(cx: number, cy: number, r: number, grau: number) {
  const rad = ((grau - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function caminhoArco(cx: number, cy: number, r: number, inicio: number, fim: number): string {
  // Fatia de círculo completo (borda a borda via dois arcos)
  if (fim - inicio >= 359.9) {
    const t = polarParaCartesiano(cx, cy, r, 0);
    const b = polarParaCartesiano(cx, cy, r, 180);
    return `M ${t.x} ${t.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y} A ${r} ${r} 0 1 1 ${t.x} ${t.y} Z`;
  }
  const s = polarParaCartesiano(cx, cy, r, inicio);
  const e = polarParaCartesiano(cx, cy, r, fim);
  const grande = fim - inicio > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${grande} 1 ${e.x} ${e.y} Z`;
}

export function GraficoPizza({ custoDetalhado, lucro, valorFrete }: Props) {
  const base = valorFrete > 0 ? valorFrete : Object.values(custoDetalhado).reduce((a, b) => a + b, 0);
  if (base <= 0) return null;

  const fatias = [
    ...ITENS.map(item => ({
      label: item.label,
      valor: custoDetalhado[item.chave as keyof CustoDetalhado],
      cor: item.cor,
    })),
    ...(lucro > 0 ? [{ label: 'Lucro', valor: lucro, cor: '#4CAF50' }] : []),
  ].filter(f => f.valor > 0.01);

  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE / 2 - 6;

  let anguloAtual = 0;
  const slices = fatias.map(f => {
    const pct = f.valor / base;
    const sweep = pct * 360;
    const inicio = anguloAtual;
    const fim = anguloAtual + sweep;
    anguloAtual = fim;
    return { ...f, pct, inicio, fim };
  });

  return (
    <View>
      <View style={styles.grafico}>
        <Svg width={SIZE} height={SIZE}>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={caminhoArco(cx, cy, r, s.inicio, s.fim)}
              fill={s.cor}
              stroke={colors.surface}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.legenda}>
        {slices.map((s, i) => (
          <View key={i} style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: s.cor }]} />
            <Text style={styles.legendaLabel} numberOfLines={1}>{s.label}</Text>
            <Text style={styles.legendaPct}>{formatPercent(s.pct * 100)}</Text>
            <Text style={styles.legendaReais}>{formatCurrency(s.valor)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grafico: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legenda: {
    gap: 6,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
  },
  legendaLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  legendaPct: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },
  legendaReais: {
    color: colors.textMuted,
    fontSize: 12,
    width: 84,
    textAlign: 'right',
  },
});
