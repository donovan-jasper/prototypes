import React from 'react';
import { View, Text } from 'react-native';
import TaskExecutor from '../components/TaskExecutor';

const WorkflowScreen = () => {
  return (
    <View>
      <Text>Workflow Screen</Text>
      <TaskExecutor />
    </View>
  );
};

export default WorkflowScreen;
