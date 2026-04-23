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

    // Refresh suggestions after applying
    getSchemaSuggestions();
  };

  const applyAllSuggestions = () => {
    let updatedFields = [...fields];

    schemaSuggestions.forEach(suggestion => {
      if (suggestion.type === 'add_property') {
        updatedFields.push({
          name: suggestion.property,
          type: suggestion.dataType,
          id: Date.now()
        });
      } else if (suggestion.type === 'optimize_type') {
        updatedFields = updatedFields.map(field =>
          field.name === suggestion.property
            ? { ...field, type: suggestion.suggestedType }
            : field
        );
      } else if (suggestion.type === 'add_relationship') {
        updatedFields.push({
          name: suggestion.property,
          type: 'relationship',
          relatedTo: suggestion.relatedTo,
          id: Date.now()
        });
      }
    });

    setFields(updatedFields);
    setSchemaSuggestions([]);
    setShowSuggestions(false);
    Alert.alert('Success', 'All suggestions applied successfully!');
  };

  const renderFieldItem = ({ item }) => (
    <View style={styles.fieldItem}>
      <Text style={styles.fieldName}>{item.name}</Text>
      <Text style={styles.fieldType}>{item.type}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeField(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuggestionItem = ({ item }) => (
    <View style={styles.suggestionItem}>
      <Text style={styles.suggestionTitle}>
        {item.type === 'add_property' ? 'Add Field' :
         item.type === 'make_required' ? 'Mark Required' :
         item.type === 'optimize_type' ? 'Optimize Type' :
         item.type === 'add_relationship' ? 'Add Relationship' : 'Suggestion'}
      </Text>
      <Text style={styles.suggestionDescription}>{item.description}</Text>
      <View style={styles.suggestionActions}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applySuggestion(item)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
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

        <View style={styles.fieldForm}>
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={addField}
          >
            <Text style={styles.addButtonText}>Add Field</Text>
          </TouchableOpacity>
        </View>

        {fields.length > 0 && (
          <View style={styles.fieldsList}>
            <Text style={styles.subtitle}>Fields:</Text>
            <FlatList
              data={fields}
              renderItem={renderFieldItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveApplication}
        >
          <Text style={styles.saveButtonText}>Save Application</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schema Suggestions</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <FlatList
                data={schemaSuggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={styles.applyAllButton}
                onPress={applyAllSuggestions}
              >
                <Text style={styles.applyAllButtonText}>Apply All Suggestions</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Applications</Text>
        {applications.length > 0 ? (
          <FlatList
            data={applications}
            renderItem={({ item }) => (
              <View style={styles.appItem}>
                <Text style={styles.appName}>{item.name}</Text>
                <View style={styles.appActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('ApplicationScreen', { appId: item.id })}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteApplication(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noAppsText}>No applications created yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  fieldForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fieldsList: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldName: {
    fontSize: 16,
    color: '#333',
  },
  fieldType: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  suggestionItem: {
    backgroundColor: '#f0f8ff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007AFF',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyAllButton: {
    backgroundColor: '#2E86C1',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  applyAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appName: {
    fontSize: 16,
    color: '#333',
  },
  appActions: {
    flexDirection: 'row',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noAppsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ApplicationBuilder;
