import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Contact } from '../types';
import ReminderBadge from './ReminderBadge';

interface ContactCardProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactCardProps) {
  const router = useRouter();
  const theme = useTheme();

  const getHealthColor = () => {
    const daysSinceLastContact = Math.floor(
      (new Date().getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastContact > contact.frequency * 1.5) {
      return theme.colors.error;
    } else if (daysSinceLastContact > contact.frequency) {
      return theme.colors.warning;
    } else {
      return theme.colors.success;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: getHealthColor() }]}
      onPress={() => router.push(`/contact/${contact.id}`)}
    >
      <View style={styles.info}>
        <Text variant="titleMedium">{contact.name}</Text>
        <Text variant="bodySmall">
          Last contact: {contact.lastContact.toDateString()}
        </Text>
      </View>
      <ReminderBadge contact={contact} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  info: {
    flex: 1,
  },
});
