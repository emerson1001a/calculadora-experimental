import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { carregarPerfil } from '../utils/storage';
import { distancias, cidades } from '../data/distancias';
import type { ResultadoFrete, TipoRetorno, PerfilCaminhao } from '../types';

interface Props {
  onCalcular: (resultado: ResultadoFrete) => void;
  onEditarPerfil: () => void;
}

export function AnalisarScreen({ onCalcular, onEditarPerfil }: Props) {
  // Perfil do caminhão
  const [perfil, setPerfil] = useState<PerfilCaminhao | null>(null);
  const [perfilCarregado, setPerfilCarregado] = useState(false);

  // Rota
  const [buscaOrigem, setBuscaOrigem] = useState('');
  const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);
  const [buscaDestino, setBuscaDestino] = useState('');
  const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);
  const [distancia, setDistancia] = useState('');

  // Frete
  const [valorFrete, setValorFrete] = useState('');
  const [margem, setMargem] = useState('15');
  const [tipoRetorno, setTipoRetorno] = useState<TipoRetorno>('nenhum');

  // Custos da viagem
  const [pedagio, setPedagio] = useState('150');
  const [pedagioVolta, setPedagioVolta] = useState('150');
  const [numeroDiarias, setNumeroDiarias] = useState('1');
  const [hospedagemPorDiaria, setHospedagemPorDiaria] = useState('80');
  const [alimentacaoPorDia, setAlimentacaoPorDia] = useState('60');
  const [precoDiesel, setPrecoDiesel] = useState('6.50');
  const [precoArla, setPrecoArla] = useState('4.50');

  useEffect(() => {
    carregarPerfil().then(p => {
      setPerfil(p);
      setPerfilCarregado(true);
    });
  }, []);

  // Auto-preenche distância quando ambas cidades estão selecionadas
  useEffect(() => {
    if (!origemSelecionada || !destinoSelecionado) return;
    const dist =
      distancias[origemSelecionada]?.[destinoSelecionado] ??
      distancias[destinoSelecionado]?.[origemSelecionada] ??
      null;
    if (dist !== null) setDistancia(String(dist));
  }, [origemSelecionada, destinoSelecionado]);

  const sugestoesOrigem = useMemo(() => {
    if (buscaOrigem.length < 3 || origemSelecionada) return [];
    const q = buscaOrigem.toLowerCase();
    return cidades.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [buscaOrigem, origemSelecionada]);

  const sugestoesDestino = useMemo(() => {
    if (buscaDestino.length < 3 || destinoSelecionado) return [];
    const q = buscaDestino.toLowerCase();
    return cidades.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [buscaDestino, destinoSelecionado]);

  function selecionarOrigem(cidade: string) {
    setOrigemSelecionada(cidade);
    setBuscaOrigem(cidade);
  }

  function selecionarDestino(cidade: string) {
    setDestinoSelecionado(cidade);
    setBuscaDestino(cidade);
  }

  function handleCalcular() {
    if (!perfil) {
      Alert.alert('Perfil não cadastrado', 'Cadastre seu caminhão antes de calcular.');
      return;
    }

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

    const nDiarias = parseNumber(numeroDiarias);

    const resultado = calcularFrete({
      origem: origemSelecionada || buscaOrigem.trim() || 'Origem',
      destino: destinoSelecionado || buscaDestino.trim() || 'Destino',
      distanciaKm: dist,
      valorFrete: valor,
      tipoRetorno,
      margemDesejada: parseNumber(margem),
      custos: {
        dieselKmPorLt: perfil.dieselKmPorLt,
        dieselPrecoPorLitro: parseNumber(precoDiesel),
        arlaKmPorLt: perfil.arlaKmPorLt,
        arlaPrecoPorLitro: parseNumber(precoArla),
        pedagio: parseNumber(pedagio),
        pedagioVolta: parseNumber(pedagioVolta),
        alimentacao: nDiarias * parseNumber(alimentacaoPorDia),
        pernoite: nDiarias * parseNumber(hospedagemPorDiaria),
        manutencaoPorKm: perfil.manutencaoPorKm,
        pneusPorKm: perfil.pneusPorKm,
        depreciacaoPorKm: perfil.depreciacaoPorKm,
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
          {/* PERFIL DO CAMINHÃO */}
          {perfilCarregado && (
            perfil ? (
              <View style={styles.perfilCard}>
                <View style={styles.perfilInfo}>
                  <Text style={styles.perfilNome}>{perfil.marca} {perfil.modelo}</Text>
                  <Text style={styles.perfilDetalhe}>
                    {perfil.ano ? `${perfil.ano} · ` : ''}{perfil.tipoCarroceria} · {perfil.dieselKmPorLt} Km/L
                  </Text>
                </View>
                <TouchableOpacity onPress={onEditarPerfil} style={styles.editarBtn} activeOpacity={0.7}>
                  <Text style={styles.editarBtnText}>Editar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cadastroBanner}>
                <Text style={styles.cadastroBannerTexto}>
                  Cadastre seu caminhão para agilizar seus cálculos
                </Text>
                <TouchableOpacity onPress={onEditarPerfil} style={styles.cadastrarBtn} activeOpacity={0.8}>
                  <Text style={styles.cadastrarBtnTexto}>Cadastrar agora</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* ROTA */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rota</Text>

            <Text style={styles.fieldLabel}>Origem</Text>
            <TextInput
              style={styles.autoInput}
              value={buscaOrigem}
              onChangeText={v => { setBuscaOrigem(v); setOrigemSelecionada(null); }}
              placeholder="Digite 3 letras para buscar..."
              placeholderTextColor={colors.textMuted}
            />
            {sugestoesOrigem.length > 0 && (
              <View style={styles.sugestoesBox}>
                {sugestoesOrigem.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={styles.sugestaoItem}
                    onPress={() => selecionarOrigem(c)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sugestaoTexto}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.fieldLabel, styles.fieldLabelMt]}>Destino</Text>
            <TextInput
              style={styles.autoInput}
              value={buscaDestino}
              onChangeText={v => { setBuscaDestino(v); setDestinoSelecionado(null); }}
              placeholder="Digite 3 letras para buscar..."
              placeholderTextColor={colors.textMuted}
            />
            {sugestoesDestino.length > 0 && (
              <View style={styles.sugestoesBox}>
                {sugestoesDestino.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={styles.sugestaoItem}
                    onPress={() => selecionarDestino(c)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sugestaoTexto}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.distanciaRow}>
              <InputField
                label="Distância"
                value={distancia}
                onChangeText={setDistancia}
                placeholder="0"
                keyboardType="numeric"
                suffix="km"
              />
              {origemSelecionada && destinoSelecionado && distancia !== '' && (
                <Text style={styles.distHint}>da tabela de rodovias</Text>
              )}
            </View>
          </View>

          {/* FRETE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Frete</Text>
            <InputField
              label="Valor ofertado"
              value={valorFrete}
              onChangeText={setValorFrete}
              placeholder="0,00"
              keyboardType="decimal-pad"
              prefix="R$"
            />
            <InputField
              label="Margem desejada"
              value={margem}
              onChangeText={setMargem}
              placeholder="15"
              keyboardType="decimal-pad"
              suffix="%"
            />
            <View style={styles.retornoRow}>
              <Text style={styles.retornoLabel}>Tipo de viagem</Text>
              <View style={styles.retornoSegment}>
                {(['nenhum', 'vazio', 'comCarga'] as TipoRetorno[]).map(opcao => {
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
                      <Text
                        style={[
                          styles.retornoOpcaoTexto,
                          ativo && styles.retornoOpcaoTextoAtivo,
                        ]}
                      >
                        {labels[opcao]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* CUSTOS DA VIAGEM */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custos da Viagem</Text>

            <Text style={styles.sectionLabel}>Pedágio</Text>
            <CustoRow
              label="Pedágio (ida)"
              value={pedagio}
              onChangeText={setPedagio}
              unit="R$"
            />
            {tipoRetorno === 'comCarga' && (
              <CustoRow
                label="Pedágio (volta)"
                value={pedagioVolta}
                onChangeText={setPedagioVolta}
                unit="R$"
              />
            )}

            <Text style={styles.sectionLabel}>Estadia e Alimentação</Text>
            <CustoRow
              label="Número de diárias"
              value={numeroDiarias}
              onChangeText={setNumeroDiarias}
              unit="noites"
            />
            <CustoRow
              label="Hospedagem"
              value={hospedagemPorDiaria}
              onChangeText={setHospedagemPorDiaria}
              unit="R$/diária"
            />
            <CustoRow
              label="Alimentação"
              value={alimentacaoPorDia}
              onChangeText={setAlimentacaoPorDia}
              unit="R$/dia"
            />

            <Text style={styles.sectionLabel}>Combustível</Text>
            <CustoRow
              label="Preço do diesel"
              value={precoDiesel}
              onChangeText={setPrecoDiesel}
              unit="R$/L"
            />
            <CustoRow
              label="Preço do Arla 32"
              value={precoArla}
              onChangeText={setPrecoArla}
              unit="R$/L"
            />
          </View>

          <TouchableOpacity
            style={[styles.btnCalcular, !perfil && styles.btnCalcularBloqueado]}
            onPress={handleCalcular}
            disabled={!perfil && perfilCarregado}
            activeOpacity={0.85}
          >
            <Text style={styles.btnCalcularText}>
              {!perfil && perfilCarregado ? 'CADASTRE SEU CAMINHÃO PRIMEIRO' : 'CALCULAR FRETE'}
            </Text>
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

  // Perfil card
  perfilCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  perfilInfo: {
    flex: 1,
  },
  perfilNome: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  perfilDetalhe: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  editarBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Cadastro banner
  cadastroBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: 10,
  },
  cadastroBannerTexto: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  cadastrarBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cadastrarBtnTexto: {
    color: colors.black,
    fontSize: 13,
    fontWeight: '700',
  },

  // Cards
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
    marginBottom: 14,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },

  // Autocomplete
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldLabelMt: {
    marginTop: 14,
  },
  autoInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    color: colors.text,
    fontSize: 15,
  },
  sugestoesBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
    marginTop: 2,
  },
  sugestaoItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sugestaoTexto: {
    color: colors.text,
    fontSize: 14,
  },
  distanciaRow: {
    marginTop: 14,
  },
  distHint: {
    color: colors.success,
    fontSize: 11,
    marginTop: -8,
    marginBottom: 4,
  },

  // Tipo retorno
  retornoRow: {
    marginTop: 4,
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

  // Botão calcular
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
  btnCalcularBloqueado: {
    backgroundColor: colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnCalcularText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
