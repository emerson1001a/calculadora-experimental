import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { InputField } from '../components/InputField';
import { CustoRow } from '../components/CustoRow';
import { calcularFrete } from '../engine/calcularFrete';
import { colors } from '../theme/colors';
import { parseNumber, formatCurrency, aplicarMaquininha } from '../utils/format';
import { carregarPerfil } from '../utils/storage';
import { distancias, cidades, getDistancia } from '../data/distancias';
import { calcularPisoANTT } from '../engine/pisoANTT';
import type { ResultadoFrete, TipoRetorno, PerfilCaminhao } from '../types';

type Zona = 'VERDE' | 'AMARELA' | 'VERMELHA';

function getZonaNegociar(freteMin: number, margemSlider: number, pisoANTT: number, margemDesejada: number): Zona {
  if (freteMin < pisoANTT) return 'VERMELHA';
  if (margemSlider <= 0 || margemSlider < margemDesejada) return 'AMARELA';
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
  const [distanciaVeioMatriz, setDistanciaVeioMatriz] = useState(false);

  // Frete
  const [valorFrete, setValorFrete] = useState('');
  const [tipoRetorno, setTipoRetorno] = useState<TipoRetorno>('nenhum');

  // Modo "A negociar"
  const [aNegociar, setANegociar] = useState(false);
  const [margemNegociar, setMargemNegociar] = useState(15);
  const zonaAnteriorRef = useRef<Zona | null>(null);

  // Custos da viagem
  const [pedagio, setPedagio] = useState('150,00');
  const [pedagioVolta, setPedagioVolta] = useState('150,00');
  const [numeroDiarias, setNumeroDiarias] = useState('1');
  const [hospedagemPorDiaria, setHospedagemPorDiaria] = useState('80,00');
  const [alimentacaoPorDia, setAlimentacaoPorDia] = useState('60,00');
  const [precoDiesel, setPrecoDiesel] = useState('6,50');
  const [precoArla, setPrecoArla] = useState('4,50');

  useEffect(() => {
    carregarPerfil().then(p => {
      setPerfil(p);
      setPerfilCarregado(true);
    });
  }, []);

  // Auto-preenche distância quando ambas cidades estão selecionadas
  useEffect(() => {
    if (!origemSelecionada || !destinoSelecionado) {
      setDistanciaVeioMatriz(false);
      return;
    }
    const dist = getDistancia(origemSelecionada, destinoSelecionado);
    if (dist !== null) {
      setDistancia(String(dist));
      setDistanciaVeioMatriz(true);
    } else {
      setDistanciaVeioMatriz(false);
    }
  }, [origemSelecionada, destinoSelecionado]);

  // Auto-preenche número de diárias com base na distância
  useEffect(() => {
    const dist = parseNumber(distancia);
    if (dist <= 0) return;
    let dias: number;
    if (dist <= 600) dias = 1;
    else if (dist <= 1200) dias = 2;
    else if (dist <= 2000) dias = 3;
    else if (dist <= 3000) dias = 4;
    else dias = 5;
    setNumeroDiarias(String(dias));
  }, [distancia]);

  const sugestoesOrigem = useMemo(() => {
    if (buscaOrigem.length < 2 || origemSelecionada) return [];
    const q = buscaOrigem.toLowerCase();
    return cidades.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [buscaOrigem, origemSelecionada]);

  const sugestoesDestino = useMemo(() => {
    if (buscaDestino.length < 2 || destinoSelecionado) return [];
    const q = buscaDestino.toLowerCase();
    return cidades.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [buscaDestino, destinoSelecionado]);

  // Cálculo em tempo real para modo "A negociar"
  const pisoANTTEstimado = useMemo(
    () => calcularPisoANTT(parseNumber(distancia), perfil?.numeroEixos),
    [distancia, perfil],
  );

  const custoEstimado = useMemo<number | null>(() => {
    if (!perfil) return null;
    const dist = parseNumber(distancia);
    if (dist <= 0) return null;
    const temRetorno = tipoRetorno !== 'nenhum';
    const fatorKm = temRetorno ? 2 : 1;
    const distTotal = dist * fatorKm;
    const nDiarias = parseNumber(numeroDiarias);
    const diesel = (parseNumber(precoDiesel) / perfil.dieselKmPorLt) * distTotal;
    const arla = (parseNumber(precoArla) / perfil.arlaKmPorLt) * distTotal;
    const pedagioTotal = !temRetorno
      ? parseNumber(pedagio)
      : tipoRetorno === 'vazio'
      ? parseNumber(pedagio) * 2
      : parseNumber(pedagio) + parseNumber(pedagioVolta);
    return (
      diesel + arla + pedagioTotal
      + nDiarias * parseNumber(alimentacaoPorDia)
      + nDiarias * parseNumber(hospedagemPorDiaria)
      + perfil.manutencaoPorKm * distTotal
      + perfil.pneusPorKm * distTotal
      + perfil.depreciacaoPorKm * distTotal
    );
  }, [perfil, distancia, tipoRetorno, precoDiesel, precoArla, pedagio, pedagioVolta, numeroDiarias, alimentacaoPorDia, hospedagemPorDiaria]);

  const freteMinimo = useMemo<number | null>(() => {
    if (custoEstimado === null || margemNegociar >= 100) return null;
    return custoEstimado / (1 - margemNegociar / 100);
  }, [custoEstimado, margemNegociar]);

  const margemDesejadaNum = 0;

  const zonaNegociar: Zona = freteMinimo === null || !isFinite(freteMinimo)
    ? 'VERDE'
    : getZonaNegociar(freteMinimo, margemNegociar, pisoANTTEstimado, margemDesejadaNum);

  function selecionarOrigem(cidade: string) {
    console.log('[selecionarOrigem] cidade selecionada:', cidade);
    setOrigemSelecionada(cidade);
    setBuscaOrigem(cidade);
  }

  function selecionarDestino(cidade: string) {
    console.log('[selecionarDestino] cidade selecionada:', cidade);
    setDestinoSelecionado(cidade);
    setBuscaDestino(cidade);
  }

  function toggleANegociar() {
    if (!aNegociar) {
      zonaAnteriorRef.current = null;
    }
    setANegociar(v => !v);
  }

  function handleMargemNegociarChange(v: number) {
    const novo = Math.round(v);
    if (freteMinimo !== null && isFinite(freteMinimo)) {
      const novoFrete = custoEstimado !== null ? custoEstimado / (1 - novo / 100) : 0;
      const novaZona = getZonaNegociar(novoFrete, novo, pisoANTTEstimado, margemDesejadaNum);
      if (zonaAnteriorRef.current !== null) {
        if (zonaAnteriorRef.current !== 'VERMELHA' && novaZona === 'VERMELHA') {
          Vibration.vibrate(300);
        } else if (zonaAnteriorRef.current === 'VERMELHA' && novaZona !== 'VERMELHA') {
          Vibration.vibrate(100);
        }
      }
      zonaAnteriorRef.current = novaZona;
    }
    setMargemNegociar(novo);
  }

  function handleCalcular() {
    if (!perfil) {
      Alert.alert('Perfil não cadastrado', 'Cadastre seu caminhão antes de calcular.');
      return;
    }

    const dist = parseNumber(distancia);
    if (dist <= 0) {
      Alert.alert('Campo obrigatório', 'Informe a distância em km.');
      return;
    }

    let valor: number;
    let margemUsada: number;

    if (aNegociar) {
      if (freteMinimo === null || freteMinimo <= 0 || !isFinite(freteMinimo)) {
        Alert.alert('Dados incompletos', 'Preencha os custos e a distância para calcular o frete mínimo.');
        return;
      }
      valor = freteMinimo;
      margemUsada = margemNegociar;
    } else {
      valor = parseNumber(valorFrete);
      if (valor <= 0) {
        Alert.alert('Campo obrigatório', 'Informe o valor do frete.');
        return;
      }
      margemUsada = 0;
    }

    const nDiarias = parseNumber(numeroDiarias);

    const resultado = calcularFrete({
      origem: origemSelecionada || buscaOrigem.trim() || 'Origem',
      destino: destinoSelecionado || buscaDestino.trim() || 'Destino',
      distanciaKm: dist,
      valorFrete: valor,
      tipoRetorno,
      margemDesejada: margemUsada,
      distanciaEstimada: distanciaVeioMatriz,
      numeroEixos: perfil?.numeroEixos,
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

  const corZona = COR_ZONA[zonaNegociar];
  const bgZona = BG_ZONA[zonaNegociar];
  const mensagemZona =
    zonaNegociar === 'VERDE' ? '✓ Dentro da sua margem e acima do mínimo legal'
    : zonaNegociar === 'AMARELA' ? '⚠ Abaixo da sua margem desejada, mas ainda legal'
    : `🚨 Abaixo do mínimo legal da ANTT (${formatCurrency(pisoANTTEstimado)})`;

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
                    {perfil.ano ? `${perfil.ano} · ` : ''}{perfil.tipoCarroceria ? `${perfil.tipoCarroceria} · ` : ''}{perfil.dieselKmPorLt} Km/L
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
                onChangeText={v => { setDistancia(v); setDistanciaVeioMatriz(false); }}
                placeholder="Digite a distância em km"
                keyboardType="numeric"
                suffix="km"
              />
              {distanciaVeioMatriz && (
                <Text style={styles.distHint}>✓ preenchida automaticamente</Text>
              )}
            </View>
          </View>

          {/* FRETE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Frete</Text>

            {/* Campo valor com botão "A negociar" */}
            <View style={styles.freteValorHeader}>
              <Text style={styles.freteValorLabel}>Valor ofertado</Text>
              <TouchableOpacity
                style={[styles.aNegociarBtn, aNegociar && styles.aNegociarBtnAtivo]}
                onPress={toggleANegociar}
                activeOpacity={0.8}
              >
                <Text style={[styles.aNegociarBtnText, aNegociar && styles.aNegociarBtnTextAtivo]}>
                  {aNegociar ? '✕ A NEGOCIAR' : 'A NEGOCIAR'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.freteValorInput, aNegociar && styles.freteValorInputDisabled]}>
              <Text style={styles.freteValorPrefix}>R$</Text>
              <TextInput
                style={styles.freteValorText}
                value={valorFrete}
                onChangeText={v => setValorFrete(aplicarMaquininha(v, valorFrete))}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                inputMode="decimal"
                editable={!aNegociar}
              />
            </View>

            {/* Painel "A negociar" */}
            {aNegociar && (
              <View style={styles.aNegociarPanel}>
                {!perfil ? (
                  <Text style={styles.aNegociarHint}>
                    Cadastre seu caminhão para calcular o frete mínimo
                  </Text>
                ) : custoEstimado === null ? (
                  <Text style={styles.aNegociarHint}>
                    Informe a distância para ver o frete mínimo
                  </Text>
                ) : (
                  <>
                    <View style={styles.aNegociarSliderCabecalho}>
                      <Text style={styles.aNegociarSliderTitulo}>Margem alvo</Text>
                      <View style={[styles.aNegociarMargemBadge, { backgroundColor: bgZona, borderColor: corZona }]}>
                        <Text style={[styles.aNegociarMargemValor, { color: corZona }]}>{margemNegociar}%</Text>
                      </View>
                    </View>

                    <Slider
                      style={styles.aNegociarSlider}
                      minimumValue={0}
                      maximumValue={50}
                      step={1}
                      value={margemNegociar}
                      onValueChange={handleMargemNegociarChange}
                      minimumTrackTintColor={corZona}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={corZona}
                    />

                    <View style={styles.aNegociarSliderLabels}>
                      <Text style={styles.aNegociarSliderLabelTexto}>0%</Text>
                      <Text style={styles.aNegociarSliderLabelTexto}>50%</Text>
                    </View>

                    <View style={[styles.aNegociarZonaRow, { backgroundColor: bgZona, borderColor: corZona }]}>
                      <Text style={[styles.aNegociarZonaTexto, { color: corZona }]}>{mensagemZona}</Text>
                    </View>

                    <View style={[styles.aNegociarResultado, { borderColor: corZona }]}>
                      <Text style={styles.aNegociarResultadoLabel}>
                        Para sua margem de {margemNegociar}%, o frete mínimo é
                      </Text>
                      <Text style={[styles.aNegociarResultadoValor, { color: corZona }]}>
                        {freteMinimo !== null && isFinite(freteMinimo)
                          ? formatCurrency(freteMinimo)
                          : '—'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

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
                      <Text style={[styles.retornoOpcaoTexto, ativo && styles.retornoOpcaoTextoAtivo]}>
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
              onChangeText={v => setPedagio(aplicarMaquininha(v, pedagio))}
              unit="R$"
            />
            {tipoRetorno === 'comCarga' && (
              <CustoRow
                label="Pedágio (volta)"
                value={pedagioVolta}
                onChangeText={v => setPedagioVolta(aplicarMaquininha(v, pedagioVolta))}
                unit="R$"
              />
            )}

            <Text style={styles.sectionLabel}>Gastos e Alimentação</Text>
            <CustoRow
              label="Número de diárias"
              value={numeroDiarias}
              onChangeText={setNumeroDiarias}
              unit="noites"
            />
            <CustoRow
              label="Gasto extra"
              value={hospedagemPorDiaria}
              onChangeText={v => setHospedagemPorDiaria(aplicarMaquininha(v, hospedagemPorDiaria))}
              unit="R$/diária"
            />
            <CustoRow
              label="Alimentação"
              value={alimentacaoPorDia}
              onChangeText={v => setAlimentacaoPorDia(aplicarMaquininha(v, alimentacaoPorDia))}
              unit="R$/dia"
            />

            <Text style={styles.sectionLabel}>Combustível</Text>
            <CustoRow
              label="Preço do diesel"
              value={precoDiesel}
              onChangeText={v => setPrecoDiesel(aplicarMaquininha(v, precoDiesel))}
              unit="R$/L"
            />
            <CustoRow
              label="Preço do Arla 32"
              value={precoArla}
              onChangeText={v => setPrecoArla(aplicarMaquininha(v, precoArla))}
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
    fontWeight: '700' as const,
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
    flexDirection: 'row' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 14,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },

  // Autocomplete
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase' as const,
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

  // Campo valor + botão "A negociar"
  freteValorHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  freteValorLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  aNegociarBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  aNegociarBtnAtivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  aNegociarBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  aNegociarBtnTextAtivo: {
    color: colors.white,
  },
  freteValorInput: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  freteValorInputDisabled: {
    opacity: 0.5,
  },
  freteValorPrefix: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  freteValorText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  // Painel "A negociar"
  aNegociarPanel: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    gap: 0,
  },
  aNegociarHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center' as const,
    paddingVertical: 8,
  },
  aNegociarSliderCabecalho: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aNegociarSliderTitulo: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  aNegociarMargemBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  aNegociarMargemValor: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  aNegociarSlider: {
    width: '100%',
    height: 36,
  },
  aNegociarSliderLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  aNegociarSliderLabelTexto: {
    color: colors.textMuted,
    fontSize: 10,
  },
  aNegociarZonaRow: {
    borderRadius: 7,
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
  },
  aNegociarZonaTexto: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  aNegociarResultado: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center' as const,
    gap: 4,
  },
  aNegociarResultadoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center' as const,
  },
  aNegociarResultadoValor: {
    fontSize: 22,
    fontWeight: '800' as const,
  },

  // Tipo retorno
  retornoRow: {
    marginTop: 4,
  },
  retornoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  retornoSegment: {
    flexDirection: 'row' as const,
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
    fontWeight: '600' as const,
    textAlign: 'center' as const,
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
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
});
