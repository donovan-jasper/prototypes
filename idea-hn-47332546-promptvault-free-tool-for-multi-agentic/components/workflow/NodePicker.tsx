import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NodeType {
  type: 'trigger' | 'ai' | 'action';
  label: string;
  icon: string;
  color: string;
  description: string;
}

const NODE_TYPES: NodeType[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: 'lightning-bolt',
    color: '#4caf50',
    description: 'Start your workflow',
  },
  {
    type: 'ai',
    label: 'AI Agent',
    icon: 'brain',
    color: '#2196f3',
    description: 'Process with AI',
  },
  {
    type: 'action',
    label: 'Action',
    icon: 'cog',
    color: '#ff9800',
    description: 'Execute an action',
  },
];

interface NodePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectNode: (type: 'trigger' | 'ai' | 'action') => void;
}

export default function NodePicker({
  visible,
  onClose,
  onSelectNode,
}: NodePickerProps) {
  const handleSelect = (type: 'trigger' | 'ai' | 'action') => {
    onSelectNode(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Node</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.nodeList}>
            {NODE_TYPES.map((nodeType) => (
              <TouchableOpacity
                key={nodeType.type}
                style={styles.nodeButton}
                onPress={() => handleSelect(nodeType.type)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: nodeType.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={nodeType.icon as any}
                    size={32}
                    color={nodeType.color}
                  />
                </View>
                <View style={styles.nodeInfo}>
                  <Text style={styles.nodeLabel}>{nodeType.label}</Text>
                  <Text style={styles.nodeDescription}>
                    {nodeType.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  nodeList: {
    padding: 20,
    gap: 12,
  },
  nodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInfo: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nodeDescription: {
    fontSize: 14,
    color: '#666',
  },
});
