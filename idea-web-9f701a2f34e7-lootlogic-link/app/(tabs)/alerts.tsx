import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore } from '../../lib/stores/alertStore';
import AlertRuleForm from '../../components/AlertRuleForm';

const Alerts = () => {
  const { rules, loadRules, deleteRule } = useAlertStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const handleDelete = (ruleId: string) => {
    deleteRule(ruleId);
  };

  return (
    <View style={styles.container}>
      {rules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No alert rules yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to create one</Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          renderItem={({ item }) => (
            <View style={styles.ruleItem}>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleGame}>{item.game}</Text>
                <Text style={styles.ruleItemName}>{item.itemName}</Text>
                <Text style={styles.rulePrice}>Target: ${item.targetPrice.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <AlertRuleForm onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  ruleContent: {
    flex: 1,
  },
  ruleGame: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ruleItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rulePrice: {
    fontSize: 14,
    color: '#03A9F4',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#03A9F4',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default Alerts;
