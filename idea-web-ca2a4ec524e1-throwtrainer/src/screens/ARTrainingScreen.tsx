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
  const [targets, setTargets] = useState<Array<{ x: number; y: number; z: number; id: string }>>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { startSession, endSession, logAttempt } = useSessionStore();
  const { isPremium, sessionCount } = useUserStore();
  const glViewRef = useRef<GLView>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);

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

    // Calculate throw direction vector
    const direction = new THREE.Vector3(throwData.x, throwData.y, -1).normalize();

    // Create ray for collision detection
    const raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(0, 0, 0), direction);

    // Check for intersections with targets
    const intersects = raycaster.intersectObjects(
      targets.map(target => {
        const geometry = new THREE.CircleGeometry(0.1, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(target.x, target.y, target.z);
        return mesh;
      })
    );

    const hitTarget = intersects.length > 0;

    if (hitTarget) {
      setHits(prev => prev + 1);
      logAttempt({ success: true, speed: throwData.speed, angle: throwData.angle, x: throwData.x, y: throwData.y });
      showFeedback(true, intersects[0].point);
    } else {
      logAttempt({ success: false, speed: throwData.speed, angle: throwData.angle, x: throwData.x, y: throwData.y });
      showFeedback(false, new THREE.Vector3(throwData.x, throwData.y, -1));
    }

    // Visualize trajectory
    visualizeTrajectory(throwData);
  };

  const visualizeTrajectory = (throwData: ThrowData) => {
    if (!sceneRef.current) return;

    // Remove previous trajectory
    if (trajectoryLineRef.current) {
      sceneRef.current.remove(trajectoryLineRef.current);
    }

    // Create trajectory line
    const points = [];
    const startPoint = new THREE.Vector3(0, 0, 0);
    const endPoint = new THREE.Vector3(throwData.x, throwData.y, -1);

    points.push(startPoint);
    points.push(endPoint);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
    const line = new THREE.Line(geometry, material);

    sceneRef.current.add(line);
    trajectoryLineRef.current = line;

    // Remove after 2 seconds
    setTimeout(() => {
      if (sceneRef.current && trajectoryLineRef.current) {
        sceneRef.current.remove(trajectoryLineRef.current);
        trajectoryLineRef.current = null;
      }
    }, 2000);
  };

  const showFeedback = (isHit: boolean, position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    // Create feedback sphere
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: isHit ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.copy(position);
    sceneRef.current.add(sphere);

    // Remove after animation
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.remove(sphere);
      }
    }, 1000);
  };

  const handlePlaceTarget = (event: any) => {
    if (!glViewRef.current || !sceneRef.current) return;

    // Get normalized device coordinates (-1 to +1)
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = glViewRef.current;

    const x = (locationX / width) * 2 - 1;
    const y = -(locationY / height) * 2 + 1;

    const newTarget = { x, y, z: -1, id: Date.now().toString() };
    setTargets(prev => [...prev, newTarget]);

    // Add visual target to the 3D scene
    const geometry = new THREE.CircleGeometry(0.1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const circle = new THREE.Mesh(geometry, material);

    circle.position.set(x, y, -1);
    sceneRef.current.add(circle);
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

    // Create a Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create a light
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    // Save renderer for later use
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
      <Camera style={styles.camera} type="back">
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
        <TouchableOpacity
          style={styles.targetButton}
          onPress={handlePlaceTarget}
        >
          <Text style={styles.buttonText}>Place Target</Text>
        </TouchableOpacity>
        {!isSessionActive ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
          >
            <Text style={styles.buttonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sessionControls}>
            <Text style={styles.statsText}>
              Hits: {hits} / {totalAttempts} ({calculateAccuracy(hits, totalAttempts)}%)
            </Text>
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndSession}
            >
              <Text style={styles.buttonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        )}
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
  targetButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  startButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  endButton: {
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  sessionControls: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  statsText: {
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
});
