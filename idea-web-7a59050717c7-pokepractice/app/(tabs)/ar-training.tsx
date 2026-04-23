import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { savePerformance } from '../../lib/database';
import { calculateScore, getAccuracyRating } from '../../lib/scoring';

const ARTargetPractice = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [targets, setTargets] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const cameraRef = useRef(null);
  const glViewRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraThreeRef = useRef(null);
  const rendererRef = useRef(null);
  const targetMeshes = useRef([]);
  const { isPremium } = useStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const startGame = () => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "AR Target Practice requires a premium subscription.",
        [{ text: "OK" }]
      );
      return;
    }

    setGameActive(true);
    setHits(0);
    setMisses(0);
    setTimeLeft(30);
    setScore(null);
    spawnTargets();
  };

  const endGame = async () => {
    setGameActive(false);
    const total = hits + misses;
    const calculatedScore = calculateScore({ hits, total, timeMs: 30000 });
    setScore(calculatedScore);

    // Save to database
    await savePerformance({
      challengeId: 'ar-target-practice',
      score: calculatedScore.score,
      accuracy: calculatedScore.accuracy,
      timeMs: 30000,
      timestamp: Date.now()
    });
  };

  const spawnTargets = () => {
    const newTargets = [];
    for (let i = 0; i < 5; i++) {
      newTargets.push({
        id: Date.now() + i,
        x: Math.random() * 2 - 1, // -1 to 1 range
        y: Math.random() * 2 - 1,
        z: -2, // Fixed distance from camera
        radius: 0.1,
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
    }
    setTargets(newTargets);
  };

  const handleTap = (event) => {
    if (!gameActive || !cameraRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = cameraRef.current;

    // Convert screen coordinates to normalized device coordinates
    const x = (locationX / width) * 2 - 1;
    const y = -(locationY / height) * 2 + 1;

    // Create a ray from the camera through the tap point
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x, y }, cameraThreeRef.current);

    // Check for intersections with targets
    const intersects = raycaster.intersectObjects(targetMeshes.current);

    if (intersects.length > 0) {
      // Hit a target
      setHits(prev => prev + 1);
      // Remove the hit target
      const hitTarget = intersects[0].object;
      sceneRef.current.remove(hitTarget);
      targetMeshes.current = targetMeshes.current.filter(mesh => mesh !== hitTarget);

      // Spawn a new target
      const newTarget = {
        id: Date.now(),
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: -2,
        radius: 0.1,
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      };
      addTargetToScene(newTarget);
    } else {
      // Miss
      setMisses(prev => prev + 1);
    }
  };

  const initGL = async (gl) => {
    if (!gl) return;

    // Initialize Three.js renderer
    rendererRef.current = new Renderer({ gl });
    rendererRef.current.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create scene
    sceneRef.current = new THREE.Scene();

    // Create camera
    cameraThreeRef.current = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    cameraThreeRef.current.position.z = 0;

    // Add initial targets
    targets.forEach(target => addTargetToScene(target));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraThreeRef.current);
      gl.endFrameEXP();
    };
    animate();
  };

  const addTargetToScene = (target) => {
    const geometry = new THREE.SphereGeometry(target.radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: target.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(target.x, target.y, target.z);
    sceneRef.current.add(mesh);
    targetMeshes.current.push(mesh);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onTouchStart={handleTap}
      >
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={initGL}
        />
      </Camera>

      <View style={styles.overlay}>
        <Text style={styles.timer}>Time: {timeLeft}s</Text>
        <Text style={styles.score}>Hits: {hits} | Misses: {misses}</Text>

        {!gameActive && score && (
          <View style={styles.results}>
            <Text style={styles.resultTitle}>Game Over!</Text>
            <Text style={styles.resultScore}>Score: {score.score}</Text>
            <Text style={styles.resultAccuracy}>Accuracy: {score.accuracy}% ({getAccuracyRating(score.accuracy)})</Text>
          </View>
        )}

        {!gameActive && !score && (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start AR Training</Text>
          </TouchableOpacity>
        )}
      </View>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  score: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  results: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 20,
    color: 'white',
    marginBottom: 5,
  },
  resultAccuracy: {
    fontSize: 16,
    color: 'white',
  },
});

export default ARTargetPractice;
