import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const addField = async () => {
    if (!fieldName.trim() || !fieldType.trim()) {
      Alert.alert('Error', 'Please enter field name and type');
      return;
    }

    const newField = {
      name: fieldName,
      type: fieldType,
      id: Date.now()
    };

    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    setFieldName('');
    setFieldType('');

    // Get suggestions after adding a field
    await getSchemaSuggestions(updatedFields);
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

  const getSchemaSuggestions = async (currentFields = fields) => {
    if (currentFields.length === 0) {
      setSchemaSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentSchema = {
        properties: currentFields.reduce((acc, field) => {
          acc[field.name] = { type: field.type };
          return acc;
        }, {}),
        required: []
      };

      const response = await aiService.generateSchemaSuggestion(currentSchema);
      if (response.success && response.suggestions.length > 0) {
        setSchemaSuggestions(response.suggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error getting schema suggestions:', error);
      setShowSuggestions(false);
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
    } else if (suggestion.type === 'optimize_type') {
      const updatedFields = fields.map(field =>
        field.name === suggestion.property
          ? { ...field, type: suggestion.suggestedType }
          : field
      );
      setFields(updatedFields);
    } else if (suggestion.type === 'add_relationship') {
      const newField = {
        name: suggestion.property,
        type: 'relationship',
        relatedTo: suggestion.relatedTo,
        id: Date.now()
      };
      setFields([...fields, newField]);
    }

    // Remove the applied suggestion
    const updatedSuggestions = schemaSuggestions.filter(s => s !== suggestion);
    setSchemaSuggestions(updatedSuggestions);
    if (updatedSuggestions.length === 0) {
      setShowSuggestions(false);
    }
  };

  const renderField = ({ item }) => (
    <View style={styles.fieldItem}>
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldName}>{item.name}</Text>
        <Text style={styles.fieldType}>{item.type}</Text>
        {item.relatedTo && <Text style={styles.fieldRelated}>→ {item.relatedTo}</Text>}
      </View>
      <TouchableOpacity onPress={() => removeField(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => applySuggestion(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>
          {item.type === 'add_property' && 'Add Field'}
          {item.type === 'make_required' && 'Mark Required'}
          {item.type === 'optimize_type' && 'Optimize Type'}
          {item.type === 'add_relationship' && 'Add Relationship'}
        </Text>
        <Text style={styles.suggestionDescription}>{item.description}</Text>
        {item.suggestedType && (
          <Text style={styles.suggestionDetail}>Suggested: {item.suggestedType}</Text>
        )}
        {item.relatedTo && (
          <Text style={styles.suggestionDetail}>Related to: {item.relatedTo}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderApplication = ({ item }) => (
    <View style={styles.applicationItem}>
      <Text style={styles.applicationName}>{item.name}</Text>
      <Text style={styles.applicationFields}>{item.fields.length} fields</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteApplication(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Application</Text>

        <TextInput
          style={styles.input}
          placeholder="Application Name"
          value={appName}
          onChangeText={setAppName}
        />

        <View style={styles.fieldInputContainer}>
          <TextInput
            style={[styles.input, styles.fieldInput]}
            placeholder="Field Name"
            value={fieldName}
            onChangeText={setFieldName}
          />
          <TextInput
            style={[styles.input, styles.fieldInput]}
            placeholder="Field Type"
            value={fieldType}
            onChangeText={setFieldType}
          />
          <TouchableOpacity style={styles.addButton} onPress={addField}>
            <Text style={styles.addButtonText}>Add Field</Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator size="small" color="#007AFF" />}

        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
            <FlatList
              data={schemaSuggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => `suggestion-${index}`}
              style={styles.suggestionsList}
            />
          </View>
        )}

        {fields.length > 0 && (
          <View style={styles.fieldsContainer}>
            <Text style={styles.fieldsTitle}>Fields ({fields.length})</Text>
            <FlatList
              data={fields}
              renderItem={renderField}
              keyExtractor={(item) => item.id.toString()}
              style={styles.fieldsList}
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={saveApplication}>
          <Text style={styles.saveButtonText}>Save Application</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Applications</Text>
        {applications.length > 0 ? (
          <FlatList
            data={applications}
            renderItem={renderApplication}
            keyExtractor={(item) => item.id.toString()}
            style={styles.applicationsList}
          />
        ) : (
          <Text style={styles.noApplications}>No applications yet. Create one above!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  fieldInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fieldsContainer: {
    marginTop: 16,
  },
  fieldsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  fieldsList: {
    maxHeight: 200,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldName: {
    fontWeight: '600',
    marginRight: 8,
  },
  fieldType: {
    color: '#666',
    marginRight: 8,
  },
  fieldRelated: {
    color: '#007AFF',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 18,
  },
  suggestionsContainer: {
    marginTop: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    color: '#666',
    marginBottom: 4,
  },
  suggestionDetail: {
    color: '#007AFF',
    fontSize: 12,
  },
  applicationsList: {
    marginTop: 8,
  },
  applicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  applicationName: {
    fontWeight: '600',
    fontSize: 16,
  },
  applicationFields: {
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noApplications: {
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ApplicationBuilder;
