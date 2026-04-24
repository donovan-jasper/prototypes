import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, stepNames }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {stepNames.map((stepName, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={index} style={styles.stepContainer}>
              <View style={[
                styles.stepCircle,
                isActive && styles.activeStep,
                isCompleted && styles.completedStep
              ]}>
                {isCompleted ? (
                  <Text style={styles.stepText}>✓</Text>
                ) : (
                  <Text style={styles.stepText}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                isActive && styles.activeLabel
              ]}>
                {stepName}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / (totalSteps - 1)) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: '#6200ee',
  },
  completedStep: {
    backgroundColor: '#4caf50',
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
});
