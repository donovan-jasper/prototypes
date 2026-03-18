import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { getDatabase } from '../../services/database';
import { categorizeExpense, getCategories } from '../../services/expenseCategorizer';

export default function ExpenseTrackingScreen() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categories = getCategories();

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (description.trim()) {
      const suggestedCategory = categorizeExpense(description);
      setCategory(suggestedCategory);
    }
  }, [description]);

  async function loadExpenses() {
    const db = getDatabase();
    const result = await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
    setExpenses(result);
  }

  async function addExpense() {
    if (!amount || !category) return;
    
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
      [parseFloat(amount), category, description, new Date().toISOString()]
    );
    
    setAmount('');
    setCategory('');
    setDescription('');
    loadExpenses();
  }

  function selectCategory(selectedCategory) {
    setCategory(selectedCategory);
    setShowCategoryPicker(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Expenses</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (e.g., Uber ride, Starbucks coffee)"
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity 
        style={styles.categoryButton}
        onPress={() => setShowCategoryPicker(true)}
      >
        <Text style={styles.categoryButtonText}>
          {category || 'Select Category'}
        </Text>
      </TouchableOpacity>
      {category && (
        <Text style={styles.autoSuggestText}>
          Auto-suggested from description (tap to change)
        </Text>
      )}
      <Button title="Add Expense" onPress={addExpense} />
      
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.categoryOptionSelected
                ]}
                onPress={() => selectCategory(cat)}
              >
                <Text style={[
                  styles.categoryOptionText,
                  category === cat && styles.categoryOptionTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setShowCategoryPicker(false)} />
          </View>
        </View>
      </Modal>
      
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
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
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9'
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333'
  },
  autoSuggestText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  item: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5 },
  itemAmount: { fontSize: 18, fontWeight: 'bold' },
  itemCategory: { fontSize: 14, color: '#666', marginTop: 5 },
  itemDescription: { fontSize: 12, color: '#999', marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  categoryOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  categoryOptionSelected: {
    backgroundColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333'
  },
  categoryOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold'
  }
});
