import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const ApplicationBuilder = ({ navigation }) => {
  const [appName, setAppName] = useState('');
  const [applications, setApplications] = useState([]);
  const [newApplicationName, setNewApplicationName] = useState('');
  const databaseService = new DatabaseService();

  const createApplication = () => {
    if (!newApplicationName.trim()) {
      Alert.alert('Error', 'Please enter an application name');
      return;
    }
    
    const updatedApplications = [...applications, { name: newApplicationName }];
    setApplications(updatedApplications);
    setNewApplicationName('');
  };

  const saveApplication = () => {
    if (!appName.trim()) {
      Alert.alert('Error', 'Please enter an application name');
      return;
    }
    
    const applicationStructure = {
      name: appName,
    };
    
    databaseService.insertApplication(appName, applicationStructure)
      .then(() => {
        Alert.alert('Success', `Application "${appName}" saved!`);
        navigation.navigate('Home');
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to save application');
      });
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
      
      <Button title="Create Application" onPress={saveApplication} />
      
      <Text style={styles.sectionTitle}>Created Applications:</Text>
      
      <FlatList
        data={applications}
        renderItem={({ item }) => (
          <Text style={styles.application}>{item.name}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      
      <TextInput
        style={styles.input}
        placeholder="New Application Name"
        value={newApplicationName}
        onChangeText={setNewApplicationName}
      />
      
      <Button title="Add Application" onPress={createApplication} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  application: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ApplicationBuilder;
