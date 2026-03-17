import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import MotionDetector from '../components/MotionDetector';
import SessionTimer from '../components/SessionTimer';
import { useSessionStore } from '../store/useSessionStore';
import { setTargetPosition } from '../services/motionAnalyzer';
import { initAR, placeTarget, renderAR, updateTargetFeedback, getTargetWorldPosition } from '../services/arService';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targetPlaced, setTargetPlaced] = useState(false);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const [hitSound, setHitSound] = useState<Audio.Sound | null>(null);
  const [missSound, setMissSound] = useState<Audio.Sound | null>(null);
  const [glReady, setGlReady] = useState(false);
  const navigation = useNavigation();
  const { startSession, endSession, logAttempt } = useSessionStore();
  const glViewRef = useRef<any>(null);

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

  const onContextCreate = async (gl: any) => {
    await initAR(gl);
    setGlReady(true);
    
    const animate = () => {
      renderAR();
      gl.endFrameEXP();
      requestAnimationFrame(animate);
    };
    animate();
  };

  const handleScreenTap = (event: any) => {
    if (!glReady) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = event.nativeEvent.target.measure 
      ? { width: 375, height: 667 }
      : { width: 375, height: 667 };
    
    const normalizedX = locationX / width;
    const normalizedY = locationY / height;
    const estimatedDepth = 2 + (normalizedY * 3);
    
    const screenPosition = {
      x: normalizedX,
      y: normalizedY,
      depth: estimatedDepth,
    };
    
    const result = placeTarget(screenPosition);
    
    if (result) {
      setTargetPosition(result.worldPosition);
      setTargetPlaced(true);
    }
  };

  const handleThrowDetected = async (result: any) => {
    logAttempt(result);
    setLastResult(result.hit ? 'hit' : 'miss');
    
    updateTargetFeedback(result.hit ? 'hit' : 'miss');
    
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
          <GLView
            style={styles.glView}
            onContextCreate={onContextCreate}
          />
        </TouchableOpacity>
      </Camera>
      <MotionDetector onThrowDetected={handleThrowDetected} />
      <SessionTimer onEndSession={handleEndSession} />
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {targetPlaced 
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
  glView: {
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
