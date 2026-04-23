import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import DrillSession from '../../components/DrillSession';
import { useRouter } from 'expo-router';

const PracticeScreen = () => {
  const { currentDrill, currentSession, submitResult } = useStore();
  const router = useRouter();

  const handleComplete = async (result: any) => {
    await submitResult(result);
  };

  const handleContinue = () => {
    router.push('/(tabs)');
  };

  if (!currentDrill) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDrillText}>No active drill session</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DrillSession
        drill={currentDrill}
        onComplete={handleComplete}
        result={currentSession}
        onContinue={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noDrillText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PracticeScreen;
