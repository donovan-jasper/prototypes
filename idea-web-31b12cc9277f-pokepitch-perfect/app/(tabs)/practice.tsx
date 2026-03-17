import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import DrillSession from '../../components/DrillSession';
import { useStore } from '../../store/useStore';
import { DrillResult } from '../../lib/types';

export default function Practice() {
  const { currentDrill, startDrill, submitResult } = useStore();
  const [result, setResult] = useState<DrillResult | null>(null);

  useEffect(() => {
    if (!currentDrill) {
      startDrill('aim-training-1');
    }
  }, [currentDrill, startDrill]);

  const handleDrillComplete = (result: DrillResult) => {
    setResult(result);
    submitResult(result);
  };

  const handleContinue = () => {
    setResult(null);
    if (currentDrill) {
      startDrill(currentDrill.id);
    }
  };

  if (!currentDrill) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <DrillSession
        drill={currentDrill}
        onComplete={handleDrillComplete}
        result={result}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
