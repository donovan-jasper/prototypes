import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import AppDrawer from './AppDrawer';
import { format } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const BlankCanvas: React.FC = () => {
  const { currentTheme, currentMode, widgets } = useAppStore();
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animation for widgets
  const widgetOpacity = useSharedValue(0);
  const widgetStyle = useAnimatedStyle(() => ({
    opacity: widgetOpacity.value,
  }));

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Animate widgets in when component mounts
    widgetOpacity.value = withSpring(1, { damping: 10, stiffness: 100 });

    return () => clearInterval(timer);
  }, []);

  const handleLongPress = () => {
    // Show widget menu or add widget functionality
    console.log('Long press detected - show widget menu');
  };

  const handleSwipeUp = () => {
    setShowAppDrawer(true);
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
      <Animated.View style={[styles.widgetsContainer, widgetStyle]}>
        {widgets.map((widget) => (
          <TouchableOpacity
            key={widget.id}
            style={styles.widget}
            onLongPress={handleLongPress}
          >
            {/* Render widget based on type */}
            {widget.type === 'timer' && (
              <View style={styles.timerWidget}>
                <Text style={[styles.widgetTitle, { color: currentTheme.text }]}>Timer</Text>
                <Text style={[styles.widgetValue, { color: currentTheme.text }]}>25:00</Text>
              </View>
            )}
            {widget.type === 'scratchpad' && (
              <View style={styles.scratchpadWidget}>
                <Text style={[styles.widgetTitle, { color: currentTheme.text }]}>Notes</Text>
                <Text style={[styles.widgetText, { color: currentTheme.text }]}>Quick notes...</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Swipe up gesture area */}
      <TouchableOpacity
        style={styles.swipeUpArea}
        onPress={handleSwipeUp}
        activeOpacity={0.8}
      >
        <View style={[styles.swipeIndicator, { backgroundColor: currentTheme.text }]} />
      </TouchableOpacity>

      {/* App drawer */}
      <AppDrawer
        visible={showAppDrawer}
        onClose={() => setShowAppDrawer(false)}
        allowedApps={currentMode?.allowedApps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 18,
    marginTop: 4,
  },
  modeIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    right: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modeText: {
    color: 'white',
    fontWeight: '600',
  },
  widgetsContainer: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  widget: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timerWidget: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchpadWidget: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 120,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  widgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  widgetText: {
    fontSize: 14,
  },
  swipeUpArea: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
});

export default BlankCanvas;
