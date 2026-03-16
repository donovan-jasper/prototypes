import { View, StyleSheet } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useContactStore } from '../../store/contactStore';
import ContactCard from '../../components/ContactCard';
import ReminderBadge from '../../components/ReminderBadge';

export default function HomeScreen() {
  const { contacts, overdueContacts } = useContactStore();
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        ConnectCircle
      </Text>

      {overdueContacts.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Overdue Contacts
          </Text>
          {overdueContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Upcoming Reminders
        </Text>
        {contacts
          .filter(contact => !overdueContacts.includes(contact))
          .map(contact => (
            <View key={contact.id} style={styles.reminderItem}>
              <ContactCard contact={contact} />
              <ReminderBadge contact={contact} />
            </View>
          ))}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/contact/new')}
      />
    </View>
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
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
