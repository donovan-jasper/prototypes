import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TextInput as RNTextInput, Alert } from 'react-native';
import { FAB, ActivityIndicator, Card, Title, Paragraph, Portal, Modal, Button, TextInput, Searchbar, useTheme, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import QueryResults from '../../components/QueryResults';
import { queryDatabase, insertRow, getDatabaseSchema, deleteRow } from '../../lib/database';
import { useStore } from '../../lib/store';
import { parseVoiceCommand, generateSQL } from '../../lib/ai';
import { Swipeable } from 'react-native-gesture-handler';

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

  const handleDeleteRow = async (rowId: number) => {
    try {
      await deleteRow(id as string, rowId);
      await fetchRows();
    } catch (error) {
      console.error('Error deleting row:', error);
      Alert.alert('Error', 'Failed to delete row');
    }
  };

  const renderRightActions = (rowId: number) => {
    return (
      <View style={styles.deleteAction}>
        <IconButton
          icon="delete"
          color="white"
          size={24}
          onPress={() => handleDeleteRow(rowId)}
        />
      </View>
    );
  };

  const renderRow = ({ item }: { item: any }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <Card style={styles.card}>
          <Card.Content>
            {Object.entries(item).map(([key, value]) => {
              if (key === 'id') return null;
              return (
                <View key={key} style={styles.row}>
                  <Paragraph style={styles.label}>{key.replace(/_/g, ' ')}:</Paragraph>
                  <Paragraph style={styles.value}>{value}</Paragraph>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </Swipeable>
    );
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
      {searchResults.length > 0 ? (
        <QueryResults data={searchResults} />
      ) : (
        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Add Row Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add New Record</Title>

          <VoiceInput
            onTranscription={handleVoiceInput}
            placeholder="Speak to add a new record..."
            style={styles.voiceInput}
          />

          {transcription ? (
            <Paragraph style={styles.transcription}>Transcription: {transcription}</Paragraph>
          ) : null}

          <ScrollView style={styles.formContainer}>
            {schema.map((field, index) => {
              if (field.name === 'id') return null;
              return (
                <TextInput
                  key={index}
                  label={field.name.replace(/_/g, ' ')}
                  value={formData[field.name] || ''}
                  onChangeText={(text) => updateFormField(field.name, text)}
                  style={styles.formField}
                  keyboardType={field.type === 'INTEGER' || field.type === 'REAL' ? 'numeric' : 'default'}
                />
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAddRow}
              loading={saving}
              disabled={Object.keys(formData).length === 0}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />
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
    flexDirection: 'row',
    marginRight: 16,
    marginBottom: 8,
  },
  fieldName: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  fieldType: {
    color: '#666',
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  value: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  voiceInput: {
    marginVertical: 16,
  },
  transcription: {
    marginBottom: 16,
    color: '#666',
  },
  formContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  formField: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  deleteAction: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
    height: '100%',
  },
});
