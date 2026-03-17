import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import MotionDetector from '../components/MotionDetector';
import SessionTimer from '../components/SessionTimer';
import ARTargetOverlay from '../components/ARTargetOverlay';
import { useSessionStore } from '../store/useSessionStore';
import { setTargetPosition } from '../services/motionAnalyzer';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targetPosition, setTargetPositionState] = useState<{ x: number; y: number } | null>(null);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const [hitSound, setHitSound] = useState<Audio.Sound | null>(null);
  const [missSound, setMissSound] = useState<Audio.Sound | null>(null);
  const navigation = useNavigation();
  const { startSession, endSession, logAttempt } = useSessionStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
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
    const { width, height } = Dimensions.get('window');
    
    const normalizedX = locationX / width;
    const normalizedY = locationY / height;
    
    setTargetPositionState({ x: normalizedX, y: normalizedY });
    setTargetPosition({ x: normalizedX, y: normalizedY });
  };

  const handleThrowDetected = async (result: any) => {
    logAttempt(result);
    setLastResult(result.hit ? 'hit' : 'miss');
    
    try {
      if (result.hit && hitSound) {
        await hitSound.replayAsync();
      } else if (!result.hit && missSound) {
        await missSound.replayAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
    
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
      <Camera style={styles.camera} type={Camera.Constants.Type.back}>
        <TouchableOpacity 
          style={styles.touchOverlay} 
          onPress={handleScreenTap}
          activeOpacity={1}
        >
          {targetPosition && (
            <ARTargetOverlay position={targetPosition} result={lastResult} />
          )}
        </TouchableOpacity>
      </Camera>
      <MotionDetector onThrowDetected={handleThrowDetected} />
      <SessionTimer onEndSession={handleEndSession} />
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {targetPosition 
            ? 'Make a throwing motion to shoot!' 
            : 'Tap screen to place target'}
        </Text>
        {lastResult && (
          <Text style={[
            styles.resultText,
            { color: lastResult === 'hit' ? '#00ff00' : '#ff0000' }
          ]}>
            {lastResult === 'hit' ? 'HIT!' : 'MISS!'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  touchOverlay: {
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
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ARTrainingScreen;
