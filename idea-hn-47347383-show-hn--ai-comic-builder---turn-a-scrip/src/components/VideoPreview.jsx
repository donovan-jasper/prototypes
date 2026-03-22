import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Expo vector icons for characters/elements

// --- Constants for styling and mapping ---
const BACKGROUND_COLORS = {
  forest: '#228B22', // Forest Green
  beach: '#ADD8E6',  // Light Blue
  city: '#696969',   // Dim Gray
  space: '#191970',  // Midnight Blue
  house: '#A0522D',  // Sienna
  mountain: '#708090', // Slate Gray
  desert: '#F4A460', // Sandy Brown
  default: '#D3D3D3', // Light Gray
};

const CHARACTER_ICONS = {
  cat: 'ios-paw',
  dog: 'ios-happy',
  person: 'ios-person',
  bird: 'ios-leaf', // Using leaf as a placeholder for bird
  robot: 'ios-hardware-chip',
  // Add more as needed
};

const VISUAL_ELEMENT_ICONS = {
  trees: 'ios-tree',
  stream: 'ios-water',
  ocean: 'ios-boat',
  sand: 'ios-sunny',
  buildings: 'ios-business',
  cars: 'ios-car',
  stars: 'ios-star',
  planets: 'ios-planet',
  furniture: 'ios-cube',
  peaks: 'ios-triangle',
  snow: 'ios-snow',
  'sand dunes': 'ios-apps', // Placeholder
  cactus: 'ios-flower',
  // Add more as needed
};

// Helper to get position styles
const getPositionStyles = (positionKey) => {
  const baseSize = 60; // Base size for character/element icons
  const offset = -baseSize / 2; // To center the icon if using transform

  switch (positionKey) {
    case 'top-left': return { top: 20, left: 20 };
    case 'top-center': return { top: 20, left: '50%', transform: [{ translateX: offset }] };
    case 'top-right': return { top: 20, right: 20 };
    case 'center': return { top: '50%', left: '50%', transform: [{ translateX: offset }, { translateY: offset }] };
    case 'bottom-left': return { bottom: 20, left: 20 };
    case 'bottom-center': return { bottom: 20, left: '50%', transform: [{ translateX: offset }] };
    case 'bottom-right': return { bottom: 20, right: 20 };
    default: return { top: 'auto', left: 'auto' }; // Default or no specific position
  }
};

const VideoPreview = ({ scenes }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // For scene fade in/out
  const progressBarAnim = useRef(new Animated.Value(0)).current; // For scene duration progress

  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    if (!currentScene || !isPlaying) {
      // If no scenes or not playing, reset progress bar and stop animations
      progressBarAnim.setValue(0);
      fadeAnim.setValue(1); // Ensure current scene is visible if not playing
      return;
    }

    let sceneTimeout;
    let progressAnimation;

    const startScene = () => {
      // Reset progress bar and fade in
      progressBarAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, // Fade in duration
        useNativeDriver: true,
      }).start(() => {
        // Start progress bar animation after fade in
        progressAnimation = Animated.timing(progressBarAnim, {
          toValue: 1,
          duration: currentScene.duration * 1000,
          easing: Easing.linear,
          useNativeDriver: false, // width animation cannot use native driver
        });
        progressAnimation.start();

        // Set timeout for next scene
        sceneTimeout = setTimeout(() => {
          if (currentSceneIndex < scenes.length - 1) {
            // Fade out current scene before changing
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500, // Fade out duration
              useNativeDriver: true,
            }).start(() => {
              setCurrentSceneIndex((prevIndex) => prevIndex + 1);
            });
          } else {
            // End of scenes, stop playing
            setIsPlaying(false);
            setCurrentSceneIndex(0); // Loop back to start or stay on last scene
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); // Fade in last scene
          }
        }, currentScene.duration * 1000);
      });
    };

    startScene();

    return () => {
      clearTimeout(sceneTimeout);
      if (progressAnimation) {
        progressAnimation.stop();
      }
      fadeAnim.stop();
    };
  }, [currentSceneIndex, scenes, isPlaying, currentScene]); // Depend on currentScene to re-run when its properties change

  if (!currentScene) {
    return (
      <View style={styles.container}>
        <Text style={styles.noScenesText}>No scenes to display. Please generate a script.</Text>
      </View>
    );
  }

  const progressBarWidth = progressBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handlePlayPause = () => {
    if (!isPlaying && currentSceneIndex === scenes.length - 1) {
      // If at the end and pressing play, restart from beginning
      setCurrentSceneIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setIsPlaying(false); // Pause when manually navigating
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setIsPlaying(false); // Pause when manually navigating
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sceneView,
          { backgroundColor: BACKGROUND_COLORS[currentScene.backgroundColor] || BACKGROUND_COLORS.default },
          { opacity: fadeAnim },
        ]}
      >
        <Text style={styles.sceneDescription}>{currentScene.description}</Text>

        {currentScene.characters && currentScene.characters.map((char, index) => {
          const iconName = CHARACTER_ICONS[char.name.toLowerCase()] || 'ios-help-circle';
          const positionStyles = getPositionStyles(char.position);
          return (
            <Ionicons
              key={`char-${index}`}
              name={iconName}
              size={60}
              color="white"
              style={[styles.icon, positionStyles]}
            />
          );
        })}

        {currentScene.visualElements && currentScene.visualElements.map((element, index) => {
          const iconName = VISUAL_ELEMENT_ICONS[element.name.toLowerCase()] || 'ios-help-circle-outline';
          const positionStyles = getPositionStyles(element.position);
          return (
            <Ionicons
              key={`element-${index}`}
              name={iconName}
              size={60}
              color="white"
              style={[styles.icon, positionStyles]}
            />
          );
        })}

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrevScene} style={styles.controlButton}>
          <Ionicons name="ios-play-back" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
          <Ionicons name={isPlaying ? 'ios-pause' : 'ios-play'} size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextScene} style={styles.controlButton}>
          <Ionicons name="ios-play-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneView: {
    width: '90%',
    aspectRatio: 16 / 9, // Common video aspect ratio
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sceneDescription: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 10, // Ensure description is above icons if they overlap
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  icon: {
    position: 'absolute',
    zIndex: 5, // Icons below description
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF', // Expo blue
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
  },
  controlButton: {
    padding: 10,
  },
  noScenesText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default VideoPreview;
