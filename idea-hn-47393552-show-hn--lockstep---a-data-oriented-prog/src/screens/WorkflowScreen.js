import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowService from '../services/WorkflowService';

const WorkflowScreen = ({ route }) => {
  const { workflowId } = route.params || {};

  useEffect(() => {
    WorkflowService.initialize();
  }, []);

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
