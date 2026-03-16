import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const OTPList = ({ otps }) => {
  return (
    <FlatList
      data={otps}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.otpItem}>
          <Text style={styles.otpName}>{item.name}</Text>
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
  },
  otpName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpCode: {
    fontSize: 18,
    color: '#007AFF',
  },
});

export default OTPList;
