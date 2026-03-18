import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { FAB, ActivityIndicator, Card, Title, Paragraph, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VoiceInput from '../../components/VoiceInput';
import { queryDatabase, insertRow } from '../../lib/database';
import { useStore } from '../../lib/store';

export default function DatabaseScreen() {
  const { id } = useLocalSearchParams();
  const { databases } = useStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const database = databases.find((db) => db.name === id);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await queryDatabase(id as string, 'SELECT * FROM ' + id);
      setRows(data);
    } catch (error) {
      console.error('Error fetching rows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [id]);

  const handleVoiceInput = (text: string) => {
    setTranscription(text);
    parseVoiceInput(text);
  };

  const parseVoiceInput = (text: string) => {
    // Parse voice input like "Add product: Laptop, quantity 5"
    const addRegex = /add\s+(.+?):\s*(.+)/i;
    const match = text.match(addRegex);
    
    if (match) {
      const pairs = match[2].split(',').map(pair => pair.trim());
      const parsed: Record<string, string> = {};
      
      pairs.forEach(pair => {
        const [key, ...valueParts] = pair.split(/\s+/);
        const value = valueParts.join(' ');
        if (key && value) {
          parsed[key.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = value;
        }
      });
      
      setFormData(parsed);
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

  const getFields = () => {
    if (rows.length > 0) {
      return Object.keys(rows[0]).filter(key => key !== 'id');
    }
    return database?.fields?.map(f => f.name) || [];
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
      <FlatList
        data={rows}
        keyExtractor={(item, index) => index.toString()}
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
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Add New Row</Title>
            
            <VoiceInput onTranscription={handleVoiceInput} />
            
            {transcription ? (
              <Paragraph style={styles.transcriptionHint}>
                Parsed: {JSON.stringify(formData, null, 2)}
              </Paragraph>
            ) : null}

            {getFields().map(field => (
              <TextInput
                key={field}
                label={field}
                value={formData[field] || ''}
                onChangeText={(text) => updateFormField(field, text)}
                style={styles.input}
                mode="outlined"
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
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddRow}
                disabled={saving || Object.keys(formData).length === 0}
                style={styles.saveButton}
              >
                {saving ? <ActivityIndicator color="#fff" size="small" /> : 'Add Row'}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#000',
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
    fontSize: 20,
  },
  transcriptionHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});
