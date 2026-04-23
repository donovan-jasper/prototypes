import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const MessageComposer = ({ onMessageChange, maxLength = 500 }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [voiceNoteUri, setVoiceNoteUri] = useState(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [sound, recordingInterval]);

  const handleTextChange = (text) => {
    if (text.length <= maxLength) {
      setMessage(text);
      onMessageChange(text);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable microphone access in settings');
        return;
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
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceNoteUri(uri);
      setIsRecording(false);

      // Get duration
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      setVoiceNoteDuration(status.durationMillis);
      setSound(sound);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playVoiceNote = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (err) {
        console.error('Failed to play voice note', err);
        Alert.alert('Error', 'Failed to play voice note');
      }
    }
  };

  const deleteVoiceNote = () => {
    setVoiceNoteUri(null);
    setVoiceNoteDuration(0);
    if (sound) {
      sound.unloadAsync();
    }
  };

  const formatDuration = (millis) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a personal message</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Write your message..."
        value={message}
        onChangeText={handleTextChange}
        multiline
        numberOfLines={6}
        maxLength={maxLength}
      />

      <View style={styles.footer}>
        <Text style={styles.charCount}>
          {message.length} / {maxLength}
        </Text>

        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.recordingButton
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isRecording && recordingTime >= 60}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={20}
            color={isRecording ? '#fff' : '#FF6B6B'}
          />
          <Text style={[
            styles.voiceButtonText,
            isRecording && styles.recordingButtonText
          ]}>
            {isRecording ? `Stop (${formatRecordingTime(recordingTime)})` : 'Add Voice Note'}
          </Text>
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      {voiceNoteUri && (
        <View style={styles.voiceNoteContainer}>
          <TouchableOpacity onPress={playVoiceNote} style={styles.playButton}>
            <Ionicons name="play-circle" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.voiceNoteDuration}>
            Voice Note: {formatDuration(voiceNoteDuration)}
          </Text>
          <TouchableOpacity onPress={deleteVoiceNote} style={styles.deleteButton}>
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: '#666',
    fontSize: 14,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  voiceButtonText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontSize: 14,
  },
  recordingButtonText: {
    color: '#fff',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginRight: 5,
  },
  recordingText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  playButton: {
    marginRight: 15,
  },
  voiceNoteDuration: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 5,
  },
});

export default MessageComposer;
