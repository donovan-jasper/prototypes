import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Clipboard, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { generateConversationStarters } from '../../lib/ai/conversationGenerator';
import { useMatches } from '../../hooks/useMatches';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import Colors from '../../constants/Colors';

const ConversationStarterModal = ({ visible, onClose, starters, onRefresh }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

          {starters.map((starter, index) => (
            <View key={index} style={styles.starterItem}>
              <Text style={styles.starterText}>{starter}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopy(starter, index)}
              >
                <Text style={styles.copyButtonText}>
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Refresh Starters</Text>
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
  const { matches, loading } = useMatches();
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
      // In a real app, you would get the user's and match's behavior vectors
      // For this example, we'll use mock vectors
      const userVector = match.userBehaviorVector || new Array(128).fill(0.5);
      const matchVector = match.matchBehaviorVector || new Array(128).fill(0.5);

      const starters = generateConversationStarters(userVector, matchVector);
      setConversationStarters(starters);

      // Track that the user viewed conversation starters
      trackInteraction('view_conversation_starters', {
        matchId: match.id,
        count: starters.length
      });
    } catch (error) {
      console.error('Error generating conversation starters:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        style={styles.startersButton}
        onPress={() => setShowStartersModal(true)}
        disabled={isGenerating}
      >
        <Text style={styles.startersButtonText}>
          {isGenerating ? 'Generating...' : 'View Conversation Starters'}
        </Text>
      </TouchableOpacity>

      <ConversationStarterModal
        visible={showStartersModal}
        onClose={() => setShowStartersModal(false)}
        starters={conversationStarters}
        onRefresh={generateStarters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  matchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  compatibilityScore: {
    fontSize: 18,
    color: Colors.primary,
  },
  insightsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  insightItem: {
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  startersButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  startersButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    width: '90%',
    maxWidth: 500,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  starterItem: {
    backgroundColor: Colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 5,
    minWidth: 60,
  },
  copyButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  refreshButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
