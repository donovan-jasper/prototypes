import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

interface ConversationStarterProps {
  starter: string;
  onSend: (message: string) => void;
  onCopy?: () => void;
  isGenerating?: boolean;
}

export const ConversationStarter: React.FC<ConversationStarterProps> = ({
  starter,
  onSend,
  onCopy,
  isGenerating = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(starter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating conversation starters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.starterText}>{starter}</Text>
      <View style={styles.actions}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  starterText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 22,
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
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
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
  },
});
