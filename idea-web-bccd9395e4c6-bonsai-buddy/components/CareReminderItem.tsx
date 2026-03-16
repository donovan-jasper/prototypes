import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useCareReminders } from '../hooks/useCareReminders';

export default function CareReminderItem({ reminder }: { reminder: any }) {
  const { completeReminder, snoozeReminder } = useCareReminders();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{reminder.type}</Text>
        <Text variant="bodyMedium">Plant ID: {reminder.plantId}</Text>
        <Text variant="bodySmall">
          Scheduled: {new Date(reminder.scheduledFor).toLocaleString()}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => completeReminder(reminder.id)}>Done</Button>
        <Button onPress={() => snoozeReminder(reminder.id, 1)}>Snooze 1h</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
