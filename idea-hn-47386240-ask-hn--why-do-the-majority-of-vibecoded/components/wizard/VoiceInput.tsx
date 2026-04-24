import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, IconButton } from 'react-native-paper';
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
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setIsTranscribing(true);

      // In a real app, you would send the audio file to Whisper API
      // For this prototype, we'll simulate transcription
      setTimeout(async () => {
        // Use the actual transcription if available, otherwise use a default
        const finalTranscription = transcription || "I want to build a fitness app where users can log workouts and track progress";
        setTranscription(finalTranscription);
        setIsTranscribing(false);

        // Create project with the transcribed text
        await createProjectFromDescription(finalTranscription);
      }, 2000);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
      setIsTranscribing(false);
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

      <View style={styles.controlContainer}>
        {!isRecording ? (
          <IconButton
            icon="microphone"
            size={40}
            onPress={startRecording}
            disabled={isTranscribing}
            style={styles.microphoneButton}
          />
        ) : (
          <IconButton
            icon="stop"
            size={40}
            onPress={stopRecording}
            style={styles.stopButton}
          />
        )}

        {isRecording && (
          <Text style={styles.recordingText}>Recording...</Text>
        )}
      </View>

      <TextInput
        mode="outlined"
        multiline
        numberOfLines={4}
        value={transcription}
        onChangeText={setTranscription}
        style={styles.textInput}
        placeholder="Or type your app idea description here..."
        editable={!isRecording && !isTranscribing}
      />

      <Button
        mode="contained"
        onPress={handleTextSubmit}
        disabled={isRecording || isTranscribing || !transcription.trim()}
        loading={isTranscribing}
        style={styles.submitButton}
      >
        {isTranscribing ? 'Processing...' : 'Create Prototype'}
      </Button>

      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <ActivityIndicator animating={true} size="small" />
          <Text style={styles.transcribingText}>Transcribing your idea...</Text>
        </View>
      )}
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
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  microphoneButton: {
    backgroundColor: '#6200ee',
  },
  stopButton: {
    backgroundColor: '#ff1744',
  },
  recordingText: {
    marginLeft: 8,
    color: '#ff1744',
    fontWeight: 'bold',
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    marginTop: 8,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  transcribingText: {
    marginLeft: 8,
    color: '#6200ee',
  },
});
