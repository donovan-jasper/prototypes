import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTasks } from '../contexts/TaskContext';

const TaskScreen = () => {
  const { tasks, addTask, completeTask, currentStreak, achievements } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskItem}>
      <Text style={[styles.taskText, item.completed && styles.completedTask]}>
        {item.title}
      </Text>
      {!item.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => completeTask(item.id)}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAchievement = ({ item }: { item: any }) => (
    <View style={styles.achievementItem}>
      <Text style={styles.achievementName}>{item.name}</Text>
      <Text style={styles.achievementDescription}>{item.description}</Text>
      <Text style={styles.achievementProgress}>
        {item.unlocked ? 'Unlocked!' : `Progress: ${item.progress}/${item.goal}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>

      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Current Streak: {currentStreak} days</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.taskList}
      />

      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.achievementList}
      />
    </View>
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
    color: '#333',
  },
  streakContainer: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  streakText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskList: {
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  achievementList: {
    marginBottom: 20,
  },
  achievementItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    width: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  achievementProgress: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default TaskScreen;
