import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import VideoPlayer from '../components/VideoPlayer';
import { AppContext } from '../context/AppContext';

interface PlayerScreenProps {
  route: {
    params: {
      channelId: string;
    };
  };
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route }) => {
  const { channels } = useContext(AppContext);
  const { channelId } = route.params;
  const [channel, setChannel] = useState<{ id: string; name: string; streamUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundChannel = channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
    }
    setIsLoading(false);
  }, [channelId, channels]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorContainer}>
        <Text>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoPlayer streamUrl={channel.streamUrl} />
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
  },
});

export default PlayerScreen;
