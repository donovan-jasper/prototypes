import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const SuccessScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
        style={styles.successImage}
      />
      <Text style={styles.title}>Gift Sent!</Text>
      <Text style={styles.subtitle}>Your gift is on its way to your loved one.</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Recipient:</Text>
        <Text style={styles.detailValue}>Sarah Johnson</Text>

        <Text style={styles.detailLabel}>Restaurant:</Text>
        <Text style={styles.detailValue}>Pizza Palace</Text>

        <Text style={styles.detailLabel}>Delivery Time:</Text>
        <Text style={styles.detailValue}>Today, 5:00 PM</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/history')}
      >
        <Text style={styles.buttonText}>View Gift Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/(tabs)/')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Send Another Gift</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#333',
  },
});

export default SuccessScreen;
