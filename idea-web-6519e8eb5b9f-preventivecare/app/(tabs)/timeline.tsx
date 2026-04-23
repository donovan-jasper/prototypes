import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { getTimelineEvents } from '../../lib/timeline';
import TimelineEvent from '../../components/TimelineEvent';
import { format } from 'date-fns';

const TimelineScreen = () => {
  const user = useAppStore(state => state.user);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineEvents();
  }, [user]);

  const loadTimelineEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await getTimelineEvents(undefined, undefined, user?.id);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDate = (events: any[]) => {
    const groups: { [key: string]: any[] } = {};

    events.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.entries(groups).map(([date, events]) => ({
      date,
      events,
      displayDate: format(new Date(date), 'MMMM d, yyyy')
    }));
  };

  const groupedEvents = groupEventsByDate(events);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedEvents}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{item.displayDate}</Text>
            {item.events.map(event => (
              <TimelineEvent
                key={event.id}
                event={event}
                onPress={() => {}}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events in your timeline yet.</Text>
            <Text style={styles.emptySubtext}>Add your first event to get started!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default TimelineScreen;
