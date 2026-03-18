import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useCareReminders } from '../hooks/useCareReminders';
import { getPlants } from '../lib/database';

export default function CareReminderItem({ reminder }: { reminder: any }) {
  const { completeReminder, snoozeReminder } = useCareReminders();
  const [plantName, setPlantName] = useState('');

  useEffect(() => {
    const loadPlantName = async () => {
      const plants = await getPlants();
      const plant = plants.find((p: any) => p.id === reminder.plantId);
      if (plant) {
        setPlantName(plant.name);
      }
    };
    loadPlantName();
  }, [reminder.plantId]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{reminder.type === 'water' ? '💧 Water' : reminder.type}</Text>
        <Text variant="bodyMedium">{plantName || `Plant #${reminder.plantId}`}</Text>
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
