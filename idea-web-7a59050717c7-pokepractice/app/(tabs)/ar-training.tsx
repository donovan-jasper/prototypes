import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { savePerformance } from '../../lib/database';
import { calculateScore, getAccuracyRating } from '../../lib/scoring';
import { ARTargetOverlay } from '../../components/ARTargetOverlay';
import { AREngine } from '../../lib/ar-engine';

const { width, height } = Dimensions.get('window');

const ARTargetPractice = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const cameraRef = useRef(null);
  const glViewRef = useRef(null);
  const arEngineRef = useRef(new AREngine());
  const { isPremium } = useStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      arEngineRef.current.cleanup();
    };
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
    setScore({
      ...calculatedScore,
      rating: getAccuracyRating(calculatedScore.accuracy)
    });

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
    // Clear existing targets
    arEngineRef.current.cleanup();

    // Spawn new targets
    for (let i = 0; i < 5; i++) {
      arEngineRef.current.addTarget({
        x: (Math.random() * 2 - 1) * 0.5, // More centered
        y: (Math.random() * 2 - 1) * 0.5,
        z: -2
      });
    }
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
    raycaster.setFromCamera({ x, y }, arEngineRef.current.camera);

    // Check for intersections with targets
    const hitTarget = arEngineRef.current.checkIntersection(raycaster);

    if (hitTarget) {
      // Hit a target
      setHits(prev => prev + 1);
      arEngineRef.current.removeTarget(hitTarget);

      // Spawn a new target
      arEngineRef.current.addTarget({
        x: (Math.random() * 2 - 1) * 0.5,
        y: (Math.random() * 2 - 1) * 0.5,
        z: -2
      });
    } else {
      // Miss
      setMisses(prev => prev + 1);
    }
  };

  const initGL = async (gl) => {
    if (!gl) return;

    // Initialize AR engine
    arEngineRef.current.initialize(gl);

    // Animation loop
    const animate = () => {
      if (glViewRef.current) {
        requestAnimationFrame(animate);
        arEngineRef.current.render();
        gl.endFrameEXP();
      }
    };
    animate();
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
        style={StyleSheet.absoluteFill}
        type={Camera.Constants.Type.back}
        onTouchStart={handleTap}
      >
        <GLView
          ref={glViewRef}
          style={StyleSheet.absoluteFill}
          onContextCreate={initGL}
        />

        <ARTargetOverlay
          hits={hits}
          misses={misses}
          timeLeft={timeLeft}
          score={score}
        />

        {!gameActive && (
          <View style={styles.startButtonContainer}>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Start AR Training</Text>
            </TouchableOpacity>
          </View>
        )}
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ARTargetPractice;
