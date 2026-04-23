import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAlertStore } from '../../lib/stores/alertStore';
import AlertRuleForm from '../../components/AlertRuleForm';
import { Ionicons } from '@expo/vector-icons';

const AlertsScreen = () => {
  const { rules, deleteRule, checkRules } = useAlertStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Check rules periodically
    const interval = setInterval(() => {
      checkRules();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.itemName}</Text>
        <Text style={styles.alertGame}>{item.game}</Text>
        <Text style={styles.alertPrice}>Target: ${item.targetPrice}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteRule(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Alerts</Text>

      {rules.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No alerts set yet</Text>
          <Text style={styles.emptySubtext}>Create your first price alert to get notified when items drop below your target price</Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AlertRuleForm onClose={() => setShowForm(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alertGame: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  alertPrice: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
});

export default AlertsScreen;
