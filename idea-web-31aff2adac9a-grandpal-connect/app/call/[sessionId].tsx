import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VideoCall from '../../components/VideoCall';
import { getSessionById } from '../../lib/database';

const CallScreen = () => {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSessionById(sessionId as string);
        if (!sessionData) {
          Alert.alert('Error', 'Session not found');
          router.back();
          return;
        }
        setSession(sessionData);
      } catch (error) {
        console.error('Error loading session:', error);
        Alert.alert('Error', 'Failed to load session');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading call...</Text>
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <VideoCall
        sessionId={session.id}
        peerName={session.peerName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CallScreen;
