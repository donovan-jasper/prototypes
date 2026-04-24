import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getOfflineMessages, syncMessages } from '../services/discordApi';
import { getStoredToken } from '../services/auth';

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

  useEffect(() => {
    loadMessages();
  }, []);

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageAuthor}>{item.author}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
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
    backgroundColor: '#40444B',
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
    color: '#fff',
    marginBottom: 4,
  },
  messageTimestamp: {
    color: '#72767D',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default MessagesScreen;
