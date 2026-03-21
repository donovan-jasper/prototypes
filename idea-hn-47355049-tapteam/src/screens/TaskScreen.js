import React, { useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../models/Task';
import { addTaskChain, getTaskChains } from '../utils/sqlite';

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskChain, setTaskChain] = useState([]);

  const handleAddTask = () => {
    if (newTask) {
      setTasks([...tasks, newTask]);
      setNewTask('');
    }
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = tasks.filter((task, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleReorderTask = (index, newIndex) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks.splice(index, 1)[0];
    updatedTasks.splice(newIndex, 0, task);
    setTasks(updatedTasks);
  };

  const handleSaveTaskChain = async () => {
    await addTaskChain(taskChain);
    setTaskChain([]);
  };

  const handleGetTaskChains = async () => {
    const taskChains = await getTaskChains();
    setTaskChain(taskChains);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={tasks}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveTask(index)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 10 }}
        value={newTask}
        onChangeText={(text) => setNewTask(text)}
        placeholder="New task"
      />
      <TouchableOpacity style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }} onPress={handleAddTask}>
        <Text style={{ color: 'white' }}>Add task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }} onPress={handleSaveTaskChain}>
        <Text style={{ color: 'white' }}>Save task chain</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ backgroundColor: 'orange', padding: 10, borderRadius: 5 }} onPress={handleGetTaskChains}>
        <Text style={{ color: 'white' }}>Get task chains</Text>
      </TouchableOpacity>
      <FlatList
        data={taskChain}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default TaskScreen;
