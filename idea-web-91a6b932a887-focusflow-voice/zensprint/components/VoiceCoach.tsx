import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { generateCoachingMessage, speakMessage } from '../lib/voice';
import { Ionicons } from '@expo/vector-icons';

interface VoiceCoachProps {
  elapsedSeconds: number;
  sessionDuration: number;
  onSessionComplete?: boolean;
}

const VoiceCoach: React.FC<VoiceCoachProps> = ({ elapsedSeconds, sessionDuration, onSessionComplete }) => {
  const { currentSession } = useStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const lastSpokenPhase = useRef<string | null>(null);

  const speakWithRetry = async (message: string, voicePack: string, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        setIsSpeaking(true);
        setSpeechError(null);
        await speakMessage(message, voicePack);
        setIsSpeaking(false);
        return;
      } catch (error) {
        console.error(`Speech attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) {
          setSpeechError('Voice coach unavailable');
          setIsSpeaking(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  };

  useEffect(() => {
    if (!currentSession) return;

    const midpointSeconds = (sessionDuration * 60) / 2;
    const tolerance = 1;

    if (elapsedSeconds === 0 && lastSpokenPhase.current !== 'start') {
      lastSpokenPhase.current = 'start';
      const message = generateCoachingMessage('start', currentSession.duration, currentSession.voicePack);
      speakWithRetry(message, currentSession.voicePack);
    } else if (
      Math.abs(elapsedSeconds - midpointSeconds) < tolerance &&
      lastSpokenPhase.current !== 'midpoint'
    ) {
      lastSpokenPhase.current = 'midpoint';
      const message = generateCoachingMessage('midpoint', currentSession.duration, currentSession.voicePack);
      speakWithRetry(message, currentSession.voicePack);
    }
  }, [elapsedSeconds, sessionDuration, currentSession]);

  useEffect(() => {
    if (onSessionComplete && currentSession && lastSpokenPhase.current !== 'end') {
      lastSpokenPhase.current = 'end';
      const message = generateCoachingMessage('end', currentSession.duration, currentSession.voicePack);
      speakWithRetry(message, currentSession.voicePack);
    }
  }, [onSessionComplete, currentSession]);

  if (!currentSession) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="mic" size={40} color="#6c5ce7" />
      </View>
      {isSpeaking && (
        <View style={styles.speakingIndicator}>
          <Ionicons name="volume-high" size={20} color="#6c5ce7" />
        </View>
      )}
      {speechError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#d63031" />
          <Text style={styles.errorText}>{speechError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffe5e5',
    borderRadius: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#d63031',
    marginLeft: 5,
  },
});

export default VoiceCoach;
