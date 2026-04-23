import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useSessionStore } from '../store/useSessionStore';
import { useUserStore } from '../store/useUserStore';
import { ThrowData, calculateAccuracy, screenToWorldCoordinates, calculatePhysicsBasedTrajectory, checkCollisionWithTarget } from '../utils/calculations';
import { motionAnalyzer } from '../services/motionAnalyzer';
import { ARTargetOverlay } from '../components/ARTargetOverlay';
import { SessionTimer } from '../components/SessionTimer';
import { Audio } from 'expo-av';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export default function ARTrainingScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [targets, setTargets] = useState<Array<{ position: THREE.Vector3; radius: number; id: string }>>([]);
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
  const lastThrowTimeRef = useRef<number>(0);

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
      // Debounce rapid throws
      const now = Date.now();
      if (now - lastThrowTimeRef.current < 500) return;
      lastThrowTimeRef.current = now;

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
    if (!isSessionActive || targets.length === 0 || !cameraRef.current) return;

    setTotalAttempts(prev => prev + 1);

    // Calculate physics-based trajectory
    const physicsThrowData = calculatePhysicsBasedTrajectory(throwData);

    // Create trajectory points
    const startPoint = new THREE.Vector3(0, 0, 0);
    const endPoint = new THREE.Vector3(
      physicsThrowData.x,
      physicsThrowData.y,
      physicsThrowData.z
    );

    const trajectoryPoints = [];
    const gravity = 9.8;
    const timeOfFlight = (2 * physicsThrowData.speed * Math.sin(physicsThrowData.angle * Math.PI / 180)) / gravity;

    for (let t = 0; t <= timeOfFlight; t += 0.1) {
      const x = startPoint.x + (endPoint.x - startPoint.x) * (t / timeOfFlight);
      const y = startPoint.y + (endPoint.y - startPoint.y) * (t / timeOfFlight);
      const z = startPoint.z + (endPoint.z - startPoint.z) * (t / timeOfFlight);

      // Parabolic height
      const height = physicsThrowData.speed * Math.sin(physicsThrowData.angle * Math.PI / 180) * t - 0.5 * gravity * t * t;

      trajectoryPoints.push(new THREE.Vector3(x, y + height, z));
    }

    // Check for collisions with targets
    let hitTarget = false;
    let hitPosition = new THREE.Vector3();

    for (const target of targets) {
      if (checkCollisionWithTarget(trajectoryPoints, target.position, target.radius)) {
        hitTarget = true;
        hitPosition = target.position;
        break;
      }
    }

    if (hitTarget) {
      setHits(prev => prev + 1);
      logAttempt({
        success: true,
        speed: physicsThrowData.speed,
        angle: physicsThrowData.angle,
        x: physicsThrowData.x,
        y: physicsThrowData.y,
        z: physicsThrowData.z
      });
      showFeedback(true, hitPosition);
      hitSoundRef.current?.replayAsync();
    } else {
      logAttempt({
        success: false,
        speed: physicsThrowData.speed,
        angle: physicsThrowData.angle,
        x: physicsThrowData.x,
        y: physicsThrowData.y,
        z: physicsThrowData.z
      });
      showFeedback(false, endPoint);
      missSoundRef.current?.replayAsync();
    }

    // Visualize trajectory
    visualizeTrajectory(trajectoryPoints);
  };

  const visualizeTrajectory = (points: THREE.Vector3[]) => {
    if (!sceneRef.current || !cameraRef.current) return;

    // Remove previous trajectory
    if (trajectoryLineRef.current) {
      sceneRef.current.remove(trajectoryLineRef.current);
    }

    // Create geometry from points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

    // Create line
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    trajectoryLineRef.current = line;

    // Fade out after 2 seconds
    setTimeout(() => {
      if (sceneRef.current && trajectoryLineRef.current) {
        sceneRef.current.remove(trajectoryLineRef.current);
        trajectoryLineRef.current = null;
      }
    }, 2000);
  };

  const showFeedback = (isHit: boolean, position: THREE.Vector3) => {
    if (!sceneRef.current || !cameraRef.current) return;

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

    // Animate feedback
    const animateFeedback = () => {
      sphere.scale.x += 0.05;
      sphere.scale.y += 0.05;
      sphere.scale.z += 0.05;
      sphere.material.opacity -= 0.02;

      if (sphere.material.opacity <= 0) {
        sceneRef.current?.remove(sphere);
      } else {
        requestAnimationFrame(animateFeedback);
      }
    };

    animateFeedback();
  };

  const handlePlaceTarget = (event: any) => {
    if (!cameraRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const worldPosition = screenToWorldCoordinates(
      locationX,
      locationY,
      cameraRef.current,
      viewportWidth,
      viewportHeight
    );

    // Create target
    const targetId = Date.now().toString();
    const targetRadius = 0.3;

    // Add to state
    setTargets(prev => [...prev, {
      position: worldPosition,
      radius: targetRadius,
      id: targetId
    }]);

    // Create 3D target mesh
    const geometry = new THREE.CircleGeometry(targetRadius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });

    const targetMesh = new THREE.Mesh(geometry, material);
    targetMesh.position.copy(worldPosition);
    targetMesh.rotation.x = -Math.PI / 2; // Rotate to face camera

    targetGroupRef.current.add(targetMesh);
    targetMeshesRef.current.push(targetMesh);
  };

  const startTrainingSession = () => {
    if (!isPremium && sessionCount >= 10) {
      navigation.navigate('Paywall');
      return;
    }

    startSession();
    setIsSessionActive(true);
    setHits(0);
    setTotalAttempts(0);
    motionAnalyzer.calibrate();
  };

  const endTrainingSession = () => {
    endSession();
    setIsSessionActive(false);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back}>
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={initializeScene}
        />

        <TouchableOpacity
          style={styles.placeTargetButton}
          onPress={handlePlaceTarget}
        >
          <Text style={styles.buttonText}>Place Target</Text>
        </TouchableOpacity>

        {isSessionActive ? (
          <SessionTimer
            hits={hits}
            totalAttempts={totalAttempts}
            onEndSession={endTrainingSession}
          />
        ) : (
          <TouchableOpacity
            style={styles.startSessionButton}
            onPress={startTrainingSession}
          >
            <Text style={styles.buttonText}>Start Training</Text>
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
  glView: {
    flex: 1,
  },
  placeTargetButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
