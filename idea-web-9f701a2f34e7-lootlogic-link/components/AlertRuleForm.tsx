import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useInventoryStore } from '../lib/stores/inventoryStore';
import { useAlertStore } from '../lib/stores/alertStore';

interface AlertRuleFormProps {
  onClose: () => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({ onClose }) => {
  const { items } = useInventoryStore();
  const { createRule } = useAlertStore();
  
  const [selectedGame, setSelectedGame] = useState('');
  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const games = Array.from(new Set(items.map(item => item.game)));
  
  const handleSave = () => {
    if (!selectedGame || !itemName || !targetPrice) {
      alert('Please fill in all fields');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    createRule({
      id: Date.now().toString(),
      game: selectedGame,
      itemName,
      targetPrice: price,
    });

    onClose();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Alert Rule</Text>
      
      <View style={styles.field}>
        <Text style={styles.label}>Game</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGame}
            onValueChange={(value) => setSelectedGame(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a game..." value="" />
            {games.map((game) => (
              <Picker.Item key={game} label={game} value={game} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
          placeholder="Enter item name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Target Price ($)</Text>
        <TextInput
          style={styles.input}
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="0.00"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Alert</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#03A9F4',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AlertRuleForm;
