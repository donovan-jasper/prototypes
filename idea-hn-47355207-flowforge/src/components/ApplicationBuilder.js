import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import AIService from '../services/AIService';

const ApplicationBuilder = ({ navigation }) => {
  const [appName, setAppName] = useState('');
  const [schema, setSchema] = useState({ type: 'object', properties: {} });
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('string');
  const aiService = new AIService();

  const addProperty = () => {
    if (!propertyName.trim()) {
      Alert.alert('Error', 'Please enter a property name');
      return;
    }
    
    const updatedSchema = {
      ...schema,
      properties: {
        ...schema.properties,
        [propertyName]: { type: propertyType }
      }
    };
    
    setSchema(updatedSchema);
    setPropertyName('');
  };

  const generateAISuggestions = async () => {
    try {
      const result = await aiService.generateSchemaSuggestion(schema);
      if (result.success) {
        Alert.alert('AI Suggestions', `Received ${result.suggestions.length} suggestions`);
        // Apply suggestions to schema if needed
        let updatedSchema = { ...schema };
        result.suggestions.forEach(suggestion => {
          if (suggestion.type === 'add_property') {
            updatedSchema.properties[suggestion.property] = { 
              type: suggestion.dataType 
            };
          }
        });
        setSchema(updatedSchema);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI suggestions');
    }
  };

  const saveApplication = () => {
    if (!appName.trim()) {
      Alert.alert('Error', 'Please enter an application name');
      return;
    }
    
    // In a real app, you would save this to the database
    Alert.alert('Success', `Application "${appName}" saved with schema!`);
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Application Builder</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Application Name"
        value={appName}
        onChangeText={setAppName}
      />
      
      <View style={styles.schemaSection}>
        <Text style={styles.sectionTitle}>Current Schema</Text>
        <Text style={styles.schemaPreview}>{JSON.stringify(schema, null, 2)}</Text>
      </View>
      
      <View style={styles.addPropertySection}>
        <Text style={styles.sectionTitle}>Add Property</Text>
        <TextInput
          style={styles.input}
          placeholder="Property Name"
          value={propertyName}
          onChangeText={setPropertyName}
        />
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Button title="String" onPress={() => setPropertyType('string')} />
          <Button title="Number" onPress={() => setPropertyType('number')} />
          <Button title="Boolean" onPress={() => setPropertyType('boolean')} />
        </View>
        <Button title="Add Property" onPress={addProperty} />
      </View>
      
      <Button title="Get AI Suggestions" onPress={generateAISuggestions} />
      <Button title="Save Application" onPress={saveApplication} />
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
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  schemaSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  schemaPreview: {
    fontFamily: 'monospace',
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  addPropertySection: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginRight: 10,
  },
});

export default ApplicationBuilder;
