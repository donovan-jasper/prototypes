import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WorkflowService from '../services/WorkflowService';

const HomeScreen = () => {
  const [workflows, setWorkflows] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const loadedWorkflows = await WorkflowService.getWorkflows();
      setWorkflows(loadedWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const handleCreateWorkflow = () => {
    navigation.navigate('Workflow', { workflowId: null });
  };

  const handleEditWorkflow = (workflowId) => {
    navigation.navigate('Workflow', { workflowId });
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await WorkflowService.deleteWorkflow(workflowId);
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const confirmDelete = (workflowId) => {
    Alert.alert(
      'Delete Workflow',
      'Are you sure you want to delete this workflow?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteWorkflow(workflowId) }
      ]
    );
  };

  const renderWorkflowItem = ({ item }) => {
    const workflowData = JSON.parse(item.data);
    const nodeCount = workflowData.nodes?.length || 0;
    const connectionCount = workflowData.connections?.length || 0;

    return (
      <TouchableOpacity
        style={styles.workflowItem}
        onPress={() => handleEditWorkflow(item.id)}
      >
        <View style={styles.workflowInfo}>
          <Text style={styles.workflowTitle}>Workflow {item.id}</Text>
          <Text style={styles.workflowStats}>
            {nodeCount} nodes • {connectionCount} connections
          </Text>
          <Text style={styles.workflowDate}>
            Created: {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workflows</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateWorkflow}
        >
          <Text style={styles.createButtonText}>+ New Workflow</Text>
        </TouchableOpacity>
      </View>

      {workflows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No workflows yet</Text>
          <Text style={styles.emptySubtext}>Create your first workflow to get started</Text>
        </View>
      ) : (
        <FlatList
          data={workflows}
          renderItem={renderWorkflowItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  workflowItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workflowStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  workflowDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;
