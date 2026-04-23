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

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
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
    }
  };

  const playVoiceNote = async () => {
    if (sound) {
      await sound.replayAsync();
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
            {isRecording ? 'Stop Recording' : 'Add Voice Note'}
          </Text>
        </TouchableOpacity>
      </View>

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
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  voiceButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 5,
  },
  recordingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  playButton: {
    marginRight: 10,
  },
  voiceNoteDuration: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    marginLeft: 10,
  },
});

export default MessageComposer;
