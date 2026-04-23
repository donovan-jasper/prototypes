import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SessionTimer from '../../components/SessionTimer';
import { sessionManager } from '../../lib/session/sessionManager';
import { cueScheduler } from '../../lib/session/cueScheduler';
import { soundscapeManager } from '../../lib/audio/soundscapeManager';

const SessionScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!id) return;

      const loadedSession = await sessionManager.getSession(id);
      if (loadedSession) {
        setSession(loadedSession);
        cueScheduler.initialize(loadedSession);

        if (loadedSession.soundscapeId) {
          await soundscapeManager.loadSoundscape(loadedSession.soundscapeId);
          soundscapeManager.playAmbient();
        }

        await sessionManager.startSession(id);
        cueScheduler.start();
      }
      setIsLoading(false);
    };

    loadSession();

    return () => {
      soundscapeManager.stopAll();
      cueScheduler.stop();
    };
  }, [id]);

  const handleComplete = async () => {
    if (!session) return;

    Alert.alert(
      'Session Complete',
      'How would you rate your energy level?',
      [
        { text: '1', onPress: () => completeSession(1) },
        { text: '2', onPress: () => completeSession(2) },
        { text: '3', onPress: () => completeSession(3) },
        { text: '4', onPress: () => completeSession(4) },
        { text: '5', onPress: () => completeSession(5) },
      ],
      { cancelable: false }
    );
  };

  const completeSession = async (rating: number) => {
    if (!session) return;

    await sessionManager.completeSession(session.id, rating);
    soundscapeManager.stopAll();
    cueScheduler.stop();
    router.push('/(tabs)/analytics');
  };

  const handleInterrupt = async () => {
    if (!session) return;

    await sessionManager.interruptSession(session.id);
    soundscapeManager.stopAll();
    cueScheduler.stop();
    router.push('/(tabs)/sessions');
  };

  if (isLoading || !session) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      <SessionTimer
        sessionId={session.id}
        durationMinutes={session.durationMinutes}
        onComplete={handleComplete}
        onInterrupt={handleInterrupt}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default SessionScreen;
