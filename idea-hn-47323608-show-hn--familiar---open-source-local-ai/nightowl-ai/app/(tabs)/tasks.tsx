import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';

export default function TasksScreen() {
  const { tasks, addTask, cancelTask } = useTasks();

  const handleAddTask = (type) => {
    addTask({ type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Queue</Text>

      <View style={styles.addTaskButtons}>
        <Button title="Organize Photos" onPress={() => handleAddTask('organize_photos')} />
        <Button title="Process Documents" onPress={() => handleAddTask('process_documents')} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onCancel={cancelTask} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});
