import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { fetchDailyDigest } from '../lib/api';

interface DigestHighlight {
  id: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral';
  change?: number;
  audioUrl?: string;
}

const DailyDigest: React.FC = () => {
  const [highlights, setHighlights] = useState<DigestHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDigest = async () => {
      try {
        setIsLoading(true);
        const digestData = await fetchDailyDigest();
        setHighlights(digestData);
        setError(null);
      } catch (err) {
        setError('Failed to load daily digest. Please try again later.');
        console.error('Error loading digest:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDigest();
  }, []);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <Ionicons name="arrow-up-circle" size={24} color={Colors.success} />;
      case 'negative':
        return <Ionicons name="arrow-down-circle" size={24} color={Colors.danger} />;
      default:
        return <Ionicons name="ellipse" size={24} color={Colors.warning} />;
    }
  };

  const getChangeText = (change?: number) => {
    if (!change) return null;

    const formattedChange = change.toFixed(2);
    const isPositive = change > 0;

    return (
      <Text style={[styles.changeText, isPositive ? styles.positiveChange : styles.negativeChange]}>
        {isPositive ? '+' : ''}{formattedChange}%
      </Text>
    );
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
        <Ionicons name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Market Digest</Text>
        <Text style={styles.subtitle}>3 key highlights to start your day</Text>
      </View>

      {highlights.map((highlight) => (
        <View key={highlight.id} style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            {getImpactIcon(highlight.impact)}
            <Text style={styles.highlightTitle}>{highlight.title}</Text>
            {getChangeText(highlight.change)}
          </View>
          <Text style={styles.highlightExplanation}>{highlight.explanation}</Text>

          {highlight.audioUrl && (
            <TouchableOpacity style={styles.audioButton}>
              <Ionicons name="headset" size={20} color={Colors.primary} />
              <Text style={styles.audioButtonText}>Listen to summary</Text>
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
    backgroundColor: Colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom: 16,
    shadowColor: Colors.shadow,
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
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  highlightExplanation: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveChange: {
    color: Colors.success,
  },
  negativeChange: {
    color: Colors.danger,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default DailyDigest;
