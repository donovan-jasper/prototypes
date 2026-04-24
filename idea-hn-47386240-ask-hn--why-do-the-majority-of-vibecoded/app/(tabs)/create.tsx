import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import VoiceInput from '@/components/wizard/VoiceInput';
import ProgressIndicator from '@/components/wizard/ProgressIndicator';

export default function CreateScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Describe Your Idea', 'Voice Input', 'Review'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Create New Project
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Turn your idea into a working prototype in minutes
        </Text>
      </View>

      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
        stepNames={steps}
      />

      {currentStep === 0 && (
        <View style={styles.stepContent}>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Describe Your App Idea
          </Text>
          <Text variant="bodyMedium" style={styles.stepDescription}>
            Tell us about your app concept. Be as detailed as possible about what problem it solves, who it's for, and what key features you envision.
          </Text>
          <Button
            mode="contained"
            onPress={() => setCurrentStep(1)}
            style={styles.nextButton}
          >
            Next
          </Button>
        </View>
      )}

      {currentStep === 1 && (
        <View style={styles.stepContent}>
          <VoiceInput />
          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              onPress={() => setCurrentStep(0)}
              style={styles.backButton}
            >
              Back
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 16,
    color: '#666',
  },
  nextButton: {
    marginTop: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
});
