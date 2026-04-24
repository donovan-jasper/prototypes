import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import AppDrawer from './AppDrawer';
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
  const { currentTheme, currentMode, widgets } = useAppStore();
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  // Animation values
  const drawerTranslateY = useSharedValue(height);
  const widgetOpacity = useSharedValue(0);
  const widgetScale = useSharedValue(0.9);

  // Animated styles
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerTranslateY.value }],
  }));

  const widgetContainerStyle = useAnimatedStyle(() => ({
    opacity: widgetOpacity.value,
    transform: [{ scale: widgetScale.value }],
  }));

  // Gesture handlers
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = drawerTranslateY.value;
    },
    onActive: (event, ctx) => {
      if (event.translationY > 0) {
        drawerTranslateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        drawerTranslateY.value = withSpring(height, { damping: 20 });
        runOnJS(setShowAppDrawer)(false);
      } else {
        drawerTranslateY.value = withSpring(0, { damping: 20 });
      }
    },
  });

  const swipeUpHandler = useAnimatedGestureHandler({
    onEnd: (event) => {
      if (event.translationY < -50) {
        drawerTranslateY.value = withSpring(0, { damping: 20 });
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

  const handleLongPress = () => {
    setShowWidgetMenu(true);
  };

  const handleSwipeUp = () => {
    setShowAppDrawer(true);
    drawerTranslateY.value = withSpring(0, { damping: 20 });
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
      <Animated.View style={[styles.widgetsContainer, widgetContainerStyle]}>
        {widgets.map((widget) => (
          <TouchableOpacity
            key={widget.id}
            style={[styles.widget, { backgroundColor: currentTheme.widgetBackground }]}
            onLongPress={handleLongPress}
            activeOpacity={0.8}
          >
            {/* Render widget based on type */}
            {widget.type === 'timer' && (
              <View style={styles.timerWidget}>
                <Text style={[styles.widgetTitle, { color: currentTheme.text }]}>Timer</Text>
                <Text style={[styles.widgetValue, { color: currentTheme.text }]}>25:00</Text>
                <View style={styles.timerControls}>
                  <TouchableOpacity style={styles.timerButton}>
                    <Text style={[styles.timerButtonText, { color: currentTheme.text }]}>Start</Text>
                  </TouchableOpacity>
                </View>
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
      <PanGestureHandler onGestureEvent={swipeUpHandler}>
        <Animated.View style={styles.swipeUpArea}>
          <View style={[styles.swipeIndicator, { backgroundColor: currentTheme.text }]} />
        </Animated.View>
      </PanGestureHandler>

      {/* App drawer */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.drawerContainer, drawerStyle]}>
          <AppDrawer
            visible={showAppDrawer}
            onClose={() => {
              setShowAppDrawer(false);
              drawerTranslateY.value = withSpring(height, { damping: 20 });
            }}
            allowedApps={currentMode?.allowedApps}
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Widget menu modal */}
      {showWidgetMenu && (
        <View style={styles.widgetMenu}>
          <Text style={[styles.widgetMenuTitle, { color: currentTheme.text }]}>Add Widget</Text>
          <View style={styles.widgetOptions}>
            <TouchableOpacity style={styles.widgetOption}>
              <Text style={[styles.widgetOptionText, { color: currentTheme.text }]}>Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.widgetOption}>
              <Text style={[styles.widgetOptionText, { color: currentTheme.text }]}>Scratchpad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.widgetOption}>
              <Text style={[styles.widgetOptionText, { color: currentTheme.text }]}>Habit Tracker</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowWidgetMenu(false)}
          >
            <Text style={[styles.closeButtonText, { color: currentTheme.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
    height: 160,
    justifyContent: 'space-between',
  },
  scratchpadWidget: {
    padding: 16,
    height: 160,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  widgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  widgetText: {
    fontSize: 14,
    marginTop: 8,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  timerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerButtonText: {
    fontSize: 14,
  },
  swipeUpArea: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    backgroundColor: 'transparent',
  },
  widgetMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  widgetMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  widgetOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  widgetOption: {
    width: '30%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  widgetOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BlankCanvas;
