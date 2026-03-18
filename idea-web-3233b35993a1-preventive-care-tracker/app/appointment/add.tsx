import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleAppointmentReminder } from '../../lib/notifications';

export default function AddAppointmentScreen() {
  const router = useRouter();
  const addAppointment = useStore((state) => state.addAppointment);
  
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !provider.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const appointmentId = Date.now().toString();
    const appointmentData = {
      id: appointmentId,
      title: title.trim(),
      provider: provider.trim(),
      date: date.toISOString(),
      completed: false,
    };

    const notificationIds = await scheduleAppointmentReminder(appointmentData);

    addAppointment({
      ...appointmentData,
      notificationIds,
    });

    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Appointment</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Appointment Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Annual Physical, Dentist Checkup"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Provider</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dr. Smith, ABC Dental"
            value={provider}
            onChangeText={setProvider}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
