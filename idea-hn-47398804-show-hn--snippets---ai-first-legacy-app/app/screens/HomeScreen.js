import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import RecordButton from '../components/RecordButton';
import NoteList from '../components/NoteList';
import { Audio } from 'expo-av';

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // Load notes from SQLite
    // This is a placeholder; replace with actual SQLite logic
    const loadNotes = async () => {
      // Example notes
      const exampleNotes = [
        { id: '1', title: 'Note 1', date: '2023-01-01' },
        { id: '2', title: 'Note 2', date: '2023-01-02' },
      ];
      setNotes(exampleNotes);
    };

    loadNotes();
  }, []);

  const handleRecordPress = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      // Here you would transcribe the recording using Whisper and save it to SQLite
    } else {
      // Start recording
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
      console.log('Recording started');
    }
  };

  const handleNotePress = (note) => {
    // Handle note press
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
