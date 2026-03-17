import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AudioController as AudioControlService } from '../services/audioControl';
import { DatabaseService } from '../services/database';

export default function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioController] = useState(() => new AudioControlService());
  const [database] = useState(() => new DatabaseService());
  const [rewindAmount, setRewindAmount] = useState(2);

  useEffect(() => {
    audioController.initialize();
    loadSettings();
    checkAudioStatus();
    
    const interval = setInterval(checkAudioStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await database.getUserSettings();
      setRewindAmount(settings.rewindAmount);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkAudioStatus = async () => {
    const playing = await audioController.detectExternalAudio();
    setIsPlaying(playing);
  };

  const handlePause = async () => {
    const success = await audioController.pauseSystemAudio();
    if (success) {
      setIsPlaying(false);
    }
  };

  const handleResume = async () => {
    const success = await audioController.resumeSystemAudio(rewindAmount);
    if (success) {
      setIsPlaying(true);
    }
  };

  const handleRewind = async (seconds: number) => {
    await audioController.resumeSystemAudio(seconds);
    await checkAudioStatus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Audio Control</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: isPlaying ? '#10B981' : '#EF4444' }]} />
        <Text style={styles.statusText}>
          {isPlaying ? 'External audio playing' : 'No audio detected'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.pauseButton]} 
          onPress={handlePause}
          disabled={!isPlaying}
        >
          <Text style={styles.buttonText}>⏸️ Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.playButton]} 
          onPress={handleResume}
          disabled={isPlaying}
        >
          <Text style={styles.buttonText}>▶️ Resume</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rewindContainer}>
        <Text style={styles.rewindLabel}>Quick Rewind</Text>
        <View style={styles.rewindButtons}>
          <TouchableOpacity 
            style={styles.rewindButton} 
            onPress={() => handleRewind(5)}
          >
            <Text style={styles.rewindButtonText}>-5s</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rewindButton} 
            onPress={() => handleRewind(15)}
          >
            <Text style={styles.rewindButtonText}>-15s</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rewindButton} 
            onPress={() => handleRewind(30)}
          >
            <Text style={styles.rewindButtonText}>-30s</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.infoText}>
        Controls audio from any app (Spotify, Audible, Apple Music, etc.)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#EF4444',
  },
  playButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rewindContainer: {
    marginBottom: 16,
  },
  rewindLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  rewindButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rewindButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  rewindButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
