import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Timer from './Timer';
import Scratchpad from './Scratchpad';
import HabitTracker from './HabitTracker';
import { useAppStore } from '../store/useAppStore';

interface WidgetProps {
  widget: {
    id: string;
    type: 'timer' | 'scratchpad' | 'habitTracker';
    position: number;
  };
  onLongPress: () => void;
}

const Widget: React.FC<WidgetProps> = ({ widget, onLongPress }) => {
  const { currentTheme } = useAppStore();

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'timer':
        return <Timer widgetId={widget.id} />;
      case 'scratchpad':
        return <Scratchpad widgetId={widget.id} />;
      case 'habitTracker':
        return <HabitTracker widgetId={widget.id} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: currentTheme.widgetBackground }]}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      {renderWidgetContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Widget;
