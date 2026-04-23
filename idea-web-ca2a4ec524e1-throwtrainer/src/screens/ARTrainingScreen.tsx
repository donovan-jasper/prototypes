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
  const targetMeshesRef = useRef<Array<THREE.Mesh>>([]);

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
    if (!sceneRef.current) return;

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

    // Remove after animation
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
      const geometry = new THREE.SphereGeometry(0.03, 8, 8);
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
        velocity: direction.multiplyScalar(Math.random() * 0.2 + 0.1),
        lifetime: 2.0
      };

      particles.add(particle);
    }

    sceneRef.current.add(particles);

    // Animate particles
    const animateParticles = () => {
      const now = Date.now();
      let particlesToRemove = 0;

      particles.children.forEach((particle: THREE.Mesh) => {
        const velocity = particle.userData.velocity;
        const lifetime = particle.userData.lifetime;

        particle.position.add(velocity);
        particle.userData.lifetime -= 0.016; // ~60fps

        if (particle.userData.lifetime <= 0) {
          particlesToRemove++;
        }
      });

      if (particlesToRemove > 0) {
        for (let i = 0; i < particlesToRemove; i++) {
          particles.remove(particles.children[0]);
        }
      }

      if (particles.children.length === 0) {
        sceneRef.current?.remove(particles);
        return;
      }

      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  };

  const handlePlaceTarget = (event: any) => {
    if (!glViewRef.current || !sceneRef.current || !cameraRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = glViewRef.current;

    // Convert screen coordinates to world coordinates
    const worldPos = screenToWorldCoordinates(
      locationX,
      locationY,
      cameraRef.current,
      width,
      height
    );

    // Create target mesh
    const geometry = new THREE.CircleGeometry(0.2, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const targetMesh = new THREE.Mesh(geometry, material);

    targetMesh.position.set(worldPos.x, worldPos.y, worldPos.z);
    targetMesh.rotation.x = -Math.PI / 2; // Make it face the camera

    sceneRef.current.add(targetMesh);
    targetMeshesRef.current.push(targetMesh);

    setTargets(prev => [...prev, {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
      id: Date.now().toString()
    }]);
  };

  const screenToWorldCoordinates = (
    screenX: number,
    screenY: number,
    camera: THREE.PerspectiveCamera,
    viewportWidth: number,
    viewportHeight: number
  ): THREE.Vector3 => {
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const x = (screenX / viewportWidth) * 2 - 1;
    const y = -(screenY / viewportHeight) * 2 + 1;

    // Create a vector in normalized device coordinates
    const vector = new THREE.Vector3(x, y, 0.5); // 0.5 is the near plane

    // Unproject the vector to world coordinates
    vector.unproject(camera);

    // Calculate direction vector
    const direction = vector.sub(camera.position).normalize();

    // Create a ray from camera position through the unprojected point
    const raycaster = new THREE.Raycaster(camera.position, direction);

    // For simplicity, we'll assume the target is on a plane at z=0
    // In a real app, you might want to use a more sophisticated intersection test
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();

    raycaster.ray.intersectPlane(plane, intersection);

    return intersection;
  };

  const initializeScene = (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      // Cleanup
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  };

  const startSession = () => {
    if (targets.length === 0) {
      Alert.alert('No Targets', 'Please place at least one target before starting a session');
      return;
    }

    setIsSessionActive(true);
    startSession();
    setHits(0);
    setTotalAttempts(0);
  };

  const endCurrentSession = () => {
    setIsSessionActive(false);
    endSession();
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
          onTouchStart={handlePlaceTarget}
        />
      </Camera>

      <View style={styles.overlay}>
        <Text style={styles.statsText}>
          Accuracy: {calculateAccuracy(hits, totalAttempts)}% | Attempts: {totalAttempts}
        </Text>

        {!isSessionActive ? (
          <TouchableOpacity style={styles.button} onPress={startSession}>
            <Text style={styles.buttonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={endCurrentSession}>
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.clearButton} onPress={() => {
          setTargets([]);
          if (sceneRef.current) {
            targetMeshesRef.current.forEach(mesh => sceneRef.current?.remove(mesh));
            targetMeshesRef.current = [];
          }
        }}>
          <Text style={styles.clearButtonText}>Clear Targets</Text>
        </TouchableOpacity>
      </View>
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
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statsText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
