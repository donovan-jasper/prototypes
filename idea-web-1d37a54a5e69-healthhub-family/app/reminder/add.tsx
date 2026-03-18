import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { addReminder } from '../../lib/reminderService';
import { getFamilyMembers } from '../../lib/familyService';
import { FamilyMember } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

export default function AddReminder() {
  const [title, setTitle] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('once');
  const [nextDate, setNextDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
    requestNotificationPermissions();
  }, []);

  const loadFamilyMembers = async () => {
    const members = await getFamilyMembers();
    setFamilyMembers(members);
    if (members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to receive reminders');
    }
  };

  const frequencies: Array<{ value: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }> = [
    { value: 'once', label: 'One time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }
    if (!selectedMemberId) {
      Alert.alert('Error', 'Please select a family member');
      return;
    }

    setSaving(true);
    try {
      await addReminder({
        familyMemberId: selectedMemberId,
        title: title.trim(),
        frequency,
        nextDate: nextDate.toISOString(),
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add reminder');
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
        <Text style={styles.label}>Reminder Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Annual checkup, Flu shot"
          placeholderTextColor="#C7C7CC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyGrid}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              style={[
                styles.frequencyButton,
                frequency === freq.value && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(freq.value)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  frequency === freq.value && styles.frequencyTextActive,
                ]}
              >
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{format(nextDate, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={nextDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setNextDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Add Reminder'}
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
  memberSelector: {
    gap: 8,
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  memberButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberButtonText: {
    fontSize: 15,
    color: '#000',
  },
  memberButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 15,
    color: '#000',
  },
  frequencyTextActive: {
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
