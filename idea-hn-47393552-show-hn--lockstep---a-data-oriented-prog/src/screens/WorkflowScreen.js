import React from 'react';
import { View, StyleSheet } from 'react-native';
import WorkflowBuilder from '../components/WorkflowBuilder';

const WorkflowScreen = ({ route }) => {
  const { workflowId } = route.params || {};

  return (
    <View style={styles.container}>
      <WorkflowBuilder workflowId={workflowId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WorkflowScreen;
