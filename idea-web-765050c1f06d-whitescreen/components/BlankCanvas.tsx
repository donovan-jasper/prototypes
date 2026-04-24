import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import AppDrawer from './AppDrawer';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking } from 'react-native';

const { height, width } = Dimensions.get('window');

const BlankCanvas: React.FC = () => {
  const { currentTheme, currentMode, widgets } = useAppStore();
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [showSetDefaultPrompt, setShowSetDefaultPrompt] = React.useState(false);

  // Check if we should show the set default prompt
  React.useEffect(() => {
    // In a real app, you would check if the app is already set as default
    // For this example, we'll just show it once
    const checkDefaultLauncher = async () => {
      // This is a placeholder - actual implementation would be platform-specific
      setShowSetDefaultPrompt(true);
    };
    checkDefaultLauncher();
  }, []);

  const handleSetDefaultLauncher = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android, we need to launch the home settings
        await IntentLauncher.startActivityAsync('android.settings.HOME_SETTINGS');
      } else if (Platform.OS === 'ios') {
        // For iOS, we need to open the settings app
        await Linking.openURL('app-settings:');
      }
      setShowSetDefaultPrompt(false);
    } catch (error) {
      console.error('Error setting default launcher:', error);
    }
  };

  // Gesture for swipe up to open drawer
  const swipeUpGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationY < -50) {
        setDrawerVisible(true);
      }
    });

  // Gesture for long press to add widget
  const longPressGesture = Gesture.LongPress()
    .onEnd(() => {
      // In a real app, this would open a widget selection modal
      console.log('Long press detected - would open widget menu');
    });

  // Animated style for the main container
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerVisible ? -50 : 0 }],
  }));

  return (
    <GestureDetector gesture={swipeUpGesture}>
      <Animated.View style={[styles.container, containerStyle]}>
        <LinearGradient
          colors={currentTheme.gradient}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <Text style={[styles.timeText, { color: currentTheme.text }]}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {currentMode && (
            <Text style={[styles.modeText, { color: currentTheme.text }]}>
              {currentMode.name}
            </Text>
          )}

          {/* Widgets would be rendered here */}
          <View style={styles.widgetsContainer}>
            {widgets.map(widget => (
              <GestureDetector key={widget.id} gesture={longPressGesture}>
                <View style={styles.widget}>
                  <Text style={[styles.widgetText, { color: currentTheme.text }]}>
                    {widget.type}
                  </Text>
                </View>
              </GestureDetector>
            ))}
          </View>
        </View>

        {showSetDefaultPrompt && (
          <View style={styles.defaultPrompt}>
            <Text style={styles.promptText}>
              Set FocusBlank as your default launcher for a distraction-free experience
            </Text>
            <TouchableOpacity
              style={[styles.promptButton, { backgroundColor: currentTheme.accent }]}
              onPress={handleSetDefaultLauncher}
            >
              <Text style={styles.promptButtonText}>Set Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modeText: {
    fontSize: 24,
    marginBottom: 30,
  },
  widgetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  widget: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  widgetText: {
    fontSize: 16,
  },
  defaultPrompt: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  promptText: {
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  promptButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  promptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BlankCanvas;
