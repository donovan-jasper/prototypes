import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '../../store/appStore';
import PremiumGate from '../../components/PremiumGate';

export default function ProfileScreen() {
  const { user, premium } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <PremiumGate>
        <TouchableOpacity style={styles.premiumButton}>
          <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </PremiumGate>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userInfo: {
    marginBottom: 24,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  premiumButton: {
    backgroundColor: '#673ab7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
