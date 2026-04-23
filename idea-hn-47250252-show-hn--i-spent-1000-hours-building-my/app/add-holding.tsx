import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { usePortfolio } from '../hooks/usePortfolio';
import { Holding } from '../lib/types';

const AddHoldingScreen = () => {
  const router = useRouter();
  const { addHolding } = usePortfolio();

  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [assetType, setAssetType] = useState<'stock' | 'crypto' | 'real-estate' | 'other'>('stock');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!symbol || !shares || !costBasis) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const sharesNum = parseFloat(shares);
    const costBasisNum = parseFloat(costBasis);

    if (isNaN(sharesNum) || isNaN(costBasisNum)) {
      Alert.alert('Error', 'Please enter valid numbers for shares and cost basis');
      return;
    }

    if (sharesNum <= 0 || costBasisNum <= 0) {
      Alert.alert('Error', 'Shares and cost basis must be positive numbers');
      return;
    }

    setIsLoading(true);

    try {
      const newHolding: Omit<Holding, 'id'> = {
        symbol: symbol.toUpperCase(),
        shares: sharesNum,
        costBasis: costBasisNum,
        assetType,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add New Holding</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., AAPL, BTC, ETH"
          value={symbol}
          onChangeText={setSymbol}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Shares</Text>
        <TextInput
          style={styles.input}
          placeholder="Number of shares"
          value={shares}
          onChangeText={setShares}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cost Basis (per share)</Text>
        <TextInput
          style={styles.input}
          placeholder="Purchase price per share"
          value={costBasis}
          onChangeText={setCostBasis}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Asset Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={assetType}
            onValueChange={(itemValue) => setAssetType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Stock" value="stock" />
            <Picker.Item label="Crypto" value="crypto" />
            <Picker.Item label="Real Estate" value="real-estate" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Holding</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddHoldingScreen;
