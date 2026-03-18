import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import useAppStore from '../store/useAppStore';
import Timer from './Timer';
import Scratchpad from './Scratchpad';
import HabitTracker from './HabitTracker';
import AppDrawer from './AppDrawer';
import WidgetSelector from './WidgetSelector';

const { height } = Dimensions.get('window');

const BlankCanvas = () => {
  const { currentTheme, currentMode, widgets, addWidget, updateWidgetPosition } = useAppStore();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);

  const handleSwipeUp = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY < -100) {
        setDrawerVisible(true);
      }
    }
  };

  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setSelectorVisible(true);
    }
  };

  const handleAddWidget = (widgetOption: any) => {
    const newWidget = {
      id: `${widgetOption.type}-${Date.now()}`,
      name: widgetOption.name,
      type: widgetOption.type,
      x: 50,
      y: 200,
    };
    addWidget(newWidget);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onHandlerStateChange={handleSwipeUp}>
        <Animated.View style={{ flex: 1 }}>
          <LongPressGestureHandler onHandlerStateChange={handleLongPress} minDurationMs={500}>
            <Animated.View style={[styles.container, { backgroundColor: currentTheme.background }]}>
              <Text style={[styles.modeText, { color: currentTheme.text }]}>
                {currentMode?.name || 'Focus Mode'}
              </Text>
              
              {widgets.map((widget) => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onPositionChange={(x, y) => updateWidgetPosition(widget.id, x, y)}
                />
              ))}
            </Animated.View>
          </LongPressGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <WidgetSelector
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onSelectWidget={handleAddWidget}
      />
    </GestureHandlerRootView>
  );
};

const DraggableWidget = ({ widget, onPositionChange }: any) => {
  const translateX = useRef(new Animated.Value(widget.x)).current;
  const translateY = useRef(new Animated.Value(widget.y)).current;

  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const newX = event.nativeEvent.translationX + widget.x;
      const newY = event.nativeEvent.translationY + widget.y;
      onPositionChange(newX, newY);
      translateX.setOffset(newX);
      translateY.setOffset(newY);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleStateChange}>
      <Animated.View
        style={[
          styles.widgetContainer,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {widget.type === 'timer' && <Timer />}
        {widget.type === 'scratchpad' && <Scratchpad />}
        {widget.type === 'habittracker' && <HabitTracker />}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeText: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  widgetContainer: {
    position: 'absolute',
  },
});

export default BlankCanvas;
