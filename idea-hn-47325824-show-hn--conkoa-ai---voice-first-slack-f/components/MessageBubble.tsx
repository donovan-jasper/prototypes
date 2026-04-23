import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string; // New prop for dynamic user ID, guaranteed to be string
  onConflictResolve?: () => void; // Kept for potential future use, not implemented in this task
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId, onConflictResolve }) => {
  const isCurrentUser = message.userId === currentUserId;
  const isAI = message.userId === 'AI-Assistant';

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUser : styles.otherUser
    ]}>
      {!isCurrentUser && (
        <Text style={styles.username}>
          {isAI ? 'AI Assistant' : message.userId}
        </Text>
      )}

      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentBubble : styles.otherBubble
      ]}>
        <Text style={[styles.text, isCurrentUser ? styles.currentText : styles.otherText]}>{message.text}</Text>

        {message.audioUrl && (
          <TouchableOpacity style={styles.audioButton}>
            <Ionicons name="play-circle" size={24} color={isCurrentUser ? 'white' : '#007AFF'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.footer, isCurrentUser ? styles.currentFooter : styles.otherFooter]}>
        <Text style={[
          styles.timestamp,
          isCurrentUser ? styles.currentTimestamp : styles.otherTimestamp
        ]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {/* Visual indicator for pending sync */}
        {!message.synced && (
          <View style={styles.syncIndicator}>
            <Ionicons name="cloud-offline" size={16} color="#ff9500" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUser: {
    alignSelf: 'flex-end',
  },
  otherUser: {
    alignSelf: 'flex-start',
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  currentBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentText: {
    color: 'white',
  },
  otherText: {
    color: '#333',
  },
  audioButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  currentFooter: {
    alignSelf: 'flex-end', // Aligns the footer itself to the right
  },
  otherFooter: {
    alignSelf: 'flex-start', // Aligns the footer itself to the left
  },
  timestamp: {
    fontSize: 12,
  },
  currentTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
    marginRight: 4,
  },
  syncIndicator: {
    // No specific margin-left needed if it's the last item in a row
  },
});

export default MessageBubble;
