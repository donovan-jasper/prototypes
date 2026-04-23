import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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
            {calendarEvents.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTime}>{formatTime(event.startDate)}</Text>
                  {event.endDate && <Text style={styles.eventTime}> - {formatTime(event.endDate)}</Text>}
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.location && <Text style={styles.eventLocation}>{event.location}</Text>}
              </View>
            ))}
          </View>
        )}

        {dateTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {dateTasks.map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <View style={[styles.taskPriorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.notes && <Text style={styles.taskNotes}>{task.notes}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#007AFF'
          }
        }}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayTextColor: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
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
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666666',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666666',
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  taskPriorityIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  taskNotes: {
    fontSize: 14,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666666',
  },
});

export default CalendarScreen;
