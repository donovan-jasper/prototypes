import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useStore } from '@/store';

const FamilySharingScreen = () => {
  const { familyMembers, addFamilyMember, removeFamilyMember } = useStore();
  const [email, setEmail] = useState('');

  const handleAddMember = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (familyMembers.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 family members');
      return;
    }

    addFamilyMember(email);
    setEmail('');
    Alert.alert('Success', 'Family member added successfully');
  };

  const handleRemoveMember = (emailToRemove: string) => {
    removeFamilyMember(emailToRemove);
    Alert.alert('Success', 'Family member removed successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Sharing</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Current Family Members ({familyMembers.length}/5)</Text>

      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <Text style={styles.memberEmail}>{item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(item)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No family members added yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberEmail: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default FamilySharingScreen;
