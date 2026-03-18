import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import AppointmentCard from '../../components/AppointmentCard';

export default function DashboardScreen() {
  const router = useRouter();
  const appointments = useStore((state) => state.appointments);
  
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Health Dashboard</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/appointment/add')}
        >
          <Text style={styles.addButtonText}>+ Add Appointment</Text>
        </TouchableOpacity>
      </View>

      {sortedAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptyText}>
            Tap "Add Appointment" to schedule your first checkup
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedAppointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard 
              appointment={item}
              onPress={() => router.push(`/appointment/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
