import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, stepNames }: ProgressIndicatorProps) {
  const progress = (currentStep + 1) / totalSteps;

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} style={styles.progressBar} />

      <View style={styles.stepsContainer}>
        {stepNames.map((name, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep ? styles.activeStep : styles.inactiveStep
            ]}>
              <Text style={[
                styles.stepNumber,
                index <= currentStep ? styles.activeStepText : styles.inactiveStepText
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepName,
              index <= currentStep ? styles.activeStepText : styles.inactiveStepText
            ]}>
              {name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: '#6200ee',
  },
  inactiveStep: {
    backgroundColor: '#e0e0e0',
  },
  stepNumber: {
    fontWeight: 'bold',
  },
  activeStepText: {
    color: '#6200ee',
  },
  inactiveStepText: {
    color: '#9e9e9e',
  },
  stepName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
