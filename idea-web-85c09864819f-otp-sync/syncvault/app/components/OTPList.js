import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const OTPList = ({ otps }) => {
  return (
    <FlatList
      data={otps}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.otpItem}>
          <View style={styles.otpHeader}>
            <Text style={styles.otpName}>{item.name}</Text>
            <Text style={styles.otpTimer}>{item.timeRemaining}s</Text>
          </View>
          <Text style={styles.otpCode}>{item.code}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  otpItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  otpTimer: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  otpCode: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});

export default OTPList;
