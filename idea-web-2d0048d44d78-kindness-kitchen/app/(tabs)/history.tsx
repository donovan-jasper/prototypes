import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getGiftHistory } from '../../services/database';
import { useGiftStore } from '../../store/giftStore';

const HistoryScreen = () => {
  const router = useRouter();
  const { gifts } = useGiftStore();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const dbHistory = await getGiftHistory();
        setHistory(dbHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadHistory();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.giftCard}
      onPress={() => router.push(`/gift/${item.id}`)}
    >
      <Text style={styles.restaurantName}>{item.restaurantName}</Text>
      <Text style={styles.recipientName}>To: {item.recipientName}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          item.status === 'delivered' && styles.delivered,
          item.status === 'processing' && styles.processing,
          item.status === 'failed' && styles.failed,
        ]}>
          {item.status}
        </Text>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gift History</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>No gifts sent yet</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  giftCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  delivered: {
    color: '#4CAF50',
  },
  processing: {
    color: '#FFC107',
  },
  failed: {
    color: '#F44336',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
