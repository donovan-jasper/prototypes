import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useMessageStore from '../../lib/store/useMessageStore';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { messages, markAsRead } = useMessageStore();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  
  const message = messages.find((m) => m.id === parseInt(id as string));

  useEffect(() => {
    if (message && message.read === 0) {
      markAsRead(message.id);
    }
  }, [message]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    setSending(true);
    
    // Mock API call - simulate sending reply
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSending(false);
    setReplyText('');
    
    // Show success feedback
    alert('Reply sent successfully!');
  };

  if (!message) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Message not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.buyerName}>{message.buyerName}</Text>
          <Text style={styles.platform}>{message.platform}</Text>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
        </View>

        <View style={styles.conversationThread}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageLabel}>From {message.buyerName}:</Text>
            <Text style={styles.messageContent}>{message.content}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.replyContainer}>
        <TextInput
          label="Type your reply"
          value={replyText}
          onChangeText={setReplyText}
          multiline
          numberOfLines={3}
          style={styles.replyInput}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleSendReply}
          disabled={!replyText.trim() || sending}
          loading={sending}
          style={styles.sendButton}
        >
          Send Reply
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buyerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  platform: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  conversationThread: {
    marginBottom: 16,
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  replyContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyInput: {
    marginBottom: 12,
  },
  sendButton: {
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
});
