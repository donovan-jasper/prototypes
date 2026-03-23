import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { getUpcomingEvents } from '../../services/data/eventRepository';
import { schedulePersistentAlert, scheduleFullScreenAlert, setupNotificationListeners } from '../../services/notifications/notificationService';
import EventCard from '../../components/dashboard/EventCard';
import FullScreenAlert from '../alerts/FullScreenAlert';

export default function DashboardScreen() {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fullScreenAlertVisible, setFullScreenAlertVisible] = useState(false);
  const [alertedEventId, setAlertedEventId] = useState(null);

  const loadEvents = async () => {
    try {
      const upcomingEvents = await getUpcomingEvents();
      setEvents(upcomingEvents);
      
      // Schedule notifications for upcoming events
      for (const event of upcomingEvents) {
        if (event.isCritical) {
          await scheduleFullScreenAlert(event);
        }
        await schedulePersistentAlert(event);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    // Setup notification listeners
    const unsubscribe = setupNotificationListeners(handleFullScreenAlert);
    
    loadEvents();
    
    return () => {
      unsubscribe(); // Clean up listeners
    };
  }, []);

  const handleFullScreenAlert = (eventId) => {
    setAlertedEventId(eventId);
    setFullScreenAlertVisible(true);
  };

  const hideFullScreenAlert = () => {
    setFullScreenAlertVisible(false);
    setAlertedEventId(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const renderEvent = ({ item }) => <EventCard event={item} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
      
      {/* Full Screen Alert Component */}
      <FullScreenAlert
        visible={fullScreenAlertVisible}
        eventId={alertedEventId}
        onClose={hideFullScreenAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
