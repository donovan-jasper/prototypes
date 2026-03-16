import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Video } from 'expo-av';
import CallControls from '../../components/CallControls';

const CallScreen = () => {
  const { connectionId } = useLocalSearchParams();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnection = async () => {
      try {
        // Mock API call
        const mockConnection = {
          id: connectionId,
          userId: 'user1',
          matchId: 'user2',
          status: 'active',
          createdAt: Date.now(),
        };
        setConnection(mockConnection);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnection();
  }, [connectionId]);

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>Error: {error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: 'https://example.com/video.mp4' }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        style={styles.video}
      />
      <CallControls connectionId={connectionId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    flex: 1,
    width: '100%',
  },
});

export default CallScreen;
