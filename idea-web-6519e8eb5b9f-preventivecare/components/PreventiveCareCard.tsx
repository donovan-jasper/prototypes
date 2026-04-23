import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { schedulePreventiveCareReminder } from '../lib/notifications';
import { useAppStore } from '../store/appStore';

interface PreventiveCareCardProps {
  screening: {
    type: string;
    name: string;
    frequency: string;
    description: string;
  };
  nextDueDate: Date;
}

const PreventiveCareCard: React.FC<PreventiveCareCardProps> = ({ screening, nextDueDate }) => {
  const [isReminderSet, setIsReminderSet] = useState(false);
  const user = useAppStore(state => state.user);

  const handleSetReminder = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await schedulePreventiveCareReminder(screening.type, nextDueDate, user.id);
      setIsReminderSet(true);
      Alert.alert('Success', `Reminder set for ${screening.name} on ${nextDueDate.toLocaleDateString()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set reminder');
      console.error('Error setting reminder:', error);
    }
  };

  const daysUntilDue = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name={getScreeningIcon(screening.type)}
          size={24}
          color="#4A89DC"
        />
        <Text style={styles.title}>{screening.name}</Text>
      </View>

      <Text style={styles.description}>{screening.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          Frequency: {screening.frequency === 'annual' ? 'Annually' : 'Every 2 years'}
        </Text>
        <Text style={styles.detailText}>
          Next due: {nextDueDate.toLocaleDateString()} ({daysUntilDue} days)
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isReminderSet && styles.buttonDisabled]}
        onPress={handleSetReminder}
        disabled={isReminderSet}
      >
        <Text style={styles.buttonText}>
          {isReminderSet ? 'Reminder Set' : 'Remind Me'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getScreeningIcon = (type: string) => {
  switch (type) {
    case 'mammogram':
    case 'pap_smear':
    case 'prostate_exam':
      return 'medical';
    case 'blood_pressure':
      return 'heart';
    case 'colonoscopy':
      return 'body';
    default:
      return 'alert-circle';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#4A89DC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PreventiveCareCard;
