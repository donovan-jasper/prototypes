import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Share, Platform } from 'react-native';
import { ActivityIndicator, Text, IconButton, Snackbar } from 'react-native-paper';
import VideoPlayer from '../components/VideoPlayer';
import { AppContext } from '../context/AppContext';
import * as Cast from 'expo-cast';

interface PlayerScreenProps {
  route: {
    params: {
      channelId: string;
    };
  };
  navigation: any;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
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
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    const foundChannel = channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      setIsFavorite(favorites.some(fav => fav.id === channelId));
    }
    setIsLoading(false);

    // Set up Chromecast listener
    const subscription = Cast.addCastStateListener((state) => {
      setIsCasting(state === Cast.CastState.Connected);
    });

    return () => {
      subscription.remove();
    };
  }, [channelId, channels, favorites]);

  const toggleFavorite = () => {
    if (!channel) return;
    if (isFavorite) {
      removeFavorite(channel.id);
      setSnackbarMessage(`${channel.name} removed from favorites`);
    } else {
      addFavorite(channel);
      setSnackbarMessage(`${channel.name} added to favorites`);
    }
    setIsFavorite(!isFavorite);
    setSnackbarVisible(true);
  };

  const handleShare = async () => {
    if (!channel) return;

    try {
      const result = await Share.share({
        message: `I'm watching ${channel.name} live on StreamLocal! ${channel.currentProgram}`,
        url: Platform.OS === 'ios' ? 'https://streamlocal.app' : undefined,
        title: `Watching ${channel.name}`,
      });

      if (result.action === Share.sharedAction) {
        setSnackbarMessage('Shared successfully!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to share');
      setSnackbarVisible(true);
    }
  };

  const toggleCast = async () => {
    if (isCasting) {
      await Cast.stopCast();
    } else {
      await Cast.startCast();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading channel...</Text>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Channel not found</Text>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.playerContainer}>
        <VideoPlayer
          streamUrl={channel.streamUrl}
          channelName={channel.name}
          currentProgram={channel.currentProgram}
        />
      </View>

      {/* Header with channel info */}
      <View style={styles.header}>
        <Image source={{ uri: channel.logoUrl }} style={styles.channelLogo} />
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.programTitle}>{channel.currentProgram}</Text>
          <Text style={styles.nextProgram}>Next: {channel.nextProgram}</Text>
        </View>
        <View style={styles.headerButtons}>
          <IconButton
            icon={isFavorite ? 'star' : 'star-outline'}
            size={24}
            onPress={toggleFavorite}
            style={styles.favoriteButton}
          />
          <IconButton
            icon="share-variant"
            size={24}
            onPress={handleShare}
          />
          <IconButton
            icon={isCasting ? 'cast-connected' : 'cast'}
            size={24}
            onPress={toggleCast}
          />
        </View>
      </View>

      {/* Program Info */}
      <View style={styles.programInfo}>
        <Text style={styles.sectionTitle}>Now Playing</Text>
        <Text style={styles.programDescription}>{channel.currentProgram}</Text>
        <Text style={styles.sectionTitle}>Next Up</Text>
        <Text style={styles.programDescription}>{channel.nextProgram}</Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
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
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: 8,
  },
  playerContainer: {
    flex: 1,
  },
  programInfo: {
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  programDescription: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  snackbar: {
    backgroundColor: '#333',
  },
});

export default PlayerScreen;
