import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useCareReminders } from '../../hooks/useCareReminders';
import { useStreak } from '../../hooks/useStreak';
import CareReminderItem from '../../components/CareReminderItem';
import StreakBadge from '../../components/StreakBadge';

export default function CareScreen() {
  const { reminders, loading, loadReminders } = useCareReminders();
  const { currentStreak } = useStreak();

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <View style={styles.container}>
      <StreakBadge streak={currentStreak} />
      {reminders.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="headlineMedium">No care tasks today!</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          renderItem={({ item }) => <CareReminderItem reminder={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
});
