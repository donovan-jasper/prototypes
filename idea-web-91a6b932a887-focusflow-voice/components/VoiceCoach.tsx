import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { generateCoachingMessage, getVoicePack } from '../lib/voice';

interface VoiceCoachProps {
  duration: number;
  voicePack: string;
  isPaused: boolean;
}

const VoiceCoach: React.FC<VoiceCoachProps> = ({ duration, voicePack, isPaused }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastPhase, setLastPhase] = useState<'start' | 'midpoint' | 'end' | 'pause' | 'resume'>('start');

  useEffect(() => {
    // Speak initial message when session starts
    speakMessage('start');
  }, []);

  useEffect(() => {
    if (isPaused) {
      speakMessage('pause');
    } else if (lastPhase === 'pause') {
      speakMessage('resume');
    }
  }, [isPaused]);

  const speakMessage = async (phase: 'start' | 'midpoint' | 'end' | 'pause' | 'resume') => {
    try {
      setIsSpeaking(true);
      setLastPhase(phase);
      const message = generateCoachingMessage(phase, duration, voicePack);
      setCurrentMessage(message);

      const pack = getVoicePack(voicePack);
      await Speech.speak(message, {
        language: 'en-US',
        pitch: pack.pitch,
        rate: pack.rate,
      });
    } catch (error) {
      console.error('Failed to speak message', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // Schedule midpoint message
    if (duration > 1) {
      const midpointTime = (duration * 60 * 1000) / 2;
      const timer = setTimeout(() => {
        speakMessage('midpoint');
      }, midpointTime);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{currentMessage}</Text>
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.speakingText}>Coach is speaking...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    maxWidth: '90%',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  speakingText: {
    marginLeft: 8,
    color: '#A5D6A7',
    fontSize: 14,
  },
});

export default VoiceCoach;
