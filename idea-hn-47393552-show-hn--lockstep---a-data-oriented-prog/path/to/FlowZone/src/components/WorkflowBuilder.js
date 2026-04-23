import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Modal, Dimensions, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import WorkflowService from '../services/WorkflowService';

const { width, height } = Dimensions.get('window');

const WorkflowBuilder = () => {
  const [steps, setSteps] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stepConfig, setStepConfig] = useState({ type: '', name: '', options: {} });
  const [draggingStep, setDraggingStep] = useState(null);
  const [stepPosition, setStepPosition] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [startStep, setStartStep] = useState(null);

  const canvasRef = useRef(null);

  const stepTypes = [
    { id: 'filter', name: 'Filter', icon: 'filter', color: '#4CAF50' },
    { id: 'transform', name: 'Transform', icon: 'repeat', color: '#2196F3' },
    { id: 'action', name: 'Action', icon: 'play', color: '#FF9800' },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (draggingStep) {
          setStepPosition({
            x: gestureState.moveX,
            y: gestureState.moveY,
          });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (draggingStep) {
          setStepPosition({
            x: gestureState.moveX,
            y: gestureState.moveY,
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (draggingStep) {
          const newStep = {
            id: Date.now().toString(),
            type: draggingStep.id,
            name: draggingStep.name,
            position: {
              x: gestureState.moveX - 50,
              y: gestureState.moveY - 50,
            },
            config: { type: draggingStep.id, name: draggingStep.name, options: {} },
          };
          setSteps([...steps, newStep]);
          setDraggingStep(null);
        }
      },
    })
  ).current;

  const handleStepPress = (step) => {
    setSelectedStep(step);
    setStepConfig(step.config);
    setModalVisible(true);
  };

  const handleSaveConfig = () => {
    const updatedSteps = steps.map(step =>
      step.id === selectedStep.id ? { ...step, config: stepConfig } : step
    );
    setSteps(updatedSteps);
    setModalVisible(false);
  };

  const handleStartConnection = (step) => {
    setIsConnecting(true);
    setStartStep(step);
  };

  const handleEndConnection = (endStep) => {
    if (startStep && endStep && startStep.id !== endStep.id) {
      const newConnection = {
        id: Date.now().toString(),
        from: startStep.id,
        to: endStep.id,
      };
      setConnections([...connections, newConnection]);
    }
    setIsConnecting(false);
    setStartStep(null);
  };

  const handleSaveWorkflow = async () => {
    const workflow = {
      name: 'My Workflow',
      steps: steps,
      connections: connections,
    };
    try {
      await WorkflowService.createWorkflow(workflow);
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Error saving workflow');
    }
  };

  const renderStep = ({ item }) => (
    <TouchableOpacity
      style={[styles.step, { left: item.position.x, top: item.position.y }]}
      onPress={() => handleStepPress(item)}
      onLongPress={() => handleStartConnection(item)}
    >
      <View style={[styles.stepHeader, { backgroundColor: stepTypes.find(t => t.id === item.type)?.color }]}>
        <Feather name={stepTypes.find(t => t.id === item.type)?.icon} size={16} color="white" />
        <Text style={styles.stepHeaderText}>{item.name}</Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={styles.stepText}>{item.config.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderConnection = (connection) => {
    const fromStep = steps.find(step => step.id === connection.from);
    const toStep = steps.find(step => step.id === connection.to);

    if (!fromStep || !toStep) return null;

    const fromX = fromStep.position.x + 50;
    const fromY = fromStep.position.y + 50;
    const toX = toStep.position.x + 50;
    const toY = toStep.position.y + 50;

    return (
      <View
        key={connection.id}
        style={[
          styles.connection,
          {
            left: fromX,
            top: fromY,
            width: Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)),
            transform: [{ rotate: `${Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI}deg` }],
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.palette}>
        {stepTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.paletteItem, { backgroundColor: type.color }]}
            onPress={() => setDraggingStep(type)}
          >
            <Feather name={type.icon} size={20} color="white" />
            <Text style={styles.paletteItemText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        ref={canvasRef}
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        {steps.map(renderStep)}
        {connections.map(renderConnection)}

        {draggingStep && (
          <View style={[styles.draggingStep, { left: stepPosition.x - 50, top: stepPosition.y - 50 }]}>
            <View style={[styles.stepHeader, { backgroundColor: draggingStep.color }]}>
              <Feather name={draggingStep.icon} size={16} color="white" />
              <Text style={styles.stepHeaderText}>{draggingStep.name}</Text>
            </View>
          </View>
        )}

        {isConnecting && startStep && (
          <View
            style={[
              styles.connectionLine,
              {
                left: startStep.position.x + 50,
                top: startStep.position.y + 50,
                width: stepPosition.x - (startStep.position.x + 50),
                height: stepPosition.y - (startStep.position.y + 50),
              }
            ]}
          />
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleSaveWorkflow}>
          <Feather name="save" size={20} color="white" />
          <Text style={styles.toolbarButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Step</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Step name"
              value={stepConfig.name}
              onChangeText={(text) => setStepConfig({ ...stepConfig, name: text })}
            />

            {stepConfig.type === 'filter' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Filter condition"
                value={stepConfig.options.condition || ''}
                onChangeText={(text) => setStepConfig({
                  ...stepConfig,
                  options: { ...stepConfig.options, condition: text }
                })}
              />
            )}

            {stepConfig.type === 'transform' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Transformation rule"
                value={stepConfig.options.rule || ''}
                onChangeText={(text) => setStepConfig({
                  ...stepConfig,
                  options: { ...stepConfig.options, rule: text }
                })}
              />
            )}

            {stepConfig.type === 'action' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Action to perform"
                value={stepConfig.options.action || ''}
                onChangeText={(text) => setStepConfig({
                  ...stepConfig,
                  options: { ...stepConfig.options, action: text }
                })}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveConfig}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Save</Text>
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
  palette: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  paletteItemText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  step: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  stepHeaderText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepBody: {
    flex: 1,
    padding: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#333',
  },
  draggingStep: {
    position: 'absolute',
    width: 100,
    height: 100,
    opacity: 0.8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#999',
    transformOrigin: '0 0',
  },
  connectionLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#999',
    borderStyle: 'dashed',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginRight: 10,
  },
  toolbarButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#666',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  modalButtonPrimaryText: {
    color: 'white',
  },
});

export default WorkflowBuilder;
