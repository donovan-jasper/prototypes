import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { addFamilyMember } from '../../lib/familyService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function AddFamilyMember() {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [relationship, setRelationship] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [saving, setSaving] = useState(false);

  const relationships = ['Child', 'Parent', 'Spouse', 'Sibling', 'Grandparent', 'Other'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!relationship) {
      Alert.alert('Error', 'Please select a relationship');
      return;
    }

    setSaving(true);
    try {
      await addFamilyMember({
        name: name.trim(),
        birthdate: format(birthdate, 'yyyy-MM-dd'),
        relationship,
        insuranceProvider: insuranceProvider.trim() || undefined,
        insuranceId: insuranceId.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add family member');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Birthdate</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{format(birthdate, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setBirthdate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Relationship</Text>
        <View style={styles.relationshipGrid}>
          {relationships.map((rel) => (
            <TouchableOpacity
              key={rel}
              style={[
                styles.relationshipButton,
                relationship === rel && styles.relationshipButtonActive,
              ]}
              onPress={() => setRelationship(rel)}
            >
              <Text
                style={[
                  styles.relationshipText,
                  relationship === rel && styles.relationshipTextActive,
                ]}
              >
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Insurance Provider (Optional)</Text>
        <TextInput
          style={styles.input}
          value={insuranceProvider}
          onChangeText={setInsuranceProvider}
          placeholder="e.g., Blue Cross"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Insurance ID (Optional)</Text>
        <TextInput
          style={styles.input}
          value={insuranceId}
          onChangeText={setInsuranceId}
          placeholder="Enter insurance ID"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Add Family Member'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateText: {
    fontSize: 17,
    color: '#000',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  relationshipButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  relationshipText: {
    fontSize: 15,
    color: '#000',
  },
  relationshipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
