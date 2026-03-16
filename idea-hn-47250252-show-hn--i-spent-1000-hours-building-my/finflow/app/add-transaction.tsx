import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../hooks/useTransactions';
import CategoryPicker from '../components/CategoryPicker';
import { Ionicons } from '@expo/vector-icons';

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('expense');

  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please enter amount and select a category');
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      category,
      note,
      type,
      date: new Date().toISOString(),
    };

    try {
      await addTransaction(transaction);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.selectedType]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.selectedTypeText]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.selectedType]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.selectedTypeText]}>Income</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <CategoryPicker selectedCategory={category} onSelectCategory={setCategory} />
      <TextInput
        style={styles.noteInput}
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
      />
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    color: '#007AFF',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  noteInput: {
    height: 40,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
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

export default AddTransactionScreen;
