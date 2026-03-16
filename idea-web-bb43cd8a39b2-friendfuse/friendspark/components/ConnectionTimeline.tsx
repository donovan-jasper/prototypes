import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { format } from 'date-fns';

const ConnectionTimeline = ({ interactions }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{format(new Date(item.timestamp), 'MMM d')}</Text>
        <Text style={styles.time}>{format(new Date(item.timestamp), 'h:mm a')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.type}>{item.type}</Text>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Timeline</Text>
      <FlatList
        data={interactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dateContainer: {
    width: 60,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B6B',
    paddingLeft: 10,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notes: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default ConnectionTimeline;
