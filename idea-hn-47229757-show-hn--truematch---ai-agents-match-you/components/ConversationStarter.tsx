import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ActivityIndicator } from 'react-native';
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
  const [starter, setStarter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateStarter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newStarter = await generateConversationStarters(matchId);
      setStarter(newStarter);
    } catch (error) {
      console.error('Error generating conversation starter:', error);
      setError('Failed to generate conversation starter. Please try again.');
      setStarter('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (starter) {
      Clipboard.setString(starter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy();
    }
  };

  useEffect(() => {
    generateStarter();
  }, [matchId]);

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating conversation starter...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateStarter}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!starter) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No conversation starter available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateStarter}>
          <Text style={styles.refreshButtonText}>Generate New</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.starterText}>{starter}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCopy}
          accessibilityLabel="Copy conversation starter"
        >
          <Text style={styles.actionButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton]}
          onPress={() => onSend(starter)}
          accessibilityLabel="Send conversation starter"
        >
          <Text style={[styles.actionButtonText, styles.sendButtonText]}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.refreshButton]}
          onPress={generateStarter}
          accessibilityLabel="Refresh conversation starter"
        >
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  refreshButton: {
    backgroundColor: Colors.accent,
    marginRight: 0,
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
    color: Colors.error,
    marginBottom: 8,
    fontFamily: 'System',
  },
  refreshButtonText: {
    color: Colors.white,
    fontFamily: 'System',
  },
});
