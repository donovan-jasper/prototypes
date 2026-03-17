import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  text: string;
  score: number;
  status: string;
  platform: string;
  timestamp: string;
}

const HistoryScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const db = await SQLite.openDatabaseAsync('authentichat.db');
      const result = await db.getAllAsync<Message>('SELECT * FROM messages ORDER BY timestamp DESC;');
      setMessages(result);
      setFilteredMessages(result);

      // Extract unique platforms
      const uniquePlatforms = [...new Set(result.map(msg => msg.platform))].filter(p => p);
      setPlatforms(['All', ...uniquePlatforms]);
    };
    loadMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.platform.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPlatform !== 'All') {
      filtered = filtered.filter(msg => msg.platform === selectedPlatform);
    }

    setFilteredMessages(filtered);
  }, [searchQuery, selectedPlatform, messages]);

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={() => {
        setSelectedMessage(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.messageText} numberOfLines={2}>{item.text}</Text>
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
      <View style={styles.metaContainer}>
        <Text style={styles.platform}>{item.platform || 'Unknown'}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation History</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.platformFilterContainer}>
        {platforms.map(platform => (
          <TouchableOpacity
            key={platform}
            style={[
              styles.platformFilter,
              selectedPlatform === platform && styles.selectedPlatformFilter
            ]}
            onPress={() => setSelectedPlatform(platform)}
          >
            <Text style={[
              styles.platformFilterText,
              selectedPlatform === platform && styles.selectedPlatformFilterText
            ]}>
              {platform}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      {selectedMessage && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Message Details</Text>
              <Text style={styles.modalText}>{selectedMessage.text}</Text>
              <View style={styles.modalScoreContainer}>
                <Text style={styles.modalScoreLabel}>Score:</Text>
                <Text style={styles.modalScoreValue}>{selectedMessage.score}</Text>
                <Text style={[
                  styles.modalStatus,
                  selectedMessage.status === 'Human' ? styles.human :
                  selectedMessage.status === 'Mixed' ? styles.mixed : styles.ai
                ]}>
                  {selectedMessage.status}
                </Text>
              </View>
              <Text style={styles.modalPlatform}>Platform: {selectedMessage.platform || 'Unknown'}</Text>
              <Text style={styles.modalTimestamp}>Date: {new Date(selectedMessage.timestamp).toLocaleString()}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  platformFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  platformFilter: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedPlatformFilter: {
    backgroundColor: 'tomato',
  },
  platformFilterText: {
    color: '#666',
  },
  selectedPlatformFilterText: {
    color: 'white',
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
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platform: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
  },
  modalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalScoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  modalScoreValue: {
    fontSize: 16,
    marginRight: 10,
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalPlatform: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalTimestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
