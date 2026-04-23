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
    return nodes.map(node => (
      <G key={node.id}>
        <Circle
          cx={node.x}
          cy={node.y}
          r="20"
          fill={node.type === 'filter' ? '#4a6fa5' :
                node.type === 'transform' ? '#5cb85c' : '#d9534f'}
          onPress={() => startConnection(node.id)}
          onPressOut={() => completeConnection(node.id)}
        />
        <SvgText
          x={node.x}
          y={node.y + 5}
          fontSize="10"
          fill="white"
          textAnchor="middle"
        >
          {node.label}
        </SvgText>
        <Circle
          cx={node.x + 25}
          cy={node.y - 25}
          r="10"
          fill="#f0ad4e"
          onPress={() => openNodeConfig(node.id)}
        />
        <SvgText
          x={node.x + 25}
          y={node.y - 22}
          fontSize="8"
          fill="white"
          textAnchor="middle"
        >
          ⚙️
        </SvgText>
      </G>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={() => addNode('filter')}>
          <Text style={styles.buttonText}>+ Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => addNode('transform')}>
          <Text style={styles.buttonText}>+ Transform</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => addNode('output')}>
          <Text style={styles.buttonText}>+ Output</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={saveWorkflow}>
          <Text style={styles.saveButtonText}>Save Workflow</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill} ref={svgRef}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
          {renderConnections()}
          {renderNodes()}
        </Svg>
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
            <ScrollView style={styles.configScroll}>
              {selectedNode?.type === 'filter' && (
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Filter Condition:</Text>
                  <TextInput
                    style={styles.configInput}
                    value={nodeConfig.condition || ''}
                    onChangeText={(text) => setNodeConfig({...nodeConfig, condition: text})}
                    placeholder="Enter filter condition"
                  />
                </View>
              )}
              {selectedNode?.type === 'transform' && (
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Transformation:</Text>
                  <TextInput
                    style={styles.configInput}
                    value={nodeConfig.transformation || ''}
                    onChangeText={(text) => setNodeConfig({...nodeConfig, transformation: text})}
                    placeholder="Enter transformation"
                  />
                </View>
              )}
              {selectedNode?.type === 'output' && (
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Output Destination:</Text>
                  <TextInput
                    style={styles.configInput}
                    value={nodeConfig.destination || ''}
                    onChangeText={(text) => setNodeConfig({...nodeConfig, destination: text})}
                    placeholder="Enter output destination"
                  />
                </View>
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfigModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveNodeConfig}>
                <Text style={styles.saveButtonText}>Save</Text>
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
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    backgroundColor: '#4a6fa5',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#5cb85c',
    padding: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  canvas: {
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  configScroll: {
    maxHeight: 300,
  },
  configItem: {
    marginBottom: 15,
  },
  configLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default WorkflowBuilder;
