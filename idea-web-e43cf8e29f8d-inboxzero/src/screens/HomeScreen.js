import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import SubscriptionList from '../components/SubscriptionList';
import SubscriptionService from '../services/SubscriptionService';

const HomeScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const subs = await SubscriptionService.getSubscriptions();
      setSubscriptions(subs);

      const cost = await SubscriptionService.getTotalMonthlyCost();
      setTotalCost(cost);

      const renewals = await SubscriptionService.getUpcomingRenewals();
      setUpcomingRenewals(renewals);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

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
        <SubscriptionList
          subscriptions={subscriptions}
          onRefresh={loadData}
          navigation={navigation}
        />
      </View>

      {upcomingRenewals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
          <SubscriptionList
            subscriptions={upcomingRenewals}
            onRefresh={loadData}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
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
