import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import DrillSession from '../../components/DrillSession';
import { useStore } from '../../store/useStore';
import { DrillResult } from '../../lib/types';
import { adjustDifficulty, shouldLevelUp } from '../../lib/adaptive';

export default function Practice() {
  const { currentDrill, startDrill, submitResult, drills, updateStats } = useStore();
  const [result, setResult] = useState<DrillResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);

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
    setDrillResults(allResults);

    // Check if difficulty should increase
    if (shouldLevelUp(allResults)) {
      const updatedDrill = adjustDifficulty(currentDrill!, allResults);
      Alert.alert(
        'Difficulty Increased!',
        `Your performance is improving! The drill difficulty has increased to ${Math.round(updatedDrill.difficulty * 100)}%`,
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

async function getDrillResults(drillId: string): Promise<DrillResult[]> {
  // In a real app, this would query the database
  // For now, we'll return an empty array
  return [];
}
