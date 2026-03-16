import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useContactStore } from '../../store/contactStore';
import InsightChart from '../../components/InsightChart';
import StreakDisplay from '../../components/StreakDisplay';

export default function InsightsScreen() {
  const { contacts } = useContactStore();
  const theme = useTheme();

  // Calculate insights
  const totalContacts = contacts.length;
  const activeStreaks = contacts.filter(contact => {
    const streakDays = calculateStreakDays(contact);
    return streakDays > 0;
  }).length;

  const mostContacted = contacts.reduce((prev, current) => {
    const prevInteractions = getInteractionsByContact(prev.id).length;
    const currentInteractions = getInteractionsByContact(current.id).length;
    return prevInteractions > currentInteractions ? prev : current;
  }, contacts[0]);

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

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Most Contacted
        </Text>
        {mostContacted && (
          <View style={styles.mostContacted}>
            <Text variant="titleSmall">{mostContacted.name}</Text>
            <StreakDisplay contactId={mostContacted.id} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
