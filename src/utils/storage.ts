import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PerfilCaminhao } from '../types';

const KEY_PERFIL = 'perfil_caminhao_v1';

export async function salvarPerfil(perfil: PerfilCaminhao): Promise<void> {
  await AsyncStorage.setItem(KEY_PERFIL, JSON.stringify(perfil));
}

export async function carregarPerfil(): Promise<PerfilCaminhao | null> {
  try {
    const json = await AsyncStorage.getItem(KEY_PERFIL);
    return json ? (JSON.parse(json) as PerfilCaminhao) : null;
  } catch {
    return null;
  }
}

export async function limparPerfil(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PERFIL);
}
