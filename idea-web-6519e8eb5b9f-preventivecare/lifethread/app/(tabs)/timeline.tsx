import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTimeline } from '../../hooks/useTimeline';
import TimelineEvent from '../../components/TimelineEvent';
import { Ionicons } from '@expo/vector-icons';

export default function TimelineScreen() {
  const { events, loadTimeline } = useTimeline();

  useEffect(() => {
    loadTimeline();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#673ab7" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.eventsContainer}>
        {events.map(event => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  eventsContainer: {
    marginTop: 16,
  },
});
