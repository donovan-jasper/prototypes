import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllAppointments, updateAppointment, deleteAppointment } from '../../lib/appointmentService';
import { getFamilyMembers } from '../../lib/familyService';
import { Appointment, FamilyMember } from '../../types';
import AppointmentCard from '../../components/AppointmentCard';
import { isPast, isToday } from 'date-fns';

type FilterType = 'all' | 'upcoming' | 'past';
type SortType = 'date' | 'member';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [appointmentsData, membersData] = await Promise.all([
      getAllAppointments(),
      getFamilyMembers(),
    ]);
    setAppointments(appointmentsData);
    setFamilyMembers(membersData);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleComplete = async (id: number) => {
    try {
      await updateAppointment(id, { completed: true });
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete appointment');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Filter by member
    if (selectedMemberId) {
      filtered = filtered.filter(a => a.familyMemberId === selectedMemberId);
    }

    // Filter by time
    if (filter === 'upcoming') {
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return !a.completed && (!isPast(date) || isToday(date));
      });
    } else if (filter === 'past') {
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return a.completed || (isPast(date) && !isToday(date));
      });
    }

    // Sort
    if (sort === 'date') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'member') {
      filtered.sort((a, b) => {
        const memberA = familyMembers.find(m => m.id === a.familyMemberId);
        const memberB = familyMembers.find(m => m.id === b.familyMemberId);
        return (memberA?.name || '').localeCompare(memberB?.name || '');
      });
    }

    return filtered;
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const member = familyMembers.find(m => m.id === item.familyMemberId);
    return (
      <AppointmentCard
        appointment={item}
        familyMember={member}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    );
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
            onPress={() => setFilter('upcoming')}
          >
            <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
            onPress={() => setFilter('past')}
          >
            <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>Past</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, sort === 'date' && styles.filterButtonActive]}
            onPress={() => setSort('date')}
          >
            <Ionicons name="calendar-outline" size={16} color={sort === 'date' ? '#fff' : '#007AFF'} />
            <Text style={[styles.filterText, sort === 'date' && styles.filterTextActive]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sort === 'member' && styles.filterButtonActive]}
            onPress={() => setSort('member')}
          >
            <Ionicons name="person-outline" size={16} color={sort === 'member' ? '#fff' : '#007AFF'} />
            <Text style={[styles.filterText, sort === 'member' && styles.filterTextActive]}>Member</Text>
          </TouchableOpacity>
        </View>

        {familyMembers.length > 0 && (
          <View style={styles.memberFilterRow}>
            <TouchableOpacity
              style={[styles.memberFilterButton, selectedMemberId === null && styles.memberFilterButtonActive]}
              onPress={() => setSelectedMemberId(null)}
            >
              <Text style={[styles.memberFilterText, selectedMemberId === null && styles.memberFilterTextActive]}>
                All Members
              </Text>
            </TouchableOpacity>
            {familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberFilterButton, selectedMemberId === member.id && styles.memberFilterButtonActive]}
                onPress={() => setSelectedMemberId(member.id)}
              >
                <Text style={[styles.memberFilterText, selectedMemberId === member.id && styles.memberFilterTextActive]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {filteredAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Appointments</Text>
          <Text style={styles.emptyText}>
            {filter === 'upcoming' ? 'No upcoming appointments scheduled' : 
             filter === 'past' ? 'No past appointments' : 
             'Add your first appointment to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/appointment/add')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  memberFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  memberFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  memberFilterText: {
    fontSize: 13,
    color: '#007AFF',
  },
  memberFilterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
