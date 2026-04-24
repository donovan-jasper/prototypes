import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getVaccination, getPrescription, getAllergy, getInsuranceById, updateVaccination, updatePrescription, updateAllergy, updateInsurance } from '../../lib/database';

type RecordType = 'vaccinations' | 'prescriptions' | 'allergies' | 'insurance';

interface RecordData {
  id: string;
  name: string;
  date?: string;
  dosage?: string;
  severity?: string;
  provider?: string;
  policyNumber?: string;
  expirationDate?: string;
}

export default function EditRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { memberId, recordType, recordId, onSave } = route.params as {
    memberId: string;
    recordType: RecordType;
    recordId: string;
    onSave: () => void;
  };

  const [record, setRecord] = useState<RecordData | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dosage, setDosage] = useState('');
  const [severity, setSeverity] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);

  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    try {
      let data: RecordData | null = null;
      switch (recordType) {
        case 'vaccinations':
          data = await getVaccination(recordId);
          break;
        case 'prescriptions':
          data = await getPrescription(recordId);
          break;
        case 'allergies':
          data = await getAllergy(recordId);
          break;
        case 'insurance':
          data = await getInsuranceById(recordId);
          break;
      }

      if (data) {
        setRecord(data);
        setName(data.name || '');
        if (data.date) setDate(new Date(data.date));
        if (data.dosage) setDosage(data.dosage);
        if (data.severity) setSeverity(data.severity);
        if (data.provider) setProvider(data.provider);
        if (data.policyNumber) setPolicyNumber(data.policyNumber);
        if (data.expirationDate) setExpirationDate(new Date(data.expirationDate));
      }
    } catch (error) {
      console.error('Error loading record:', error);
      Alert.alert('Error', 'Failed to load record. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the record');
      return;
    }

    if (!record) return;

    try {
      switch (recordType) {
        case 'vaccinations':
          await updateVaccination({
            id: record.id,
            name,
            date: date.toISOString().split('T')[0],
            provider
          });
          break;
        case 'prescriptions':
          await updatePrescription({
            id: record.id,
            name,
            dosage,
            date: date.toISOString().split('T')[0]
          });
          break;
        case 'allergies':
          await updateAllergy({
            id: record.id,
            name,
            severity
          });
          break;
        case 'insurance':
          await updateInsurance({
            id: record.id,
            name,
            policyNumber,
            expirationDate: expirationDate.toISOString().split('T')[0]
          });
          break;
      }

      if (onSave) onSave();
      navigation.goBack();
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', 'Failed to update record. Please try again.');
    }
  };

  const renderFormFields = () => {
    if (!record) return null;

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

  if (!record) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit {recordType.charAt(0).toUpperCase() + recordType.slice(1)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        {renderFormFields()}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
