import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';

export interface Contact {
  id: string;
  name: string;
  phoneNumbers: { number: string }[];
  emails?: { email: string }[];
}

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please enable contacts permission in your device settings to import friends.'
    );
    return false;
  }
  return true;
}

export async function getContacts(): Promise<Contact[]> {
  const hasPermission = await requestContactsPermission();
  if (!hasPermission) {
    return [];
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
  });

  if (data.length === 0) {
    Alert.alert('No Contacts', 'No contacts found on your device.');
    return [];
  }

  return data.map(contact => ({
    id: contact.id,
    name: contact.name || 'Unknown',
    phoneNumbers: contact.phoneNumbers || [],
    emails: contact.emails || [],
  }));
}

export function filterContacts(contacts: Contact[], searchQuery: string): Contact[] {
  if (!searchQuery) return contacts;

  const query = searchQuery.toLowerCase();
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(query) ||
    (contact.phoneNumbers && contact.phoneNumbers.some(pn =>
      pn.number.toLowerCase().includes(query)
    ))
  );
}
