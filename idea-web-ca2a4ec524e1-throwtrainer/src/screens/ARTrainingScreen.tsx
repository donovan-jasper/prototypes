import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useSessionStore } from '../store/useSessionStore';
import { useUserStore } from '../store/useUserStore';
import { ThrowData, calculateAccuracy } from '../utils/calculations';
import { motionAnalyzer } from '../services/motionAnalyzer';

export default function ARTrainingScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [targets, setTargets] = useState<Array<{ x: number; y: number; id: string }>>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { startSession, endSession, logAttempt } = useSessionStore();
  const { isPremium, sessionCount } = useUserStore();
  const glViewRef = useRef<GLView>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Initialize motion analyzer
    motionAnalyzer.start();

    // Subscribe to throw events
    const subscription = motionAnalyzer.onThrowDetected((throwData: ThrowData) => {
      handleThrowDetected(throwData);
    });

    return () => {
      motionAnalyzer.stop();
      subscription.remove();
    };
  }, []);

  const handleThrowDetected = (throwData: ThrowData) => {
    if (!isSessionActive || targets.length === 0) return;

    setTotalAttempts(prev => prev + 1);

    // Simple hit detection - check if throw is close to any target
    const hitTarget = targets.some(target => {
      // In a real app, this would use proper 3D collision detection
      // For MVP, we'll use a simple distance check
      const distance = Math.sqrt(
        Math.pow(throwData.x - target.x, 2) +
        Math.pow(throwData.y - target.y, 2)
      );
      return distance < 0.2; // 20% of screen width
    });

    if (hitTarget) {
      setHits(prev => prev + 1);
      logAttempt({ success: true, speed: throwData.speed, angle: throwData.angle });
      showFeedback(true);
    } else {
      logAttempt({ success: false, speed: throwData.speed, angle: throwData.angle });
      showFeedback(false);
    }
  };

  const showFeedback = (isHit: boolean) => {
    if (!sceneRef.current) return;

    // Create a temporary feedback sphere
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: isHit ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);

    // Position the sphere at the center of the screen
    sphere.position.set(0, 0, -1);

    sceneRef.current.add(sphere);

    // Remove the sphere after 1 second
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.remove(sphere);
      }
    }, 1000);
  };

  const handlePlaceTarget = (event: any) => {
    if (!glViewRef.current) return;

    // Get normalized device coordinates (-1 to +1)
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = glViewRef.current;

    const x = (locationX / width) * 2 - 1;
    const y = -(locationY / height) * 2 + 1;

    setTargets(prev => [...prev, { x, y, id: Date.now().toString() }]);

    // Add visual target to the 3D scene
    if (sceneRef.current) {
      const geometry = new THREE.CircleGeometry(0.1, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const circle = new THREE.Mesh(geometry, material);

      // Position the circle in 3D space
      circle.position.set(x, y, -1);

      sceneRef.current.add(circle);
    }
  };

  const handleStartSession = () => {
    if (!isPremium && sessionCount >= 10) {
      Alert.alert(
        "Premium Feature",
        "You've reached your free session limit. Upgrade to continue training.",
        [
          { text: "Cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate('Paywall') }
        ]
      );
      return;
    }

    startSession();
    setIsSessionActive(true);
    setHits(0);
    setTotalAttempts(0);
  };

  const handleEndSession = () => {
    endSession();
    setIsSessionActive(false);
  };

  const onGLContextCreate = async (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x666666;

    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(sceneColor);

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Create a scene
    const scene = new THREE.Scene();

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
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
          onContextCreate={onGLContextCreate}
        />

        {!isSessionActive ? (
          <TouchableOpacity
            style={styles.placeTargetButton}
            onPress={handlePlaceTarget}
          >
            <Text style={styles.buttonText}>Tap to Place Target</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.controls}>
          {!isSessionActive ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSession}
            >
              <Text style={styles.buttonText}>Start Session</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.statsText}>
                Accuracy: {calculateAccuracy(hits, totalAttempts)}%
              </Text>
              <Text style={styles.statsText}>Hits: {hits}</Text>
              <Text style={styles.statsText}>Attempts: {totalAttempts}</Text>
              <TouchableOpacity
                style={styles.endButton}
                onPress={handleEndSession}
              >
                <Text style={styles.buttonText}>End Session</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Camera>
    </View>
  );
}

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
  placeTargetButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  endButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statsText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 5,
  },
});
