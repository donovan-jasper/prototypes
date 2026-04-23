import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowService from '../services/WorkflowService';

const WorkflowScreen = ({ route }) => {
  const { workflowId } = route.params || {};

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id) => {
    try {
      const workflow = await WorkflowService.getWorkflowById(id);
      if (workflow) {
        // Here you would typically update the WorkflowBuilder state with the loaded workflow
        console.log('Loaded workflow:', workflow);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WorkflowBuilder />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WorkflowScreen;
