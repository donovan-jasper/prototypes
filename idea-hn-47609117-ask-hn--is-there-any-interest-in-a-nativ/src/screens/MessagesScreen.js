import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getOfflineMessages, syncMessages } from '../services/discordApi';
import { authenticateWithDiscord } from '../services/auth';

const MessagesScreen = ({ route }) => {
  const { channelId } = route.params;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = async () => {
    try {
      const offlineMessages = await getOfflineMessages(channelId);
      if (offlineMessages.length > 0) {
        setMessages(offlineMessages);
      } else {
        // If no offline data, try to sync with Discord
        const token = await authenticateWithDiscord();
        const syncedMessages = await syncMessages(channelId, token);
        setMessages(syncedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await authenticateWithDiscord();
      const syncedMessages = await syncMessages(channelId, token);
      setMessages(syncedMessages);
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setRefreshing(false);
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
      />
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
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  messageAuthor: {
    color: '#5865F2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageContent: {
    color: '#fff',
    marginBottom: 5,
  },
  messageTime: {
    color: '#72767D',
    fontSize: 12,
  },
});

export default MessagesScreen;
