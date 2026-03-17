import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useContactStore } from '../../store/contactStore';
import InsightChart from '../../components/InsightChart';
import StreakDisplay from '../../components/StreakDisplay';
import { calculateStreakDays, getMonthlyStats } from '../../lib/analytics';
import { getInteractionsByContact } from '../../lib/database';

export default function InsightsScreen() {
  const { contacts, interactions } = useContactStore();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeStreaks, setActiveStreaks] = useState(0);
  const [mostContacted, setMostContacted] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);

  useEffect(() => {
    loadInsights();
  }, [contacts]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Calculate active streaks
      const streakPromises = contacts.map(async (contact) => {
        const streakDays = await calculateStreakDays(contact.id);
        return streakDays > 0 ? 1 : 0;
      });
      const streakResults = await Promise.all(streakPromises);
      const activeStreakCount = streakResults.reduce((sum, val) => sum + val, 0);
      setActiveStreaks(activeStreakCount);

      // Find most contacted
      if (contacts.length > 0) {
        const interactionCounts = await Promise.all(
          contacts.map(async (contact) => {
            const contactInteractions = await getInteractionsByContact(contact.id);
            return { contact, count: contactInteractions.length };
          })
        );
        
        const mostContactedData = interactionCounts.reduce((prev, current) => 
          current.count > prev.count ? current : prev
        );
        setMostContacted(mostContactedData.contact);
      }

      // Get monthly stats
      const allInteractions = await Promise.all(
        contacts.map(contact => getInteractionsByContact(contact.id))
      );
      const flatInteractions = allInteractions.flat();
      const stats = await getMonthlyStats(contacts, flatInteractions);
      setMonthlyStats(stats);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalContacts = contacts.length;

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Your Insights
      </Text>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Relationship Health
        </Text>
        <InsightChart contacts={contacts} />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Stats
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="bodyLarge">{totalContacts}</Text>
            <Text variant="bodyMedium">Total Contacts</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge">{activeStreaks}</Text>
            <Text variant="bodyMedium">Active Streaks</Text>
          </View>
        </View>
      </View>

      {monthlyStats && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            This Month
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{monthlyStats.totalCheckIns}</Text>
              <Text variant="bodyMedium">Check-ins</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{monthlyStats.longestStreak}</Text>
              <Text variant="bodyMedium">Longest Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{monthlyStats.averageScore}</Text>
              <Text variant="bodyMedium">Avg Score</Text>
            </View>
          </View>
        </View>
      )}

      {mostContacted && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Most Contacted
          </Text>
          <View style={styles.mostContacted}>
            <Text variant="titleSmall">{mostContacted.name}</Text>
            <StreakDisplay contactId={mostContacted.id} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  mostContacted: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
