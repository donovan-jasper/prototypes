import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const SchemaEvolution = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [schemaVersions, setSchemaVersions] = useState([]);
  const dbService = new DatabaseService();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await dbService.getApplications();
      setApplications(apps);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    }
  };

  const loadSchemaVersions = async (app) => {
    try {
      const versions = await dbService.getSchemaVersions(app.id);
      setSchemaVersions(versions);
      setSelectedApp(app);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schema versions');
    }
  };

  const handleSelectApp = (app) => {
    loadSchemaVersions(app);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Schema Evolution Management</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applications</Text>
        {applications.map(app => (
          <Button 
            key={app.id} 
            title={app.name} 
            onPress={() => handleSelectApp(app)}
          />
        ))}
      </View>
      
      {selectedApp && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schema Versions for {selectedApp.name}</Text>
          {schemaVersions.length > 0 ? (
            schemaVersions.map(version => (
              <View key={version.id} style={styles.versionItem}>
                <Text>Version {version.version_number}</Text>
                <Text>{version.created_at}</Text>
              </View>
            ))
          ) : (
            <Text>No schema versions found</Text>
          )}
        </View>
      )}
      
      {!selectedApp && (
        <Text>Select an application to view its schema evolution history</Text>
      )}
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  versionItem: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
});

export default SchemaEvolution;
