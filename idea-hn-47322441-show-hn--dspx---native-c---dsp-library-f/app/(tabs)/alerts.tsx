import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { useStore } from '@/store';
import { getActiveAlerts } from '@/lib/alerts/engine';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type AlertItem = {
  id: string;
  sensorId: string;
  type: string;
  value?: number;
  condition?: string;
  isActive: boolean;
};

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleAlert, removeAlert } = useStore();
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

  const handleToggleAlert = (id: string) => {
    toggleAlert(id);
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const handleDeleteAlert = (id: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAlert(id);
            setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
          },
        },
      ]
    );
  };

  const renderAlertItem = ({ item }: { item: AlertItem }) => {
    let alertDescription = '';
    switch (item.type) {
      case 'threshold':
        alertDescription = `Trigger when ${item.sensorId} ${item.condition} ${item.value}`;
        break;
      case 'disconnection':
        alertDescription = `Alert if ${item.sensorId} disconnects for ${item.value}ms`;
        break;
      case 'battery':
        alertDescription = `Alert if ${item.sensorId} battery < ${item.value}%`;
        break;
      case 'pattern':
        alertDescription = `Alert if ${item.sensorId} ${item.condition} rapidly`;
        break;
      default:
        alertDescription = `Alert for ${item.sensorId}`;
    }

    return (
      <View style={styles.alertItem}>
        <View style={styles.alertContent}>
          <Text style={styles.alertType}>{item.type.toUpperCase()}</Text>
          <Text style={styles.alertDescription}>{alertDescription}</Text>
        </View>
        <View style={styles.alertActions}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleAlert(item.id)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.isActive ? '#f5dd4b' : '#f4f3f4'}
          />
          <TouchableOpacity onPress={() => handleDeleteAlert(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No alerts configured</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAlert')}
            >
              <Text style={styles.addButtonText}>Add Alert</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAlert')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  alertItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
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
    elevation: 8,
  },
});

export default AlertsScreen;
