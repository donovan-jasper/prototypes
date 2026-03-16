import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import Timer from './Timer';
import Scratchpad from './Scratchpad';

const BlankCanvas = () => {
  const { currentTheme, currentMode, widgets } = useAppStore();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.modeText, { color: currentTheme.text }]}>
        {currentMode?.name || 'Focus Mode'}
      </Text>
      {widgets.map((widget) => (
        <View key={widget.id} style={styles.widgetContainer}>
          {widget.type === 'timer' && <Timer />}
          {widget.type === 'scratchpad' && <Scratchpad />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 40,
    left: 20,
  },
  widgetContainer: {
    margin: 10,
  },
});

export default BlankCanvas;
