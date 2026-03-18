import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { appointments, updateAppointment, removeAppointment } = useStore((state) => ({
    appointments: state.appointments,
    updateAppointment: state.updateAppointment,
    removeAppointment: state.removeAppointment,
  }));

  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appointment not found</Text>
        </View>
      </View>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();

  const handleMarkComplete = () => {
    updateAppointment(appointment.id, { completed: true });
  };

  const handleMarkIncomplete = () => {
    updateAppointment(appointment.id, { completed: false });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAppointment(appointment.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[
          styles.statusBanner,
          appointment.completed && styles.completedBanner
        ]}>
          <Text style={styles.statusText}>
            {appointment.completed ? '✓ Completed' : isUpcoming ? 'Upcoming' : 'Past'}
          </Text>
        </View>

        <Text style={styles.title}>{appointment.title}</Text>

        <View style={styles.detailSection}>
          <Text style={styles.label}>Provider</Text>
          <Text style={styles.value}>{appointment.provider}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.value}>
            {format(appointmentDate, 'h:mm a')}
          </Text>
        </View>

        <View style={styles.actions}>
          {!appointment.completed ? (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkComplete}
            >
              <Text style={styles.completeButtonText}>✓ Mark Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.incompleteButton}
              onPress={handleMarkIncomplete}
            >
              <Text style={styles.incompleteButtonText}>Mark Incomplete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Appointment</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  statusBanner: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  completedBanner: {
    backgroundColor: '#C8E6C9',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  incompleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  incompleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});
