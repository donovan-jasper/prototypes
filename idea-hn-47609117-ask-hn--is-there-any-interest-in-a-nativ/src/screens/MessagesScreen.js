import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { getOfflineMessages, syncMessages } from '../services/discordApi';
import { getStoredToken } from '../services/auth';

const MessagesScreen = ({ route, navigation }) => {
  const { channelId } = route.params;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');

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

    try {
      const token = await getStoredToken();
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to send messages');
        return;
      }

      // In a real app, you would send the message to Discord API here
      // For now, we'll just add it to our local state
      const newMsg = {
        id: Date.now().toString(),
        channel_id: channelId,
        content: newMessage,
        author: 'You',
        timestamp: new Date().toISOString()
      };

      setMessages([newMsg, ...messages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

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
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        inverted
        contentContainerStyle={styles.messagesList}
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
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MessagesScreen;
