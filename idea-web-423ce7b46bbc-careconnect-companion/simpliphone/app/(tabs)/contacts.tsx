import { View, StyleSheet, FlatList } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import ContactCard from '../../components/ContactCard';
import { useContacts } from '../../hooks/useContacts';

export default function ContactsScreen() {
  const { theme } = useContext(SettingsContext);
  const { contacts, loadContacts } = useContacts();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setFavorites(contacts.filter(contact => contact.isFavorite));
  }, [contacts]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onCall={() => console.log(`Call ${item.name}`)}
            onMessage={() => console.log(`Message ${item.name}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
