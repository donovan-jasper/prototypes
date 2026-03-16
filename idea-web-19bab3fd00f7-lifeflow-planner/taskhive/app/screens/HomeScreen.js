import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import KanbanBoard from '../components/KanbanBoard';
import { autoCategorizeTask } from '../utils/task-organizer';
import { getTasks, saveTasks } from '../utils/database';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    };
    loadTasks();
  }, []);

  const handleDragEnd = async ({ data }) => {
    setTasks(data);
    await saveTasks(data);
  };

  const handleAddTask = async (task) => {
    const categorizedTask = autoCategorizeTask(task);
    const newTasks = [...tasks, categorizedTask];
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  return (
    <View style={styles.container}>
      <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default HomeScreen;
