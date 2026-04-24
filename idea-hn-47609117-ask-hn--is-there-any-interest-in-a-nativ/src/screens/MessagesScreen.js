import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { getOfflineMessages, syncMessages } from '../services/discordApi';
import { getStoredToken } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = ({ route, navigation }) => {
  const { channelId } = route.params;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  const loadMessages = async () => {
    try {
      const offlineMessages = await getOfflineMessages(channelId);
      if (offlineMessages.length > 0) {
        setMessages(offlineMessages);
      } else {
        // If no offline data, try to sync with Discord
        const token = await getStoredToken();
        if (token) {
          const syncedMessages = await syncMessages(channelId);
          setMessages(syncedMessages);
        } else {
          // No token, redirect to login
          navigation.replace('Login');
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const syncedMessages = await syncMessages(channelId);
      setMessages(syncedMessages);
    } catch (error) {
      console.error('Error refreshing messages:', error);
      Alert.alert('Error', 'Failed to refresh messages. Please check your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const token = await getStoredToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated. Please login again.');
        navigation.replace('Login');
        return;
      }

      // Send message to Discord API
      const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear input and refresh messages
      setNewMessage('');
      await handleRefresh();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text style={styles.authorName}>{item.author}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          <Text style={styles.header}>Messages</Text>
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
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 15,
    backgroundColor: '#2F3136',
  },
  messagesList: {
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  authorName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    color: '#72767D',
    fontSize: 12,
  },
  messageContent: {
    color: '#DCDDDE',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#40444B',
    borderTopWidth: 1,
    borderTopColor: '#2F3136',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#40444B',
    color: '#DCDDDE',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2F3136',
  },
});

export default MessagesScreen;
