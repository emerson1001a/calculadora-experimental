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
import { colors } from '../theme/colors';
import { parseNumber, aplicarMaquininha, toMaquininha } from '../utils/format';
import { salvarPerfil, carregarPerfil, limparPerfil } from '../utils/storage';
import { caminhoes, marcas } from '../data/caminhoes';
import type { ModeloCaminhao } from '../data/caminhoes';
import { eixosPorCarroceria } from '../data/eixosPorCarroceria';
import type { PerfilCaminhao, TipoCarroceria, TipoVeiculo, SimNao } from '../types';

const VEICULOS: { categoria: string; opcoes: TipoVeiculo[] }[] = [
  {
    categoria: 'Pesado',
    opcoes: ['Carreta', 'Carreta LS', 'Vanderléia', 'Carreta 4º eixo', 'Bitrem 7 eixos', 'Bitrem 9 eixos', 'Rodotrem'],
  },
  { categoria: 'Médio', opcoes: ['Truck', 'BiTruck'] },
  { categoria: 'Leve', opcoes: ['Fiorino', 'VLC', '3/4', 'Toco'] },
];

const CARROCERIAS: { categoria: string; opcoes: TipoCarroceria[] }[] = [
  {
    categoria: 'Abertas',
    opcoes: ['Graneleiro', 'Grade baixa', 'Prancha', 'Caçamba', 'Plataforma'],
  },
  {
    categoria: 'Fechadas',
    opcoes: ['Sider', 'Baú', 'Baú Frigorífico', 'Baú Refrigerado'],
  },
  {
    categoria: 'Especiais',
    opcoes: ['Silo', 'Cegonheiro', 'Gaiola', 'Tanque', 'Bug Porta Container', 'Munk', 'Apenas Cavalo', 'Cavaqueira', 'Hoper'],
  },
];

const SIM_NAO: SimNao[] = ['Sim', 'Não', 'Ambos'];

interface Props {
  onVoltar: () => void;
}

export function PerfilCaminhaoScreen({ onVoltar }: Props) {
  // Autocomplete marca
  const [buscaMarca, setBuscaMarca] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState<string | null>(null);
  // Autocomplete modelo
  const [buscaModelo, setBuscaModelo] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState(false);
  const [arlaDesabilitada, setArlaDesabilitada] = useState(false);

  const [ano, setAno] = useState('');
  const [dieselKmPorLt, setDieselKmPorLt] = useState('3.5');
  const [arlaKmPorLt, setArlaKmPorLt] = useState('70');
  const [depreciacaoPorKm, setDepreciacaoPorKm] = useState('0,20');
  const [manutencaoPorKm, setManutencaoPorKm] = useState('0,15');
  const [pneusPorKm, setPneusPorKm] = useState('0,10');
  const [tipoCarroceria, setTipoCarroceria] = useState<TipoCarroceria | undefined>(undefined);
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo | undefined>(undefined);
  const [rastreador, setRastreador] = useState<SimNao | undefined>(undefined);
  const [agenciador, setAgenciador] = useState<SimNao | undefined>(undefined);
  const [numeroEixos, setNumeroEixos] = useState('');

  useEffect(() => {
    carregarPerfil().then(p => {
      if (!p) return;
      setBuscaMarca(p.marca);
      setMarcaSelecionada(p.marca);
      setBuscaModelo(p.modelo);
      setAno(p.ano);
      setDieselKmPorLt(String(p.dieselKmPorLt));
      setArlaKmPorLt(String(p.arlaKmPorLt));
      setDepreciacaoPorKm(toMaquininha(p.depreciacaoPorKm));
      setManutencaoPorKm(toMaquininha(p.manutencaoPorKm));
      setPneusPorKm(toMaquininha(p.pneusPorKm));
      if (p.tipoCarroceria) setTipoCarroceria(p.tipoCarroceria);
      if (p.tipoVeiculo) setTipoVeiculo(p.tipoVeiculo);
      if (p.rastreador) setRastreador(p.rastreador);
      if (p.agenciador) setAgenciador(p.agenciador);
      if (p.numeroEixos) setNumeroEixos(String(p.numeroEixos));
    });
  }, []);

  const sugestoesMarca = useMemo(() => {
    if (buscaMarca.length < 1 || marcaSelecionada) return [];
    const q = buscaMarca.toLowerCase();
    return marcas.filter(m => m.toLowerCase().includes(q)).slice(0, 6);
  }, [buscaMarca, marcaSelecionada]);

  const sugestoesModelo = useMemo(() => {
    if (!marcaSelecionada || buscaModelo.length < 1 || modeloSelecionado) return [];
    const q = buscaModelo.toLowerCase();
    const lista = caminhoes[marcaSelecionada] ?? [];
    return lista.filter(m => m.modelo.toLowerCase().includes(q)).slice(0, 6);
  }, [marcaSelecionada, buscaModelo, modeloSelecionado]);

  const placeholderModelo = useMemo(() => {
    if (!marcaSelecionada) return 'Selecione uma marca primeiro';
    const lista = caminhoes[marcaSelecionada] ?? [];
    if (lista.length === 0) return 'Digite o modelo';
    return lista.slice(0, 3).map(m => m.modelo).join(', ') + '...';
  }, [marcaSelecionada]);

  function selecionarMarca(m: string) {
    setBuscaMarca(m);
    setMarcaSelecionada(m);
    setBuscaModelo('');
    setModeloSelecionado(false);
    setArlaDesabilitada(false);
  }

  function selecionarModelo(item: ModeloCaminhao) {
    setBuscaModelo(item.modelo);
    setModeloSelecionado(true);
    setDieselKmPorLt(String(item.consumoDieselKmL));
    if (item.consumoArlaKmL !== null) {
      setArlaKmPorLt(String(item.consumoArlaKmL));
      setArlaDesabilitada(false);
    } else {
      setArlaKmPorLt('0');
      setArlaDesabilitada(true);
    }
  }

  function handleSelecionarCarroceria(op: TipoCarroceria) {
    const nova = tipoCarroceria === op ? undefined : op;
    setTipoCarroceria(nova);
    if (nova) {
      const eixosSugerido = eixosPorCarroceria[nova];
      if (eixosSugerido !== undefined) {
        setNumeroEixos(String(eixosSugerido));
      }
    }
  }

  function handleLimparPerfil() {
    if (Platform.OS === 'web') {
      // Alert.alert usa window.confirm internamente no web e pode ser suprimido pelo browser
      // eslint-disable-next-line no-alert
      if (!window.confirm('Isso vai apagar todos os dados do caminhão. Confirmar?')) return;
      limparPerfil().then(() => onVoltar());
    } else {
      Alert.alert(
        'Limpar perfil',
        'Isso vai apagar todos os dados do caminhão. Confirmar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Apagar', style: 'destructive', onPress: () => limparPerfil().then(() => onVoltar()) },
        ],
      );
    }
  }

  async function handleSalvar() {
    if (!buscaMarca.trim() || !buscaModelo.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe a marca e o modelo do caminhão.');
      return;
    }
    const perfil: PerfilCaminhao = {
      marca: buscaMarca.trim(),
      modelo: buscaModelo.trim(),
      ano: ano.trim(),
      dieselKmPorLt: parseNumber(dieselKmPorLt) || 3.5,
      arlaKmPorLt: parseNumber(arlaKmPorLt) || 70,
      depreciacaoPorKm: parseNumber(depreciacaoPorKm) || 0.20,
      manutencaoPorKm: parseNumber(manutencaoPorKm) || 0.15,
      pneusPorKm: parseNumber(pneusPorKm) || 0.10,
      tipoCarroceria,
      tipoVeiculo,
      rastreador,
      agenciador,
      numeroEixos: numeroEixos ? Math.min(9, Math.max(2, parseInt(numeroEixos, 10))) || undefined : undefined,
    };
    await salvarPerfil(perfil);
    onVoltar();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onVoltar} style={styles.voltarBtn} activeOpacity={0.7}>
            <Text style={styles.voltarText}>← Voltar</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Meu Caminhão</Text>
            <Text style={styles.headerSubtitle}>Cadastrado uma vez, usado sempre</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Identificação */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Identificação</Text>

            <Text style={styles.fieldLabel}>Marca</Text>
            <TextInput
              style={styles.autoInput}
              value={buscaMarca}
              onChangeText={v => { setBuscaMarca(v); setMarcaSelecionada(null); }}
              placeholder="Volvo, Scania, Mercedes-Benz..."
              placeholderTextColor={colors.textMuted}
            />
            {sugestoesMarca.length > 0 && (
              <View style={styles.sugestoesBox}>
                {sugestoesMarca.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={styles.sugestaoItem}
                    onPress={() => selecionarMarca(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sugestaoTexto}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.fieldLabel, styles.fieldLabelMt]}>Modelo</Text>
            <TextInput
              style={[styles.autoInput, !marcaSelecionada && styles.autoInputDisabled]}
              value={buscaModelo}
              onChangeText={v => { setBuscaModelo(v); setModeloSelecionado(false); }}
              placeholder={placeholderModelo}
              placeholderTextColor={colors.textMuted}
              editable={!!marcaSelecionada}
            />
            {sugestoesModelo.length > 0 && (
              <View style={styles.sugestoesBox}>
                {sugestoesModelo.map(item => (
                  <TouchableOpacity
                    key={item.modelo}
                    style={styles.sugestaoItem}
                    onPress={() => selecionarModelo(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sugestaoTexto}>{item.modelo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <InputField
              label="Ano"
              value={ano}
              onChangeText={setAno}
              placeholder="Ex: 2022"
              keyboardType="numeric"
            />
            <InputField
              label="Número de Eixos"
              value={numeroEixos}
              onChangeText={v => {
                const n = v.replace(/\D/g, '');
                setNumeroEixos(n);
              }}
              placeholder="Ex: 5  (entre 2 e 9)"
              keyboardType="numeric"
            />
          </View>

          {/* Tipo de Veículo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo de Veículo</Text>
            {VEICULOS.map(({ categoria, opcoes }) => (
              <React.Fragment key={categoria}>
                <Text style={styles.grupoLabel}>{categoria}</Text>
                <View style={styles.chipGrid}>
                  {opcoes.map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.chip, tipoVeiculo === op && styles.chipAtivo]}
                      onPress={() => setTipoVeiculo(tipoVeiculo === op ? undefined : op)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipTexto, tipoVeiculo === op && styles.chipTextoAtivo]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Tipo de Carroceria */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo de Carroceria</Text>
            {CARROCERIAS.map(({ categoria, opcoes }) => (
              <React.Fragment key={categoria}>
                <Text style={styles.grupoLabel}>{categoria}</Text>
                <View style={styles.chipGrid}>
                  {opcoes.map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.chip, tipoCarroceria === op && styles.chipAtivo]}
                      onPress={() => handleSelecionarCarroceria(op)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipTexto, tipoCarroceria === op && styles.chipTextoAtivo]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Rastreador e Agenciador */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Extras</Text>

            <Text style={styles.sectionLabel}>Rastreador</Text>
            <View style={styles.chipGrid}>
              {SIM_NAO.map(op => (
                <TouchableOpacity
                  key={op}
                  style={[styles.chip, rastreador === op && styles.chipAtivo]}
                  onPress={() => setRastreador(rastreador === op ? undefined : op)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipTexto, rastreador === op && styles.chipTextoAtivo]}>
                    {op}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Agenciador</Text>
            <View style={styles.chipGrid}>
              {SIM_NAO.map(op => (
                <TouchableOpacity
                  key={op}
                  style={[styles.chip, agenciador === op && styles.chipAtivo]}
                  onPress={() => setAgenciador(agenciador === op ? undefined : op)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipTexto, agenciador === op && styles.chipTextoAtivo]}>
                    {op}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Consumos */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consumos</Text>
            <Text style={styles.cardHint}>Referência: carreta 5 eixos em estrada</Text>
            <CustoRow
              label="Consumo do diesel"
              value={dieselKmPorLt}
              onChangeText={setDieselKmPorLt}
              unit="Km/L"
            />
            <CustoRow
              label="Consumo do Arla 32"
              value={arlaKmPorLt}
              onChangeText={setArlaKmPorLt}
              unit="Km/L"
              disabled={arlaDesabilitada}
            />
            {modeloSelecionado && (
              <Text style={styles.consumoHint}>
                Valores estimados — edite se souber o consumo real
              </Text>
            )}
          </View>

          {/* Custo por km */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custo por Quilômetro</Text>
            <Text style={styles.cardHint}>Valores médios do seu caminhão rodado</Text>
            <CustoRow
              label="Depreciação"
              value={depreciacaoPorKm}
              onChangeText={v => setDepreciacaoPorKm(aplicarMaquininha(v, depreciacaoPorKm))}
              unit="R$/km"
            />
            <CustoRow
              label="Manutenção"
              value={manutencaoPorKm}
              onChangeText={v => setManutencaoPorKm(aplicarMaquininha(v, manutencaoPorKm))}
              unit="R$/km"
            />
            <CustoRow
              label="Pneus"
              value={pneusPorKm}
              onChangeText={v => setPneusPorKm(aplicarMaquininha(v, pneusPorKm))}
              unit="R$/km"
            />
          </View>

          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} activeOpacity={0.85}>
            <Text style={styles.btnSalvarText}>SALVAR CAMINHÃO</Text>
          </TouchableOpacity>

          {true && (
            <TouchableOpacity
              style={styles.btnLimparDev}
              onPress={handleLimparPerfil}
              activeOpacity={0.7}
            >
              <Text style={styles.btnLimparDevText}>🧹 Limpar perfil (apenas dev)</Text>
            </TouchableOpacity>
          )}

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
    paddingBottom: 14,
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
  headerTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
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
  cardHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grupoLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipAtivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  chipTexto: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoAtivo: {
    color: colors.white,
  },
  btnSalvar: {
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
  btnSalvarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  btnLimparDev: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  btnLimparDevText: {
    color: '#E57373',
    fontSize: 12,
  },

  // Autocomplete
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  fieldLabelMt: {
    marginTop: 16,
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
  autoInputDisabled: {
    opacity: 0.5,
  },
  sugestoesBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden' as const,
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
  consumoHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic' as const,
    marginTop: 8,
  },
});
