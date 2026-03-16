import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useAlertStore } from '../../lib/stores/alertStore';
import AlertRuleForm from '../../components/AlertRuleForm';

const Alerts = () => {
  const { rules, loadRules } = useAlertStore();

  useEffect(() => {
    loadRules();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={rules}
        renderItem={({ item }) => (
          <View style={styles.ruleItem}>
            <Text>{item.game}</Text>
            <Text>{item.itemName}</Text>
            <Text>{item.targetPrice}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  ruleItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  },
  fabText: {
    fontSize: 24,
    color: 'white',
  },
});

export default Alerts;
