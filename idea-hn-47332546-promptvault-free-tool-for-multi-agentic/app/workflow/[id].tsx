import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Canvas from '../../components/workflow/Canvas';
import NodePicker from '../../components/workflow/NodePicker';
import { getWorkflowById, saveWorkflow } from '../../lib/storage/workflows';

interface NodeData {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  config?: Record<string, any>;
}

interface Connection {
  from: string;
  to: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  connections: Connection[];
}

export default function WorkflowEditor() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const data = await getWorkflowById(id as string);
      if (data) {
        setWorkflow(data);
      } else {
        Alert.alert('Error', 'Workflow not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      Alert.alert('Error', 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async (updatedWorkflow: Workflow) => {
    try {
      await saveWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    if (!workflow) return;

    const updatedNodes = workflow.nodes.map((node) =>
      node.id === nodeId ? { ...node, x, y } : node
    );

    const updatedWorkflow = { ...workflow, nodes: updatedNodes };
    setWorkflow(updatedWorkflow);
    saveChanges(updatedWorkflow);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleAddNode = (type: 'trigger' | 'ai' | 'action') => {
    if (!workflow) return;

    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        workflow.nodes.length + 1
      }`,
      x: 200,
      y: 200,
    };

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    };

    setWorkflow(updatedWorkflow);
    saveChanges(updatedWorkflow);
  };

  const handleConnectionStart = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const handleConnectionEnd = (nodeId: string) => {
    if (!workflow || !connectingFrom) return;

    const existingConnection = workflow.connections.find(
      (conn) => conn.from === connectingFrom && conn.to === nodeId
    );

    if (existingConnection) {
      setConnectingFrom(null);
      return;
    }

    const fromNode = workflow.nodes.find((n) => n.id === connectingFrom);
    const toNode = workflow.nodes.find((n) => n.id === nodeId);

    if (!fromNode || !toNode) {
      setConnectingFrom(null);
      return;
    }

    const newConnection: Connection = {
      from: connectingFrom,
      to: nodeId,
    };

    const updatedWorkflow = {
      ...workflow,
      connections: [...workflow.connections, newConnection],
    };

    setWorkflow(updatedWorkflow);
    saveChanges(updatedWorkflow);
    setConnectingFrom(null);
  };

  const handleDeleteNode = () => {
    if (!workflow || !selectedNodeId) return;

    Alert.alert('Delete Node', 'Are you sure you want to delete this node?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedNodes = workflow.nodes.filter(
            (node) => node.id !== selectedNodeId
          );
          const updatedConnections = workflow.connections.filter(
            (conn) => conn.from !== selectedNodeId && conn.to !== selectedNodeId
          );

          const updatedWorkflow = {
            ...workflow,
            nodes: updatedNodes,
            connections: updatedConnections,
          };

          setWorkflow(updatedWorkflow);
          saveChanges(updatedWorkflow);
          setSelectedNodeId(undefined);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        {selectedNodeId && (
          <TouchableOpacity
            onPress={handleDeleteNode}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>

      <Canvas
        nodes={workflow.nodes}
        connections={workflow.connections}
        selectedNodeId={selectedNodeId}
        onNodeMove={handleNodeMove}
        onNodeSelect={handleNodeSelect}
        onConnectionStart={handleConnectionStart}
        onConnectionEnd={handleConnectionEnd}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNodePicker(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <NodePicker
        visible={showNodePicker}
        onClose={() => setShowNodePicker(false)}
        onSelectNode={handleAddNode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
