import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createRelationship } from '../../services/relationshipService';
import { Relationship } from '../../types';

export default function AddRelationshipScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Relationship['category'] | ''>('');
  const [frequency, setFrequency] = useState<Relationship['frequency'] | ''>('');
  const [importance, setImportance] = useState(5);
  const [notes, setNotes] = useState('');

  const categories: Relationship['category'][] = ['Family', 'Friends', 'Professional', 'Acquaintance'];
  const frequencies: Relationship['frequency'][] = ['Weekly', 'Monthly', 'Quarterly'];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a name');
      return;
    }

    if (!category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }

    if (!frequency) {
      Alert.alert('Missing Information', 'Please select a contact frequency');
      return;
    }

    try {
      createRelationship({
        name: name.trim(),
        category,
        frequency,
        importance,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create relationship. Please try again.');
      console.error('Failed to create relationship:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          placeholderTextColor="#9E9E9E"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pickerButton,
                category === cat && styles.pickerButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  category === cat && styles.pickerButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contact Frequency *</Text>
        <View style={styles.pickerContainer}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.pickerButton,
                frequency === freq && styles.pickerButtonActive,
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  frequency === freq && styles.pickerButtonTextActive,
                ]}
              >
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Importance: {importance}</Text>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.sliderButton,
                importance >= value && styles.sliderButtonActive,
              ]}
              onPress={() => setImportance(value)}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  importance >= value && styles.sliderButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this relationship..."
          placeholderTextColor="#9E9E9E"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Relationship</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  pickerButtonTextActive: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  sliderButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  sliderButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
