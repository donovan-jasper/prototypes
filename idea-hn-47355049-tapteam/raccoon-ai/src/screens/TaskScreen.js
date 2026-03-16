import React from 'react';
import { View, Text } from 'react-native';
import TaskChain from '../components/TaskChain';

const TaskScreen = () => {
  const tasks = ['Task 1', 'Task 2', 'Task 3'];

  return (
    <View>
      <Text>Task Screen</Text>
      <TaskChain tasks={tasks} />
    </View>
  );
};

export default TaskScreen;
