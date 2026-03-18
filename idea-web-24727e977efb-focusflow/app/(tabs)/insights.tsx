import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getCompletedSessions, initDB } from '../../lib/db';

interface SessionData {
  id: string;
  start_time: number;
  end_time: number;
  duration: number;
  completed: boolean;
}

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      await initDB();
      const completedSessions = await getCompletedSessions();
      setSessions(completedSessions);
      
      const calculatedStreak = calculateStreak(completedSessions);
      setStreak(calculatedStreak);
      
      const totalMinutes = completedSessions.reduce((sum, session) => sum + session.duration, 0);
      setTotalFocusTime(totalMinutes);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: SessionData[]): number => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionDates = sessions.map(s => {
      const date = new Date(s.start_time);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);
    
    let currentStreak = 0;
    let expectedDate = today.getTime();
    
    for (const date of uniqueDates) {
      if (date === expectedDate) {
        currentStreak++;
        expectedDate -= 24 * 60 * 60 * 1000;
      } else if (date < expectedDate) {
        break;
      }
    }
    
    return currentStreak;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
          <Text style={styles.statDescription}>
            {streak === 0 ? 'Start your first session' : 'Keep it going!'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(totalFocusTime)}</Text>
          <Text style={styles.statLabel}>Total Focus Time</Text>
          <Text style={styles.statDescription}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} completed
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete your first focus session to see it here
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.slice(0, 10).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>{formatDate(session.start_time)}</Text>
                  <Text style={styles.sessionDuration}>{session.duration} min</Text>
                </View>
                <Text style={styles.sessionTime}>
                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
  },
});
