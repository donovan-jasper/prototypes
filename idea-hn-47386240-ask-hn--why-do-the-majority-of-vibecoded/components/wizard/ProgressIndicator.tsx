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
        {stepNames.map((step, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep ? styles.activeStep : styles.inactiveStep,
              ]}
            >
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            {index < stepNames.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep ? styles.activeLine : styles.inactiveLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <View style={styles.labelsContainer}>
        {stepNames.map((step, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              index <= currentStep ? styles.activeLabel : styles.inactiveLabel,
            ]}
            numberOfLines={1}
          >
            {step}
          </Text>
        ))}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#6200ee',
  },
  inactiveStep: {
    backgroundColor: '#e0e0e0',
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: '#6200ee',
  },
  inactiveLine: {
    backgroundColor: '#e0e0e0',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  activeLabel: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  inactiveLabel: {
    color: '#9e9e9e',
  },
});
