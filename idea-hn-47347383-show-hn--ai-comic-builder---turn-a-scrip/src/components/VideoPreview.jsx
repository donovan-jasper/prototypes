import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, ImageBackground, Image } from 'react-native';

const getPositionStyles = (positionKey) => {
  const baseSize = 120; 
  const offset = -baseSize / 2; 

  const styles = {
    position: 'absolute',
    width: baseSize,
    height: baseSize,
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
    default: return styles; 
  }
};

const VideoPreview = ({ scenes }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; 
  const progressBarAnim = useRef(new Animated.Value(0)).current; 

  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    if (!currentScene || !isPlaying) {
      progressBarAnim.setValue(0);
      fadeAnim.setValue(1); 
      return;
    }

    let sceneTimeout;
    let progressAnimation;

    const startScene = () => {
      progressBarAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, 
        useNativeDriver: true,
      }).start(() => {
        progressAnimation = Animated.timing(progressBarAnim, {
          toValue: 1,
          duration: currentScene.duration * 1000,
          easing: Easing.linear,
          useNativeDriver: false, 
        });
        progressAnimation.start();

        sceneTimeout = setTimeout(() => {
          if (currentSceneIndex < scenes.length - 1) {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500, 
              useNativeDriver: true,
            }).start(() => {
              setCurrentSceneIndex((prevIndex) => prevIndex + 1);
            });
          } else {
            setIsPlaying(false);
            setCurrentSceneIndex(0); 
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); 
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
  }, [currentSceneIndex, scenes, isPlaying, currentScene]); 

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
      setCurrentSceneIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const getBackgroundStyle = () => {
    switch (currentScene.background) {
      case 'forest':
        return { backgroundColor: 'green' };
      case 'beach':
        return { backgroundColor: 'blue' };
      case 'city':
        return { backgroundColor: 'gray' };
      default:
        return { backgroundColor: 'white' };
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sceneWrapper, { opacity: fadeAnim }]}>
        <ImageBackground source={require('../assets/backgrounds/forest.jpg')} style={[styles.background, getBackgroundStyle()]}>
          {currentScene.characters.map((character, index) => (
            <Image key={index} source={require('../assets/characters/person.png')} style={[styles.character, getPositionStyles(character.position)]} />
          ))}
          <Text style={styles.sceneDescription}>{currentScene.description}</Text>
          <Text style={styles.sceneDuration}>{currentScene.duration} seconds</Text>
        </ImageBackground>
      </Animated.View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: progressBarWidth }]} />
      </View>
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
        {isPlaying ? (
          <Text style={styles.playButtonText}>Pause</Text>
        ) : (
          <Text style={styles.playButtonText}>Play</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneWrapper: {
    width: '100%',
    height: '80%',
  },
  background: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  character: {
    resizeMode: 'contain',
  },
  sceneDescription: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 18,
    color: 'white',
  },
  sceneDuration: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 18,
    color: 'white',
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'gray',
  },
  progressBar: {
    height: 20,
    backgroundColor: 'blue',
  },
  playButton: {
    width: 100,
    height: 50,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  playButtonText: {
    fontSize: 18,
    color: 'white',
  },
  noScenesText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default VideoPreview;
