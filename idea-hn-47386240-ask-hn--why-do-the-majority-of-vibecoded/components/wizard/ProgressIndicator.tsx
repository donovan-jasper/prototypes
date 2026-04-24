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
          <Text style={[
            styles.stepName,
            index <= currentStep ? styles.activeStepText : styles.inactiveStepText
          ]}>
            {name}
          </Text>
          {index < totalSteps - 1 && (
            <View style={[
              styles.connector,
              index < currentStep ? styles.activeConnector : styles.inactiveConnector
            ]} />
          )}
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
    paddingHorizontal: 16,
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
  connector: {
    position: 'absolute',
    top: 15,
    left: '50%',
    right: '-50%',
    height: 2,
  },
  activeConnector: {
    backgroundColor: '#6200ee',
  },
  inactiveConnector: {
    backgroundColor: '#e0e0e0',
  },
});
