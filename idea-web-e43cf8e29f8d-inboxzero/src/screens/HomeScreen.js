import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert } from 'react-native';
import SubscriptionList from '../components/SubscriptionList';
import SubscriptionService from '../services/SubscriptionService';

const HomeScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);

  const loadData = useCallback(async () => {
    try {
      await SubscriptionService.initDatabase();
      await SubscriptionService.seedDatabase();

      const subs = await SubscriptionService.getSubscriptions();
      setSubscriptions(subs);

      const cost = await SubscriptionService.getTotalMonthlyCost();
      setTotalCost(cost);

      const renewals = await SubscriptionService.getUpcomingRenewals();
      setUpcomingRenewals(renewals);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();

    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleUnsubscribe = async (id) => {
    try {
      await SubscriptionService.unsubscribe(id);
      await loadData();
    } catch (error) {
      console.error('Error unsubscribing:', error);
      Alert.alert('Error', 'Failed to unsubscribe. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Subsync</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Monthly Cost</Text>
            <Text style={styles.statValue}>${totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Upcoming Renewals</Text>
            <Text style={styles.statValue}>{upcomingRenewals.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScanEmail')}
        >
          <Text style={styles.scanButtonText}>📧 Scan Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Subscriptions</Text>
        {subscriptions.length > 0 ? (
          <SubscriptionList
            subscriptions={subscriptions}
            onUnsubscribe={handleUnsubscribe}
            navigation={navigation}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active subscriptions found</Text>
            <Text style={styles.emptyStateSubtext}>Add your first subscription to get started</Text>
          </View>
        )}
      </View>

      {upcomingRenewals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
          <SubscriptionList
            subscriptions={upcomingRenewals}
            onUnsubscribe={handleUnsubscribe}
            navigation={navigation}
            showRenewalDates={true}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSubscription')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
