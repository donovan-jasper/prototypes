import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMatches } from '../../hooks/useMatches';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import Colors from '../../constants/Colors';
import { ConversationStarter } from '../../components/ConversationStarter';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { matches, loading, sendMessage, fetchMatchDetails } = useMatches();
  const { trackInteraction } = useBehaviorTracking();
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const match = matches.find(m => m.id === id);

  useEffect(() => {
    if (match) {
      trackInteraction('view_match_detail', {
        matchId: match.id,
        compatibilityScore: match.compatibilityScore
      });

      const loadDetails = async () => {
        try {
          const details = await fetchMatchDetails(match.id);
          setMatchDetails(details);
        } catch (error) {
          console.error('Error loading match details:', error);
        } finally {
          setDetailsLoading(false);
        }
      };

      loadDetails();
    }
  }, [match]);

  const handleSendStarter = (message: string) => {
    if (match) {
      sendMessage(match.id, message);
      trackInteraction('send_conversation_starter', {
        matchId: match.id,
        message
      });
    }
  };

  const handleMessagePress = () => {
    if (match) {
      trackInteraction('navigate_to_chat', { matchId: match.id });
      router.push(`/chat/${match.id}`);
    }
  };

  if (loading || detailsLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Match not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.matchName}>{match.name}</Text>
          <Text style={styles.compatibilityScore}>
            Compatibility: {Math.round(match.compatibilityScore)}%
          </Text>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Compatibility Insights</Text>
          {matchDetails?.insights?.map((insight: any, index: number) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.starterContainer}>
          <Text style={styles.sectionTitle}>Conversation Starter</Text>
          <ConversationStarter
            matchId={match.id}
            onSend={handleSendStarter}
            onCopy={() => trackInteraction('copy_conversation_starter', { matchId: match.id })}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessagePress}
            accessibilityLabel="Start messaging this match"
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  matchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'System',
  },
  compatibilityScore: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: 'System',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    fontFamily: 'System',
  },
  insightItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: 'System',
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'System',
  },
  starterContainer: {
    marginBottom: 24,
  },
  actionsContainer: {
    marginTop: 16,
  },
  messageButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  messageButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'System',
  },
});
