import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReminderCard from '@/components/ReminderCard';
import PremiumGate from '@/components/PremiumGate';
import { useReminders } from '@/hooks/useReminders';
import { usePremium } from '@/hooks/usePremium';
import { BodyZone } from '@/types';
import { Colors } from '@/constants/colors';

export default function RemindersScreen() {
  const { reminders, loading, addReminder, removeReminder, toggleReminder } = useReminders();
  const { isPremium, purchasePremium } = usePremium();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showBodyZonePicker, setShowBodyZonePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedBodyZone, setSelectedBodyZone] = useState<BodyZone>('jaw');
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const bodyZones: BodyZone[] = ['jaw', 'neck', 'shoulders', 'hands', 'forehead'];

  const handleAddReminder = () => {
    if (!isPremium && reminders.length >= 3) {
      setShowPremiumGate(true);
      return;
    }
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (date) {
      setSelectedTime(date);
      if (Platform.OS === 'ios') {
        setShowTimePicker(false);
      }
      setShowBodyZonePicker(true);
    } else if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  };

  const handleBodyZoneSelect = async (zone: BodyZone) => {
    setSelectedBodyZone(zone);
    setShowBodyZonePicker(false);
    
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    try {
      await addReminder(timeString, zone);
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      await toggleReminder(id, enabled);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeReminder(id);
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleUpgrade = () => {
    purchasePremium();
    setShowPremiumGate(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          {isPremium ? 'Unlimited reminders' : `${reminders.length}/3 reminders`}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyText}>
              Add your first reminder to start building healthy tension-release habits
            </Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeConfirm}
        />
      )}

      {showBodyZonePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.bodyZoneModal}>
            <Text style={styles.modalTitle}>Select Body Zone</Text>
            <Text style={styles.modalSubtitle}>Which area would you like to focus on?</Text>
            
            {bodyZones.map((zone) => (
              <TouchableOpacity
                key={zone}
                style={[
                  styles.bodyZoneOption,
                  !isPremium && zone !== 'jaw' && styles.bodyZoneOptionDisabled
                ]}
                onPress={() => {
                  if (isPremium || zone === 'jaw') {
                    handleBodyZoneSelect(zone);
                  } else {
                    setShowBodyZonePicker(false);
                    setShowPremiumGate(true);
                  }
                }}
              >
                <Text style={[
                  styles.bodyZoneText,
                  !isPremium && zone !== 'jaw' && styles.bodyZoneTextDisabled
                ]}>
                  {zone.charAt(0).toUpperCase() + zone.slice(1)}
                </Text>
                {!isPremium && zone !== 'jaw' && (
                  <Text style={styles.premiumBadge}>Premium</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBodyZonePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bodyZoneModal: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 24,
    textAlign: 'center',
  },
  bodyZoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  bodyZoneOptionDisabled: {
    opacity: 0.6,
  },
  bodyZoneText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
  },
  bodyZoneTextDisabled: {
    color: Colors.light.icon,
  },
  premiumBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.tint,
    backgroundColor: Colors.light.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.light.icon,
    fontSize: 16,
    textAlign: 'center',
  },
});
