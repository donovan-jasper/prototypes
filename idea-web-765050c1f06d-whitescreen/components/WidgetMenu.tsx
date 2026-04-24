import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useAppStore } from '../store/useAppStore';

interface WidgetMenuProps {
  visible: boolean;
  onClose: () => void;
  onAddWidget: (type: 'timer' | 'scratchpad' | 'habitTracker') => void;
  onRemoveWidget: (widgetId: string) => void;
}

const WidgetMenu: React.FC<WidgetMenuProps> = ({
  visible,
  onClose,
  onAddWidget,
  onRemoveWidget
}) => {
  const { currentTheme, widgets } = useAppStore();

  const widgetTypes = [
    { id: 'timer', name: 'Timer', description: 'Pomodoro timer' },
    { id: 'scratchpad', name: 'Scratchpad', description: 'Quick notes' },
    { id: 'habitTracker', name: 'Habit Tracker', description: 'Track daily habits' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: currentTheme.drawerBackground }]}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Widget Menu</Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Add Widget</Text>
          <FlatList
            data={widgetTypes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.widgetItem, { borderColor: currentTheme.text }]}
                onPress={() => {
                  onAddWidget(item.id as 'timer' | 'scratchpad' | 'habitTracker');
                  onClose();
                }}
              >
                <Text style={[styles.widgetName, { color: currentTheme.text }]}>{item.name}</Text>
                <Text style={[styles.widgetDescription, { color: currentTheme.text }]}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Remove Widget</Text>
          <FlatList
            data={widgets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.widgetItem, { borderColor: currentTheme.text }]}
                onPress={() => {
                  onRemoveWidget(item.id);
                  onClose();
                }}
              >
                <Text style={[styles.widgetName, { color: currentTheme.text }]}>
                  {widgetTypes.find(w => w.id === item.type)?.name || 'Unknown'}
                </Text>
                <Text style={[styles.widgetDescription, { color: currentTheme.text }]}>Tap to remove</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: currentTheme.text }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: currentTheme.widgetBackground }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  widgetItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  widgetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  widgetDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WidgetMenu;
