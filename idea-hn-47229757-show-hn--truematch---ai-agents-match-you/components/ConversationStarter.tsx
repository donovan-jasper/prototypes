import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ActivityIndicator, FlatList } from 'react-native';
import Colors from '../constants/Colors';
import { generateConversationStarters } from '../lib/ai/conversationGenerator';

interface ConversationStarterProps {
  matchId: string;
  onSend: (message: string) => void;
  onCopy?: () => void;
}

export const ConversationStarter: React.FC<ConversationStarterProps> = ({
  matchId,
  onSend,
  onCopy
}) => {
  const [starters, setStarters] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateStarters = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newStarters = await generateConversationStarters(matchId);
      setStarters(newStarters);
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      setError('Failed to generate conversation starters. Please try again.');
      setStarters([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (starter: string, index: number) => {
    Clipboard.setString(starter);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    if (onCopy) onCopy();
  };

  useEffect(() => {
    generateStarters();
  }, [matchId]);

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating conversation starters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateStarters}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (starters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No conversation starters available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateStarters}>
          <Text style={styles.refreshButtonText}>Generate New</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStarterItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.starterContainer}>
      <Text style={styles.starterText}>{item}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCopy(item, index)}
          accessibilityLabel="Copy conversation starter"
        >
          <Text style={styles.actionButtonText}>
            {copiedIndex === index ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton]}
          onPress={() => onSend(item)}
          accessibilityLabel="Send conversation starter"
        >
          <Text style={[styles.actionButtonText, styles.sendButtonText]}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation Starters</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateStarters}
          accessibilityLabel="Refresh conversation starters"
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={starters}
        renderItem={renderStarterItem}
        keyExtractor={(item, index) => `starter-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'System',
  },
  starterContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  starterText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 22,
    fontFamily: 'System',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginRight: 8,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  sendButtonText: {
    color: Colors.white,
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'System',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'System',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.errorBackground,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.errorText,
    marginBottom: 8,
    fontFamily: 'System',
  },
  listContent: {
    paddingBottom: 8,
  },
});
