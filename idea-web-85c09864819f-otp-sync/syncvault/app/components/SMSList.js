import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const SMSList = ({ smss, onSelectMessage, selectedMessage }) => {
  return (
    <FlatList
      data={smss}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.smsItem,
            selectedMessage?.id === item.id && styles.selectedSmsItem
          ]}
          onPress={() => onSelectMessage(item)}
        >
          <View style={styles.smsHeader}>
            <Text style={styles.smsSender}>{item.sender}</Text>
            <Text style={styles.smsTime}>
              {item.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.smsBody}>{item.body}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  smsItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedSmsItem: {
    backgroundColor: '#e6f2ff',
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  smsSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  smsTime: {
    fontSize: 12,
    color: '#666',
  },
  smsBody: {
    fontSize: 14,
    color: '#444',
  },
});

export default SMSList;
