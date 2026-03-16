import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import { getDocuments } from '@/lib/database';
import { DocumentCard } from '@/components/DocumentCard';

export default function VaultScreen() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
    setFilteredDocuments(docs);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = documents.filter(doc =>
      doc.ocrText.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(id);
            loadDocuments();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search documents"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        onRefresh={loadDocuments}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
