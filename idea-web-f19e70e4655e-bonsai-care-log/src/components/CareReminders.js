import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CareReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate API call to fetch care reminders
    const fetchReminders = async () => {
      try {
        // In a real app, this would be an actual API call
        const mockReminders = [
          {
            id: '1',
            plantId: '1',
            plantName: 'Big Monsta',
            type: 'watering',
            dueDate: '2023-05-22',
            frequency: 7,
            lastCompleted: '2023-05-15'
          },
          {
            id: '2',
            plantId: '2',
            plantName: 'Sly Snake',
            type: 'watering',
            dueDate: '2023-05-24',
            frequency: 14,
            lastCompleted: '2023-05-10'
          },
          {
            id: '3',
            plantId: '1',
            plantName: 'Big Monsta',
            type: 'fertilizing',
            dueDate: '2023-05-15',
            frequency: 30,
            lastCompleted: '2023-04-15'
          },
          {
            id: '4',
            plantId: '3',
            plantName: 'Golden Pothos',
            type: 'watering',
            dueDate: '2023-05-06',
            frequency: 5,
            lastCompleted: '2023-05-01'
          }
        ];
        setReminders(mockReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const calculateDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'watering':
        return '💧';
      case 'fertilizing':
        return '🌱';
      case 'repotting':
        return '🪴';
      default:
        return '⚠️';
    }
  };

  const renderReminderItem = ({ item }) => {
    const daysUntil = calculateDaysUntil(item.dueDate);
    const isUrgent = daysUntil <= 3;

    return (
      <TouchableOpacity
        style={[
          styles.reminderCard,
          isUrgent ? styles.urgentCard : styles.normalCard
        ]}
        onPress={() => navigation.navigate('PlantDetail', { plantId: item.plantId })}
      >
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderIcon}>{getReminderIcon(item.type)}</Text>
          <Text style={styles.plantName}>{item.plantName}</Text>
        </View>
        <Text style={styles.reminderType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={styles.reminderDue}>
          {daysUntil <= 0 ? 'Overdue' : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
        </Text>
        <View style={styles.reminderFooter}>
          <Text style={styles.reminderFrequency}>
            Every {item.frequency} days
          </Text>
          <Text style={styles.reminderLastCompleted}>
            Last done: {item.lastCompleted}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Care Reminders</Text>
      {reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No upcoming care reminders!</Text>
          <Text style={styles.emptySubtext}>All your plants are well taken care of.</Text>
        </View>
      ) : (
        <FlatList
          data={reminders.sort((a, b) => {
            const daysA = calculateDaysUntil(a.dueDate);
            const daysB = calculateDaysUntil(b.dueDate);
            return daysA - daysB;
          })}
          renderItem={renderReminderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    paddingBottom: 20,
  },
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  urgentCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  normalCard: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderType: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  reminderDue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderFrequency: {
    fontSize: 14,
    color: '#666',
  },
  reminderLastCompleted: {
    fontSize: 14,
    color: '#666',
  },
});

export default CareReminders;
