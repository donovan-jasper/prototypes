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

  const handlePrevScene = () => {
    setIsPlaying(false); // Pause when manually navigating
    setCurrentSceneIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNextScene = () => {
    setIsPlaying(false); // Pause when manually navigating
    setCurrentSceneIndex((prevIndex) => Math.min(scenes.length - 1, prevIndex + 1));
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sceneContainer,
          { backgroundColor: BACKGROUND_COLORS[currentScene.background] || BACKGROUND_COLORS.default },
          { opacity: fadeAnim },
        ]}
      >
        <Text style={styles.sceneDescription}>{currentScene.description}</Text>

        {currentScene.characters.map((char, index) => (
          <View
            key={`char-${index}`}
            style={[styles.characterElementContainer, getPositionStyles(currentScene.position[char] || 'center')]}
          >
            <Ionicons name={CHARACTER_ICONS[char] || 'ios-person'} size={40} color="white" />
            <Text style={styles.characterElementText}>{char}</Text>
          </View>
        ))}

        {currentScene.visualElements.map((elem, index) => (
          <View
            key={`elem-${index}`}
            style={[styles.characterElementContainer, getPositionStyles(currentScene.position[elem] || 'center')]}
          >
            <Ionicons name={VISUAL_ELEMENT_ICONS[elem] || 'ios-cube'} size={40} color="white" />
            <Text style={styles.characterElementText}>{elem}</Text>
          </View>
        ))}

        <View style={styles.durationInfo}>
          <Text style={styles.durationText}>
            Scene {currentSceneIndex + 1}/{scenes.length} - {currentScene.duration}s
          </Text>
        </View>

        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrevScene} disabled={currentSceneIndex === 0} style={styles.controlButton}>
          <Ionicons name="ios-play-back" size={30} color={currentSceneIndex === 0 ? '#aaa' : 'white'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
          <Ionicons name={isPlaying ? 'ios-pause' : 'ios-play'} size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextScene} disabled={currentSceneIndex === scenes.length - 1} style={styles.controlButton}>
          <Ionicons name="ios-play-forward" size={30} color={currentSceneIndex === scenes.length - 1 ? '#aaa' : 'white'} />
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
    padding: 20,
  },
  noScenesText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  sceneContainer: {
    width: '100%',
    aspectRatio: 16 / 9, // Common video aspect ratio
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#555',
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  characterElementContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  characterElementText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  durationInfo: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00BFFF', // Deep Sky Blue
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  controlButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default VideoPreview;
