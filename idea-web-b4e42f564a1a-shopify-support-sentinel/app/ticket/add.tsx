import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, Clipboard } from 'react-native';
import { useNavigation } from 'expo-router';
import { createTicket } from '../../lib/database';
import { parseTicketFromText } from '../../lib/ticketParser';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AddTicketScreen() {
  const navigation = useNavigation();
  const [company, setCompany] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');
  const [submittedAt, setSubmittedAt] = useState(new Date());
  const [expectedResponseHours, setExpectedResponseHours] = useState(48);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSmartPaste = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      if (!clipboardText) {
        Alert.alert('Clipboard is empty', 'Please copy text from an email or support page first');
        return;
      }

      const parsed = parseTicketFromText(clipboardText);

      if (parsed.company?.value) setCompany(parsed.company.value);
      if (parsed.ticketId?.value) setTicketId(parsed.ticketId.value);
      if (parsed.submittedAt?.value) setSubmittedAt(parsed.submittedAt.value);

      Alert.alert('Smart Paste', 'Ticket information extracted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to parse clipboard content');
    }
  };

  const handleSave = async () => {
    if (!company || !ticketId) {
      Alert.alert('Missing fields', 'Please provide company and ticket ID');
      return;
    }

    try {
      await createTicket({
        company,
        ticketId,
        description,
        submittedAt,
        expectedResponseHours,
        status: 'active'
      });

      Alert.alert('Success', 'Ticket added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save ticket');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || submittedAt;
    setShowDatePicker(Platform.OS === 'ios');
    setSubmittedAt(currentDate);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="e.g. Amazon, Shopify"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>Ticket ID</Text>
        <TextInput
          style={styles.input}
          value={ticketId}
          onChangeText={setTicketId}
          placeholder="e.g. #12345 or CASE-6789"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description of your issue"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Submission Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{format(submittedAt, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={submittedAt}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>Expected Response Time</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={expectedResponseHours}
            onValueChange={(itemValue) => setExpectedResponseHours(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="24 hours" value={24} />
            <Picker.Item label="48 hours" value={48} />
            <Picker.Item label="1 week" value={168} />
            <Picker.Item label="2 weeks" value={336} />
            <Picker.Item label="1 month" value={720} />
          </Picker>
        </View>

        <TouchableOpacity style={styles.smartPasteButton} onPress={handleSmartPaste}>
          <Text style={styles.smartPasteButtonText}>Smart Paste</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Ticket</Text>
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
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  smartPasteButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  smartPasteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
