import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SubmissionProgressTracker = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submission Progress</Text>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={[
              styles.stepIndicator,
              step.status === 'completed' && styles.stepCompleted,
              step.status === 'in-progress' && styles.stepInProgress,
              step.status === 'failed' && styles.stepFailed
            ]}>
              {step.status === 'completed' && (
                <Text style={styles.stepCheckmark}>✓</Text>
              )}
              {step.status === 'failed' && (
                <Text style={styles.stepFailedIcon}>✗</Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              step.status === 'completed' && styles.stepTitleCompleted,
              step.status === 'in-progress' && styles.stepTitleInProgress,
              step.status === 'failed' && styles.stepTitleFailed
            ]}>
              {step.title}
            </Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                step.status === 'completed' && styles.stepConnectorCompleted
              ]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepInProgress: {
    backgroundColor: '#FFC107',
  },
  stepFailed: {
    backgroundColor: '#FF3B30',
  },
  stepCheckmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepFailedIcon: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
  },
  stepTitleCompleted: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  stepTitleInProgress: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  stepTitleFailed: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  stepConnector: {
    position: 'absolute',
    top: 15,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  stepConnectorCompleted: {
    backgroundColor: '#4CAF50',
  },
});

export default SubmissionProgressTracker;
