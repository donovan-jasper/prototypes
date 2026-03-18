import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import useAppStore from '../../store/useAppStore';

const widgetTypes = [
  { id: 'timer', name: 'Timer', type: 'timer', description: 'Pomodoro-style focus timer' },
  { id: 'scratchpad', name: 'Scratchpad', type: 'scratchpad', description: 'Quick notes that auto-save' },
  { id: 'habittracker', name: 'Habit Tracker', type: 'habittracker', description: 'Track up to 3 daily habits' },
];

const WidgetsScreen = () => {
  const { addWidget } = useAppStore();

  const handleAddWidget = (widgetType: any) => {
    const newWidget = {
      id: `${widgetType.type}-${Date.now()}`,
      name: widgetType.name,
      type: widgetType.type,
      x: 50,
      y: 200,
    };
    addWidget(newWidget);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Widgets</Text>
      <Text style={styles.subtitle}>Add widgets to your home screen</Text>
      
      {widgetTypes.map((widget) => (
        <View key={widget.id} style={styles.widgetCard}>
          <View style={styles.widgetInfo}>
            <Text style={styles.widgetName}>{widget.name}</Text>
            <Text style={styles.widgetDescription}>{widget.description}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddWidget(widget)}
          >
            <Text style={styles.addButtonText}>Add to Home</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  widgetCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetInfo: {
    flex: 1,
    marginRight: 12,
  },
  widgetName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WidgetsScreen;
