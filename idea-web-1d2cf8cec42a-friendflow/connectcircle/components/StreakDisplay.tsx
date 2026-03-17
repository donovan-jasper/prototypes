import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { calculateStreakDays } from '../lib/analytics';

interface StreakDisplayProps {
  contactId: string;
}

export default function StreakDisplay({ contactId }: StreakDisplayProps) {
  const theme = useTheme();
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, [contactId]);

  const loadStreak = async () => {
    setLoading(true);
    try {
      const days = await calculateStreakDays(contactId);
      setStreakDays(days);
    } catch (error) {
      console.error('Error loading streak:', error);
      setStreakDays(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium">Streak:</Text>
      <Text variant="bodyLarge" style={styles.streak}>
        {streakDays} days
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streak: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
