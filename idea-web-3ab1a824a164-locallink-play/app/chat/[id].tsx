import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { checkForMutualInterest } from '../../lib/matching';
import ChatBubble from '../../components/ChatBubble';

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages, loading, fetchMessages, sendMessage, subscribeToMessages } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId || typeof chatId !== 'string') {
      Alert.alert('Error', 'Invalid chat ID');
      router.back();
      return;
    }

    // Check if chat is unlocked
    const checkUnlockStatus = async () => {
      try {
        const unlocked = await checkForMutualInterest(chatId, user?.id || '');
        setIsUnlocked(unlocked);
      } catch (error) {
        console.error('Error checking unlock status:', error);
      } finally {
        setCheckingUnlock(false);
      }
    };

    checkUnlockStatus();

    // Fetch messages
    fetchMessages(chatId);

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(chatId);

    return () => {
      unsubscribe();
    };
  }, [chatId, user?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    try {
      await sendMessage(chatId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  if (checkingUnlock) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking chat status...</Text>
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>Chat Locked</Text>
        <Text style={styles.lockedText}>
          This chat is locked until both users express interest in each other's broadcasts.
        </Text>
        <Text style={styles.lockedText}>
          You will be notified when the chat is unlocked.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isCurrentUser={item.senderId === user?.id}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        inverted
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
