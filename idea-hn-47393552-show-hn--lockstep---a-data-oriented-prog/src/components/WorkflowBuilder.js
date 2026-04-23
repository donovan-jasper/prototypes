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
    { id: 'filter', label: 'Filter', color: '#4a6fa5' },
    { id: 'sort', label: 'Sort', color: '#5cb85c' },
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
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  const renderNodes = () => {
    return nodes.map(node => {
      const action = availableActions.find(a => a.id === node.type);
      const color = action ? action.color : '#666';

      return (
        <G key={node.id}>
          <Circle
            cx={node.x}
            cy={node.y}
            r="20"
            fill={color}
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
            fill="#333"
            onPress={() => startConnection(node.id)}
          />
        </G>
      );
    });
  };

  const renderActionPalette = () => {
    return (
      <View style={styles.paletteContainer}>
        <Text style={styles.paletteTitle}>Available Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.paletteItem, { backgroundColor: action.color }]}
              onPress={() => addNode(action.id)}
            >
              <Text style={styles.paletteItemText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={saveWorkflow}>
          <Text style={styles.toolbarButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {renderActionPalette()}

      <Svg style={styles.svgContainer} ref={svgRef}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <Path d="M0,0 V7 L10,3.5 Z" fill="#666" />
          </marker>
        </defs>

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
              onChangeText={(text) => setNodeConfig({ ...nodeConfig, value: text })}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolbarButton: {
    padding: 10,
    backgroundColor: '#4a6fa5',
    borderRadius: 5,
  },
  toolbarButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paletteContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  paletteTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paletteItem: {
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  paletteItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
  svgContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
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
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4a6fa5',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WorkflowBuilder;
