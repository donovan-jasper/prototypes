import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAlertStore } from '../lib/stores/alertStore';

const AlertRuleForm = ({ onClose }: { onClose: () => void }) => {
  const { createRule } = useAlertStore();
  const [game, setGame] = useState('fortnite');
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notificationType, setNotificationType] = useState<'price' | 'event'>('price');

  const handleSubmit = () => {
    if (!itemId || !itemName || !targetPrice) {
      alert('Please fill all fields');
      return;
    }

    createRule({
      game,
      itemId,
      itemName,
      targetPrice: parseFloat(targetPrice),
      notificationType
    });

    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Alert</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Game</Text>
        <Picker
          selectedValue={game}
          onValueChange={(itemValue) => setGame(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Fortnite" value="fortnite" />
          <Picker.Item label="Genshin Impact" value="genshin" />
          <Picker.Item label="Destiny 2" value="destiny" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Item ID</Text>
        <TextInput
          style={styles.input}
          value={itemId}
          onChangeText={setItemId}
          placeholder="Enter item ID"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
          placeholder="Enter item name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Target Price</Text>
        <TextInput
          style={styles.input}
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="Enter target price"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notification Type</Text>
        <Picker
          selectedValue={notificationType}
          onValueChange={(itemValue) => setNotificationType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Price Alert" value="price" />
          <Picker.Item label="Event Alert" value="event" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Alert</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        height: 150,
      },
      android: {
        height: 50,
      },
    }),
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlertRuleForm;
