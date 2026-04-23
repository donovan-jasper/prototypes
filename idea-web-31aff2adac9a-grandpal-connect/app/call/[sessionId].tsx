import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VideoCall from '../../components/VideoCall';
import { getSessionById, updateSessionStatus, getUserById } from '../../lib/database';

const CallScreen = () => {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [peerUser, setPeerUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (!sessionId) {
          throw new Error('Session ID is required');
        }

        const sessionData = await getSessionById(sessionId as string);
        if (!sessionData) {
          throw new Error('Session not found');
        }

        // Get the peer user (the other participant in the session)
        const peerUserId = sessionData.userId1 === sessionData.currentUserId
          ? sessionData.userId2
          : sessionData.userId1;

        const userData = await getUserById(peerUserId);
        if (!userData) {
          throw new Error('Peer user not found');
        }

        // Update session status to active
        await updateSessionStatus(sessionId as string, 'active');
        setSession(sessionData);
        setPeerUser(userData);
      } catch (error) {
        console.error('Error loading session:', error);
        setError(error instanceof Error ? error.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    return () => {
      // Cleanup function to mark session as completed if it was active
      const cleanup = async () => {
        if (session?.status === 'active') {
          try {
            await updateSessionStatus(sessionId as string, 'completed');
          } catch (error) {
            console.error('Error updating session status:', error);
          }
        }
      };

      cleanup();
    };
  }, [sessionId]);

  const handleEndCall = async () => {
    try {
      if (sessionId) {
        await updateSessionStatus(sessionId as string, 'completed');
      }
      router.back();
    } catch (error) {
      console.error('Error ending call:', error);
      Alert.alert('Error', 'Failed to end call. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading call...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!session || !peerUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Session or peer user not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoCall
        sessionId={session.id}
        peerName={`${peerUser.firstName} ${peerUser.lastName}`}
        onEndCall={handleEndCall}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CallScreen;
