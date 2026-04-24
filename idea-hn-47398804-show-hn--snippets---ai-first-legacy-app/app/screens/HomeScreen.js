import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import RecordButton from '../components/RecordButton';
import NoteList from '../components/NoteList';
import { Audio } from 'expo-av';
import { initializeDatabase, addNote, getNotes } from '../services/database';

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        await loadNotes();
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    setupDatabase();
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        // For demo purposes, we'll create a simple note
        // In a real app, you would transcribe the audio here
        const title = `Note ${notes.length + 1}`;
        const content = `Transcribed content for recording at ${new Date().toLocaleString()}`;

        const noteId = await addNote(title, content, uri);
        await loadNotes();

        Alert.alert('Success', 'Note saved successfully!');
      } catch (error) {
        console.error('Failed to save recording:', error);
        Alert.alert('Error', 'Failed to save recording');
      }
    } else {
      try {
        setIsRecording(true);
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const handleNotePress = (note) => {
    // Handle note press - could navigate to a detail screen
    console.log('Note pressed:', note);
  };

  return (
    <View style={styles.container}>
      <NoteList notes={notes} onNotePress={handleNotePress} />
      <View style={styles.recordButtonContainer}>
        <RecordButton onPress={handleRecordPress} isRecording={isRecording} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default HomeScreen;
