import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Clipboard, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { generateConversationStarters } from '../../lib/ai/conversationGenerator';
import { useMatches } from '../../hooks/useMatches';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import Colors from '../../constants/Colors';

const ConversationStarter = ({ starter, onSend, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(starter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  return (
    <View style={styles.starterContainer}>
      <Text style={styles.starterText}>{starter}</Text>
      <View style={styles.starterActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Text style={styles.actionButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={() => onSend(starter)}>
          <Text style={[styles.actionButtonText, styles.sendButtonText]}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ConversationStarterModal = ({ visible, onClose, starters, onRefresh, onSend }) => {
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
            {starters.map((starter, index) => (
              <ConversationStarter
                key={index}
                starter={starter}
                onSend={onSend}
                onCopy={() => {}}
              />
            ))}
          </ScrollView>

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

      const starters = generateConversationStarters(userVector, matchVector);
      setConversationStarters(starters);

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
        onSend={handleSendStarter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
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
  },
  insightsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
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
  startersButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startersButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
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
  starterContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  starterText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  starterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    marginRight: 0,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonText: {
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  refreshButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
