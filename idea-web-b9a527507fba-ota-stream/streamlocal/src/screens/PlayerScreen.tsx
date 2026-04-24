import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text, IconButton } from 'react-native-paper';
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
  const { channels, favorites, addFavorite, removeFavorite } = useContext(AppContext);
  const { channelId } = route.params;
  const [channel, setChannel] = useState<{
    id: string;
    name: string;
    streamUrl: string;
    logoUrl: string;
    currentProgram: string;
    nextProgram: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const foundChannel = channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      setIsFavorite(favorites.some(fav => fav.id === channelId));
    }
    setIsLoading(false);
  }, [channelId, channels, favorites]);

  const toggleFavorite = () => {
    if (!channel) return;
    if (isFavorite) {
      removeFavorite(channel.id);
    } else {
      addFavorite(channel);
    }
    setIsFavorite(!isFavorite);
  };

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
      {/* Header with channel info */}
      <View style={styles.header}>
        <Image source={{ uri: channel.logoUrl }} style={styles.channelLogo} />
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.programTitle}>{channel.currentProgram}</Text>
          <Text style={styles.nextProgram}>Next: {channel.nextProgram}</Text>
        </View>
        <IconButton
          icon={isFavorite ? 'star' : 'star-outline'}
          size={24}
          onPress={toggleFavorite}
          style={styles.favoriteButton}
        />
      </View>

      {/* Video Player */}
      <View style={styles.playerContainer}>
        <VideoPlayer streamUrl={channel.streamUrl} />
      </View>

      {/* Basic Controls */}
      <View style={styles.controls}>
        <IconButton
          icon="play"
          size={24}
          onPress={() => {}}
          style={styles.controlButton}
        />
        <IconButton
          icon="pause"
          size={24}
          onPress={() => {}}
          style={styles.controlButton}
        />
        <IconButton
          icon="fullscreen"
          size={24}
          onPress={() => {}}
          style={styles.controlButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  channelLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  programTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  nextProgram: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  favoriteButton: {
    marginLeft: 'auto',
  },
  playerContainer: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  controlButton: {
    marginHorizontal: 16,
  },
});

export default PlayerScreen;
