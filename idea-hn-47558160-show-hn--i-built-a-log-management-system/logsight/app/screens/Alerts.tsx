import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAlerts } from '../hooks/useAlerts';

const Alerts = () => {
  const { alerts } = useAlerts();

  const renderItem = ({ item }) => (
    <View style={styles.alertItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );

  return (
    <FlatList
      data={alerts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  alertItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
  },
});

export default Alerts;
