import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { recognizeGesture } from '../lib/gestureRecognizer';

const GestureCanvas = ({ onGestureRecognized }) => {
  const pointsRef = useRef([]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pointsRef.current = [];
    },
    onPanResponderMove: (_, gestureState) => {
      pointsRef.current.push({
        x: gestureState.moveX,
        y: gestureState.moveY,
      });
    },
    onPanResponderRelease: () => {
      const gesture = recognizeGesture(pointsRef.current);
      if (gesture) {
        onGestureRecognized(gesture);
      }
    },
  });

  return <View style={styles.container} {...panResponder.panHandlers} />;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GestureCanvas;
