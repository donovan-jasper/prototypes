import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useContactStore } from '../store/contactStore';

interface StreakDisplayProps {
  contactId: string;
}

export default function StreakDisplay({ contactId }: StreakDisplayProps) {
  const { contacts } = useContactStore();
  const theme = useTheme();

  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return null;

  const streakDays = calculateStreakDays(contact);

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
