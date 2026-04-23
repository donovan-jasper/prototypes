import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { addAppointment } from '../../lib/appointmentService';
import { getFamilyMembers } from '../../lib/familyService';
import { FamilyMember } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AddAppointment() {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [type, setType] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    const members = await getFamilyMembers();
    setFamilyMembers(members);
    if (members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  };

  const appointmentTypes = [
    'Pediatrician',
    'Dentist',
    'Specialist',
    'Therapy',
    'Vision',
    'Vaccination',
    'Other',
  ];

  const handleSave = async () => {
    if (!selectedMemberId) {
      Alert.alert('Error', 'Please select a family member');
      return;
    }
    if (!type) {
      Alert.alert('Error', 'Please select an appointment type');
      return;
    }
    if (!provider.trim()) {
      Alert.alert('Error', 'Please enter a provider name');
      return;
    }

    setSaving(true);
    try {
      await addAppointment({
        familyMemberId: selectedMemberId,
        type,
        provider: provider.trim(),
        date: date.toISOString(),
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add appointment');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Family Member</Text>
        <View style={styles.memberSelector}>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.memberButton,
                selectedMemberId === member.id && styles.memberButtonActive,
              ]}
              onPress={() => setSelectedMemberId(member.id)}
            >
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={20} color={selectedMemberId === member.id ? '#fff' : '#007AFF'} />
              </View>
              <Text
                style={[
                  styles.memberButtonText,
                  selectedMemberId === member.id && styles.memberButtonTextActive,
                ]}
              >
                {member.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Appointment Type</Text>
        <View style={styles.typeGrid}>
          {appointmentTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                type === t && styles.typeButtonActive,
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeText,
                  type === t && styles.typeTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Provider Name</Text>
        <TextInput
          style={styles.input}
          value={provider}
          onChangeText={setProvider}
          placeholder="e.g., Dr. Smith"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{format(date, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateText}>{format(date, 'h:mm a')}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                setDate(selectedTime);
              }
            }}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., 123 Main St, Clinic Name"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions or notes"
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Appointment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  memberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 4,
  },
  memberButtonActive: {
    backgroundColor: '#007AFF',
  },
  memberButtonText: {
    fontSize: 14,
    color: '#333',
  },
  memberButtonTextActive: {
    color: '#fff',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 4,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#333',
  },
  typeTextActive: {
    color: '#fff',
  },
  actions: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
