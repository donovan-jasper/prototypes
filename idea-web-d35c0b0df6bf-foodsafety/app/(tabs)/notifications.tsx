import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAllRecallAlerts, markRecallAlertAsRead } from '@/services/database';
import { RecallAlert } from '@/types';
import { format } from 'date-fns';

const NotificationsScreen = () => {
  const router = useRouter();
  const [recallAlerts, setRecallAlerts] = useState<RecallAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecallAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const alerts = await getAllRecallAlerts();
      setRecallAlerts(alerts);
    } catch (error) {
      console.error('Error fetching recall alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecallAlerts();
  }, [fetchRecallAlerts]);

  const handleAlertPress = async (alert: RecallAlert) => {
    // Mark as read
    if (!alert.isRead) {
      await markRecallAlertAsRead(alert.id);
      setRecallAlerts(prev => prev.map(a =>
        a.id === alert.id ? { ...a, isRead: true } : a
      ));
    }

    // Navigate to establishment detail
    router.push({
      pathname: '/establishment/[id]',
      params: { id: alert.establishmentId }
    });
  };

  const renderItem = ({ item }: { item: RecallAlert }) => (
    <TouchableOpacity
      style={[styles.alertItem, !item.isRead && styles.unreadAlert]}
      onPress={() => handleAlertPress(item)}
    >
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>⚠️ Recall Alert</Text>
        <Text style={styles.alertDate}>{format(new Date(item.recallDate), 'MMM d, yyyy')}</Text>
      </View>
      <Text style={styles.alertDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (recallAlerts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No recall alerts yet.</Text>
        <Text style={styles.emptySubtext}>Save locations to receive recall notifications.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recallAlerts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 16,
  },
  alertItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadAlert: {
    backgroundColor: '#fff8f8',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  alertDate: {
    fontSize: 12,
    color: '#666',
  },
  alertDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
