import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createTicket } from '../../lib/database';

export default function AddTicketScreen() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');
  const [submittedAt, setSubmittedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expectedResponseHours, setExpectedResponseHours] = useState(48);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!company.trim() || !ticketId.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await createTicket({
        company: company.trim(),
        ticketId: ticketId.trim(),
        description: description.trim(),
        submittedAt,
        expectedResponseHours,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSubmittedAt(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="e.g., Amazon, Shopify"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Ticket ID *</Text>
        <TextInput
          style={styles.input}
          value={ticketId}
          onChangeText={setTicketId}
          placeholder="e.g., AMZ-12345"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description of the issue"
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Submission Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {submittedAt.toLocaleDateString()} {submittedAt.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={submittedAt}
            mode="datetime"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Expected Response Time</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={expectedResponseHours}
            onValueChange={(value) => setExpectedResponseHours(value)}
            style={styles.picker}
          >
            <Picker.Item label="24 hours" value={24} />
            <Picker.Item label="48 hours" value={48} />
            <Picker.Item label="1 week" value={168} />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Ticket'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
