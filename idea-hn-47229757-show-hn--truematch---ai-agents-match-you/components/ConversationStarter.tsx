import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import Colors from '../constants/Colors';

interface ConversationStarterProps {
  starter: string;
  onSend: (message: string) => void;
  onCopy?: () => void;
}

export const ConversationStarter: React.FC<ConversationStarterProps> = ({ starter, onSend, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(starter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

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
  },
  actions: {
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
});
