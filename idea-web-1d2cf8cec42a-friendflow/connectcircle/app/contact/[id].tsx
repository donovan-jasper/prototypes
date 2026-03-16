import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContactStore } from '../../store/contactStore';
import ActionButton from '../../components/ActionButton';
import StreakDisplay from '../../components/StreakDisplay';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const { contacts, deleteContact } = useContactStore();
  const router = useRouter();
  const theme = useTheme();

  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium">Contact not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteContact(contact.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{contact.name}</Text>
        <StreakDisplay contactId={contact.id} />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Contact Info
        </Text>
        {contact.phone && (
          <Text variant="bodyLarge">Phone: {contact.phone}</Text>
        )}
        {contact.email && (
          <Text variant="bodyLarge">Email: {contact.email}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Relationship
        </Text>
        <Text variant="bodyLarge">Type: {contact.relationship || 'Friend'}</Text>
        <Text variant="bodyLarge">Frequency: Every {contact.frequency} days</Text>
        <Text variant="bodyLarge">Last Contact: {contact.lastContact.toDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Actions
        </Text>
        <View style={styles.actionButtons}>
          <ActionButton
            icon="phone"
            label="Call"
            onPress={() => {}}
          />
          <ActionButton
            icon="message"
            label="Text"
            onPress={() => {}}
          />
          <ActionButton
            icon="calendar"
            label="Schedule"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notes
        </Text>
        <Text variant="bodyLarge">{contact.notes || 'No notes added'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => router.push(`/contact/edit/${contact.id}`)}
          style={styles.button}
        >
          Edit Contact
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.button}
          textColor={theme.colors.error}
        >
          Delete Contact
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginBottom: 8,
  },
});
