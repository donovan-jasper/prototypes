import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { addPlant } from '../../lib/plants';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddPlantScreen() {
  const router = useRouter();
  const { db } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'vegetable' | 'herb' | 'flower' | 'houseplant' | 'fruit' | 'other'>('vegetable');
  const [plantedDate, setPlantedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a plant name');
      return;
    }

    if (!db) {
      alert('Database not initialized');
      return;
    }

    try {
      await addPlant(db, {
        name,
        type,
        plantedDate: plantedDate.toISOString(),
        variety: variety || undefined,
        location: location || undefined,
        notes: notes || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Error adding plant:', error);
      alert('Failed to add plant');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Plant</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Plant Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Basil"
          autoFocus
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Plant Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Vegetable" value="vegetable" />
            <Picker.Item label="Herb" value="herb" />
            <Picker.Item label="Flower" value="flower" />
            <Picker.Item label="Houseplant" value="houseplant" />
            <Picker.Item label="Fruit" value="fruit" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Planted Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {plantedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={plantedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setPlantedDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Variety (optional)</Text>
        <TextInput
          style={styles.input}
          value={variety}
          onChangeText={setVariety}
          placeholder="e.g. Genovese Basil"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location (optional)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Kitchen Window"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special care instructions"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Plant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
