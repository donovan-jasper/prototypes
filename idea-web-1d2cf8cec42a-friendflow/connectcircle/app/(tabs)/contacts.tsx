import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useContactStore } from '../../store/contactStore';
import ContactCard from '../../components/ContactCard';

export default function ContactsScreen() {
  const { contacts } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search contacts"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="titleMedium">No contacts found</Text>
          <Text variant="bodyMedium">Add your first contact to get started</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={({ item }) => <ContactCard contact={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
