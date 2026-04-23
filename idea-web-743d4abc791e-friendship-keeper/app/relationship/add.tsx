import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Contacts from 'expo-contacts';
import { useRelationships } from '../../hooks/useRelationships';
import { Relationship } from '../../types';

export default function AddRelationship() {
  const { editMode, id } = useLocalSearchParams();
  const router = useRouter();
  const { relationships, createRelationship, updateRelationship } = useRelationships();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Friends');
  const [frequency, setFrequency] = useState('Monthly');
  const [importance, setImportance] = useState(3);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editMode === 'true' && id) {
      const relationshipToEdit = relationships.find(r => r.id === Number(id));
      if (relationshipToEdit) {
        setName(relationshipToEdit.name);
        setCategory(relationshipToEdit.category);
        setFrequency(relationshipToEdit.frequency);
        setImportance(relationshipToEdit.importance);
        setPhoneNumber(relationshipToEdit.phoneNumber || '');
        setNotes(relationshipToEdit.notes || '');
      }
    }
  }, [editMode, id, relationships]);

  const handleImportContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // For simplicity, just pick the first contact with a phone number
          const contactWithPhone = data.find(c => c.phoneNumbers && c.phoneNumbers.length > 0);
          if (contactWithPhone) {
            setName(`${contactWithPhone.firstName || ''} ${contactWithPhone.lastName || ''}`.trim());
            setPhoneNumber(contactWithPhone.phoneNumbers?.[0].number || '');
          } else {
            Alert.alert('No contacts with phone numbers found');
          }
        } else {
          Alert.alert('No contacts found');
        }
      } else {
        Alert.alert('Permission to access contacts is required');
      }
    } catch (error) {
      console.error('Error importing contact:', error);
      Alert.alert('Failed to import contact');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter a name');
      return;
    }

    setIsLoading(true);

    try {
      const relationshipData: Omit<Relationship, 'id' | 'createdAt'> = {
        name: name.trim(),
        category,
        frequency,
        importance,
        phoneNumber: phoneNumber.trim(),
        notes: notes.trim(),
      };

      if (editMode === 'true' && id) {
        await updateRelationship(Number(id), relationshipData);
      } else {
        await createRelationship(relationshipData);
      }

      router.back();
    } catch (error) {
      console.error('Error saving relationship:', error);
      Alert.alert('Failed to save relationship');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            autoFocus
          />
          <TouchableOpacity style={styles.importButton} onPress={handleImportContact}>
            <MaterialIcons name="import-contacts" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Family" value="Family" />
            <Picker.Item label="Friends" value="Friends" />
            <Picker.Item label="Professional" value="Professional" />
            <Picker.Item label="Acquaintance" value="Acquaintance" />
          </Picker>
        </View>

        <Text style={styles.label}>Contact Frequency</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={frequency}
            onValueChange={(itemValue) => setFrequency(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Weekly" value="Weekly" />
            <Picker.Item label="Bi-weekly" value="Bi-weekly" />
            <Picker.Item label="Monthly" value="Monthly" />
            <Picker.Item label="Quarterly" value="Quarterly" />
            <Picker.Item label="Yearly" value="Yearly" />
          </Picker>
        </View>

        <Text style={styles.label}>Importance</Text>
        <View style={styles.starRatingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setImportance(star)}>
              <MaterialIcons
                name={star <= importance ? 'star' : 'star-border'}
                size={32}
                color={star <= importance ? '#FFD700' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes about this relationship"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {editMode === 'true' ? 'Update Relationship' : 'Add Relationship'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  importButton: {
    marginLeft: 10,
    padding: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
