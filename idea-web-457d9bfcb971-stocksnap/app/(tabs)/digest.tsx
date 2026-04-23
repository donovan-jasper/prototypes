import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../store/useUserStore';
import { fetchDailyDigest } from '../../lib/api';
import { saveDigest, getSavedDigest } from '../../lib/database';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isPremium } = useUserStore();
  const navigation = useNavigation();

  useEffect(() => {
    const loadDigest = async () => {
      try {
        // Try to get saved digest first
        const savedDigest = await getSavedDigest();
        if (savedDigest && savedDigest.length > 0) {
          setDigest(savedDigest);
          setIsLoading(false);
          return;
        }

        // If no saved digest, fetch from API
        const freshDigest = await fetchDailyDigest();
        setDigest(freshDigest);
        await saveDigest(freshDigest);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load digest');
      } finally {
        setIsLoading(false);
      }
    };

    loadDigest();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async (audioUrl: string) => {
    if (!isPremium) {
      navigation.navigate('PremiumUpgrade');
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            // Reload digest
            const loadDigest = async () => {
              try {
                const freshDigest = await fetchDailyDigest();
                setDigest(freshDigest);
                await saveDigest(freshDigest);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load digest');
              } finally {
                setIsLoading(false);
              }
            };
            loadDigest();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Market Digest</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

      {digest.map((highlight) => (
        <View key={highlight.id} style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Text style={styles.highlightTitle}>{highlight.title}</Text>
            {highlight.impact === 'positive' && (
              <Ionicons name="arrow-up-circle" size={24} color={Colors.success} />
            )}
            {highlight.impact === 'negative' && (
              <Ionicons name="arrow-down-circle" size={24} color={Colors.error} />
            )}
            {highlight.impact === 'neutral' && (
              <Ionicons name="ellipse" size={24} color={Colors.warning} />
            )}
          </View>

          <Text style={styles.highlightExplanation}>{highlight.explanation}</Text>

          {highlight.audioUrl && isPremium && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => isPlaying ? stopAudio() : playAudio(highlight.audioUrl!)}
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.audioButtonText}>
                {isPlaying ? 'Pause Audio' : 'Listen to Explanation'}
              </Text>
            </TouchableOpacity>
          )}

          {!isPremium && highlight.audioUrl && (
            <TouchableOpacity
              style={styles.premiumAudioButton}
              onPress={() => navigation.navigate('PremiumUpgrade')}
            >
              <Ionicons name="lock-closed" size={16} color={Colors.primary} />
              <Text style={styles.premiumAudioButtonText}>Unlock Audio with Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  highlightCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    color: Colors.text,
    flex: 1,
  },
  highlightExplanation: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  audioButtonText: {
    color: Colors.primary,
    marginLeft: 8,
    fontSize: 16,
  },
  premiumAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    justifyContent: 'center',
  },
  premiumAudioButtonText: {
    color: Colors.primary,
    marginLeft: 4,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
});

export default DigestScreen;
