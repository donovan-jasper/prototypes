import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { addHolding } from '../lib/database';
import { Holding } from '../lib/types';

const AddHoldingModal = () => {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!symbol || !shares || !costBasis) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(Number(shares)) || isNaN(Number(costBasis))) {
      Alert.alert('Error', 'Shares and cost basis must be numbers');
      return;
    }

    setIsLoading(true);

    try {
      const newHolding: Omit<Holding, 'id' | 'currentPrice'> = {
        symbol: symbol.toUpperCase(),
        shares: parseFloat(shares),
        costBasis: parseFloat(costBasis),
        purchaseDate: new Date().toISOString(),
      };

      await addHolding(newHolding);
      router.back();
    } catch (error) {
      console.error('Error adding holding:', error);
      Alert.alert('Error', 'Failed to add holding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Holding</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. AAPL"
          value={symbol}
          onChangeText={setSymbol}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Shares</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          value={shares}
          onChangeText={setShares}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cost Basis (per share)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 150.00"
          value={costBasis}
          onChangeText={setCostBasis}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.disabledButton]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Saving...' : 'Save Holding'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddHoldingModal;
