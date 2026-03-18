import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getDatabase } from '../../services/database';

export default function IncomeManagementScreen() {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadIncomes();
  }, []);

  async function loadIncomes() {
    const db = getDatabase();
    const result = await db.getAllAsync('SELECT * FROM income ORDER BY date DESC');
    setIncomes(result);
  }

  async function addIncome() {
    if (!amount || !source) return;
    
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO income (amount, source, description, date) VALUES (?, ?, ?, ?)',
      [parseFloat(amount), source, description, new Date().toISOString()]
    );
    
    setAmount('');
    setSource('');
    setDescription('');
    loadIncomes();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Income</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Source"
        value={source}
        onChangeText={setSource}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Add Income" onPress={addIncome} />
      
      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.itemSource}>{item.source}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
  item: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5 },
  itemAmount: { fontSize: 18, fontWeight: 'bold', color: 'green' },
  itemSource: { fontSize: 14, color: '#666', marginTop: 5 },
  itemDescription: { fontSize: 12, color: '#999', marginTop: 5 }
});
