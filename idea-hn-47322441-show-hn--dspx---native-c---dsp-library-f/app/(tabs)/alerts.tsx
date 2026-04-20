import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getActiveAlerts } from '@/lib/alerts/engine';
import { Alert } from '@/types/alerts';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const activeAlerts = await getActiveAlerts();
        setAlerts(activeAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const toggleAlert = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertInfo}>
        <Text style={styles.alertTitle}>{item.type} Alert</Text>
        <Text style={styles.alertDetail}>
          {item.condition === 'above' ? '>' : '<'} {item.value}
        </Text>
        {item.hysteresis && (
          <Text style={styles.alertDetail}>Hysteresis: ±{item.hysteresis}</Text>
        )}
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleAlert(item.id)}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Alerts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAlert')}
            >
              <Text style={styles.addButtonText}>+ Add Alert</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No alerts configured</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAlert')}
            >
              <Text style={styles.addButtonText}>Create your first alert</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertDetail: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default AlertsScreen;
