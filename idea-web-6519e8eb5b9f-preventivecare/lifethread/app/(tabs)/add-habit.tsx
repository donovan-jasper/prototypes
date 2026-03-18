import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../hooks/useHabits';

const ICONS = [
  { name: 'water', label: 'Water' },
  { name: 'fitness', label: 'Exercise' },
  { name: 'bed', label: 'Sleep' },
  { name: 'restaurant', label: 'Meal' },
  { name: 'book', label: 'Reading' },
  { name: 'medkit', label: 'Medicine' },
  { name: 'walk', label: 'Walking' },
  { name: 'bicycle', label: 'Cycling' },
  { name: 'leaf', label: 'Meditation' },
  { name: 'heart', label: 'Health' },
  { name: 'sunny', label: 'Vitamin D' },
  { name: 'moon', label: 'Night Routine' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { addNewHabit } = useHabits();
  const [habitName, setHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('water');
  const [frequency, setFrequency] = useState('daily');

  const handleSave = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      await addNewHabit(habitName, selectedIcon, frequency);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save habit');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Habit</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Drink 8 glasses of water"
            value={habitName}
            onChangeText={setHabitName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                style={[
                  styles.iconButton,
                  selectedIcon === icon.name && styles.iconButtonSelected,
                ]}
                onPress={() => setSelectedIcon(icon.name)}
              >
                <Ionicons
                  name={icon.name}
                  size={32}
                  color={selectedIcon === icon.name ? '#673ab7' : '#666'}
                />
                <Text style={[
                  styles.iconLabel,
                  selectedIcon === icon.name && styles.iconLabelSelected,
                ]}>
                  {icon.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'daily' && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequency('daily')}
            >
              <Text style={[
                styles.frequencyText,
                frequency === 'daily' && styles.frequencyTextSelected,
              ]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'weekly' && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <Text style={[
                styles.frequencyText,
                frequency === 'weekly' && styles.frequencyTextSelected,
              ]}>
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#673ab7',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  iconButtonSelected: {
    borderColor: '#673ab7',
    backgroundColor: '#f3e5f5',
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  iconLabelSelected: {
    color: '#673ab7',
    fontWeight: 'bold',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  frequencyButtonSelected: {
    borderColor: '#673ab7',
    backgroundColor: '#f3e5f5',
  },
  frequencyText: {
    fontSize: 16,
    color: '#666',
  },
  frequencyTextSelected: {
    color: '#673ab7',
    fontWeight: 'bold',
  },
});
