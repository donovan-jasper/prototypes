import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { fetchDailyDigest } from '../../lib/api';
import { useUserStore } from '../../store/useUserStore';
import { Audio } from 'expo-av';

interface DigestHighlight {
  id: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral';
  audioUrl?: string;
}

const DigestScreen = () => {
  const [digest, setDigest] = useState<DigestHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { isPremium } = useUserStore();
  const navigation = useNavigation();

  useEffect(() => {
    loadDigest();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadDigest = async () => {
    try {
      setIsLoading(true);
      const digestData = await fetchDailyDigest();
      setDigest(digestData);
      setError(null);
    } catch (err) {
      setError('Failed to load daily digest. Please try again later.');
      console.error('Error loading digest:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioUrl: string, id: string) => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Audio summaries are available to premium users only.',
        [
          { text: 'OK' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (playingAudioId === id) {
        setPlayingAudioId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingAudioId(id);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return Colors.success;
      case 'negative':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your daily digest...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDigest}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Digest</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      {digest.map((highlight) => (
        <View key={highlight.id} style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Text style={[styles.highlightTitle, { color: getImpactColor(highlight.impact) }]}>
              {highlight.title}
            </Text>
            {highlight.audioUrl && (
              <TouchableOpacity
                onPress={() => playAudio(highlight.audioUrl!, highlight.id)}
                disabled={!isPremium}
              >
                <Ionicons
                  name={playingAudioId === highlight.id ? 'pause-circle' : 'play-circle'}
                  size={24}
                  color={isPremium ? Colors.primary : Colors.gray}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.highlightExplanation}>{highlight.explanation}</Text>
        </View>
      ))}

      {!isPremium && (
        <View style={styles.premiumPrompt}>
          <Text style={styles.premiumText}>Get audio summaries with Premium</Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    marginTop: 16,
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  highlightCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  highlightExplanation: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  premiumPrompt: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumText: {
    color: Colors.primary,
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default DigestScreen;
