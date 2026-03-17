import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import ARTargetOverlay from '../components/ARTargetOverlay';
import MotionDetector from '../components/MotionDetector';
import SessionTimer from '../components/SessionTimer';
import { useSessionStore } from '../store/useSessionStore';
import { setTargetPosition } from '../services/motionAnalyzer';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targetPosition, setTargetPositionState] = useState(null);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const [hitSound, setHitSound] = useState<Audio.Sound | null>(null);
  const [missSound, setMissSound] = useState<Audio.Sound | null>(null);
  const navigation = useNavigation();
  const { startSession, endSession, logAttempt } = useSessionStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Load sounds
      try {
        const { sound: hit } = await Audio.Sound.createAsync(
          require('../../assets/ding.mp3')
        );
        const { sound: miss } = await Audio.Sound.createAsync(
          require('../../assets/whoosh.mp3')
        );
        setHitSound(hit);
        setMissSound(miss);
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    })();
    startSession();

    return () => {
      if (hitSound) {
        hitSound.unloadAsync();
      }
      if (missSound) {
        missSound.unloadAsync();
      }
    };
  }, []);

  const handleScreenTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = event.nativeEvent.target.measure 
      ? { width: 375, height: 667 } // Default fallback
      : { width: 375, height: 667 };
    
    // Normalize coordinates to 0-1 range
    const normalizedX = locationX / width;
    const normalizedY = locationY / height;
    
    // Estimate depth based on screen position (simple heuristic)
    // Objects higher on screen are assumed to be further away
    const estimatedDepth = 2 + (normalizedY * 3); // 2-5 meters
    
    const position = {
      x: normalizedX,
      y: normalizedY,
      depth: estimatedDepth,
    };
    
    setTargetPositionState(position);
    setTargetPosition(position);
  };

  const handleThrowDetected = async (result: any) => {
    logAttempt(result);
    setLastResult(result.hit ? 'hit' : 'miss');
    
    // Play sound
    try {
      if (result.hit && hitSound) {
        await hitSound.replayAsync();
      } else if (!result.hit && missSound) {
        await missSound.replayAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
    
    // Clear result after animation
    setTimeout(() => {
      setLastResult(null);
    }, 1000);
  };

  const handleEndSession = () => {
    endSession();
    navigation.navigate('Stats');
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.cameraContainer} 
        onPress={handleScreenTap}
        activeOpacity={1}
      >
        <Camera style={styles.camera} type={Camera.Constants.Type.back}>
          {targetPosition && (
            <ARTargetOverlay 
              position={targetPosition} 
              result={lastResult}
            />
          )}
        </Camera>
      </TouchableOpacity>
      <MotionDetector onThrowDetected={handleThrowDetected} />
      <SessionTimer onEndSession={handleEndSession} />
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {targetPosition 
            ? 'Make a throwing motion to shoot!' 
            : 'Tap screen to place target'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ARTrainingScreen;
