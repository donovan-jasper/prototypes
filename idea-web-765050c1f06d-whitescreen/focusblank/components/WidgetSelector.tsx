import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';

interface WidgetOption {
  id: string;
  name: string;
  type: string;
}

interface WidgetSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectWidget: (widget: WidgetOption) => void;
}

const widgetOptions: WidgetOption[] = [
  { id: 'timer', name: 'Timer', type: 'timer' },
  { id: 'scratchpad', name: 'Scratchpad', type: 'scratchpad' },
  { id: 'habittracker', name: 'Habit Tracker', type: 'habittracker' },
];

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ visible, onClose, onSelectWidget }) => {
  const handleSelect = (widget: WidgetOption) => {
    onSelectWidget(widget);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Widget</Text>
          {widgetOptions.map((widget) => (
            <TouchableOpacity
              key={widget.id}
              style={styles.option}
              onPress={() => handleSelect(widget)}
            >
              <Text style={styles.optionText}>{widget.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 15,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WidgetSelector;
