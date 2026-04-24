import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { createTicket } from '../../lib/database';
import { ParsedTicket } from '../../lib/types';
import SmartPasteButton from '../../components/SmartPasteButton';
import { format } from 'date-fns';

export default function AddTicketScreen() {
  const navigation = useNavigation();
  const [company, setCompany] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');
  const [submittedAt, setSubmittedAt] = useState(new Date());
  const [expectedResponseHours, setExpectedResponseHours] = useState(48);

  const handleSmartPaste = (parsed: ParsedTicket) => {
    if (parsed.company) setCompany(parsed.company.value);
    if (parsed.ticketId) setTicketId(parsed.ticketId.value);
    if (parsed.submittedAt) setSubmittedAt(parsed.submittedAt.value);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="e.g. Amazon, Shopify"
        />

        <Text style={styles.label}>Ticket ID</Text>
        <TextInput
          style={styles.input}
          value={ticketId}
          onChangeText={setTicketId}
          placeholder="e.g. #12345 or CASE-6789"
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
        <Text style={styles.dateText}>{format(submittedAt, 'MMMM d, yyyy')}</Text>

        <Text style={styles.label}>Expected Response Time</Text>
        <TextInput
          style={styles.input}
          value={expectedResponseHours.toString()}
          onChangeText={(text) => setExpectedResponseHours(parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="Hours"
        />

        <SmartPasteButton onParsed={handleSmartPaste} />

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
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
