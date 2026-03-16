import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function ContactCard({ contact, onCall, onMessage }) {
  const { theme } = useContext(SettingsContext);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: contact.isEmergency ? theme.colors.error : theme.colors.border }]}>
      <View style={styles.contactInfo}>
        {contact.photo ? (
          <Image source={{ uri: contact.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.initials, { color: theme.colors.onPrimary }]}>
              {contact.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
        <Text style={[styles.name, { color: theme.colors.text }]}>{contact.name}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={`Call ${contact.name}`}
        >
          <MaterialIcons name="phone" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel={`Message ${contact.name}`}
        >
          <MaterialIcons name="message" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initials: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
