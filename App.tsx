import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalisarScreen } from './src/screens/AnalisarScreen';
import { ResultadoScreen } from './src/screens/ResultadoScreen';
import type { ResultadoFrete } from './src/types';

type Tela = 'analisar' | 'resultado';

export default function App() {
  const [tela, setTela] = useState<Tela>('analisar');
  const [resultado, setResultado] = useState<ResultadoFrete | null>(null);

  function handleCalcular(r: ResultadoFrete) {
    setResultado(r);
    setTela('resultado');
  }

  function handleVoltar() {
    setTela('analisar');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {tela === 'analisar' ? (
        <AnalisarScreen onCalcular={handleCalcular} />
      ) : (
        <ResultadoScreen resultado={resultado!} onVoltar={handleVoltar} />
      )}
    </SafeAreaProvider>
  );
}
