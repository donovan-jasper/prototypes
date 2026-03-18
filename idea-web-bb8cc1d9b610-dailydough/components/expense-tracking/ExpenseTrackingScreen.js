import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { getDatabase } from '../../services/database';
import { categorizeExpense, getCategories, recordCategoryCorrection } from '../../services/expenseCategorizer';

export default function ExpenseTrackingScreen() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorizationResult, setCategorizationResult] = useState(null);
  const [originalSuggestedCategory, setOriginalSuggestedCategory] = useState('');

  const categories = getCategories();

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    async function suggestCategory() {
      if (description.trim()) {
        const result = await categorizeExpense(description);
        setCategory(result.category);
        setCategorizationResult(result);
        setOriginalSuggestedCategory(result.category);
      } else {
        setCategory('');
        setCategorizationResult(null);
        setOriginalSuggestedCategory('');
      }
    }
    suggestCategory();
  }, [description]);

  async function loadExpenses() {
    const db = getDatabase();
    const result = await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
    setExpenses(result);
  }

  async function addExpense() {
    if (!amount || !category) return;
    
    // Record correction if user changed the suggested category
    if (originalSuggestedCategory && category !== originalSuggestedCategory && description.trim()) {
      await recordCategoryCorrection(description, category);
    }
    
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
      [parseFloat(amount), category, description, new Date().toISOString()]
    );
    
    setAmount('');
    setCategory('');
    setDescription('');
    setCategorizationResult(null);
    setOriginalSuggestedCategory('');
    loadExpenses();
  }

  function selectCategory(selectedCategory) {
    setCategory(selectedCategory);
    setShowCategoryPicker(false);
  }

  function getConfidenceText(confidence) {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
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
      {categorizationResult && (
        <View style={styles.suggestionContainer}>
          {categorizationResult.source === 'learned' ? (
            <Text style={styles.learnedText}>
              🧠 Learning from your choices • {getConfidenceText(categorizationResult.confidence)}
            </Text>
          ) : (
            <Text style={styles.autoSuggestText}>
              Auto-suggested from description • {getConfidenceText(categorizationResult.confidence)}
            </Text>
          )}
        </View>
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
  suggestionContainer: {
    marginBottom: 10
  },
  autoSuggestText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  learnedText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500'
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
