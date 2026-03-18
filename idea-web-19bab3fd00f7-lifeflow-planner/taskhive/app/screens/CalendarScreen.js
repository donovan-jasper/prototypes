import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as ExpoCalendar from 'expo-calendar';
import { getTasks } from '../utils/database';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);

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
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHasCalendarPermission(true);
      } else {
        Alert.alert(
          'Calendar Permission',
          'Calendar access is needed to show your events. You can enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
    }
  };

  const loadTasks = async () => {
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
    }
  };

  const loadCalendarEvents = async (date) => {
    if (!hasCalendarPermission) return;

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
                <View style={styles.taskIndicator} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{task.title}</Text>
                  {task.notes && (
                    <Text style={styles.itemNotes}>{task.notes}</Text>
                  )}
                  <Text style={styles.itemCategory}>{task.category || 'General'}</Text>
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
            selected: true,
            selectedColor: '#007AFF',
            ...(markedDates[selectedDate] || {})
          }
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#007AFF',
          dotColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      
      <View style={styles.contentContainer}>
        {selectedDate && (
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        )}
        {renderSelectedDateContent()}
      </View>
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
    padding: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  contentScroll: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
    marginTop: 6,
  },
  taskIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
    marginTop: 6,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CalendarScreen;
