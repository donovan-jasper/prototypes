import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addVaccination, addPrescription, addAllergy, addInsurance } from '../../lib/database';

type RecordType = 'vaccinations' | 'prescriptions' | 'allergies' | 'insurance';

export default function AddRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { memberId, recordType, onSave } = route.params as {
    memberId: string;
    recordType: RecordType;
    onSave: () => void;
  };

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dosage, setDosage] = useState('');
  const [severity, setSeverity] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the record');
      return;
    }

    try {
      switch (recordType) {
        case 'vaccinations':
          await addVaccination({
            memberId,
            name,
            date: date.toISOString().split('T')[0],
            provider
          });
          break;
        case 'prescriptions':
          await addPrescription({
            memberId,
            name,
            dosage,
            date: date.toISOString().split('T')[0]
          });
          break;
        case 'allergies':
          await addAllergy({
            memberId,
            name,
            severity
          });
          break;
        case 'insurance':
          await addInsurance({
            memberId,
            name,
            policyNumber,
            expirationDate: expirationDate.toISOString().split('T')[0]
          });
          break;
      }

      if (onSave) onSave();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to save record. Please try again.');
    }
  };

  const renderFormFields = () => {
    switch (recordType) {
      case 'vaccinations':
        return (
          <>
            <Text style={styles.label}>Vaccine Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., COVID-19 Vaccine"
            />

            <Text style={styles.label}>Date Administered</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Provider</Text>
            <TextInput
              style={styles.input}
              value={provider}
              onChangeText={setProvider}
              placeholder="e.g., Dr. Smith"
            />
          </>
        );
      case 'prescriptions':
        return (
          <>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Amoxicillin"
            />

            <Text style={styles.label}>Dosage</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 500mg twice daily"
            />

            <Text style={styles.label}>Prescription Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </>
        );
      case 'allergies':
        return (
          <>
            <Text style={styles.label}>Allergen</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Penicillin"
            />

            <Text style={styles.label}>Severity</Text>
            <TextInput
              style={styles.input}
              value={severity}
              onChangeText={setSeverity}
              placeholder="e.g., Mild, Moderate, Severe"
            />
          </>
        );
      case 'insurance':
        return (
          <>
            <Text style={styles.label}>Insurance Provider</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Blue Cross Blue Shield"
            />

            <Text style={styles.label}>Policy Number</Text>
            <TextInput
              style={styles.input}
              value={policyNumber}
              onChangeText={setPolicyNumber}
              placeholder="e.g., ABC123456789"
            />

            <Text style={styles.label}>Expiration Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowExpirationPicker(true)}
            >
              <Text>{expirationDate.toLocaleDateString()}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
            </TouchableOpacity>
            {showExpirationPicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowExpirationPicker(false);
                  if (selectedDate) setExpirationDate(selectedDate);
                }}
              />
            )}
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add {recordType.charAt(0).toUpperCase() + recordType.slice(1)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        {renderFormFields()}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Record</Text>
        </TouchableOpacity>
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
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
