import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { generateOTP, getTimeRemaining } from '../utils/otp';

const OTPListScreen = ({ route, navigation }) => {
  const { otpAccounts } = route.params || { otpAccounts: [] };
  const [otps, setOtps] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    const updateOTPs = () => {
      const updatedOtps = otpAccounts.map(account => ({
        id: account.id,
        name: account.name,
        code: generateOTP(account.secret),
      }));
      setOtps(updatedOtps);
      setTimeRemaining(getTimeRemaining());
    };

    // Initial update
    updateOTPs();

    // Set up interval to update every second
    const interval = setInterval(updateOTPs, 1000);

    return () => clearInterval(interval);
  }, [otpAccounts]);

  const renderItem = ({ item }) => (
    <View style={styles.otpItem}>
      <View style={styles.otpHeader}>
        <Text style={styles.otpName}>{item.name}</Text>
        <Text style={styles.otpCode}>{item.code}</Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Next code in: {timeRemaining}s</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your OTP Codes</Text>
      </View>

      {otps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No OTP accounts added yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddOTP')}
          >
            <Text style={styles.addButtonText}>Add First Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={otps}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  otpItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otpCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTPListScreen;
