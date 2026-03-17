import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useStore } from '../../store/useStore';
import { initAREngine, addTarget, removeTarget } from '../../lib/ar-engine';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import * as Haptics from 'expo-haptics';

const ARTrainingScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const { isPremium } = useStore();
  const glViewRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const targetMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVectorRef = useRef(new THREE.Vector2());

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
      targetMeshesRef.current.forEach(mesh => {
        removeTarget(sceneRef.current, mesh);
      });
      targetMeshesRef.current = [];
    }

    // Generate new targets
    const newTargets = [];
    const newMeshes = [];
    const targetCount = 5;

    for (let i = 0; i < targetCount; i++) {
      // Position targets in front of the camera at varying distances
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = -5 - Math.random() * 3; // Between -5 and -8 units from camera
      newTargets.push({ x, y, z });

      if (sceneRef.current) {
        const targetMesh = addTarget(sceneRef.current, { x, y, z });
        newMeshes.push(targetMesh);
      }
    }

    setTargets(newTargets);
    targetMeshesRef.current = newMeshes;
    setTotalTargets(targetCount);
    setHits(0);
  };

  const handleHit = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= targetMeshesRef.current.length) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Remove target from scene
    if (sceneRef.current) {
      removeTarget(sceneRef.current, targetMeshesRef.current[targetIndex]);
      targetMeshesRef.current.splice(targetIndex, 1);
    }

    // Update state
    setHits(prev => prev + 1);
    setScore(prev => prev + 100);

    // Check if all targets are hit
    if (targetMeshesRef.current.length === 0) {
      generateTargets();
    }
  };

  const handleRaycast = (event) => {
    if (!sceneRef.current || !cameraRef.current) return;

    // Get normalized device coordinates
    const { locationX, locationY } = event.nativeEvent;
    const rect = event.nativeEvent.target.getBoundingClientRect();

    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    mouseVectorRef.current.x = (locationX / rect.width) * 2 - 1;
    mouseVectorRef.current.y = -(locationY / rect.height) * 2 + 1;

    // Update the raycaster
    raycasterRef.current.setFromCamera(mouseVectorRef.current, cameraRef.current);

    // Check for intersections
    const intersects = raycasterRef.current.intersectObjects(targetMeshesRef.current);

    if (intersects.length > 0) {
      const targetIndex = targetMeshesRef.current.indexOf(intersects[0].object);
      handleHit(targetIndex);
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
          onTouchStart={handleRaycast}
        />
      </Camera>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.accuracyText}>Accuracy: {totalTargets > 0 ? Math.round((hits / totalTargets) * 100) : 0}%</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={generateTargets}>
        <Text style={styles.buttonText}>New Targets</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accuracyText: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ARTrainingScreen;
