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
import * as ScreenOrientation from 'expo-screen-orientation';
import * as DeviceMotion from 'expo-sensors';

const { width, height } = Dimensions.get('window');

const ARTargetPractice = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const cameraRef = useRef(null);
  const glViewRef = useRef(null);
  const arEngineRef = useRef(new AREngine());
  const { isPremium } = useStore();
  const motionSubscription = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Lock to portrait for better AR experience
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    })();

    return () => {
      arEngineRef.current.cleanup();
      if (motionSubscription.current) {
        motionSubscription.current.remove();
      }
      ScreenOrientation.unlockAsync();
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

  useEffect(() => {
    // Subscribe to device motion
    motionSubscription.current = DeviceMotion.addListener((data) => {
      setDeviceOrientation({
        alpha: data.rotation.alpha,
        beta: data.rotation.beta,
        gamma: data.rotation.gamma
      });
    });

    return () => {
      if (motionSubscription.current) {
        motionSubscription.current.remove();
      }
    };
  }, []);

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

    // Spawn new targets at random positions in 3D space
    const targetCount = 5;
    const targets = [];

    for (let i = 0; i < targetCount; i++) {
      // Random position in front of the camera
      const x = (Math.random() - 0.5) * 2; // -1 to 1
      const y = (Math.random() - 0.5) * 2; // -1 to 1
      const z = -2 - Math.random() * 2; // -2 to -4 (closer to camera)

      targets.push({
        x,
        y,
        z,
        radius: 0.1 + Math.random() * 0.1 // Random size
      });
    }

    // Add targets to AR engine
    targets.forEach(target => {
      arEngineRef.current.addTarget(target);
    });
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
      const newTarget = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: -2 - Math.random() * 2,
        radius: 0.1 + Math.random() * 0.1
      };
      arEngineRef.current.addTarget(newTarget);
    } else {
      // Missed
      setMisses(prev => prev + 1);
    }
  };

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    arEngineRef.current.initialize(gl);

    // Animation loop
    const animate = () => {
      if (glViewRef.current) {
        glViewRef.current.requestAnimationFrame(animate);
        arEngineRef.current.render();
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
          onContextCreate={onContextCreate}
        />

        <ARTargetOverlay
          hits={hits}
          misses={misses}
          timeLeft={timeLeft}
          score={score}
        />

        {!gameActive && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
            >
              <Text style={styles.startButtonText}>Start Practice</Text>
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
  buttonContainer: {
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
