import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useGiftStore } from '../../store/giftStore';

const HistoryScreen = () => {
  const router = useRouter();
  const { gifts } = useGiftStore();

  const renderGiftItem = ({ item }) => (
    <TouchableOpacity
      style={styles.giftItem}
      onPress={() => router.push(`/gift/${item.id}`)}
    >
      <Image source={{ uri: item.restaurant.image }} style={styles.giftImage} />
      <View style={styles.giftInfo}>
        <Text style={styles.giftRecipient}>{item.recipientName}</Text>
        <Text style={styles.giftRestaurant}>{item.restaurant.name}</Text>
        <Text style={styles.giftDate}>
          {new Date(item.scheduledFor).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.giftStatusContainer}>
        <Text style={[
          styles.giftStatus,
          item.status === 'delivered' && styles.deliveredStatus,
          item.status === 'pending' && styles.pendingStatus,
        ]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gift History</Text>

      {gifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No gifts sent yet</Text>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => router.push('/gift/send')}
          >
            <Text style={styles.sendButtonText}>Send Your First Gift</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          renderItem={renderGiftItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  giftItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  giftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  giftInfo: {
    flex: 1,
  },
  giftRecipient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  giftRestaurant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  giftDate: {
    fontSize: 12,
    color: '#999',
  },
  giftStatusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  giftStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deliveredStatus: {
    color: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  pendingStatus: {
    color: '#FF9800',
    backgroundColor: '#fff8e1',
  },
});

export default HistoryScreen;
