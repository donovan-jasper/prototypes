import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import DrillSession from '../../components/DrillSession';
import { useStore } from '../../store/useStore';
import { DrillResult } from '../../lib/types';
import { adjustDifficulty } from '../../lib/adaptive';

export default function Practice() {
  const { currentDrill, startDrill, submitResult, drills } = useStore();
  const [result, setResult] = useState<DrillResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentDrill && drills.length > 0) {
      startDrill(drills[0].id);
    }
    setIsLoading(false);
  }, [currentDrill, startDrill, drills]);

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!currentDrill) {
    return (
      <View style={styles.container}>
        <Text>No drills available</Text>
      </View>
    );
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
