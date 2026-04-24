import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';
import { parseIntent } from '@/lib/ai/intentParser';
import { suggestComponents } from '@/lib/ai/componentSuggester';
import { createScreen as dbCreateScreen, createComponent as dbCreateComponent } from '@/lib/db/queries';

export default function VoiceInput() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const { addProject } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setIsTranscribing(true);

      // Here you would typically send the audio to a transcription service
      // For this prototype, we'll simulate it with a timeout
      setTimeout(async () => {
        // Simulate transcription result
        const simulatedTranscription = "I want to build a fitness app where users can log workouts and track progress";
        setTranscription(simulatedTranscription);
        setIsTranscribing(false);

        // Automatically create project with the transcribed text
        await createProjectFromDescription(simulatedTranscription);
      }, 2000);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const createProjectFromDescription = async (description: string) => {
    try {
      // 1. Call parseIntent
      const intentResult = await parseIntent(description.trim());
      console.log('Parsed Intent:', intentResult);

      // 2. Use results from parseIntent to call suggestComponents
      const suggestedScreens = suggestComponents(intentResult);
      console.log('Suggested Screens & Components:', suggestedScreens);

      // 3. Orchestrate the creation of the new project
      const newProject = await addProject({
        name: `Project from "${description.substring(0, 20)}..."`,
        description: description.trim(),
        appType: intentResult.appType, // Use AI-determined app type
      });

      // Create screens and components for the new project
      for (let i = 0; i < suggestedScreens.length; i++) {
        const suggestedScreen = suggestedScreens[i];
        const createdScreen = await dbCreateScreen({
          projectId: newProject.id,
          name: suggestedScreen.name,
          order: i,
          layout: {}, // Layout can be empty for now, or filled with AI suggestions later
        });

        for (let j = 0; j < suggestedScreen.components.length; j++) {
          const suggestedComponent = suggestedScreen.components[j];
          await dbCreateComponent({
            screenId: createdScreen.id,
            type: suggestedComponent.type,
            props: suggestedComponent.props,
            position: suggestedComponent.position,
            order: j,
          });
        }
      }

      // 4. Navigate to the new project
      router.replace(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Project creation failed:', error);
      Alert.alert('Error', `Failed to create project: ${(error as Error).message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Describe Your App Idea
      </Text>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={isRecording ? stopRecording : startRecording}
          icon={isRecording ? 'stop' : 'microphone'}
          style={styles.recordButton}
          disabled={isTranscribing}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        {isRecording && (
          <Text style={styles.recordingIndicator}>
            Recording... {Math.floor(recording?.getStatusAsync().durationMillis / 1000)}s
          </Text>
        )}

        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color="#6200ee" />
            <Text style={styles.transcribingText}>Transcribing...</Text>
          </View>
        )}
      </View>

      <TextInput
        label="Your Description"
        value={transcription}
        onChangeText={setTranscription}
        mode="outlined"
        multiline
        numberOfLines={6}
        style={styles.textArea}
        placeholder="Describe your app idea in detail. What problem does it solve? Who is it for? What are the key features?"
        disabled={isRecording || isTranscribing}
      />

      <Button
        mode="contained"
        onPress={() => createProjectFromDescription(transcription)}
        style={styles.createButton}
        disabled={!transcription.trim() || isRecording || isTranscribing}
      >
        Create Project
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButton: {
    marginBottom: 8,
  },
  recordingIndicator: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  transcribingText: {
    marginLeft: 8,
    color: '#6200ee',
  },
  textArea: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
});
