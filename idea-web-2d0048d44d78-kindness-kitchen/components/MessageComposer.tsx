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
          <View style={styles.voiceNoteHeader}>
            <Text style={styles.voiceNoteTitle}>Voice Note</Text>
            <Text style={styles.voiceNoteDuration}>{formatDuration(voiceNoteDuration)}</Text>
          </View>

          <View style={styles.voiceNoteControls}>
            <TouchableOpacity
              style={styles.voiceNoteButton}
              onPress={playVoiceNote}
            >
              <Ionicons name="play" size={20} color="#FF6B6B" />
              <Text style={styles.voiceNoteButtonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voiceNoteButton, styles.deleteButton]}
              onPress={deleteVoiceNote}
            >
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={[styles.voiceNoteButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  charCount: {
    fontSize: 14,
    color: '#666',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  voiceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF6B6B',
  },
  recordingButtonText: {
    color: '#fff',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  voiceNoteContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  voiceNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  voiceNoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voiceNoteDuration: {
    fontSize: 14,
    color: '#666',
  },
  voiceNoteControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButton: {
    borderColor: '#FF6B6B',
  },
  voiceNoteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
});

export default MessageComposer;
