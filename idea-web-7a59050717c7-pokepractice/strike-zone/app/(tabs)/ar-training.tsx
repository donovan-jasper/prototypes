import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { useStore } from '../../store/useStore';
import ARTargetOverlay from '../../components/ARTargetOverlay';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targets, setTargets] = useState([]);
  const { isPremium } = useStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const generateTargets = () => {
    if (!isPremium) {
      console.log('Premium feature');
      return;
    }
    // Generate random targets
    const newTargets = Array(5).fill().map(() => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.05,
    }));
    setTargets(newTargets);
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
        <ARTargetOverlay targets={targets} />
      </Camera>
      <TouchableOpacity style={styles.button} onPress={generateTargets}>
        <Text style={styles.buttonText}>Generate Targets</Text>
      </TouchableOpacity>
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
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ARTrainingScreen;
