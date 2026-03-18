import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSQLiteContext } from 'expo-sqlite';
import { addExpense } from '../../lib/database';
import VoiceInput from '../../components/VoiceInput';

export default function AddExpense() {
  const db = useSQLiteContext();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('user1');
  const [splitWith, setSplitWith] = useState(['user1', 'user2']);
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const expense = {
        description: description.trim(),
        amount: parsedAmount,
        category,
        paidBy,
        splitWith,
        date: new Date().toISOString(),
      };

      await addExpense(db, expense);
      
      Alert.alert('Success', 'Expense added successfully');
      
      // Reset form
      setDescription('');
      setAmount('');
      setCategory('Food');
      setPaidBy('user1');
      setSplitWith(['user1', 'user2']);
    } catch (err) {
      console.error('Error adding expense:', err);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (result: any) => {
    if (result.description) setDescription(result.description);
    if (result.amount) setAmount(result.amount.toString());
    if (result.category) setCategory(result.category);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Groceries, Coffee, Dinner"
        value={description}
        onChangeText={setDescription}
        editable={!loading}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        editable={!loading}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          enabled={!loading}
        >
          <Picker.Item label="Food" value="Food" />
          <Picker.Item label="Transport" value="Transport" />
          <Picker.Item label="Shopping" value="Shopping" />
          <Picker.Item label="Bills" value="Bills" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.label}>Paid By</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={paidBy}
          onValueChange={(itemValue) => setPaidBy(itemValue)}
          enabled={!loading}
        >
          <Picker.Item label="You" value="user1" />
          <Picker.Item label="Them" value="user2" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e78b7" style={styles.loader} />
      ) : (
        <>
          <Button title="Add Expense" onPress={handleAddExpense} color="#2e78b7" />
          <VoiceInput onResult={handleVoiceResult} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  loader: {
    marginTop: 24,
  },
});
