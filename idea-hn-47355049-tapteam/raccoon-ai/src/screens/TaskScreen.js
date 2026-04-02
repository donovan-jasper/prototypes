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
  ActivityIndicator,
} from 'react-native';
import TaskChain from '../components/TaskChain';
import { addTaskChain, getTaskChains } from '../utils/sqlite';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming react-native-vector-icons is installed
import RaccoonAIService from '../services/RaccoonAIService';

const TaskScreen = () => {
  const [newTaskName, setNewTaskName] = useState('');
  const [currentChainTasks, setCurrentChainTasks] = useState([]);
  const [chainName, setChainName] = useState('');
  const [savedTaskChains, setSavedTaskChains] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

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

  const handleExecuteSavedChain = async (chain) => {
    setIsExecuting(true);
    try {
      const result = await RaccoonAIService.executeTaskChain(chain);
      Alert.alert('Execution Result', result);
    } catch (error) {
      console.error('Error executing task chain:', error);
      Alert.alert('Error', 'Failed to execute task chain.');
    } finally {
      setIsExecuting(false);
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

  const renderSavedChainItem = ({ item }) => (
    <View style={styles.savedChainItem}>
      <Text style={styles.savedChainItemText}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleExecuteSavedChain(item)}
        style={styles.executeButton}
        disabled={isExecuting}
      >
        <Text style={styles.executeButtonText}>Execute</Text>
      </TouchableOpacity>
      {isExecuting && (
        <ActivityIndicator size="small" color="#3498db" style={styles.executeActivityIndicator} />
      )}
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

        {/* Current Task Chain Section */}
        <View style={styles.currentChainContainer}>
          <Text style={styles.currentChainHeader}>Current Task Chain</Text>
          <FlatList
            data={currentChainTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.currentChainList}
          />
          <TextInput
            style={styles.chainNameInput}
            placeholder="Enter chain name"
            value={chainName}
            onChangeText={setChainName}
          />
          <TouchableOpacity style={styles.saveChainButton} onPress={handleSaveTaskChain}>
            <Text style={styles.saveChainButtonText}>Save Chain</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Task Chains Section */}
        <View style={styles.savedChainsContainer}>
          <Text style={styles.savedChainsHeader}>Saved Task Chains</Text>
          <FlatList
            data={savedTaskChains}
            renderItem={renderSavedChainItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.savedChainsList}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollViewContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  currentChainContainer: {
    marginBottom: 20,
  },
  currentChainHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentChainList: {
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  taskItemText: {
    fontSize: 16,
  },
  taskItemButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskActionButton: {
    padding: 5,
    margin: 5,
  },
  chainNameInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  saveChainButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  saveChainButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  savedChainsContainer: {
    marginBottom: 20,
  },
  savedChainsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  savedChainsList: {
    marginBottom: 10,
  },
  savedChainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  savedChainItemText: {
    fontSize: 16,
  },
  executeButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  executeActivityIndicator: {
    marginLeft: 10,
  },
});

export default TaskScreen;
