import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalisarScreen } from './src/screens/AnalisarScreen';
import { ResultadoScreen } from './src/screens/ResultadoScreen';
import type { EntradaFrete, ResultadoFrete } from './src/types';

type Tela = 'analisar' | 'resultado';

export default function App() {
  const [tela, setTela] = useState<Tela>('analisar');
  const [resultado, setResultado] = useState<ResultadoFrete | null>(null);
  const [preenchimentoInicial, setPreenchimentoInicial] = useState<EntradaFrete | null>(null);

  function handleCalcular(r: ResultadoFrete) {
    setResultado(r);
    setPreenchimentoInicial(null);
    setTela('resultado');
  }

  function handleVoltar() {
    setTela('analisar');
  }

  function handleSimularRetorno() {
    if (!resultado) return;
    setPreenchimentoInicial({ ...resultado.entrada, tipoRetorno: 'comCarga' });
    setTela('analisar');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {tela === 'analisar' ? (
        <AnalisarScreen
          key={preenchimentoInicial ? 'simulacao' : 'novo'}
          onCalcular={handleCalcular}
          initialValues={preenchimentoInicial}
        />
      ) : (
        <ResultadoScreen
          resultado={resultado!}
          onVoltar={handleVoltar}
          onSimularRetorno={handleSimularRetorno}
        />
      )}
    </SafeAreaProvider>
  );
}
