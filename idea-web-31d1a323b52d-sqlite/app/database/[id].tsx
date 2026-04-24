import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TextInput as RNTextInput } from 'react-native';
import { FAB, ActivityIndicator, Card, Title, Paragraph, Portal, Modal, Button, TextInput, Searchbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import QueryResults from '../../components/QueryResults';
import { queryDatabase, insertRow, getDatabaseSchema } from '../../lib/database';
import { useStore } from '../../lib/store';
import { parseVoiceCommand, generateSQL } from '../../lib/ai';

export default function DatabaseScreen() {
  const { id } = useLocalSearchParams();
  const { databases } = useStore();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [schema, setSchema] = useState<Record<string, any>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const database = databases.find((db) => db.name === id);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await queryDatabase(id as string, `SELECT * FROM ${id}`);
      setRows(data);
    } catch (error) {
      console.error('Error fetching rows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const schemas = await getDatabaseSchema();
      if (schemas[id as string]) {
        setSchema(schemas[id as string]);
      }
    } catch (error) {
      console.error('Error fetching schema:', error);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchSchema();
  }, [id]);

  const handleVoiceInput = (text: string) => {
    setTranscription(text);
    parseVoiceInput(text);
  };

  const parseVoiceInput = (text: string) => {
    const parsed = parseVoiceCommand(text);

    if (parsed.action === 'insert' && parsed.fields) {
      const newFormData: Record<string, string> = {};
      parsed.fields.forEach(field => {
        if (field.name && field.value) {
          newFormData[field.name] = field.value.toString();
        }
      });
      setFormData(newFormData);
    }
  };

  const handleAddRow = async () => {
    if (Object.keys(formData).length === 0) {
      return;
    }

    setSaving(true);
    try {
      await insertRow(id as string, formData);
      await fetchRows();
      setModalVisible(false);
      setTranscription('');
      setFormData({});
    } catch (error) {
      console.error('Error inserting row:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const parsed = parseVoiceCommand(query);
      if (parsed.action === 'query') {
        const sql = generateSQL(parsed);
        const results = await queryDatabase(id as string, sql);
        setSearchResults(results);
      } else {
        // Fallback to simple text search
        const results = rows.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(query.toLowerCase())
          )
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Schema Header */}
      <View style={[styles.schemaHeader, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Title style={styles.schemaTitle}>Table Schema</Title>
        <View style={styles.schemaFields}>
          {schema.map((field, index) => (
            <View key={index} style={styles.schemaField}>
              <Paragraph style={styles.fieldName}>{field.name}</Paragraph>
              <Paragraph style={styles.fieldType}>{field.type}</Paragraph>
            </View>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search or ask a question..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
        style={styles.searchBar}
      />

      {/* Results Display */}
      {searchQuery ? (
        isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <QueryResults data={searchResults} />
        )
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                {Object.entries(item).map(([key, value]) => (
                  <View key={key} style={styles.row}>
                    <Title style={styles.fieldName}>{key}</Title>
                    <Paragraph style={styles.fieldValue}>{String(value)}</Paragraph>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Paragraph>No rows yet. Tap the + button to add data.</Paragraph>
            </View>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
        label="Add Record"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Add New Record</Title>

            <VoiceInput
              onResult={handleVoiceInput}
              placeholder="Say 'Add product: Laptop, quantity 5'"
            />

            {transcription ? (
              <Paragraph style={styles.transcriptionHint}>
                Parsed: {JSON.stringify(formData, null, 2)}
              </Paragraph>
            ) : null}

            {schema.map((field, index) => (
              <TextInput
                key={index}
                label={field.name}
                value={formData[field.name] || ''}
                onChangeText={(text) => updateFormField(field.name, text)}
                style={styles.input}
                mode="outlined"
                keyboardType={field.type === 'INTEGER' || field.type === 'REAL' ? 'numeric' : 'default'}
              />
            ))}

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  setTranscription('');
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddRow}
                loading={saving}
                disabled={Object.keys(formData).length === 0}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemaHeader: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  schemaTitle: {
    marginBottom: 8,
  },
  schemaFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  schemaField: {
    marginRight: 16,
    marginBottom: 8,
  },
  fieldName: {
    fontWeight: 'bold',
  },
  fieldType: {
    fontSize: 12,
    color: '#666',
  },
  searchBar: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  row: {
    marginBottom: 8,
  },
  fieldValue: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  transcriptionHint: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
});
