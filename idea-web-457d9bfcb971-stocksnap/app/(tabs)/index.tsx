import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchDailyDigest } from '../../lib/api';
import { useUserStore } from '../../store/useUserStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import SubscriptionPrompt from '../../components/SubscriptionPrompt';

interface DigestHighlight {
  id: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral';
  audioUrl?: string;
}

const DailyDigestScreen = () => {
  const navigation = useNavigation();
  const { isPremium } = useUserStore();
  const [digest, setDigest] = useState<DigestHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  useEffect(() => {
    const loadDigest = async () => {
      try {
        const data = await fetchDailyDigest();
        setDigest(data);
      } catch (error) {
        console.error('Failed to load daily digest:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDigest();
  }, []);

  const handlePlayAudio = (audioUrl: string) => {
    if (!isPremium) {
      setShowSubscriptionPrompt(true);
      return;
    }
    // In a real app, this would play the audio
    console.log('Playing audio:', audioUrl);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your Daily Digest...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Digest</Text>
        <Text style={styles.subtitle}>Your 3 key market highlights</Text>
      </View>

      {digest.map((highlight) => (
        <View key={highlight.id} style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <View style={[
              styles.impactIndicator,
              highlight.impact === 'positive' && styles.positive,
              highlight.impact === 'negative' && styles.negative,
              highlight.impact === 'neutral' && styles.neutral
            ]} />
            <Text style={styles.highlightTitle}>{highlight.title}</Text>
            {highlight.audioUrl && (
              <TouchableOpacity
                onPress={() => handlePlayAudio(highlight.audioUrl!)}
                style={styles.audioButton}
              >
                <Ionicons
                  name={isPremium ? "play-circle" : "lock-closed"}
                  size={24}
                  color={isPremium ? Colors.primary : Colors.gray}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.highlightExplanation}>{highlight.explanation}</Text>
        </View>
      ))}

      <SubscriptionPrompt
        visible={showSubscriptionPrompt}
        onClose={() => setShowSubscriptionPrompt(false)}
        onUpgrade={() => navigation.navigate('Profile')}
      />
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
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  highlightCard: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  positive: {
    backgroundColor: Colors.success,
  },
  negative: {
    backgroundColor: Colors.error,
  },
  neutral: {
    backgroundColor: Colors.warning,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  audioButton: {
    padding: 4,
  },
  highlightExplanation: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});

export default DailyDigestScreen;
