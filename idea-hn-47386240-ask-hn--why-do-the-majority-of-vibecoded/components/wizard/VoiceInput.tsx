import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';
import { parseIntent } from '@/lib/ai/intentParser';
import { suggestComponents } from '@/lib/ai/componentSuggester';
import { createScreen as dbCreateScreen, createComponent as dbCreateComponent } from '@/lib/db/queries';

interface VoiceInputProps {
  onProjectCreated: (projectId: string) => void;
}

export default function VoiceInput({ onProjectCreated }: VoiceInputProps) {
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

      // Simulate transcription with timeout
      setTimeout(async () => {
        const simulatedTranscription = "I want to build a fitness app where users can log workouts and track progress";
        setTranscription(simulatedTranscription);
        setIsTranscribing(false);

        // Create project with the transcribed text
        await createProjectFromDescription(simulatedTranscription);
      }, 2000);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const createProjectFromDescription = async (description: string) => {
    try {
      // Parse intent from description
      const intentResult = await parseIntent(description.trim());
      console.log('Parsed Intent:', intentResult);

      // Suggest components based on intent
      const suggestedScreens = suggestComponents(intentResult);
      console.log('Suggested Screens & Components:', suggestedScreens);

      // Create new project
      const newProject = await addProject({
        name: `Project from "${description.substring(0, 20)}..."`,
        description: description.trim(),
        appType: intentResult.appType,
      });

      // Create screens and components for the new project
      for (let i = 0; i < suggestedScreens.length; i++) {
        const suggestedScreen = suggestedScreens[i];
        const createdScreen = await dbCreateScreen({
          projectId: newProject.id,
          name: suggestedScreen.name,
          order: i,
          layout: {},
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

      // Notify parent component that project was created
      onProjectCreated(newProject.id);
    } catch (error) {
      console.error('Project creation failed:', error);
      Alert.alert('Error', `Failed to create project: ${(error as Error).message}`);
    }
  };

  const handleTextSubmit = async () => {
    if (!transcription.trim()) {
      Alert.alert('Error', 'Please enter your app idea description');
      return;
    }

    setIsTranscribing(true);
    await createProjectFromDescription(transcription);
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
          <Text style={styles.recordingText}>Recording...</Text>
        )}

        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator animating={true} />
            <Text style={styles.transcribingText}>Transcribing...</Text>
          </View>
        )}
      </View>

      <TextInput
        label="Or type your idea here"
        value={transcription}
        onChangeText={setTranscription}
        multiline
        numberOfLines={4}
        style={styles.textInput}
        disabled={isTranscribing}
      />

      <Button
        mode="contained"
        onPress={handleTextSubmit}
        style={styles.submitButton}
        disabled={isTranscribing || !transcription.trim()}
      >
        Create Project
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    paddingHorizontal: 24,
  },
  recordingText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  transcribingText: {
    marginLeft: 8,
  },
  textInput: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
