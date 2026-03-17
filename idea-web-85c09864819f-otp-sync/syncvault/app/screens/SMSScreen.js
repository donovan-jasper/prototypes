import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../App';

const SMSScreen = () => {
  const [smsMessages, setSmsMessages] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'smsMessages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setSmsMessages(messages);
    });

    return unsubscribe;
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderSMSItem = ({ item }) => (
    <View style={styles.smsItem}>
      <View style={styles.smsHeader}>
        <Text style={styles.smsSender}>{item.sender}</Text>
        <Text style={styles.smsTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.smsBody}>{item.body}</Text>
      <Text style={styles.smsDevice}>From: {item.deviceId}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {smsMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No SMS messages yet</Text>
          <Text style={styles.emptySubtext}>
            SMS messages from all your devices will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={smsMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderSMSItem}
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
  },
  listContent: {
    padding: 16,
  },
  smsItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smsSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  smsTime: {
    fontSize: 12,
    color: '#666',
  },
  smsBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  smsDevice: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SMSScreen;
