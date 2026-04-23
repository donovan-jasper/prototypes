import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as ExpoCalendar from 'expo-calendar';
import { getTasks } from '../utils/database';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    requestCalendarPermissions();
    loadTasks();
  }, []);

  useEffect(() => {
    if (hasCalendarPermission && selectedDate) {
      loadCalendarEvents(selectedDate);
    }
  }, [selectedDate, hasCalendarPermission]);

  const requestCalendarPermissions = async () => {
    setIsLoading(true);
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHasCalendarPermission(true);
        setPermissionError(null);
      } else {
        setPermissionError('Calendar access is needed to show your events. You can enable it in settings.');
        Alert.alert(
          'Calendar Permission',
          'Calendar access is needed to show your events. You can enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      setPermissionError('Failed to request calendar permissions. Please try again.');
      Alert.alert(
        'Permission Error',
        'Failed to request calendar permissions. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);

      const marked = {};
      loadedTasks.forEach(task => {
        if (task.dueDate) {
          const dateKey = task.dueDate.split('T')[0];
          marked[dateKey] = {
            marked: true,
            dotColor: '#007AFF',
            ...(marked[dateKey] || {})
          };
        }
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert(
        'Data Error',
        'Failed to load tasks. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendarEvents = async (date) => {
    if (!hasCalendarPermission) return;

    setIsLoading(true);
    try {
      const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);

      if (calendars.length === 0) {
        setCalendarEvents([]);
        return;
      }

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const events = await ExpoCalendar.getEventsAsync(
        calendars.map(cal => cal.id),
        startDate,
        endDate
      );

      setCalendarEvents(events || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setCalendarEvents([]);
      Alert.alert(
        'Calendar Error',
        'Failed to load calendar events. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.split('T')[0];
      return taskDate === date;
    });
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderSelectedDateContent = () => {
    if (!selectedDate) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Select a date to view events and tasks</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    const dateTasks = getTasksForDate(selectedDate);
    const hasContent = calendarEvents.length > 0 || dateTasks.length > 0;

    if (!hasContent) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No events or tasks for this day</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.contentContainer}>
        {calendarEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calendar Events</Text>
            <FlatList
              data={calendarEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.eventItem, { backgroundColor: item.color || '#f0f0f0' }]}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventTime}>
                    {formatTime(item.startDate)} - {formatTime(item.endDate)}
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {dateTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <FlatList
              data={dateTasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.taskItem, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.notes && <Text style={styles.taskNotes}>{item.notes}</Text>}
                  <Text style={styles.taskTime}>{formatTime(item.dueDate)}</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ffcccc';
      case 'medium': return '#fff2cc';
      case 'low': return '#e6ffe6';
      default: return '#f0f0f0';
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#007AFF'
          }
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      {renderSelectedDateContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  eventItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
  },
  taskItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskNotes: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CalendarScreen;
