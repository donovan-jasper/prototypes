import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SubscriptionList from '../components/SubscriptionList';
import { getSubscriptions } from '../services/SubscriptionService';

const HomeScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);

  const loadSubscriptions = async () => {
    const subs = await getSubscriptions();
    setSubscriptions(subs);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSubscriptions();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subsync</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScanEmail')}
        >
          <Text style={styles.scanButtonText}>📧 Scan Email</Text>
        </TouchableOpacity>
      </View>
      <SubscriptionList subscriptions={subscriptions} onRefresh={loadSubscriptions} />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddSubscription')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default HomeScreen;
