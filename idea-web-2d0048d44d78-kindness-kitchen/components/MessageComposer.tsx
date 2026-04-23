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

          <View style={styles.voiceNoteActions}>
            <TouchableOpacity
              style={styles.voiceNoteActionButton}
              onPress={playVoiceNote}
            >
              <Ionicons name="play" size={20} color="#FF6B6B" />
              <Text style={styles.voiceNoteActionText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voiceNoteActionButton}
              onPress={deleteVoiceNote}
            >
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={styles.voiceNoteActionText}>Delete</Text>
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
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 14,
    color: '#666',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  voiceButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
  },
  recordingButtonText: {
    color: '#fff',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#FF6B6B10',
    borderRadius: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
  recordingText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  voiceNoteContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  voiceNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voiceNoteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  voiceNoteDuration: {
    fontSize: 14,
    color: '#666',
  },
  voiceNoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceNoteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  voiceNoteActionText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default MessageComposer;
