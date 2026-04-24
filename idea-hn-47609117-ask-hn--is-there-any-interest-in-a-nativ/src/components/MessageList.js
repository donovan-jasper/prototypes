import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getOfflineMessages } from '../services/discordApi';

const MessageList = ({ channelId, token }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const offlineMessages = await getOfflineMessages(channelId);
        setMessages(offlineMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId]);

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.author}>{item.author}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      inverted
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  messageContainer: {
    backgroundColor: '#36393F',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  author: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    color: '#DCDEE0',
    marginBottom: 4,
  },
  timestamp: {
    color: '#72767D',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageList;
