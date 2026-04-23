import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useSessionStore } from '../store/useSessionStore';
import { useUserStore } from '../store/useUserStore';
import { ThrowData, calculateAccuracy, screenToWorldCoordinates } from '../utils/calculations';
import { motionAnalyzer } from '../services/motionAnalyzer';
import { ARTargetOverlay } from '../components/ARTargetOverlay';
import { SessionTimer } from '../components/SessionTimer';
import { Audio } from 'expo-av';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

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
  const targetMeshesRef = useRef<Array<THREE.Mesh>>([]);
  const targetGroupRef = useRef<THREE.Group>(new THREE.Group());
  const hitSoundRef = useRef<Audio.Sound | null>(null);
  const missSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Load sound effects
      const hitSound = new Audio.Sound();
      await hitSound.loadAsync(require('../../assets/sounds/hit.mp3'));
      hitSoundRef.current = hitSound;

      const missSound = new Audio.Sound();
      await missSound.loadAsync(require('../../assets/sounds/miss.mp3'));
      missSoundRef.current = missSound;
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
      hitSoundRef.current?.unloadAsync();
      missSoundRef.current?.unloadAsync();
    };
  }, []);

  const initializeScene = (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Add target group to scene
    scene.add(targetGroupRef.current);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  };

  const handleThrowDetected = (throwData: ThrowData) => {
    if (!isSessionActive || targets.length === 0) return;

    setTotalAttempts(prev => prev + 1);

    // Calculate throw direction vector
    const direction = new THREE.Vector3(throwData.x, throwData.y, -1).normalize();

    // Create ray for collision detection
    const raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(0, 0, 0), direction);

    // Check for intersections with targets
    const intersects = raycaster.intersectObjects(targetMeshesRef.current);

    const hitTarget = intersects.length > 0;

    if (hitTarget) {
      setHits(prev => prev + 1);
      logAttempt({ success: true, speed: throwData.speed, angle: throwData.angle, x: throwData.x, y: throwData.y });
      showFeedback(true, intersects[0].point);
      hitSoundRef.current?.replayAsync();
    } else {
      logAttempt({ success: false, speed: throwData.speed, angle: throwData.angle, x: throwData.x, y: throwData.y });
      showFeedback(false, new THREE.Vector3(throwData.x, throwData.y, -1));
      missSoundRef.current?.replayAsync();
    }

    // Visualize trajectory
    visualizeTrajectory(throwData);
  };

  const visualizeTrajectory = (throwData: ThrowData) => {
    if (!sceneRef.current || !cameraRef.current) return;

    // Remove previous trajectory
    if (trajectoryLineRef.current) {
      sceneRef.current.remove(trajectoryLineRef.current);
    }

    // Create trajectory line with physics-based arc
    const points = [];
    const startPoint = new THREE.Vector3(0, 0, 0);

    // Calculate end point based on throw data
    const endX = throwData.x * 5; // Scale for better visualization
    const endY = throwData.y * 5;
    const endZ = -5; // Fixed distance for visualization

    // Create parabolic arc
    for (let t = 0; t <= 1; t += 0.05) {
      const x = startPoint.x + (endX - startPoint.x) * t;
      const y = startPoint.y + (endY - startPoint.y) * t;
      const z = startPoint.z + (endZ - startPoint.z) * t;

      // Add parabolic curve
      const height = Math.sin(t * Math.PI) * 2;
      points.push(new THREE.Vector3(x, y + height, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const line = new THREE.Line(geometry, material);

    sceneRef.current.add(line);
    trajectoryLineRef.current = line;

    // Fade out the line after 2 seconds
    setTimeout(() => {
      if (sceneRef.current && line) {
        sceneRef.current.remove(line);
      }
    }, 2000);
  };

  const showFeedback = (hit: boolean, position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    const feedbackGeometry = new THREE.CircleGeometry(0.3, 32);
    const feedbackMaterial = new THREE.MeshBasicMaterial({
      color: hit ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    const feedback = new THREE.Mesh(feedbackGeometry, feedbackMaterial);
    feedback.position.copy(position);

    sceneRef.current.add(feedback);

    // Animate feedback
    let scale = 0.1;
    const animateFeedback = () => {
      scale += 0.05;
      feedback.scale.set(scale, scale, scale);
      feedback.material.opacity -= 0.05;

      if (feedback.material.opacity <= 0) {
        sceneRef.current?.remove(feedback);
      } else {
        requestAnimationFrame(animateFeedback);
      }
    };

    animateFeedback();
  };

  const handlePlaceTarget = (event: any) => {
    if (!isSessionActive) return;

    const { locationX, locationY } = event.nativeEvent;
    const { x, y } = screenToWorldCoordinates(locationX, locationY, viewportWidth, viewportHeight);

    const newTarget = {
      x,
      y,
      z: -3, // Fixed distance from camera
      id: Date.now().toString()
    };

    setTargets(prev => [...prev, newTarget]);

    // Create and add target mesh to scene
    if (sceneRef.current) {
      const targetMesh = createTargetMesh(newTarget);
      targetMeshesRef.current.push(targetMesh);
      targetGroupRef.current.add(targetMesh);
    }
  };

  const createTargetMesh = (target: { x: number; y: number; z: number }): THREE.Mesh => {
    // Create target ring
    const ringGeometry = new THREE.RingGeometry(0.5, 0.6, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Create center dot
    const dotGeometry = new THREE.CircleGeometry(0.1, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

    // Combine into a group
    const targetGroup = new THREE.Group();
    targetGroup.add(ring);
    targetGroup.add(dot);
    targetGroup.position.set(target.x, target.y, target.z);

    return targetGroup;
  };

  const startSession = () => {
    setIsSessionActive(true);
    setHits(0);
    setTotalAttempts(0);
    startSession();
  };

  const endCurrentSession = () => {
    setIsSessionActive(false);
    endSession();
    setTargets([]);
    targetMeshesRef.current.forEach(mesh => targetGroupRef.current.remove(mesh));
    targetMeshesRef.current = [];
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onTouchEnd={handlePlaceTarget}
      >
        <GLView
          ref={glViewRef}
          style={StyleSheet.absoluteFill}
          onContextCreate={initializeScene}
        />

        {isSessionActive && (
          <View style={styles.overlay}>
            <SessionTimer
              hits={hits}
              totalAttempts={totalAttempts}
              onEndSession={endCurrentSession}
            />
            <Text style={styles.accuracyText}>
              Accuracy: {calculateAccuracy(hits, totalAttempts)}%
            </Text>
          </View>
        )}

        {!isSessionActive && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startSession}
          >
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
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
  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  accuracyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  startButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
