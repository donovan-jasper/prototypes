import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Button, Alert } from 'react-native';

const Collaboration = () => {
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
  ]);
  const [newCollaborator, setNewCollaborator] = useState({ name: '', email: '', role: 'Viewer' });

  const addCollaborator = () => {
    if (!newCollaborator.name.trim() || !newCollaborator.email.trim()) {
      Alert.alert('Error', 'Please fill in both name and email');
      return;
    }
    
    const updatedCollaborators = [
      ...collaborators,
      {
        id: collaborators.length + 1,
        ...newCollaborator
      }
    ];
    
    setCollaborators(updatedCollaborators);
    setNewCollaborator({ name: '', email: '', role: 'Viewer' });
    Alert.alert('Success', 'Collaborator added successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Collaboration & Version Control</Text>
      
      <View style={styles.addCollaboratorSection}>
        <Text style={styles.sectionTitle}>Add Collaborator</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newCollaborator.name}
          onChangeText={(text) => setNewCollaborator({...newCollaborator, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newCollaborator.email}
          onChangeText={(text) => setNewCollaborator({...newCollaborator, email: text})}
        />
        <View style={styles.row}>
          <Text style={styles.label}>Role:</Text>
          <Button title="Admin" onPress={() => setNewCollaborator({...newCollaborator, role: 'Admin'})} />
          <Button title="Editor" onPress={() => setNewCollaborator({...newCollaborator, role: 'Editor'})} />
          <Button title="Viewer" onPress={() => setNewCollaborator({...newCollaborator, role: 'Viewer'})} />
        </View>
        <Button title="Add Collaborator" onPress={addCollaborator} />
      </View>
      
      <View style={styles.collaboratorsSection}>
        <Text style={styles.sectionTitle}>Current Collaborators</Text>
        {collaborators.map(collaborator => (
          <View key={collaborator.id} style={styles.collaboratorItem}>
            <Text>{collaborator.name} - {collaborator.email} ({collaborator.role})</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.versionControlSection}>
        <Text style={styles.sectionTitle}>Version Control</Text>
        <Text>This section would integrate with a version control system to track changes.</Text>
        <Button title="Sync Changes" onPress={() => Alert.alert('Info', 'Changes synced successfully!')} />
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
    textAlign: 'center',
  },
  addCollaboratorSection: {
    marginBottom: 20,
  },
  collaboratorsSection: {
    marginBottom: 20,
  },
  versionControlSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginRight: 10,
  },
  collaboratorItem: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
});

export default Collaboration;
