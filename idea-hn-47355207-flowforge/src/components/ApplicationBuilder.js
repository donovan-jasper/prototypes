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
    setSchemaSuggestions(schemaSuggestions.filter(s => s !== suggestion));
  };

  const renderField = ({ item }) => (
    <View style={styles.fieldItem}>
      <Text style={styles.fieldName}>{item.name}</Text>
      <Text style={styles.fieldType}>{item.type}</Text>
      {item.relatedTo && <Text style={styles.fieldRelation}>→ {item.relatedTo}</Text>}
      <TouchableOpacity onPress={() => removeField(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuggestion = ({ item }) => (
    <View style={styles.suggestionItem}>
      <Text style={styles.suggestionTitle}>
        {item.type === 'add_property' ? 'Add Field' :
         item.type === 'make_required' ? 'Mark Required' :
         item.type === 'optimize_type' ? 'Optimize Type' :
         item.type === 'add_relationship' ? 'Add Relationship' : 'Suggestion'}
      </Text>
      <Text style={styles.suggestionDescription}>{item.description}</Text>
      {item.dataType && <Text style={styles.suggestionDetail}>Type: {item.dataType}</Text>}
      {item.suggestedType && <Text style={styles.suggestionDetail}>Suggested: {item.suggestedType}</Text>}
      {item.relatedTo && <Text style={styles.suggestionDetail}>Related to: {item.relatedTo}</Text>}
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => applySuggestion(item)}
      >
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

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
          placeholder="Field Type (string, number, boolean, etc.)"
          value={fieldType}
          onChangeText={setFieldType}
        />

        <Button title="Add Field" onPress={addField} color="#2196F3" />
      </View>

      {fields.length > 0 && (
        <View style={styles.currentFieldsSection}>
          <Text style={styles.sectionTitle}>Current Fields</Text>
          <FlatList
            data={fields}
            renderItem={renderField}
            keyExtractor={item => item.id.toString()}
            style={styles.fieldsList}
          />
        </View>
      )}

      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Suggestions</Text>
        <Button
          title="Get Schema Suggestions"
          onPress={getSchemaSuggestions}
          color="#9C27B0"
          disabled={isLoading}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#9C27B0" />
            <Text style={styles.loadingText}>Analyzing your schema...</Text>
          </View>
        )}

        {schemaSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions ({schemaSuggestions.length})</Text>
            <FlatList
              data={schemaSuggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => index.toString()}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      <View style={styles.applicationsSection}>
        <Text style={styles.sectionTitle}>Saved Applications</Text>
        {applications.length > 0 ? (
          <FlatList
            data={applications}
            renderItem={({ item }) => (
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
            )}
            keyExtractor={item => item.id.toString()}
          />
        ) : (
          <Text style={styles.noApplications}>No applications saved yet</Text>
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
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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
    backgroundColor: 'white',
  },
  fieldsSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  currentFieldsSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldsList: {
    marginTop: 10,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldName: {
    fontWeight: '500',
    marginRight: 10,
    flex: 1,
  },
  fieldType: {
    color: '#666',
    marginRight: 10,
  },
  fieldRelation: {
    color: '#9C27B0',
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  aiSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  suggestionsContainer: {
    marginTop: 15,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  suggestionsList: {
    marginTop: 5,
  },
  suggestionItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  suggestionDescription: {
    color: '#555',
    marginBottom: 5,
  },
  suggestionDetail: {
    color: '#666',
    fontSize: 12,
    marginBottom: 3,
  },
  applyButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  applicationsSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  applicationName: {
    fontWeight: '500',
    flex: 1,
  },
  applicationFields: {
    color: '#666',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  noApplications: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ApplicationBuilder;
