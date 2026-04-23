import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import DrillSession from '../../components/DrillSession';
import { useStore } from '../../store/useStore';
import { DrillResult } from '../../lib/types';
import { adjustDifficulty } from '../../lib/adaptive';
import { getDrillResults } from '../../lib/database';

export default function Practice() {
  const { currentDrill, startDrill, submitResult, drills, updateStats } = useStore();
  const [result, setResult] = useState<DrillResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentDrill && drills.length > 0) {
      startDrill(drills[0].id);
    }
    setIsLoading(false);
  }, [currentDrill, startDrill, drills]);

  const handleDrillComplete = async (result: DrillResult) => {
    setResult(result);
    await submitResult(result);

    // Get all results for this drill
    const allResults = await getDrillResults(result.drillId);

    // Check if difficulty should increase
    const { shouldAdjust, newDifficulty } = adjustDifficulty(currentDrill!, allResults);

    if (shouldAdjust && currentDrill) {
      const difficultyChange = newDifficulty - currentDrill.difficulty;
      Alert.alert(
        'Difficulty Adjusted',
        `Your performance has ${difficultyChange > 0 ? 'improved' : 'declined'}! ` +
        `Difficulty is now ${Math.round(newDifficulty * 100)}%`,
        [{ text: 'OK' }]
      );
    }

    await updateStats();
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
