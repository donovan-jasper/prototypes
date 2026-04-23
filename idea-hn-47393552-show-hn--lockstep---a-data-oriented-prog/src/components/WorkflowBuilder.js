import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import WorkflowService from '../services/WorkflowService';

const { width, height } = Dimensions.get('window');

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const svgRef = useRef(null);

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
      y: height / 2,
      type: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
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
      await WorkflowService.saveWorkflow(workflow);
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Failed to save workflow');
    }
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

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.button} onPress={() => addNode('filter')}>
          <Text style={styles.buttonText}>+ Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => addNode('transform')}>
          <Text style={styles.buttonText}>+ Transform</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => addNode('action')}>
          <Text style={styles.buttonText}>+ Action</Text>
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
          {nodes.map(node => (
            <React.Fragment key={node.id}>
              <Circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill="#4a6fa5"
                onPress={() => isConnecting ? completeConnection(node.id) : startConnection(node.id)}
              />
              <Text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="12"
              >
                {node.label}
              </Text>
            </React.Fragment>
          ))}
          {isConnecting && connectionStart && (
            <Path
              d={`M${connectionStart.x},${connectionStart.y} L${connectionStart.x + 1},${connectionStart.y + 1}`}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </Svg>
      </View>
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
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    backgroundColor: '#4a6fa5',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
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
});

export default WorkflowBuilder;
