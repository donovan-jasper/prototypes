import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker } from 'react-native';
import { addExpense } from '../../lib/database';
import VoiceInput from '../../components/VoiceInput';

export default function AddExpense() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('user1');
  const [splitWith, setSplitWith] = useState(['user1', 'user2']);

  const handleAddExpense = async () => {
    const expense = {
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
      splitWith,
      date: new Date().toISOString(),
    };

    await addExpense(expense);
    // Navigate back or reset form
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <Picker
        selectedValue={paidBy}
        onValueChange={(itemValue) => setPaidBy(itemValue)}
      >
        <Picker.Item label="You" value="user1" />
        <Picker.Item label="Them" value="user2" />
      </Picker>
      <Button title="Add Expense" onPress={handleAddExpense} />
      <VoiceInput onResult={(result) => {
        setDescription(result.description);
        setAmount(result.amount.toString());
        setCategory(result.category);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
