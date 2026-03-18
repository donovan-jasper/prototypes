import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReminderCard from '@/components/ReminderCard';
import PremiumGate from '@/components/PremiumGate';
import { useReminders } from '@/hooks/useReminders';
import { BodyZone } from '@/types';
import { Colors } from '@/constants/colors';

const BODY_ZONES: BodyZone[] = ['jaw', 'neck', 'shoulders', 'hands', 'forehead'];
const FREE_REMINDER_LIMIT = 3;

export default function RemindersScreen() {
  const { reminders, loading, addReminder, removeReminder, toggleReminder } = useReminders();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedBodyZone, setSelectedBodyZone] = useState<BodyZone>('jaw');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isPremium = false; // Mock for MVP

  const handleAddReminder = () => {
    if (!isPremium && reminders.length >= FREE_REMINDER_LIMIT) {
      setShowPremiumGate(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleSaveReminder = async () => {
    try {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      await addReminder(timeString, selectedBodyZone);
      setShowAddModal(false);
      setSelectedTime(new Date());
      setSelectedBodyZone('jaw');
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await removeReminder(id);
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleToggleReminder = async (id: number, enabled: boolean) => {
    try {
      await toggleReminder(id, enabled);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const handleUpgrade = () => {
    setShowPremiumGate(false);
    // Mock upgrade flow
    console.log('Upgrade to premium');
  };

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          {reminders.length} of {isPremium ? '∞' : FREE_REMINDER_LIMIT} reminders
        </Text>
      </View>

      <View style={styles.content}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first reminder</Text>
          </View>
        ) : (
          <FlatList
            data={reminders}
            renderItem={({ item }) => (
              <ReminderCard
                reminder={item}
                onToggle={handleToggleReminder}
                onDelete={handleDeleteReminder}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddReminder}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Reminder</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Time</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  style={styles.timePicker}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>
                      {selectedTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="default"
                      onChange={onTimeChange}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Body Zone</Text>
              <View style={styles.bodyZoneGrid}>
                {BODY_ZONES.map((zone) => (
                  <TouchableOpacity
                    key={zone}
                    style={[
                      styles.bodyZoneButton,
                      selectedBodyZone === zone && styles.bodyZoneButtonActive,
                    ]}
                    onPress={() => setSelectedBodyZone(zone)}
                  >
                    <Text
                      style={[
                        styles.bodyZoneText,
                        selectedBodyZone === zone && styles.bodyZoneTextActive,
                      ]}
                    >
                      {zone.charAt(0).toUpperCase() + zone.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveReminder}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    fontSize: 14,
    color: Colors.light.icon,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  list: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  timePicker: {
    width: '100%',
  },
  timeButton: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeButtonText: {
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
  },
  bodyZoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bodyZoneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  bodyZoneButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  bodyZoneText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  bodyZoneTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
