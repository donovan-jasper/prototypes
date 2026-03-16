import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import ARTargetOverlay from '../components/ARTargetOverlay';
import MotionDetector from '../components/MotionDetector';
import SessionTimer from '../components/SessionTimer';
import { useSessionStore } from '../store/useSessionStore';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const navigation = useNavigation();
  const { startSession, endSession, logAttempt } = useSessionStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    startSession();
  }, []);

  const handleThrowDetected = (result) => {
    logAttempt(result);
  };

  const handleEndSession = () => {
    endSession();
    navigation.navigate('Stats');
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back}>
        {targetPosition && <ARTargetOverlay position={targetPosition} />}
      </Camera>
      <MotionDetector onThrowDetected={handleThrowDetected} />
      <SessionTimer onEndSession={handleEndSession} />
      <Button
        title="Place Target"
        onPress={() => setTargetPosition({ x: 0.5, y: 0.5 })}
      />
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
});

export default ARTrainingScreen;
