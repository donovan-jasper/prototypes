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
      <ScrollView style={styles.contentScroll}>
        {calendarEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calendar Events</Text>
            {calendarEvents.map((event, index) => (
              <View key={index} style={[styles.item, styles.eventItem]}>
                <View style={styles.eventIndicator} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{event.title}</Text>
                  {event.startDate && (
                    <Text style={styles.itemTime}>
                      {formatTime(event.startDate)}
                      {event.endDate && ` - ${formatTime(event.endDate)}`}
                    </Text>
                  )}
                  {event.location && (
                    <Text style={styles.itemLocation}>{event.location}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {dateTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {dateTasks.map((task, index) => (
              <View key={index} style={[styles.item, styles.taskItem]}>
                <View style={[styles.taskIndicator, { backgroundColor: task.priority === 'high' ? '#FF3B30' : task.priority === 'medium' ? '#FF9500' : '#34C759' }]} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{task.title}</Text>
                  {task.dueDate && (
                    <Text style={styles.itemTime}>
                      Due: {formatTime(task.dueDate)}
                    </Text>
                  )}
                  {task.notes && (
                    <Text style={styles.itemNotes}>{task.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
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

      {permissionError && (
        <View style={styles.permissionError}>
          <Text style={styles.permissionErrorText}>{permissionError}</Text>
          <TouchableOpacity onPress={requestCalendarPermissions} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderSelectedDateContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  eventItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  taskItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  eventIndicator: {
    width: 8,
    height: '100%',
    backgroundColor: '#007AFF',
    marginRight: 12,
    borderRadius: 4,
  },
  taskIndicator: {
    width: 8,
    height: '100%',
    marginRight: 12,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  permissionError: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    margin: 16,
  },
  permissionErrorText: {
    color: '#C62828',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default CalendarScreen;
