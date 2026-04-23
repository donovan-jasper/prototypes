import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={[
          styles.timeText,
          isCurrentUser ? styles.currentUserTime : styles.otherUserTime
        ]}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 0,
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  currentUserTime: {
    color: '#FFFFFF',
  },
  otherUserTime: {
    color: '#666666',
  },
});
