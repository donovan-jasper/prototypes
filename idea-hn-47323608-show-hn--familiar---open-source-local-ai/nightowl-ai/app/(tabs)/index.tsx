import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNightShift } from '@/hooks/useNightShift';
import { useTasks } from '@/hooks/useTasks';

export default function HomeScreen() {
  const { isEnabled, schedule } = useNightShift();
  const { tasks } = useTasks();

  const recentTasks = tasks.slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NightOwl AI</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Night Shift Status</Text>
        <Text>
          {isEnabled ? 'Enabled' : 'Disabled'} - {schedule.startHour}:00 to {schedule.endHour}:00
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        {recentTasks.length > 0 ? (
          recentTasks.map(task => (
            <View key={task.id} style={styles.taskItem}>
              <Text>{task.type}</Text>
              <Text>{task.status}</Text>
            </View>
          ))
        ) : (
          <Text>No recent tasks</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {/* Add quick action buttons here */}
      </View>
    </View>
  );
}

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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
