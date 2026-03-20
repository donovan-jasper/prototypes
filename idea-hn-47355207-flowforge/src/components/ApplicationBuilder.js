import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const ApplicationBuilder = ({ navigation }) => {
  const [databaseService] = useState(new DatabaseService());
  const [appName, setAppName] = useState('');
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Initialize database and load existing applications
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
        loadApplications(); // Refresh the list
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
      id: Date.now() // Unique ID for removal
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
                loadApplications(); // Refresh the list
              })
              .catch(error => {
                console.error('Delete application error:', error);
              });
          }
        }
      ]
    );
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
            renderItem={({ item }) => {
              const parsedSchema = JSON.parse(item.schema);
              return (
                <View style={styles.applicationCard}>
                  <Text style={styles.applicationName}>{parsedSchema.name}</Text>
                  
                  <View style={styles.schemaPreview}>
                    <Text style={styles.schemaTitle}>Schema:</Text>
                    {parsedSchema.fields.map((field, index) => (
                      <Text key={index} style={styles.schemaField}>
                        • {field.name}: {field.type}
                      </Text>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteApplication(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  fieldsSection: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentFieldsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 8,
    borderRadius: 5,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  fieldType: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  applicationsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  applicationCard: {
    padding: 15,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  applicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  schemaPreview: {
    marginLeft: 10,
    marginBottom: 10,
  },
  schemaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  schemaField: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ApplicationBuilder;
