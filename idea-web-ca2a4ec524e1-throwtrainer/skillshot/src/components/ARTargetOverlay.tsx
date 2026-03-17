import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

interface ARTargetOverlayProps {
  position: { x: number; y: number; depth?: number };
  result?: 'hit' | 'miss' | null;
}

const ARTargetOverlay: React.FC<ARTargetOverlayProps> = ({ position, result }) => {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (result) {
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

  const { width, height } = Dimensions.get('window');
  const targetSize = 100;

  const flashColor = result === 'hit' 
    ? 'rgba(0, 255, 0, 0.6)' 
    : result === 'miss' 
    ? 'rgba(255, 0, 0, 0.6)' 
    : 'transparent';

  return (
    <Animated.View
      style={[
        styles.target,
        {
          left: position.x * width - targetSize / 2,
          top: position.y * height - targetSize / 2,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.outerRing} />
      <View style={styles.middleRing} />
      <View style={styles.innerRing} />
      <View style={styles.bullseye} />
      
      <Animated.View
        style={[
          styles.flash,
          {
            backgroundColor: flashColor,
            opacity: flashAnim,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  middleRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  innerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bullseye: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  flash: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});

export default ARTargetOverlay;
