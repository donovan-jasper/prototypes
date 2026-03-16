import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { InsightsChart } from '../components/InsightsChart';
import { AppContext } from '../context/AppContext';
import { Session } from '../types';

export const HistoryScreen: React.FC = () => {
  const { sessions, getSessions } = useContext(AppContext);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  useEffect(() => {
    getSessions();
  }, []);

  useEffect(() => {
    // Filter sessions for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    setFilteredSessions(sessions.filter(session => new Date(session.startTime) >= sevenDaysAgo));
  }, [sessions]);

  const formatDuration = (startTime: number, endTime: number) => {
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Session History</Text>

      <InsightsChart sessions={filteredSessions} />

      <View style={styles.sessionList}>
        {filteredSessions.map(session => (
          <View key={session.id} style={styles.sessionItem}>
            <Text style={styles.sessionDate}>{new Date(session.startTime).toLocaleDateString()}</Text>
            <Text style={styles.sessionTime}>
              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.sessionDuration}>
              Duration: {formatDuration(session.startTime, session.endTime)}
            </Text>
            <Text style={styles.sessionEvents}>
              Drowsiness events: {session.drowsinessEvents}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sessionList: {
    marginTop: 20,
  },
  sessionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#666',
  },
  sessionEvents: {
    fontSize: 14,
    color: '#666',
  },
});
