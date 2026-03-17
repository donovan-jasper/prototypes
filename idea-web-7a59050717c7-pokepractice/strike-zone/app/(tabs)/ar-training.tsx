import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useStore } from '../../store/useStore';
import { initAREngine, addTarget } from '../../lib/ar-engine';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const { isPremium } = useStore();
  const glViewRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onContextCreate = async (gl) => {
    const { scene, camera } = initAREngine(gl);
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Add initial targets
    generateTargets();
  };

  const generateTargets = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'AR Training is a premium feature. Please upgrade to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Clear existing targets
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
    }

    // Generate new targets
    const newTargets = [];
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = -5 - Math.random() * 3;
      newTargets.push({ x, y, z });
      if (sceneRef.current) {
        addTarget(sceneRef.current, { x, y, z });
      }
    }
    setTargets(newTargets);
  };

  const handleHit = (targetIndex) => {
    if (sceneRef.current && sceneRef.current.children[targetIndex]) {
      sceneRef.current.remove(sceneRef.current.children[targetIndex]);
      setScore(prev => prev + 100);
      setTargets(prev => prev.filter((_, i) => i !== targetIndex));
    }
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
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={onContextCreate}
        />
      </Camera>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
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
  glView: {
    flex: 1,
  },
  scoreContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ARTrainingScreen;
