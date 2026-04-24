import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { getOfflineMessages, syncMessages, sendMessage } from '../services/discordApi';
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

  const loadMessages = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      const offlineMessages = await getOfflineMessages(channelId);
      setMessages(offlineMessages);

      // Try to sync with Discord if we have a token
      const token = await getStoredToken();
      if (token) {
        const syncedMessages = await syncMessages(channelId);
        setMessages(syncedMessages);
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
      <Text style={styles.messageAuthor}>{item.author}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
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
    padding: 10,
  },
  messageItem: {
    backgroundColor: '#2F3136',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  messageAuthor: {
    color: '#5865F2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageContent: {
    color: '#DCDDDE',
    fontSize: 16,
  },
  messageTime: {
    color: '#72767D',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2F3136',
    borderTopWidth: 1,
    borderTopColor: '#202225',
  },
  input: {
    flex: 1,
    backgroundColor: '#40444B',
    borderRadius: 8,
    padding: 12,
    color: '#DCDDDE',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#5865F2',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#4F5D95',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  syncStatus: {
    color: '#72767D',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MessagesScreen;
