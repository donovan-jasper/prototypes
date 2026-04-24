import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { getOfflineMessages, syncMessages, sendMessage, getLastSyncTime } from '../services/discordApi';
import { getStoredToken } from '../services/auth';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = ({ route, navigation }) => {
  const { channelId } = route.params;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const flatListRef = useRef(null);

  const loadMessages = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      // Get last sync time
      const syncTime = await getLastSyncTime('last_message_sync');
      setLastSyncTime(syncTime);

      // Try to get offline data first
      const offlineMessages = await getOfflineMessages(channelId);
      if (offlineMessages.length > 0) {
        setMessages(offlineMessages);
      }

      // Try to sync with Discord if we have a token
      const token = await getStoredToken();
      if (token) {
        const syncedMessages = await syncMessages(channelId);
        setMessages(syncedMessages);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.message.includes('No authentication token')) {
        // Show offline data if available
        const offlineMessages = await getOfflineMessages(channelId);
        if (offlineMessages.length > 0) {
          setMessages(offlineMessages);
          Alert.alert('Offline Mode', 'You are viewing cached messages. Connect to the internet to sync with Discord.');
        } else {
          Alert.alert('Error', 'No messages available offline. Please connect to the internet.');
        }
      } else {
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [channelId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages(false);
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const token = await getStoredToken();
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to send messages');
        return;
      }

      const message = await sendMessage(channelId, newMessage);
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      Keyboard.dismiss();

      // Scroll to the new message
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageAuthor}>{item.author}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        inverted
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          lastSyncTime && (
            <Text style={styles.syncStatus}>
              Last synced: {lastSyncTime.toLocaleString()}
            </Text>
          )
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#72767D"
          multiline
          editable={!isSending}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#36393F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36393F',
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  syncStatus: {
    color: '#72767D',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  messageItem: {
    backgroundColor: '#40444B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageTime: {
    color: '#72767D',
    fontSize: 12,
  },
  messageContent: {
    color: '#DCDEE0',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2F3136',
    backgroundColor: '#36393F',
  },
  input: {
    flex: 1,
    backgroundColor: '#40444B',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#5865F2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MessagesScreen;
