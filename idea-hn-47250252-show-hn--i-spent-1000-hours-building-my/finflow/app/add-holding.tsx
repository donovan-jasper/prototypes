import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePortfolio } from '../hooks/usePortfolio';
import { fetchAssetPrice } from '../lib/priceService';

const AddHoldingScreen = () => {
  const navigation = useNavigation();
  const { addHolding } = usePortfolio();

  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [assetType, setAssetType] = useState('stock');

  const handleSave = async () => {
    if (!symbol || !shares || !costBasis) {
      Alert.alert('Error', 'Please enter symbol, shares, and cost basis');
      return;
    }

    try {
      const currentPrice = await fetchAssetPrice(symbol);

      const holding = {
        symbol: symbol.toUpperCase(),
        shares: parseFloat(shares),
        costBasis: parseFloat(costBasis),
        currentPrice,
        assetType,
      };

      await addHolding(holding);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add holding or fetch price');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Symbol (e.g., AAPL)"
        value={symbol}
        onChangeText={setSymbol}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Shares"
        keyboardType="numeric"
        value={shares}
        onChangeText={setShares}
      />
      <TextInput
        style={styles.input}
        placeholder="Cost Basis (per share)"
        keyboardType="numeric"
        value={costBasis}
        onChangeText={setCostBasis}
      />
      <View style={styles.assetTypeSelector}>
        <TouchableOpacity
          style={[styles.assetTypeButton, assetType === 'stock' && styles.selectedAssetType]}
          onPress={() => setAssetType('stock')}
        >
          <Text style={[styles.assetTypeText, assetType === 'stock' && styles.selectedAssetTypeText]}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.assetTypeButton, assetType === 'crypto' && styles.selectedAssetType]}
          onPress={() => setAssetType('crypto')}
        >
          <Text style={[styles.assetTypeText, assetType === 'crypto' && styles.selectedAssetTypeText]}>Crypto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.assetTypeButton, assetType === 'real estate' && styles.selectedAssetType]}
          onPress={() => setAssetType('real estate')}
        >
          <Text style={[styles.assetTypeText, assetType === 'real estate' && styles.selectedAssetTypeText]}>Real Estate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.assetTypeButton, assetType === 'other' && styles.selectedAssetType]}
          onPress={() => setAssetType('other')}
        >
          <Text style={[styles.assetTypeText, assetType === 'other' && styles.selectedAssetTypeText]}>Other</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  assetTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  assetTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedAssetType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  assetTypeText: {
    color: '#007AFF',
  },
  selectedAssetTypeText: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AddHoldingScreen;
