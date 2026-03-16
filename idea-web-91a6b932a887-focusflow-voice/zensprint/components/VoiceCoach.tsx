import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { generateCoachingMessage, speakMessage } from '../lib/voice';
import { Ionicons } from '@expo/vector-icons';

const VoiceCoach: React.FC = () => {
  const { currentSession, isPaused } = useStore();
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  useEffect(() => {
    if (!currentSession || isPaused) return;

    const speakAtInterval = (phase: 'start' | 'midpoint' | 'end') => {
      const message = generateCoachingMessage(
        phase,
        currentSession.duration,
        currentSession.voicePack
      );
      setIsSpeaking(true);
      speakMessage(message, currentSession.voicePack).then(() => {
        setIsSpeaking(false);
      });
    };

    // Speak at start
    speakAtInterval('start');

    // Speak at midpoint
    const midpointTimeout = setTimeout(() => {
      speakAtInterval('midpoint');
    }, (currentSession.duration * 60 * 1000) / 2);

    // Speak at end (handled by SessionTimer onComplete)

    return () => {
      clearTimeout(midpointTimeout);
    };
  }, [currentSession, isPaused]);

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
});

export default VoiceCoach;
