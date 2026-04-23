import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowService from '../services/WorkflowService';

const WorkflowScreen = ({ route, navigation }) => {
  const { workflowId } = route.params || {};

  useEffect(() => {
    WorkflowService.initialize();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workflow Builder</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <WorkflowBuilder workflowId={workflowId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4a6fa5',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
  },
});

export default WorkflowScreen;
