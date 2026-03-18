import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { fetchTransactions } from '../utils/api';

const CATEGORIES = {
  Groceries: { color: '#4CAF50', keywords: ['grocery', 'supermarket', 'food', 'market'] },
  Lifestyle: { color: '#2196F3', keywords: ['coffee', 'restaurant', 'entertainment', 'shopping', 'retail'] },
  Transportation: { color: '#FF9800', keywords: ['gas', 'uber', 'lyft', 'transit', 'parking', 'fuel'] },
  Utilities: { color: '#9C27B0', keywords: ['electric', 'water', 'internet', 'phone', 'utility'] },
  Healthcare: { color: '#F44336', keywords: ['pharmacy', 'doctor', 'hospital', 'medical', 'health'] },
  Other: { color: '#607D8B', keywords: [] }
};

const BudgetTracker = () => {
  const [categoryData, setCategoryData] = useState({});
  const [budgetLimits, setBudgetLimits] = useState({
    Groceries: 500,
    Lifestyle: 300,
    Transportation: 200,
    Utilities: 150,
    Healthcare: 100,
    Other: 200
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  useEffect(() => {
    loadAndCategorizeTransactions();
  }, []);

  const categorizeTransaction = (transaction) => {
    const description = (transaction.description || '').toLowerCase();
    
    for (const [category, data] of Object.entries(CATEGORIES)) {
      if (category === 'Other') continue;
      if (data.keywords.some(keyword => description.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  };

  const loadAndCategorizeTransactions = async () => {
    const transactions = await fetchTransactions();
    
    const categorized = {};
    Object.keys(CATEGORIES).forEach(cat => {
      categorized[cat] = 0;
    });

    transactions.forEach(transaction => {
      const category = categorizeTransaction(transaction);
      categorized[category] += transaction.amount;
    });

    setCategoryData(categorized);
  };

  const getStatusColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return '#F44336';
    if (percentage >= 80) return '#FF9800';
    return '#4CAF50';
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setTempLimit(budgetLimits[category].toString());
    setModalVisible(true);
  };

  const saveBudgetLimit = () => {
    if (editingCategory && tempLimit) {
      setBudgetLimits({
        ...budgetLimits,
        [editingCategory]: parseFloat(tempLimit) || 0
      });
    }
    setModalVisible(false);
    setEditingCategory(null);
    setTempLimit('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Tracker</Text>
      
      <ScrollView style={styles.scrollView}>
        {Object.keys(CATEGORIES).map(category => {
          const spent = categoryData[category] || 0;
          const limit = budgetLimits[category];
          const percentage = Math.min((spent / limit) * 100, 100);
          const statusColor = getStatusColor(spent, limit);
          const isOverBudget = spent > limit;

          return (
            <TouchableOpacity 
              key={category} 
              style={styles.categoryCard}
              onPress={() => openEditModal(category)}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                {isOverBudget && (
                  <Text style={styles.alertIcon}>⚠️</Text>
                )}
              </View>

              <View style={styles.amountRow}>
                <Text style={[styles.spentAmount, isOverBudget && styles.overBudgetText]}>
                  ${spent.toFixed(2)}
                </Text>
                <Text style={styles.limitText}>/ ${limit.toFixed(2)}</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: statusColor
                    }
                  ]} 
                />
              </View>

              <View style={styles.statusRow}>
                <Text style={[styles.percentageText, { color: statusColor }]}>
                  {percentage.toFixed(0)}% used
                </Text>
                {isOverBudget && (
                  <Text style={styles.overBudgetLabel}>OVER BUDGET</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Budget Limit</Text>
            <Text style={styles.modalSubtitle}>{editingCategory}</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempLimit}
              onChangeText={setTempLimit}
              keyboardType="numeric"
              placeholder="Enter budget limit"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveBudgetLimit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  scrollView: {
    flex: 1
  },
  categoryCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  alertIcon: {
    fontSize: 20
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  spentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333'
  },
  overBudgetText: {
    color: '#F44336'
  },
  limitText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBar: {
    height: '100%',
    borderRadius: 4
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600'
  },
  overBudgetLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F44336',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});

export default BudgetTracker;
