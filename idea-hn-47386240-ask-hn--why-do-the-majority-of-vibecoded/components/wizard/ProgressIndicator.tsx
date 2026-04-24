import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, stepNames }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep ? styles.activeStep : styles.inactiveStep,
              ]}
            >
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            {stepNames && (
              <Text style={[
                styles.stepLabel,
                index <= currentStep ? styles.activeLabel : styles.inactiveLabel,
              ]}>
                {stepNames[index]}
              </Text>
            )}
            {index < totalSteps - 1 && (
              <View style={[
                styles.stepConnector,
                index < currentStep ? styles.activeConnector : styles.inactiveConnector,
              ]} />
            )}
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
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    position: 'relative',
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
    color: 'white',
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  inactiveLabel: {
    color: '#9e9e9e',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: 32,
    right: -32,
    height: 2,
  },
  activeConnector: {
    backgroundColor: '#6200ee',
  },
  inactiveConnector: {
    backgroundColor: '#e0e0e0',
  },
});
