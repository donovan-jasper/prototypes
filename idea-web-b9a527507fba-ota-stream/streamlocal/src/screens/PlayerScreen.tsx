import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Share, Platform, ActivityIndicator } from 'react-native';
import { Text, IconButton, Snackbar } from 'react-native-paper';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const foundChannel = channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      setIsFavorite(favorites.some(fav => fav.id === channelId));
    } else {
      setError('Channel not found');
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
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading channel...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
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
          style={styles.backButton}
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
          onError={(errorMessage) => setError(errorMessage)}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 10,
  },
  playerContainer: {
    height: 250,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  channelLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  programTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nextProgram: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: 8,
  },
  programInfo: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  snackbar: {
    backgroundColor: '#333',
  },
});

export default PlayerScreen;
