import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, ActivityIndicator } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const SchemaEvolution = ({ navigation }) => {
  const [databaseService] = useState(new DatabaseService());
  const [currentSchema, setCurrentSchema] = useState(null);
  const [newSchema, setNewSchema] = useState(null);
  const [schemaChanges, setSchemaChanges] = useState([]);
  const [migrationScript, setMigrationScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentSchema();
  }, []);

  const loadCurrentSchema = async () => {
    setIsLoading(true);
    try {
      const apps = await databaseService.getApplications();
      if (apps.length > 0) {
        const latestApp = apps[0];
        setCurrentSchema(latestApp.schema);
      }
    } catch (error) {
      console.error('Error loading current schema:', error);
      Alert.alert('Error', 'Failed to load current schema');
    } finally {
      setIsLoading(false);
    }
  };

  const detectChanges = async () => {
    if (!currentSchema || !newSchema) {
      Alert.alert('Error', 'Please provide both current and new schemas');
      return;
    }

    setIsLoading(true);
    try {
      const changes = await databaseService.detectSchemaChanges(currentSchema, newSchema);
      setSchemaChanges(changes);

      if (changes.length > 0) {
        const script = await databaseService.generateMigrationScript(changes);
        setMigrationScript(script);
      } else {
        setMigrationScript('No changes detected');
      }
    } catch (error) {
      console.error('Error detecting changes:', error);
      Alert.alert('Error', 'Failed to detect schema changes');
    } finally {
      setIsLoading(false);
    }
  };

  const applyMigration = async () => {
    if (!migrationScript || migrationScript === 'No changes detected') {
      Alert.alert('Info', 'No migration to apply');
      return;
    }

    setIsLoading(true);
    try {
      await databaseService.applyMigration(migrationScript);
      Alert.alert('Success', 'Migration applied successfully');
      setSchemaChanges([]);
      setMigrationScript('');
      loadCurrentSchema();
    } catch (error) {
      console.error('Error applying migration:', error);
      Alert.alert('Error', 'Failed to apply migration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChange = (change, index) => {
    switch (change.type) {
      case 'add_field':
        return (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeType}>Add Field</Text>
            <Text>Field: {change.field}</Text>
            <Text>Type: {change.fieldType}</Text>
          </View>
        );
      case 'remove_field':
        return (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeType}>Remove Field</Text>
            <Text>Field: {change.field}</Text>
          </View>
        );
      case 'change_type':
        return (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeType}>Change Type</Text>
            <Text>Field: {change.field}</Text>
            <Text>From: {change.oldType} To: {change.newType}</Text>
          </View>
        );
      case 'make_required':
        return (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeType}>Make Required</Text>
            <Text>Field: {change.field}</Text>
          </View>
        );
      case 'make_optional':
        return (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeType}>Make Optional</Text>
            <Text>Field: {change.field}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Schema Evolution</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Schema</Text>
            <Text style={styles.schemaText}>
              {currentSchema ? JSON.stringify(currentSchema, null, 2) : 'No schema loaded'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Schema</Text>
            <Text style={styles.schemaText}>
              {newSchema ? JSON.stringify(newSchema, null, 2) : 'No new schema provided'}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Detect Changes"
              onPress={detectChanges}
              disabled={!currentSchema || !newSchema}
            />
          </View>

          {schemaChanges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Changes</Text>
              {schemaChanges.map((change, index) => renderChange(change, index))}
            </View>
          )}

          {migrationScript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Migration Script</Text>
              <Text style={styles.migrationText}>{migrationScript}</Text>
            </View>
          )}

          {migrationScript && migrationScript !== 'No changes detected' && (
            <View style={styles.buttonContainer}>
              <Button
                title="Apply Migration"
                onPress={applyMigration}
                color="green"
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
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
  schemaText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
  },
  changeItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  changeType: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  migrationText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
});

export default SchemaEvolution;
