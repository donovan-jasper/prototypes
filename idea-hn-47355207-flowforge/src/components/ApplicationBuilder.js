import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import AIService from '../services/AIService';

const ApplicationBuilder = ({ navigation }) => {
  const [databaseService] = useState(new DatabaseService());
  const [aiService] = useState(new AIService());
  const [appName, setAppName] = useState('');
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [applications, setApplications] = useState([]);
  const [schemaSuggestions, setSchemaSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    databaseService.initDatabase()
      .then(() => {
        loadApplications();
      })
      .catch(error => {
        console.error('Database initialization error:', error);
      });
  }, []);

  const loadApplications = () => {
    databaseService.getApplications()
      .then(apps => {
        setApplications(apps);
      })
      .catch(error => {
        console.error('Error loading applications:', error);
      });
  };

  const saveApplication = () => {
    if (!appName.trim()) {
      Alert.alert('Error', 'Please enter an application name');
      return;
    }

    const applicationStructure = {
      name: appName,
      fields: fields,
    };

    databaseService.saveApplication(appName, applicationStructure)
      .then(() => {
        Alert.alert('Success', `Application "${appName}" saved!`);
        setAppName('');
        setFields([]);
        loadApplications();
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save application');
        console.error('Save application error:', error);
      });
  };

  const addField = () => {
    if (!fieldName.trim() || !fieldType.trim()) {
      Alert.alert('Error', 'Please enter field name and type');
      return;
    }

    const updatedFields = [...fields, {
      name: fieldName,
      type: fieldType,
      id: Date.now()
    }];
    setFields(updatedFields);
    setFieldName('');
    setFieldType('');
  };

  const removeField = (id) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
  };

  const deleteApplication = (appId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            databaseService.deleteApplication(appId)
              .then(() => {
                loadApplications();
              })
              .catch(error => {
                console.error('Delete application error:', error);
              });
          }
        }
      ]
    );
  };

  const getSchemaSuggestions = async () => {
    if (fields.length === 0) {
      Alert.alert('Info', 'Please add some fields first');
      return;
    }

    setIsLoading(true);
    try {
      const currentSchema = {
        properties: fields.reduce((acc, field) => {
          acc[field.name] = { type: field.type };
          return acc;
        }, {}),
        required: []
      };

      const response = await aiService.generateSchemaSuggestion(currentSchema);
      if (response.success) {
        setSchemaSuggestions(response.suggestions);
      } else {
        Alert.alert('Error', 'Failed to get schema suggestions');
      }
    } catch (error) {
      console.error('Error getting schema suggestions:', error);
      Alert.alert('Error', 'Failed to get schema suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'add_property') {
      const newField = {
        name: suggestion.property,
        type: suggestion.dataType,
        id: Date.now()
      };
      setFields([...fields, newField]);
    } else if (suggestion.type === 'make_required') {
      // In a real app, we would track required fields separately
      Alert.alert('Info', `Field "${suggestion.property}" would be marked as required`);
    }

    // Remove the applied suggestion
    setSchemaSuggestions(schemaSuggestions.filter(s => s !== suggestion));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Application Builder</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Application Name"
          value={appName}
          onChangeText={setAppName}
        />

        <Button title="Save Application" onPress={saveApplication} color="#4CAF50" />
      </View>

      <View style={styles.fieldsSection}>
        <Text style={styles.sectionTitle}>Add New Field</Text>

        <TextInput
          style={styles.input}
          placeholder="Field Name"
          value={fieldName}
          onChangeText={setFieldName}
        />

        <TextInput
          style={styles.input}
          placeholder="Field Type (e.g. String, Number, Boolean)"
          value={fieldType}
          onChangeText={setFieldType}
        />

        <Button title="Add Field" onPress={addField} color="#2196F3" />
      </View>

      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Schema Optimization</Text>
        <Button
          title="Get Schema Suggestions"
          onPress={getSchemaSuggestions}
          color="#FF9800"
          disabled={isLoading}
        />

        {isLoading && <ActivityIndicator size="small" color="#FF9800" style={styles.loader} />}

        {schemaSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionTitle}>Suggested Optimizations:</Text>
            {schemaSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion.description}</Text>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => applySuggestion(suggestion)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.currentFieldsSection}>
        <Text style={styles.sectionTitle}>Current Fields</Text>

        {fields.length === 0 ? (
          <Text style={styles.emptyText}>No fields added yet</Text>
        ) : (
          <FlatList
            data={fields}
            renderItem={({ item }) => (
              <View style={styles.fieldItem}>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldName}>{item.name}</Text>
                  <Text style={styles.fieldType}>{item.type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeField(item.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>

      <View style={styles.applicationsSection}>
        <Text style={styles.sectionTitle}>Saved Applications</Text>

        {applications.length === 0 ? (
          <Text style={styles.emptyText}>No applications saved yet</Text>
        ) : (
          <FlatList
            data={applications}
            renderItem={({ item }) => (
              <View style={styles.appItem}>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appFields}>{item.fields.length} fields</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteApplication(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  fieldsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  currentFieldsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fieldType: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  appItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appFields: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  loader: {
    marginTop: 10,
  },
});

export default ApplicationBuilder;
