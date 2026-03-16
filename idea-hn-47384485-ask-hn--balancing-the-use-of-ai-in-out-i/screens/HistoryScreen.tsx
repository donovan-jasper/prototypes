import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Message {
  id: number;
  text: string;
  score: number;
  status: string;
  timestamp: string;
}

const HistoryScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const db = await SQLite.openDatabaseAsync('authentichat.db');
      const result = await db.getAllAsync<Message>('SELECT * FROM messages ORDER BY timestamp DESC;');
      setMessages(result);
    };
    loadMessages();
  }, []);

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score:</Text>
        <Text style={styles.scoreValue}>{item.score}</Text>
        <Text style={[
          styles.status,
          item.status === 'Human' ? styles.human :
          item.status === 'Mixed' ? styles.mixed : styles.ai
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation History</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  scoreValue: {
    fontSize: 16,
    marginRight: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  human: {
    color: 'green',
  },
  mixed: {
    color: 'orange',
  },
  ai: {
    color: 'red',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
});

export default HistoryScreen;
