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
    } else {
      logAttempt({ success: false, speed: throwData.speed, angle: throwData.angle, x: throwData.x, y: throwData.y });
      showFeedback(false, new THREE.Vector3(throwData.x, throwData.y, -1));
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
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: isHit ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.copy(position);
    sceneRef.current.add(sphere);

    // Add particle explosion for hits
    if (isHit) {
      createParticleExplosion(position);
    }

    // Remove after 1 second
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.remove(sphere);
      }
    }, 1000);
  };

  const createParticleExplosion = (position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    const particleCount = 50;
    const particles = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);

      // Random direction and speed
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

      particle.position.copy(position);
      particle.userData = {
        velocity: direction.multiplyScalar(Math.random() * 2 + 1),
        lifetime: 1.0
      };

      particles.add(particle);
    }

    sceneRef.current.add(particles);

    // Animate particles
    const animateParticles = () => {
      const deltaTime = 0.016; // ~60fps

      particles.children.forEach((particle: THREE.Mesh) => {
        if (particle.userData.lifetime <= 0) {
          sceneRef.current?.remove(particle);
          return;
        }

        // Update position
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(deltaTime));

        // Update lifetime
        particle.userData.lifetime -= deltaTime;

        // Fade out
        const opacity = particle.userData.lifetime;
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = opacity;
        }
      });

      // Remove particles group when empty
      if (particles.children.length === 0 && sceneRef.current) {
        sceneRef.current.remove(particles);
      } else {
        requestAnimationFrame(animateParticles);
      }
    };

    animateParticles();
  };

  const handlePlaceTarget = (event: any) => {
    if (!cameraRef.current || !sceneRef.current) return;

    const { locationX, locationY } = event.nativeEvent;

    // Convert screen coordinates to world coordinates
    const worldPosition = screenToWorldCoordinates(
      locationX,
      locationY,
      cameraRef.current,
      viewportWidth,
      viewportHeight
    );

    // Create new target
    const targetId = Date.now().toString();
    const newTarget = {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z,
      id: targetId
    };

    // Create 3D target mesh
    const targetMesh = createTargetMesh(worldPosition);
    targetMeshesRef.current.push(targetMesh);
    targetGroupRef.current.add(targetMesh);

    setTargets(prev => [...prev, newTarget]);
  };

  const createTargetMesh = (position: THREE.Vector3): THREE.Mesh => {
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
    targetGroup.position.copy(position);

    return targetGroup;
  };

  const handleStartSession = () => {
    if (targets.length === 0) {
      Alert.alert('No Targets', 'Please place at least one target before starting a session');
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

    // Show session summary
    const accuracy = calculateAccuracy(hits, totalAttempts);
    Alert.alert(
      'Session Complete',
      `Accuracy: ${accuracy}%\nHits: ${hits}\nTotal Attempts: ${totalAttempts}`,
      [{ text: 'OK' }]
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={StyleSheet.absoluteFill} type={Camera.Constants.Type.back}>
        <GLView
          ref={glViewRef}
          style={StyleSheet.absoluteFill}
          onContextCreate={initializeScene}
        />

        {!isSessionActive && (
          <TouchableOpacity
            style={styles.placeTargetButton}
            onPress={handlePlaceTarget}
          >
            <Text style={styles.buttonText}>Place Target</Text>
          </TouchableOpacity>
        )}

        {isSessionActive ? (
          <SessionTimer
            hits={hits}
            totalAttempts={totalAttempts}
            onEndSession={handleEndSession}
          />
        ) : (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSession}
              disabled={targets.length === 0}
            >
              <Text style={styles.buttonText}>Start Session</Text>
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
  placeTargetButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
