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
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={4}
          value={transcription}
          onChangeText={setTranscription}
          style={styles.textInput}
          placeholder="Type your app idea here or use voice input..."
          disabled={isRecording || isTranscribing}
        />

        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <IconButton
              icon="microphone"
              size={30}
              onPress={startRecording}
              disabled={isTranscribing}
              style={styles.recordButton}
            />
          ) : (
            <IconButton
              icon="stop"
              size={30}
              onPress={stopRecording}
              style={styles.stopButton}
            />
          )}

          <Button
            mode="contained"
            onPress={handleTextSubmit}
            disabled={isRecording || isTranscribing || !transcription.trim()}
            style={styles.submitButton}
          >
            {isTranscribing ? (
              <>
                <ActivityIndicator animating={true} color="#fff" />
                <Text style={styles.buttonText}>Processing...</Text>
              </>
            ) : 'Create Prototype'}
          </Button>
        </View>
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  controlContainer: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordButton: {
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  stopButton: {
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
  },
  recordingIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  recordingText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
});
