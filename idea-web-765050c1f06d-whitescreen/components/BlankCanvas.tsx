import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import AppDrawer from './AppDrawer';
import Widget from './Widget';
import WidgetMenu from './WidgetMenu';
import { format } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const BlankCanvas: React.FC = () => {
  const { currentTheme, currentMode, widgets, addWidget, removeWidget } = useAppStore();
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Animation values
  const drawerTranslateY = useSharedValue(height);
  const widgetOpacity = useSharedValue(0);
  const widgetScale = useSharedValue(0.9);

  // Animated styles
  const widgetContainerStyle = useAnimatedStyle(() => ({
    opacity: widgetOpacity.value,
    transform: [{ scale: widgetScale.value }],
  }));

  // Gesture handlers
  const swipeUpHandler = useAnimatedGestureHandler({
    onEnd: (event) => {
      if (event.translationY < -50) {
        runOnJS(setShowAppDrawer)(true);
      }
    },
  });

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Animate widgets in when component mounts
      widgetOpacity.value = withTiming(1, { duration: 300 });
      widgetScale.value = withSpring(1, { damping: 10, stiffness: 100 });

      return () => {
        // Reset animations when leaving screen
        widgetOpacity.value = 0;
        widgetScale.value = 0.9;
      };
    }, [])
  );

  const handleLongPress = (widgetId: string) => {
    setSelectedWidgetId(widgetId);
    setShowWidgetMenu(true);
  };

  const handleAddWidget = (widgetType: 'timer' | 'scratchpad' | 'habitTracker') => {
    addWidget(widgetType);
    setShowWidgetMenu(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId);
    setShowWidgetMenu(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle={currentTheme.dark ? 'light-content' : 'dark-content'} />

      {/* Time display */}
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: currentTheme.text }]}>
          {format(currentTime, 'h:mm')}
        </Text>
        <Text style={[styles.dateText, { color: currentTheme.text }]}>
          {format(currentTime, 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* Focus mode indicator */}
      {currentMode && (
        <View style={[styles.modeIndicator, { backgroundColor: currentMode.color }]}>
          <Text style={styles.modeText}>{currentMode.name}</Text>
        </View>
      )}

      {/* Widgets area */}
      <PanGestureHandler onGestureEvent={swipeUpHandler}>
        <Animated.View style={[styles.widgetsContainer, widgetContainerStyle]}>
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              onLongPress={() => handleLongPress(widget.id)}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* App Drawer */}
      <AppDrawer
        visible={showAppDrawer}
        onClose={() => setShowAppDrawer(false)}
      />

      {/* Widget Menu */}
      {showWidgetMenu && selectedWidgetId && (
        <WidgetMenu
          widgetId={selectedWidgetId}
          onAddWidget={handleAddWidget}
          onRemoveWidget={handleRemoveWidget}
          onClose={() => setShowWidgetMenu(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  timeContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    marginTop: 5,
  },
  modeIndicator: {
    position: 'absolute',
    top: 120,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  widgetsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});

export default BlankCanvas;
