import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const SMSList = ({ smss }) => {
  return (
    <FlatList
      data={smss}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.smsItem}>
          <Text style={styles.smsSender}>{item.sender}</Text>
          <Text style={styles.smsBody}>{item.body}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  smsItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  smsSender: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  smsBody: {
    fontSize: 14,
  },
});

export default SMSList;
