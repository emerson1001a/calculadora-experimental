import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { formatCurrency, formatPercent } from '../utils/format';
import type { ResultadoFrete, CustoDetalhado } from '../types';
import { SliderMargem } from '../components/SliderMargem';
import { GraficoPizza } from '../components/GraficoPizza';
import { SimularRetornoModal } from '../components/SimularRetornoModal';

function obterConselhos(resultado: ResultadoFrete): string[] {
  const { lucro, margemReal, custoDetalhado, entrada } = resultado;
  if (margemReal >= entrada.margemDesejada) return [];

  const d = custoDetalhado as CustoDetalhado;
  const estadia = d.pernoite + d.alimentacao;

  const custosRevisaveis = [
    {
      valor: d.diesel,
      msg: `O diesel está pesando ${formatCurrency(d.diesel)} nessa viagem. O preço que você usou está atualizado?`,
    },
    {
      valor: d.pedagio,
      msg: `O pedágio representa ${formatCurrency(d.pedagio)}. Existe rota alternativa?`,
    },
    {
      valor: estadia,
      msg: `Estadia e alimentação somam ${formatCurrency(estadia)}. Vale negociar o prazo de carregamento.`,
    },
    {
      valor: d.manutencao,
      msg: `Manutenção está pesando ${formatCurrency(d.manutencao)} na viagem. Última revisão em dia?`,
    },
  ]
    .filter(c => c.valor > 50)
    .sort((a, b) => b.valor - a.valor);

  const conselhos: string[] = [];

  if (lucro <= 0) {
    // Prioridade 1: margem negativa — os 2 maiores custos
    if (custosRevisaveis[0]) conselhos.push(custosRevisaveis[0].msg);
    if (custosRevisaveis[1]) conselhos.push(custosRevisaveis[1].msg);
  } else {
    // Prioridade 2: margem baixa mas positiva
    if (entrada.tipoRetorno === 'nenhum') {
      conselhos.push('💡 Veja se tem frete de retorno — qualquer valor que você receber é lucro extra.');
    }
    if (conselhos.length < 2 && custosRevisaveis[0]) {
      conselhos.push(custosRevisaveis[0].msg);
    }
  }

  return conselhos.slice(0, 2);
}

interface Props {
  resultado: ResultadoFrete;
  onVoltar: () => void;
}

const VEREDICTO_CONFIG = {
  BOM: {
    label: 'BOM',
    emoji: '✓',
    color: colors.success,
    bg: colors.successBg,
    descricao: 'Frete lucrativo acima da margem desejada',
  },
  ACEITÁVEL: {
    label: 'ACEITÁVEL',
    emoji: '~',
    color: colors.warning,
    bg: colors.warningBg,
    descricao: 'Há lucro, mas abaixo da margem desejada',
  },
  RUIM: {
    label: 'RUIM',
    emoji: '✗',
    color: colors.danger,
    bg: colors.dangerBg,
    descricao: 'Prejuízo ou abaixo do piso mínimo ANTT',
  },
};

interface LinhaDetalheProps {
  label: string;
  valor: number;
  destaque?: boolean;
}

function LinhaDetalhe({ label, valor, destaque }: LinhaDetalheProps) {
  return (
    <View style={[styles.detalheRow, destaque && styles.detalheRowDestaque]}>
      <Text style={[styles.detalheLabel, destaque && styles.detalheLabelDestaque]}>
        {label}
      </Text>
      <Text style={[styles.detalheValor, destaque && styles.detalheValorDestaque]}>
        {formatCurrency(valor)}
      </Text>
    </View>
  );
}

export function ResultadoScreen({ resultado, onVoltar }: Props) {
  const { entrada, custoTotal, custoDetalhado, lucro, margemReal, pisoANTT, abaixoPisoANTT, veredicto } = resultado;
  const cfg = VEREDICTO_CONFIG[veredicto];
  const temRetorno = entrada.tipoRetorno !== 'nenhum';
  const distTotal = entrada.distanciaKm * (temRetorno ? 2 : 1);
  const [modalAberto, setModalAberto] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const conselhos = obterConselhos(resultado);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar} style={styles.voltarBtn} activeOpacity={0.7}>
          <Text style={styles.voltarText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.rotaInfo}>
          <Text style={styles.rotaTexto} numberOfLines={1}>
            {entrada.origem} → {entrada.destino}
          </Text>
          <Text style={styles.rotaKm}>
            {entrada.distanciaKm} km{entrada.tipoRetorno === 'vazio' ? ' + volta vazia' : entrada.tipoRetorno === 'comCarga' ? ' + com retorno' : ''}
            {' · '}distância total: {distTotal} km
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} scrollEnabled={scrollEnabled}>

        {/* OFFLINE BANNER */}
        {entrada.distanciaEstimada && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerTexto}>
              📍 Distância estimada — edite se souber o valor exato
            </Text>
          </View>
        )}

        {/* VEREDITO */}
        <View style={[styles.veredito, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
          <Text style={[styles.vereditoEmoji, { color: cfg.color }]}>{cfg.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.vereditoLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.vereditoDesc}>{cfg.descricao}</Text>
          </View>
        </View>

        {/* RESUMO FINANCEIRO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo Financeiro</Text>

          <View style={styles.resumoGrid}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoItemLabel}>Valor do Frete</Text>
              <Text style={[styles.resumoItemValor, { color: colors.primary }]}>
                {formatCurrency(entrada.valorFrete)}
              </Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoItemLabel}>Custo Total</Text>
              <Text style={[styles.resumoItemValor, { color: colors.danger }]}>
                {formatCurrency(custoTotal)}
              </Text>
            </View>
            <View style={[styles.resumoItem, styles.resumoItemLucro]}>
              <Text style={styles.resumoItemLabel}>Lucro</Text>
              <Text style={[
                styles.resumoItemValor,
                styles.resumoItemValorGrande,
                { color: lucro >= 0 ? colors.success : colors.danger }
              ]}>
                {formatCurrency(lucro)}
              </Text>
            </View>
          </View>

          <View style={styles.margemRow}>
            <View style={styles.margemItem}>
              <Text style={styles.margemLabel}>Margem Real</Text>
              <Text style={[
                styles.margemValor,
                { color: margemReal >= entrada.margemDesejada ? colors.success : colors.warning }
              ]}>
                {formatPercent(margemReal)}
              </Text>
            </View>
            <View style={styles.margemSeparator} />
            <View style={styles.margemItem}>
              <Text style={styles.margemLabel}>Margem Desejada</Text>
              <Text style={styles.margemValor}>{formatPercent(entrada.margemDesejada)}</Text>
            </View>
          </View>
        </View>

        {entrada.tipoRetorno === 'vazio' && (
          <TouchableOpacity
            style={styles.btnSimular}
            onPress={() => setModalAberto(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSimularText}>E se eu pegar um frete de retorno para minha cidade?</Text>
          </TouchableOpacity>
        )}

        {/* EXPLORADOR DE MARGEM */}
        <View style={styles.card}>
          <SliderMargem
            custoTotal={custoTotal}
            valorFrete={entrada.valorFrete}
            margemInicial={margemReal}
            pisoANTT={pisoANTT}
            margemDesejada={entrada.margemDesejada}
            onSlidingStart={() => setScrollEnabled(false)}
            onSlidingComplete={() => setScrollEnabled(true)}
          />
        </View>

        {/* CONSELHOS CONTEXTUAIS */}
        {conselhos.length > 0 && (
          <View style={[styles.card, styles.cardConselhos]}>
            <Text style={styles.cardTitle}>O que pode melhorar</Text>
            {conselhos.map((c, i) => (
              <View key={i} style={[styles.conselhoItem, i > 0 && styles.conselhoItemBorder]}>
                <Text style={styles.conselhoTexto}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        {/* PISO ANTT */}
        <View style={[styles.card, abaixoPisoANTT && styles.cardAlerta]}>
          <Text style={styles.cardTitle}>Piso Mínimo ANTT</Text>
          <View style={styles.anttRow}>
            <View>
              <Text style={styles.anttLabel}>Valor mínimo referência</Text>
              <Text style={styles.anttHint}>R$ 3,20/km · carreta 5 eixos · carga geral</Text>
            </View>
            <Text style={[
              styles.anttValor,
              { color: abaixoPisoANTT ? colors.danger : colors.success }
            ]}>
              {formatCurrency(pisoANTT)}
            </Text>
          </View>
          {abaixoPisoANTT && (
            <View style={styles.alertaBanner}>
              <Text style={styles.alertaTexto}>
                ⚠ Frete {formatCurrency(pisoANTT - entrada.valorFrete)} abaixo do piso mínimo ANTT
              </Text>
            </View>
          )}
          {pisoANTT > 0 && (
            <Text style={styles.anttDisclaimer}>
              Estimativa com base em modelo de custo transparente. O piso ANTT é referência regulatória e o veredito não é aconselhamento.
            </Text>
          )}
        </View>

        {/* GRÁFICO DE PIZZA */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribuição de Custos</Text>
          <GraficoPizza
            custoDetalhado={custoDetalhado}
            lucro={lucro}
            valorFrete={entrada.valorFrete}
          />
        </View>

        {/* DETALHAMENTO DE CUSTOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalhamento de Custos</Text>
          <LinhaDetalhe label="Diesel" valor={custoDetalhado.diesel} />
          <LinhaDetalhe label="Arla 32" valor={custoDetalhado.arla} />
          <LinhaDetalhe label="Pedágio" valor={custoDetalhado.pedagio} />
          <LinhaDetalhe label="Alimentação" valor={custoDetalhado.alimentacao} />
          <LinhaDetalhe label="Pernoite" valor={custoDetalhado.pernoite} />
          <LinhaDetalhe label="Manutenção" valor={custoDetalhado.manutencao} />
          <LinhaDetalhe label="Pneus" valor={custoDetalhado.pneus} />
          <LinhaDetalhe label="Depreciação" valor={custoDetalhado.depreciacao} />
          <View style={styles.totalSeparator} />
          <LinhaDetalhe label="CUSTO TOTAL" valor={custoTotal} destaque />
        </View>

        <TouchableOpacity style={styles.btnVoltar} onPress={onVoltar} activeOpacity={0.85}>
          <Text style={styles.btnVoltarText}>NOVA ANÁLISE</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <SimularRetornoModal
        visible={modalAberto}
        onClose={() => setModalAberto(false)}
        resultado={resultado}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voltarBtn: {
    marginBottom: 8,
  },
  voltarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  rotaInfo: {},
  rotaTexto: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rotaKm: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scroll: { flex: 1 },
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
  cardAlerta: {
    borderColor: colors.danger,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Veredito
  veredito: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vereditoEmoji: {
    fontSize: 32,
    fontWeight: '900',
    width: 40,
    textAlign: 'center',
  },
  vereditoLabel: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  vereditoDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  // Resumo
  resumoGrid: {
    gap: 8,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resumoItemLucro: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resumoItemLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resumoItemValor: {
    fontSize: 15,
    fontWeight: '600',
  },
  resumoItemValorGrande: {
    fontSize: 20,
    fontWeight: '800',
  },
  margemRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  margemItem: {
    flex: 1,
    alignItems: 'center',
  },
  margemSeparator: {
    width: 1,
    backgroundColor: colors.border,
  },
  margemLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  margemValor: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  // ANTT
  anttRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anttLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  anttHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  anttValor: {
    fontSize: 18,
    fontWeight: '700',
  },
  alertaBanner: {
    marginTop: 10,
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 10,
  },
  alertaTexto: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },

  // Detalhamento
  detalheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detalheRowDestaque: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  detalheLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detalheLabelDestaque: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  detalheValor: {
    color: colors.text,
    fontSize: 14,
  },
  detalheValorDestaque: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  totalSeparator: {
    height: 1,
    backgroundColor: colors.primary,
    marginVertical: 4,
    opacity: 0.4,
  },

  // Conselhos
  cardConselhos: {
    borderColor: colors.warning,
  },
  conselhoItem: {
    paddingVertical: 10,
  },
  conselhoItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  conselhoTexto: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },

  // Offline banner
  offlineBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  offlineBannerTexto: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  // ANTT disclaimer
  anttDisclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },

  // Botões
  btnSimular: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSimularText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  btnVoltar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 4,
  },
  btnVoltarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
