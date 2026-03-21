import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import TaskChain from '../components/TaskChain';
import { addTaskChain, getTaskChains } from '../utils/sqlite';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming react-native-vector-icons is installed

const TaskScreen = () => {
  const [newTaskName, setNewTaskName] = useState('');
  const [currentChainTasks, setCurrentChainTasks] = useState([]);
  const [chainName, setChainName] = useState('');
  const [savedTaskChains, setSavedTaskChains] = useState([]);

  const loadSavedTaskChains = useCallback(async () => {
    try {
      const chains = await getTaskChains();
      setSavedTaskChains(chains);
    } catch (error) {
      console.error('Failed to load task chains:', error);
      Alert.alert('Error', 'Failed to load saved task chains.');
    }
  }, []);

  useEffect(() => {
    loadSavedTaskChains();
  }, [loadSavedTaskChains]);

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      setCurrentChainTasks((prevTasks) => [...prevTasks, newTaskName.trim()]);
      setNewTaskName('');
    } else {
      Alert.alert('Input Required', 'Please enter a task name.');
    }
  };

  const handleRemoveTask = (indexToRemove) => {
    Alert.alert(
      'Remove Task',
      'Are you sure you want to remove this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setCurrentChainTasks((prevTasks) =>
              prevTasks.filter((_, index) => index !== indexToRemove)
            );
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleMoveTask = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === currentChainTasks.length - 1)
    ) {
      return; // Cannot move further up or down
    }

    const newTasks = [...currentChainTasks];
    const [removed] = newTasks.splice(index, 1);
    newTasks.splice(direction === 'up' ? index - 1 : index + 1, 0, removed);
    setCurrentChainTasks(newTasks);
  };

  const handleSaveTaskChain = async () => {
    if (!chainName.trim()) {
      Alert.alert('Input Required', 'Please enter a name for the task chain.');
      return;
    }
    if (currentChainTasks.length === 0) {
      Alert.alert('No Tasks', 'Please add at least one task to the chain.');
      return;
    }

    try {
      await addTaskChain(chainName.trim(), currentChainTasks);
      Alert.alert('Success', 'Task chain saved successfully!');
      setChainName('');
      setCurrentChainTasks([]);
      loadSavedTaskChains(); // Refresh the list of saved chains
    } catch (error) {
      console.error('Failed to save task chain:', error);
      Alert.alert('Error', 'Failed to save task chain.');
    }
  };

  const renderTaskItem = ({ item, index }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskItemText}>{item}</Text>
      <View style={styles.taskItemButtons}>
        <TouchableOpacity
          onPress={() => handleMoveTask(index, 'up')}
          style={styles.taskActionButton}
          disabled={index === 0}
        >
          <MaterialIcons name="arrow-upward" size={20} color={index === 0 ? '#ccc' : '#3498db'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleMoveTask(index, 'down')}
          style={styles.taskActionButton}
          disabled={index === currentChainTasks.length - 1}
        >
          <MaterialIcons name="arrow-downward" size={20} color={index === currentChainTasks.length - 1 ? '#ccc' : '#3498db'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemoveTask(index)}
          style={styles.taskActionButton}
        >
          <MaterialIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Build Your Task Chain</Text>

        {/* Add New Task Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new task name"
            value={newTaskName}
            onChangeText={setNewTaskName}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Current Task Chain List */}
        {currentChainTasks.length > 0 && (
          <View style={styles.currentChainSection}>
            <Text style={styles.sectionTitle}>Current Chain Tasks:</Text>
            <FlatList
              data={currentChainTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.taskList}
            />
          </View>
        )}

        {/* Visual Task Chain */}
        <TaskChain tasks={currentChainTasks} chainName="Current Chain Preview" />

        {/* Save Task Chain Section */}
        <View style={styles.saveChainContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Name your task chain"
            value={chainName}
            onChangeText={setChainName}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTaskChain}>
            <MaterialIcons name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save Task Chain</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Task Chains Section */}
        <Text style={styles.header}>Saved Task Chains</Text>
        {savedTaskChains.length === 0 ? (
          <Text style={styles.noSavedChainsText}>No saved task chains yet.</Text>
        ) : (
          <FlatList
            data={savedTaskChains}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.savedChainItem}>
                <TaskChain tasks={item.tasks} chainName={item.name} />
                <Text style={styles.savedChainDate}>
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                {/* Future: Add 'Execute' or 'Edit' buttons here */}
              </View>
            )}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 50, // Ensure content is not hidden by keyboard on Android
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  currentChainSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  taskList: {
    maxHeight: 200, // Limit height for scrollability
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskItemText: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
  },
  taskItemButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  taskActionButton: {
    padding: 5,
    marginLeft: 5,
  },
  saveChainContainer: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noSavedChainsText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 10,
  },
  savedChainItem: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  savedChainDate: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 5,
  },
});

export default TaskScreen;
