import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WorkflowBuilder = () => {
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddStep = () => {
    if (newStep.trim() === '') return; // Prevent adding empty steps
    
    if (editingIndex !== null) {
      // Update existing step
      const updatedSteps = [...steps];
      updatedSteps[editingIndex] = newStep;
      setSteps(updatedSteps);
      setEditingIndex(null);
      setNewStep('');
    } else {
      // Add new step
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((step, i) => i !== index));
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setNewStep(steps[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewStep('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={steps}
        renderItem={({ item, index }) => (
          <View style={styles.stepContainer}>
            <Text style={styles.stepText}>{item}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={() => startEditing(index)}
                style={styles.editButton}
              >
                <Feather name="edit" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleRemoveStep(index)}
                style={styles.deleteButton}
              >
                <Feather name="trash-2" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          value={newStep}
          onChangeText={setNewStep}
          placeholder={editingIndex !== null ? "Edit step..." : "Add new step..."}
          style={styles.textInput}
        />
        
        <View style={styles.actionButtons}>
          {editingIndex !== null && (
            <TouchableOpacity 
              onPress={cancelEditing}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleAddStep}
            disabled={newStep.trim() === ''}
            style={[
              styles.addButton, 
              (newStep.trim() === '') && styles.addButtonDisabled
            ]}
          >
            <Feather 
              name={editingIndex !== null ? "check" : "plus"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stepText: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default WorkflowBuilder;
