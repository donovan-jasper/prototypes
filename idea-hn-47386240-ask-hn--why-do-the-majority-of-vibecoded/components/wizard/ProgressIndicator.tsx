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
      {stepNames.map((name, index) => (
        <View key={index} style={styles.stepContainer}>
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
          {index < stepNames.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStep ? styles.activeLine : styles.inactiveLine
            ]} />
          )}
          <Text style={[
            styles.stepName,
            index <= currentStep ? styles.activeStepText : styles.inactiveStepText
          ]}>
            {name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  activeStepText: {
    color: '#6200ee',
  },
  inactiveStepText: {
    color: '#9e9e9e',
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
  stepName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
