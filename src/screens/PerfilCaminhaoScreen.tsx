import React, { useState, useEffect } from 'react';
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
import { colors } from '../theme/colors';
import { parseNumber } from '../utils/format';
import { salvarPerfil, carregarPerfil } from '../utils/storage';
import type { PerfilCaminhao, TipoCarroceria } from '../types';

const TIPOS_CARROCERIA: TipoCarroceria[] = [
  'Baú', 'Graneleiro', 'Frigorífico', 'Prancha', 'Tanque', 'Outros',
];

interface Props {
  onVoltar: () => void;
}

export function PerfilCaminhaoScreen({ onVoltar }: Props) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [dieselKmPorLt, setDieselKmPorLt] = useState('3.5');
  const [arlaKmPorLt, setArlaKmPorLt] = useState('70');
  const [depreciacaoPorKm, setDepreciacaoPorKm] = useState('0.20');
  const [manutencaoPorKm, setManutencaoPorKm] = useState('0.15');
  const [pneusPorKm, setPneusPorKm] = useState('0.10');
  const [tipoCarroceria, setTipoCarroceria] = useState<TipoCarroceria>('Baú');

  useEffect(() => {
    carregarPerfil().then(p => {
      if (!p) return;
      setMarca(p.marca);
      setModelo(p.modelo);
      setAno(p.ano);
      setDieselKmPorLt(String(p.dieselKmPorLt));
      setArlaKmPorLt(String(p.arlaKmPorLt));
      setDepreciacaoPorKm(String(p.depreciacaoPorKm));
      setManutencaoPorKm(String(p.manutencaoPorKm));
      setPneusPorKm(String(p.pneusPorKm));
      setTipoCarroceria(p.tipoCarroceria);
    });
  }, []);

  async function handleSalvar() {
    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe a marca e o modelo do caminhão.');
      return;
    }
    const perfil: PerfilCaminhao = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano.trim(),
      dieselKmPorLt: parseNumber(dieselKmPorLt) || 3.5,
      arlaKmPorLt: parseNumber(arlaKmPorLt) || 70,
      depreciacaoPorKm: parseNumber(depreciacaoPorKm) || 0.20,
      manutencaoPorKm: parseNumber(manutencaoPorKm) || 0.15,
      pneusPorKm: parseNumber(pneusPorKm) || 0.10,
      tipoCarroceria,
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
            <InputField
              label="Marca"
              value={marca}
              onChangeText={setMarca}
              placeholder="Ex: Volvo, Scania, Mercedes"
            />
            <InputField
              label="Modelo"
              value={modelo}
              onChangeText={setModelo}
              placeholder="Ex: FH 540, R 450, Actros"
            />
            <InputField
              label="Ano"
              value={ano}
              onChangeText={setAno}
              placeholder="Ex: 2022"
              keyboardType="numeric"
            />
            <Text style={styles.sectionLabel}>Tipo de Carroceria</Text>
            <View style={styles.carroceriaGrid}>
              {TIPOS_CARROCERIA.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.carroceriaOpcao,
                    tipoCarroceria === tipo && styles.carroceriaOpcaoAtiva,
                  ]}
                  onPress={() => setTipoCarroceria(tipo)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.carroceriaTexto,
                      tipoCarroceria === tipo && styles.carroceriaTextoAtivo,
                    ]}
                  >
                    {tipo}
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
            />
          </View>

          {/* Custo por km */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custo por Quilômetro</Text>
            <Text style={styles.cardHint}>Valores médios do seu caminhão rodado</Text>
            <CustoRow
              label="Depreciação"
              value={depreciacaoPorKm}
              onChangeText={setDepreciacaoPorKm}
              unit="R$/km"
            />
            <CustoRow
              label="Manutenção"
              value={manutencaoPorKm}
              onChangeText={setManutencaoPorKm}
              unit="R$/km"
            />
            <CustoRow
              label="Pneus"
              value={pneusPorKm}
              onChangeText={setPneusPorKm}
              unit="R$/km"
            />
          </View>

          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} activeOpacity={0.85}>
            <Text style={styles.btnSalvarText}>SALVAR CAMINHÃO</Text>
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
    marginTop: 4,
    marginBottom: 10,
  },
  carroceriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  carroceriaOpcao: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  carroceriaOpcaoAtiva: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  carroceriaTexto: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  carroceriaTextoAtivo: {
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
});
