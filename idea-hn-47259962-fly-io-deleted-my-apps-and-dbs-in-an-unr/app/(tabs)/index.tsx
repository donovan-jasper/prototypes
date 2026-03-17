import { ScrollView, StyleSheet, RefreshControl, View, Text, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import ServiceCard from '@/components/ServiceCard';
import { useStore } from '@/lib/store';
import { openDatabase, getServices } from '@/lib/db';
import { performHealthCheck } from '@/lib/monitoring';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const services = useStore((state) => state.services);
  const initializeStore = useStore((state) => state.initializeStore);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const db = await openDatabase();
      const dbServices = await getServices(db);

      // Initialize Zustand store with services from DB
      initializeStore(dbServices, []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Perform health checks for all services
      for (const service of services) {
        await performHealthCheck(service);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [services]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No services connected</Text>
          <Text style={styles.emptySubtext}>
            Connect your cloud services in the Settings tab to monitor their status.
          </Text>
        </View>
      ) : (
        services.map((service) => (
          <ServiceCard
            key={service.id}
            name={service.name}
            provider={service.provider}
            status={service.status}
            lastCheck={service.lastCheck}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
