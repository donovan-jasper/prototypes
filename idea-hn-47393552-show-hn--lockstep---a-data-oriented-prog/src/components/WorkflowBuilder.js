import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Svg, Path, Circle, G, Text as SvgText } from 'react-native-svg';
import WorkflowService from '../services/WorkflowService';

const { width, height } = Dimensions.get('window');

const WorkflowBuilder = ({ workflowId }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({});
  const [availableActions, setAvailableActions] = useState([
    { id: 'contacts', label: 'Contacts', color: '#4a6fa5' },
    { id: 'photos', label: 'Photos', color: '#5cb85c' },
    { id: 'files', label: 'Files', color: '#f0ad4e' },
    { id: 'filter', label: 'Filter', color: '#d9534f' },
    { id: 'sort', label: 'Sort', color: '#5bc0de' },
    { id: 'transform', label: 'Transform', color: '#f0ad4e' },
    { id: 'aggregate', label: 'Aggregate', color: '#d9534f' }
  ]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id) => {
    try {
      const workflow = await WorkflowService.getWorkflowById(id);
      if (workflow) {
        const parsedData = JSON.parse(workflow.data);
        setNodes(parsedData.nodes || []);
        setConnections(parsedData.connections || []);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;

        const clickedNode = nodes.find(node =>
          touchX >= node.x - 40 &&
          touchX <= node.x + 40 &&
          touchY >= node.y - 20 &&
          touchY <= node.y + 20
        );

        if (clickedNode) {
          setSelectedNode(clickedNode);
        } else {
          setSelectedNode(null);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (selectedNode) {
          const newNodes = nodes.map(node =>
            node.id === selectedNode.id
              ? { ...node, x: node.x + gestureState.dx, y: node.y + gestureState.dy }
              : node
          );
          setNodes(newNodes);
        }
      },
      onPanResponderRelease: () => {
        setSelectedNode(null);
      },
    })
  ).current;

  const addNode = (type) => {
    const newNode = {
      id: Date.now().toString(),
      x: width / 2,
      y: height / 3,
      type: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      config: {}
    };
    setNodes([...nodes, newNode]);
  };

  const startConnection = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setIsConnecting(true);
      setConnectionStart({ x: node.x, y: node.y, nodeId });
    }
  };

  const completeConnection = (nodeId) => {
    if (isConnecting && connectionStart && connectionStart.nodeId !== nodeId) {
      const newConnection = {
        id: Date.now().toString(),
        from: connectionStart.nodeId,
        to: nodeId
      };
      setConnections([...connections, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const saveWorkflow = async () => {
    const workflow = {
      nodes: nodes,
      connections: connections,
      createdAt: new Date().toISOString()
    };
    try {
      if (workflowId) {
        await WorkflowService.updateWorkflow(workflowId, workflow);
      } else {
        await WorkflowService.saveWorkflow(workflow);
      }
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Failed to save workflow');
    }
  };

  const openNodeConfig = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setNodeConfig(node.config || {});
      setShowConfigModal(true);
    }
  };

  const saveNodeConfig = () => {
    const updatedNodes = nodes.map(node =>
      node.id === selectedNode.id ? { ...node, config: nodeConfig } : node
    );
    setNodes(updatedNodes);
    setShowConfigModal(false);
  };

  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if (!fromNode || !toNode) return null;

      const path = `M${fromNode.x},${fromNode.y} C${(fromNode.x + toNode.x) / 2},${fromNode.y} ${(fromNode.x + toNode.x) / 2},${toNode.y} ${toNode.x},${toNode.y}`;

      return (
        <Path
          key={conn.id}
          d={path}
          stroke="#666"
          strokeWidth="2"
          fill="none"
        />
      );
    });
  };

  const renderNodes = () => {
    return nodes.map(node => (
      <G key={node.id}>
        <Circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill={availableActions.find(a => a.id === node.type)?.color || '#ccc'}
          onPress={() => openNodeConfig(node.id)}
        />
        <SvgText
          x={node.x}
          y={node.y + 5}
          fontSize="10"
          textAnchor="middle"
          fill="white"
        >
          {node.label}
        </SvgText>
        <Circle
          cx={node.x + 25}
          cy={node.y}
          r="8"
          fill="#4CAF50"
          onPress={() => startConnection(node.id)}
        />
        <Circle
          cx={node.x - 25}
          cy={node.y}
          r="8"
          fill="#F44336"
          onPress={() => completeConnection(node.id)}
        />
      </G>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => addNode(action.id)}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg
          ref={svgRef}
          width={width}
          height={height}
          style={styles.svg}
        >
          {renderConnections()}
          {renderNodes()}
          {isConnecting && connectionStart && (
            <Path
              d={`M${connectionStart.x},${connectionStart.y} L${connectionStart.x + 50},${connectionStart.y}`}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </Svg>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={saveWorkflow}>
          <Text style={styles.saveButtonText}>Save Workflow</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConfigModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure {selectedNode?.label}</Text>

            <TextInput
              style={styles.input}
              placeholder="Configuration value"
              value={nodeConfig.value || ''}
              onChangeText={(text) => setNodeConfig({...nodeConfig, value: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNodeConfig}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  canvas: {
    flex: 1,
  },
  svg: {
    flex: 1,
  },
  bottomBar: {
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WorkflowBuilder;
