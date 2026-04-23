import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Clipboard, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { generateConversationStarters } from '../../lib/ai/conversationGenerator';
import { useMatches } from '../../hooks/useMatches';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import Colors from '../../constants/Colors';
import { ConversationStarter } from '../../components/ConversationStarter';

const ConversationStarterModal = ({ visible, onClose, starters, onRefresh, onSend, isGenerating }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Conversation Starters</Text>

          <ScrollView style={styles.startersList}>
            {starters.length > 0 ? (
              starters.map((starter, index) => (
                <ConversationStarter
                  key={index}
                  starter={starter}
                  onSend={onSend}
                  onCopy={() => {}}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No conversation starters available</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.refreshButton, isGenerating && styles.disabledButton]}
              onPress={onRefresh}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.refreshButtonText}>Refresh Starters</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const { matches, loading, sendMessage } = useMatches();
  const { trackInteraction } = useBehaviorTracking();
  const [showStartersModal, setShowStartersModal] = useState(false);
  const [conversationStarters, setConversationStarters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const match = matches.find(m => m.id === id);

  useEffect(() => {
    if (match) {
      generateStarters();
    }
  }, [match]);

  const generateStarters = async () => {
    if (!match) return;

    setIsGenerating(true);
    try {
      const userVector = match.userBehaviorVector || new Array(128).fill(0.5);
      const matchVector = match.matchBehaviorVector || new Array(128).fill(0.5);

      const starters = await generateConversationStarters(userVector, matchVector);
      setConversationStarters(starters);

      trackInteraction('view_conversation_starters', {
        matchId: match.id,
        count: starters.length
      });
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      setConversationStarters([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendStarter = (message) => {
    if (match) {
      sendMessage(match.id, message);
      trackInteraction('send_conversation_starter', {
        matchId: match.id,
        message
      });
      setShowStartersModal(false);
    }
  };

  if (loading) {
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
          {match.insights?.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.startersButton}
            onPress={() => setShowStartersModal(true)}
          >
            <Text style={styles.startersButtonText}>Get Conversation Starters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConversationStarterModal
        visible={showStartersModal}
        onClose={() => setShowStartersModal(false)}
        starters={conversationStarters}
        onRefresh={generateStarters}
        onSend={handleSendStarter}
        isGenerating={isGenerating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  matchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  compatibilityScore: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  insightItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    marginTop: 24,
  },
  startersButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startersButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  startersList: {
    maxHeight: '70%',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
