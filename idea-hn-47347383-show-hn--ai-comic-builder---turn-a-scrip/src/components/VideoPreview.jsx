import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, ImageBackground, Image } from 'react-native';
// Removed Ionicons import as we are now using Image components

// --- Helper to get position styles for Image components ---
const getPositionStyles = (positionKey) => {
  const baseSize = 120; // Base size for character image
  const offset = -baseSize / 2; // To center the image if using transform

  // Using absolute positioning for characters
  const styles = {
    position: 'absolute',
    width: baseSize,
    height: baseSize,
    // Default to bottom-center if positionKey is not recognized
    bottom: 20,
    left: '50%',
    transform: [{ translateX: offset }],
  };

  switch (positionKey) {
    case 'top-left': return { ...styles, top: 20, left: 20, bottom: 'auto', transform: [] };
    case 'top-center': return { ...styles, top: 20, left: '50%', bottom: 'auto', transform: [{ translateX: offset }] };
    case 'top-right': return { ...styles, top: 20, right: 20, left: 'auto', bottom: 'auto', transform: [] };
    case 'center-left': return { ...styles, top: '50%', left: 20, bottom: 'auto', transform: [{ translateY: offset }] };
    case 'center': return { ...styles, top: '50%', left: '50%', bottom: 'auto', transform: [{ translateX: offset }, { translateY: offset }] };
    case 'center-right': return { ...styles, top: '50%', right: 20, left: 'auto', bottom: 'auto', transform: [{ translateY: offset }] };
    case 'bottom-left': return { ...styles, bottom: 20, left: 20, transform: [] };
    case 'bottom-center': return { ...styles, bottom: 20, left: '50%', transform: [{ translateX: offset }] };
    case 'bottom-right': return { ...styles, bottom: 20, right: 20, left: 'auto', transform: [] };
    default: return styles; // Default to bottom-center
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
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sceneWrapper, { opacity: fadeAnim }]}>
        <ImageBackground
          source={{ uri: currentScene.backgroundImageUrl }}
          style={styles.imageBackground}
          resizeMode="cover" // Ensure the background image covers the area
        >
          {/* Scene description text overlay */}
          <View style={styles.descriptionOverlay}>
            <Text style={styles.descriptionText}>{currentScene.description}</Text>
          </View>

          {/* Render characters */}
          {currentScene.characters && currentScene.characters.map((char, charIndex) => (
            <Image
              key={charIndex}
              source={{ uri: char.imageUrl }}
              style={getPositionStyles(char.position)}
              resizeMode="contain" // Ensure character images fit within their bounds
            />
          ))}

          {/* Visual elements are not rendered in this task, but data exists */}
          {/* If you wanted to render visual elements, you'd add similar Image components here */}
        </ImageBackground>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
        <Text style={styles.playPauseText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>

      {/* Scene Index and Total */}
      <Text style={styles.sceneCounter}>
        Scene {currentSceneIndex + 1} / {scenes.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for the whole preview area
  },
  sceneWrapper: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end', // Align description to bottom
    alignItems: 'center',
    position: 'relative', // For absolute positioning of characters
  },
  descriptionOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  descriptionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  // characterImage styles are handled by getPositionStyles, no need for a base style here
  // visualElementIcon: { // Removed as visual elements are not rendered with Ionicons
  //   position: 'absolute',
  // },
  noScenesText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: '#333',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF', // Blue progress bar
  },
  playPauseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  playPauseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sceneCounter: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default VideoPreview;
