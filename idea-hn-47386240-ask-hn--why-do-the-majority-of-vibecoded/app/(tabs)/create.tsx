import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import VoiceInput from '@/components/wizard/VoiceInput';
import QuestionFlow from '@/components/wizard/QuestionFlow';
import ProgressIndicator from '@/components/wizard/ProgressIndicator';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';

export default function CreateScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addProject } = useProjectStore();
  const router = useRouter();

  const steps = ['Describe Your Idea', 'Voice Input', 'Refine Details', 'Review'];

  const handleProjectCreated = (id: string) => {
    setProjectId(id);
    setCurrentStep(2);
  };

  const handleProjectSubmitted = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // In a real app, we would save the final project state here
      Alert.alert('Success', 'Your prototype is ready!', [
        {
          text: 'View Project',
          onPress: () => router.replace(`/project/${projectId}`),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <VoiceInput onProjectCreated={handleProjectCreated} />
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

      {currentStep === 2 && projectId && (
        <View style={styles.stepContent}>
          <QuestionFlow
            projectId={projectId}
            onComplete={() => setCurrentStep(3)}
          />
          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              onPress={() => setCurrentStep(1)}
              style={styles.backButton}
            >
              Back
            </Button>
          </View>
        </View>
      )}

      {currentStep === 3 && projectId && (
        <View style={styles.stepContent}>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Review Your Prototype
          </Text>
          <Text variant="bodyMedium" style={styles.stepDescription}>
            Your prototype is ready! You can now view it in the editor or continue refining your answers.
          </Text>
          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              onPress={() => setCurrentStep(2)}
              style={styles.backButton}
            >
              Back
            </Button>
            <Button
              mode="contained"
              onPress={handleProjectSubmitted}
              style={styles.nextButton}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator animating={true} color="#fff" /> : 'View Prototype'}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 16,
    color: '#666',
  },
  nextButton: {
    alignSelf: 'flex-end',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
});
